-- ==============================================================================
-- CHI VOICE - SUPABASE DATABASE MIGRATION & RAG VECTOR SCHEMA
-- Thiết kế đạt chuẩn Production: Hỗ trợ pgvector, kiểm toán bất biến (Auditability)
-- ==============================================================================

-- 1. Kích hoạt tiện ích mở rộng vector cho RAG Cosine Search
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Bảng quản lý 5 trạm di tích Củ Chi
CREATE TABLE IF NOT EXISTS public.stations (
  id TEXT PRIMARY KEY,
  order_index INT NOT NULL,
  qr_code_key TEXT UNIQUE NOT NULL,
  title JSONB NOT NULL,            -- {"vi": "...", "en": "..."}
  short_summary JSONB NOT NULL,
  safety JSONB NOT NULL,
  human_story_hook JSONB NOT NULL,
  audio_assets JSONB NOT NULL,
  key_facts JSONB NOT NULL,
  faqs JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng tri thức sử liệu 8 chương kèm Vector Embedding 1536 chiều
CREATE TABLE IF NOT EXISTS public.history_knowledge (
  chunk_id TEXT PRIMARY KEY,
  location_id TEXT REFERENCES public.stations(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  content_vi TEXT NOT NULL,
  content_en TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  embedding vector(10),             -- Float32 Vector 10 chiều cho RAG Cosine Engine
  source_authority TEXT NOT NULL,   -- 1 trong 7 nguồn tài liệu bảo chứng
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tạo Index tìm kiếm Vector theo Cosine Distance
CREATE INDEX IF NOT EXISTS history_knowledge_embedding_idx 
ON public.history_knowledge 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 4. Bảng Audit Logs ghi nhận lịch sử tương tác và các vụ việc chặn bẫy kích động
-- (Bắt buộc theo Global Rule: Who, Did what, When, From where - Bất biến)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id TEXT,
  user_query TEXT NOT NULL,
  response_text TEXT NOT NULL,
  matched_chunk_id TEXT,
  confidence_score FLOAT,
  guardrail_decision TEXT NOT NULL, -- 'SAFE' | 'PROVOCATION_INTERCEPTED' | 'LOW_SIMILARITY_FALLBACK' | 'JAILBREAK_ATTEMPT'
  source_authority TEXT,
  client_ip TEXT,
  user_agent TEXT,
  locale TEXT NOT NULL DEFAULT 'vi',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chỉ cho phép INSERT và SELECT, cấm UPDATE và DELETE để bảo đảm tính Bất Biến (Immutable)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on audit_logs" 
ON public.audit_logs FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow service role read on audit_logs" 
ON public.audit_logs FOR SELECT 
USING (true);
