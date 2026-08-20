/**
 * SHARED STRING UTILITIES
 * Tập hợp các hàm xử lý chuỗi dùng chung cho RAG, Cache, TTS, Guardrail
 */

/**
 * Loại bỏ dấu tiếng Việt để so sánh tìm kiếm và chuẩn hóa cache key
 */
export function removeVietnameseDiacritics(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Làm sạch văn bản cho Web Speech API (TTS) & Cinema Ticker
 */
export function cleanSpeechText(rawText: string): string {
  if (!rawText) return "";
  return rawText
    .replace(/[*#_~`\[\]\(\)\<\>]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Cắt văn bản thành tối đa N câu hoàn chỉnh
 */
export function limitSentences(text: string, maxSentences = 2): string {
  if (!text) return "";
  const sentences = text.split(/(?<=[.!?。！？])\s+/);
  if (sentences.length <= maxSentences) return text;
  return sentences.slice(0, maxSentences).join(" ");
}
