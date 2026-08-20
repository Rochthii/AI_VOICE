# 🛡️ BẢN PHẢN BIỆN KỸ THUẬT & CÁC BẪY LẬP TRÌNH (CRITICAL PITFALLS & PREVENTIONS)

Tài liệu này tổng hợp các "bẫy chết người" thường gặp khi phát triển ứng dụng Voice AI Web/PWA và cách giải quyết triệt để trong mã nguồn.

---

## 🛑 BẪY 1: iOS Safari Chặn Tự Động Phát Âm Thanh (Audio Autoplay Policy)
* **Vấn đề thực tế:** Apple Safari trên iPhone chặn 100% việc gọi `.play()` nếu không bắt nguồn từ cử chỉ chạm màn hình. Khi AI trả lời từ API về sau 1-2 giây, trình duyệt coi đó là async execution và chặn phát tiếng.
* **Cách khắc phục:** Kích hoạt kênh âm thanh bằng Silent Buffer ($0.01\text{s}$) ngay khi chạm vào Quả Cầu Âm Bản lần đầu tiên.

---

## 🛑 BẪY 2: Tràn Bộ Nhớ (Memory Leak) Do Web Audio API
* **Vấn đề thực tế:** Tạo mới liên tục `AudioContext` mỗi lần hỏi khiến trình duyệt di động bị cạn RAM sau 5-10 câu hỏi.
* **Cách khắc phục:** Dùng mô hình **Singleton Audio Engine** và bắt buộc cleanup `MediaStreamTrack.stop()` ngay khi nhấc tay.

---

## 🛑 BẪY 3: AI Trả Lời Quá Dài (Verbose Response Trap)
* **Vấn đề thực tế:** LLM sinh đoạn văn dài 200 chữ khiến du khách phải đứng nghe 2 phút dưới hầm hẹp làm tắc nghẽn lối đi.
* **Cách khắc phục:** Khóa cứng `max_tokens: 80`, ép câu thoại $\le 2$ câu đơn ($< 35$ từ) hiển thị đồng bộ trên Cinema Ticker 1 dòng.

---

## 🛑 BẪY 4: Ảo Giác Sử Liệu Do Hỏi Mẹo (Semantic Prompt Injection)
* **Vấn đề thực tế:** Khách hỏi các câu hỏi suy đoán (VD: "Ai thiết kế bếp Hoàng Cầm cho quân đội Mỹ?").
* **Cách khắc phục:** Ngưỡng Cosine Threshold $\ge 0.78$ và kích hoạt đính chính sự thật lịch sử ngay câu đầu tiên.

---

## 🛑 BẪY 5: Xung Đột Dữ Liệu Đa Ngôn Ngữ (i18n Mixed State)
* **Vấn đề thực tế:** Đổi sang tiếng Anh nhưng STT hoặc TTS vẫn bắt tiếng Việt.
* **Cách khắc phục:** Khóa cứng `lang` parameter đồng bộ giữa Web Speech API, TTS Model và giao diện.

---

## 🛑 BẪY 6: Nhồi Nhét Model AI Nặng Vào Trình Duyệt Di Động (Client-Side AI Bloat Trap)
* **Vấn đề thực tế:** Tải các mô hình AI ONNX/Wasm nặng $40\text{MB} - 80\text{MB}$ (như Whisper-web, Transformers.js) hoặc thư viện Vector cồng kềnh vào trình duyệt điện thoại du khách:
  * Khiến trang web mất 30-60s để tải qua sóng 3G yếu ở cửa hầm.
  * Tiêu tốn $300\text{MB} - 600\text{MB}$ RAM khiến iPhone Safari hoặc máy Android giá rẻ bị sập tab (Out of Memory Kill).
* **Cách khắc phục (Kiến trúc Hybrid 0MB):**
  1. **Không nạp model AI nặng vào Client:** Sử dụng Web Speech API có sẵn của hệ điều hành điện thoại ($0\text{MB}$, $0\text{ms}$ độ trễ khi offline) và gọi Cloud Edge AI khi có mạng.
  2. **Thay thế thư viện Vector bằng Toán thuần:** Viết hàm Cosine Similarity Float32 chỉ 15 dòng code (0 KB dependency, quét 50 chunks lịch sử trong $0.2\text{ms}$).
