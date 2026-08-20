# 📝 CHANGELOG: CHI VOICE

Tất cả các thay đổi đáng chú ý của dự án sẽ được ghi nhận tại tài liệu này theo định dạng [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.6.0-release] - 2026-08-20

### Added - Tích Hợp Toàn Diện Supabase Cloud & Hoàn Thiện Sonic Monolith UI
- **Tích hợp Supabase Cloud Database & RAG Vector:**
  * Cấu hình biến môi trường an toàn `.env.local` (Bảo mật tuyệt đối, không hardcode API trong code, nằm trong `.gitignore`).
  * Thực thi migration DDL SQL trên PostgreSQL (`db.skbarkawoovwmubaboiw.supabase.co`).
  * Tạo thành công bảng `stations`, bảng `history_knowledge` hỗ trợ `vector(10)` và bảng `audit_logs` kiểm toán bất biến.
  * Đã nạp thành công 5 trạm thực tế và 21 RAG knowledge chunks vào Supabase Database.
- **Hoàn thiện Giao diện Độc bản Sonic Monolith UI (Zero-Scroll 100vh):**
  * [`src/components/SafetyBeacon.tsx`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/src/components/SafetyBeacon.tsx) (Zone 1: 20vh - Thông số độ dài hầm, thời gian di chuyển, lối thoát gần nhất, chuyển đổi song ngữ VI/EN).
  * [`src/components/SonicOrb.tsx`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/src/components/SonicOrb.tsx) (Zone 2: 50vh - Quả Cầu Âm Bản 220px tương tác khổng lồ, Web Speech STT, Canvas FFT).
  * [`src/components/CinemaTicker.tsx`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/src/components/CinemaTicker.tsx) (Zone 3: 30vh - Phụ đề điện ảnh 1 dòng, Audio timeline, thanh chọn 5 trạm).
  * [`src/components/PanicModal.tsx`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/src/components/PanicModal.tsx) (Chế độ cứu hộ khẩn cấp Panic Triple-Tap với đèn dạ quang `#2DD4BF`).
  * [`src/app/page.tsx`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/src/app/page.tsx) & [`src/app/layout.tsx`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/src/app/layout.tsx).
- **Hoàn thành Lõi Audio Engine & API Route:**
  * [`src/lib/audio-engine.ts`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/src/lib/audio-engine.ts) (Singleton Web Audio, Silent unlock iOS, MediaSession chạy ngầm túi quần, ngắt khẩn cấp khi rơi tai nghe).
  * [`src/lib/rag-engine.ts`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/src/lib/rag-engine.ts) (In-Memory Cosine Math 15 dòng, quét RAM $< 0.2\text{ms}$).
  * [`src/lib/supabase.ts`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/src/lib/supabase.ts) & [`src/app/api/ask/route.ts`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/src/app/api/ask/route.ts).

---

## [0.5.2-beta] - 2026-08-20
### Added
- Thiết lập cơ chế phản biện chống ảo giác, kích động và xuyên tạc lịch sử (3-Tier Historical Guardrail & Anti-Revisionism Engine).

---

## [0.5.1-beta] - 2026-08-20
### Changed
- Đồng bộ toàn bộ tài liệu kỹ thuật, dữ liệu 5 trạm và khởi tạo Agent Skill cuchi-rag-historian.
