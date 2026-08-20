# 🚀 ĐẶC TẢ MVP CHÍNH THỨC: CHI VOICE
### *(CHI VOICE — Hệ Thống Thuyết Minh Viên Giọng Nói AI Di Tích Lịch Sử Địa Đạo Củ Chi)*

---

## 1. ĐỊNH NGHĨA DỰ ÁN TRONG 1 CÂU
> **CHI VOICE** là Web App (PWA) thuyết minh viên giọng nói AI thông minh theo phong cách độc bản **"Sonic Monolith"**, tích hợp **100% sử liệu thật của 5 trạm di tích Củ Chi**, tự động phát âm thanh trấn an an toàn và **hoạt động mượt mà ngay cả khi mất sạch sóng dưới lòng địa đạo**.

---

## 2. HAI CHẾ ĐỘ TRẢI NGHIỆM CỐT LÕI (CORE MODES)

```
[QUÉT MÃ QR TẠI CỬA HẦM]
          │
          ├──► 1. CHẾ ĐỘ THUYẾT MINH NGẦM (OFFLINE-FIRST / ZERO-LATENCY):
          │    • Tự động nạp file MP3 trong 150ms -> Cất máy vào túi -> Nghe thuyết minh.
          │    • Đọc thông số an toàn trong 5s đầu (Độ dài hầm, thời gian bò, vị trí cửa thoát).
          │    • Không cần 4G/WiFi, không cần nhìn màn hình (Zero-Visual Friction).
          │
          └──► 2. CHẾ ĐỘ HỎI ĐÁP AI GIỌNG NÓI (VOICE-TO-VOICE RAG):
               • Dành cho khi dừng chân tại các hầm rộng (Hầm chỉ huy, cấp cứu, phòng họp).
               • Chạm giữ Quả Cầu Âm Bản 220px để hỏi bất kỳ chi tiết lịch sử nào.
               • AI tra cứu sử liệu Ban Quản Lý (In-Memory Float32 Cosine Search < 3ms).
               • Stream câu trả lời ngắn gọn (< 35 từ) vào tai nghe + Cinema Ticker 1 dòng.
               • Chống ảo giác tuyệt đối: Không có trong sử liệu -> Từ chối lịch sự.
```

---

## 3. THIẾT KẾ ĐỘC BẢN "SONIC MONOLITH" (ZERO-SCROLL 100vh)

```
┌────────────────────────────────────────────────────────────────────────┐
│ ZONE 1: BEACON AN TOÀN & ĐỊNH HƯỚNG (20vh)                            │
│ 📏 ĐỘ DÀI: 15 MÉT   │ ⏳ THỜI GIAN BÒ: 2 PHÚT   │ 🟢 CỬA THOÁT: TRƯỚC 5M│
├────────────────────────────────────────────────────────────────────────┤
│ ZONE 2: QUẢ CẦU ÂM BẢN TƯƠNG TÁC KHỔNG LỒ (50vh)                       │
│                                                                        │
│                            ╭───────────────╮                           │
│                            │    (( 🎙️ ))   │                           │
│                            │  CHẠM BẤT KỲ  │                           │
│                            │    ĐỂ HỎI     │                           │
│                            ╰───────────────╯                           │
│        (Vùng chạm siêu lớn 220px chiếm trọn nửa màn hình - Không thể hụt)│
├────────────────────────────────────────────────────────────────────────┤
│ ZONE 3: DÒNG THỜI GIAN & PHỤ ĐỀ CINEMA TICKER (30vh)                   │
│ ▶️ 01:14 ━━━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━ 02:30          │
│ 📜 "Rãnh giấu khói chạy ngầm làm nguội khí..." (Phụ đề 1 dòng 20px)    │
│        [⏮️ Lùi 15s]          [ ⏸️ TẠM DỪNG ]          [⏭️ Tiếp 15s]      │
└────────────────────────────────────────────────────────────────────────┘
```
* **Bảng màu hầm tối:** Than Đất Nén (`#0D0E11`), Vàng Đèn Bão (`#E5A93C`), Ngọc Dạ Quang (`#2DD4BF`).

---

## 4. DỮ LIỆU THẬT 100% CỦA 5 TRẠM DI TÍCH TRONG MVP (GROUND TRUTH)

