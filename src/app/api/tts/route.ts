import { NextRequest } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { detectQueryLanguage, cleanSpeechText } from "@/lib/shared";
import fs from "fs";
import os from "os";
import path from "path";

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

export async function POST(req: NextRequest) {
  let tmpAudioPath = "";
  let tmpMetaPath = "";
  
  try {
    const body = await req.json();
    const rawText = body.text?.trim() || "";
    const requestedLang = body.lang || "vi";

    if (!rawText) {
      return new Response("Missing text payload", { status: 400 });
    }

    const cleanedText = cleanSpeechText(rawText);
    const effectiveLang = detectQueryLanguage(cleanedText, requestedLang);
    const voiceName = NEURAL_VOICE_MAP[effectiveLang] || NEURAL_VOICE_MAP.vi;

    // Tổng hợp giọng đọc Microsoft Neural
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const ttsCacheDir = path.join(process.cwd(), ".next", "cache", "tts");
    if (!fs.existsSync(ttsCacheDir)) {
      fs.mkdirSync(ttsCacheDir, { recursive: true });
    }

    const result = await tts.toFile(ttsCacheDir, cleanedText, {
      pitch: "+0Hz",
      rate: "-4%",
      volume: "+0%"
    });

    tmpAudioPath = result.audioFilePath;
    tmpMetaPath = result.metadataFilePath || "";

    const audioBytes = fs.readFileSync(tmpAudioPath);

    // Dọn dẹp tệp tạm thời
    try {
      if (fs.existsSync(tmpAudioPath)) fs.unlinkSync(tmpAudioPath);
      if (tmpMetaPath && fs.existsSync(tmpMetaPath)) fs.unlinkSync(tmpMetaPath);
    } catch (_) {}

    return new Response(new Uint8Array(audioBytes), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBytes.length.toString(),
        "Cache-Control": "public, max-age=86400",
        "X-CHI-Voice": voiceName,
        "X-CHI-Lang": effectiveLang
      }
    });
  } catch (err: any) {
    // Dọn dẹp tệp nếu có lỗi
    try {
      if (tmpAudioPath && fs.existsSync(tmpAudioPath)) fs.unlinkSync(tmpAudioPath);
      if (tmpMetaPath && fs.existsSync(tmpMetaPath)) fs.unlinkSync(tmpMetaPath);
    } catch (_) {}

    console.error("[Neural TTS Error]:", err);
    return new Response(JSON.stringify({ error: err?.message || "TTS Synthesis Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
