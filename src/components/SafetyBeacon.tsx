"use client";

import React, { useState } from "react";
import { Station } from "@/types/station";
import { Locale, getDictionary, getLocalizedText, SUPPORTED_LOCALES, LOCALE_MAP } from "@/i18n";
import { ShieldCheck, Compass, Globe, WifiOff, BookOpen, X, CheckCircle2, Check } from "lucide-react";
import { StationDossierModal } from "./StationDossierModal";
import { audioEngine } from "@/lib/audio-engine";

interface SafetyBeaconProps {
  station: Station;
  locale: Locale;
  onToggleLocale: (locale: Locale) => void;
  onOpenOverview?: () => void;
  isOffline: boolean;
}

export const SafetyBeacon: React.FC<SafetyBeaconProps> = ({
  station,
  locale,
  onToggleLocale,
  onOpenOverview,
  isOffline
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const dict = getDictionary(locale);
  const safety = station.safety;
  const exitNote = getLocalizedText(safety.emergency_exit_note, locale);
  const stationTitle = getLocalizedText(station.title, locale);
  const storyHook = getLocalizedText(station.human_story_hook, locale);

  const currentLocaleConfig = LOCALE_MAP[locale] || LOCALE_MAP.vi;

  return (
    <>
      <header className="h-[20vh] w-full flex flex-col justify-between p-4 bg-gradient-to-b from-tunnel-charcoal/95 to-transparent z-10 select-none">
        {/* Hàng 1: Badge Trạng Thái, 5 Chấm Tiến Trình Trạm & Nút Chọn Đa Ngôn Ngữ */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {onOpenOverview && (
              <button
                onClick={onOpenOverview}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-tunnel-amber/20 border border-tunnel-amber/40 text-tunnel-amber hover:bg-tunnel-amber/30 active:scale-95 transition-all text-[11px] font-bold font-mono"
                aria-label="Tổng quan di tích"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>TỔNG QUAN</span>
              </button>
            )}

            <button
              onClick={() => setIsDetailsOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-tunnel-slate/80 border border-stone-800 backdrop-blur-md hover:border-tunnel-amber/50 active:scale-95 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-tunnel-jade animate-pulse" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-tunnel-chalk font-mono">
                TRẠM 0{station.order_index}
              </span>
              <BookOpen className="w-3 h-3 text-tunnel-amber ml-0.5" />
            </button>

            {/* 5 Vạch Tiến Trình Trực Quan Tinh Tế (Tour Progress Dots 1..5) */}
            <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-stone-950/60 border border-stone-800/60">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    idx === station.order_index
                      ? "bg-tunnel-amber w-3.5 shadow-sm shadow-tunnel-amber"
                      : idx < station.order_index
                      ? "bg-tunnel-amber/50"
                      : "bg-stone-700"
                  }`}
                />
              ))}
            </div>

            {isOffline && (
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-tunnel-rust/20 border border-tunnel-rust/40 text-tunnel-rust text-[10px]">
                <WifiOff className="w-3 h-3" />
                <span>{dict.common.offline}</span>
              </div>
            )}
          </div>

          {/* Nút mở Menu Chọn Đa Ngôn Ngữ (6 Ngôn ngữ) */}
          <button
            onClick={() => setIsLangModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-stone-900/90 border border-tunnel-amber/40 text-tunnel-amber text-xs font-semibold hover:bg-tunnel-amber/10 active:scale-95 transition-all shadow-sm"
            aria-label="Select Language"
          >
            <span className="text-xs">{currentLocaleConfig.flag}</span>
            <span className="font-mono">{currentLocaleConfig.code.toUpperCase()}</span>
            <Globe className="w-3 h-3 ml-0.5 text-tunnel-amber/80" />
          </button>
        </div>

        {/* Hàng 2: Beacon Đo Lường Không Gian & Trấn An An Toàn */}
        <div
          onClick={() => setIsDetailsOpen(true)}
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-950/80 border border-stone-800/80 backdrop-blur-md cursor-pointer hover:border-stone-700 transition-all"
        >
          <div className="flex items-center space-x-3 text-xs text-tunnel-chalk">
            {safety.tunnel_length_meters > 0 ? (
              <>
                <div className="flex items-center space-x-1">
                  <Compass className="w-3.5 h-3.5 text-tunnel-amber" />
                  <span className="font-semibold">{safety.tunnel_length_meters}{dict.beacon.meters}</span>
                </div>
                <span className="text-stone-600">•</span>
                <div className="flex items-center space-x-1">
                  <span className="text-stone-400">{dict.beacon.time}</span>
                  <span className="font-semibold">{safety.avg_crawl_time_minutes}{dict.beacon.minutes}</span>
                </div>
                <span className="text-stone-600">•</span>
                <div className="flex items-center space-x-1 text-tunnel-jade truncate max-w-[130px] sm:max-w-[170px]">
                  <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{exitNote}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-1.5 text-tunnel-jade">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{dict.beacon.openGround}</span>
              </div>
            )}
          </div>
          <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold ml-2 font-mono">
            {dict.common.details}
          </span>
        </div>
      </header>

      {/* MODAL CHỌN ĐA NGÔN NGỮ (6 NGÔN NGỮ) */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-stone-950 border border-stone-800 rounded-3xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-tunnel-amber" />
                <h3 className="text-xs font-bold text-tunnel-amber uppercase tracking-wider font-mono">
                  {dict.common.selectLanguage}
                </h3>
              </div>
              <button
                onClick={() => setIsLangModalOpen(false)}
                className="p-1 rounded-lg bg-stone-900 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {SUPPORTED_LOCALES.map((item) => {
                const isSelected = item.code === locale;
                return (
                  <button
                    key={item.code}
                    onClick={() => {
                      onToggleLocale(item.code);
                      setIsLangModalOpen(false);
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-tunnel-amber/15 border-2 border-tunnel-amber text-tunnel-amber shadow-sm"
                        : "bg-stone-900/90 border border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-stone-800"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-base">{item.flag}</span>
                      <div className="text-left">
                        <p className="font-semibold text-white">{item.nativeLabel}</p>
                        <p className="text-[10px] text-stone-400">{item.label}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-tunnel-amber" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT SỬ LIỆU & HỒ SƠ KHÁM PHÁ TRẠM */}
      <StationDossierModal
        station={station}
        locale={locale}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onPlayNarration={() => {
          setIsDetailsOpen(false);
          const title = getLocalizedText(station.title, locale);
          const summary = getLocalizedText(station.short_summary, locale);
          const story = getLocalizedText(station.human_story_hook, locale);
          const audioUrl = (station.audio_assets as Record<string, { url: string }>)?.[locale]?.url || (station.audio_assets as Record<string, { url: string }>)?.[locale === "vi" ? "vi" : "en"]?.url;
          audioEngine.playStationNarration(station.id, title, summary, story, locale, audioUrl);
        }}
        onAskAI={() => {
          setIsDetailsOpen(false);
          audioEngine.pause();
        }}
      />
    </>
  );
};
