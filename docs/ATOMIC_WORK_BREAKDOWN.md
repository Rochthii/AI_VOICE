# 🔬 BẢN PHÂN RÃ CÔNG VIỆC NGUYÊN TỬ (ATOMIC WORK BREAKDOWN)
### *Dự án: CHI VOICE — Kế Hoạch Thực Thi Từng Nhiệm Vụ Siêu Nhỏ (Micro-Tasks)*

Tài liệu này chia nhỏ toàn bộ quá trình xây dựng bản **CHI VOICE** thành **6 Phase tuần tự** với **36 Micro-Tasks nguyên tử** (mỗi task thực hiện trong $5 - 15\text{ phút}$, có tiêu chí kiểm định độc lập).

---

```
┌────────────────────────────────────────────────────────────────────────┐
│                     LỘ TRÌNH 6 PHASE NGUYÊN TỬ                         │
├──────────────────────────┬──────────────────────────┬──────────────────┤
│ Phase 1: Foundation (7)  │ Phase 2: Real Data (6)   │ Phase 3: Engines │
│ Phase 4: UI Monolith (8) │ Phase 5: Routing/API (5) │ Phase 6: PWA/Test│
└──────────────────────────┴──────────────────────────┴──────────────────┘
```

---

## 🏗️ PHASE 1: NỀN MÓNG & THIẾT LẬP GIAO DIỆN (30 PHÚT) - [✅ HOÀN TẤT 100%]
*Mục tiêu:* Thiết lập môi trường Next.js 14, TypeScript Strict, hệ thống Token màu thực địa và Types an toàn.

* [x] **Task 1.1:** Tạo `package.json` với Next.js 14, React 18, Tailwind CSS, Lucide Icons, clsx, tailwind-merge, @supabase/supabase-js.
* [x] **Task 1.2:** Tạo `tsconfig.json` bật `strict: true`, cấu hình import alias `@/*` tuyệt đối.
* [x] **Task 1.3:** Tạo `tailwind.config.ts` cấu hình đầy đủ bảng màu độc bản (Bazan Noir `#0D0E11`, Amber `#E5A93C`, Jade `#2DD4BF`, Rust, Chalk).
* [x] **Task 1.4:** Tạo `postcss.config.mjs` và `next.config.mjs`.
* [x] **Task 1.5:** Tạo `src/app/globals.css` (Khóa cứng Zero-Scroll 100vh, Dark OLED, ẩn scrollbar, 3D Gyroscope & Obsidian shading).
* [x] **Task 1.6:** Tạo `src/types/station.ts` (TypeScript interfaces Station, Safety, AudioAssets, FAQ).
* [x] **Task 1.7:** Tạo `src/types/rag.ts` (TypeScript interfaces HistoryChunk, RAGMatchResult, QueryPayload).

---

## 📜 PHASE 2: SỬ LIỆU THẬT 100% CỦA 5 TRẠM CỦ CHI (30 PHÚT) - [✅ HOÀN TẤT 100%]
*Mục tiêu:* Đóng gói toàn bộ sử liệu chính thức, thông số an toàn không gian ngầm và RAG Chunks từ 7 nguồn tài liệu bảo chứng.

* [x] **Task 2.1:** Tạo `src/data/stations.json` - Trạm 01: **Bếp Hoàng Cầm** (Tầng 2 sâu 5-8m, dài 15m, cao 1.4m, bò 2p, rãnh giấu khói dã chiến).
* [x] **Task 2.2:** Trạm 02: **Bệnh Xá & Hầm Phẫu Thuật** (Tầng 2 sâu 5-8m, dài 10m, lom khom 3p, Bác sĩ Võ Hoàng Lê & cấy Filatov).
* [x] **Task 2.3:** Trạm 03: **Hầm Chỉ Huy Đầu Não** (Tầng 3 sâu 8-12m, dài 25m, nút chặn cô lập khí độc, mép sông Sài Gòn, Tết Mậu Thân 1968).
* [x] **Task 2.4:** Trạm 04: **Lỗ Thông Hơi Ụ Mối** (Dài 18m, cao 0.8m, ống tre đối lưu tự nhiên, xà phòng Mỹ đánh lừa chó béc-giê).
* [x] **Task 2.5:** Trạm 05: **Trận Đồ Bẫy Chông** (Mặt đất thoáng mát, chông cánh cửa, chông nắp tự động, mìn gạt Anh hùng Tô Văn Đực).
* [x] **Task 2.6:** Tạo `src/data/history_knowledge.json`: Toàn bộ 21 mẩu sử liệu chi tiết kèm từ khóa, vector Float32 và nguồn bảo chứng.

---

## ⚡ PHASE 3: LÕI AUDIO ENGINE, RAG IN-MEMORY & SUPABASE CLOUD - [✅ HOÀN TẤT 100%]
*Mục tiêu:* Xây dựng Singleton Web Audio, MediaSession chạy ngầm túi quần, RAG Cosine và Supabase PostgreSQL `pgvector`.

