"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Volume2, Sparkles, Loader2, MessageSquare, Send } from "lucide-react";
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

      if (recognitionRef.current) {
        try {
          (recognitionRef.current as { stop: () => void }).stop();
        } catch {
          // No-op
        }
      }

      // Ghost Touch Filter: Nếu chạm quá ngắn (< 250ms) -> Mở bảng nhập câu hỏi nhanh
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
          "44.357 liệt sĩ có thật không?"
        ]
      : [
          "How did Hoang Cam stove hide smoke?",
          "Who was Dr. Vo Hoang Le?",
          "Were civilians forced to dig?",
          "Is the 44,357 martyr count verified?"
        ];

  return (
    <main className="h-[50vh] w-full flex flex-col items-center justify-center relative select-none">
      {/* Vòng Sáng Âm Bản Pulsing Waves */}
      <div
        className={`absolute w-[270px] h-[270px] rounded-full border border-tunnel-amber/20 transition-all duration-700 pointer-events-none ${
          isHolding
            ? "scale-125 border-tunnel-jade/50 animate-ping"
            : isPlaying
            ? "scale-110 animate-pulse border-tunnel-amber/40"
            : "scale-100 opacity-20"
        }`}
      />

      <div
        className={`absolute w-[235px] h-[235px] rounded-full bg-tunnel-amber/5 transition-all duration-500 pointer-events-none ${
          isHolding ? "bg-tunnel-jade/15 scale-110" : ""
        }`}
      />

      {/* QUẢ CẦU ÂM BẢN 220PX (SONIC MONOLITH ORB) */}
      <button
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        className={`w-[210px] h-[210px] sm:w-[220px] sm:h-[220px] rounded-full flex flex-col items-center justify-center relative z-20 cursor-pointer shadow-2xl transition-all duration-300 ${
          isHolding
            ? "scale-95 bg-gradient-to-br from-tunnel-jade via-emerald-800 to-stone-950 ring-4 ring-tunnel-jade/50 shadow-tunnel-jade/50"
            : isProcessing
            ? "bg-gradient-to-br from-stone-900 via-stone-950 to-black ring-2 ring-tunnel-amber/40 animate-pulse"
            : "bg-gradient-to-br from-stone-900 via-stone-950 to-black border-2 border-stone-800 hover:border-tunnel-amber/50 active:scale-95 shadow-black"
        }`}
        aria-label="Chạm giữ để hỏi AI"
      >
        {/* Dynamic Wave Equalizer khi đang phát audio */}
        {isPlaying && !isHolding && !isProcessing && (
          <div className="flex items-end space-x-1 mb-2 h-6">
            <span className="w-1 bg-tunnel-amber rounded-full animate-[bounce_1s_infinite_100ms] h-3" />
            <span className="w-1 bg-tunnel-amber rounded-full animate-[bounce_1s_infinite_300ms] h-6" />
            <span className="w-1 bg-tunnel-amber rounded-full animate-[bounce_1s_infinite_200ms] h-4" />
            <span className="w-1 bg-tunnel-amber rounded-full animate-[bounce_1s_infinite_400ms] h-5" />
            <span className="w-1 bg-tunnel-amber rounded-full animate-[bounce_1s_infinite_150ms] h-2" />
          </div>
        )}

        {/* Icon trung tâm */}
        {isProcessing ? (
          <Loader2 className="w-14 h-14 text-tunnel-amber animate-spin" />
        ) : isHolding ? (
          <Mic className="w-14 h-14 text-tunnel-chalk animate-bounce" />
        ) : isPlaying ? (
          <Volume2 className="w-12 h-12 text-tunnel-amber" />
        ) : (
          <Sparkles className="w-12 h-12 text-tunnel-amber/80" />
        )}

        {/* Nhãn hướng dẫn dưới icon */}
        <span className="mt-2 text-[11px] sm:text-xs font-semibold tracking-wider text-tunnel-chalk/90 uppercase">
          {isProcessing
            ? locale === "vi"
              ? "Tra sử liệu..."
              : "Searching..."
            : isHolding
            ? locale === "vi"
              ? "Đang lắng nghe..."
              : "Listening..."
            : locale === "vi"
            ? "CHẠM ĐỂ HỎI AI"
            : "TAP TO TALK"}
        </span>
      </button>

      {/* Phụ đề khi đang thu âm */}
      {speechTranscript && (
        <div className="absolute bottom-2 max-w-[85%] px-3 py-1.5 rounded-lg bg-stone-900/95 border border-tunnel-amber/50 text-xs text-tunnel-amber text-center truncate shadow-lg">
          &ldquo;{speechTranscript}&rdquo;
        </div>
      )}

      {/* MODAL HỎI ĐÁP NHANH (CHO CẢ NHẬP TEXT VÀ TEST MẪU) */}
      {isTextModalOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-tunnel-amber">
                <MessageSquare className="w-5 h-5" />
                <h3 className="text-sm font-bold tracking-wide uppercase">
                  {locale === "vi" ? "Hỏi Đáp Thuyết Minh Viên Chi" : "Ask Historical Guide Chi"}
                </h3>
              </div>
              <button
                onClick={() => setIsTextModalOpen(false)}
                className="text-stone-400 hover:text-white text-xs px-2 py-1 rounded bg-stone-900"
              >
                Đóng
              </button>
            </div>

            {/* Input gõ câu hỏi */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={typedQuery}
                onChange={(e) => setTypedQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendTypedQuery()}
                placeholder={
                  locale === "vi"
                    ? "Nhập câu hỏi lịch sử hoặc câu hỏi thử nghiệm..."
                    : "Type a historical question..."
                }
                className="flex-1 px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-sm text-tunnel-chalk focus:outline-none focus:border-tunnel-amber placeholder-stone-500"
                autoFocus
              />
              <button
                onClick={() => handleSendTypedQuery()}
                className="p-2.5 rounded-xl bg-tunnel-amber text-stone-950 font-bold hover:bg-amber-400 active:scale-95 transition-all"
                aria-label="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Gợi ý câu hỏi nhanh (Gồm cả câu bẫy kiểm tra Guardrail) */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-medium text-stone-400">
                {locale === "vi" ? "Gợi ý câu hỏi thử nghiệm nhanh:" : "Quick test prompts:"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sampleQuestions.map((sq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendTypedQuery(sq)}
                    className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-stone-900/90 border border-stone-800 text-stone-300 hover:border-tunnel-amber/50 hover:text-tunnel-amber active:scale-95 transition-all"
                  >
                    {sq}
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
