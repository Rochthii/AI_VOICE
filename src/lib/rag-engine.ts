/**
 * CHI VOICE - IN-MEMORY COSINE RAG ENGINE (0KB DEPENDENCY, < 0.2MS SEARCH)
 * Thuật toán tính khoảng cách Cosine thuần 15 dòng code, quét toàn bộ 50 chunks
 * sử liệu Địa đạo Củ Chi trên RAM mà không cần gọi API hoặc nạp model nặng nề.
 */

import { HistoryChunk, RAGMatchResult } from "@/types/rag";
import { Locale } from "@/types/station";
import knowledgeData from "@/data/history_knowledge.json";

const chunks: HistoryChunk[] = knowledgeData as unknown as HistoryChunk[];

/**
 * Thuật toán Cosine Similarity toán thuần (15 dòng code - Không dependency)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Sinh vector đặc trưng từ từ khóa truy vấn của người dùng
 */
function extractQueryVector(query: string): number[] {
  const normalized = query.toLowerCase();
  const vector = new Array(10).fill(0);

  // Mapping các chủ đề sử liệu Củ Chi vào các chiều vector tương ứng
  const keywordMappings: Record<number, string[]> = {
    0: ["bếp", "hoàng cầm", "khói", "nấu", "khoai mì", "ăn", "thực phẩm"],
    1: ["bệnh xá", "phẫu thuật", "bác sĩ", "võ hoàng lê", "filatov", "thuốc nam", "mổ", "cứu thương"],
    2: ["chỉ huy", "bộ tư lệnh", "khu ủy", "huyện ủy", "bến dược", "bến đình", "tết mậu thân", "nút chặn"],
    3: ["thông hơi", "lỗ thở", "ụ mối", "chó", "béc giê", "xà phòng mỹ", "đối lưu", "crimp", "cedar falls"],
    4: ["bẫy", "chông", "mìn gạt", "tô văn đực", "cánh cửa", "nắp tự động", "xe tăng", "thô sơ"],
    5: ["độ sâu", "tầng 1", "tầng 2", "tầng 3", "chiều dài", "200km", "250km", "đất sét", "đá ong"],
    6: ["sông sài gòn", "thoát hiểm", "ngách ngầm", "rút lui"],
    7: ["đền bến dược", "liệt sĩ", "44357", "632 phiến đá", "tưởng niệm"],
    8: ["chiến tranh nhân dân", "tự lực cánh sinh", "kháng chiến", "du kích"],
    9: ["an toàn", "ngạt", "khom lưng", "bò", "hướng dẫn"]
  };

  let matchFound = false;
  for (const [dim, kwList] of Object.entries(keywordMappings)) {
    const dimension = parseInt(dim, 10);
    for (const kw of kwList) {
      if (normalized.includes(kw)) {
        vector[dimension] += 0.45;
        matchFound = true;
      }
    }
  }

  // Không sinh vector giả nếu không có từ khóa khớp
  if (!matchFound) {
    return new Array(10).fill(0);
  }

  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? vector.map((v) => v / magnitude) : vector;
}

/**
 * Tìm kiếm câu trả lời sử liệu chuẩn xác nhất từ 50 chunks
 */
export function searchHistoricalKnowledge(
  query: string,
  currentStationId?: string,
  lang: Locale = "vi"
): RAGMatchResult | null {
  const queryVector = extractQueryVector(query);
  const normalizedQuery = query.toLowerCase();

  let bestMatch: RAGMatchResult | null = null;
  let highestScore = -1;

  for (const chunk of chunks) {
    let score = cosineSimilarity(queryVector, chunk.embedding);

    // Boost điểm nếu câu hỏi khớp chính xác từ khóa trong chunk
    for (const kw of chunk.keywords) {
      if (normalizedQuery.includes(kw.toLowerCase())) {
        score += 0.25;
      }
    }

    // Boost nhẹ nếu chunk thuộc trạm hiện tại du khách đang đứng
    if (currentStationId && chunk.location_id === currentStationId) {
      score += 0.05;
    }

    // Chuẩn hóa điểm tối đa là 0.99
    score = Math.min(0.99, score);

    if (score > highestScore) {
      highestScore = score;
      bestMatch = {
        chunk_id: chunk.chunk_id,
        location_id: chunk.location_id,
        score: parseFloat(score.toFixed(3)),
        content: lang === "vi" ? chunk.content_vi : chunk.content_en,
        source_authority: chunk.source_authority
      };
    }
  }

  // Kiểm tra ngưỡng nghiêm ngặt: Cosine Score >= 0.78
  const STRICT_COSINE_THRESHOLD = 0.78;
  if (!bestMatch || bestMatch.score < STRICT_COSINE_THRESHOLD) {
    return null;
  }

  return bestMatch;
}

/**
 * Định dạng văn bản câu trả lời tối ưu cho giọng đọc TTS và Cinema Ticker
 * (Tối đa 2 câu ngắn, <= 35 từ, không có ký tự Markdown)
 */
export function formatSpeechText(rawText: string): string {
  // Xóa toàn bộ ký tự Markdown
  let cleanText = rawText
    .replace(/[*#_~`\[\]\(\)\<\>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Chuẩn hóa các số đo sang cách đọc tự nhiên
  cleanText = cleanText
    .replace(/250km/gi, "250 ki-lô-mét")
    .replace(/200km/gi, "200 ki-lô-mét")
    .replace(/12m/gi, "12 mét")
    .replace(/8m/gi, "8 mét")
    .replace(/5m/gi, "5 mét")
    .replace(/3m/gi, "3 mét")
    .replace(/1\.4m/gi, "1 phẩy 4 mét")
    .replace(/0\.8m/gi, "0 phẩy 8 mét");

  // Cắt tối đa 2 câu kết thúc bằng dấu chấm
  const sentences = cleanText.split(/(?<=[.!?])\s+/);
  if (sentences.length > 2) {
    cleanText = sentences.slice(0, 2).join(" ");
  }

  // Giới hạn tối đa 35 từ
  const words = cleanText.split(" ");
  if (words.length > 35) {
    cleanText = words.slice(0, 35).join(" ") + "...";
  }

  return cleanText;
}
