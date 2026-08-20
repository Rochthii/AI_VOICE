# 🏛️ BẢN ĐẶC TẢ TỔNG THỂ MVP: CỦ CHI VOICE GUIDE
### *(Master Blueprint — Hệ Thống Thuyết Minh Viên Giọng Nói AI Địa Đạo Củ Chi)*

---

## 1. ĐỊNH VỊ SẢN PHẨM & GIÁ TRỊ CỐT LÕI
* **Tên sản phẩm:** Củ Chi Voice Guide (Người Bạn Đồng Hành Nơi Lòng Đất).
* **Bản chất:** Web App (PWA) thuyết minh viên giọng nói AI thông minh, không cần cài đặt App Store, phục vụ du khách khám phá Địa đạo Củ Chi.
* **Mô hình Hybrid 2 Chế độ:**
  1. **Chế độ Thuyết minh Ngầm (Offline-First, Zero-Latency):** Quét QR tại cửa hầm $\rightarrow$ Tải trước âm thanh trong $150\text{ms}$ $\rightarrow$ Cất máy vào túi, vừa khom lưng bò vừa nghe thuyết minh chuẩn (Không cần sóng 4G/WiFi, không cần nhìn màn hình).
  2. **Chế độ Hỏi đáp AI (Voice-to-Voice RAG):** Khi dừng chân tại các hầm rộng $\rightarrow$ Chạm giữ Quả Cầu Âm Bản $220\text{px}$ để hỏi sâu chi tiết sử liệu $\rightarrow$ AI trả lời chính xác $100\%$ từ tư liệu Ban Quản Lý Di Tích trong vòng $< 1.5\text{s}$.

---

## 2. BẢN ĐỒ THẤU CẢM DU KHÁCH (USER EMPATHY MATRIX)

| Bối Cảnh Thực Tế Dưới Hầm | Nỗi Sợ / Rào Cản Thầm Kín | Giải Pháp Thiết Kế Tận Gốc Của Hệ Thống |
| :--- | :--- | :--- |
| **Không gian hẹp (80-120cm), tối, ẩm** | Sợ hoa mắt, sợ vấp ngã khi vừa bò vừa nhìn màn hình. | **Zero-Visual Friction:** Tự động phát âm thanh vào tai nghe ngay khi quét QR; cất máy vào túi là xong. |
| **Tâm lý lo sợ bị ngạt, sợ kẹt lại** | Không biết đoạn hầm dài bao nhiêu mét, khi nào tới lối thoát. | **Safety-First Reassurance:** Luôn đọc thông số an toàn trong 5 giây đầu: Độ dài hầm, thời gian di chuyển, vị trí cửa thoát hiểm. |
| **Tay dính bùn đất, mồ hôi ướt** | Bấm lệch các nút nhỏ $24-40\text{px}$, vuốt màn hình bị trôi. | **Vùng chạm khổng lồ $220\text{px}$:** Nửa màn hình là Quả Cầu Âm Bản, chạm bất kỳ đâu đều thu âm thành công. |
| **Mất 100% sóng di động 4G/5G** | App bị đơ, báo lỗi kết nối gây khó chịu. | **100% Offline Cache:** Service Worker lưu trữ sẵn toàn bộ file MP3 và dữ liệu 5 trạm ngay khi vào cổng. |
| **Tình huống hoảng loạn (Panic Attack)** | Cần thoát ra ngoài ngay lập tức trong bóng tối. | **Panic Triple-Tap:** Chạm 3 lần liên tiếp $\rightarrow$ Màn hình sáng đèn dạ quang `#2DD4BF` soi đường và phát hướng dẫn cửa thoát. |

---

## 3. PHONG CÁCH THIẾT KẾ ĐỘC BẢN: "SONIC MONOLITH"
*(Toàn bộ màn hình đang đi hầm là 1 Khối Âm Bản $100\text{vh}$ Cố Định — Zero Scroll)*

```
┌────────────────────────────────────────────────────────────────────────┐
│ ZONE 1: BEACON AN TOÀN & ĐỊNH HƯỚNG (20vh)                            │
│ 📏 ĐỘ DÀI: 15 MÉT   │ ⏳ THỜI GIAN BÒ: 2 PHÚT   │ 🟢 CỬA THOÁT: TRƯỚC 5M│
├────────────────────────────────────────────────────────────────────────┤
│ ZONE 2: QUẢ CẦU ÂM BẢN TƯƠNG TÁC (50vh)                                │
│                            ╭───────────────╮                           │
│                            │    (( 🎙️ ))   │                           │
│                            │  CHẠM BẤT KỲ  │                           │
│                            │    ĐỂ HỎI     │                           │
│                            ╰───────────────╯                           │
│        (Vùng chạm siêu lớn 220px chiếm trọn nửa màn hình)              │
├────────────────────────────────────────────────────────────────────────┤
│ ZONE 3: DÒNG THỜI GIAN & PHỤ ĐỀ CINEMA TICKER (30vh)                   │
│ ▶️ 01:14 ━━━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━ 02:30          │
│ 📜 "Rãnh giấu khói chạy ngầm làm nguội khí..." (Phụ đề 1 dòng 20px)    │
│        [⏮️ Lùi 15s]          [ ⏸️ TẠM DỪNG ]          [⏭️ Tiếp 15s]      │
└────────────────────────────────────────────────────────────────────────┘
```
* **Bảng màu hầm tối:** Nền Than Đất Nén (`#0D0E11`), Vàng Đèn Bão (`#E5A93C`), Ngọc Dạ Quang (`#2DD4BF`).

