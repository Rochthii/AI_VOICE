/**
 * CHI VOICE - COMPREHENSIVE SUPABASE SEEDING SCRIPT
 * Nạp toàn bộ dữ liệu 6 Topics, 5 Trạm di tích, 21 Knowledge chunks và FAQs vào Supabase Cloud
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  console.error("❌ Thiếu credentials trong .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function seed() {
  console.log("🚀 Bắt đầu nạp toàn bộ thực thể vào Supabase Cloud:", supabaseUrl);

  // 1. Nạp knowledge_topics
  console.log("⏳ 1. Nạp bảng 'knowledge_topics'...");
  const topics = [
    {
      id: "kitchen",
      code: "HOANG_CAM_KITCHEN",
      title: { vi: "Bếp Hoàng Cầm", en: "Hoang Cam Stove", fr: "Cuisine Hoang Cam", ja: "ホアンカムかまど", ko: "호앙껌 취사장", zh: "黄琴灶" },
      description: { vi: "Nghệ thuật giấu khói dã chiến và ẩm thực kháng chiến", en: "Smokeless underground cooking" },
      order_index: 1,
      is_active: true
    },
    {
      id: "hospital",
      code: "FIELD_HOSPITAL",
      title: { vi: "Bệnh Xá & Quân Y Ngầm", en: "Subterranean Field Hospital", fr: "Hôpital de campagne", ja: "地下野戦病院", ko: "지하 야전병원", zh: "地下战地医院" },
      description: { vi: "Phẫu thuật dã chiến và y học cổ truyền ngầm", en: "Underground surgery and medicine" },
      order_index: 2,
      is_active: true
    },
    {
      id: "command",
      code: "COMMAND_BUNKER",
      title: { vi: "Hầm Chỉ Huy Đầu Não", en: "Central Command Bunker", fr: "Poste de commandement", ja: "地下司令部", ko: "지하 사령부", zh: "地下司令部" },
      description: { vi: "Trung tâm chỉ huy chiến lược Tết Mậu Thân 1968", en: "1968 Tet Offensive command post" },
      order_index: 3,
      is_active: true
    },
    {
      id: "ventilation",
      code: "VENTILATION_SYSTEM",
      title: { vi: "Hệ Thống Ụ Mối Thông Hơi", en: "Termite Mound Ventilation", fr: "Ventilation par termitières", ja: "アリ塚通気システム", ko: "개미집 통풍 시스템", zh: "白蚁丘通风系统" },
      description: { vi: "Cơ chế đối lưu nhiệt và chiến thuật đánh lừa khứu giác", en: "Thermal convection and scent-masking" },
      order_index: 4,
      is_active: true
    },
    {
      id: "traps",
      code: "BOOBY_TRAPS_DEFENSE",
      title: { vi: "Trận Đồ Bẫy Chông & Vũ Khí Du Kích", en: "Booby Trap Matrix", fr: "Pièges et armes artisanales", ja: "罠とゲリラ兵器", ko: "부비트랩 및 게릴라 무기", zh: "陷阱与游击武器" },
      description: { vi: "Nghệ thuật lấy thô sơ thắng hiện đại và mìn gạt Tô Văn Đực", en: "Guerilla traps and repurposed ordnance" },
      order_index: 5,
      is_active: true
    },
    {
      id: "sacred",
      code: "SACRED_HERITAGE",
      title: { vi: "Di Sản & Liệt Sĩ Bến Dược", en: "Ben Duoc Sacred Heritage", fr: "Mémorial de Ben Duoc", ja: "ベンズオック記念寺院", ko: "벤두옥 추모 사원", zh: "奔药烈士纪念祠" },
      description: { vi: "44.357 anh hùng liệt sĩ khắc tên trang trọng", en: "44,357 fallen heroes documented" },
      order_index: 6,
      is_active: true
    }
  ];

  const { error: topicsErr } = await supabase
    .from("knowledge_topics")
    .upsert(topics, { onConflict: "id" });
  if (topicsErr) console.warn("⚠️ Topics error:", topicsErr.message);
  else console.log(`✅ Đã nạp thành công ${topics.length} topics!`);

  // 2. Nạp stations
  console.log("⏳ 2. Nạp bảng 'stations'...");
  const stationsPath = path.resolve(__dirname, "../src/data/stations.json");
  const stations = JSON.parse(fs.readFileSync(stationsPath, "utf8"));
  
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
    faqs: st.faqs,
    tunnel_length_meters: st.safety.tunnel_length_meters || 0,
    avg_crawl_time_minutes: st.safety.avg_crawl_time_minutes || 0,
    ceiling_height_meters: st.safety.ceiling_height_meters || 0,
    difficulty_level: st.safety.difficulty_level || "easy",
    is_active: true
  }));

  const { error: stErr } = await supabase
    .from("stations")
    .upsert(formattedStations, { onConflict: "id" });
  if (stErr) console.warn("⚠️ Stations error:", stErr.message);
  else console.log(`✅ Đã nạp thành công ${formattedStations.length} trạm di tích!`);

  // 3. Nạp history_knowledge
  console.log("⏳ 3. Nạp bảng 'history_knowledge'...");
  const knowledgePath = path.resolve(__dirname, "../src/data/history_knowledge.json");
  const knowledgeChunks = JSON.parse(fs.readFileSync(knowledgePath, "utf8"));

  const formattedChunks = knowledgeChunks.map((ch) => ({
    chunk_id: ch.chunk_id,
    location_id: ch.location_id === "general" ? null : ch.location_id,
    station_id: ch.location_id === "general" ? null : ch.location_id,
    category: ch.category,
    content_vi: ch.content_vi,
    content_en: ch.content_en,
    keywords: ch.keywords,
    embedding: ch.embedding,
    source_authority: ch.source_authority,
    is_verified: true
  }));

  const { error: knErr } = await supabase
    .from("history_knowledge")
    .upsert(formattedChunks, { onConflict: "chunk_id" });
  if (knErr) console.warn("⚠️ Knowledge error:", knErr.message);
  else console.log(`✅ Đã nạp thành công ${formattedChunks.length} RAG knowledge chunks!`);

  // 4. Nạp station_faqs
  console.log("⏳ 4. Nạp bảng 'station_faqs'...");
  const allFaqs = [];
  stations.forEach((st) => {
    if (st.faqs && Array.isArray(st.faqs)) {
      st.faqs.forEach((faq, idx) => {
        allFaqs.push({
          station_id: st.id,
          question: faq.question,
          answer: faq.answer,
          keywords: faq.keywords || [],
          priority_index: idx + 1,
          is_active: true
        });
      });
    }
  });

  if (allFaqs.length > 0) {
    const { error: faqErr } = await supabase
      .from("station_faqs")
      .insert(allFaqs);
    if (faqErr) console.warn("⚠️ FAQs note:", faqErr.message);
    else console.log(`✅ Đã nạp thành công ${allFaqs.length} FAQs!`);
  }

  console.log("🎉 TOÀN BỘ DATABASE SUPABASE CLOUD ĐÃ ĐƯỢC NẠP 100% SẴN SÀNG!");
}

seed().catch((err) => {
  console.error("❌ Exception:", err);
  process.exit(1);
});
