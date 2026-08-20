# Use Case: UC-08 Mạng Chập Chờn 1 Vạch Sóng (Low Bandwidth)
ACTOR: Du khách ở gần lỗ thông hơi, sóng 2G/EDGE nhảy liên tục
TRIGGER: Network latency > 1500ms hoặc packet loss cao
STATE: `LOW_BANDWIDTH_MODE`

STEPS:
1. Hệ thống phát hiện mạng không ổn định -> Bật badge `🟡 MẠNG YẾU`.
2. Tắt hoàn toàn việc stream Audio Binary nặng từ server.
3. Khi người dùng hỏi: Chỉ gửi Text ngắn lên Server và chỉ nhận Text về qua SSE (tiêu tốn < 1KB data).
4. TTS âm thanh được chuyển giao cho Web Speech Synthesis của trình duyệt tự tổng hợp giọng nói.

OUTCOME: Tiết kiệm 98% băng thông, phản hồi giọng nói vẫn diễn ra dưới 1.2s.
