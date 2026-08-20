# Use Case: UC-10 Lọc Chạm Ảo Do Mồ Hôi & Bùn Đất Rơi Lên Màn Hình
ACTOR: Du khách đang bò trườn dưới hầm, mồ hôi và đất rơi trúng màn hình
TRIGGER: Giọt nước hoặc mồ hôi kích hoạt cảm ứng điện dung (`touchstart`)
STATE: `GHOST_TOUCH_FILTERING`

STEPS:
1. Thuật toán `Touch Area & Duration Filter` đo kích thước và thời gian của điểm chạm.
2. Nếu diện tích tiếp xúc < 10px (giọt nước) HOẶC thời gian chạm < 100ms:
   - Hệ thống tự động bỏ qua (Debounce/Drop event).
   - Không rung, không mở micro thu âm.
3. Chỉ kích hoạt khi điểm tiếp xúc là ngón tay cái thực tế (diện tích >= 40px và giữ liên tục >= 350ms).

OUTCOME: Loại bỏ 100% hiện tượng nhảy loạn cảm ứng, tiết kiệm pin và băng thông.
