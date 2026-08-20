# 📄 PRODUCT REQUIREMENTS DOCUMENT (PRD)

> **Tài liệu Đặc tả Yêu cầu Sản phẩm cho Củ Chi Voice Guide MVP (v0.3.0).**  
> Bản tóm tắt nhanh: Xem trực tiếp tại [`MVP.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/MVP.md) hoặc [`docs/MASTER_BLUEPRINT.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/MASTER_BLUEPRINT.md).

---

## 1. TỔNG QUAN SẢN PHẨM & TRIẾT LÝ THIẾT KẾ
* **Tên sản phẩm:** Củ Chi Voice Guide (Người Bạn Đồng Hành Nơi Lòng Đất)
* **Phiên bản:** MVP 0.3.0-alpha
* **Triết lý Cốt lõi:** Zero-Login, Zero-Install, Zero-Visual Friction, 100% Offline Resilience.
* **Phong cách UI/UX Độc bản:** **"Sonic Monolith"** (Bố cục 3-Zone $100\text{vh}$ không cuộn trang).

---

## 2. DANH MỤC YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

### 🔹 FR-01: Auto-Play & Trấn An An Toàn Khi Quét QR (Scan & Reassure)
* Du khách quét mã QR hoặc chạm chọn 1 trong 5 trạm:
  1. `01_hoang_cam_kitchen` (Bếp Hoàng Cầm)
  2. `02_field_hospital` (Hầm Cấp Cứu)
  3. `03_command_bunker` (Hầm Chỉ Huy)
  4. `04_ventilation_termite` (Lỗ Thông Hơi Ụ Mối)
  5. `05_booby_traps` (Khu Bẫy Chông)
* Ứng dụng lập tức phát audio mở đầu với **Thông số An toàn** (Độ dài hầm, thời gian bò, vị trí cửa thoát hiểm) kèm câu chuyện nhập vai xúc động.

### 🔹 FR-02: Offline-First Audio Caching (Nghe Xuyên Hầm Sâu)
* Toàn bộ 5 file audio thuyết minh chuẩn `.mp3` được tự động tải trước và lưu trong `CacheStorage` của Service Worker.
* Mất mạng 100% khi chui sâu 10m dưới lòng đất $\rightarrow$ Âm thanh vẫn phát trơn tru, không gián đoạn.

### 🔹 FR-03: Giao diện Khối Âm Bản & Quả Cầu $220\text{px}$ (Sonic Monolith)
* **Zone 1 (20vh):** Beacon An toàn hiển thị chiều dài hầm, thời gian di chuyển, lối thoát gần nhất và badge Offline.
* **Zone 2 (50vh):** Quả Cầu Âm Bản $220\text{px}$ (`#E5A93C`) — chạm giữ bất kỳ đâu ở giữa để hỏi.
* **Zone 3 (30vh):** Phụ đề điện ảnh 1 dòng (Cinema Ticker $\ge 20\text{px}$) + Thanh trượt audio dạng sóng.

### 🔹 FR-04: Hỏi Đáp AI & Kiểm Duyệt Sử Liệu Chống Ảo Giác (Voice Q&A)
* Du khách bấm giữ Quả Cầu Âm Bản, nói câu hỏi $\rightarrow$ RAG tra cứu sử liệu Ban Quản Lý (Cosine Score $\ge 0.78$) $\rightarrow$ Stream câu trả lời ngắn gọn ($\le 35$ từ) vào tai nghe và Cinema Ticker trong vòng $< 1.5\text{s}$.
* Nếu câu hỏi không có trong tư liệu chính thức $\rightarrow$ AI từ chối lịch sự, tuyệt đối không bịa đặt.

### 🔹 FR-05: Cứu Hộ Khẩn Cấp & Công Thái Học Hầm Tối
* **Panic Triple-Tap:** Chạm 3 lần liên tiếp $\rightarrow$ Màn hình sáng đèn dạ quang `#2DD4BF` soi đường và phát hướng dẫn cửa thoát hiểm.
* **Lọc Mồ Hôi:** Bỏ qua các điểm chạm $< 10\text{px}$ hoặc $< 100\text{ms}$.
* **Bảo vệ Riêng tư:** Rơi tai nghe Bluetooth $\rightarrow$ Tự động tạm dừng, không bật loa ngoài.
* **Chuyển Đổi Song Ngữ `[VI / EN]`:** Giữ nguyên giây đang phát (`currentTime`), đổi phụ đề và audio trong $50\text{ms}$.

---

## 3. TIÊU CHUẨN TRẢI NGHIỆM DU KHÁCH (UX BENCHMARKS)
* **Thời gian bắt đầu nghe sau khi quét QR:** $< 200\text{ms}$ (Instant Audio).
* **Độ dài câu trả lời AI:** $\le 2$ câu ngắn ($< 35$ từ), không làm nghẽn dòng di chuyển dưới hầm.
* **Thời lượng pin tiêu hao:** Tiết kiệm tối đa $40\%$ nhờ nền đen Than Đất Nén (`#0D0E11`) và tự động tắt Canvas khi tắt màn hình.
