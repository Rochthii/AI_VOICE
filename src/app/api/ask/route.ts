import { NextRequest } from "next/server";
import { evaluateHistoricalGuardrail } from "@/lib/guardrails";
import { recordAuditLog } from "@/lib/supabase";
import { streamAIWithFailover, AIMessage } from "@/lib/ai-provider-manager";
import { buildCompactSystemPrompt, CU_CHI_FULL_KNOWLEDGE } from "@/lib/cu-chi-system-prompt";
import { searchHistoricalKnowledge } from "@/lib/rag-engine";
import { classifyQuery } from "@/lib/query-classifier";
import { semanticCache } from "@/lib/semantic-cache";
import {
  compressHistory,
  truncateToTokenBudget,
  assessTokenBudget,
  MAX_CONTEXT_TOKENS,
  MAX_QUERY_TOKENS
} from "@/lib/token-budget";
import { AIQueryRequest } from "@/types/rag";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/ask — PIPELINE TỐI ƯU TOKEN + STREAMING SSE
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  Tầng 0:  GUARDRAIL          0ms    0 token             │
 * │  Tầng 1:  SEMANTIC CACHE     0ms    0 token  ─── HIT ──►│
 * │  Tầng 2:  QUERY CLASSIFIER   1ms    0 token             │
 * │  Tầng 3:  RAG IN-MEMORY     0.2ms   0 token  ─── HIT ──►│
 * │  Tầng 4:  STREAMING AI   1-1.5s   ≤680 token           │
 * │  Tầng 5:  OFFLINE RAG FALLBACK 0ms  0 token  ─── FAIL ►│
 * └─────────────────────────────────────────────────────────┘
 *
 * Token budget AI call:
 *   System role:  ≤ 120 tokens
 *   Context:      ≤ 250 tokens (1 section liên quan)
 *   History:      ≤  60 tokens (compressed summary, không raw turns)
 *   Query:        ≤  50 tokens (truncated nếu cần)
 *   Response:         120 tokens max_tokens
 *   TOTAL:        ≤  600 tokens/request
 */
