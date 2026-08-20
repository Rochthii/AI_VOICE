# 🎙️ CHI VOICE — Hệ Thống Thuyết Minh Viên Giọng Nói AI Di Tích Lịch Sử Địa Đạo Củ Chi

> **Web App (PWA) thuyết minh viên giọng nói AI thông minh tại Di tích Lịch sử Quốc gia Đặc biệt Địa đạo Củ Chi — Phong cách độc bản "Sonic Monolith", hoạt động mượt mà cả khi mất 100% sóng dưới lòng đất.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline_First-success)](https://web.dev/progressive-web-apps/)
[![Brand](https://img.shields.io/badge/Brand-CHI_VOICE-amber)](BRAND.md)
[![Design](https://img.shields.io/badge/Design-Sonic_Monolith-amber)](BRAND.md)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🏛️ THÔNG TIN DỰ ÁN ĐĂNG KÝ CHÍNH THỨC
* **Tên chính thức (Tiếng Việt):** CHI VOICE — Hệ Thống Thuyết Minh Viên Giọng Nói AI Di Tích Lịch Sử Địa Đạo Củ Chi
* **Tên quốc tế (Tiếng Anh):** CHI VOICE — AI-Powered Historical Voice Guide for Cu Chi Tunnels
* **Tên thương hiệu ngắn:** **CHI VOICE** (hoặc **CHI**)
* **Khẩu hiệu (Slogan):** *"Chạm một lần – Nghe xuyên hầm – An tâm từng bước"*
* **Định danh AI Guide:** Nhân vật "Chi" (C.H.I — *Cu Chi Historical Intelligence*)

---

## 🔗 HỆ THỐNG LIÊN KẾT CHẶT CHẼ TOÀN BỘ DỰ ÁN

| Danh mục | Tài liệu chính & Đường dẫn | Trách nhiệm cốt lõi |
| :--- | :--- | :--- |
| **Bản đồ Liên kết** | [`docs/TRACEABILITY_MATRIX.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/TRACEABILITY_MATRIX.md) | Ma trận đối soát 16 Use Cases $\longleftrightarrow$ 11 Skills $\longleftrightarrow$ Mã nguồn |
| **Bản Đặc Tả MVP** | [`MVP.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/MVP.md) & [`docs/MASTER_BLUEPRINT.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/MASTER_BLUEPRINT.md) | Đặc tả 2 chế độ cốt lõi, dữ liệu thật 5 trạm và 5 bài test nghiệm thu |
| **Nhân cách AI** | [`AGENT.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/AGENT.md) | Persona "Chi" — Trấn an an toàn, kể chuyện xúc động, chống ảo giác 100% |
| **Thiết kế Độc bản** | [`BRAND.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/BRAND.md) | "Sonic Monolith" — Bố cục 3-Zone $100\text{vh}$, Quả cầu $220\text{px}$, Phụ đề Ticker |
| **Yêu cầu & Kiến trúc**| [`docs/PRD.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/PRD.md) & [`docs/ARCHITECTURE.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/ARCHITECTURE.md) | Đặc tả chức năng, PWA Cache và Pipeline Voice AI |
| **Lộ trình Micro-Tasks**| [`docs/ATOMIC_WORK_BREAKDOWN.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/ATOMIC_WORK_BREAKDOWN.md) | Lộ trình 6 Phase & 36 Micro-Tasks nguyên tử |
| **Sử liệu 5 Trạm** | [`docs/HISTORICAL_DATA_SCHEMA.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/HISTORICAL_DATA_SCHEMA.md) | Dữ liệu thật 100% kèm thông số an toàn không gian ngầm |
| **Quy chuẩn Code** | [`docs/ENGINEERING_STANDARDS.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/ENGINEERING_STANDARDS.md) | Quy tắc phát triển FE, BE, Web Audio, Memory, Strict TypeScript |
| **Chống Bẫy Lập Trình**| [`docs/CRITICAL_PITFALLS_AND_PREVENTIONS.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/CRITICAL_PITFALLS_AND_PREVENTIONS.md) | Giải pháp xử lý 6 bẫy kinh điển (iOS autoplay, rác RAM, AI bloat trap) |
| **11 Kỹ Năng AI** | [`skills/`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/skills/) | 11 kỹ năng tinh gọn $\sim 100\text{ tokens}$/file (Single Responsibility) |
| **16 Use Cases** | [`docs/usecases/`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/usecases/README.md) | 16 kịch bản thực tế vi mô đến vĩ mô |

---

## 📁 SƠ ĐỒ THƯ MỤC CHUẨN CỦA DỰ ÁN

```
AI_VOICE/
├── AGENT.md                      # Nhân cách "Chi", System Prompt, Guardrails
├── BRAND.md                      # Design System "CHI VOICE" & "Sonic Monolith"
├── CHANGELOG.md                  # Nhật ký phiên bản chuẩn Keep a Changelog
├── README.md                     # Tài liệu tổng quan dự án
├── MVP.md                        # Bản đặc tả MVP chính thức
│
├── docs/                         # TÀI LIỆU KỸ THUẬT & TRUY VẾT
│   ├── MASTER_BLUEPRINT.md       # Bản thiết kế tổng thể (Master Blueprint)
│   ├── TRACEABILITY_MATRIX.md    # [CORE] Ma trận liên kết 16 UC <-> 11 Skills <-> Mã nguồn
│   ├── ATOMIC_WORK_BREAKDOWN.md  # Lộ trình 6 Phase & 36 Micro-Tasks nguyên tử
│   ├── ARCHITECTURE.md           # Kiến trúc Hybrid 0MB & Offline Cache
│   ├── PRD.md                    # Bản đặc tả yêu cầu sản phẩm MVP
│   ├── HISTORICAL_DATA_SCHEMA.md # Schema 5 trạm di tích & RAG Chunks
│   ├── ENGINEERING_STANDARDS.md  # Quy chuẩn phát triển mã nguồn & Sonic Monolith
│   ├── CRITICAL_PITFALLS_AND_PREVENTIONS.md # 6 bẫy kỹ thuật kinh điển
│   ├── UI_UX_SPECIFICATION.md    # Đặc tả UI/UX, vật lý cảm ứng & SFX gõ tre trầm
│   └── usecases/                 # 16 TỆP TIN USE CASES ĐỘC LẬP (uc_01 -> uc_16)
│       └── README.md
│
├── skills/                       # 11 KỸ NĂNG AI TINH GỌN (1 FILE = 1 TASK)
│   ├── README.md
│   ├── skill_sonic_monolith_ui.md
│   ├── skill_ui_ux_interactions.md
│   ├── skill_safety_brief.md
│   ├── skill_storytelling.md
│   ├── skill_route.md
│   ├── skill_guardrail.md
│   ├── skill_vector_math.md
│   ├── skill_voice_fmt.md
│   ├── skill_audio_lifecycle.md
│   ├── skill_offline_cache.md
│   └── skill_edgecase_handler.md
│
├── public/                       # Audio Assets 5 trạm & PWA Service Worker
├── src/                          # Mã nguồn Next.js 14 App Router
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```
