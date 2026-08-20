"use client";

import React from "react";
import { Play, Pause, RotateCcw, RotateCw } from "lucide-react";
import { Station } from "@/types/station";
import { Locale, getDictionary } from "@/i18n";
import { audioEngine } from "@/lib/audio-engine";
import { formatAudioDuration } from "@/lib/shared";

interface CinemaTickerProps {
  currentStation: Station | null;
  locale: Locale;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  activeSubtitle?: string;
  onTogglePlay: () => void;
}

export const CinemaTicker: React.FC<CinemaTickerProps> = ({
  locale,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay
}) => {
  const dict = getDictionary(locale);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = (parseFloat(e.target.value) / 100) * duration;
    audioEngine.seek(targetTime);
  };

  return (
    <footer className="w-full flex flex-col justify-end p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-[#EFE8DC] via-[#FAF7F2] to-transparent border-t border-[#E2D9C8] select-none z-10 space-y-2.5 shadow-[0_-2px_8px_rgba(0,0,0,0.02)]">
      {/* 1. THANH TRƯỢT TIẾN ĐỘ ÂM THANH (HERITAGE PROGRESS BAR) */}
      <div className="w-full flex flex-col space-y-1 px-1">
        <input
          type="range"
          min="0"
          max="100"
          value={progressPercent || 0}
          onChange={handleSeek}
          className="w-full h-1.5 bg-[#DDD5C7] rounded-lg appearance-none cursor-pointer accent-amber-600 shadow-inner"
          aria-label={dict.ticker.progressBar}
        />
        <div className="flex justify-between text-[11px] text-stone-600 font-mono px-0.5 font-bold">
          <span>{formatAudioDuration(currentTime)}</span>
          <span>{formatAudioDuration(duration)}</span>
        </div>
      </div>

      {/* 2. CỤM PHÍM ĐIỀU KHIỂN ÂM THANH KIM LOẠI ĐỒNG */}
      <div className="flex items-center justify-center space-x-7">
        <button
          onClick={() => audioEngine.seekRelative(-15)}
          className="p-2.5 rounded-full bg-white border border-[#DDD4C2] text-stone-700 hover:text-amber-950 hover:border-amber-500 active:scale-90 transition-all shadow-sm"
          aria-label={dict.ticker.seekBackward}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onTogglePlay}
          className="p-3.5 rounded-full bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-500 text-white font-bold hover:brightness-110 active:scale-95 shadow-lg shadow-amber-700/30 border border-amber-400/50 transition-all"
          aria-label={isPlaying ? dict.ticker.pause : dict.ticker.play}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>

        <button
          onClick={() => audioEngine.seekRelative(15)}
          className="p-2.5 rounded-full bg-white border border-[#DDD4C2] text-stone-700 hover:text-amber-950 hover:border-amber-500 active:scale-90 transition-all shadow-sm"
          aria-label={dict.ticker.seekForward}
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
};
