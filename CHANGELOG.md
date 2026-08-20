# 📝 CHANGELOG: CHI VOICE

Tất cả các thay đổi đáng chú ý của dự án sẽ được ghi nhận tại tài liệu này theo định dạng [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.5.2-beta] - 2026-08-20

### Added - Hệ Thống Phản Biện Chống Ảo Giác, Kích Động & Xuyên Tạc Lịch Sử
- **Đặc tả chuyên sâu [`docs/HISTORICAL_GUARDRAIL_AND_REBUTTAL_SYSTEM.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/HISTORICAL_GUARDRAIL_AND_REBUTTAL_SYSTEM.md):**
  * Thiết lập ma trận phản biện 5 nhóm câu hỏi bẫy/kích động (Phủ nhận tính tự nguyện đào hầm, bôi nhọ anh hùng Tô Văn Đực/Võ Hoàng Lê, kích động thù hằn/so sánh phiến diện, nghi ngờ số lượng 44.357 liệt sĩ Đền Bến Dược, bẫy kỹ thuật giải thiêng công sự và jailbreaks/counter-factual prompts).
- **Hiện thực hóa mã nguồn [`src/lib/guardrails.ts`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/src/lib/guardrails.ts):**
  * Module TypeScript sản xuất 3 tầng (`Tier 1: Deterministic Interception`, `Tier 2: Cosine Score >= 0.78`, `Tier 3: Strict Prompt Constraints`).
  * Trả về câu phản biện đanh thép, đàng hoàng, lịch thiệp từ 7 nguồn sử liệu mà không cần phụ thuộc vào LLM.
- **Nâng cấp Kỹ năng & Agent Skill:**
  * [`skills/skill_guardrail.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/skills/skill_guardrail.md) & [`.agent/skills/cuchi-rag-historian/SKILL.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/.agent/skills/cuchi-rag-historian/SKILL.md).

---

## [0.5.1-beta] - 2026-08-20
### Changed
- Đồng bộ toàn bộ tài liệu kỹ thuật, dữ liệu 5 trạm và khởi tạo Agent Skill cuchi-rag-historian.

---

## [0.5.0-beta] - 2026-08-20
### Milestone
- Hoàn tất 100% đối soát thẩm định 8 Chương Sử Liệu (Zero Hallucination Ground Truth).
