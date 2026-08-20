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

export interface TokenBudget {
  systemPromptTokens: number;
  contextTokens: number;
  historyTokens: number;
  queryTokens: number;
  estimatedTotal: number;
  withinBudget: boolean;
}

const MAX_BUDGET = 680;
const MAX_CONTEXT_TOKENS = 250;
const MAX_HISTORY_TOKENS = 60;
const MAX_QUERY_TOKENS = 50;

/** Ước tính token nhanh không cần API */
export function estimateTokens(text: string, lang: "vi" | "en" = "vi"): number {
  if (!text) return 0;
  // Tiếng Việt có dấu: ~1.8 chars/token (nhiều bytes unicode)
  // Tiếng Anh: ~4 chars/token
  const charsPerToken = lang === "vi" ? 1.8 : 4;
  return Math.ceil(text.length / charsPerToken);
}

/** Cắt text để không vượt quá budget token */
export function truncateToTokenBudget(
  text: string,
  maxTokens: number,
  lang: "vi" | "en" = "vi"
): string {
  const charsPerToken = lang === "vi" ? 1.8 : 4;
  const maxChars = Math.floor(maxTokens * charsPerToken);
  if (text.length <= maxChars) return text;
  // Cắt tại câu hoàn chỉnh gần nhất
  const truncated = text.slice(0, maxChars);
  const lastPeriod = Math.max(
    truncated.lastIndexOf("."),
    truncated.lastIndexOf("!"),
    truncated.lastIndexOf("?")
  );
  return lastPeriod > maxChars * 0.6 ? truncated.slice(0, lastPeriod + 1) : truncated + "...";
}

/**
 * Tóm tắt conversation history thành 1 dòng compact
 * Thay vì gửi raw turns (tốn 200-400 tokens) → chỉ gửi topic summary (~30-60 tokens)
 */
export function compressHistory(
  history: Array<{ role: string; content: string }>,
  lang: "vi" | "en"
): string {
  if (!history || history.length === 0) return "";

  // Lấy các câu hỏi của user trong history (bỏ qua assistant turns)
  const userTurns = history
    .filter((m) => m.role === "user")
    .map((m) => m.content.slice(0, 40)) // Chỉ lấy 40 chars đầu mỗi câu hỏi
    .slice(-3); // Tối đa 3 câu hỏi gần nhất

  if (userTurns.length === 0) return "";

  // Tóm tắt thành 1 dòng ngắn gọn
  if (lang === "vi") {
    return `[Khách đã hỏi: ${userTurns.join(" / ")}]`;
  }
  return `[Visitor previously asked: ${userTurns.join(" / ")}]`;
}

/** Đánh giá ngân sách token trước khi gửi request */
export function assessTokenBudget(params: {
  systemPrompt: string;
  context: string;
  historyCompressed: string;
  query: string;
  lang: "vi" | "en";
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