| STT | Mã Trạm (`location_id`) | Tên Điểm Di Tích | Thông Số An Toàn | Câu Chuyện Con Người Xúc Động |
| :--- | :--- | :--- | :--- | :--- |
| **01** | `01_hoang_cam_kitchen` | **Bếp Hoàng Cầm** | Tầng 2 (sâu 5-8m) • Dài 15m • Cao 1.4m • 2 phút | Bếp đỏ lửa nấu khoai mì chấm muối mè, biến lòng hầm thành xã hội thu nhỏ kiên cường. |
| **02** | `02_field_hospital` | **Bệnh Xá & Hầm Phẫu Thuật** | Tầng 2 (sâu 5-8m) • Dài 10m • Lom khom • 3 phút | Tấm gương Bác sĩ Võ Hoàng Lê phẫu thuật dưới hầm tối, sáng kiến cấy Filatov & dùng cây thuốc Nam. |
| **03** | `03_command_bunker` | **Hầm Chỉ Huy Đầu Não** | Tầng 3 (sâu 8-12m) • Dài 25m • Cao 1.5m • 3 phút | Nút chặn cô lập khí độc, ngách thoát mép sông Sài Gòn, bàn đạp lịch sử Chiến dịch Tết Mậu Thân 1968. |
| **04** | `04_ventilation_termite`| **Lỗ Thông Hơi Ụ Mối**| Ụ mối đùn • Dài 18m • Cao 0.8m • 2.5 phút| Ống tre/kim loại đối lưu nhiệt tự nhiên; sáng kiến dùng xà phòng Mỹ đánh lừa chó săn béc-giê. |
| **05** | `05_booby_traps` | **Trận Đồ Bẫy Chông** | Mặt đất thoáng mát • Đi bộ tự do | Nghệ thuật thô sơ thắng hiện đại với chông cửa, chông nắp tự động & mìn gạt Anh hùng Tô Văn Đực. |

---

## 5. TÍNH NĂNG THỰC ĐỊA & CÔNG THÁI HỌC HẦM TỐI

* 🔦 **Cứu Hộ Khẩn Cấp (Panic Triple-Tap):** Du khách hoảng sợ trong hầm $\rightarrow$ Chạm nhanh 3 lần bất kỳ đâu $\rightarrow$ Màn hình sáng đèn dạ quang `#2DD4BF` soi đường và phát hướng dẫn cửa thoát hiểm gần nhất.
* 💧 **Lọc Mồ Hôi Rơi Trên Màn Hình (Ghost Touch Filter):** Tự động bỏ qua các điểm chạm nhỏ $< 10\text{px}$ hoặc $< 100\text{ms}$.
* 📳 **Phản Hồi Xúc Giác & Âm Thanh (Haptics & SFX):** Rung $40\text{ms}$ + Tiếng gõ mõ tre trầm $120\text{Hz}$ (không gây giật mình trong hầm).
* 🎧 **Tự Động Bảo Vệ Riêng Tư:** Rơi tai nghe Bluetooth $\rightarrow$ Tự động tạm dừng, tuyệt đối không tự phát loa ngoài gây ồn trong hầm.
* 🌐 **Chuyển Đổi Song Ngữ Tức Thì `[VI / EN]`:** Giữ nguyên số giây đang nghe (`currentTime`), đổi phụ đề và audio trong $50\text{ms}$.

---

## 6. TIÊU CHÍ NGHIỆM THU MVP (DEFINITION OF DONE - 5 BÀI TEST THỰC TẾ)

* [ ] **Test 1 - Offline 100%:** Ngắt hoàn toàn WiFi/4G $\rightarrow$ Mở trạm $\rightarrow$ File âm thanh thuyết minh vẫn phát trơn tru từ Cache.
* [ ] **Test 2 - Độ Trễ & Âm Bản:** Mở giao diện trên điện thoại $\rightarrow$ Màn hình vừa khít $100\text{vh}$, Quả Cầu chiếm đúng $50\%$, không có thanh cuộn.
* [ ] **Test 3 - Độ Chính Xác Lịch Sử:** Bật mạng, giữ Quả Cầu hỏi *"Bếp Hoàng Cầm giấu khói như thế nào?"* $\rightarrow$ AI trả lời chính xác nguyên lý rãnh khói ngầm trong 2 câu ngắn ($< 35$ từ).
* [ ] **Test 4 - Chống Ảo Giác (Guardrail):** Hỏi câu hỏi ngoài lịch sử Củ Chi $\rightarrow$ AI từ chối chuẩn mực, không tự suy đoán.
* [ ] **Test 5 - Khẩn Cấp (Panic Torch):** Chạm nhanh 3 lần $\rightarrow$ Màn hình sáng đèn xanh ngọc `#2DD4BF` và phát hướng dẫn lối thoát.
