# 🏗️ SYSTEM ARCHITECTURE: CỦ CHI VOICE GUIDE
### *(Kiến Trúc Hybrid Siêu Nhẹ: Offline-First & Edge Voice AI)*

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG

Hệ thống loại bỏ hoàn toàn việc nhồi nhét mô hình AI nặng vào Client (chống sập RAM di động), thay vào đó áp dụng **Mô hình Hybrid 0MB Client-Weight**:

```
+-------------------------------------------------------------------------+
|                        CLIENT TIER (PWA - DƯỚI 2.5MB)                   |
|  Next.js 14 App Router + Tailwind CSS + Web Audio API (Singleton)       |
|                                                                         |
|  +---------------------------------+  +------------------------------+  |
|  |     OFFLINE CACHE ENGINE        |  |     SONIC MONOLITH UI        |  |
|  |  Service Worker Cache-First     |  |  Zone 1: Beacon An Toàn 20vh |  |
|  |  5 Preloaded .mp3 Station Files |  |  Zone 2: Quả Cầu Âm Bản 50vh |  |
|  |  Native Web Speech API (0 MB)   |  |  Zone 3: Cinema Ticker 30vh  |  |
|  +---------------------------------+  +------------------------------+  |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |  IN-MEMORY VECTOR MATH (0 KB Dependency, Float32 Cosine in 0.2ms)  |  |
|  |  50 Granular History Chunks (80KB JSON)                           |  |
|  +-------------------------------------------------------------------+  |
+------------------------------------+------------------------------------+
                                     │
                    (Khi có kết nối mạng / Trạm dừng rộng)
                                     ▼
+-------------------------------------------------------------------------+
|                        EDGE CLOUD VOICE AI PIPELINE                     |
|                                                                         |
|  [User Voice / Text Payload]                                            |
|                │                                                        |
|                ▼                                                        |
|  [Next.js Edge API Route: /api/ask]                                     |
|                │                                                        |
|                ▼                                                        |
|  [RAG Semantic Matcher & Strict Historical Guardrails]                  |
|  (Cosine Score >= 0.78 / Pure Cu Chi Verified Archives)                 |
|                │                                                        |
|                ▼                                                        |
|  [LLM Voice Synthesis: Max 35 words, 2 short sentences]                 |
|                │                                                        |
|                ▼                                                        |
|  [TTS Audio Stream + SSE Text -> Push to Client Earphones & Ticker]     |
+-------------------------------------------------------------------------+
```

---

## 2. CHIẾN LƯỢC SERVICE WORKER CACHE-FIRST (LẤY CẢM HỨNG TỪ AUDIOGUIDEKIT)

1. **Pre-cache khi vừa vào App:** Tải toàn bộ App Shell ($< 2.5\text{MB}$) và 5 file `.mp3` âm thanh gốc.
2. **Offline Interceptor:**
   * Yêu cầu audio `/audio/stations/*.mp3` $\rightarrow$ Trả về từ Cache tức thì ($< 50\text{ms}$).
   * Yêu cầu dữ liệu trạm `/data/*.json` $\rightarrow$ Stale-While-Revalidate.
   * Yêu cầu AI `/api/ask` $\rightarrow$ Nếu offline, tự động chuyển hướng sang bộ FAQ có sẵn của trạm đó.

---

## 3. THUẬT TOÁN VECTOR TOÁN THUẦN (IN-MEMORY COSINE SIMILARITY)

```typescript
// 15 dòng code toán thuần - Không cần cài thư viện ngoài 30MB
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```
* **Thời gian tính toán:** $< 0.2\text{ms}$ cho toàn bộ $50$ chunks trên CPU điện thoại.
* **Độ trễ khởi động:** $0\text{ms}$ (Không có thời gian nạp model Wasm).
