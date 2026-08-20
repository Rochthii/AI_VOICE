"use client";

import React from "react";
import { AlertTriangle, X, ShieldAlert, ArrowUpRight } from "lucide-react";
import { Station } from "@/types/station";
import { Locale, getDictionary, getLocalizedText } from "@/i18n";

interface PanicModalProps {
  isOpen: boolean;
  station: Station;
  locale: Locale;
  onClose: () => void;
}

export const PanicModal: React.FC<PanicModalProps> = ({
  isOpen,
  station,
  locale,
  onClose
}) => {
  if (!isOpen) return null;

  const dict = getDictionary(locale);
  const safety = station.safety;
  const exitNote = getLocalizedText(safety.emergency_exit_note, locale);
  const reassurance = getLocalizedText(safety.reassurance_message, locale);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 bg-gradient-to-b from-teal-900 via-emerald-950 to-black text-tunnel-chalk animate-in fade-in zoom-in duration-200">
      {/* Header Modal */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-tunnel-jade">
          <ShieldAlert className="w-7 h-7 animate-bounce" />
          <span className="text-lg font-bold tracking-wider uppercase font-mono">
            {dict.panic.title}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-stone-900/80 text-stone-300 hover:text-white"
          aria-label="Close Panic Mode"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Đèn Dạ Quang Chiếu Sáng Soi Đường (#2DD4BF Torch Light) */}
      <div className="flex flex-col items-center justify-center my-auto text-center space-y-6">
        <div className="w-32 h-32 rounded-full bg-tunnel-jade/30 border-4 border-tunnel-jade flex items-center justify-center shadow-[0_0_60px_rgba(45,212,191,0.6)] animate-pulse">
          <AlertTriangle className="w-16 h-16 text-tunnel-jade" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">
            {dict.panic.safeZoneHeader}
          </h2>
          <p className="text-sm text-stone-300 max-w-xs mx-auto leading-relaxed">
            {reassurance}
          </p>
        </div>

        <div className="w-full max-w-sm p-4 rounded-2xl bg-black/60 border border-tunnel-jade/50 text-left space-y-2 shadow-xl">
          <div className="flex items-center space-x-2 text-tunnel-jade font-semibold text-sm">
            <ArrowUpRight className="w-5 h-5" />
            <span>{dict.panic.exitPathLabel}</span>
          </div>
          <p className="text-base text-white font-medium pl-7">
            {exitNote}
          </p>
        </div>
      </div>

      {/* Nút Hoàn Tất */}
      <button
        onClick={onClose}
        className="w-full py-4 rounded-xl bg-tunnel-jade text-stone-950 font-bold text-base hover:bg-teal-300 active:scale-95 transition-all shadow-lg shadow-tunnel-jade/20 font-mono"
      >
        {dict.panic.reassuranceButton}
      </button>
    </div>
  );
};
