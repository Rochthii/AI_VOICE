/**
 * I18N TYPE DEFINITIONS & LOCALES
 * Quản lý kiểu dữ liệu từ điển đa ngôn ngữ chuẩn cho toàn hệ thống CHI VOICE
 */

export type Locale = "vi" | "en" | "fr" | "ja" | "ko" | "zh";

export interface LocaleConfig {
  code: Locale;
  label: string;
  nativeLabel: string;
  flag: string;
  speechLang: string; // Chuẩn BCP 47 cho Web Speech API (STT/TTS)
}

export interface Dictionary {
  common: {
    station: string;
    offline: string;
    details: string;
    close: string;
    continue: string;
    understood: string;
    send: string;
    viewQr: string;
    loading: string;
    language: string;
    selectLanguage: string;
  };
  beacon: {
    openGround: string;
    time: string;
    meters: string;
    minutes: string;
    historicalStory: string;
    verifiedFacts: string;
    fieldFaq: string;
  };
  orb: {
    statusSearching: string;
    statusListening: string;
    statusNarrating: string;
    statusTapToAsk: string;
    aiTitle: string;
    aiSubtitle: string;
    inputPlaceholder: string;
    promptSuite: string;
    oneClickQuery: string;
    recPrefix: string;
    defaultQuestion: string;
    sampleQuestions: string[];
  };
  ticker: {
    seekBackward: string;
    seekForward: string;
    play: string;
    pause: string;
    progressBar: string;
  };
  panic: {
    title: string;
    safeZoneHeader: string;
    exitPathLabel: string;
    reassuranceButton: string;
  };
}
