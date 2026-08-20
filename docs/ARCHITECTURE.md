# 🏗️ SYSTEM ARCHITECTURE: CỦ CHI VOICE GUIDE (v2.0)
### *(Kiến Trúc Hybrid Zero-Latency: Offline-First, Multi-Tier AI Failover & Universal i18n)*

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG (SYSTEM OVERVIEW)

Hệ thống loại bỏ hoàn toàn việc nhồi nhét mô hình AI nặng vào Client (chống sập RAM di động), thay vào đó áp dụng **Mô hình Hybrid 5 Tầng**:

```
+-----------------------------------------------------------------------------------------+
|                              CLIENT TIER (PWA DƯỚI 2.5MB)                               |
|  Next.js 14 App Router + Tailwind CSS + Web Audio Engine (Singleton)                    |
|                                                                                         |
|  +-------------------------------------+  +-------------------------------------------+ |
|  |       OFFLINE RUNTIME ENGINE        |  |          SONIC MONOLITH 3-ZONE UI         | |
|  |  • In-Memory RAG Cosine (<0.2ms)    |  |  Zone 1: SafetyBeacon (20vh) + 6-Lang i18n| |
|  |  • 5 Preloaded MP3 Station Audios   |  |  Zone 2: SonicOrb 3D Obsidian (50vh)      | |
|  |  • Web Speech STT/TTS (BCP-47 auto) |  |  Zone 3: CinemaTicker Subtitle (30vh)     | |
|  +-------------------------------------+  +-------------------------------------------+ |
+--------------------------------------------+--------------------------------------------+
                                             │ POST /api/ask (SSE Stream)
                                             ▼
+-----------------------------------------------------------------------------------------+
|                  EDGE HYBRID PROCESSING PIPELINE (5 TẦNG TỐI ƯU TOKEN)                  |
|                                                                                         |
|  [Tầng 0: Guardrail Interceptor] ──► Chặn xuyên tạc 44.357 liệt sĩ, kích động (0ms, 0t) |
|  [Tầng 1: In-Memory Semantic Cache] ──► LRU Cache 300 câu hỏi, diacritic-aware (20-80ms)|
|  [Tầng 2: Zero-Cost Query Classifier] ──► Phân loại FACTUAL/SAFETY/NARRATIVE/GENERAL    |
|  [Tầng 3: In-Memory RAG Engine] ──► Quét Cosine 21 chunks sử liệu nguyên tử (<0.2ms)    |
|  [Tầng 4: Multi-Provider AI Streaming] ──► Universal Compact Prompt (~110t, ≤600t total)|
|  [Tầng 5: Offline RAG Fallback] ──► Đảm bảo 100% trả lời khi mất mạng ở hầm sâu 12m     |
+--------------------------------------------+--------------------------------------------+
                                             │
                                             ▼
+-----------------------------------------------------------------------------------------+
|               MULTI-TIER AI PROVIDER ENGINE (INSTANT FAILOVER 0ms DELAY)                |
|                                                                                         |
|  Tier 1: Groq API (x2 Keys) ──► groq/compound-mini & openai/gpt-oss-20b (TTFT: 200-400ms) |
|  Tier 2: Google Gemini (x2 Keys) ──► gemini-2.5-flash & flash-lite (TTFT: 400-600ms)    |
|  Tier 3: OpenRouter Free Models ──► LLaMA 3.1 8B, Mistral 7B, Gemma 2 9B (TTFT: ~1s)   |
|  Circuit Breaker: 2 lần lỗi ──► Tự động cách ly 3-10 phút ──► Tự phục hồi               |
+--------------------------------------------+--------------------------------------------+
                                             │
                                             ▼
+-----------------------------------------------------------------------------------------+
|           PERSISTENCE & COMPLIANCE TIER (SUPABASE CLOUD POSTGRESQL + PGVECTOR)          |
|                                                                                         |
|  • knowledge_topics     : 6 danh mục chủ đề (Bếp, Quân y, Chỉ huy, Bẫy, Liệt sĩ...)     |
|  • stations             : 5 trạm thực địa (tọa độ, độ sâu hầm, lối thoát, audio đa ngữ)  |
|  • history_knowledge    : 21 atomic chunks sử liệu + pgvector + 7 nguồn bảo chứng       |
|  • station_faqs         : 10 câu hỏi & đáp thực địa                                     |
|  • shared_semantic_cache: Cloud Cache chia sẻ giữa hàng nghìn du khách (TTL 7 ngày)     |
|  • audit_logs           : Nhật ký kiểm toán BẤT BIẾN (RLS Enabled, chỉ cho phép INSERT) |
+-----------------------------------------------------------------------------------------+
```

---

## 2. PIPELINE 5 TẦNG TỐI ƯU TOKEN & ĐỘ TRỄ

| Tầng | Tên thành phần | Thời gian xử lý | Token tiêu thụ | Trách nhiệm |
| :---: | :--- | :---: | :---: | :--- |
| **0** | `Guardrail Interceptor` | **0ms** | **0 token** | Bẫy kích động, xuyên tạc số liệu liệt sĩ, jailbreak roleplay |
| **1** | `Semantic Cache (LRU)` | **20 – 80ms** | **0 token** | Lưu 300 câu hỏi phổ biến kèm chuẩn hóa dấu tiếng Việt |
| **2** | `Query Classifier` | **1ms** | **0 token** | Phân loại intent: `FACTUAL`, `SAFETY`, `NARRATIVE`, `GENERAL` |
| **3** | `In-Memory RAG` | **< 0.2ms** | **0 token** | Quét Cosine Vector 10 chiều trên RAM không phụ thuộc mạng |
| **4** | `Streaming AI (SSE)` | **1.2 – 1.5s** | **≤ 600 tokens** | Gọi Groq/Gemini/OpenRouter stream từng từ về client |
| **5** | `Offline RAG Fallback` | **0ms** | **0 token** | Đảm bảo luôn có câu trả lời chính xác khi đứt mạng 100% |

---

## 3. HỆ THỐNG ĐA NGÔN NGỮ QUỐC TẾ (UNIVERSAL i18n)

- **6 Ngôn ngữ chính thức:** 🇻🇳 Tiếng Việt, 🇬🇧 English, 🇫🇷 Français, 🇯🇵 日本語, 🇰🇷 한국어, 🇨🇳 中文.
- **Universal Prompt Builder:** Không nhân bản prompt riêng cho từng thứ tiếng (tốn kém token). Dùng **1 Prompt (~110 tokens)**, AI tự động nhận diện ngôn ngữ của câu hỏi và phản hồi bằng đúng ngôn ngữ đó.
- **Web Speech API Tự Động Đồng Bộ:** Chuyển đổi mã BCP-47 (`vi-VN`, `en-US`, `fr-FR`, `ja-JP`, `ko-KR`, `zh-CN`) cho cả Microphone (STT) và Giọng đọc (TTS).

---

## 4. BẢO MẬT & KIỂM TOÁN SUPABASE (ENTERPRISE DATABASE)

1. **Row Level Security (RLS):** Kích hoạt trên 100% các bảng public.
2. **Tính Bất Biến (Audit Immutability):** Bảng `audit_logs` chỉ cho phép `INSERT`, nghiêm cấm `UPDATE` và `DELETE` để bảo vệ giá trị lịch sử và pháp lý.
3. **pgvector & GIN Index:** Tối ưu hóa truy vấn vector và full-text search dưới 5ms.
