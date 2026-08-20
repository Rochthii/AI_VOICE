/**
 * CHI VOICE - SUPABASE FIX VECTOR DIMENSION & RE-SEED
 */

import pkg from "pg";
const { Client } = pkg;
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Kết nối PostgreSQL và sửa kiểu vector(10)
async function fixVectorColumn() {
  const client = new Client({
    host: "db.skbarkawoovwmubaboiw.supabase.co",
    port: 5432,
    user: "postgres",
    password: "Rochthi1609",
    database: "postgres",
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log("🔌 Đã kết nối PostgreSQL, đang cập nhật kiểu vector(10)...");

  // Drop index cũ nếu có, đổi type thành vector(10)
  await client.query(`
    DROP INDEX IF EXISTS history_knowledge_embedding_idx;
    ALTER TABLE public.history_knowledge ALTER COLUMN embedding TYPE vector(10);
    CREATE INDEX IF NOT EXISTS history_knowledge_embedding_idx ON public.history_knowledge USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);
  `);
  console.log("✅ Đã cập nhật kiểu vector(10) thành công trong PostgreSQL!");
  await client.end();
}

async function reseed() {
  await fixVectorColumn();

  const envPath = path.resolve(__dirname, "../.env.local");
  const envContent = fs.readFileSync(envPath, "utf8");
  let supabaseUrl = "";
  let serviceRoleKey = "";

  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
      supabaseUrl = trimmed.split("=")[1].trim();
    }
    if (trimmed.startsWith("SUPABASE_SERVICE_ROLE_KEY=")) {
      serviceRoleKey = trimmed.split("=")[1].trim();
    }
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  const knowledgePath = path.resolve(__dirname, "../src/data/history_knowledge.json");
  const knowledgeChunks = JSON.parse(fs.readFileSync(knowledgePath, "utf8"));

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

  console.log("⏳ Đang nạp lại dữ liệu vào 'history_knowledge'...");
  const { data: chunksResult, error: chunksError } = await supabase
    .from("history_knowledge")
    .upsert(formattedChunks, { onConflict: "chunk_id" })
    .select();

  if (chunksError) {
    console.error("❌ Lỗi:", chunksError.message);
  } else {
    console.log(`🎉 ĐÃ NẠP THÀNH CÔNG ${chunksResult.length} RAG KNOWLEDGE CHUNKS VÀO SUPABASE!`);
  }
}

reseed().catch(console.error);
