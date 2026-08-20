/**
 * AI PROVIDER MANAGER — MULTI-TIER INSTANT FAILOVER ENGINE
 *
 * Thứ tự ưu tiên (Tier):
 *   Tier 1 — Groq (groq/compound + qwen/qwen3.6-27b) — NHANH NHẤT < 500ms
 *   Tier 2 — Google Gemini 2.5 Flash / 2.5 Flash Lite — Ổn định cao
 *   Tier 3 — OpenRouter (:free models) — Backup cuối cùng
 *
 * Circuit Breaker:
 *   - Sau 2 lần thất bại liên tiếp → provider vào cooldown (3-10 phút)
 *   - Sau hết cooldown → tự phục hồi, thử lại
 *   - Khi gặp lỗi → NGAY LẬP TỨC (0ms delay) chuyển provider tiếp theo
 */

export interface AIProvider {
  id: string;
  tier: number;
  name: string;
  model: string;
  apiKey: string;
  baseUrl: string;
  isHealthy: boolean;
  failureCount: number;
  lastFailTimeMs: number;
  cooldownMs: number;
}

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIProviderResponse {
  text: string;
  providerId: string;
  model: string;
  latencyMs: number;
}

// ─── KHỞI TẠO DANH SÁCH PROVIDER ────────────────────────────────────────────

function buildProviderList(): AIProvider[] {
  const providers: AIProvider[] = [];

  // ── TIER 1: GROQ — NHANH NHẤT ─────────────────────────────────────────────
  const groqModels = [
    { key: process.env.GROQ_API_KEY, model: "groq/compound", id: "groq_compound_1" },
    { key: process.env.GROQ_API_KEY, model: "qwen/qwen3.6-27b", id: "groq_qwen_1" },
    { key: process.env.GROQ_API_KEY_2, model: "groq/compound", id: "groq_compound_2" },
    { key: process.env.GROQ_API_KEY_2, model: "qwen/qwen3.6-27b", id: "groq_qwen_2" }
  ];

  groqModels.forEach(({ key, model, id }) => {
    if (!key) return;
    providers.push({
      id,
      tier: 1,
      name: `Groq [${model}]`,
      model,
      apiKey: key,
      baseUrl: "https://api.groq.com/openai/v1/chat/completions",
      isHealthy: true,
      failureCount: 0,
      lastFailTimeMs: 0,
      cooldownMs: 3 * 60 * 1000
    });
  });

  // ── TIER 2: GOOGLE GEMINI (Dùng đúng model names có trong API) ────────────
  const geminiModels = [
    { key: process.env.GEMINI_API_KEY, model: "gemini-2.5-flash", id: "gemini_25flash_1" },
    { key: process.env.GEMINI_API_KEY, model: "gemini-2.5-flash-lite", id: "gemini_25lite_1" },
    { key: process.env.GEMINI_API_KEY_2, model: "gemini-2.5-flash", id: "gemini_25flash_2" },
    { key: process.env.GEMINI_API_KEY_2, model: "gemini-2.5-flash-lite", id: "gemini_25lite_2" }
  ];

  geminiModels.forEach(({ key, model, id }) => {
    if (!key || !key.startsWith("AIza")) return;
    providers.push({
      id,
      tier: 2,
      name: `Gemini [${model}]`,
      model,
      apiKey: key,
      baseUrl: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      isHealthy: true,
      failureCount: 0,
      lastFailTimeMs: 0,
      cooldownMs: 5 * 60 * 1000
    });
  });

  // ── TIER 3: OPENROUTER (:free models) ─────────────────────────────────────
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey) {
    const freeModels = [
      "meta-llama/llama-3.1-8b-instruct:free",
      "mistralai/mistral-7b-instruct:free",
      "google/gemma-2-9b-it:free",
      "microsoft/phi-3-mini-128k-instruct:free"
    ];

    freeModels.forEach((model, idx) => {
      providers.push({
        id: `openrouter_${idx + 1}`,
        tier: 3,
        name: `OpenRouter [${model}]`,
        model,
        apiKey: openrouterKey,
        baseUrl: "https://openrouter.ai/api/v1/chat/completions",
        isHealthy: true,
        failureCount: 0,
        lastFailTimeMs: 0,
        cooldownMs: 10 * 60 * 1000
      });
    });
  }

  return providers;
}

// ─── SINGLETON STATE ─────────────────────────────────────────────────────────
const providers: AIProvider[] = buildProviderList();

