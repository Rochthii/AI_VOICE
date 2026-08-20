"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MessageSquare, Send, Sparkles, Volume2 } from "lucide-react";
import { audioEngine } from "@/lib/audio-engine";
import { Locale, getDictionary, LOCALE_MAP } from "@/i18n";

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
  const dict = getDictionary(locale);
  const [isHolding, setIsHolding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState("");
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [typedQuery, setTypedQuery] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const recognitionRef = useRef<unknown>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const holdStartTimeRef = useRef<number>(0);

  // Khởi tạo Web Speech API cho phản hồi nhanh
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new (SpeechRecognition as new () => any)();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = LOCALE_MAP[locale]?.speechLang || "vi-VN";

        recognition.onresult = (event: any) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            interim += event.results[i][0].transcript;
          }
          if (interim) {
            setSpeechTranscript(interim);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("[WebSpeech Warning]:", event.error);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [locale]);

  // Sóng âm thanh ấm áp, êm dịu (Warm Organic Audio Wave Canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const baseRadius = canvas.width * 0.36;

      const waveCount = isPlaying ? 3 : isHolding ? 4 : isProcessing ? 2 : 1;
      const speed = isPlaying ? 0.04 : isHolding ? 0.06 : isProcessing ? 0.03 : 0.015;
      time += speed;

      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        const points = 40;
        const currentRadius = baseRadius + w * (isHolding ? 8 : 6);

        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const noise = Math.sin(angle * 3 + time + w) * (isHolding ? 10 : isPlaying ? 8 : 4);
          const r = currentRadius + noise;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.closePath();

        if (isHolding) {
          ctx.strokeStyle = `rgba(5, 150, 105, ${0.45 - w * 0.08})`;
          ctx.lineWidth = 2.5;
        } else if (isPlaying) {
          ctx.strokeStyle = `rgba(217, 119, 6, ${0.5 - w * 0.1})`;
          ctx.lineWidth = 2.5;
        } else if (isProcessing) {
          ctx.strokeStyle = `rgba(180, 83, 9, ${0.4 - w * 0.1})`;
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = "rgba(217, 119, 6, 0.2)";
          ctx.lineWidth = 1.5;
        }

        ctx.stroke();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, isHolding, isProcessing]);

  // Bắt đầu chạm giữ thu âm
  const handleTouchStart = useCallback(
    async (e: React.TouchEvent | React.MouseEvent) => {
      e.stopPropagation();
      audioEngine.unlockAudioContext();
      audioEngine.playBambooClickSound();

      holdStartTimeRef.current = Date.now();
      setIsHolding(true);
      setSpeechTranscript("");
      audioChunksRef.current = [];

      audioEngine.pause();

      if (recognitionRef.current) {
        try {
          (recognitionRef.current as { start: () => void }).start();
        } catch {}
      }

      if (typeof navigator !== "undefined" && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });

          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.start(100);
        } catch (err) {
          console.warn("[MediaRecorder Micro Error]:", err);
        }
      }
    },
    []
  );

  // Buông tay kết thúc thu âm
  const handleTouchEnd = useCallback(
    async (e: React.TouchEvent | React.MouseEvent) => {
      e.stopPropagation();
      const holdDuration = Date.now() - holdStartTimeRef.current;
      setIsHolding(false);

      if (recognitionRef.current) {
        try {
          (recognitionRef.current as { stop: () => void }).stop();
        } catch {}
      }

      // Chạm quá ngắn < 250ms -> Mở bàn phím gõ chữ
      if (holdDuration < 250) {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
        }
        setIsTextModalOpen(true);
        return;
      }

      setIsProcessing(true);
      let recognizedQuery = speechTranscript.trim();

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        const recorder = mediaRecorderRef.current;
        recorder.stop();
        recorder.stream.getTracks().forEach((t) => t.stop());

        await new Promise((r) => setTimeout(r, 100));

        if (audioChunksRef.current.length > 0) {
          try {
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            const formData = new FormData();
            formData.append("file", audioBlob);
            formData.append("lang", locale);

            const sttRes = await fetch("/api/stt", {
              method: "POST",
              body: formData
            });

            if (sttRes.ok) {
              const sttData = await sttRes.json();
              if (sttData.text && sttData.text.trim()) {
                recognizedQuery = sttData.text.trim();
              }
            }
          } catch (sttErr) {
            console.warn("[Whisper STT Server Fallback to Web Speech]:", sttErr);
          }
        }
      }

      const query = recognizedQuery || dict.orb.defaultQuestion;

      try {
        const answer = await onAskQuestion(query);
        onAnswerReceived(answer);
      } catch (err) {
        console.error("[SonicOrb Ask Error]:", err);
      } finally {
        setIsProcessing(false);
      }
    },
    [speechTranscript, locale, dict.orb.defaultQuestion, onAskQuestion, onAnswerReceived]
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

  const sampleQuestions = dict.orb.sampleQuestions;

  return (
    <main className="h-[50vh] w-full flex flex-col items-center justify-center relative select-none p-4">
      {/* 1. KHỐI ĐĨA ÂM THANH DI TÍCH (HERITAGE SOUND CAPSULE - WARM LIGHT THEME) */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Lớp hào quang thở nhẹ nhàng (Organic Warm Breathing Glow) */}
        <div
          className={`absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full transition-all duration-700 pointer-events-none ${
            isHolding
              ? "bg-emerald-400/25 blur-3xl scale-110"
              : isPlaying
              ? "bg-amber-400/30 blur-3xl scale-105"
              : isProcessing
              ? "bg-amber-500/20 blur-2xl animate-pulse"
              : "bg-amber-300/20 blur-2xl"
          }`}
        />

        {/* NÚT CHÍNH TƯƠNG TÁC ÂM THANH THÂN THIỆN */}
        <button
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          className={`w-52 h-52 sm:w-60 sm:h-60 rounded-full relative cursor-pointer overflow-hidden transition-all duration-300 transform active:scale-95 shadow-2xl flex flex-col items-center justify-center border-2 ${
            isHolding
              ? "bg-gradient-to-b from-white via-emerald-50 to-emerald-100/60 border-emerald-500 shadow-emerald-700/20"
              : isPlaying
              ? "bg-gradient-to-b from-white via-amber-50 to-amber-100/60 border-amber-500 shadow-amber-700/20"
              : "bg-gradient-to-b from-white via-[#FAF6EE] to-[#EFE8DC] border-[#D5CEBF] hover:border-amber-500 shadow-[#00000015]"
          }`}
          aria-label="Chạm hoặc giữ để hỏi thuyết minh"
        >
          {/* Canvas sóng âm thanh êm dịu */}
          <canvas
            ref={canvasRef}
            width={240}
            height={240}
            className="absolute inset-0 w-full h-full pointer-events-none opacity-90"
          />

          {/* Biểu tượng trung tâm thân thiện (Icon Mic / Volume / Sparkles) */}
          <div className="z-10 flex flex-col items-center justify-center space-y-2 pointer-events-none">
            <div
              className={`p-4 rounded-full transition-all duration-300 shadow-sm ${
                isHolding
                  ? "bg-emerald-100 text-emerald-700 scale-110"
                  : isPlaying
                  ? "bg-amber-100 text-amber-700 animate-pulse"
                  : isProcessing
                  ? "bg-amber-100 text-amber-800 animate-pulse"
                  : "bg-white/90 text-amber-700 border border-stone-200"
              }`}
            >
              {isHolding ? (
                <Mic className="w-8 h-8 animate-bounce" />
              ) : isPlaying ? (
                <Volume2 className="w-8 h-8 animate-pulse" />
              ) : isProcessing ? (
                <Sparkles className="w-8 h-8 animate-spin" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </div>

            {/* Dòng chữ trạng thái rõ ràng, dễ đọc cho mọi lứa tuổi */}
            <div className="px-3.5 py-1 rounded-full bg-white/90 border border-stone-300 shadow-sm backdrop-blur-md">
              <span className="text-[11px] sm:text-xs font-bold tracking-wide text-stone-800 uppercase font-sans">
                {isHolding
                  ? locale === "vi"
                    ? "Đang lắng nghe..."
                    : "Listening..."
                  : isProcessing
                  ? locale === "vi"
                    ? "Đang suy nghĩ..."
                    : "Searching..."
                  : isPlaying
                  ? locale === "vi"
                    ? "Đang thuyết minh"
                    : "Narrating"
                  : locale === "vi"
                  ? "Chạm & Giữ để hỏi"
                  : "Hold to Speak"}
              </span>
            </div>
          </div>
        </button>

        {/* Nút mở bàn phím gõ chữ phụ bên cạnh */}
        <button
          onClick={() => setIsTextModalOpen(true)}
          className="mt-4 flex items-center space-x-1.5 px-4 py-2 rounded-full bg-white/90 border border-stone-300 text-stone-700 hover:text-amber-800 hover:border-amber-500 active:scale-95 transition-all text-xs font-semibold shadow-sm"
        >
          <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
          <span>{locale === "vi" ? "Gõ câu hỏi bằng bàn phím" : "Type question"}</span>
        </button>
      </div>

      {/* 2. HIỂN THỊ LỜI NÓI THỜI GIAN THỰC (KHI ĐANG THU ÂM) */}
      {speechTranscript && (
        <div className="absolute bottom-1 max-w-[90%] px-4 py-2 rounded-2xl bg-white border-2 border-amber-500 text-xs text-stone-900 font-semibold text-center shadow-xl backdrop-blur-md animate-in fade-in z-30">
          &ldquo;{speechTranscript}&rdquo;
        </div>
      )}

      {/* 3. MODAL GÕ CÂU HỎI THÂN THIỆN & CÂU HỎI GỢI Ý */}
      {isTextModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FAF7F2] border border-[#DDD7CC] rounded-3xl p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200 text-stone-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2 text-amber-800">
                <MessageSquare className="w-5 h-5 text-amber-700" />
                <h3 className="text-sm font-bold uppercase text-stone-900 font-sans">
                  {locale === "vi" ? "Hỏi Trợ Lý Hướng Dẫn Viên" : "Ask Audio Guide"}
                </h3>
              </div>
              <button
                onClick={() => setIsTextModalOpen(false)}
                className="text-stone-500 hover:text-stone-900 text-xs px-2.5 py-1.5 rounded-lg bg-stone-100 border border-stone-200"
              >
                {dict.common.close}
              </button>
            </div>

            {/* Input Gõ Câu Hỏi */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={typedQuery}
                onChange={(e) => setTypedQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendTypedQuery()}
                placeholder={locale === "vi" ? "Nhập câu hỏi về địa đạo..." : "Type your question..."}
                className="flex-1 px-4 py-3 bg-white border border-stone-300 rounded-2xl text-sm text-stone-900 focus:outline-none focus:border-amber-500 placeholder-stone-400 shadow-inner font-sans"
                autoFocus
              />
              <button
                onClick={() => handleSendTypedQuery()}
                className="p-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold active:scale-95 transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Câu Hỏi Gợi Ý Phổ Biến */}
            {sampleQuestions && sampleQuestions.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  {locale === "vi" ? "Câu hỏi thường gặp:" : "Frequently asked:"}
                </p>
                <div className="flex flex-col space-y-1.5">
                  {sampleQuestions.slice(0, 3).map((sq, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendTypedQuery(sq)}
                      className="text-left px-3.5 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-xs text-stone-800 hover:text-amber-900 border border-stone-200 transition-all font-sans shadow-sm"
                    >
                      {sq}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};
