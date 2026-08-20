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
  "01_hoang_cam_kitchen": <Flame className="w-5 h-5 text-amber-600" />,
  "02_field_hospital": <HeartPulse className="w-5 h-5 text-rose-600" />,
  "03_command_bunker": <ShieldAlert className="w-5 h-5 text-emerald-600" />,
  "04_ventilation_termite": <Wind className="w-5 h-5 text-cyan-600" />,
  "05_booby_traps": <Crosshair className="w-5 h-5 text-amber-600" />
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
    <div className="fixed inset-0 z-50 bg-[#FAF7F2] flex flex-col justify-between overflow-y-auto text-stone-900 select-none animate-fadeIn">
      {/* 1. HEADER TỔNG QUAN DI TÍCH */}
      <header className="p-5 pb-4 border-b border-stone-200 sticky top-0 bg-[#FAF7F2]/95 backdrop-blur-md z-10 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold tracking-widest uppercase font-sans">
              DI TÍCH QUỐC GIA ĐẶC BIỆT
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          </div>
          <h1 className="text-lg sm:text-xl font-black text-stone-900 uppercase tracking-tight mt-1 font-sans">
            ĐỊA ĐẠO CỦ CHI — ĐẤT THÉP THÀNH ĐỒNG
          </h1>
          <p className="text-xs text-stone-600">
            {locale === "vi"
              ? "Bấm vào từng trạm để xem hồ sơ chi tiết (có những gì, nguyên lý hoạt động)"
              : "Click any station to explore its full dossier, artifacts, and engineering secrets"}
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white border border-stone-300 text-stone-700 hover:text-stone-950 active:scale-95 transition-all shadow-sm"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
      </header>

      {/* 2. NỘI DUNG TỔNG QUAN & DANH SÁCH 5 TRẠM */}
      <main className="p-4 sm:p-6 max-w-lg mx-auto w-full space-y-4 flex-1">
        {/* Banner tóm lược quy mô kỳ vĩ */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-50/50 border border-amber-200 shadow-sm relative overflow-hidden">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900 font-sans">
                {locale === "vi" ? "QUY MÔ CÔNG TRÌNH NGẦM" : "SUBTERRANEAN ENGINEERING"}
              </h2>
              <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                {locale === "vi"
                  ? "Hơn 250km đường hầm chia làm 3 tầng liên hoàn, đào hoàn toàn thủ công trong lòng đất sét pha đá ong, là căn cứ đầu não kiên cường của quân dân Củ Chi."
                  : "Over 250km of interconnected 3-level tunnels dug entirely by hand, standing as an indestructible subterranean fortress."}
              </p>
            </div>
          </div>
        </div>

        {/* Danh sách 5 Trạm Thực Địa */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-stone-600 uppercase tracking-widest font-sans px-1">
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
                className="w-full p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-amber-500 hover:bg-amber-50/30 active:scale-[0.98] transition-all text-left flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-start space-x-3.5 pr-2">
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 group-hover:border-amber-400 group-hover:bg-amber-100 transition-all flex-shrink-0">
                    {STATION_ICONS[st.id] || <Compass className="w-5 h-5 text-amber-700" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-amber-900 tracking-wider uppercase font-sans px-2 py-0.5 rounded-md bg-amber-100 border border-amber-200">
                        TRẠM 0{st.order_index}
                      </span>
                      <span className="text-[10px] text-stone-500 font-medium font-sans">
                        {depth}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-1">
                      {title}
                    </h4>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-snug">
                      {summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 flex-shrink-0 text-amber-700">
                  <BookOpen className="w-4 h-4" />
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* 3. FOOTER HƯỚNG DẪN QUÉT QR / CHẠM NFC */}
      <footer className="p-4 border-t border-stone-200 bg-[#FAF7F2]/95 backdrop-blur-md text-center">
        <div className="flex items-center justify-center space-x-2 text-xs text-stone-600">
          <QrCode className="w-4 h-4 text-amber-700" />
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
