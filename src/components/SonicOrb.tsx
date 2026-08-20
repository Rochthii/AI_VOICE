"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Volume2, Sparkles, Loader2 } from "lucide-react";
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
  const [speechTranscript, setSpeechTranscript] = useState("");
  const holdStartTimeRef = useRef<number>(0);
  const recognitionRef = useRef<unknown>(null);

  // Khởi tạo Web Speech API Recognition nếu được hỗ trợ
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

  const handleTouchStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      holdStartTimeRef.current = Date.now();
      setIsHolding(true);
      setSpeechTranscript("");

      audioEngine.triggerHapticFeedback();
      audioEngine.playBambooClickSound();

      // Tạm dừng âm thanh nền khi bắt đầu nói
      audioEngine.pause();

      // Bắt đầu nhận diện giọng nói
      if (recognitionRef.current) {
        try {
          (recognitionRef.current as { start: () => void }).start();
        } catch {
          // Bỏ qua nếu đã start
        }
      }
    },
    []
  );

  const handleTouchEnd = useCallback(
    async (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      const holdDuration = Date.now() - holdStartTimeRef.current;
      setIsHolding(false);

      // Ghost Touch Filter: Nếu chạm quá ngắn (< 300ms) thì bỏ qua
      if (holdDuration < 300) {
        if (recognitionRef.current) {
          try {
            (recognitionRef.current as { stop: () => void }).stop();
          } catch {
            // No-op
          }
        }
        return;
      }

      if (recognitionRef.current) {
        try {
          (recognitionRef.current as { stop: () => void }).stop();
        } catch {
          // No-op
        }
      }

      const query = speechTranscript.trim() || (locale === "vi" ? "Điểm di tích này có ý nghĩa gì?" : "What is the history of this station?");

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

  return (
    <main className="h-[50vh] w-full flex flex-col items-center justify-center relative select-none">
      {/* Vòng sáng Pulse Sóng Âm khi đang phát hoặc đang giữ */}
      <div
        className={`absolute w-[280px] h-[280px] rounded-full border border-tunnel-amber/20 transition-all duration-700 pointer-events-none ${
          isHolding
            ? "scale-125 border-tunnel-jade/40 animate-ping"
            : isPlaying
            ? "scale-110 animate-pulse"
            : "scale-100 opacity-30"
        }`}
      />

      <div
        className={`absolute w-[245px] h-[245px] rounded-full bg-tunnel-amber/5 transition-all duration-500 pointer-events-none ${
          isHolding ? "bg-tunnel-jade/10 scale-110" : ""
        }`}
      />

      {/* QUẢ CẦU ÂM BẢN 220PX (SONIC MONOLITH ORB) */}
      <button
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        className={`w-[220px] h-[220px] rounded-full flex flex-col items-center justify-center relative z-20 cursor-pointer shadow-2xl transition-all duration-300 ${
          isHolding
            ? "scale-95 bg-gradient-to-br from-tunnel-jade via-emerald-800 to-stone-950 ring-4 ring-tunnel-jade/50 shadow-tunnel-jade/40"
            : isProcessing
            ? "bg-gradient-to-br from-stone-900 via-stone-950 to-black ring-2 ring-tunnel-amber/30 animate-pulse"
            : "bg-gradient-to-br from-stone-900 via-stone-950 to-black border-2 border-stone-800 hover:border-tunnel-amber/50 active:scale-95 shadow-black"
        }`}
        aria-label="Chạm giữ để hỏi AI"
      >
        {/* Icon trung tâm */}
        {isProcessing ? (
          <Loader2 className="w-16 h-16 text-tunnel-amber animate-spin" />
        ) : isHolding ? (
          <Mic className="w-16 h-16 text-tunnel-chalk animate-bounce" />
        ) : isPlaying ? (
          <Volume2 className="w-16 h-16 text-tunnel-amber" />
        ) : (
          <Sparkles className="w-14 h-14 text-tunnel-amber/80" />
        )}

        {/* Nhãn hướng dẫn dưới icon */}
        <span className="mt-2 text-xs font-medium tracking-wide text-tunnel-chalk/90">
          {isProcessing
            ? (locale === "vi" ? "Đang tra sử liệu..." : "Searching archives...")
            : isHolding
            ? (locale === "vi" ? "Đang lắng nghe..." : "Listening...")
            : (locale === "vi" ? "CHẠM GIỮ ĐỂ HỎI" : "HOLD TO TALK")}
        </span>
      </button>

      {/* Phụ đề thời gian thực khi đang thu âm */}
      {speechTranscript && (
        <div className="absolute bottom-2 max-w-[85%] px-3 py-1.5 rounded-lg bg-stone-900/90 border border-stone-700 text-xs text-tunnel-amber text-center truncate">
          &ldquo;{speechTranscript}&rdquo;
        </div>
      )}
    </main>
  );
};
