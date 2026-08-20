# 📝 CHANGELOG: CHI VOICE

Tất cả các thay đổi đáng chú ý của dự án sẽ được ghi nhận tại tài liệu này theo định dạng [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.4.2-alpha] - 2026-08-20

### Added - Hoàn Thành 100% Phase 2 (Tích Hợp Sử Liệu Chuẩn Hóa Ground Truth RAG)
- **Tích hợp Tài Liệu Thẩm Định:** Tích hợp dữ liệu từ tài liệu bảo chứng bởi Ban Quản lý Di tích Lịch sử Địa đạo Củ Chi (Bộ Tư lệnh TP.HCM) & Viện Lịch sử Quân sự Việt Nam.
- **Task 2.1 - 2.5:** [`src/data/stations.json`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/src/data/stations.json) lưu trữ đầy đủ dữ liệu 5 trạm thực tế (Bếp Hoàng Cầm, Hầm Cấp Cứu, Hầm Chỉ Huy, Lỗ Thông Hơi, Khu Bẫy Chông) tích hợp thông số an toàn hầm, câu chuyện con người xúc động và bộ câu hỏi FAQ chuẩn.
- **Task 2.6:** [`src/data/history_knowledge.json`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/src/data/history_knowledge.json) đóng gói 17 RAG Chunks chi tiết với đầy đủ từ khóa và vector Float32 phục vụ tìm kiếm ngữ nghĩa In-Memory tức thì ($< 0.2\text{ms}$).

---

## [0.4.1-alpha] - 2026-08-20
### Added
- Khóa tên dự án chính thức: **CHI VOICE — Hệ Thống Thuyết Minh Viên Giọng Nói AI Di Tích Lịch Sử Địa Đạo Củ Chi**.

---

## [0.4.0-alpha] - 2026-08-20
### Added
- Hoàn thành 100% Phase 1 (Nền móng, Tokens & Strict TypeScript).

---

## [0.3.3-alpha] - 2026-08-20
### Added
- Thiết lập Atomic Work Breakdown 36 Micro-Tasks (`docs/ATOMIC_WORK_BREAKDOWN.md`).
