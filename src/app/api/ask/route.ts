import { NextRequest } from "next/server";
import { evaluateHistoricalGuardrail } from "@/lib/guardrails";
import { recordAuditLog } from "@/lib/supabase";
import { streamAIWithFailover, AIMessage } from "@/lib/ai-provider-manager";
import { buildCompactSystemPrompt, CU_CHI_FULL_KNOWLEDGE } from "@/lib/cu-chi-system-prompt";
import { searchHistoricalKnowledge } from "@/lib/rag-engine";
import { AIQueryRequest } from "@/types/rag";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/ask — Streaming SSE (text/event-stream)
 *
 * Pipeline Hybrid Offline-First + Streaming AI:
 *   Tầng 0: Guardrail (0ms, deterministic)
 *   Tầng 1: RAG In-Memory (0.2ms, offline)  → nếu score >= 0.78 → stream RAG answer ngay
 *   Tầng 2: Streaming AI (200-1500ms TTFT)  → stream từng chunk về client
 *   Fallback: RAG best-effort nếu AI cũng fail (luôn trả lời được ngay cả khi mất mạng)
 *
 * Client nhận SSE events:
 *   data: {"type":"chunk","text":"..."}     — mỗi chunk text từ AI
 *   data: {"type":"done","provider":"...","latency":123}  — hoàn tất
 *   data: {"type":"error","message":"..."}  — lỗi
 */
export async function POST(req: NextRequest) {
  const startMs = Date.now();

  const body: AIQueryRequest & { conversation_history?: AIMessage[] } = await req.json();
  const query = body.query?.trim() || "";
  const currentStationId = body.current_station_id || undefined;
  const lang = (body.lang || "vi") as "vi" | "en";
  const conversationHistory: AIMessage[] = body.conversation_history || [];

  if (!query) {
    return new Response(
      `data: ${JSON.stringify({ type: "error", message: "Query cannot be empty" })}\n\n`,
      { status: 400, headers: { "Content-Type": "text/event-stream" } }
    );
  }

  const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "unknown";

  // ── TẦNG 0: GUARDRAIL DETERMINISTIC (0ms) ────────────────────────────────
  const guardDecision = evaluateHistoricalGuardrail(query, lang);

  if (!guardDecision.allowed) {
    const rebuttalAnswer = guardDecision.rebuttalText || "";
    // Fire & forget audit log
    recordAuditLog({
      stationId: currentStationId, userQuery: query,
      responseText: rebuttalAnswer,
      guardrailDecision: `GUARDRAIL_BLOCKED:${guardDecision.reason}`,
      sourceAuthority: guardDecision.sourceAuthority,
      clientIp, userAgent, locale: lang
    }).catch(() => {});

    const stream = new ReadableStream({
      start(controller) {
        const enc = new TextEncoder();
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: "chunk", text: rebuttalAnswer })}\n\n`));
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: "done", provider: "guardrail", latency: Date.now() - startMs })}\n\n`));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-CHI-Guard": "blocked"
      }
    });
  }

  // ── TẦNG 1: RAG IN-MEMORY (0.2ms, HOẠT ĐỘNG OFFLINE) ────────────────────
  const ragMatch = searchHistoricalKnowledge(query, currentStationId, lang);

  // Nếu RAG tìm thấy match đủ tin cậy → trả về ngay, không cần AI
  if (ragMatch && ragMatch.score >= 0.78) {
    const ragAnswer = ragMatch.content;

    recordAuditLog({
      stationId: ragMatch.location_id, userQuery: query,
      responseText: ragAnswer,
      matchedChunkId: ragMatch.chunk_id,
      confidenceScore: ragMatch.score,
      guardrailDecision: "RAG_HIT",
      sourceAuthority: ragMatch.source_authority,
      clientIp, userAgent, locale: lang
    }).catch(() => {});

    const stream = new ReadableStream({
      start(controller) {
        const enc = new TextEncoder();
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: "chunk", text: ragAnswer })}\n\n`));
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: "done", provider: "rag_local", latency: Date.now() - startMs, score: ragMatch.score })}\n\n`));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-CHI-Provider": "rag_local",
        "X-CHI-Score": String(ragMatch.score)
      }
    });
  }

  // ── TẦNG 2: STREAMING AI — HYBRID CONTEXT INJECTION ──────────────────────
  // Xây dựng context từ RAG (top match dù score thấp) + toàn bộ knowledge của trạm hiện tại
  const knowledgeBase = CU_CHI_FULL_KNOWLEDGE[lang];

  // Inject context động: chỉ inject section liên quan
  let ragContext = "";
  if (ragMatch) {
    ragContext += ragMatch.content + "\n\n";
  }

  // Thêm knowledge của trạm hiện tại (nếu có)
  const stationContextMap: Record<string, keyof typeof knowledgeBase> = {
    "01_hoang_cam_kitchen": "kitchen",
    "02_field_hospital": "hospital",
    "03_command_bunker": "command",
    "04_ventilation_termite": "ventilation",
    "05_booby_traps": "traps"
  };

  if (currentStationId && stationContextMap[currentStationId]) {
    const stationKey = stationContextMap[currentStationId];
    ragContext += knowledgeBase[stationKey];
  } else {
    // Không có trạm cụ thể → inject tổng quan + sacred numbers
    ragContext += knowledgeBase.overview + "\n\n" + knowledgeBase.sacred;
  }

  const systemPrompt = buildCompactSystemPrompt(lang, ragContext, currentStationId);
  const recentHistory = conversationHistory.slice(-4); // Giảm từ 6 → 4 để tiết kiệm token

  const messages: AIMessage[] = [
    { role: "system", content: systemPrompt },
    ...recentHistory,
    { role: "user", content: query }
  ];

  // ReadableStream SSE — stream từng chunk về client
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      let fullText = "";
      let aiResult: { providerId: string; model: string; latencyMs: number } | null = null;
      let aiError: string | null = null;

      try {
        const result = await streamAIWithFailover(messages, (chunk) => {
          fullText += chunk;
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: "chunk", text: chunk })}\n\n`));
        });
        aiResult = result;
      } catch (err) {
        aiError = err instanceof Error ? err.message : String(err);
      }

      if (aiError || !fullText.trim()) {
        // AI fail hoàn toàn → dùng RAG best-effort (luôn có câu trả lời dù mất mạng)
        const offlineAnswer = ragMatch
          ? ragMatch.content
          : lang === "vi"
          ? `${knowledgeBase.overview.slice(0, 150)}...`
          : `${knowledgeBase.overview.slice(0, 150)}...`;

        controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: "chunk", text: offlineAnswer })}\n\n`));
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: "done", provider: "rag_offline_fallback", latency: Date.now() - startMs })}\n\n`));

        recordAuditLog({
          stationId: currentStationId, userQuery: query,
          responseText: offlineAnswer,
          guardrailDecision: "ALL_PROVIDERS_FAILED_RAG_FALLBACK",
          sourceAuthority: "RAG_OFFLINE",
          clientIp, userAgent, locale: lang
        }).catch(() => {});
      } else {
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: "done", provider: aiResult!.providerId, model: aiResult!.model, latency: Date.now() - startMs })}\n\n`));

        // Fire & forget audit — không block stream
        recordAuditLog({
          stationId: currentStationId, userQuery: query,
          responseText: fullText,
          guardrailDecision: "AI_STREAM_RESPONSE",
          sourceAuthority: `AI:${aiResult!.providerId}:${aiResult!.model}`,
          clientIp, userAgent, locale: lang
        }).catch(() => {});
      }

      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  });
}
