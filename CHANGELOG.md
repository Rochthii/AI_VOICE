# 📝 CHANGELOG: CỦ CHI VOICE GUIDE

Tất cả các thay đổi đáng chú ý của dự án sẽ được ghi nhận tại tài liệu này theo định dạng [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.4.0-alpha] - 2026-08-20

### Added - Hoàn Thành 100% Phase 1 (Nền Móng, Tokens & Strict TypeScript)
- **Task 1.1:** `package.json` cài đặt Next.js 14, React 18, Tailwind CSS, Lucide Icons, clsx, tailwind-merge.
- **Task 1.2:** `tsconfig.json` cấu hình TypeScript Strict Mode và alias `@/*`.
- **Task 1.3:** `tailwind.config.ts` tích hợp toàn bộ Design Tokens phong cách Sonic Monolith (`tunnel-base: #0D0E11`, `tunnel-amber: #E5A93C`, `tunnel-jade: #2DD4BF`, `tunnel-rust: #9A3412`, `tunnel-chalk: #F3F4F6`).
- **Task 1.4:** `postcss.config.mjs` và `next.config.mjs`.
- **Task 1.5:** `src/app/globals.css` khóa cứng giao diện hầm tối Zero-Scroll $100\text{vh}$, ẩn scrollbar và hiệu ứng sóng âm `@keyframes rippleWave`.
- **Task 1.6:** `src/types/station.ts` định nghĩa TypeScript interfaces cho 5 trạm di tích (`Station`, `StationSafety`, `AudioAsset`, `StationFAQ`).
- **Task 1.7:** `src/types/rag.ts` định nghĩa TypeScript interfaces cho RAG Vector Search & AI Payload (`HistoryChunk`, `RAGMatchResult`, `AIQueryRequest`, `AIQueryResponse`).

---

## [0.3.3-alpha] - 2026-08-20
### Added
- Thiết lập Atomic Work Breakdown 36 Micro-Tasks (`docs/ATOMIC_WORK_BREAKDOWN.md`).

---

## [0.3.2-alpha] - 2026-08-20
### Added
- Tích hợp Kỹ năng Vector toán thuần 15 dòng (`skills/skill_vector_math.md`) và Kiến trúc Hybrid 0MB.

---

## [0.3.1-alpha] - 2026-08-20
### Added
- Thiết lập tệp tin đặc tả MVP gốc (`MVP.md`).

---

## [0.3.0-alpha] - 2026-08-20
### Added
- Đóng gói Master Blueprint (`docs/MASTER_BLUEPRINT.md`) và Mục lục 10 Kỹ năng AI.
