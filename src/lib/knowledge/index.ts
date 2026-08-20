import { Locale } from "@/i18n/types";
import { StationKey, KnowledgeSectionKey, StationKnowledgeItem } from "./types";
import { kitchenKnowledge } from "./stations/01_kitchen";
import { hospitalKnowledge } from "./stations/02_hospital";
import { commandKnowledge } from "./stations/03_command";
import { ventilationKnowledge } from "./stations/04_ventilation";
import { trapsKnowledge } from "./stations/05_traps";
import { generalKnowledge } from "./general";
import { buildUniversalSystemPrompt } from "./prompt-builder";

export const stationKnowledgeList: StationKnowledgeItem[] = [
  kitchenKnowledge,
  hospitalKnowledge,
  commandKnowledge,
  ventilationKnowledge,
  trapsKnowledge
];

export const stationKnowledgeMap: Record<StationKey, StationKnowledgeItem> = {
  "01_hoang_cam_kitchen": kitchenKnowledge,
  "02_field_hospital": hospitalKnowledge,
  "03_command_bunker": commandKnowledge,
  "04_ventilation_termite": ventilationKnowledge,
  "05_booby_traps": trapsKnowledge
};

export const sectionKnowledgeMap: Record<KnowledgeSectionKey, { vi: string; en: string }> = {
  kitchen: { vi: kitchenKnowledge.vi, en: kitchenKnowledge.en },
  hospital: { vi: hospitalKnowledge.vi, en: hospitalKnowledge.en },
  command: { vi: commandKnowledge.vi, en: commandKnowledge.en },
  ventilation: { vi: ventilationKnowledge.vi, en: ventilationKnowledge.en },
  traps: { vi: trapsKnowledge.vi, en: trapsKnowledge.en },
  overview: { vi: generalKnowledge.vi.overview, en: generalKnowledge.en.overview },
  sacred: { vi: generalKnowledge.vi.sacred, en: generalKnowledge.en.sacred }
};

/**
 * Lấy nội dung sử liệu theo section và ngôn ngữ ưu tiên
 */
export function getKnowledgeBySection(section: KnowledgeSectionKey, locale: Locale = "vi"): string {
  const item = sectionKnowledgeMap[section] || sectionKnowledgeMap.overview;
  return locale === "vi" ? item.vi : item.en;
}

/**
 * Lấy tri thức toàn diện cho câu hỏi: kết hợp bối cảnh trọng tâm + chi tiết trạm + tổng thể địa đạo
 */
export function getKnowledgeForQuery(section: KnowledgeSectionKey, locale: Locale = "vi"): string {
  const langKey = locale === "vi" ? "vi" : "en";
  const stationContent = getKnowledgeBySection(section, locale);
  const generalOverview = generalKnowledge[langKey].overview;
  const sacredOverview = generalKnowledge[langKey].sacred;

  if (section === "overview" || section === "sacred") {
    return `${generalOverview}\n\n${sacredOverview}`;
  }

  // Luôn đặt tri thức trọng tâm lên hàng đầu để không bị cắt bởi token budget
  return `[TRỌNG TÂM SỬ LIỆU / ĐỐI TƯỢNG ĐƯỢC HỎI]:\n${stationContent}\n\n[BỐI CẢNH TOÀN CẢNH ĐỊA ĐẠO CỦ CHI]:\n${generalOverview}`;
}

/**
 * Lấy toàn bộ văn bản sử liệu theo ngôn ngữ (dùng cho offline fallback)
 */
export function getFullKnowledgeText(locale: Locale = "vi"): string {
  const langKey = locale === "vi" ? "vi" : "en";
  const stationsText = stationKnowledgeList.map((st) => st[langKey]).join("\n\n");
  const generalText = `${generalKnowledge[langKey].overview}\n\n${generalKnowledge[langKey].sacred}`;
  return `${generalText}\n\n${stationsText}`;
}

export * from "./types";
export * from "./prompt-builder";
