"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Loader2, MessageSquare, Send, Radio } from "lucide-react";
import { audioEngine } from "@/lib/audio-engine";
import { Locale } from "@/types/station";

interface SonicOrbProps {
  stationId: string;
  locale: Locale;
  isPlaying: boolean;
  onAskQuestion: (query: string) => Promise<string>;
  onAnswerReceived: (answer: string) => void;
}

export const SonicOrb: React.FC<SonicOrbProps> = ({
  stationId,
  locale,
  isPlaying,
  onAskQuestion,
  onAnswerReceived
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [typedQuery, setTypedQuery] = useState("");
  const [speechTranscript, setSpeechTranscript] = useState("");

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  const holdStartTimeRef = useRef<number>(0);
  const recognitionRef = useRef<unknown>(null);

  // 1. Khởi tạo Web Speech API Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new (SpeechRecognition as new () => {
          continuous: boolean;
          interimResults: boolean;
          lang: string;
          onresult: (e: { results: { [x: string]: { [x: string]: { transcript: string } } } }) => void;
          onerror: (e: unknown) => void;
          start: () => void;
          stop: () => void;
        })();

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = locale === "vi" ? "vi-VN" : "en-US";

        recognition.onresult = (event) => {
          const text = event.results[0][0].transcript;
          setSpeechTranscript(text);
        };

        recognition.onerror = (err) => {
          console.warn("[STT Error]:", err);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [locale]);

  // 2. Vẽ 60FPS Reactive Soundwave Core trên Canvas 3D (Đẹp mê hoặc)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;
    const width = (canvas.width = 240);
    const height = (canvas.height = 240);
    const centerX = width / 2;
    const centerY = height / 2;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const activeState = isHolding || isPlaying || isProcessing;
      const waveCount = activeState ? 4 : 2;
      const baseRadius = 46;

      for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();
        const currentPhase = phase + i * 0.8;
        const amplitude = isHolding ? 14 : isPlaying ? 10 : isProcessing ? 12 : 3.5;

        for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
          const offset = Math.sin(angle * 6 + currentPhase) * amplitude + Math.cos(angle * 3 - currentPhase) * (amplitude * 0.5);
          const r = baseRadius + i * 13 + offset;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (angle === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.closePath();
        ctx.lineWidth = 1.5;

        if (isHolding) {
          ctx.strokeStyle = `rgba(45, 212, 191, ${0.75 - i * 0.15})`;
          ctx.shadowColor = "#2DD4BF";
          ctx.shadowBlur = 12;
        } else if (isProcessing) {
          ctx.strokeStyle = `rgba(229, 169, 60, ${0.85 - i * 0.18})`;
          ctx.shadowColor = "#E5A93C";
          ctx.shadowBlur = 14;
        } else if (isPlaying) {
          ctx.strokeStyle = `rgba(229, 169, 60, ${0.65 - i * 0.12})`;
          ctx.shadowColor = "#E5A93C";
          ctx.shadowBlur = 8;
        } else {
          ctx.strokeStyle = `rgba(229, 169, 60, ${0.25 - i * 0.06})`;
          ctx.shadowBlur = 0;
        }

        ctx.stroke();
      }

      phase += isHolding ? 0.08 : isPlaying ? 0.04 : 0.02;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isHolding, isPlaying, isProcessing]);

  // 3. 3D Perspective Tilt theo con trỏ chuột / điểm chạm
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const tiltX = -(y / (rect.height / 2)) * 14;
    const tiltY = (x / (rect.width / 2)) * 14;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // 4. Bắt đầu chạm giữ
  const handleTouchStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      holdStartTimeRef.current = Date.now();
      setIsHolding(true);
      setSpeechTranscript("");

      audioEngine.triggerHapticFeedback();
      audioEngine.playBambooClickSound();
      audioEngine.pause();

      if (recognitionRef.current) {
        try {
          (recognitionRef.current as { start: () => void }).start();
        } catch {
          // No-op
        }
      }
    },
    []
  );

  // 5. Kết thúc chạm giữ
  const handleTouchEnd = useCallback(
    async (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      const holdDuration = Date.now() - holdStartTimeRef.current;
      setIsHolding(false);

      if (recognitionRef.current) {
        try {
          (recognitionRef.current as { stop: () => void }).stop();
        } catch {
          // No-op
        }
      }

      if (holdDuration < 250) {
        setIsTextModalOpen(true);
        return;
      }

      const query =
        speechTranscript.trim() ||
        (locale === "vi"
          ? "Điểm di tích này có ý nghĩa lịch sử gì?"
          : "What is the historical significance of this station?");

      setIsProcessing(true);
      try {
        const answer = await onAskQuestion(query);
        onAnswerReceived(answer);
      } catch (err) {
        console.error("[SonicOrb Ask Error]:", err);
      } finally {
        setIsProcessing(false);
      }
    },
    [speechTranscript, locale, onAskQuestion, onAnswerReceived]
  );

  const handleSendTypedQuery = async (queryText?: string) => {
    const q = (queryText || typedQuery).trim();
    if (!q) return;

    setIsTextModalOpen(false);
    setTypedQuery("");
    setIsProcessing(true);
    audioEngine.pause();

    try {
      const answer = await onAskQuestion(q);
      onAnswerReceived(answer);
    } catch (err) {
      console.error("[SonicOrb Ask Error]:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const sampleQuestions =
    locale === "vi"
      ? [
          "Bếp Hoàng Cầm giấu khói thế nào?",
          "Bác sĩ Võ Hoàng Lê là ai?",
          "Có phải người dân bị ép đào hầm?",
          "44.357 liệt sĩ có thật không?",
          "Lỗ thông hơi ụ mối có tác dụng gì?",
          "Mìn gạt Tô Văn Đực chế tạo ra sao?"
        ]
      : [
          "How did Hoang Cam stove hide smoke?",
          "Who was Dr. Vo Hoang Le?",
          "Were civilians forced to dig?",
          "Is the 44,357 martyr count verified?",
          "How do termite mound vents work?",
          "How were To Van Duc sweep mines built?"
        ];

  return (
    <main
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="h-[50vh] w-full flex flex-col items-center justify-center relative select-none perspective-[1000px]"
    >
      {/* 1. HIỆU ỨNG SÓNG SONAR LAN TỎA */}
      {isPlaying && (
        <div className="absolute w-[280px] h-[280px] rounded-full border border-tunnel-amber/30 animate-sonar pointer-events-none" />
      )}
      {isHolding && (
        <div className="absolute w-[300px] h-[300px] rounded-full border border-tunnel-jade/50 animate-sonar pointer-events-none" />
      )}

      {/* 2. VÒNG GYROSCOPE 3D ORBITAL RINGS */}
      <div className="absolute w-[310px] h-[310px] pointer-events-none flex items-center justify-center">
        {/* Vòng xoay 3D 1 */}
        <div className="absolute w-full h-full rounded-full border border-dashed border-tunnel-amber/25 animate-gyro-1 opacity-70" />
        {/* Vòng xoay 3D 2 ngược chiều */}
        <div className="absolute w-[275px] h-[275px] rounded-full border border-tunnel-amber/20 animate-gyro-2 opacity-50" />
        {/* Vệt sáng quét Hologram */}
        <div className="absolute w-[260px] h-[260px] rounded-full border-t-2 border-tunnel-amber/60 animate-light-sweep" />
      </div>

      {/* 3. KHỐI CẦU ÂM BẢN 3D SIÊU THỰC (ULTRA-3D OBSIDIAN MONOLITH SPHERE) */}
      <div
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.15s ease-out"
        }}
        className="relative flex items-center justify-center animate-sphere-float z-20"
      >
        <button
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          className={`w-[225px] h-[225px] sm:w-[235px] sm:h-[235px] rounded-full relative cursor-pointer overflow-hidden transition-all duration-500 transform active:scale-95 ${
            isHolding ? "sphere-3d-jade" : "sphere-3d-obsidian"
          }`}
          aria-label="Quả Cầu Âm Bản 3D"
        >
          {/* Lớp phản quang vòm sắc nét (Curved Specular Glare) */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none opacity-85" />
          <div className="absolute top-2 left-6 w-24 h-12 rounded-full bg-white/20 blur-sm transform -rotate-45 pointer-events-none" />

          {/* Canvas 3D Reactive Soundwave Core */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none opacity-90"
          />

          {/* Vòng tâm lõi phát sáng & MICRO 3D CHUYÊN NGHIỆP */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center z-10 ${
              isProcessing ? "animate-spin" : ""
            }`}
          >
            {/* Lớp hào quang lõi bao quanh Micro */}
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                isHolding
                  ? "bg-teal-500/25 shadow-[0_0_35px_#2DD4BF]"
                  : isProcessing
                  ? "bg-amber-500/25 shadow-[0_0_40px_#E5A93C]"
                  : isPlaying
                  ? "bg-amber-500/20 shadow-[0_0_30px_#E5A93C]"
                  : "bg-stone-900/60 shadow-inner"
              }`}
            >
              {/* MICRO 3D ĐIÊU KHẮC KIM LOẠI NGUYÊN KHỐI (3D SCULPTED METALLIC MICROPHONE) */}
              {isProcessing ? (
                <Loader2 className="w-12 h-12 text-tunnel-amber animate-spin drop-shadow-[0_0_12px_rgba(229,169,60,0.8)]" />
              ) : (
                <div className="relative flex flex-col items-center justify-center transform hover:scale-105 transition-all">
                  {/* Đầu Lưới Micro 3D (Metallic Mesh Capsule) */}
                  <div
                    className={`w-8 h-10 rounded-t-full border-2 relative overflow-hidden transition-all duration-300 ${
                      isHolding
                        ? "bg-gradient-to-b from-teal-200 via-teal-500 to-teal-900 border-teal-300 shadow-[0_0_15px_#2DD4BF]"
                        : isPlaying
                        ? "bg-gradient-to-b from-amber-200 via-amber-500 to-amber-900 border-amber-300 shadow-[0_0_15px_#E5A93C]"
                        : "bg-gradient-to-b from-amber-200 via-amber-600 to-stone-900 border-amber-400/90 shadow-[0_0_12px_rgba(229,169,60,0.6)]"
                    }`}
                  >
                    {/* Vân lưới kim loại Micro Studio (Studio Mesh Pattern) */}
                    <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:3px_3px] opacity-40" />
                    {/* Vệt phản quang kim loại (Metallic Specular Highlight) */}
                    <div className="absolute top-0 left-1 w-2 h-full bg-white/40 blur-[0.5px] rounded-full transform -rotate-12" />
                  </div>

                  {/* Vành Cổ Micro Kim Loại Vàng (Golden Collar Ring) */}
                  <div className="w-9 h-1.5 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-700 rounded-sm shadow-sm" />

                  {/* Thân Micro Trụ Kim Loại 3D (Microphone Metallic Stem) */}
                  <div className="w-4 h-3 bg-gradient-to-r from-stone-800 via-amber-500/80 to-stone-900 rounded-b-md border-x border-amber-400/40" />

                  {/* Vòng gá đỡ chống rung 3D (Shockmount Ring) */}
                  <div
                    className={`absolute -bottom-1.5 w-12 h-6 border-b-2 rounded-b-full pointer-events-none transition-all ${
                      isHolding
                        ? "border-teal-300 shadow-[0_2px_8px_#2DD4BF]"
                        : "border-amber-400/80 shadow-[0_2px_8px_rgba(229,169,60,0.5)]"
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Dòng trạng thái phát sáng dưới Micro */}
            <div className="mt-2 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/80 border border-white/10 backdrop-blur-md shadow-lg">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isHolding
                    ? "bg-tunnel-jade animate-ping"
                    : isProcessing
                    ? "bg-tunnel-amber animate-spin"
                    : isPlaying
                    ? "bg-tunnel-amber animate-pulse"
                    : "bg-tunnel-amber"
                }`}
              />
              <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-white/95 uppercase font-mono">
                {isProcessing
                  ? locale === "vi"
                    ? "TRA SỬ LIỆU"
                    : "SEARCHING ARCHIVES"
                  : isHolding
                  ? locale === "vi"
                    ? "ĐANG LẮNG NGHE"
                    : "LISTENING"
                  : isPlaying
                  ? locale === "vi"
                    ? "ĐANG THUYẾT MINH"
                    : "NARRATION ACTIVE"
                  : locale === "vi"
                  ? "CHẠM ĐỂ HỎI AI"
                  : "TAP TO ASK AI"}
              </span>
            </div>
          </div>

          {/* Vành Rim kim loại 3D ngoài cùng */}
          <div className="absolute inset-0 rounded-full border border-white/15 pointer-events-none shadow-inner" />
        </button>
      </div>

      {/* 4. PHỤ ĐỀ THỜI GIAN THỰC KHI ĐANG NÓI VÀO MIC */}
      {speechTranscript && (
        <div className="absolute -bottom-2 max-w-[90%] px-4 py-2 rounded-xl bg-stone-950/95 border border-tunnel-amber/60 text-xs text-tunnel-amber text-center shadow-2xl backdrop-blur-md animate-in fade-in z-30 font-mono">
          [REC] &ldquo;{speechTranscript}&rdquo;
        </div>
      )}

      {/* 5. MODAL HỎI ĐÁP TOÀN NĂNG (GÕ TEXT & TEST PROMPTS) */}
      {isTextModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-stone-950 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 text-tunnel-amber">
                <div className="p-2 rounded-xl bg-tunnel-amber/15 border border-tunnel-amber/30">
                  <MessageSquare className="w-5 h-5 text-tunnel-amber" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide uppercase text-white font-mono">
                    {locale === "vi" ? "TRUNG TÂM HỎI ĐÁP AI" : "AI VOICE INTELLIGENCE"}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    {locale === "vi" ? "Tra cứu văn khố sử liệu Địa đạo Củ Chi" : "Official Cu Chi Historical Archives"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTextModalOpen(false)}
                className="text-stone-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-800 font-mono"
              >
                Đóng
              </button>
            </div>

            {/* Input Gõ Câu Hỏi */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={typedQuery}
                onChange={(e) => setTypedQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendTypedQuery()}
                placeholder={
                  locale === "vi"
                    ? "Nhập câu hỏi lịch sử hoặc thử câu bẫy..."
                    : "Type a historical or test query..."
                }
                className="flex-1 px-4 py-3 bg-stone-900 border border-stone-700 rounded-2xl text-sm text-tunnel-chalk focus:outline-none focus:border-tunnel-amber placeholder-stone-500 shadow-inner"
                autoFocus
              />
              <button
                onClick={() => handleSendTypedQuery()}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-tunnel-amber to-amber-600 text-stone-950 font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-tunnel-amber/25"
                aria-label="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Bộ Prompt Mẫu */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-stone-400">
                <span>{locale === "vi" ? "Gợi ý câu hỏi kiểm tra nhanh:" : "Test prompt suite:"}</span>
                <span className="text-tunnel-amber text-[10px] font-mono">1-CLICK QUERY</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {sampleQuestions.map((sq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendTypedQuery(sq)}
                    className="text-left text-[11px] p-2.5 rounded-xl bg-stone-900/80 border border-stone-800/90 text-stone-300 hover:border-tunnel-amber hover:bg-tunnel-amber/10 hover:text-tunnel-amber active:scale-95 transition-all leading-snug font-sans"
                  >
                    • {sq}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
