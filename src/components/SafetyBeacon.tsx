"use client";

import React from "react";
import { Station, Locale } from "@/types/station";
import { ShieldCheck, Compass, Globe, WifiOff } from "lucide-react";

interface SafetyBeaconProps {
  station: Station;
  locale: Locale;
  onToggleLocale: (locale: Locale) => void;
  isOffline: boolean;
}

export const SafetyBeacon: React.FC<SafetyBeaconProps> = ({
  station,
  locale,
  onToggleLocale,
  isOffline
}) => {
  const safety = station.safety;
  const exitNote = safety.emergency_exit_note[locale];

  return (
    <header className="h-[20vh] w-full flex flex-col justify-between p-4 bg-gradient-to-b from-tunnel-charcoal/90 to-transparent z-10 select-none">
      {/* Hàng 1: Badge Trạng Thái & Nút Chuyển Đổi Song Ngữ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-tunnel-slate/80 border border-stone-800 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-tunnel-jade animate-pulse" />
            <span className="text-[11px] font-medium tracking-wider uppercase text-tunnel-chalk">
              TRẠM 0{station.order_index}
            </span>
          </div>

          {isOffline && (
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-tunnel-rust/20 border border-tunnel-rust/40 text-tunnel-rust text-[10px]">
              <WifiOff className="w-3 h-3" />
              <span>Offline Cache</span>
            </div>
          )}
        </div>

        {/* Nút chuyển đổi Song ngữ VI / EN */}
        <button
          onClick={() => onToggleLocale(locale === "vi" ? "en" : "vi")}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-stone-900/90 border border-tunnel-amber/40 text-tunnel-amber text-xs font-semibold hover:bg-tunnel-amber/10 active:scale-95 transition-all"
          aria-label="Toggle Language"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{locale.toUpperCase()}</span>
        </button>
      </div>

      {/* Hàng 2: Beacon Đo Lường Không Gian & Trấn An An Toàn */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-950/70 border border-stone-800/80 backdrop-blur-md">
        <div className="flex items-center space-x-3 text-xs text-tunnel-chalk">
          {safety.tunnel_length_meters > 0 ? (
            <>
              <div className="flex items-center space-x-1">
                <Compass className="w-3.5 h-3.5 text-tunnel-amber" />
                <span className="font-semibold">{safety.tunnel_length_meters}m</span>
              </div>
              <span className="text-stone-600">•</span>
              <div className="flex items-center space-x-1">
                <span className="text-stone-400">Thời gian:</span>
                <span className="font-semibold">{safety.avg_crawl_time_minutes}p</span>
              </div>
              <span className="text-stone-600">•</span>
              <div className="flex items-center space-x-1 text-tunnel-jade truncate max-w-[140px]">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{exitNote}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-1.5 text-tunnel-jade">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Khu vực trên mặt đất — Không gian mở</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
