"use client";

import React, { useState } from "react";
import { Station } from "@/types/station";
import { Locale, getDictionary, getLocalizedText, LOCALE_MAP } from "@/i18n";
import {
  Compass,
  ShieldCheck,
  Flame,
  HeartPulse,
  ShieldAlert,
  Wind,
  Crosshair,
  QrCode,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  BookOpen
} from "lucide-react";
import { StationDossierModal } from "./StationDossierModal";

interface OverviewHubProps {
  stations: Station[];
  locale: Locale;
  onSelectStation: (station: Station) => void;
  onClose?: () => void;
}

const STATION_ICONS: Record<string, React.ReactNode> = {
  "01_hoang_cam_kitchen": <Flame className="w-5 h-5 text-amber-400" />,
  "02_field_hospital": <HeartPulse className="w-5 h-5 text-rose-400" />,
  "03_command_bunker": <ShieldAlert className="w-5 h-5 text-emerald-400" />,
  "04_ventilation_termite": <Wind className="w-5 h-5 text-cyan-400" />,
  "05_booby_traps": <Crosshair className="w-5 h-5 text-yellow-400" />
};

const STATION_DEPTHS: Record<string, { vi: string; en: string }> = {
  "01_hoang_cam_kitchen": { vi: "Tầng 2 (Sâu 5m - 8m)", en: "Level 2 (5m - 8m Depth)" },
  "02_field_hospital": { vi: "Tầng 2 (Sâu 5m - 8m)", en: "Level 2 (5m - 8m Depth)" },
  "03_command_bunker": { vi: "Tầng 3 (Sâu 8m - 12m)", en: "Level 3 (8m - 12m Depth)" },
  "04_ventilation_termite": { vi: "Tầng 1 & 2 (Đối lưu nhiệt)", en: "Level 1 & 2 (Convection)" },
  "05_booby_traps": { vi: "Mặt đất (Khu trưng bày)", en: "Surface (Exhibition Area)" }
};

export const OverviewHub: React.FC<OverviewHubProps> = ({
  stations,
  locale,
  onSelectStation,
  onClose
}) => {
  const [dossierStation, setDossierStation] = useState<Station | null>(null);
  const dict = getDictionary(locale);

  return (
    <div className="fixed inset-0 z-50 bg-[#090A0D]/95 backdrop-blur-xl flex flex-col justify-between overflow-y-auto text-stone-200 select-none animate-fadeIn">
      {/* 1. HEADER TỔNG QUAN DI TÍCH */}
      <header className="p-5 pb-4 border-b border-stone-800/80 sticky top-0 bg-[#090A0D]/90 backdrop-blur-md z-10 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-tunnel-amber/20 border border-tunnel-amber/40 text-tunnel-amber text-[10px] font-bold tracking-widest uppercase font-mono">
              DI TÍCH QUỐC GIA ĐẶC BIỆT
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-tunnel-jade animate-pulse" />
          </div>
          <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mt-1">
            ĐỊA ĐẠO CỦ CHI — ĐẤT THÉP THÀNH ĐỒNG
          </h1>
          <p className="text-xs text-stone-400">
            {locale === "vi"
              ? "Bấm vào từng trạm để xem hồ sơ chi tiết (có những gì, nguyên lý hoạt động)"
              : "Click any station to explore its full dossier, artifacts, and engineering secrets"}
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-stone-900 border border-stone-700 text-stone-300 hover:text-white active:scale-95 transition-all"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
      </header>

      {/* 2. NỘI DUNG TỔNG QUAN & DANH SÁCH 5 TRẠM */}
      <main className="p-4 sm:p-6 max-w-lg mx-auto w-full space-y-4 flex-1">
        {/* Banner tóm lược quy mô kỳ vĩ */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-900/90 via-stone-950/90 to-stone-900/90 border border-tunnel-amber/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-tunnel-amber/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-tunnel-amber/20 border border-tunnel-amber/40 text-tunnel-amber flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-tunnel-amber font-mono">
                {locale === "vi" ? "QUY MÔ CÔNG TRÌNH NGẦM" : "SUBTERRANEAN ENGINEERING"}
              </h2>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                {locale === "vi"
                  ? "Hơn 250km đường hầm chia làm 3 tầng liên hoàn, đào hoàn toàn thủ công trong lòng đất sét pha đá ong, là căn cứ đầu não kiên cường của quân dân Củ Chi."
                  : "Over 250km of interconnected 3-level tunnels dug entirely by hand, standing as an indestructible subterranean fortress."}
              </p>
            </div>
          </div>
        </div>

        {/* Danh sách 5 Trạm Thực Địa */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest font-mono px-1">
            {locale === "vi" ? "5 TRẠM THỰC ĐỊA CHÍNH THỨC (BẤM ĐỂ KHÁM PHÁ)" : "5 OFFICIAL FIELD STATIONS"}
          </h3>

          {stations.map((st) => {
            const title = getLocalizedText(st.title, locale);
            const summary = getLocalizedText(st.short_summary, locale);
            const depth = STATION_DEPTHS[st.id]?.[locale === "vi" ? "vi" : "en"] || "Tầng 2";

            return (
              <button
                key={st.id}
                onClick={() => setDossierStation(st)}
                className="w-full p-4 rounded-2xl bg-stone-950/80 border border-stone-800/80 hover:border-tunnel-amber/60 hover:bg-stone-900/80 active:scale-[0.98] transition-all text-left flex items-center justify-between group shadow-lg"
              >
                <div className="flex items-start space-x-3.5 pr-2">
                  <div className="p-3 rounded-xl bg-stone-900 border border-stone-700/80 group-hover:border-tunnel-amber/50 group-hover:bg-tunnel-amber/10 transition-all flex-shrink-0">
                    {STATION_ICONS[st.id] || <Compass className="w-5 h-5 text-tunnel-amber" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-tunnel-amber tracking-wider uppercase font-mono px-2 py-0.5 rounded-md bg-tunnel-amber/10 border border-tunnel-amber/20">
                        TRẠM 0{st.order_index}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {depth}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-tunnel-amber transition-colors line-clamp-1">
                      {title}
                    </h4>

                    <p className="text-xs text-stone-400 line-clamp-2 leading-snug">
                      {summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 flex-shrink-0 text-tunnel-amber opacity-80 group-hover:opacity-100">
                  <BookOpen className="w-4 h-4" />
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* 3. FOOTER HƯỚNG DẪN QUÉT QR / CHẠM NFC */}
      <footer className="p-4 border-t border-stone-800/80 bg-[#090A0D]/90 backdrop-blur-md text-center">
        <div className="flex items-center justify-center space-x-2 text-xs text-stone-400">
          <QrCode className="w-4 h-4 text-tunnel-amber" />
          <span>
            {locale === "vi"
              ? "Hoặc quét mã QR / chạm NFC trực tiếp tại bảng hiệu thực địa"
              : "Or scan QR code / tap NFC directly at station signage"}
          </span>
        </div>
      </footer>

      {/* 4. MODAL HỒ SƠ CHI TIẾT TRẠM (STATION DOSSIER) */}
      {dossierStation && (
        <StationDossierModal
          station={dossierStation}
          locale={locale}
          isOpen={true}
          onClose={() => setDossierStation(null)}
          onPlayNarration={() => {
            const st = dossierStation;
            setDossierStation(null);
            onSelectStation(st);
          }}
          onAskAI={() => {
            const st = dossierStation;
            setDossierStation(null);
            onSelectStation(st);
          }}
        />
      )}
    </div>
  );
};
