import { NextRequest, NextResponse } from "next/server";
import { evaluateHistoricalGuardrail } from "@/lib/guardrails";
import { recordAuditLog } from "@/lib/supabase";
import { callAIWithFailover, AIMessage } from "@/lib/ai-provider-manager";
import { buildSystemPrompt } from "@/lib/cu-chi-system-prompt";
import { AIQueryRequest, AIQueryResponse } from "@/types/rag";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/ask
 *
 * Pipeline thực sự:
 *   1. Guardrail Tier 1 (Deterministic) — chặn bẫy kích động lịch sử
 *   2. callAIWithFailover() — Groq → Gemini → OpenRouter (instant failover)
 *   3. Ghi audit_log lên Supabase
 *   4. Trả về câu trả lời AI thực sự, không phải cosine copy-paste
 */
export async function POST(req: NextRequest) {
  const startMs = Date.now();

  try {
    const body: AIQueryRequest & { conversation_history?: AIMessage[] } = await req.json();
    const query = body.query?.trim() || "";
    const currentStationId = body.current_station_id || undefined;
    const lang = (body.lang || "vi") as "vi" | "en";
    const conversationHistory: AIMessage[] = body.conversation_history || [];

    if (!query) {
      return NextResponse.json({ error: "Query cannot be empty" }, { status: 400 });
    }

    const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // ── TẦNG 1: GUARDRAIL DETERMINISTIC ──────────────────────────────────────
    // Chặn các câu hỏi bẫy bôi nhọ lịch sử trước khi chạm đến AI
    const guardDecision = evaluateHistoricalGuardrail(query, lang);

    if (!guardDecision.allowed) {
      const rebuttalAnswer = guardDecision.rebuttalText || "";

      await recordAuditLog({
        stationId: currentStationId,
        userQuery: query,
        responseText: rebuttalAnswer,
        guardrailDecision: `GUARDRAIL_BLOCKED:${guardDecision.reason}`,
        sourceAuthority: guardDecision.sourceAuthority,
        clientIp,
        userAgent,
        locale: lang
      });

      const responsePayload: AIQueryResponse = {
        answer: rebuttalAnswer,
        confidence_score: 1.0,
        is_grounded: true,
        station_id: currentStationId || "general"
      };

      return NextResponse.json(responsePayload, {
        status: 200,
        headers: { "X-CHI-Guard": "blocked", "X-CHI-Reason": guardDecision.reason }
      });
    }

    // ── TẦNG 2: AI THỰC SỰ — MULTI-PROVIDER INSTANT FAILOVER ─────────────────
    // Xây dựng System Prompt nhúng toàn bộ kho sử liệu Củ Chi
    const systemPrompt = buildSystemPrompt(lang, currentStationId);

    // Xây dựng hội thoại multi-turn (giữ tối đa 6 lượt cuối để tiết kiệm token)
    const recentHistory = conversationHistory.slice(-6);
    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt },
      ...recentHistory,
      { role: "user", content: query }
    ];

    let aiResult;
    let answerText: string;
    let guardrailDecision = "AI_RESPONSE";

    try {
      aiResult = await callAIWithFailover(messages);
      answerText = aiResult.text;
    } catch (aiErr) {
      // Tất cả provider thất bại → Fallback offline an toàn
      console.error("[AI Failover Exhausted]:", aiErr);
      guardrailDecision = "ALL_PROVIDERS_FAILED_OFFLINE_FALLBACK";
      answerText =
        lang === "vi"
          ? "Kết nối AI tạm thời gián đoạn. Vui lòng hỏi Ban Hướng dẫn viên tại chỗ hoặc thử lại sau."
          : "AI connection temporarily unavailable. Please ask the on-site guide or try again shortly.";

      await recordAuditLog({
        stationId: currentStationId,
        userQuery: query,
        responseText: answerText,
        guardrailDecision,
        sourceAuthority: "SYSTEM_FALLBACK",
        clientIp,
        userAgent,
        locale: lang
      });

      return NextResponse.json(
        { answer: answerText, confidence_score: 0, is_grounded: false, station_id: currentStationId || "general" },
        { status: 200, headers: { "X-CHI-Guard": "offline_fallback" } }
      );
    }

    // ── TẦNG 3: GHI KIỂM TOÁN BẤT BIẾN ──────────────────────────────────────
    await recordAuditLog({
      stationId: currentStationId,
      userQuery: query,
      responseText: answerText,
      guardrailDecision,
      sourceAuthority: `AI:${aiResult.providerId}:${aiResult.model}`,
      clientIp,
      userAgent,
      locale: lang
    });

    const totalMs = Date.now() - startMs;

    const responsePayload: AIQueryResponse = {
      answer: answerText,
      confidence_score: 0.95,
      is_grounded: true,
      station_id: currentStationId || "general"
    };

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        "X-CHI-Provider": aiResult.providerId,
        "X-CHI-Model": aiResult.model,
        "X-CHI-Latency": `${aiResult.latencyMs}ms`,
        "X-CHI-Total": `${totalMs}ms`
      }
    });
  } catch (error) {
    console.error("[API /api/ask Critical Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
