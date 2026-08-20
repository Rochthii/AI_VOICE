# Use Case: UC-05 Mất Sóng Đột Ngột Khi Đang Gửi Câu Hỏi AI
ACTOR: Du khách dưới tầng hầm sâu (mất kết nối 4G/WiFi)
TRIGGER: Gửi câu hỏi AI nhưng API fetch timeout > 3.0s hoặc network error
STATE: `PROCESSING` -> `OFFLINE_FALLBACK`

STEPS:
1. Fetch API tới `/api/ask` không phản hồi sau 3.0s.
2. KHÔNG hiển thị modal báo lỗi sập ứng dụng.
3. Thuật toán tra cứu nội bộ (Local Keyword Search) tìm câu hỏi tương tự trong danh sách `faqs` có sẵn của trạm trong `stations.json`.
4. Nếu khớp FAQ: Trình duyệt phát âm thanh câu trả lời FAQ có sẵn.
5. Nếu không khớp: AI phát câu thông báo trấn an nhẹ: "Hiện đang ở vùng mất sóng, tôi xin phát lại phần thuyết minh trọng tâm của trạm."

OUTCOME: Hệ thống không crash, luôn có âm thanh phản hồi liên tục cho du khách.
