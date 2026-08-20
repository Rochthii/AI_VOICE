import { NextRequest } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { detectQueryLanguage, cleanSpeechText } from "@/lib/shared";

export const runtime = "nodejs";
export const maxDuration = 60;

// Bảng giọng đọc Microsoft Neural cao cấp nhất cho từng ngôn ngữ (Hoài My Nam Bộ cho Tiếng Việt)
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
 * Tách văn bản dài thành các đoạn nhỏ dưới 180 ký tự theo dấu chấm câu
 */
function splitTextForTTS(text: string, maxLen = 175): string[] {
  if (text.length <= maxLen) return [text];

  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if ((currentChunk + " " + trimmed).trim().length <= maxLen) {
      currentChunk = (currentChunk + " " + trimmed).trim();
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      if (trimmed.length <= maxLen) {
        currentChunk = trimmed;
      } else {
        // Nếu một câu đơn lẻ dài quá 175 ký tự, chia theo dấu phẩy hoặc khoảng trắng
        const words = trimmed.split(" ");
        let subChunk = "";
        for (const word of words) {
          if ((subChunk + " " + word).trim().length <= maxLen) {
            subChunk = (subChunk + " " + word).trim();
          } else {
            if (subChunk) chunks.push(subChunk);
            subChunk = word;
          }
        }
        currentChunk = subChunk;
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * TẦNG 1: Microsoft Edge Neural TTS (HoaiMyNeural) với tốc độ và cảm xúc tối ưu
 */
async function synthesizeWithEdgeTTS(text: string, voiceName: string, lang = "vi"): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("EdgeTTS WebSocket timeout (7000ms)"));
    }, 7000);

    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

      // Tăng tốc độ đọc +18% và nâng nhẹ pitch +3Hz để giọng đọc dõng dạc, ngọt ngào, truyền cảm
      const isVi = lang.startsWith("vi");
      const streamResult = tts.toStream(text, {
        pitch: isVi ? "+3Hz" : "+2Hz",
        rate: isVi ? "+18%" : "+12%",
        volume: "+15%"
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
 * TẦNG 2: Google TTS Endpoint Đa Phân Đoạn (Không bao giờ bị cắt cụt, đọc trọn vẹn 100%)
 */
async function synthesizeWithGoogleTTS(text: string, lang: string): Promise<Buffer> {
  const cleanLang = lang.slice(0, 2);
  const textChunks = splitTextForTTS(text, 175);

  const fetchChunk = async (chunkText: string): Promise<Buffer> => {
    const q = encodeURIComponent(chunkText);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${cleanLang}&client=tw-ob&q=${q}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!res.ok) {
      throw new Error(`Google TTS chunk returned HTTP ${res.status}`);
    }

    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
  };

  // Tải song song toàn bộ các phân đoạn âm thanh
  const audioBuffers = await Promise.all(textChunks.map(fetchChunk));
  return Buffer.concat(audioBuffers);
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

    // 2. Thử Tầng 1: Microsoft Neural Hoài My
    try {
      audioBytes = await synthesizeWithEdgeTTS(pacedText, voiceName, effectiveLang);
      usedProvider = "microsoft_edge_neural";
    } catch (edgeErr) {
      console.warn("[TTS Tier 1 Fail -> Switching to Tier 2 Google TTS Multi-Chunk]:", edgeErr);

      // 3. Fallback Tầng 2: Google TTS Đa Phân Đoạn (Ghép nối 100% câu đầy đủ)
      try {
        audioBytes = await synthesizeWithGoogleTTS(pacedText, effectiveLang);
        usedProvider = "google_tts_stream_multichunk";
      } catch (googleErr) {
        console.error("[TTS Tier 2 Fail]:", googleErr);
        throw new Error("All TTS providers failed");
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
