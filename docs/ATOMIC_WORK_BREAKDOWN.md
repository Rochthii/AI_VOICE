# 🔬 BẢN PHÂN RÃ CÔNG VIỆC NGUYÊN TỬ (ATOMIC WORK BREAKDOWN)
### *Dự án: Củ Chi Voice Guide — Kế Hoạch Thực Thi Từng Nhiệm Vụ Siêu Nhỏ (Micro-Tasks)*

Tài liệu này chia nhỏ toàn bộ quá trình xây dựng bản **MVP Củ Chi Voice Guide (v0.3.0)** thành **6 Phase tuần tự** với **36 Micro-Tasks nguyên tử** (mỗi task thực hiện trong $5 - 15\text{ phút}$, có tiêu chí kiểm định độc lập).

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

* [x] **Task 1.1:** Tạo `package.json` với Next.js 14, React 18, Tailwind CSS, Lucide Icons, clsx, tailwind-merge.
* [x] **Task 1.2:** Tạo `tsconfig.json` bật `strict: true`, cấu hình import alias `@/*` tuyệt đối.
* [x] **Task 1.3:** Tạo `tailwind.config.ts` cấu hình đầy đủ bảng màu độc bản (Bazan Noir, Amber, Jade, Rust, Chalk).
* [x] **Task 1.4:** Tạo `postcss.config.mjs` và `next.config.mjs`.
* [x] **Task 1.5:** Tạo `src/app/globals.css` (Khóa cứng Zero-Scroll 100vh, Dark OLED, ẩn scrollbar).
* [x] **Task 1.6:** Tạo `src/types/station.ts` (TypeScript interfaces Station, Safety, AudioAssets, FAQ).
* [x] **Task 1.7:** Tạo `src/types/rag.ts` (TypeScript interfaces HistoryChunk, RAGMatchResult, QueryPayload).

---

## 📜 PHASE 2: SỬ LIỆU THẬT 100% CỦA 5 TRẠM CỦ CHI (30 PHÚT)
*Mục tiêu:* Đóng gói toàn bộ sử liệu chính thức, thông số an toàn không gian ngầm và 50+ RAG Chunks có sẵn vector embedding.

* [ ] **Task 2.1:** Tạo `src/data/stations.json` - Trạm 01: **Bếp Hoàng Cầm** (Dài 15m, cao 1.4m, bò 2p, lối thoát 5m, câu chuyện giấu khói của anh nuôi).
* [ ] **Task 2.2:** Trạm 02: **Hầm Cấp Cứu & Giải Phẫu** (Dài 10m, sâu 6m tầng 2, bò 3p, ca mổ đèn chai đom đóm).
* [ ] **Task 2.3:** Trạm 03: **Hầm Chỉ Huy** (Dài 25m, cao 1.5m, bò 3p, phòng họp ngầm và bản đồ 3 tầng).
* [ ] **Task 2.4:** Trạm 04: **Lỗ Thông Hơi Ụ Mối** (Dài 18m, cao 0.8m, bò 2.5p, ngụy trang ụ mối và rắc ớt bột chống chó béc-giê).
* [ ] **Task 2.5:** Trạm 05: **Khu Bẫy Chông** (Khu mặt đất thoáng mát, chông tre vạt nhọn và bẫy hố sập).
* [ ] **Task 2.6:** Tạo `src/data/history_knowledge.json`: $50+$ mẩu sử liệu chi tiết kèm từ khóa, phân loại danh mục và vector 1536 chiều định dạng Float32 chuẩn.

---

## ⚡ PHASE 3: LÕI AUDIO ENGINE & THUẬT TOÁN VECTOR 15 DÒNG (45 PHÚT)
*Mục tiêu:* Xây dựng Singleton Web Audio, mở khóa iOS Autoplay, lọc ồn VAD và thuật toán Cosine Similarity chạy trực tiếp trên RAM.

* [ ] **Task 3.1:** Tạo `src/lib/audio-engine.ts`: Khởi tạo Singleton `AudioContext` duy nhất cho toàn ứng dụng.
* [ ] **Task 3.2:** Viết hàm `unlockIOSAudio()`: Phát Silent Audio Buffer $0.01\text{s}$ ngay trong lần chạm đầu tiên để mở khóa âm thanh Safari.
* [ ] **Task 3.3:** Viết hàm `playWoodblockSFX()`: Dùng `OscillatorNode` sinh tiếng gõ mõ tre $120\text{Hz}$ trầm tự nhiên ($30\text{ms}$).
* [ ] **Task 3.4:** Viết bộ lọc `BiquadFilterNode` (High-Pass Filter $150\text{Hz}$) triệt tiêu tiếng ù trầm của quạt thông gió hầm.
* [ ] **Task 3.5:** Viết hàm VAD (Voice Activity Detection) đo năng lượng RMS của micro để tự động ngắt tạp âm.
* [ ] **Task 3.6:** Tạo `src/lib/rag-engine.ts`: Viết thuật toán **Cosine Similarity Float32 thuần 15 dòng** (tìm kiếm trong $0.2\text{ms}$ trên 50 chunks, 0KB thư viện ngoài).
* [ ] **Task 3.7:** Tạo `src/lib/guardrails.ts`: Bộ lọc kiểm duyệt lịch sử khắt khe (Ngưỡng Cosine $\ge 0.78$, đính chính câu hỏi bẫy, cắt câu thoại $\le 35$ từ).

---

## 📱 PHASE 4: CÁC THÀNH PHẦN UI "SONIC MONOLITH" (60 PHÚT)
*Mục tiêu:* Xây dựng bố cục 3 Phân Vùng bất biến $100\text{vh}$, Quả Cầu Âm Bản $220\text{px}$ và tính năng cứu hộ khẩn cấp.

