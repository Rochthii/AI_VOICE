import { Locale } from "./station";

export interface HistoryChunk {
  chunk_id: string;
  location_id: string;
  category: "tactics" | "construction" | "living" | "weaponry" | "general";
  content_vi: string;
  content_en: string;
  keywords: string[];
  embedding: number[]; // 1536-dimensional float vector
  source_authority: string;
}

export interface RAGMatchResult {
  chunk_id: string;
  location_id: string;
  score: number;
  content: string;
  source_authority: string;
}

export interface AIQueryRequest {
  query: string;
  current_station_id?: string;
  lang: Locale;
}

export interface AIQueryResponse {
  answer: string;
  matched_chunk_id?: string;
  confidence_score: number;
  is_grounded: boolean;
  station_id: string;
  audio_url?: string;
}
