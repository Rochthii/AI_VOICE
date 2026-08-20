# Use Case: UC-01 Quét QR Tại Cửa Hầm
ACTOR: Du khách (đeo tai nghe, chuẩn bị chui hầm)
TRIGGER: Camera quét trúng QR Code hoặc bấm chọn trạm trên Hub.
STATE: `IDLE` -> `ACTIVE_MONOLITH`

STEPS:
1. PWA nhận diện `station_id = "01_hoang_cam_kitchen"`.
2. Service Worker trả về file `01_kitchen_vi.mp3` từ Cache trong < 150ms.
3. Zone 1 hiển thị: "15m | 2 phút | Lối thoát: trước 5m".
4. Zone 3 hiển thị Cinema Ticker câu mở đầu.
5. Du khách cất máy vào túi, vừa bò vừa nghe.

OUTCOME: Audio phát trơn tru, không có độ trễ thị giác, không cần nhìn màn hình.