export async function POST(req: NextRequest) {
  const startMs = Date.now();

  const body: AIQueryRequest & {
    conversation_history?: Array<{ role: string; content: string }>;
  } = await req.json();

  const rawQuery = body.query?.trim() || "";
  const stationId = body.current_station_id || undefined;
  const lang = (body.lang || "vi") as "vi" | "en";
  const rawHistory = body.conversation_history || [];

  if (!rawQuery) {
    return sseError("Query cannot be empty");
  }

  const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "unknown";

  // Cắt query nếu quá dài (token budget)
  const query = truncateToTokenBudget(rawQuery, MAX_QUERY_TOKENS, lang);

  // ══ TẦNG 0: GUARDRAIL (0ms, 0 token) ═══════════════════════════════════════
  const guardDecision = evaluateHistoricalGuardrail(query, lang);
  if (!guardDecision.allowed) {
    const answer = guardDecision.rebuttalText || "";
    auditAsync({ stationId, query, answer, decision: `GUARD:${guardDecision.reason}`, source: guardDecision.sourceAuthority, clientIp, userAgent, lang });
    return sseImmediate(answer, "guardrail");
  }

  // ══ TẦNG 1: SEMANTIC CACHE (0ms, 0 token) ══════════════════════════════════
  const cacheKey = semanticCache.normalizeKey(query, lang, stationId);
  const cached = semanticCache.get(cacheKey);
  if (cached) {
    // Cache hit — không ghi audit để tránh noise (đã ghi lần đầu)
    return sseImmediate(cached.answer, `cache:${cached.provider}`, Date.now() - startMs);
  }

  // ══ TẦNG 2: QUERY CLASSIFIER (1ms, 0 token) ════════════════════════════════
  const classification = classifyQuery(query, stationId);

  // ══ TẦNG 3: RAG IN-MEMORY (0.2ms, 0 token) — OFFLINE FIRST ════════════════
  const ragMatch = searchHistoricalKnowledge(query, stationId, lang);

  // RAG hit với confidence cao → trả về ngay (0 token AI)
  const ragThreshold = classification.intent === "FACTUAL" ? 0.72 : 0.78;
  if (ragMatch && ragMatch.score >= ragThreshold) {
    const answer = ragMatch.content;
    // Cache kết quả RAG
    semanticCache.set(cacheKey, { answer, provider: "rag_local", stationId, lang });
    auditAsync({ stationId: ragMatch.location_id, query, answer, decision: "RAG_HIT", source: ragMatch.source_authority, clientIp, userAgent, lang, chunkId: ragMatch.chunk_id, score: ragMatch.score });
    return sseImmediate(answer, "rag_local", Date.now() - startMs, ragMatch.score);
  }

  // SAFETY intent không cần AI — dùng RAG best-effort dù score thấp
  if (classification.intent === "SAFETY" && ragMatch) {
    const answer = ragMatch.content;
    semanticCache.set(cacheKey, { answer, provider: "rag_safety", stationId, lang });
    auditAsync({ stationId, query, answer, decision: "SAFETY_RAG", source: "station_data", clientIp, userAgent, lang });
    return sseImmediate(answer, "rag_safety", Date.now() - startMs);
  }

  // ══ TẦNG 4: STREAMING AI với TOKEN BUDGET TỐI ƯU ══════════════════════════
  const knowledgeBase = CU_CHI_FULL_KNOWLEDGE[lang];

  // Context injection: chỉ inject section liên quan nhất (không inject tất cả)
  const sectionMap: Record<string, keyof typeof knowledgeBase> = {
    kitchen: "kitchen", hospital: "hospital", command: "command",
    ventilation: "ventilation", traps: "traps", overview: "overview", sacred: "sacred"
  };
  const relevantKey = sectionMap[classification.relevantSection] || "overview";
  let contextRaw = knowledgeBase[relevantKey];

  // Thêm RAG match nếu có (bổ sung độ chính xác)
  if (ragMatch) {
    contextRaw = ragMatch.content + "\n\n" + contextRaw;
  }

  // Cắt context theo budget
  const context = truncateToTokenBudget(contextRaw, MAX_CONTEXT_TOKENS, lang);

  // Nén history thành 1 dòng thay vì gửi raw turns
  const historyCompressed = compressHistory(rawHistory, lang);

  // Build system prompt compact
  const systemPrompt = buildCompactSystemPrompt(lang, context, stationId);

  // Đánh giá budget trước khi gửi
  const budget = assessTokenBudget({ systemPrompt, context, historyCompressed, query, lang });

  // Build messages với history nén
  const messages: AIMessage[] = [
    { role: "system", content: systemPrompt },
    // History dưới dạng single assistant context hint (không raw turns)
    ...(historyCompressed
      ? [{ role: "user" as const, content: historyCompressed },
         { role: "assistant" as const, content: lang === "vi" ? "Tôi đã ghi nhận." : "Noted." }]
      : []),
    { role: "user", content: query }
  ];

  // ── STREAMING SSE ──────────────────────────────────────────────────────────
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      let fullText = "";
      let aiError: string | null = null;
      let aiResult: { providerId: string; model: string; latencyMs: number } | null = null;

      try {
        const result = await streamAIWithFailover(messages, (chunk) => {
          fullText += chunk;
          controller.enqueue(enc.encode(sseData({ type: "chunk", text: chunk })));
        });
        aiResult = result;
      } catch (err) {
        aiError = err instanceof Error ? err.message : String(err);
      }

      if (!fullText.trim() || aiError) {
        // ── TẦNG 5: OFFLINE RAG FALLBACK (khi mất mạng hoàn toàn) ────────────
        // Luôn có câu trả lời dù không có AI
        const offlineAnswer = ragMatch
          ? ragMatch.content
          : truncateToTokenBudget(knowledgeBase[relevantKey], MAX_CONTEXT_TOKENS, lang);

        controller.enqueue(enc.encode(sseData({ type: "chunk", text: offlineAnswer })));
        controller.enqueue(enc.encode(sseData({ type: "done", provider: "rag_offline_fallback", latency: Date.now() - startMs })));
        auditAsync({ stationId, query, answer: offlineAnswer, decision: "OFFLINE_RAG_FALLBACK", source: "rag_offline", clientIp, userAgent, lang });
      } else {
        // Thêm token budget metadata vào done event (monitoring)
        controller.enqueue(enc.encode(sseData({
          type: "done",
          provider: aiResult!.providerId,
          model: aiResult!.model,
          latency: Date.now() - startMs,
          tokensEstimated: budget.estimatedTotal
        })));

        // Cache kết quả AI
        semanticCache.set(cacheKey, { answer: fullText, provider: aiResult!.providerId, stationId, lang });

        auditAsync({ stationId, query, answer: fullText, decision: "AI_STREAM", source: `AI:${aiResult!.providerId}`, clientIp, userAgent, lang });
      }

      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-CHI-Intent": classification.intent,
      "X-CHI-Budget": String(budget.estimatedTotal)
    }
  });
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function sseData(obj: Record<string, unknown>): string {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

/** Trả về SSE ngay lập tức (không dùng ReadableStream) */
function sseImmediate(
  answer: string,
  provider: string,
  latency = 0,
  score?: number
): Response {
  const scoreField = score !== undefined ? `, "score": ${score}` : "";
  const body =
    `data: ${JSON.stringify({ type: "chunk", text: answer })}\n\n` +
    `data: ${JSON.stringify({ type: "done", provider, latency })}${scoreField}\n\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-CHI-Provider": provider
    }
  });
}

function sseError(message: string): Response {
  return new Response(`data: ${JSON.stringify({ type: "error", message })}\n\n`, {
    status: 400,
    headers: { "Content-Type": "text/event-stream" }
  });
}

/** Ghi audit log bất đồng bộ — không block response */
function auditAsync(params: {
  stationId?: string;
  query: string;
  answer: string;
  decision: string;
  source?: string;
  clientIp: string;
  userAgent: string;
  lang: "vi" | "en";
  chunkId?: string;
  score?: number;
}): void {
  recordAuditLog({
    stationId: params.stationId,
    userQuery: params.query,
    responseText: params.answer,
    matchedChunkId: params.chunkId,
    confidenceScore: params.score,
    guardrailDecision: params.decision,
    sourceAuthority: params.source,
    clientIp: params.clientIp,
    userAgent: params.userAgent,
    locale: params.lang
  }).catch(() => {}); // fire & forget
}
