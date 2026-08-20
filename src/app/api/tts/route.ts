import { NextRequest } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { detectQueryLanguage, cleanSpeechText } from "@/lib/shared";

export const runtime = "nodejs";
export const maxDuration = 30;

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

// In-Memory LRU Audio Cache (Lưu 300 câu gần nhất để trả về ngay trong 0ms)
const ttsMemoryCache = new Map<string, { buffer: Buffer; voiceName: string; lang: string; timestamp: number }>();
const MAX_CACHE_SIZE = 300;

/**
 * Tối ưu hóa văn bản để có nhịp điệu ngắt quãng (Pacing) tự nhiên
 */
function enhanceSpeechPacing(text: string): string {
  return text
    .replace(/\s*([,;:])\s*/g, "$1 ")
    .replace(/\s*([.!?])\s*/g, "$1 ")
    .replace(/\s+/g, " ")
    .trim();
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

    // 1. Kiểm tra cache trong RAM (Trúng cache -> Trả về trong 0ms)
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

    // 2. Tổng hợp giọng đọc Microsoft Neural IN-MEMORY (Không ghi đĩa, tốc độ tối đa)
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const streamResult = tts.toStream(pacedText, {
      pitch: "+0Hz",
      rate: "+8%", // Tốc độ nói +8% linh hoạt, không lê thê
      volume: "+0%"
    });

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      streamResult.audioStream.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });
      streamResult.audioStream.on("end", () => {
        resolve();
      });
      streamResult.audioStream.on("error", (err: Error) => {
        reject(err);
      });
    });

    const audioBytes = Buffer.concat(chunks);

    // Lưu vào LRU RAM Cache
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
        "X-CHI-Cache": "MISS"
      }
    });
  } catch (err: any) {
    console.error("[Neural TTS Stream Error]:", err);
    return new Response(JSON.stringify({ error: err?.message || "TTS Synthesis Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
