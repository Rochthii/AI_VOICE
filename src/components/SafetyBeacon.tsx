"use client";

import React, { useState } from "react";
import { Station } from "@/types/station";
import { Locale, getDictionary, getLocalizedText, SUPPORTED_LOCALES, LOCALE_MAP } from "@/i18n";
import { Globe, WifiOff, X, Check, Layers, Compass, ChevronRight } from "lucide-react";
import { StationDossierModal } from "./StationDossierModal";
import { audioEngine } from "@/lib/audio-engine";

interface SafetyBeaconProps {
  station: Station | null;
  locale: Locale;
  onToggleLocale: (locale: Locale) => void;
  onOpenOverview?: () => void;
  onOpenDossier?: () => void;
  isOffline: boolean;
}

export const SafetyBeacon: React.FC<SafetyBeaconProps> = ({
  station,
  locale,
  onToggleLocale,
  onOpenOverview,
  onOpenDossier,
  isOffline
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const dict = getDictionary(locale);
  const currentLocaleConfig = LOCALE_MAP[locale] || LOCALE_MAP.vi;

  const isGlobalOverview = !station;
  const title = station ? getLocalizedText(station.title, locale) : "";
  const length = station?.safety?.tunnel_length_meters || 15;
  const time = station?.safety?.avg_crawl_time_minutes || 2;

  const handleOpenDossier = () => {
    if (onOpenDossier) {
      onOpenDossier();
    } else {
      setIsDetailsOpen(true);
    }
  };

  return (
    <>
      <header className="w-full flex flex-col justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 bg-gradient-to-b from-[#FAF7F2] to-[#F4F0E6] border-b border-[#E2D9C8] select-none shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        {/* Hàng 1: Nút điều hướng bản đồ & Nút chọn ngôn ngữ */}
        <div className="flex items-center justify-between mb-2">
          {onOpenOverview && (
            <button
              onClick={onOpenOverview}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DDD4C2] text-stone-800 hover:text-amber-900 hover:border-amber-600 active:scale-95 transition-all text-xs font-bold shadow-sm font-sans"
              aria-label="Chuyển chế độ xem bản đồ"
            >
              {isGlobalOverview ? (
                <>
                  <Layers className="w-3.5 h-3.5 text-amber-700" />
                  <span>{locale === "vi" ? "Bản Đồ 5 Trạm" : "Station Map"}</span>
                </>
              ) : (
                <>
                  <Compass className="w-3.5 h-3.5 text-amber-700" />
                  <span>{locale === "vi" ? "Về Toàn Cảnh" : "Overview"}</span>
                </>
              )}
            </button>
          )}

          <div className="flex items-center space-x-2">
            {isOffline && (
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold">
                <WifiOff className="w-3 h-3" />
                <span>OFFLINE</span>
              </div>
            )}

            {/* Nút Chọn Ngôn Ngữ */}
            <button
              onClick={() => setIsLangModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DDD4C2] text-stone-800 text-xs font-bold hover:border-amber-600 active:scale-95 transition-all shadow-sm font-sans"
              aria-label="Chọn ngôn ngữ"
            >
              <span>{currentLocaleConfig.flag}</span>
              <span className="font-mono text-xs font-bold">{currentLocaleConfig.code.toUpperCase()}</span>
              <Globe className="w-3 h-3 text-amber-700 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Hàng 2: Tiêu đề Trạm Di Tích Trang Nhã Chuẩn Bảo Tàng */}
        <div className="flex items-center justify-between pt-1">
          {isGlobalOverview ? (
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-amber-800 font-sans">
                {locale === "vi" ? "Di tích Lịch sử Quốc gia Đặc biệt" : "Special National Historic Relic"}
              </span>
              <h1 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight font-sans">
                {locale === "vi" ? "Địa Đạo Củ Chi" : "Cu Chi Tunnels"}
              </h1>
              <span className="text-[11px] text-stone-500 font-medium font-sans">
                {locale === "vi" ? "Thành phố ngầm 250km • 3 tầng liên hoàn" : "250km 3-level subterranean network"}
              </span>
            </div>
          ) : (
            <div className="flex flex-col flex-1 pr-2">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-100/90 text-amber-900 text-[10px] font-extrabold tracking-wider font-sans">
                  TRẠM 0{station.order_index} / 05
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  {locale === "vi" ? `Dài ${length}m • ${time} phút tham quan` : `Length ${length}m • ${time} mins`}
                </span>
              </div>

              <h1 className="text-base sm:text-lg font-black text-stone-900 tracking-tight mt-0.5 font-sans line-clamp-1">
                {title}
              </h1>
            </div>
          )}

          {/* Nút Mở Hồ Sơ Di Tích Chi Tiết */}
          {!isGlobalOverview && (
            <button
              onClick={handleOpenDossier}
              className="flex-shrink-0 flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs shadow-sm active:scale-95 transition-all font-sans"
            >
              <span>{locale === "vi" ? "Hồ Sơ" : "Dossier"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* MODAL HỒ SƠ CHI TIẾT TRẠM */}
      {!isGlobalOverview && station && (
        <StationDossierModal
          station={station}
          locale={locale}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          onPlayNarration={() => {
            setIsDetailsOpen(false);
            const titleText = getLocalizedText(station.title, locale);
            const summaryText = getLocalizedText(station.short_summary, locale);
            const storyText = getLocalizedText(station.human_story_hook, locale);
            const audioUrl =
              (station.audio_assets as Record<string, { url: string }>)?.[locale]?.url ||
              (station.audio_assets as Record<string, { url: string }>)?.[locale === "vi" ? "vi" : "en"]?.url;
            audioEngine.playStationNarration(station.id, titleText, summaryText, storyText, locale, audioUrl);
          }}
          onAskAI={() => {
            setIsDetailsOpen(false);
          }}
        />
      )}

      {/* MODAL CHỌN ĐA NGÔN NGỮ */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#FAF7F2] border border-[#DDD7CC] rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2 text-amber-800">
                <Globe className="w-5 h-5 text-amber-700" />
                <h3 className="text-sm font-bold uppercase text-stone-900 font-sans">
                  {locale === "vi" ? "Chọn Ngôn Ngữ Thuyết Minh" : "Select Narration Language"}
                </h3>
              </div>
              <button
                onClick={() => setIsLangModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {SUPPORTED_LOCALES.map((loc) => {
                const isSelected = loc.code === locale;
                return (
                  <button
                    key={loc.code}
                    onClick={() => {
                      audioEngine.playBambooClickSound();
                      onToggleLocale(loc.code);
                      setIsLangModalOpen(false);
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl border text-sm font-semibold transition-all font-sans ${
                      isSelected
                        ? "bg-amber-100/80 border-amber-600 text-amber-950 shadow-sm"
                        : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{loc.flag}</span>
                      <div className="text-left">
                        <div className="font-bold text-stone-900 leading-tight">{loc.label}</div>
                        <div className="text-[11px] text-stone-500 font-normal">{loc.nativeLabel}</div>
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
    </>
  );
};