---

## 4. DỮ LIỆU THẬT 100% CỦA 5 TRẠM DI TÍCH TIÊU BIỂU (GROUND TRUTH)

1. **`01_hoang_cam_kitchen` — Bếp Hoàng Cầm:** Bố trí Tầng 2 (sâu 5m - 8m), dài 15m, cao 1.4m, bò 2 phút. Lối thoát trước mặt 5m. Dẫn khói qua rãnh/ống ngầm làm nguội thành sương mỏng, phục vụ khoai mì chấm muối mè.
2. **`02_field_hospital` — Bệnh Xá & Hầm Phẫu Thuật:** Tầng 2 (sâu 5m - 8m), dài 10m, đi lom khom 3 phút. Lối thoát dẫn lên giếng nước ngầm. Tấm gương Bác sĩ Võ Hoàng Lê phẫu thuật dưới hầm tối, sáng kiến cấy Filatov và phong trào dùng cây thuốc Nam.
3. **`03_command_bunker` — Hầm Chỉ Huy Đầu Não:** Tầng 3 (sâu 8m - 12m), dài 25m, cao 1.5m, bò 3 phút. Hệ thống nút chặn hiểm yếu ngăn khí độc và nước; ngách thoát hiểm ra mép sông Sài Gòn; bàn đạp Chiến dịch Tết Mậu Thân 1968.
4. **`04_ventilation_termite` — Lỗ Thông Hơi Ụ Mối & Đối Phó Chó Nghiệp Vụ:** Ống tre/kim loại ngụy trang ụ mối đùn, mô đất, bụi rậm. Đối lưu nhiệt tự nhiên. Sáng kiến đặt xà phòng Mỹ át mùi mồ hôi, đánh lừa chó săn béc-giê trong trận càn Crimp (1966) & Cedar Falls (1967).
5. **`05_booby_traps` — Trận Đồ Bẫy Chông & Vũ Khí Du Kích:** Khu vực mặt đất thoáng mát. Triết lý "lấy thô sơ thắng hiện đại", hai kiểu bẫy kinh điển (chông cánh cửa, chông nắp tự động) và sáng kiến mìn gạt của Anh hùng Tô Văn Đực từ bom pháo lép đánh xe tăng, thiết giáp.

---

## 5. BẢN ĐỒ LIÊN KẾT 10 SKILLS VÀ 16 USE CASES

```
docs/MASTER_BLUEPRINT.md
       │
       ├──► SKILLS REGISTRY (skills/)
       │    ├── skill_sonic_monolith_ui.md  (Ép layout 3 phân vùng 100vh)
       │    ├── skill_ui_ux_interactions.md (Vật lý cảm ứng, Haptics 40ms, Canvas FFT)
       │    ├── skill_safety_brief.md       (Tạo câu trấn an an toàn < 25 từ)
       │    ├── skill_storytelling.md       (Kể chuyện con người xúc động < 45 từ)
       │    ├── skill_route.md              (Định tuyến 5 trạm di tích)
       │    ├── skill_guardrail.md          (Chống ảo giác, Cosine Score >= 0.78)
       │    ├── skill_voice_fmt.md          (Tối ưu câu thoại Cinema Ticker <= 35 từ)
       │    ├── skill_audio_lifecycle.md    (Singleton Web Audio, mở khóa iOS autoplay)
       │    ├── skill_offline_cache.md      (Cache-First PWA khi mất sóng)
       │    └── skill_edgecase_handler.md   (Xử lý hoảng sợ 3-tap, mồ hôi rơi trên màn)
       │
       └──► USE CASES (docs/usecases/)
            ├── [UC-01 -> UC-04]: Hành trình Chuẩn (Quét QR, Giữ hỏi, Đổi ngữ, Đổi trạm)
            ├── [UC-05 -> UC-08]: Môi trường Mạng (Rớt mạng, Cold start, Dọn RAM, Sóng 2G)
            ├── [UC-09 -> UC-12]: Thể xác & Tâm lý (Hoảng loạn 3-tap, Mồ hôi, Chạm nhanh, Lọc ồn)
            └── [UC-13 -> UC-16]: Ngoại vi & Thiết bị (Rơi tai nghe, Cuộc gọi, Tắt màn, Câu hỏi bẫy)
```
