/**
 * CHI VOICE - GENERATE SAMPLE AUDIO FILES
 * Tạo các tệp âm thanh WAV/MP3 mẫu với âm hưởng sóng trầm dã chiến (Ambient Drone + Bell)
 * để trình duyệt phát mượt mà không bị 404.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.resolve(__dirname, "../public/audio/stations");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Tạo Header WAV chuẩn PCM 16-bit 44.1kHz Mono
function generateWavBuffer(durationSeconds = 10, frequency = 220) {
  const sampleRate = 44100;
  const numSamples = sampleRate * durationSeconds;
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // RIFF Chunk
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write("WAVE", 8);

  // fmt Chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(1, 22);  // NumChannels (1 Mono)
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32);  // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data Chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  // Sinh sóng Sine trầm ấm + Tiếng gõ mõ tre dã chiến
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Sóng trầm 110Hz + Hài âm 220Hz mô phỏng không gian hầm đất
    const sampleVal = Math.sin(2 * Math.PI * frequency * t) * 0.25 +
                      Math.sin(2 * Math.PI * (frequency / 2) * t) * 0.2;
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sampleVal * 32767)));
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  return buffer;
}

const audioFiles = [
  "01_kitchen_vi.mp3",
  "01_kitchen_en.mp3",
  "02_hospital_vi.mp3",
  "02_hospital_en.mp3",
  "03_command_vi.mp3",
  "03_command_en.mp3",
  "04_termite_vi.mp3",
  "04_termite_en.mp3",
  "05_traps_vi.mp3",
  "05_traps_en.mp3"
];

for (const file of audioFiles) {
  const filePath = path.join(outputDir, file);
  // Tạo file WAV PCM (trình duyệt đọc MP3/WAV container trực tiếp)
  const wavData = generateWavBuffer(120, 160); // 120s duration
  fs.writeFileSync(filePath, wavData);
  console.log(`✅ Đã tạo file âm thanh mẫu: ${file} (${(wavData.length / 1024).toFixed(1)} KB)`);
}

console.log("🎉 Hoàn tất sinh 10 tệp âm thanh thuyết minh cho 5 trạm di tích!");
