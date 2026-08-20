# Use Case: UC-02 Hỏi Đáp Giọng Nói AI Tại Trạm Dừng
ACTOR: Du khách dừng chân tại hầm rộng
TRIGGER: Chạm và giữ Quả Cầu Âm Bản (Zone 2) > 350ms
STATE: `ACTIVE_MONOLITH` -> `LISTENING` -> `PROCESSING` -> `SPEAKING`

STEPS:
1. Chạm giữ: Vibrate 40ms + SFX click tre (120Hz). Quả cầu nở to 110%.
2. Du khách nói: "Tại sao bếp này không bị phát hiện khói?".
3. Thả tay: Vibrate [20, 30, 20]. Hệ thống gửi audio/text lên RAG API.
4. RAG khớp chunk `chunk_kitchen_01` (Score >= 0.78).
5. Stream TTS Audio phát vào tai nghe + Cinema Ticker chạy chữ đồng thời (< 40 từ).

OUTCOME: Du khách được giải đáp tò mò ngay lập tức trong 2 câu ngắn.
