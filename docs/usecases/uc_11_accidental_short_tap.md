# Use Case: UC-11 Du Khách Buông Tay Quá Nhanh (< 350ms)
ACTOR: Du khách vô tình chạm trúng Quả Cầu Âm Bản nhưng nhấc tay lên ngay
TRIGGER: `touchend` xảy ra khi `Date.now() - touchStartTime < 350ms`
STATE: `SHORT_TAP_ABORT`

STEPS:
1. Hệ thống phát hiện thời gian giữ nút quá ngắn để tạo thành một câu hỏi có nghĩa.
2. Hủy lệnh ghi âm, giải phóng Micro ngay lập tức.
3. Không gửi request lên backend AI.
4. Hiện tooltip ngắn trong 1.5s: "Chạm và GIỮ ngón tay để đặt câu hỏi".

OUTCOME: Chống gửi các đoạn audio rác/câm lên server, tối ưu trải nghiệm tương tác.
