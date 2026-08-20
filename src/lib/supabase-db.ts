/**
 * SUPABASE DATABASE & DYNAMIC REPOSITORY ENGINE
 *
 * Quản lý truy xuất dữ liệu từ các bảng Supabase Cloud:
 *   - stations (5 trạm di tích thực địa)
 *   - history_knowledge (kho tri thức sử liệu nguyên tử)
 *   - shared_semantic_cache (cache dùng chung giữa du khách)
 *   - audit_logs (nhật ký kiểm toán)
 *
 * Hỗ trợ cơ chế Hybrid:
 *   1. Ưu tiên fetch từ Supabase Cloud khi có mạng
 *   2. Tự động Fallback sang Local Knowledge khi offline / mạng hầm yếu
 */

import { getSupabaseClient } from "./supabase";
import { Station } from "@/types/station";
import { StationKnowledgeItem } from "./knowledge/types";
import stationsLocalData from "@/data/stations.json";
import knowledgeLocalData from "@/data/history_knowledge.json";

// In-Memory Repository Cache (cập nhật từ Supabase)
let cachedStations: Station[] | null = null;
let lastStationsFetchTime = 0;
const CACHE_REVALIDATE_MS = 5 * 60 * 1000; // 5 phút tự động làm mới từ Supabase

/**
 * Lấy danh sách toàn bộ trạm di tích từ Supabase (có Fallback Local)
 */
export async function getStationsFromDatabase(): Promise<Station[]> {
  const now = Date.now();
  if (cachedStations && now - lastStationsFetchTime < CACHE_REVALIDATE_MS) {
    return cachedStations;
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("stations")
        .select("*")
        .order("order_index", { ascending: true });

      if (!error && data && data.length > 0) {
        cachedStations = data as unknown as Station[];
        lastStationsFetchTime = now;
        return cachedStations;
      }
    } catch (err) {
      console.warn("[Supabase] Failed to fetch stations, using local fallback:", err);
    }
  }

  // Fallback sang file local nếu mất mạng hoặc Supabase chưa sẵn sàng
  cachedStations = stationsLocalData as unknown as Station[];
  return cachedStations;
}

/**
 * Lấy chi tiết tri thức sử liệu của một trạm từ Supabase
 */
export async function getStationKnowledgeFromDatabase(
  stationId: string
): Promise<StationKnowledgeItem | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("history_knowledge")
        .select("*")
        .eq("location_id", stationId)
        .limit(1)
        .single();

      if (!error && data) {
        return {
          id: data.location_id,
          sectionKey: data.category,
          order: 1,
          vi: data.content_vi,
          en: data.content_en,
          sourceAuthority: data.source_authority
        };
      }
    } catch (err) {
      console.warn("[Supabase] Knowledge query fallback:", err);
    }
  }

  // Fallback sang local knowledge
  const localMatch = (knowledgeLocalData as Array<{
    location_id: string;
    category: string;
    content_vi: string;
    content_en: string;
    source_authority: string;
  }>).find((k) => k.location_id === stationId);

  if (localMatch) {
    return {
      id: localMatch.location_id as StationKnowledgeItem["id"],
      sectionKey: localMatch.category as StationKnowledgeItem["sectionKey"],
      order: 1,
      vi: localMatch.content_vi,
      en: localMatch.content_en,
      sourceAuthority: localMatch.source_authority
    };
  }

  return null;
}

/**
 * Tìm kiếm câu trả lời đã được cache trên Supabase Cloud (Shared Semantic Cache)
 */
export async function getSharedCloudCache(cacheKey: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("shared_semantic_cache")
      .select("answer, hit_count")
      .eq("cache_key", cacheKey)
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .single();

    if (!error && data) {
      // Tăng hit count trên Supabase bất đồng bộ
      supabase
        .from("shared_semantic_cache")
        .update({ hit_count: data.hit_count + 1, last_accessed_at: new Date().toISOString() })
        .eq("cache_key", cacheKey)
        .then(() => {});

      return data.answer;
    }
  } catch {
    // Không block luồng chính nếu lỗi cache cloud
  }

  return null;
}

/**
 * Lưu câu trả lời mới vào Shared Cloud Cache trên Supabase
 */
export async function setSharedCloudCache(params: {
  cacheKey: string;
  query: string;
  stationId?: string;
  locale: string;
  answer: string;
  provider: string;
}): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from("shared_semantic_cache").upsert(
      {
        cache_key: params.cacheKey,
        normalized_query: params.query,
        station_id: params.stationId || null,
        locale: params.locale,
        answer: params.answer,
        provider: params.provider,
        hit_count: 1,
        last_accessed_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      { onConflict: "cache_key" }
    );
  } catch (err) {
    console.warn("[Supabase] Failed to write cloud cache:", err);
  }
}
