"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import stationsData from "@/data/stations.json";
import { Station } from "@/types/station";
import { Printer, ExternalLink, ShieldCheck, Compass, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";

const stations: Station[] = stationsData as unknown as Station[];

export default function QRStationDashboard() {
  const [baseUrl, setBaseUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090A0D] text-stone-200 p-4 sm:p-8 font-sans">
      {/* HEADER KHÔNG IN KHI IN BIỂN HIỆU */}
      <header className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-stone-800 print:hidden">
        <div>
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs text-tunnel-amber hover:underline font-mono mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>QUAY LẠI ỨNG DỤNG CHI VOICE</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            TRUNG TÂM PHÁT HÀNH MÃ QR THỰC ĐỊA
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Bộ biển bảng QR Code chuẩn di tích quốc gia dành cho 5 trạm thực địa Địa đạo Củ Chi
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-tunnel-amber text-stone-950 font-bold text-xs hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-tunnel-amber/20 font-mono"
          >
            <Printer className="w-4 h-4" />
            <span>IN TOÀN BỘ 5 BIỂN QR</span>
          </button>
        </div>
      </header>

      {/* DANH SÁCH 5 TẤM BIỂN QR CODE THỰC ĐỊA */}
      <main className="max-w-5xl mx-auto py-8 grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-1 print:gap-12">
        {stations.map((st) => {
          const qrTargetUrl = `${baseUrl || "http://localhost:3002"}/?station=${st.id}`;

          return (
            <div
              key={st.id}
              className="bg-stone-950 border-2 border-stone-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden print:border-4 print:border-black print:bg-white print:text-black print:rounded-none print:shadow-none print:break-inside-avoid"
            >
              {/* Vạch kẻ trang trí vàng hổ phách */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-tunnel-amber via-amber-400 to-tunnel-amber" />

              {/* Phần 1: Tiêu đề Trạm & Thông số An toàn */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-tunnel-amber/15 border border-tunnel-amber/40 text-tunnel-amber text-xs font-bold uppercase tracking-wider font-mono print:border-black print:text-black">
                    TRẠM 0{st.order_index} • ĐỊA ĐẠO CỦ CHI
                  </span>
                  <span className="text-[11px] font-mono text-stone-500 print:text-black">
                    ID: {st.id}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white print:text-black">
                    {st.title.vi}
                  </h2>
                  <p className="text-xs text-stone-400 font-medium italic mt-0.5 print:text-stone-700">
                    {st.title.en}
                  </p>
                </div>

                {/* Thông số an toàn & Địa tầng */}
                <div className="p-3 rounded-2xl bg-stone-900/80 border border-stone-800/80 flex items-center justify-between text-xs print:bg-stone-100 print:border-stone-300">
                  <div className="flex items-center space-x-1.5">
                    <Compass className="w-4 h-4 text-tunnel-amber print:text-black" />
                    <span className="font-semibold text-white print:text-black">
                      {st.safety.tunnel_length_meters > 0
                        ? `${st.safety.tunnel_length_meters}m • ~${st.safety.avg_crawl_time_minutes} phút`
                        : "Khu vực mặt đất"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-tunnel-jade print:text-black font-semibold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[130px]">{st.safety.emergency_exit_note.vi}</span>
                  </div>
                </div>
              </div>

              {/* Phần 2: Mã QR SVG Độ Phân Giải Cao */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4 bg-stone-900/40 rounded-2xl border border-stone-900 p-4 print:bg-white print:border-none">
                <div className="p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                  <QRCodeSVG
                    value={qrTargetUrl}
                    size={160}
                    level="H"
                    includeMargin={false}
                    fgColor="#000000"
                    bgColor="#FFFFFF"
                  />
                </div>

                <div className="text-center sm:text-left space-y-1.5 max-w-[200px]">
                  <p className="text-xs font-bold text-white uppercase tracking-wider print:text-black">
                    QUÉT MÃ BẰNG CAMERA
                  </p>
                  <p className="text-[11px] text-stone-400 leading-tight print:text-stone-600">
                    Nghe thuyết minh AI & hướng dẫn an toàn trực tiếp vào tai nghe.
                  </p>
                  <p className="text-[10px] text-stone-500 font-mono italic print:text-stone-500">
                    Scan with phone camera to listen.
                  </p>
                </div>
              </div>

              {/* Phần 3: Nút Thử Nghiệm Nhanh (Chỉ hiện trên màn hình, không in) */}
              <div className="pt-2 border-t border-stone-900 flex items-center justify-between print:hidden">
                <span className="text-[11px] text-stone-500 font-mono truncate max-w-[180px]">
                  {qrTargetUrl}
                </span>

                <Link
                  href={`/?station=${st.id}`}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-tunnel-amber/20 hover:text-tunnel-amber border border-stone-800 text-xs font-semibold text-stone-300 transition-all font-mono"
                >
                  <span>MỞ THỬ TRẠM NÀY</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
