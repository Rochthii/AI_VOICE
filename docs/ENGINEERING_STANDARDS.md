# 📐 QUY CHUẨN PHÁT TRIỂN CHUYÊN NGHIỆP (ENGINEERING STANDARDS)
### *Dự án: Củ Chi Voice Guide (PWA / Audio AI)*

Tài liệu này là bộ quy chuẩn kỹ thuật bắt buộc cho toàn bộ mã nguồn (FE, BE, Database, Audio Engine, UI/UX, Memory & Format). AI và kỹ sư tham gia dự án phải tuân thủ nghiêm ngặt từng điều khoản.

---

## 1. QUY CHUẨN GIAO DIỆN ĐỘC BẢN: "SONIC MONOLITH" (BẮT BUỘC)
Toàn bộ màn hình đang trải nghiệm hầm (Active Tour View) phải tuân thủ nghiêm ngặt kiến trúc giao diện độc bản:
* **Zero-Scroll Policy:** Container gốc bắt buộc là `h-screen w-full overflow-hidden bg-[#0D0E11]`. Cấm tuyệt đối thanh cuộn (scrollbars) hay hiệu ứng trôi màn hình.
* **Bố cục 3 Phân Vùng Cố Định:**
  1. **Zone 1 (Top 20% - `h-[20vh]`):** Beacon An toàn hiển thị 2 thông số khổng lồ: Chiều dài hầm (VD: `15m`), Thời gian (`2 phút`), Lối thoát hiểm gần nhất (`#2DD4BF`), Badge Offline/Online.
  2. **Zone 2 (Middle 50% - `h-[50vh]`):** Quả Cầu Âm Bản Khổng Lồ $220\text{px} \times 220\text{px}$ (`#E5A93C`). Chạm và giữ bất kỳ đâu trong nửa màn hình này đều là Hold-to-Talk.
  3. **Zone 3 (Bottom 30% - `h-[30vh]`):** Phụ đề điện ảnh 1 dòng (Cinema Ticker $\ge 20\text{px}$) + Thanh trượt thời gian âm thanh dạng sóng dày.

---

## 2. QUẢN LÝ FILE & KIẾN TRÚC MÃ NGUỒN (CODE & FILE GOVERNANCE)
* **Single Responsibility per File:** Mỗi file chỉ làm đúng 1 nhiệm vụ. Độ dài file tối đa $\le 200$ dòng.
* **Quy tắc đặt tên:**
  * Components: `PascalCase` (VD: `SonicOrb.tsx`, `SafetyBeacon.tsx`, `CinemaTicker.tsx`).
  * Hooks: `camelCase` bắt đầu bằng `use` (VD: `useSonicAudio.ts`, `useOfflineSync.ts`).
  * Utilities & APIs: `kebab-case` (VD: `rag-engine.ts`, `audio-helper.ts`).
  * Skills: `skill_*.md` đặt tại thư mục `skills/`.
* **Clean Import:** Sử dụng alias `@/...` tuyệt đối, không dùng `../../..`.

---

## 3. CHUẨN FRONTEND & REACT/NEXT.JS (FE STANDARDS)
* **Phân định Server vs Client Component:**
  * Chỉ thêm `'use client'` tại các component thực sự cần Web Audio API, Canvas hoặc DOM Event (`SonicOrb`, `CinemaTicker`, `AudioPlayer`).
  * Danh sách trạm và metadata tĩnh bắt buộc là Server Components.
* **Xử lý Vòng đời Âm thanh (Web Audio API Lifecycle):**
  * `AudioContext` là tài nguyên đắt giá: **Chỉ khởi tạo 1 Singleton AudioContext** duy nhất.
  * Tự động gọi `audioContext.suspend()` khi dừng và `audioContext.resume()` khi có tương tác tiếp theo.
  * Bắt buộc hủy bỏ `MediaStreamTrack.stop()` ngay khi thả nút ghi âm để giải phóng Microphone và tắt đèn báo thu âm.

---

## 4. CHUẨN BACKEND & API STREAMING (BE STANDARDS)
* **Độ trễ tối thiểu (Edge-First):** Ưu tiên chạy trên Next.js Edge Runtime.
* **Streaming Architecture:** Endpoint trả về câu trả lời AI hỗ trợ `ReadableStream` hoặc SSE (Time-to-First-Byte $< 800\text{ms}$).
* **Timeout & Abort Controller:** Timeout cứng $4.0\text{s}$ cho mọi external fetch; fallback tức thì về bộ dữ liệu nội bộ nếu mất kết nối.

---

## 5. CHUẨN DỮ LIỆU & BỘ NHỚ (DATASET & DATABASE STANDARDS)
* **Tính Bất Biến (Data Immutability):** Toàn bộ sử liệu được coi là Frozen Asset, định dạng chuẩn JSON Schema và được validate bởi Zod.
* **Vector Search In-Memory:** Tính toán Cosine Similarity trực tiếp trên bộ nhớ RAM ($< 5\text{ms}$ cold start), không phụ thuộc DB bên ngoài.
* **Giới hạn Bộ nhớ Cache:** Tổng dung lượng cache offline (PWA + 5 file `.mp3`) $\le 25\text{MB}$.
* **TypeScript Strict:** Bật `strict: true` 100%, cấm tuyệt đối kiểu `any`.
