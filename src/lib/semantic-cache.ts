/**
 * SEMANTIC CACHE — In-Memory Answer Cache
 *
 * Mục tiêu: 60-70% câu hỏi lặp lại trong 1 phiên tour → trả về 0ms, 0 token.
 *
 * Cơ chế:
 *   - Key = hash của normalized query (loại bỏ dấu tiếng Việt, lowercase, trim)
 *   - Value = câu trả lời đã được xác minh từ RAG hoặc AI
 *   - TTL = 30 phút (thời gian 1 phiên tham quan)
 *   - Max size = 300 entries (mỗi entry ~200 chars ~= 1KB RAM → 300KB tổng)
 *   - Eviction = LRU (Least Recently Used)
 *
 * Chỉ cache câu trả lời từ nguồn đáng tin cậy:
 *   - RAG local (source_authority từ official records)
 *   - AI response đã được kiểm tra guardrail
 * KHÔNG cache:
 *   - Guardrail blocks (mỗi trường hợp cần fresh evaluation)
 *   - Offline fallback errors
 */

import { removeVietnameseDiacritics } from "./shared";

interface CacheEntry {
  answer: string;
  provider: string;
  createdAt: number;
  hitCount: number;
  stationId?: string;
  lang: string;
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 phút
const CACHE_MAX_SIZE = 300;

/** LRU Cache với TTL */
class SemanticCache {
  private store = new Map<string, CacheEntry>();
  private accessOrder: string[] = [];

  /** Loại bỏ dấu tiếng Việt và normalize để tạo cache key ổn định */
  normalizeKey(query: string, lang: string, stationId?: string): string {
    const station = stationId || "general";
    const normalized = removeVietnameseDiacritics(query);
    return `${lang}:${station}:${normalized}`;
  }

  get(key: string): CacheEntry | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    // Kiểm tra TTL
    if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
      this.store.delete(key);
      this.accessOrder = this.accessOrder.filter((k) => k !== key);
      return null;
    }

    // Cập nhật LRU order và hit count
    this.accessOrder = this.accessOrder.filter((k) => k !== key);
    this.accessOrder.push(key);
    entry.hitCount++;
    return entry;
  }

  set(key: string, entry: Omit<CacheEntry, "createdAt" | "hitCount">): void {
    // Evict LRU nếu đầy
    if (this.store.size >= CACHE_MAX_SIZE) {
      const lruKey = this.accessOrder.shift();
      if (lruKey) this.store.delete(lruKey);
    }

    this.store.set(key, { ...entry, createdAt: Date.now(), hitCount: 0 });
    this.accessOrder.push(key);
  }

  /** Stats cho monitoring */
  stats() {
    const now = Date.now();
    const alive = Array.from(this.store.values()).filter(
      (e) => now - e.createdAt < CACHE_TTL_MS
    );
    const totalHits = alive.reduce((sum, e) => sum + e.hitCount, 0);
    return {
      size: alive.length,
      maxSize: CACHE_MAX_SIZE,
      totalHits,
      fillRatio: `${((alive.length / CACHE_MAX_SIZE) * 100).toFixed(1)}%`
    };
  }

  /** Xóa cache của trạm cụ thể (dùng khi admin cập nhật nội dung) */
  invalidateStation(stationId: string): number {
    let cleared = 0;
    for (const [key, entry] of Array.from(this.store.entries())) {
      if (entry.stationId === stationId) {
        this.store.delete(key);
        this.accessOrder = this.accessOrder.filter((k) => k !== key);
        cleared++;
      }
    }
    return cleared;
  }
}

// Singleton — sống suốt vòng đời server process (Next.js hot reload sẽ reset)
export const semanticCache = new SemanticCache();
