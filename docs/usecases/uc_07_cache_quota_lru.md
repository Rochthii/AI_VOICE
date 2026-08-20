# Use Case: UC-07 Quản Lý Dung Lượng Cache Khi Bộ Nhớ Máy Đầy
ACTOR: Du khách sử dụng điện thoại dung lượng thấp (< 50MB trống)
TRIGGER: Service Worker kiểm tra dung lượng `CacheStorage > 25MB`
STATE: `BACKGROUND_MAINTENANCE`

STEPS:
1. Thuật toán `LRU (Least Recently Used)` quét danh sách 5 file audio.
2. Xác định các file audio của các trạm du khách đã đi qua từ lâu (cách >= 2 trạm).
3. Xóa các file cũ khỏi CacheStorage.
4. Giữ lại duy nhất: File trạm hiện tại và File trạm kế tiếp.
5. Duy trì tổng mức tiêu hao bộ nhớ luôn nằm trong ngưỡng an toàn < 15MB.

OUTCOME: Điện thoại không bị đơ, không bị cảnh báo đầy bộ nhớ từ hệ điều hành.
