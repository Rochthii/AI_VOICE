/**
 * QUERY CLASSIFIER — Phân loại ý định câu hỏi KHÔNG cần API
 *
 * Tại sao cần: Không phải mọi câu hỏi đều cần AI đầy đủ.
 * Phân loại giúp chọn đúng pipeline xử lý, tránh lãng phí token.
 *
 * 4 loại intent:
 *   FACTUAL    → Câu hỏi sự thật cụ thể về địa đạo → RAG trước, AI chỉ khi cần
 *   SAFETY     → Câu hỏi an toàn, lối thoát → Data tĩnh trạm, không cần AI
 *   NARRATIVE  → Câu hỏi câu chuyện, cảm xúc → AI với context câu chuyện
 *   GENERAL    → Câu hỏi chung về lịch sử Việt Nam → AI với context tổng quan
 */

export type QueryIntent =
  | "FACTUAL"      // Sự thật cụ thể: "Bếp Hoàng Cầm hoạt động thế nào?"
  | "SAFETY"       // An toàn: "Lối thoát hiểm ở đâu?" "Bao lâu thì ra khỏi hầm?"
  | "NARRATIVE"    // Câu chuyện: "Bác sĩ Lê cảm thấy thế nào?" "Cuộc sống ra sao?"
  | "GENERAL";     // Tổng quan: "Địa đạo được xây dựng khi nào?"

export interface ClassifiedQuery {
  intent: QueryIntent;
  /** Section knowledge base liên quan nhất */
  relevantSection: "kitchen" | "hospital" | "command" | "ventilation" | "traps" | "overview" | "sacred";
  /** Độ tin cậy classification (0-1) */
  confidence: number;
  /** Nên gọi AI không, hay RAG + static là đủ */
  requiresAI: boolean;
}

// ─── TỪ KHÓA PHÂN LOẠI (Tiếng Việt + Tiếng Anh) ────────────────────────────

const SAFETY_KEYWORDS = [
  // VI
  "lối thoát", "cửa thoát", "thoát hiểm", "bao lâu", "bao xa", "chiều cao", "chiều dài",
  "mét", "phút", "rộng", "hẹp", "ngạt", "an toàn", "khẩn cấp", "nguy hiểm", "sơ cứu",
  // EN
  "exit", "escape", "how long", "how far", "height", "length", "wide", "narrow",
  "suffocate", "safe", "emergency", "danger", "first aid"
];

const KITCHEN_KEYWORDS = [
  "bếp", "hoàng cầm", "khói", "nấu", "khoai mì", "muối mè", "ăn", "thực phẩm", "lương thực",
  "kitchen", "stove", "smoke", "cook", "cassava", "food", "meal"
];

const HOSPITAL_KEYWORDS = [
  "bệnh xá", "phẫu thuật", "bác sĩ", "võ hoàng lê", "filatov", "thuốc nam", "mổ", "cứu thương",
  "bệnh viện", "y tế", "thương binh", "máu", "vết thương",
  "hospital", "surgery", "doctor", "medicine", "wound", "blood", "medical"
];

const COMMAND_KEYWORDS = [
  "chỉ huy", "bộ tư lệnh", "khu ủy", "huyện ủy", "tết mậu thân", "1968", "cedar falls",
  "nút chặn", "sông sài gòn", "chiến dịch", "tổng tiến công", "cuộc họp",
  "command", "headquarters", "bunker", "tet offensive", "battle", "leadership"
];

const VENTILATION_KEYWORDS = [
  "thông hơi", "lỗ thở", "ụ mối", "chó", "béc giê", "xà phòng", "mỹ", "đối lưu", "crimp",
  "không khí", "hơi thở", "camay", "ớt bột",
  "ventilation", "vent", "termite", "dog", "air", "soap", "smell"
];

const TRAP_KEYWORDS = [
  "bẫy", "chông", "mìn gạt", "tô văn đực", "cánh cửa", "nắp tự động", "xe tăng",
  "vũ khí", "thô sơ", "tre", "bẫy hố",
  "trap", "booby", "mine", "tank", "weapon", "bamboo", "spike"
];

const NARRATIVE_KEYWORDS = [
  "cảm thấy", "nghĩ gì", "cuộc sống", "câu chuyện", "kể về", "ý nghĩa", "tại sao",
  "như thế nào", "ra sao", "con người", "người dân", "tự nguyện", "hy sinh",
  "feel", "life", "story", "tell me about", "why", "people", "sacrifice", "volunteer"
];

// ─── HÀM PHÂN LOẠI CHÍNH ────────────────────────────────────────────────────

function countMatches(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw.toLowerCase())).length;
}

export function classifyQuery(
  query: string,
  stationId?: string
): ClassifiedQuery {
  const lower = query.toLowerCase().trim();

  // SAFETY — ưu tiên cao nhất
  const safetyScore = countMatches(lower, SAFETY_KEYWORDS);
  if (safetyScore >= 1) {
    const section = stationId
      ? (["01_hoang_cam_kitchen", "kitchen"] as const)[0] === stationId ? "kitchen" :
        stationId === "02_field_hospital" ? "hospital" :
        stationId === "03_command_bunker" ? "command" :
        stationId === "04_ventilation_termite" ? "ventilation" :
        stationId === "05_booby_traps" ? "traps" : "overview"
      : "overview";
    return { intent: "SAFETY", relevantSection: section, confidence: 0.9, requiresAI: false };
  }

  // Tính điểm từng section
  const scores: Record<string, number> = {
    kitchen: countMatches(lower, KITCHEN_KEYWORDS),
    hospital: countMatches(lower, HOSPITAL_KEYWORDS),
    command: countMatches(lower, COMMAND_KEYWORDS),
    ventilation: countMatches(lower, VENTILATION_KEYWORDS),
    traps: countMatches(lower, TRAP_KEYWORDS)
  };

  const narrativeScore = countMatches(lower, NARRATIVE_KEYWORDS);
  const maxSection = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  const maxScore = maxSection[1];

  // FACTUAL — câu hỏi sự thật cụ thể, đủ dùng RAG
  if (maxScore >= 2) {
    return {
      intent: "FACTUAL",
      relevantSection: maxSection[0] as ClassifiedQuery["relevantSection"],
      confidence: Math.min(0.95, 0.5 + maxScore * 0.15),
      requiresAI: false // RAG đủ xử lý, chỉ escalate nếu RAG miss
    };
  }

  // NARRATIVE — câu hỏi cần hiểu ngữ cảnh, cảm xúc
  if (narrativeScore >= 1) {
    return {
      intent: "NARRATIVE",
      relevantSection: maxScore > 0 ? maxSection[0] as ClassifiedQuery["relevantSection"] : "overview",
      confidence: 0.7,
      requiresAI: true
    };
  }

  // GENERAL — câu hỏi tổng quan, lịch sử
  return {
    intent: "GENERAL",
    relevantSection: "overview",
    confidence: 0.5,
    requiresAI: true
  };
}
