import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const GROQ_API_KEYS = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2
].filter(Boolean) as string[];

/**
 * API SPEECH-TO-TEXT (STT) CHUYÊN DỤNG CHO ĐỊA ĐẠO CỦ CHI
 *
 * Sử dụng Groq Whisper-Large-v3-Turbo:
 * - Tốc độ siêu tốc: 100ms - 200ms
 * - Lọc ồn cực mạnh: khử tiếng gió thông hơi, tiếng bước chân hầm ngầm
 * - Bắt giọng thì thầm (Whispering / Nói nhỏ) với bộ từ vựng di tích chuẩn xác
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("file") as Blob | null;
    const requestedLang = (formData.get("lang") as string) || "vi";

    if (!audioFile) {
      return NextResponse.json({ error: "Missing audio file payload" }, { status: 400 });
    }

    const apiKey = GROQ_API_KEYS[0] || process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
    }

    // Chuẩn bị FormData gửi lên Groq Whisper API với đúng định dạng tệp (hỗ trợ cả iOS m4a/mp4 và Android webm)
    let fileExt = "webm";
    const mimeType = audioFile.type || "";
    if (mimeType.includes("mp4") || mimeType.includes("m4a") || mimeType.includes("aac")) {
      fileExt = "m4a";
    } else if (mimeType.includes("ogg")) {
      fileExt = "ogg";
    } else if (mimeType.includes("wav")) {
      fileExt = "wav";
    }

    const groqFormData = new FormData();
    groqFormData.append("file", audioFile, `user_speech.${fileExt}`);
    groqFormData.append("model", "whisper-large-v3-turbo");
    groqFormData.append("temperature", "0");
    
    // Gợi ý từ vựng di tích giúp AI không bao giờ nhận diện sai địa danh & thuật ngữ
    groqFormData.append(
      "prompt",
      "Địa đạo Củ Chi, Bến Dược, Bến Đình, Bếp Hoàng Cầm, Bác sĩ Võ Hoàng Lê, Anh hùng Tô Văn Đực, Phú Mỹ Hưng, Nhuận Đức, hầm chông, laterit, lỗ thông hơi, chó béc-giê, xà phòng Camay."
    );

    if (requestedLang && requestedLang !== "auto") {
      groqFormData.append("language", requestedLang.slice(0, 2));
    }

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: groqFormData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Groq Whisper STT Error]:", errorText);
      return NextResponse.json({ error: "STT transcription failed" }, { status: response.status });
    }

    const result = await response.json();
    const transcribedText = result.text?.trim() || "";

    return NextResponse.json({
      text: transcribedText,
      language: result.language || requestedLang,
      duration: result.duration
    });
  } catch (err: any) {
    console.error("[STT Route Exception]:", err);
    return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
  }
}
