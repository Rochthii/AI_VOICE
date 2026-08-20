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

/**
 * Tự động nhận diện ngôn ngữ câu hỏi (0ms, 0 API calls, Regex-based)
 */
export function detectQueryLanguage(query: string, fallbackLocale: string = "vi"): string {
  if (!query || !query.trim()) return fallbackLocale;
  const q = query.trim();

  // 1. Tiếng Hàn (Hangul: AC00-D7AF, 1100-11FF, 3130-318F)
  if (/[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/.test(q)) {
    return "ko";
  }

  // 2. Tiếng Nhật (Hiragana / Katakana)
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(q)) {
    return "ja";
  }

  // 3. Tiếng Trung (Hanzi thuần không có kana)
  if (/[\u4e00-\u9fff]/.test(q)) {
    return "zh";
  }

  // 4. Tiếng Việt (Ký tự đặc trưng có dấu tiếng Việt)
  if (/[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđĐ]/.test(q)) {
    return "vi";
  }

  const lower = q.toLowerCase();

  // 5. Tiếng Pháp (Từ khóa và dấu đặc trưng Pháp)
  if (
    /\b(pourquoi|comment|est-ce|qu'est-ce|combien|quand|quel|quelle|quels|quelles|le|la|les|du|des|dans|sous|avec|pour|qui|c'est)\b/.test(lower) ||
    /[éèêëàâùûçîïôœæ]/.test(lower)
  ) {
    return "fr";
  }

  // 6. Tiếng Đức
  if (
    /\b(warum|wie|was|wer|wo|wann|wieviel|kann|ist|sind|der|die|das|ein|eine|in|unter|mit|auf)\b/.test(lower) ||
    /[äöüß]/.test(lower)
  ) {
    return "de";
  }

  // 7. Tiếng Tây Ban Nha
  if (
    /\b(por qué|cómo|qué|quién|dónde|cuándo|cuánto|es|son|el|la|los|las|un|una|en|con|para)\b/.test(lower) ||
    /[áéíóúñ¿¡]/.test(lower)
  ) {
    return "es";
  }

  // 8. Tiếng Anh (Từ hỏi và cấu trúc câu hỏi phổ biến)
  if (
    /\b(how|what|why|who|where|when|which|is|are|was|were|can|could|did|do|does|will|would|the|a|an|in|at|on|of|to|for|with|about)\b/.test(lower)
  ) {
    return "en";
  }

  // 9. Tiếng Việt không dấu (Các từ thông dụng trong địa đạo Củ Chi)
  if (
    /\b(bep|ham|dia dao|cu chi|giu|giau|khoi|thoat|chong|min|liet si|ben duoc|ben dinh|sau|dai|chieu cao|an toan|cap cuu)\b/.test(lower)
  ) {
    return "vi";
  }

  return fallbackLocale;
}

