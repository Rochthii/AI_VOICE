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

  // 1. Tính toán Phụ Đề Điện Ảnh Đồng Bộ Theo Thời Gian Thực (Không Hardcode)
  const dynamicSubtitle = useMemo(() => {
    // Nếu AI vừa trả lời hoặc đang stream câu trả lời -> Ưu tiên hiển thị
    if (activeSubtitle && activeSubtitle.trim().length > 0) {
      return activeSubtitle;
    }

    const summary = getLocalizedText(currentStation.short_summary, locale);
    const storyHook = getLocalizedText(currentStation.human_story_hook, locale);
    const keyFact1 = currentStation.key_facts?.[0] ? getLocalizedText(currentStation.key_facts[0], locale) : "";
    const keyFact2 = currentStation.key_facts?.[1] ? getLocalizedText(currentStation.key_facts[1], locale) : "";

    if (!duration || duration <= 0 || !isPlaying) {
      return summary;
    }

    const ratio = currentTime / duration;
    if (ratio < 0.25) {
      return summary;
    } else if (ratio < 0.55 && storyHook) {
      return storyHook;
    } else if (ratio < 0.80 && keyFact1) {
      return keyFact1;
    } else if (keyFact2) {
      return keyFact2;
    }
    return summary;
  }, [activeSubtitle, currentStation, locale, currentTime, duration, isPlaying]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = (parseFloat(e.target.value) / 100) * duration;
    audioEngine.seek(targetTime);
  };

  return (
    <footer className="w-full flex flex-col justify-end p-4 pb-6 bg-gradient-to-t from-black via-stone-950/95 to-transparent select-none z-10 space-y-3">
      {/* 1. KHUNG PHỤ ĐỀ ĐIỆN ẢNH ĐỒNG BỘ THỜI GIAN THỰC (CINEMA DYNAMIC SUBTITLE) */}
      <div className="w-full min-h-[56px] max-h-[72px] flex items-center justify-center px-4 py-2 rounded-2xl bg-stone-950/80 border border-stone-800/60 shadow-lg backdrop-blur-md overflow-hidden relative">
        <div className="flex items-center space-x-2.5 w-full justify-center">
          {isPlaying && (
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-tunnel-amber/20 text-tunnel-amber animate-pulse">
              <Volume2 className="w-4 h-4" />
            </span>
          )}
          <div className="overflow-hidden w-full text-center">
            <p
              key={dynamicSubtitle}
              className={`text-xs sm:text-sm font-medium tracking-wide text-stone-200 transition-all duration-300 leading-relaxed ${
                isPlaying ? "animate-fadeIn" : ""
              }`}
            >
              {dynamicSubtitle}
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

      {/* 3. CỤM PHÍM ĐIỀU KHIỂN ÂM THANH TRỰC QUAN (PLAY / PAUSE / SEEK 15S) */}
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
