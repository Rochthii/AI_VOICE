/**
 * TOKEN BUDGET ENGINE
 * Đo và kiểm soát chi phí token cho mọi request.
 *
 * Ước tính token: tiếng Việt ~1.5 chars/token, tiếng Anh ~4 chars/token.
 *
 * Ngân sách mục tiêu cho CHI VOICE:
 *   - System prompt:       ≤ 200 tokens  (compact role + rules)
 *   - Context injection:   ≤ 250 tokens  (chỉ 1 section liên quan)
 *   - History (compressed): ≤ 60 tokens  (tóm tắt 1 dòng, không gửi raw turns)
 *   - User query:          ≤ 50 tokens   (cắt nếu dài hơn)
 *   - AI response:         ≤ 120 tokens  (max_tokens = 120)
 *   TỔNG TỐI ĐA:          ≤ 680 tokens/request
 *
 * Groq free tier: 14.400 token/phút → 21 requests/phút  (so với ~11 trước đây)
 */

import { Locale } from "@/i18n/types";

export interface TokenBudget {
  systemPromptTokens: number;
  contextTokens: number;
  historyTokens: number;
  queryTokens: number;
  estimatedTotal: number;
  withinBudget: boolean;
}

const MAX_BUDGET = 850;
const MAX_CONTEXT_TOKENS = 450;
const MAX_HISTORY_TOKENS = 60;
const MAX_QUERY_TOKENS = 60;

/** Ước tính token nhanh không cần API cho mọi ngôn ngữ */
export function estimateTokens(text: string, lang: Locale = "vi"): number {
  if (!text) return 0;
  // CJK (ja, ko, zh): ~1.2 chars/token
  // Vietnamese: ~1.8 chars/token
  // Latin (en, fr): ~4 chars/token
  let charsPerToken = 4;
  if (lang === "ja" || lang === "ko" || lang === "zh") {
    charsPerToken = 1.2;
  } else if (lang === "vi") {
    charsPerToken = 1.8;
  }
  return Math.ceil(text.length / charsPerToken);
}

/** Cắt text để không vượt quá budget token */
export function truncateToTokenBudget(
  text: string,
  maxTokens: number,
  lang: Locale = "vi"
): string {
  let charsPerToken = 4;
  if (lang === "ja" || lang === "ko" || lang === "zh") {
    charsPerToken = 1.2;
  } else if (lang === "vi") {
    charsPerToken = 1.8;
  }
  const maxChars = Math.floor(maxTokens * charsPerToken);
  if (text.length <= maxChars) return text;
  const truncated = text.slice(0, maxChars);
  const lastPeriod = Math.max(
    truncated.lastIndexOf("."),
    truncated.lastIndexOf("!"),
    truncated.lastIndexOf("?"),
    truncated.lastIndexOf("。"),
    truncated.lastIndexOf("！")
  );
  return lastPeriod > maxChars * 0.6 ? truncated.slice(0, lastPeriod + 1) : truncated + "...";
}

/**
 * Tóm tắt conversation history thành 1 dòng compact
 * Thay vì gửi raw turns (tốn 200-400 tokens) → chỉ gửi topic summary (~30-60 tokens)
 */
export function compressHistory(
  history: Array<{ role: string; content: string }>,
  lang: Locale
): string {
  if (!history || history.length === 0) return "";

  const userTurns = history
    .filter((m) => m.role === "user")
    .map((m) => m.content.slice(0, 40))
    .slice(-3);

  if (userTurns.length === 0) return "";

  if (lang === "vi") {
    return `[Khách đã hỏi: ${userTurns.join(" / ")}]`;
  } else if (lang === "fr") {
    return `[Questions précédentes: ${userTurns.join(" / ")}]`;
  } else if (lang === "ja") {
    return `[前回の質問: ${userTurns.join(" / ")}]`;
  } else if (lang === "ko") {
    return `[이전 질문: ${userTurns.join(" / ")}]`;
  } else if (lang === "zh") {
    return `[先前提问: ${userTurns.join(" / ")}]`;
  }
  return `[Visitor previously asked: ${userTurns.join(" / ")}]`;
}

/** Đánh giá ngân sách token trước khi gửi request */
export function assessTokenBudget(params: {
  systemPrompt: string;
  context: string;
  historyCompressed: string;
  query: string;
  lang: Locale;
}): TokenBudget {
  const systemPromptTokens = estimateTokens(params.systemPrompt, params.lang);
  const contextTokens = estimateTokens(params.context, params.lang);
  const historyTokens = estimateTokens(params.historyCompressed, params.lang);
  const queryTokens = estimateTokens(params.query, params.lang);
  const estimatedTotal = systemPromptTokens + contextTokens + historyTokens + queryTokens;

  return {
    systemPromptTokens,
    contextTokens,
    historyTokens,
    queryTokens,
    estimatedTotal,
    withinBudget: estimatedTotal <= MAX_BUDGET
  };
}

export { MAX_BUDGET, MAX_CONTEXT_TOKENS, MAX_HISTORY_TOKENS, MAX_QUERY_TOKENS };
