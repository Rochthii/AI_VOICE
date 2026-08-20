# Use Case: UC-16 Khách Hỏi Câu Bẫy / Lạc Đề / Xuyên Tạc Lịch Sử
ACTOR: Du khách hỏi các câu hỏi nhạy cảm, so sánh chính trị hoặc sai lệch lịch sử
TRIGGER: Câu hỏi người dùng không khớp với sự thật lịch sử trong RAG Vector DB
STATE: `GUARDRAIL_INTERCEPT`

STEPS:
1. RAG Vector Engine tính toán điểm tương đồng Cosine Score < 0.78 hoặc phát hiện từ khóa không thuộc sử liệu đã duyệt.
2. Kích hoạt `skill_guardrail.md`.
3. AI từ chối suy đoán và đính chính ngắn gọn, trung thực theo sự thật lịch sử trong 2 câu:
   - VI: "Mọi thông tin lịch sử tại đây đều dựa trên tư liệu chính thức của Ban Quản Lý Di Tích. Vũ khí của du kích Củ Chi chủ yếu là vũ khí thô sơ tự tạo và cải tiến từ vũ khí thu được của đối phương."
   - EN: "Our records reflect official historical archives. Cu Chi guerillas primarily used handmade bamboo traps and captured equipment adapted for defense."

OUTCOME: Bảo toàn 100% tính chính xác lịch sử, loại bỏ hoàn toàn nguy cơ ảo giác hoặc tranh cãi nhạy cảm.
