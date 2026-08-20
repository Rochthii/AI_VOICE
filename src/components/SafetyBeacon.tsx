"use client";

import React, { useState } from "react";
import { Station, Locale } from "@/types/station";
import { ShieldCheck, Compass, Globe, WifiOff, BookOpen, X, CheckCircle2 } from "lucide-react";

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
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const safety = station.safety;
  const exitNote = safety.emergency_exit_note[locale];

  return (
    <>
      <header className="h-[20vh] w-full flex flex-col justify-between p-4 bg-gradient-to-b from-tunnel-charcoal/95 to-transparent z-10 select-none">
        {/* Hàng 1: Badge Trạng Thái, Nút Chi Tiết & Nút Chuyển Đổi Song Ngữ */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsDetailsOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-tunnel-slate/80 border border-stone-800 backdrop-blur-md hover:border-tunnel-amber/50 active:scale-95 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-tunnel-jade animate-pulse" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-tunnel-chalk">
                TRẠM 0{station.order_index}
              </span>
              <BookOpen className="w-3 h-3 text-tunnel-amber ml-0.5" />
            </button>

            {isOffline && (
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-tunnel-rust/20 border border-tunnel-rust/40 text-tunnel-rust text-[10px]">
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </div>
            )}
          </div>

          {/* Nút chuyển đổi Song ngữ VI / EN */}
          <button
            onClick={() => onToggleLocale(locale === "vi" ? "en" : "vi")}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-stone-900/90 border border-tunnel-amber/40 text-tunnel-amber text-xs font-semibold hover:bg-tunnel-amber/10 active:scale-95 transition-all shadow-sm"
            aria-label="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{locale.toUpperCase()}</span>
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
                  <span className="font-semibold">{safety.tunnel_length_meters}m</span>
                </div>
                <span className="text-stone-600">•</span>
                <div className="flex items-center space-x-1">
                  <span className="text-stone-400">Thời gian:</span>
                  <span className="font-semibold">{safety.avg_crawl_time_minutes}p</span>
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
                <span>Khu vực trên mặt đất — Không gian mở</span>
              </div>
            )}
          </div>
          <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold ml-2">
            Chi tiết ↗
          </span>
        </div>
      </header>

      {/* MODAL CHI TIẾT SỬ LIỆU TRẠM */}
      {isDetailsOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-lg bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-800 pb-3">
              <div>
                <span className="text-[11px] font-bold text-tunnel-amber uppercase tracking-wider">
                  TRẠM 0{station.order_index} • ĐỊA ĐẠO CỦ CHI
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  {station.title[locale]}
                </h2>
              </div>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="p-1.5 rounded-lg bg-stone-900 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Câu chuyện con người */}
            <div className="p-3.5 rounded-xl bg-tunnel-amber/10 border border-tunnel-amber/20 space-y-1.5">
              <span className="text-[11px] font-bold text-tunnel-amber uppercase tracking-wider">
                {locale === "vi" ? "📖 Câu chuyện con người" : "📖 Human Narrative"}
              </span>
              <p className="text-xs text-stone-200 leading-relaxed italic">
                &ldquo;{station.human_story_hook[locale]}&rdquo;
              </p>
            </div>

            {/* Key Facts đã kiểm chứng */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-tunnel-jade uppercase tracking-wider">
                {locale === "vi" ? "Sự thật lịch sử đã kiểm chứng" : "Verified Historical Facts"}
              </h3>
              <div className="space-y-2">
                {station.key_facts.map((fact, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-stone-300">
                    <CheckCircle2 className="w-4 h-4 text-tunnel-jade flex-shrink-0 mt-0.5" />
                    <span>{fact[locale]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs Phổ biến */}
            {station.faqs && station.faqs.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-stone-800">
                <h3 className="text-xs font-bold text-tunnel-chalk uppercase tracking-wider">
                  {locale === "vi" ? "Hỏi & Đáp thường gặp" : "Frequently Asked Questions"}
                </h3>
                <div className="space-y-2">
                  {station.faqs.map((faq, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-stone-900/90 border border-stone-800 space-y-1">
                      <p className="text-xs font-semibold text-tunnel-amber">❓ {faq.question[locale]}</p>
                      <p className="text-xs text-stone-300">💬 {faq.answer[locale]}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nút đóng */}
            <button
              onClick={() => setIsDetailsOpen(false)}
              className="w-full py-3 rounded-xl bg-tunnel-amber text-stone-950 font-bold text-xs hover:bg-amber-400 active:scale-95 transition-all"
            >
              {locale === "vi" ? "ĐÃ HIỂU — TIẾP TỤC NGHE" : "CONTINUE LISTENING"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