function isProviderAvailable(p: AIProvider): boolean {
  if (p.isHealthy) return true;
  if (Date.now() - p.lastFailTimeMs >= p.cooldownMs) {
    p.isHealthy = true;
    p.failureCount = 0;
    return true;
  }
  return false;
}

function markProviderFailed(p: AIProvider): void {
  p.failureCount++;
  p.lastFailTimeMs = Date.now();
  if (p.failureCount >= 2) {
    p.isHealthy = false;
  }
}

function markProviderSuccess(p: AIProvider): void {
  p.isHealthy = true;
  p.failureCount = 0;
}

/** Sanitize text để dùng làm HTTP header value (chỉ ASCII printable) */
function sanitizeHeaderValue(val: string): string {
  return val.replace(/[^\x20-\x7E]/g, "?");
}

// ─── CALL GROQ / OPENROUTER (OpenAI-compatible format) ──────────────────────
async function callOpenAICompatible(
  provider: AIProvider,
  messages: AIMessage[]
): Promise<string> {
  const body: Record<string, unknown> = {
    model: provider.model,
    messages,
    max_tokens: 150,
    temperature: 0.5,
    stream: false
  };

  // Với Groq/qwen3, disable thinking để tránh token thừa
  if (provider.id.startsWith("groq_qwen")) {
    (body as Record<string, unknown>).reasoning_effort = "none";
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${provider.apiKey}`
  };

  if (provider.id.startsWith("openrouter")) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
    headers["HTTP-Referer"] = sanitizeHeaderValue(appUrl);
    headers["X-Title"] = "CHI VOICE";
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(provider.baseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`HTTP ${res.status}: ${errText.slice(0, 300)}`);
    }

    const data = await res.json();
    // Lấy content, bỏ phần <think>...</think> nếu có (qwen3 thinking)
    let text: string = data?.choices?.[0]?.message?.content?.trim() || "";
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    if (!text) throw new Error("Empty response from provider");
    return text;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── CALL GOOGLE GEMINI (REST API format khác OpenAI) ────────────────────────
async function callGemini(
  provider: AIProvider,
  messages: AIMessage[]
): Promise<string> {
  const systemMsg = messages.find((m) => m.role === "system");
  const chatMsgs = messages.filter((m) => m.role !== "system");

  const geminiContents = chatMsgs.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  const body: Record<string, unknown> = {
    contents: geminiContents,
    generationConfig: {
      maxOutputTokens: 150,
      temperature: 0.5
    }
  };

  if (systemMsg) {
    body.system_instruction = { parts: [{ text: systemMsg.content }] };
  }

  const url = `${provider.baseUrl}?key=${provider.apiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`HTTP ${res.status}: ${errText.slice(0, 300)}`);
    }

    const data = await res.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    if (!text) throw new Error("Empty response from Gemini");
    return text;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── HÀM PUBLIC: INSTANT FAILOVER AI CALL ───────────────────────────────────

export async function callAIWithFailover(
  messages: AIMessage[]
): Promise<AIProviderResponse> {
  const available = providers.filter(isProviderAvailable);

  if (available.length === 0) {
    providers.forEach((p) => { p.isHealthy = true; p.failureCount = 0; });
    throw new Error("ALL_PROVIDERS_EXHAUSTED");
  }

  const errors: string[] = [];

  for (const provider of available) {
    const startMs = Date.now();
    try {
      let text: string;

      if (provider.id.startsWith("gemini")) {
        text = await callGemini(provider, messages);
      } else {
        text = await callOpenAICompatible(provider, messages);
      }

      markProviderSuccess(provider);

      return {
        text,
        providerId: provider.id,
        model: provider.model,
        latencyMs: Date.now() - startMs
      };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      errors.push(`[${provider.id}] ${errMsg}`);
      markProviderFailed(provider);
      // NGAY LẬP TỨC thử tiếp — không delay
      continue;
    }
  }

  throw new Error(`ALL_PROVIDERS_FAILED:\n${errors.join("\n")}`);
}

export function getProviderHealthReport() {
  return providers.map((p) => ({
    id: p.id,
    name: p.name,
    tier: p.tier,
    model: p.model,
    isHealthy: p.isHealthy || Date.now() - p.lastFailTimeMs >= p.cooldownMs,
    failureCount: p.failureCount,
    cooldownRemainingMs: p.isHealthy
      ? 0
      : Math.max(0, p.cooldownMs - (Date.now() - p.lastFailTimeMs))
  }));
}
