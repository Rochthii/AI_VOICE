/**
 * CHI VOICE - SUPABASE CLIENT & AUDIT LOGGING ENGINE
 * Quản lý kết nối Supabase, ghi nhật ký tương tác bất biến (Immutable Audit Logs)
 * và đồng bộ trạng thái khi có kết nối mạng.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Locale } from "@/types/station";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false }
      });
      return supabaseInstance;
    } catch (err) {
      console.warn("[Supabase] Initialization failed:", err);
      return null;
    }
  }

  return null;
}

export interface AuditLogEntry {
  stationId?: string;
  userQuery: string;
  responseText: string;
  matchedChunkId?: string;
  confidenceScore?: number;
  guardrailDecision: "SAFE" | "PROVOCATION_INTERCEPTED" | "LOW_SIMILARITY_FALLBACK" | "JAILBREAK_ATTEMPT";
  sourceAuthority?: string;
  clientIp?: string;
  userAgent?: string;
  locale: Locale;
}

/**
 * Ghi nhật ký kiểm toán bất biến (Immutable Audit Log) lên Supabase
 * Tự động bỏ qua nếu offline hoặc chưa cấu hình Supabase mà không làm gián đoạn người dùng.
 */
export async function recordAuditLog(entry: AuditLogEntry): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    // Nếu chưa cấu hình Supabase, ghi nhận log cục bộ ra console phục vụ debug
    console.info("[Audit Log Local]:", JSON.stringify(entry));
    return;
  }

  try {
    const { error } = await supabase.from("audit_logs").insert([
      {
        station_id: entry.stationId || null,
        user_query: entry.userQuery,
        response_text: entry.responseText,
        matched_chunk_id: entry.matchedChunkId || null,
        confidence_score: entry.confidenceScore || null,
        guardrail_decision: entry.guardrailDecision,
        source_authority: entry.sourceAuthority || null,
        client_ip: entry.clientIp || "0.0.0.0",
        user_agent: entry.userAgent || "CHI-Voice-Client",
        locale: entry.locale
      }
    ]);

    if (error) {
      console.warn("[Supabase Audit Error]:", error.message);
    }
  } catch (err) {
    console.warn("[Supabase Audit Exception]:", err);
  }
}
