# Use Case: UC-14 Cuộc Gọi Đến Hoặc Thông Báo Hệ Thống Cắt Ngang
ACTOR: Du khách có cuộc gọi thoại đến khi đang nghe thuyết minh
TRIGGER: Hệ điều hành gửi tín hiệu audio interruption (`pagehide` hoặc Web Audio suspended)
STATE: `SYSTEM_INTERRUPTED`

STEPS:
1. Hệ thống lưu lại trạng thái trạm và `current_timestamp` vào LocalStorage.
2. Tạm dừng bộ đếm thời gian và tiến trình audio.
3. Khi cuộc gọi kết thúc và du khách quay trở lại Web App:
4. Audio tự động **LÙI LẠI 3 GIÂY** so với điểm bị ngắt.
5. Du khách bắt kịp lại ngữ cảnh câu chuyện một cách mượt mà.

OUTCOME: Trải nghiệm liền mạch, du khách không bị mất chi tiết câu chuyện sau khi bị gián đoạn.
