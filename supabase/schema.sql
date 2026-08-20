-- ==============================================================================
-- CHI VOICE - ENTERPRISE PRODUCTION DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Kiến trúc Database Chuẩn mực: pgvector Semantic Search, Full-Text Search,
-- Đa ngôn ngữ, RLS Bảo Mật Cấp Doanh Nghiệp, Audit Bất Biến và Dynamic Cache
-- ==============================================================================

-- 0. KÍCH HOẠT EXTENSIONS CẦN THIẾT
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------------------------
-- 1. BẢNG DANH MỤC CHỦ ĐỀ SỬ LIỆU (KNOWLEDGE TOPICS)
-- Phân loại có cấu trúc: Bếp Hoàng Cầm, Y tế, Chỉ huy, Thông khí, Bẫy chông, Liệt sĩ
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.knowledge_topics (
  id TEXT PRIMARY KEY,                           -- 'kitchen', 'hospital', 'command', 'ventilation', 'traps', 'overview', 'sacred'
  code VARCHAR(50) UNIQUE NOT NULL,
  title JSONB NOT NULL,                          -- {"vi": "Bếp Hoàng Cầm", "en": "Hoang Cam Stove", "fr": "...", "ja": "...", "ko": "...", "zh": "..."}
  description JSONB,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. BẢNG QUẢN LÝ CÁC TRẠM DI TÍCH THỰC ĐỊA (STATIONS)
-- Quản lý tọa độ, thông số hầm, độ sâu, lối thoát hiểm, media assets
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stations (
  id TEXT PRIMARY KEY,                           -- '01_hoang_cam_kitchen', '02_field_hospital', ...
  order_index INT NOT NULL UNIQUE,
  qr_code_key VARCHAR(100) UNIQUE NOT NULL,     -- Khóa định danh mã QR in thực địa
  topic_id TEXT REFERENCES public.knowledge_topics(id) ON DELETE SET NULL,
  title JSONB NOT NULL,                          -- Đa ngôn ngữ {"vi": "...", "en": "...", "fr": "...", ...}
  short_summary JSONB NOT NULL,
  human_story_hook JSONB NOT NULL,               -- Câu chuyện con người mở đầu
  
  -- Thông số kỹ thuật hầm ngầm & an toàn sinh trắc
  tunnel_length_meters NUMERIC(6,2) NOT NULL DEFAULT 0,
  avg_crawl_time_minutes NUMERIC(4,1) NOT NULL DEFAULT 0,
  ceiling_height_meters NUMERIC(4,2) NOT NULL DEFAULT 0,
  tunnel_depth_level INT NOT NULL DEFAULT 1,     -- Tầng 1 (~3m), Tầng 2 (5-8m), Tầng 3 (8-12m)
  difficulty_level VARCHAR(20) NOT NULL DEFAULT 'easy' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  emergency_exit_note JSONB NOT NULL,            -- Hướng dẫn lối thoát hiểm
  reassurance_message JSONB NOT NULL,            -- Lời trấn an du khách
  
  -- Tài nguyên đa phương tiện (Audio đa ngôn ngữ, hình ảnh sơ đồ hầm)
  audio_assets JSONB NOT NULL DEFAULT '{}'::jsonb,
  diagram_url TEXT,
  key_facts JSONB NOT NULL DEFAULT '[]'::jsonb,  -- Mảng sự thật lịch sử đã kiểm chứng
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. BẢNG TRI THỨC SỬ LIỆU NGUYÊN TỬ (HISTORY KNOWLEDGE CHUNKS)
-- Lưu trữ từng đoạn văn sử liệu chuẩn xác, nguồn bảo chứng và vector embedding
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.history_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id VARCHAR(100) UNIQUE NOT NULL,         -- 'chunk_kitchen_smoke_01'
  station_id TEXT REFERENCES public.stations(id) ON DELETE CASCADE,
  topic_id TEXT REFERENCES public.knowledge_topics(id) ON DELETE SET NULL,
  
  -- Nội dung đa ngôn ngữ
  content_vi TEXT NOT NULL,
  content_en TEXT NOT NULL,
  content_translations JSONB DEFAULT '{}'::jsonb, -- {"fr": "...", "ja": "...", "ko": "...", "zh": "..."}
  
  -- Từ khóa tìm kiếm & Phân tích
  keywords TEXT[] NOT NULL DEFAULT '{}',
  
  -- Vector Embedding cho RAG Semantic Search (1536 chiều cho OpenAI/Gemini hoặc 768/384)
  embedding vector(1536),
  embedding_fast vector(10),                     -- Float32 Vector 10 chiều cho Lightweight In-Memory Match
  
  -- Nguồn tài liệu bảo chứng (1 trong 7 văn khố chính thức)
  source_authority TEXT NOT NULL,
  historical_period VARCHAR(100) DEFAULT '1961-1975',
  confidence_level NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  
  is_verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. BẢNG CÂU HỎI THƯỜNG GẶP THỰC ĐỊA (STATION FAQS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.station_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id TEXT NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  question JSONB NOT NULL,                       -- {"vi": "...", "en": "..."}
  answer JSONB NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  priority_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. BẢNG SEMANTIC CACHE TRÊN CLOUD (SHARED ANSWER CACHE)
-- Cho phép chia sẻ cache giữa hàng nghìn du khách trên toàn khu di tích
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shared_semantic_cache (
  cache_key TEXT PRIMARY KEY,                    -- 'vi:01_kitchen:bep hoang cam giau khoi the nao'
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
-- Ghi nhận lịch sử tương tác: Who, Did what, When, From where, Provider, Latency
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,                               -- Mã phiên du khách
  station_id TEXT,
  user_query TEXT NOT NULL,
  response_text TEXT NOT NULL,
  matched_chunk_id TEXT,
  confidence_score NUMERIC(4,3),
  
  -- Phân loại an toàn & Guardrail
  guardrail_decision TEXT NOT NULL,              -- 'SAFE', 'PROVOCATION_INTERCEPTED', 'JAILBREAK_ATTEMPT', 'AI_STREAM', 'RAG_HIT'
  source_authority TEXT,
  provider_used VARCHAR(50),                     -- 'groq_mini_1', 'gemini_flash_1', 'rag_local', 'cache'
  latency_ms INT,
  tokens_used INT,
  
  -- Thông tin thiết bị & Vị trí
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
CREATE INDEX IF NOT EXISTS idx_knowledge_station ON public.history_knowledge (station_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_topic ON public.history_knowledge (topic_id);
CREATE INDEX IF NOT EXISTS idx_faqs_station ON public.station_faqs (station_id, priority_index);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_station ON public.audit_logs (station_id);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON public.shared_semantic_cache (expires_at);

-- GIN Index tìm kiếm từ khóa cực nhanh
CREATE INDEX IF NOT EXISTS idx_knowledge_keywords_gin ON public.history_knowledge USING GIN (keywords);

-- ------------------------------------------------------------------------------
-- 8. HÀM TÌM KIẾM VECTOR SEMANTIC SEARCH (POSTGRESQL RPC)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.match_historical_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.70,
  match_count int DEFAULT 3,
  filter_station_id text DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  chunk_id VARCHAR(100),
  station_id TEXT,
  content_vi TEXT,
  content_en TEXT,
  source_authority TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    hk.id,
    hk.chunk_id,
    hk.station_id,
    hk.content_vi,
    hk.content_en,
    hk.source_authority,
    1 - (hk.embedding <=> query_embedding) AS similarity
  FROM public.history_knowledge hk
  WHERE
    (filter_station_id IS NULL OR hk.station_id = filter_station_id)
    AND (1 - (hk.embedding <=> query_embedding)) >= match_threshold
  ORDER BY hk.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ------------------------------------------------------------------------------
-- 9. CHÍNH SÁCH BẢO MẬT HÀNG (ROW LEVEL SECURITY - RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.knowledge_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_semantic_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Công khai chỉ đọc cho du khách (Anonymous Read-only)
CREATE POLICY "Public read knowledge_topics" ON public.knowledge_topics FOR SELECT USING (is_active = true);
CREATE POLICY "Public read stations" ON public.stations FOR SELECT USING (is_active = true);
CREATE POLICY "Public read history_knowledge" ON public.history_knowledge FOR SELECT USING (is_verified = true);
CREATE POLICY "Public read station_faqs" ON public.station_faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Public read/write cache" ON public.shared_semantic_cache FOR ALL USING (true) WITH CHECK (true);

-- Bảng Audit Logs: Chỉ cho phép ghi (INSERT), cấm xóa sửa tuyệt đối (Immutable)
CREATE POLICY "Public insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read audit_logs" ON public.audit_logs FOR SELECT USING (auth.role() = 'service_role');