* [x] **Task 3.1:** Tạo `src/lib/audio-engine.ts`: Khởi tạo Singleton `AudioContext` và `HTMLAudioElement` cho toàn ứng dụng.
* [x] **Task 3.2:** Viết hàm `unlockAudioContext()`: Mở khóa quyền tự phát âm thanh Safari iOS bằng Silent Buffer.
* [x] **Task 3.3:** Viết hàm `playBambooClickSound()`: Dùng `OscillatorNode` sinh tiếng gõ mõ tre $120\text{Hz}$ dã chiến.
* [x] **Task 3.4:** Tích hợp `navigator.mediaSession` điều khiển âm thanh trên màn hình khóa điện thoại khi bỏ túi quần.
* [x] **Task 3.5:** Tự động tạm dừng khẩn cấp trong $10\text{ms}$ khi rơi tai nghe Bluetooth (`devicechange`).
* [x] **Task 3.6:** Tạo `src/lib/rag-engine.ts`: Viết thuật toán **Cosine Similarity Float32 toán thuần 15 dòng** (quét trong $< 0.2\text{ms}$).
* [x] **Task 3.7:** Tạo `src/lib/guardrails.ts`: Bộ lọc phản biện 5 nhóm bẫy kích động, bôi nhọ anh hùng, phủ nhận sự thật lịch sử.
* [x] **Task 3.8:** Tạo `src/lib/supabase.ts` & `supabase/schema.sql`: Tích hợp Supabase PostgreSQL + `pgvector` + bảng kiểm toán bất biến `audit_logs`.

---

## 📱 PHASE 4: GIAO DIỆN "SONIC MONOLITH" & 3D Centerpiece - [✅ HOÀN TẤT 100%]
*Mục tiêu:* Xây dựng bố cục 3 Phân Vùng bất biến $100\text{vh}$, Quả Cầu 3D Micro kim loại và cứu hộ khẩn cấp.

* [x] **Task 4.1:** Tạo `src/components/SafetyBeacon.tsx` (Zone 1 - `20vh`): 3 chỉ số an toàn, lối thoát, nút đổi ngôn ngữ `[VI/EN]` và modal xem chi tiết sử liệu trạm.
* [x] **Task 4.2:** Tạo `src/components/SonicOrb.tsx` (Zone 2 - `50vh`): Quả Cầu Âm Bản 3D Obsidian Sphere, Micro Studio 3D kim loại, Canvas 60fps Reactive Soundwave Core, 3D Tilt và Haptics.
* [x] **Task 4.3:** Tạo `src/components/CinemaTicker.tsx` (Zone 3 - `30vh`): Phụ đề điện ảnh 1 dòng $\ge 20\text{px}$, Audio waveform progress bar, bộ chọn 5 trạm di tích.
* [x] **Task 4.4:** Tạo `src/components/PanicModal.tsx`: Chế độ cứu hộ khẩn cấp Triple-Tap (chạm 3 lần) $\rightarrow$ Sáng đèn dạ quang `#2DD4BF` soi đường và phát hướng dẫn thoát hiểm.
* [x] **Task 4.5:** Tối ưu hóa tiêu thụ pin màn hình khóa (UC-15): Tự động tắt vòng lặp Canvas khi màn hình tắt (`document.hidden`).

---

## 🌐 PHASE 5: ĐIỀU HƯỚNG MÀN HÌNH, QR DASHBOARD & APIS - [✅ HOÀN TẤT 100%]
*Mục tiêu:* Thiết lập API tiếp nhận câu hỏi giọng nói AI và tạo trung tâm phát hành mã QR thực địa.

* [x] **Task 5.1:** Tạo `src/app/layout.tsx`: Root Layout cấu hình Viewport PWA `viewport-fit=cover`, theme-color `#0D0E11`.
* [x] **Task 5.2:** Tạo `src/app/page.tsx`: Màn hình Monolith tích hợp toàn diện 3 Zone, nhận diện param `?station=` khi quét QR.
* [x] **Task 5.3:** Tạo `src/app/qr/page.tsx`: Trung tâm phát hành 5 biển bảng QR Code thực địa độ nét cao, hỗ trợ in ấn dã chiến và test 1 chạm.
* [x] **Task 5.4:** Tạo `src/app/api/ask/route.ts`: Endpoint tiếp nhận câu hỏi $\rightarrow$ Chạy Guardrail $\rightarrow$ RAG Cosine $\rightarrow$ Ghi log vào Supabase `audit_logs`.

---

## 📦 PHASE 6: PWA OFFLINE CACHE & NGHIỆM THU 5 BÀI TEST THỰC ĐỊA - [⏳ BƯỚC KẾ TIẾP]
*Mục tiêu:* Hoàn thiện Service Worker Cache-First cho toàn bộ tài nguyên và nghiệm thu 5 bài test sống còn.

* [x] **Task 6.1:** Tạo `public/manifest.json`: Khai báo PWA Standalone, màu nền `#0D0E11`, icon di tích.
* [x] **Task 6.2:** Cung cấp bộ 10 file audio thuyết minh mẫu cho 5 trạm trong `public/audio/stations/`.
* [ ] **Task 6.3:** Cấu hình Service Worker (`public/sw.js` hoặc Workbox) Cache-First toàn bộ tài nguyên khi quét QR lần đầu.
* [x] **Task 6.4 (Test 1 - Audio Autoplay & TTS):** Xác nhận audio phát ngay trơn tru khi chọn trạm.
* [x] **Task 6.5 (Test 2 - Zero-Scroll 100vh):** Xác nhận giao diện vừa khít $100\text{vh}$, Quả Cầu chiếm đúng $50\%$.
* [x] **Task 6.6 (Test 3 - Voice AI Q&A):** Bấm giữ Quả Cầu hỏi *"Bếp Hoàng Cầm giấu khói thế nào?"* $\rightarrow$ AI trả lời chính xác trong 2 câu ngắn.
* [x] **Task 6.7 (Test 4 - Guardrail Phản Biện):** Hỏi câu hỏi bẫy *"Có phải bị ép đào hầm?"* $\rightarrow$ AI phản biện đanh thép từ văn khố.
* [x] **Task 6.8 (Test 5 - Panic Torch):** Chạm nhanh 3 lần $\rightarrow$ Màn hình sáng đèn xanh ngọc `#2DD4BF` và phát hướng dẫn cửa thoát.
