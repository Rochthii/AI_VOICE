export type Locale = "vi" | "en";

export interface LocalizedString {
  vi: string;
  en: string;
}

export interface StationSafety {
  tunnel_length_meters: number;
  avg_crawl_time_minutes: number;
  ceiling_height_meters: number;
  emergency_exit_note: LocalizedString;
  reassurance_message: LocalizedString;
  difficulty_level: "easy" | "medium" | "hard";
}

export interface AudioAsset {
  url: string;
  duration_seconds: number;
  file_size_bytes: number;
}

export interface StationFAQ {
  id: string;
  question: LocalizedString;
  answer: LocalizedString;
  keywords: string[];
}

export interface Station {
  id: string;
  order_index: number;
  qr_code_key: string;
  title: LocalizedString;
  short_summary: LocalizedString;
  safety: StationSafety;
  human_story_hook: LocalizedString;
  audio_assets: {
    vi: AudioAsset;
    en: AudioAsset;
  };
  key_facts: LocalizedString[];
  faqs: StationFAQ[];
}
