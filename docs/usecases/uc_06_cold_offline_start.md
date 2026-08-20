# Use Case: UC-06 Quét QR Lần Đầu Dưới Hầm (Cold Offline Start)
ACTOR: Du khách không mở web từ trên bờ, chui thẳng xuống hầm rồi mới quét QR
TRIGGER: Camera quét QR khi thiết bị đang ở trạng thái `navigator.onLine === false`
STATE: `UNINITIALIZED` -> `COLD_OFFLINE_START`

STEPS:
1. PWA Service Worker (đã cài đặt ngầm từ lúc vào cổng di tích) chặn bắt request.
2. Trả về App Shell và trang `stations/01_kitchen` từ CacheStorage.
3. Nếu file MP3 của trạm đó chưa kịp nạp: Hệ thống dùng `window.speechSynthesis` đọc nội dung `short_summary` và `human_story_hook` được lưu trữ sẵn trong Bundle JSON.
4. Mọi thông số Zone 1 và Cinema Ticker hoạt động 100%.

OUTCOME: Ứng dụng vẫn hoạt động ngay cả khi chưa từng tải file âm thanh gốc trước đó.