* [ ] **Task 4.1:** Tạo `src/components/SafetyBeacon.tsx` (Zone 1 - `20vh`): Hiển thị 3 chỉ số an toàn khổng lồ, lối thoát hiểm và Badge trạng thái Offline.
* [ ] **Task 4.2:** Tạo `src/components/SonicOrb.tsx` (Zone 2 - `50vh`): Quả Cầu Âm Bản $220\text{px}$, nhận diện chạm giữ `onTouchStart`/`onMouseDown`, rung Haptic $40\text{ms}$.
* [ ] **Task 4.3:** Tạo `src/components/WaveformCanvas.tsx`: Vẽ 3 vòng sóng âm nước tỏa tròn Bezier đồng bộ FFT 256 bins theo âm lượng thực của mic.
* [ ] **Task 4.4:** Tạo `src/components/CinemaTicker.tsx` (Zone 3 - `30vh`): Phụ đề điện ảnh 1 dòng chữ lớn $\ge 20\text{px}$ chạy chữ mượt mà + thanh tua audio dạng sóng.
* [ ] **Task 4.5:** Tạo `src/components/PanicEmergencyTorch.tsx`: Bộ phát hiện chạm nhanh 3 lần (Triple-Tap trong 600ms) $\rightarrow$ Bật sáng toàn màn hình màu ngọc `#2DD4BF` soi đường và phát câu hướng dẫn cửa thoát.
* [ ] **Task 4.6:** Tạo `src/components/LanguageSwitcher.tsx`: Nút chuyển ngữ `[VI | EN]` đổi phụ đề và audio trong $50\text{ms}$ giữ nguyên số giây đang phát.
* [ ] **Task 4.7:** Tạo `src/components/QRScannerModal.tsx`: Modal camera quét mã QR cửa hầm trong $0.2\text{s}$ kèm nút chọn nhanh mã test.
* [ ] **Task 4.8:** Tạo `src/components/StationCard.tsx`: Thẻ trạm lớn trực quan với thông số an toàn tóm tắt cho màn hình Hub.

---

## 🌐 PHASE 5: ĐIỀU HƯỚNG MÀN HÌNH & EDGE APIS (45 PHÚT)
*Mục tiêu:* Ghép nối 2 màn hình ứng dụng và thiết lập API tiếp nhận câu hỏi giọng nói AI.

* [ ] **Task 5.1:** Tạo `src/app/layout.tsx`: Root Layout nhúng Theme hầm tối, font Inter và bộ đăng ký Service Worker tự động.
* [ ] **Task 5.2:** Tạo `src/app/page.tsx` (Màn hình 1 - Hub Cổng Di Tích): Banner nút quét QR lớn, danh sách 5 trạm, nút chuyển ngữ và chỉ báo Offline 100%.
* [ ] **Task 5.3:** Tạo `src/app/station/[id]/page.tsx` (Màn hình 2 - Khối Âm Bản Active Monolith $100\text{vh}$): Kết nối Zone 1, Zone 2, Zone 3 thành 1 thể thống nhất không cuộn trang.
* [ ] **Task 5.4:** Tạo `src/app/api/stations/route.ts`: API cấp phát metadata của 5 trạm di tích.
* [ ] **Task 5.5:** Tạo `src/app/api/ask/route.ts`: Next.js Edge Route tiếp nhận câu hỏi $\rightarrow$ RAG Cosine Search $\rightarrow$ Stream câu trả lời ngắn gọn $\le 35$ từ.

---

## 📦 PHASE 6: PWA OFFLINE & KIỂM ĐỊNH 5 BÀI TEST NGHIỆM THU (30 PHÚT)
*Mục tiêu:* Cấu hình Service Worker Cache-First cho 5 file audio và nghiệm thu thực tế 5 bài test sống còn.

* [ ] **Task 6.1:** Tạo `public/manifest.json`: Khai báo PWA Standalone, màu nền `#0D0E11`, icon di tích.
* [ ] **Task 6.2:** Tạo `public/sw.js`: Service Worker tự động Cache-First toàn bộ App Shell và 5 file audio thuyết minh (Dung lượng $< 15\text{MB}$).
* [ ] **Task 6.3:** Cung cấp bộ 5 file audio thuyết minh mẫu chất lượng cao trong `public/audio/stations/`.
* [ ] **Task 6.4 (Test 1 - Offline):** Bật chế độ máy bay $\rightarrow$ Chọn trạm $\rightarrow$ Xác nhận audio phát ngay trong $150\text{ms}$.
* [ ] **Task 6.5 (Test 2 - Zero-Scroll):** Mở trên mobile viewport $\rightarrow$ Xác nhận màn hình vừa khít $100\text{vh}$, Quả Cầu chiếm đúng $50\%$.
* [ ] **Task 6.6 (Test 3 - Voice AI Q&A):** Bấm giữ Quả Cầu hỏi *"Bếp Hoàng Cầm giấu khói thế nào?"* $\rightarrow$ Xác nhận câu trả lời chính xác trong 2 câu ngắn.
* [ ] **Task 6.7 (Test 4 - Guardrail):** Hỏi câu hỏi ngoài lịch sử $\rightarrow$ Xác nhận AI từ chối chuẩn mực, không bịa đặt.
* [ ] **Task 6.8 (Test 5 - Panic Torch):** Chạm nhanh 3 lần $\rightarrow$ Xác nhận màn hình sáng đèn xanh ngọc `#2DD4BF` và phát hướng dẫn cửa thoát.

---

Bản phân rã 36 Micro-Tasks này là kim chỉ nam chính xác nhất để triển khai mã nguồn không một động tác thừa!
