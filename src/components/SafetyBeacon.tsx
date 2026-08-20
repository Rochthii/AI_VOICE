"use client";

import React, { useState } from "react";
import { Station } from "@/types/station";
import { Locale, getDictionary, getLocalizedText, SUPPORTED_LOCALES, LOCALE_MAP } from "@/i18n";
import { ShieldCheck, Compass, Globe, WifiOff, BookOpen, X, Check, Sparkles, Layers } from "lucide-react";
import { StationDossierModal } from "./StationDossierModal";
import { audioEngine } from "@/lib/audio-engine";

interface SafetyBeaconProps {
  station: Station | null;
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
  const currentLocaleConfig = LOCALE_MAP[locale] || LOCALE_MAP.vi;

  const isGlobalOverview = !station;

  const safety = station?.safety;
  const exitNote = safety ? getLocalizedText(safety.emergency_exit_note, locale) : "";

  return (
    <>
      <header className="h-[20vh] w-full flex flex-col justify-between p-4 bg-gradient-to-b from-[#F2EFE8]/95 to-transparent z-10 select-none">
        {/* Hàng 1: Badge Trạng Thái & Nút Chọn Đa Ngôn Ngữ */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isGlobalOverview ? (
              <div className="flex items-center space-x-2">
                <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 text-xs font-bold font-sans shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>TOÀN CẢNH DI TÍCH</span>
                </span>

                {onOpenOverview && (
                  <button
                    onClick={onOpenOverview}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/90 border border-stone-300 text-stone-700 hover:text-amber-800 hover:border-amber-400 active:scale-95 transition-all text-xs font-medium shadow-sm"
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    <span>5 TRẠM</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                {onOpenOverview && (
                  <button
                    onClick={onOpenOverview}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 hover:bg-amber-200 active:scale-95 transition-all text-xs font-bold shadow-sm"
                    aria-label="Quay lại tổng quan"
                  >
                    <Compass className="w-3.5 h-3.5 text-amber-700" />
                    <span>TỔNG QUAN</span>
                  </button>
                )}

                <button
                  onClick={() => setIsDetailsOpen(true)}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-stone-300 backdrop-blur-md hover:border-amber-400 active:scale-95 transition-all shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="text-[11px] font-bold tracking-wider uppercase text-stone-800 font-sans">
                    TRẠM 0{station.order_index}
                  </span>
                  <BookOpen className="w-3 h-3 text-amber-600 ml-0.5" />
                </button>

                {/* 5 Vạch Tiến Trình Trực Quan Tinh Tế (Tour Progress Dots 1..5) */}
                <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-stone-200/80 border border-stone-300">
                  {[1, 2, 3, 4, 5].map((idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        idx === station.order_index
                          ? "bg-amber-600 w-3.5 shadow-sm shadow-amber-600/40"
                          : idx < station.order_index
                          ? "bg-amber-400"
                          : "bg-stone-300"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {isOffline && (
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-100 border border-rose-300 text-rose-700 text-[10px] font-medium">
                <WifiOff className="w-3 h-3" />
                <span>{dict.common.offline}</span>
              </div>
            )}
          </div>

          {/* Nút mở Menu Chọn Đa Ngôn Ngữ (6 Ngôn ngữ) */}
          <button
            onClick={() => setIsLangModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/90 border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-50 active:scale-95 transition-all shadow-sm"
            aria-label="Select Language"
          >
            <span className="text-xs">{currentLocaleConfig.flag}</span>
            <span className="font-mono">{currentLocaleConfig.code.toUpperCase()}</span>
            <Globe className="w-3 h-3 ml-0.5 text-amber-700" />
          </button>
        </div>

        {/* Hàng 2: Beacon Đo Lường Không Gian & Trấn An An Toàn */}
        <div
          onClick={() => {
            if (isGlobalOverview && onOpenOverview) {
              onOpenOverview();
            } else {
              setIsDetailsOpen(true);
            }
          }}
          className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/95 border border-[#E2DDD3] shadow-md backdrop-blur-md cursor-pointer hover:border-amber-400 transition-all"
        >
          <div className="flex items-center space-x-3 text-xs text-stone-800">
            {isGlobalOverview ? (
              <div className="flex items-center space-x-2 text-stone-700 font-sans text-xs font-medium">
                <span className="font-bold text-amber-800">250KM ĐỊA ĐẠO</span>
                <span className="text-stone-400">•</span>
                <span>3 TẦNG NGẦM</span>
                <span className="text-stone-400">•</span>
                <span className="text-emerald-700 font-bold">ĐẤT THÉP THÀNH ĐỒNG</span>
              </div>
            ) : safety && safety.tunnel_length_meters > 0 ? (
              <>
                <div className="flex items-center space-x-1">
                  <Compass className="w-3.5 h-3.5 text-amber-700" />
                  <span className="font-bold">{safety.tunnel_length_meters}{dict.beacon.meters}</span>
                </div>
                <span className="text-stone-300">•</span>
                <div className="flex items-center space-x-1">
                  <span className="text-stone-500">{dict.beacon.time}</span>
                  <span className="font-bold">{safety.avg_crawl_time_minutes}{dict.beacon.minutes}</span>
                </div>
                <span className="text-stone-300">•</span>
                <div className="flex items-center space-x-1 text-emerald-700 font-semibold truncate max-w-[130px] sm:max-w-[170px]">
                  <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{exitNote}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{dict.beacon.openGround}</span>
              </div>
            )}
          </div>
          <span className="text-[10px] text-amber-800 uppercase tracking-wider font-bold ml-2 font-mono bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            {isGlobalOverview ? "BẢN ĐỒ" : dict.common.details}
          </span>
        </div>
      </header>

      {/* MODAL CHỌN ĐA NGÔN NGỮ (6 NGÔN NGỮ) */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#FAF7F2] border border-[#DDD7CC] rounded-3xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-amber-700" />
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider font-sans">
                  {dict.common.selectLanguage}
                </h3>
              </div>
              <button
                onClick={() => setIsLangModalOpen(false)}
                className="p-1 rounded-lg bg-stone-100 text-stone-500 hover:text-stone-900"
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
                        ? "bg-amber-100 border-2 border-amber-600 text-amber-950 font-bold shadow-sm"
                        : "bg-white border border-stone-200 text-stone-700 hover:border-amber-300 hover:bg-amber-50/50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-base">{item.flag}</span>
                      <div className="text-left">
                        <p className="font-semibold text-stone-900">{item.nativeLabel}</p>
                        <p className="text-[10px] text-stone-500">{item.label}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-700" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT SỬ LIỆU & HỒ SƠ KHÁM PHÁ TRẠM */}
      {station && (
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
      )}
    </>
  );
};
