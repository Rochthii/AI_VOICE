/**
 * AI PROVIDER MANAGER v2 — STREAMING + INSTANT FAILOVER
 *
 * Thêm hỗ trợ streaming (SSE) cho Groq và Gemini.
 * Non-streaming vẫn giữ làm fallback.
 *
 * Thứ tự ưu tiên speed (TTFT - Time To First Token):
 *   Tier 1 — Groq compound-mini / gpt-oss-20b (~200-400ms TTFT)
 *   Tier 2 — Gemini 2.5 Flash Lite (~400-600ms TTFT)
 *   Tier 3 — OpenRouter :free (~800-1500ms TTFT)
 */

export interface AIProvider {
  id: string;
  tier: number;
  name: string;
  model: string;
  apiKey: string;
  baseUrl: string;
  supportsStreaming: boolean;
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

// ─── KHỞI TẠO PROVIDER LIST ─────────────────────────────────────────────────

function buildProviderList(): AIProvider[] {
  const providers: AIProvider[] = [];

  // ── TIER 1: GROQ — NHANH NHẤT ─────────────────────────────────────────────
  // compound-mini: lightweight router, nhanh hơn compound đầy đủ
  // openai/gpt-oss-20b: pure LLM không có thinking overhead
  const groqConfigs = [
    { key: process.env.GROQ_API_KEY, model: "groq/compound-mini", id: "groq_mini_1" },
    { key: process.env.GROQ_API_KEY, model: "openai/gpt-oss-20b", id: "groq_gpt20b_1" },
    { key: process.env.GROQ_API_KEY_2, model: "groq/compound-mini", id: "groq_mini_2" },
    { key: process.env.GROQ_API_KEY_2, model: "openai/gpt-oss-20b", id: "groq_gpt20b_2" }
  ];

  groqConfigs.forEach(({ key, model, id }) => {
    if (!key) return;
    providers.push({
      id, tier: 1,
      name: `Groq [${model}]`,
      model, apiKey: key,
      baseUrl: "https://api.groq.com/openai/v1/chat/completions",
      supportsStreaming: true,
      isHealthy: true, failureCount: 0, lastFailTimeMs: 0,
      cooldownMs: 3 * 60 * 1000
    });
  });

  // ── TIER 2: GOOGLE GEMINI 2.5 Flash Lite (nhanh nhất trong Gemini) ─────────
  const geminiConfigs = [
    { key: process.env.GEMINI_API_KEY, model: "gemini-2.5-flash-lite", id: "gemini_lite_1" },
    { key: process.env.GEMINI_API_KEY, model: "gemini-2.5-flash", id: "gemini_flash_1" },
    { key: process.env.GEMINI_API_KEY_2, model: "gemini-2.5-flash-lite", id: "gemini_lite_2" },
    { key: process.env.GEMINI_API_KEY_2, model: "gemini-2.5-flash", id: "gemini_flash_2" }
  ];

  geminiConfigs.forEach(({ key, model, id }) => {
    if (!key || !key.startsWith("AIza")) return;
    providers.push({
      id, tier: 2,
      name: `Gemini [${model}]`,
      model, apiKey: key,
      baseUrl: `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent`,
      supportsStreaming: true,
      isHealthy: true, failureCount: 0, lastFailTimeMs: 0,
      cooldownMs: 5 * 60 * 1000
    });
  });

  // ── TIER 3: OPENROUTER :free ───────────────────────────────────────────────
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey) {
    const freeModels = [
      "meta-llama/llama-3.1-8b-instruct:free",
      "mistralai/mistral-7b-instruct:free",
      "google/gemma-2-9b-it:free"
    ];
    freeModels.forEach((model, idx) => {
      providers.push({
        id: `openrouter_${idx + 1}`, tier: 3,
        name: `OpenRouter [${model}]`,
        model, apiKey: openrouterKey,
        baseUrl: "https://openrouter.ai/api/v1/chat/completions",
        supportsStreaming: true,
        isHealthy: true, failureCount: 0, lastFailTimeMs: 0,
        cooldownMs: 10 * 60 * 1000
      });
    });
  }

  return providers;
}

const providers: AIProvider[] = buildProviderList();

// ─── CIRCUIT BREAKER HELPERS ─────────────────────────────────────────────────

function isProviderAvailable(p: AIProvider): boolean {
  if (p.isHealthy) return true;
  if (Date.now() - p.lastFailTimeMs >= p.cooldownMs) {
    p.isHealthy = true;
    p.failureCount = 0;
    return true;
  }
  return false;
}

