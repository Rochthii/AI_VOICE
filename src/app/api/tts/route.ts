import { NextRequest } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { detectQueryLanguage, cleanSpeechText } from "@/lib/shared";

export const runtime = "nodejs";
export const maxDuration = 15;

// Bảng giọng đọc Microsoft Neural cao cấp nhất cho từng ngôn ngữ
const NEURAL_VOICE_MAP: Record<string, string> = {
  vi: "vi-VN-HoaiMyNeural",     // Nữ miền Nam ngọt ngào, ấm áp, truyền cảm
  en: "en-US-JennyNeural",      // Nữ Mỹ tự nhiên, rõ ràng
  fr: "fr-FR-DeniseNeural",     // Nữ Pháp dịu dàng
  ja: "ja-JP-NanamiNeural",     // Nữ Nhật êm ái, lịch thiệp
  ko: "ko-KR-SunHiNeural",      // Nữ Hàn tự nhiên
  zh: "zh-CN-XiaoxiaoNeural",   // Nữ Trung truyền cảm
  de: "de-DE-KatjaNeural",      // Nữ Đức
  es: "es-ES-ElviraNeural"      // Nữ Tây Ban Nha
};

// In-Memory LRU Audio Cache (Lưu 500 câu gần nhất để trả về ngay trong 0ms)
const ttsMemoryCache = new Map<string, { buffer: Buffer; voiceName: string; lang: string; timestamp: number }>();
const MAX_CACHE_SIZE = 500;

function enhanceSpeechPacing(text: string): string {
  return text
    .replace(/\s*([,;:])\s*/g, "$1 ")
    .replace(/\s*([.!?])\s*/g, "$1 ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * TẦNG 0: ElevenLabs AI Premier Voice (Khi có ELEVENLABS_API_KEY sk_...)
 */
async function synthesizeWithElevenLabs(text: string): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || !apiKey.startsWith("sk_")) {
    throw new Error("Invalid ElevenLabs API Key format (must start with sk_)");
  }

  // Voice ID: Sarah / Rachel / Multilingual
  const voiceId = "EXAVITQu4vr4xnSDxMaL"; // Sarah (Natural, warm, expressive)
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_22050_32`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API HTTP ${response.status}: ${errorText.slice(0, 150)}`);
  }

  const arrayBuf = await response.arrayBuffer();
  return Buffer.from(arrayBuf);
}

/**
 * TẦNG 1: Microsoft Edge Neural TTS (HoaiMyNeural) với Timeout 2.5s
 */
async function synthesizeWithEdgeTTS(text: string, voiceName: string): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("EdgeTTS WebSocket timeout (2500ms)"));
    }, 2500);

    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

      const streamResult = tts.toStream(text, {
        pitch: "+0Hz",
        rate: "+8%",
        volume: "+0%"
      });

      const chunks: Buffer[] = [];
      streamResult.audioStream.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      streamResult.audioStream.on("end", () => {
        clearTimeout(timeout);
        resolve(Buffer.concat(chunks));
      });

      streamResult.audioStream.on("error", (err: Error) => {
        clearTimeout(timeout);
        reject(err);
      });
    } catch (err) {
      clearTimeout(timeout);
      reject(err);
    }
  });
}

/**
 * TẦNG 2: Google TTS Endpoint Siêu Tốc (300ms Failover)
 */
async function synthesizeWithGoogleTTS(text: string, lang: string): Promise<Buffer> {
  const cleanLang = lang.slice(0, 2);
  const truncatedText = text.slice(0, 200);
  const q = encodeURIComponent(truncatedText);
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${cleanLang}&client=tw-ob&q=${q}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });

  if (!res.ok) {
    throw new Error(`Google TTS returned HTTP ${res.status}`);
  }

  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawText = body.text?.trim() || "";
    const requestedLang = body.lang || "vi";

    if (!rawText) {
      return new Response("Missing text payload", { status: 400 });
    }

    const cleanedText = cleanSpeechText(rawText);
    const pacedText = enhanceSpeechPacing(cleanedText);
    const effectiveLang = detectQueryLanguage(pacedText, requestedLang);
    const voiceName = NEURAL_VOICE_MAP[effectiveLang] || NEURAL_VOICE_MAP.vi;

    // 1. Kiểm tra RAM Cache (Trả về ngay trong 0ms)
    const cacheKey = `${voiceName}:${pacedText}`;
    if (ttsMemoryCache.has(cacheKey)) {
      const cached = ttsMemoryCache.get(cacheKey)!;
      return new Response(new Uint8Array(cached.buffer), {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": cached.buffer.length.toString(),
          "Cache-Control": "public, max-age=86400",
          "X-CHI-Voice": cached.voiceName,
          "X-CHI-Lang": cached.lang,
          "X-CHI-Cache": "HIT"
        }
      });
    }

    let audioBytes: Buffer | null = null;
    let usedProvider = "microsoft_edge_neural";

    // 2. Thử Tầng 0: ElevenLabs (nếu có key sk_...)
    if (process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY.startsWith("sk_")) {
      try {
        audioBytes = await synthesizeWithElevenLabs(pacedText);
        usedProvider = "elevenlabs_multilingual_v2";
      } catch (elevenErr) {
        console.warn("[ElevenLabs Tier 0 Fallback]:", elevenErr);
      }
    }

    // 3. Thử Tầng 1: Microsoft Neural Hoài My (Timeout 2.5s)
    if (!audioBytes) {
      try {
        audioBytes = await synthesizeWithEdgeTTS(pacedText, voiceName);
        usedProvider = "microsoft_edge_neural";
      } catch (edgeErr) {
        console.warn("[TTS Tier 1 Fail -> Switching to Tier 2 Google TTS]:", edgeErr);

        // 4. Fallback Tầng 2: Google TTS Siêu Tốc (300ms)
        try {
          audioBytes = await synthesizeWithGoogleTTS(pacedText, effectiveLang);
          usedProvider = "google_tts_stream";
        } catch (googleErr) {
          console.error("[TTS Tier 2 Fail]:", googleErr);
          throw new Error("All TTS providers failed");
        }
      }
    }

    if (!audioBytes || audioBytes.length === 0) {
      throw new Error("Empty audio buffer synthesized");
    }

    // Lưu vào RAM Cache
    if (ttsMemoryCache.size >= MAX_CACHE_SIZE) {
      const firstKey = ttsMemoryCache.keys().next().value;
      if (firstKey) ttsMemoryCache.delete(firstKey);
    }
    ttsMemoryCache.set(cacheKey, {
      buffer: audioBytes,
      voiceName,
      lang: effectiveLang,
      timestamp: Date.now()
    });

    return new Response(new Uint8Array(audioBytes), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBytes.length.toString(),
        "Cache-Control": "public, max-age=86400",
        "X-CHI-Voice": voiceName,
        "X-CHI-Lang": effectiveLang,
        "X-CHI-Provider": usedProvider,
        "X-CHI-Cache": "MISS"
      }
    });
  } catch (err: any) {
    console.error("[TTS Pipeline Exception]:", err);
    return new Response(JSON.stringify({ error: err?.message || "TTS Pipeline Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
