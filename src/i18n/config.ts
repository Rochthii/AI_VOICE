import { Locale, LocaleConfig } from "./types";

export const DEFAULT_LOCALE: Locale = "vi";

export const SUPPORTED_LOCALES: LocaleConfig[] = [
  {
    code: "vi",
    label: "Tiếng Việt",
    nativeLabel: "Tiếng Việt",
    flag: "🇻🇳",
    speechLang: "vi-VN"
  },
  {
    code: "en",
    label: "English",
    nativeLabel: "English",
    flag: "🇬🇧",
    speechLang: "en-US"
  },
  {
    code: "fr",
    label: "French",
    nativeLabel: "Français",
    flag: "🇫🇷",
    speechLang: "fr-FR"
  },
  {
    code: "ja",
    label: "Japanese",
    nativeLabel: "日本語",
    flag: "🇯🇵",
    speechLang: "ja-JP"
  },
  {
    code: "ko",
    label: "Korean",
    nativeLabel: "한국어",
    flag: "🇰🇷",
    speechLang: "ko-KR"
  },
  {
    code: "zh",
    label: "Chinese",
    nativeLabel: "中文",
    flag: "🇨🇳",
    speechLang: "zh-CN"
  }
];

export const LOCALE_MAP: Record<Locale, LocaleConfig> = SUPPORTED_LOCALES.reduce(
  (acc, item) => ({ ...acc, [item.code]: item }),
  {} as Record<Locale, LocaleConfig>
);