function markFailed(p: AIProvider) {
  p.failureCount++;
  p.lastFailTimeMs = Date.now();
  if (p.failureCount >= 2) p.isHealthy = false;
}

function markSuccess(p: AIProvider) {
  p.isHealthy = true;
  p.failureCount = 0;
}

function sanitizeHeader(val: string): string {
  return val.replace(/[^\x20-\x7E]/g, "?");
}

// ─── STREAMING: GROQ / OPENROUTER (OpenAI SSE format) ────────────────────────

export async function streamOpenAICompatible(
  provider: AIProvider,
  messages: AIMessage[],
  onChunk: (text: string) => void
): Promise<string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${provider.apiKey}`
  };

  if (provider.id.startsWith("openrouter")) {
    headers["HTTP-Referer"] = sanitizeHeader(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002");
    headers["X-Title"] = "CHI VOICE";
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(provider.baseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: provider.model,
        messages,
        max_tokens: 150,
        temperature: 0.4,
        stream: true
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`HTTP ${res.status}: ${errText.slice(0, 200)}`);
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value, { stream: true }).split("\n");
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6).trim();
        if (payload === "[DONE]") continue;
        try {
          const parsed = JSON.parse(payload);
          let chunk: string = parsed?.choices?.[0]?.delta?.content || "";
          // Strip thinking tags (qwen3, compound internals)
          chunk = chunk.replace(/<think>[\s\S]*?<\/think>/gi, "");
          if (chunk) {
            fullText += chunk;
            onChunk(chunk);
          }
        } catch {
          // Partial JSON in stream, skip
        }
      }
    }

    if (!fullText.trim()) throw new Error("Empty stream response");
    return fullText.trim();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── STREAMING: GOOGLE GEMINI (SSE format khác OpenAI) ───────────────────────

export async function streamGemini(
  provider: AIProvider,
  messages: AIMessage[],
  onChunk: (text: string) => void
): Promise<string> {
  const systemMsg = messages.find((m) => m.role === "system");
  const chatMsgs = messages.filter((m) => m.role !== "system");

  const body: Record<string, unknown> = {
    contents: chatMsgs.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    })),
    generationConfig: { maxOutputTokens: 150, temperature: 0.4 }
  };

  if (systemMsg) {
    body.system_instruction = { parts: [{ text: systemMsg.content }] };
  }

  const url = `${provider.baseUrl}?key=${provider.apiKey}&alt=sse`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`HTTP ${res.status}: ${errText.slice(0, 200)}`);
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value, { stream: true }).split("\n");
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6).trim();
        try {
          const parsed = JSON.parse(payload);
          const chunk: string = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (chunk) {
            fullText += chunk;
            onChunk(chunk);
          }
        } catch {
          // Partial JSON, skip
        }
      }
    }

    if (!fullText.trim()) throw new Error("Empty Gemini stream response");
    return fullText.trim();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── PUBLIC API: STREAMING FAILOVER ─────────────────────────────────────────

/**
 * Stream AI với instant failover.
 * onChunk được gọi với mỗi text chunk nhận được (dùng để Progressive TTS).
 * Trả về full text khi hoàn tất.
 */
export async function streamAIWithFailover(
  messages: AIMessage[],
  onChunk: (text: string) => void
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
        text = await streamGemini(provider, messages, onChunk);
      } else {
        text = await streamOpenAICompatible(provider, messages, onChunk);
      }

      markSuccess(provider);
      return { text, providerId: provider.id, model: provider.model, latencyMs: Date.now() - startMs };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      errors.push(`[${provider.id}] ${errMsg}`);
      markFailed(provider);
      // NGAY LẬP TỨC thử provider tiếp theo — 0ms delay
      continue;
    }
  }

  throw new Error(`ALL_PROVIDERS_FAILED:\n${errors.join("\n")}`);
}

/** Non-streaming fallback (dùng cho compatibility) */
export async function callAIWithFailover(messages: AIMessage[]): Promise<AIProviderResponse> {
  let collected = "";
  return streamAIWithFailover(messages, (chunk) => { collected += chunk; });
}

export function getProviderHealthReport() {
  return providers.map((p) => ({
    id: p.id, name: p.name, tier: p.tier, model: p.model,
    isHealthy: p.isHealthy || Date.now() - p.lastFailTimeMs >= p.cooldownMs,
    failureCount: p.failureCount,
    cooldownRemainingMs: p.isHealthy ? 0 : Math.max(0, p.cooldownMs - (Date.now() - p.lastFailTimeMs))
  }));
}
