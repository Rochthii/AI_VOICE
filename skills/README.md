# 🧠 AI SKILLS REGISTRY: CỦ CHI VOICE GUIDE

Thư mục này chứa **11 Kỹ Năng Tinh Gọn (Single-Task AI Skills)**, mỗi file chỉ đảm nhiệm đúng 1 trách nhiệm duy nhất, cú pháp cô đọng `TASK - INPUT - RULES - OUTPUT`, tiêu thụ $\sim 100\text{ tokens}$/file:

---

## 📋 DANH MỤC 11 KỸ NĂNG AI (1 FILE = 1 NHIỆM VỤ)

| Tên File Skill | Nhiệm Vụ Cốt Lõi | Tài Liệu Tham Chiếu |
| :--- | :--- | :--- |
| [`skill_sonic_monolith_ui.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/skills/skill_sonic_monolith_ui.md) | Cưỡng chế bố cục 3-Zone $100\text{vh}$ và quy tắc Zero-Scroll khi đi hầm. | [`BRAND.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/BRAND.md) |
| [`skill_ui_ux_interactions.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/skills/skill_ui_ux_interactions.md) | Điều khiển vật lý chạm ngón tay cái, rung Haptics ($40\text{ms}$) và Canvas FFT. | [`docs/UI_UX_SPECIFICATION.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/UI_UX_SPECIFICATION.md) |
| [`skill_safety_brief.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/skills/skill_safety_brief.md) | Sinh câu trấn an an toàn & thông số đoạn hầm ($\le 25$ từ) khi du khách bước vào. | [`docs/HISTORICAL_DATA_SCHEMA.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/HISTORICAL_DATA_SCHEMA.md) |
| [`skill_storytelling.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/skills/skill_storytelling.md) | Chuyển đổi sử liệu khô khan thành câu chuyện con người xúc động ($\le 45$ từ). | [`AGENT.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/AGENT.md) |
| [`skill_route.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/skills/skill_route.md) | Phân loại và định tuyến câu hỏi chính xác vào `location_id` của 5 trạm di tích. | [`docs/HISTORICAL_DATA_SCHEMA.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/HISTORICAL_DATA_SCHEMA.md) |
| [`skill_guardrail.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/skills/skill_guardrail.md) | Kiểm duyệt sử liệu chống ảo giác (Cosine Score $\ge 0.78$), từ chối lịch sự nếu ngoài phạm vi. | [`AGENT.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/AGENT.md) |
| [`skill_vector_math.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/skills/skill_vector_math.md) | [MỚI] Tính toán khoảng cách Cosine thuần 15 dòng code (0KB dependency, < 1ms, 0MB RAM). | [`docs/ARCHITECTURE.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/ARCHITECTURE.md) |
| [`skill_voice_fmt.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/skills/skill_voice_fmt.md) | Tối ưu văn bản cho Cinema Ticker 1 dòng và giọng đọc TTS ($\le 35$ từ). | [`docs/MASTER_BLUEPRINT.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/MASTER_BLUEPRINT.md) |
| [`skill_audio_lifecycle.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/skills/skill_audio_lifecycle.md) | Quản lý Singleton Web Audio, mở khóa iOS Autoplay bằng Silent Buffer, giải phóng Mic. | [`docs/ENGINEERING_STANDARDS.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/ENGINEERING_STANDARDS.md) |
| [`skill_offline_cache.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/skills/skill_offline_cache.md) | Chiến lược Cache-First cho 5 file `.mp3` của Service Worker khi mất mạng ngầm. | [`docs/ARCHITECTURE.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/ARCHITECTURE.md) |
| [`skill_edgecase_handler.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/skills/skill_edgecase_handler.md) | Xử lý hoảng loạn hầm hẹp (Panic 3-tap), mồ hôi rơi trên màn hình, rơi tai nghe Bluetooth. | [`docs/ATOMIC_DECOMPOSITION_AND_USECASES.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/ATOMIC_DECOMPOSITION_AND_USECASES.md) |

---

## 🔗 MA TRẬN LIÊN KẾT
Xem chi tiết mối quan hệ giữa 11 Kỹ năng này với 16 Use Cases tại [`docs/TRACEABILITY_MATRIX.md`](file:///e:/Projects/Project_ca_nhan/AI_VOICE/docs/TRACEABILITY_MATRIX.md).
