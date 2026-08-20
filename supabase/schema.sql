-- ==============================================================================
-- CHI VOICE - ENTERPRISE PRODUCTION DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Thiết kế tương thích 100% (Idempotent & Safe Migration)
-- ==============================================================================

-- 0. KÍCH HOẠT EXTENSIONS CẦN THIẾT
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------------------------
-- 1. BẢNG DANH MỤC CHỦ ĐỀ SỬ LIỆU (KNOWLEDGE TOPICS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.knowledge_topics (
  id TEXT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  title JSONB NOT NULL,
  description JSONB,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. BẢNG QUẢN LÝ CÁC TRẠM DI TÍCH THỰC ĐỊA (STATIONS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stations (
  id TEXT PRIMARY KEY,
  order_index INT NOT NULL,
  qr_code_key VARCHAR(100) UNIQUE NOT NULL,
  title JSONB NOT NULL,
  short_summary JSONB NOT NULL,
  safety JSONB NOT NULL,
  human_story_hook JSONB NOT NULL,
  audio_assets JSONB NOT NULL DEFAULT '{}'::jsonb,
  key_facts JSONB NOT NULL DEFAULT '[]'::jsonb,
  faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Thêm các cột nâng cao nếu chưa có
ALTER TABLE public.stations ADD COLUMN IF NOT EXISTS topic_id TEXT REFERENCES public.knowledge_topics(id) ON DELETE SET NULL;
ALTER TABLE public.stations ADD COLUMN IF NOT EXISTS tunnel_length_meters NUMERIC(6,2) DEFAULT 0;
ALTER TABLE public.stations ADD COLUMN IF NOT EXISTS avg_crawl_time_minutes NUMERIC(4,1) DEFAULT 0;
ALTER TABLE public.stations ADD COLUMN IF NOT EXISTS ceiling_height_meters NUMERIC(4,2) DEFAULT 0;
ALTER TABLE public.stations ADD COLUMN IF NOT EXISTS tunnel_depth_level INT DEFAULT 1;
ALTER TABLE public.stations ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) DEFAULT 'easy';
ALTER TABLE public.stations ADD COLUMN IF NOT EXISTS diagram_url TEXT;
ALTER TABLE public.stations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ------------------------------------------------------------------------------
-- 3. BẢNG TRI THỨC SỬ LIỆU NGUYÊN TỬ (HISTORY KNOWLEDGE)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.history_knowledge (
  chunk_id TEXT PRIMARY KEY,
  location_id TEXT REFERENCES public.stations(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  content_vi TEXT NOT NULL,
  content_en TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  embedding vector(10),
  source_authority TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Thêm các cột nâng cao an toàn
ALTER TABLE public.history_knowledge ADD COLUMN IF NOT EXISTS station_id TEXT;
ALTER TABLE public.history_knowledge ADD COLUMN IF NOT EXISTS topic_id TEXT;
ALTER TABLE public.history_knowledge ADD COLUMN IF NOT EXISTS content_translations JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.history_knowledge ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true;
ALTER TABLE public.history_knowledge ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ------------------------------------------------------------------------------
-- 4. BẢNG CÂU HỎI THƯỜNG GẶP THỰC ĐỊA (STATION FAQS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.station_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id TEXT NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  question JSONB NOT NULL,
  answer JSONB NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  priority_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. BẢNG SEMANTIC CACHE TRÊN CLOUD (SHARED ANSWER CACHE)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shared_semantic_cache (
  cache_key TEXT PRIMARY KEY,
  normalized_query TEXT NOT NULL,
  station_id TEXT,
  locale VARCHAR(10) NOT NULL DEFAULT 'vi',
  answer TEXT NOT NULL,
  provider VARCHAR(50) NOT NULL,
  hit_count INT NOT NULL DEFAULT 1,
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. BẢNG KIỂM TOÁN BẤT BIẾN (IMMUTABLE AUDIT LOGS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  station_id TEXT,
  user_query TEXT NOT NULL,
  response_text TEXT NOT NULL,
  matched_chunk_id TEXT,
  confidence_score NUMERIC(4,3),
  guardrail_decision TEXT NOT NULL,
  source_authority TEXT,
  provider_used VARCHAR(50),
  latency_ms INT,
  tokens_used INT,
  client_ip TEXT NOT NULL DEFAULT '0.0.0.0',
  user_agent TEXT NOT NULL DEFAULT 'CHI-Voice-Client',
  locale VARCHAR(10) NOT NULL DEFAULT 'vi',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. CHỈ MỤC INDEXES TỐI ƯU TRUY VẤN
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_stations_order ON public.stations (order_index);
CREATE INDEX IF NOT EXISTS idx_stations_qr ON public.stations (qr_code_key);
CREATE INDEX IF NOT EXISTS idx_knowledge_location ON public.history_knowledge (location_id);
CREATE INDEX IF NOT EXISTS idx_faqs_station ON public.station_faqs (station_id, priority_index);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_station ON public.audit_logs (station_id);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON public.shared_semantic_cache (expires_at);

-- GIN Index tìm kiếm từ khóa cực nhanh
CREATE INDEX IF NOT EXISTS idx_knowledge_keywords_gin ON public.history_knowledge USING GIN (keywords);

-- ------------------------------------------------------------------------------
-- 8. CHÍNH SÁCH BẢO MẬT HÀNG (ROW LEVEL SECURITY - RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.knowledge_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_semantic_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Dọn dẹp policies cũ nếu có để tránh trùng
DROP POLICY IF EXISTS "Public read knowledge_topics" ON public.knowledge_topics;
DROP POLICY IF EXISTS "Public read stations" ON public.stations;
DROP POLICY IF EXISTS "Public read history_knowledge" ON public.history_knowledge;
DROP POLICY IF EXISTS "Public read station_faqs" ON public.station_faqs;
DROP POLICY IF EXISTS "Public read/write cache" ON public.shared_semantic_cache;
DROP POLICY IF EXISTS "Public insert audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow public insert on audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow service role read on audit_logs" ON public.audit_logs;

-- Tạo Policies mới
CREATE POLICY "Public read knowledge_topics" ON public.knowledge_topics FOR SELECT USING (is_active = true);
CREATE POLICY "Public read stations" ON public.stations FOR SELECT USING (is_active = true);
CREATE POLICY "Public read history_knowledge" ON public.history_knowledge FOR SELECT USING (is_verified = true);
CREATE POLICY "Public read station_faqs" ON public.station_faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Public read/write cache" ON public.shared_semantic_cache FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role read on audit_logs" ON public.audit_logs FOR SELECT USING (true);
