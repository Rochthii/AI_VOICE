import { Locale, Dictionary } from "./types";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, LOCALE_MAP } from "./config";
import { viDictionary } from "./dictionaries/vi";
import { enDictionary } from "./dictionaries/en";
import { frDictionary } from "./dictionaries/fr";
import { jaDictionary } from "./dictionaries/ja";
import { koDictionary } from "./dictionaries/ko";
import { zhDictionary } from "./dictionaries/zh";

const dictionaries: Record<Locale, Dictionary> = {
  vi: viDictionary,
  en: enDictionary,
  fr: frDictionary,
  ja: jaDictionary,
  ko: koDictionary,
  zh: zhDictionary
};

/**
 * Lấy toàn bộ từ điển giao diện cho ngôn ngữ chỉ định
 */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
}

/**
 * Helper lấy chuỗi đa ngôn ngữ an toàn từ object LocalizedString
 * Nếu ngôn ngữ yêu cầu chưa có bản dịch (ví dụ fr/ja) → fallback về en hoặc vi
 */
export function getLocalizedText(
  obj: Record<string, string> | undefined,
  locale: Locale,
  fallback = ""
): string {
  if (!obj) return fallback;
  return obj[locale] || obj["en"] || obj["vi"] || fallback;
}

export * from "./types";
export * from "./config";
