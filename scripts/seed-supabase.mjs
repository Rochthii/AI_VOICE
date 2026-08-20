/**
 * CHI VOICE - SUPABASE SEEDING SCRIPT
 * Nạp toàn bộ dữ liệu 5 trạm thực địa và RAG knowledge chunks vào Supabase Database
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đọc cấu hình từ .env.local
const envPath = path.resolve(__dirname, "../.env.local");
let supabaseUrl = "";
let serviceRoleKey = "";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
      supabaseUrl = trimmed.split("=")[1].trim();
    }
    if (trimmed.startsWith("SUPABASE_SERVICE_ROLE_KEY=")) {
      serviceRoleKey = trimmed.split("=")[1].trim();
    }
  }
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function main() {
  console.log("🚀 Bắt đầu kết nối và nạp dữ liệu vào Supabase:", supabaseUrl);

  // 1. Đọc dữ liệu từ src/data/stations.json
  const stationsPath = path.resolve(__dirname, "../src/data/stations.json");
  const stations = JSON.parse(fs.readFileSync(stationsPath, "utf8"));
  console.log(`📦 Tìm thấy ${stations.length} trạm di tích để nạp.`);

  // 2. Đọc dữ liệu từ src/data/history_knowledge.json
  const knowledgePath = path.resolve(__dirname, "../src/data/history_knowledge.json");
  const knowledgeChunks = JSON.parse(fs.readFileSync(knowledgePath, "utf8"));
  console.log(`📦 Tìm thấy ${knowledgeChunks.length} RAG knowledge chunks để nạp.`);

  // 3. Upsert vào bảng stations
  console.log("⏳ Đang nạp dữ liệu vào bảng 'stations'...");
  const formattedStations = stations.map((st) => ({
    id: st.id,
    order_index: st.order_index,
    qr_code_key: st.qr_code_key,
    title: st.title,
    short_summary: st.short_summary,
    safety: st.safety,
    human_story_hook: st.human_story_hook,
    audio_assets: st.audio_assets,
    key_facts: st.key_facts,
    faqs: st.faqs
  }));

  const { data: stationsResult, error: stationsError } = await supabase
    .from("stations")
    .upsert(formattedStations, { onConflict: "id" })
    .select();

  if (stationsError) {
    console.error("⚠️ Lỗi khi nạp stations (Bảng có thể chưa được tạo trong Supabase SQL Editor):", stationsError.message);
  } else {
    console.log(`✅ Đã nạp thành công ${stationsResult.length} trạm vào bảng 'stations'!`);
  }

  // 4. Upsert vào bảng history_knowledge
  console.log("⏳ Đang nạp dữ liệu vào bảng 'history_knowledge'...");
  const formattedChunks = knowledgeChunks.map((ch) => ({
    chunk_id: ch.chunk_id,
    location_id: ch.location_id === "general" ? null : ch.location_id,
    category: ch.category,
    content_vi: ch.content_vi,
    content_en: ch.content_en,
    keywords: ch.keywords,
    embedding: ch.embedding,
    source_authority: ch.source_authority
  }));

  const { data: chunksResult, error: chunksError } = await supabase
    .from("history_knowledge")
    .upsert(formattedChunks, { onConflict: "chunk_id" })
    .select();

  if (chunksError) {
    console.error("⚠️ Lỗi khi nạp history_knowledge:", chunksError.message);
  } else {
    console.log(`✅ Đã nạp thành công ${chunksResult.length} chunks vào bảng 'history_knowledge'!`);
  }

  console.log("🏁 Hoàn tất tiến trình kiểm tra Supabase!");
}

main().catch((err) => {
  console.error("❌ Exception:", err);
  process.exit(1);
});
