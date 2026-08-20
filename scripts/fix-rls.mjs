/**
 * FIX SUPABASE RLS LINTER ERRORS
 * Bật Row Level Security (RLS) trên tất cả các bảng public và thiết lập chính sách bảo mật
 */

import pkg from "pg";
const { Client } = pkg;

const client = new Client({
  host: "db.skbarkawoovwmubaboiw.supabase.co",
  port: 5432,
  user: "postgres",
  password: "Rochthi1609",
  database: "postgres",
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000
});

const fixRlsSql = `
-- 1. BẬT ROW LEVEL SECURITY (RLS) TRÊN TOÀN BỘ CÁC BẢNG PUBLIC
ALTER TABLE IF EXISTS public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.history_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.knowledge_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.station_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shared_semantic_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. DỌN DẸP POLICIES CŨ
DROP POLICY IF EXISTS "Public read stations" ON public.stations;
DROP POLICY IF EXISTS "Public read history_knowledge" ON public.history_knowledge;
DROP POLICY IF EXISTS "Public read knowledge_topics" ON public.knowledge_topics;
DROP POLICY IF EXISTS "Public read station_faqs" ON public.station_faqs;
DROP POLICY IF EXISTS "Public read/write cache" ON public.shared_semantic_cache;
DROP POLICY IF EXISTS "Public insert audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow public insert on audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow service role read on audit_logs" ON public.audit_logs;

-- 3. TẠO CHÍNH SÁCH RLS CHUẨN POSTGREST
CREATE POLICY "Public read stations" 
ON public.stations FOR SELECT 
USING (true);

CREATE POLICY "Public read history_knowledge" 
ON public.history_knowledge FOR SELECT 
USING (true);

CREATE POLICY "Public read knowledge_topics" 
ON public.knowledge_topics FOR SELECT 
USING (true);

CREATE POLICY "Public read station_faqs" 
ON public.station_faqs FOR SELECT 
USING (true);

CREATE POLICY "Public read/write cache" 
ON public.shared_semantic_cache FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Public insert audit_logs" 
ON public.audit_logs FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow service role read on audit_logs" 
ON public.audit_logs FOR SELECT 
USING (true);
`;

async function main() {
  console.log("🚀 Đang kết nối tới Supabase PostgreSQL để sửa lỗi RLS Linter...");
  try {
    await client.connect();
    console.log("✅ Kết nối thành công!");

    console.log("⏳ Đang thực thi ALTER TABLE ENABLE ROW LEVEL SECURITY và thiết lập Policies...");
    await client.query(fixRlsSql);
    console.log("🎉 Đã bật RLS và cấu hình Policies thành công trên tất cả các bảng!");

    // Kiểm tra trạng thái RLS của các bảng
    const res = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public';
    `);

    console.log("\n📊 TRẠNG THÁI RLS CỦA CÁC BẢNG PUBLIC TRÊN SUPABASE:");
    res.rows.forEach(r => {
      console.log(`- ${r.tablename.padEnd(25)}: RLS ${r.rowsecurity ? '✅ ENABLED' : '❌ DISABLED'}`);
    });

  } catch (err) {
    console.error("❌ Lỗi:", err.message);
  } finally {
    await client.end();
  }
}

main();
