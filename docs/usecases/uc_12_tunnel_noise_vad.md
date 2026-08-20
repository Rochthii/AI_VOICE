# Use Case: UC-12 Lọc Ồn Tiếng Quạt Thông Gió Hầm Bằng VAD
ACTOR: Du khách nói câu hỏi gần khu vực quạt thông gió hầm kêu ù ù
TRIGGER: Người dùng giữ nút nói trong môi trường tỷ lệ tín hiệu trên tạp âm thấp (Low SNR)
STATE: `NOISE_FILTERING_AUDIO`

STEPS:
1. Web Audio API áp dụng `BiquadFilterNode` (High-Pass Filter 150Hz) để cắt bỏ toàn bộ tiếng ù tần số thấp của quạt gió.
2. Thuật toán VAD (Voice Activity Detection) phân tích năng lượng giọng nói người (Voice Band 300Hz - 3400Hz).
3. Chỉ thu thập các khung dữ liệu âm thanh vượt ngưỡng RMS > 0.02.
4. Gửi âm thanh đã được làm sạch tiếng ồn lên STT Model.

OUTCOME: Tỷ lệ nhận diện đúng câu hỏi (Word Accuracy) đạt > 95% ngay trong môi trường hầm ồn ào.
