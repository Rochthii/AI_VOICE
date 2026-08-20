/**
 * CHI VOICE - SUPABASE DIRECT POSTGRES MIGRATION SCRIPT
 * Thực thi DDL SQL và tạo toàn bộ bảng, indexes, vector extension trực tiếp vào PostgreSQL Supabase
 */

import pkg from "pg";
const { Client } = pkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project Reference: skbarkawoovwmubaboiw
// Database Password: Rochthi1609
const hostCandidates = [
  "db.skbarkawoovwmubaboiw.supabase.co",
  "aws-0-ap-southeast-1.pooler.supabase.com"
];

const schemaSqlPath = path.resolve(__dirname, "../supabase/schema.sql");
const schemaSql = fs.readFileSync(schemaSqlPath, "utf8");

async function tryMigrate() {
  console.log("🚀 Bắt đầu thực thi DDL Migration vào Supabase PostgreSQL...");

  let connected = false;
  let client = null;

  for (const host of hostCandidates) {
    try {
      console.log(`🔌 Đang thử kết nối tới host: ${host}...`);
      client = new Client({
        host: host,
        port: 5432,
        user: "postgres",
        password: "Rochthi1609",
        database: "postgres",
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000
      });

      await client.connect();
      console.log(`✅ Kết nối thành công tới ${host}!`);
      connected = true;
      break;
    } catch (err) {
      console.warn(`⚠️ Không thể kết nối tới ${host}:`, err.message);
    }
  }

  if (!connected || !client) {
    console.error("❌ Không thể kết nối trực tiếp cổng 5432. Vui lòng mở Supabase Dashboard -> SQL Editor và chạy tệp supabase/schema.sql.");
    return false;
  }

  try {
    console.log("⏳ Đang thực thi toàn bộ lệnh trong supabase/schema.sql...");
    await client.query(schemaSql);
    console.log("🎉 Đã tạo thành công bảng 'stations', 'history_knowledge' (pgvector), 'audit_logs' và thiết lập RLS!");
    await client.end();
    return true;
  } catch (err) {
    console.error("❌ Lỗi khi thực thi SQL:", err.message);
    if (client) await client.end();
    return false;
  }
}

tryMigrate().then((success) => {
  if (success) {
    console.log("👉 Đang chạy seed dữ liệu tiếp theo...");
    import("./seed-supabase.mjs");
  }
});
