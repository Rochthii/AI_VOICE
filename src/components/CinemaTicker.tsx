"use client";

import React, { useMemo } from "react";
import { Play, Pause, RotateCcw, RotateCw, Volume2 } from "lucide-react";
import { Station } from "@/types/station";
import { Locale, getDictionary, getLocalizedText } from "@/i18n";
import { audioEngine } from "@/lib/audio-engine";
import { formatAudioDuration } from "@/lib/shared";

interface CinemaTickerProps {
  currentStation: Station;
  locale: Locale;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  activeSubtitle: string;
  onTogglePlay: () => void;
}

/**
 * Chia nhỏ đoạn văn bản dài thành các dòng phụ đề 1 dòng (Single-line clauses)
 */
function splitIntoSingleLines(text: string): string[] {
  if (!text?.trim()) return [];

  // Tách theo dấu chấm, dấu phẩy, hai chấm, chấm than, chấm hỏi
  const parts = text
    .split(/([.!?;:\n]+)/)
    .map((s) => s.trim())
    .filter(Boolean);

  const lines: string[] = [];
  let buffer = "";

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (/[.!?;:\n]/.test(part)) {
      buffer += part;
      if (buffer.trim()) {
        lines.push(buffer.trim());
        buffer = "";
      }
    } else {
      if (buffer) {
        if (buffer.length + part.length > 50) {
          lines.push(buffer.trim());
          buffer = part;
        } else {
          buffer += " " + part;
        }
      } else {
        buffer = part;
      }
    }
  }

  if (buffer.trim()) {
    lines.push(buffer.trim());
  }

  // Nếu câu quá dài không có dấu, ngắt theo cụm 8-10 từ
  const finalLines: string[] = [];
  for (const line of lines) {
    const words = line.split(" ");
    if (words.length > 14) {
      for (let w = 0; w < words.length; w += 10) {
        finalLines.push(words.slice(w, w + 10).join(" "));
      }
    } else {
      finalLines.push(line);
    }
  }

  return finalLines.length > 0 ? finalLines : [text.trim()];
}

export const CinemaTicker: React.FC<CinemaTickerProps> = ({
  currentStation,
  locale,
  isPlaying,
  currentTime,
  duration,
  activeSubtitle,
  onTogglePlay
}) => {
  const dict = getDictionary(locale);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // 1. Toàn bộ văn bản thuyết minh hoặc câu trả lời AI
  const fullText = useMemo(() => {
    if (activeSubtitle && activeSubtitle.trim().length > 0) {
      return activeSubtitle.trim();
    }
    const summary = getLocalizedText(currentStation.short_summary, locale);
    const storyHook = getLocalizedText(currentStation.human_story_hook, locale);
    return `${summary} ${storyHook}`.trim();
  }, [activeSubtitle, currentStation, locale]);

  // 2. Tách thành danh sách các dòng phụ đề 1 dòng (Single-line list)
  const subtitleLines = useMemo(() => {
    return splitIntoSingleLines(fullText);
  }, [fullText]);

  // 3. Xác định dòng phụ đề hiện tại theo tiến độ phát âm thanh (1 dòng duy nhất)
  const currentSingleLine = useMemo(() => {
    if (subtitleLines.length === 0) return "";
    if (!isPlaying || !duration || duration <= 0) {
      return subtitleLines[0];
    }

    const progress = Math.max(0, Math.min(1, currentTime / duration));
    const activeIndex = Math.min(
      subtitleLines.length - 1,
      Math.floor(progress * subtitleLines.length)
    );

    return subtitleLines[activeIndex] || subtitleLines[0];
  }, [subtitleLines, isPlaying, currentTime, duration]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = (parseFloat(e.target.value) / 100) * duration;
    audioEngine.seek(targetTime);
  };

  return (
    <footer className="w-full flex flex-col justify-end p-4 pb-6 bg-gradient-to-t from-black via-stone-950/95 to-transparent select-none z-10 space-y-3">
      {/* 1. KHUNG PHỤ ĐỀ 1 DÒNG CHUẨN ĐIỆN ẢNH (SINGLE-LINE CINEMA SUBTITLE) */}
      <div className="w-full h-11 flex items-center justify-center px-4 rounded-full bg-stone-950/90 border border-stone-800/80 shadow-md backdrop-blur-md overflow-hidden relative">
        <div className="flex items-center space-x-2 w-full justify-center overflow-hidden">
          {isPlaying && (
            <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-tunnel-amber/20 text-tunnel-amber animate-pulse">
              <Volume2 className="w-3 h-3" />
            </span>
          )}
          <div className="overflow-hidden w-full text-center">
            <p
              key={currentSingleLine}
              className={`text-xs sm:text-[13px] font-medium tracking-wide text-stone-200 truncate italic leading-none transition-all duration-300 ${
                isPlaying ? "animate-fadeIn" : ""
              }`}
            >
              {currentSingleLine}
            </p>
          </div>
        </div>
      </div>

      {/* 2. THANH TRƯỢT TIẾN ĐỘ ÂM THANH (PROGRESS BAR) */}
      <div className="w-full flex flex-col space-y-1">
        <input
          type="range"
          min="0"
          max="100"
          value={progressPercent || 0}
          onChange={handleSeek}
          className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-tunnel-amber"
          aria-label={dict.ticker.progressBar}
        />
        <div className="flex justify-between text-[10px] text-stone-400 font-mono px-0.5">
          <span>{formatAudioDuration(currentTime)}</span>
          <span>{formatAudioDuration(duration)}</span>
        </div>
      </div>

      {/* 3. CỤM PHÍM ĐIỀU KHIỂN ÂM THANH (PLAY / PAUSE / SEEK 15S) */}
      <div className="flex items-center justify-center space-x-8 pt-1">
        <button
          onClick={() => audioEngine.seekRelative(-15)}
          className="p-2.5 rounded-full text-stone-400 hover:text-tunnel-chalk active:scale-90 transition-all"
          aria-label={dict.ticker.seekBackward}
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={onTogglePlay}
          className="p-4 rounded-full bg-tunnel-amber text-stone-950 font-bold hover:bg-amber-400 active:scale-95 shadow-xl shadow-tunnel-amber/30 transition-all"
          aria-label={isPlaying ? dict.ticker.pause : dict.ticker.play}
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
        </button>

        <button
          onClick={() => audioEngine.seekRelative(15)}
          className="p-2.5 rounded-full text-stone-400 hover:text-tunnel-chalk active:scale-90 transition-all"
          aria-label={dict.ticker.seekForward}
        >
          <RotateCw className="w-5 h-5" />
        </button>
      </div>
    </footer>
  );
};
