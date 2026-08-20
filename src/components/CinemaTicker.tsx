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
    <footer className="w-full flex flex-col justify-end p-4 pb-6 bg-gradient-to-t from-[#EDE8DE] via-[#FAF7F2]/90 to-transparent select-none z-10 space-y-3">
      {/* 1. THANH TRƯỢT TIẾN ĐỘ ÂM THANH (PROGRESS BAR) */}
      <div className="w-full flex flex-col space-y-1.5 px-1">
        <input
          type="range"
          min="0"
          max="100"
          value={progressPercent || 0}
          onChange={handleSeek}
          className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600 shadow-inner"
          aria-label={dict.ticker.progressBar}
        />
        <div className="flex justify-between text-[11px] text-stone-500 font-mono px-0.5 font-semibold">
          <span>{formatAudioDuration(currentTime)}</span>
          <span>{formatAudioDuration(duration)}</span>
        </div>
      </div>

      {/* 2. CỤM PHÍM ĐIỀU KHIỂN ÂM THANH (PLAY / PAUSE / SEEK 15S) */}
      <div className="flex items-center justify-center space-x-8 pt-1">
        <button
          onClick={() => audioEngine.seekRelative(-15)}
          className="p-3 rounded-full bg-white/80 border border-stone-200 text-stone-700 hover:text-stone-950 hover:border-stone-400 active:scale-90 transition-all shadow-sm"
          aria-label={dict.ticker.seekBackward}
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={onTogglePlay}
          className="p-4 rounded-full bg-amber-600 text-white font-bold hover:bg-amber-700 active:scale-95 shadow-xl shadow-amber-600/30 transition-all"
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
          className="p-3 rounded-full bg-white/80 border border-stone-200 text-stone-700 hover:text-stone-950 hover:border-stone-400 active:scale-90 transition-all shadow-sm"
          aria-label={dict.ticker.seekForward}
        >
          <RotateCw className="w-5 h-5" />
        </button>
      </div>
    </footer>
  );
};
