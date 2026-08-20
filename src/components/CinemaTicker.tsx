"use client";

import React from "react";
import { Play, Pause, RotateCcw, RotateCw, MapPin } from "lucide-react";
import { Station, Locale } from "@/types/station";
import { audioEngine } from "@/lib/audio-engine";

interface CinemaTickerProps {
  stations: Station[];
  currentStation: Station;
  locale: Locale;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  activeSubtitle: string;
  onSelectStation: (station: Station) => void;
  onTogglePlay: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export const CinemaTicker: React.FC<CinemaTickerProps> = ({
  stations,
  currentStation,
  locale,
  isPlaying,
  currentTime,
  duration,
  activeSubtitle,
  onSelectStation,
  onTogglePlay
}) => {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = (parseFloat(e.target.value) / 100) * duration;
    audioEngine.seek(targetTime);
  };

  return (
    <footer className="h-[30vh] w-full flex flex-col justify-between p-4 bg-gradient-to-t from-black via-stone-950/90 to-transparent select-none z-10">
      {/* 1. Phụ Đề Điện Ảnh 1 Dòng (Cinema Ticker >= 20px) */}
      <div className="w-full h-8 flex items-center justify-center overflow-hidden px-2">
        <p className="text-center text-sm md:text-base font-medium text-tunnel-chalk/90 tracking-wide line-clamp-1 italic">
          {activeSubtitle || currentStation.short_summary[locale]}
        </p>
      </div>

      {/* 2. Thanh Trượt Tiến Độ Âm Thanh (Progress Bar) */}
      <div className="w-full flex flex-col space-y-1">
        <input
          type="range"
          min="0"
          max="100"
          value={progressPercent || 0}
          onChange={handleSeek}
          className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-tunnel-amber"
          aria-label="Audio progress bar"
        />
        <div className="flex justify-between text-[10px] text-stone-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. Cụm Phím Điều Khiển Âm Thanh (Play / Pause / Seek 15s) */}
      <div className="flex items-center justify-center space-x-6">
        <button
          onClick={() => audioEngine.seekRelative(-15)}
          className="p-2 rounded-full text-stone-400 hover:text-tunnel-chalk active:scale-90 transition-all"
          aria-label="Seek backward 15 seconds"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={onTogglePlay}
          className="p-4 rounded-full bg-tunnel-amber text-stone-950 font-bold hover:bg-amber-400 active:scale-95 shadow-lg shadow-tunnel-amber/20 transition-all"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
        </button>

        <button
          onClick={() => audioEngine.seekRelative(15)}
          className="p-2 rounded-full text-stone-400 hover:text-tunnel-chalk active:scale-90 transition-all"
          aria-label="Seek forward 15 seconds"
        >
          <RotateCw className="w-5 h-5" />
        </button>
      </div>

      {/* 4. Mini Station Selector (5 Trạm Di Tích) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        {stations.map((st) => (
          <button
            key={st.id}
            onClick={() => onSelectStation(st)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-all ${
              currentStation.id === st.id
                ? "bg-tunnel-amber/20 border border-tunnel-amber text-tunnel-amber font-semibold"
                : "bg-stone-900 border border-stone-800 text-stone-400 hover:text-tunnel-chalk"
            }`}
          >
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>0{st.order_index}. {st.title[locale].split("—")[0].trim()}</span>
          </button>
        ))}
      </div>
    </footer>
  );
};
