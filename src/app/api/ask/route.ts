import { NextRequest, NextResponse } from "next/server";
import { evaluateHistoricalGuardrail } from "@/lib/guardrails";
import { searchHistoricalKnowledge, formatSpeechText } from "@/lib/rag-engine";
import { recordAuditLog } from "@/lib/supabase";
import { AIQueryRequest, AIQueryResponse } from "@/types/rag";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body: AIQueryRequest = await req.json();
    const query = body.query?.trim() || "";
    const currentStationId = body.current_station_id || undefined;
    const lang = body.lang || "vi";

    if (!query) {
      return NextResponse.json(
        { error: "Query cannot be empty" },
        { status: 400 }
      );
    }

    const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // 1. Chạy tầng kiểm duyệt Guardrails chống kích động & xuyên tạc
    const guardDecision = evaluateHistoricalGuardrail(query, lang);

    if (!guardDecision.allowed) {
      const rebuttalAnswer = guardDecision.rebuttalText || "";

      // Ghi nhật ký kiểm toán hành vi bị chặn lên Supabase
      await recordAuditLog({
        stationId: currentStationId,
        userQuery: query,
        responseText: rebuttalAnswer,
        guardrailDecision: guardDecision.reason,
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

      return NextResponse.json(responsePayload, { status: 200 });
    }

    // 2. Tìm kiếm sử liệu ngữ nghĩa bằng In-Memory Cosine RAG Engine
    const match = searchHistoricalKnowledge(query, currentStationId, lang);

    if (!match) {
      const fallbackText =
        lang === "vi"
          ? "Xin lỗi quý khách, nội dung này nằm ngoài phạm vi tư liệu lịch sử chính thức của Ban Quản lý Di tích Địa đạo Củ Chi."
          : "I apologize, this topic is outside the official historical archives of the Cu Chi Tunnels Historical Site.";

      await recordAuditLog({
        stationId: currentStationId,
        userQuery: query,
        responseText: fallbackText,
        confidenceScore: 0.0,
        guardrailDecision: "LOW_SIMILARITY_FALLBACK",
        sourceAuthority: "Ban Quản lý Khu Di tích Lịch sử Địa đạo Củ Chi",
        clientIp,
        userAgent,
        locale: lang
      });

      const responsePayload: AIQueryResponse = {
        answer: fallbackText,
        confidence_score: 0.0,
        is_grounded: false,
        station_id: currentStationId || "general"
      };

      return NextResponse.json(responsePayload, { status: 200 });
    }

    // 3. Tối ưu câu trả lời cho giọng đọc TTS và Cinema Ticker
    const cleanSpeechAnswer = formatSpeechText(match.content);

    // Ghi nhật ký tương tác thành công lên Supabase
    await recordAuditLog({
      stationId: match.location_id,
      userQuery: query,
      responseText: cleanSpeechAnswer,
      matchedChunkId: match.chunk_id,
      confidenceScore: match.score,
      guardrailDecision: "SAFE",
      sourceAuthority: match.source_authority,
      clientIp,
      userAgent,
      locale: lang
    });

    const responsePayload: AIQueryResponse = {
      answer: cleanSpeechAnswer,
      matched_chunk_id: match.chunk_id,
      confidence_score: match.score,
      is_grounded: true,
      station_id: match.location_id
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error("[API /api/ask Error]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
