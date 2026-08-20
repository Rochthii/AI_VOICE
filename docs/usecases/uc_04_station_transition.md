# Use Case: UC-04 Đi Hết Đoạn Hầm & Chuyển Trạm Kế Tiếp
ACTOR: Du khách bò tới cuối đoạn hầm
TRIGGER: Audio thuyết minh đạt `currentTime >= duration`
STATE: `SPEAKING` -> `STATION_COMPLETED`

STEPS:
1. Audio tự động Fade Out trong 1.5 giây.
2. Zone 1 chuyển sang màu xanh ngọc `#2DD4BF`: "Đoạn hầm hoàn tất an toàn!".
3. Quả cầu Zone 2 hiển thị biểu tượng mũi tên dẫn đường sang trạm kế tiếp.
4. Du khách chạm nút "Trạm kế tiếp" hoặc quét mã QR mới tại trạm tiếp theo.

OUTCOME: Kết thúc trạm trọn vẹn, định hướng không gian rõ ràng cho chặng kế tiếp.
