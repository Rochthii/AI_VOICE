# 🧠 AGENT SKILLS REGISTRY: TINH GỌN & CHUYÊN NGHIỆP

Tài liệu định nghĩa các kỹ năng (Functional Skills) chuyên biệt được đóng gói để AI xử lý luồng công việc một cách chính xác, không thừa thãi.

---

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AI SKILLS PIPELINE MAP                          │
├──────────────────────────┬──────────────────────────┬──────────────────┤
│ 1. ROUTE & INTENT        │ 2. GUARDRAIL & VERIFY    │ 3. VOICE FORMAT  │
│ [Skill: route_location]  │ [Skill: verify_history]  │ [Skill: tts_fmt] │
│ - Match station_id       │ - Cosine Score >= 0.78   │ - Remove Markdown│
│ - Language alignment     │ - Strict facts only      │ - Words <= 40    │
└──────────────────────────┴──────────────────────────┴──────────────────┘
```

---

## 🛠️ SKILL 1: `skill_route_and_classify`
* **Đầu vào (Input):** `{ query: string, current_station_id: string, lang: 'vi' | 'en' }`
* **Hành vi (Action):**
  1. Kiểm tra xem `query` có chứa thực thể của trạm khác không (VD: từ khóa "bẫy", "lỗ thở", "chỉ huy", "cấp cứu", "bếp").
  2. Nếu có $\rightarrow$ Trả về `target_station_id`.
  3. Nếu không có $\rightarrow$ Giữ nguyên `current_station_id`.
* **Đầu ra (Output):** `{ resolved_station_id: string, query_clean: string }`

---

## 🛠️ SKILL 2: `skill_strict_history_guard`
* **Đầu vào (Input):** `{ context_chunks: HistoryChunk[], user_query: string }`
* **Hành vi (Action):**
  1. Nếu `context_chunks` rỗng hoặc độ tương đồng cao nhất $< 0.78$:
     * Trả về câu từ chối chuẩn mực theo ngôn ngữ (Không kích hoạt LLM sáng tác).
  2. Nếu có context $\rightarrow$ Chỉ truyền đúng facts vào prompt để tổng hợp câu trả lời.
* **Đầu ra (Output):** `{ is_safe: boolean, grounded_answer: string }`

---

## 🛠️ SKILL 3: `skill_voice_stream_formatter`
* **Đầu vào (Input):** `{ raw_text: string, lang: 'vi' | 'en' }`
* **Hành vi (Action):**
  1. Xóa toàn bộ ký tự định dạng: `*`, `#`, `_`, `-`, `[]`, `()`, `"`.
  2. Giới hạn độ dài: Cắt tối đa 2 câu kết thúc bằng dấu chấm (`.`).
  3. Chuẩn hóa phát âm: Đổi ký hiệu `250km` thành `250 ki-lô-mét`.
* **Đầu ra (Output):** `{ speech_ready_text: string }`
