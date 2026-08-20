# Use Case: UC-03 Chuyển Đổi Song Ngữ [VI / EN]
ACTOR: Du khách hoặc người hướng dẫn đi cùng
TRIGGER: Bấm nút `[VI | EN]` ở góc trên bên trái
STATE: Bất kỳ màn hình nào

STEPS:
1. Đọc giá trị `currentTime` của audio đang phát.
2. Cập nhật `locale = (prev === 'vi' ? 'en' : 'vi')`.
3. Chuyển nguồn audio sang file ngôn ngữ mới tương ứng (`_en.mp3`).
4. Gán `audio.currentTime = savedTime` và tiếp tục phát.
5. Cập nhật toàn bộ text Zone 1 và Cinema Ticker Zone 3.

OUTCOME: Chuyển ngữ mượt mà trong 50ms, không làm gián đoạn vị trí đang nghe.
