"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MessageSquare, Send, Sparkles, Volume2 } from "lucide-react";
import { audioEngine } from "@/lib/audio-engine";
import { Locale, getDictionary, LOCALE_MAP } from "@/i18n";

interface SonicOrbProps {
  stationId: string;
  locale: Locale;
  isPlaying: boolean;
  followUpSuggestions?: string[];
  onAskQuestion: (query: string) => Promise<string>;
  onAnswerReceived: (answer: string) => void;
}

export const SonicOrb: React.FC<SonicOrbProps> = ({
  stationId,
  locale,
  isPlaying,
  followUpSuggestions = [],
  onAskQuestion,
  onAnswerReceived
}) => {
  const dict = getDictionary(locale);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState("");
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [typedQuery, setTypedQuery] = useState("");

  const isListeningRef = useRef(false);
  const latestTranscriptRef = useRef("");
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialSilenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const recognitionRef = useRef<unknown>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Đồng bộ ref
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Kết thúc và gửi câu hỏi lên AI
  const finishAndSubmitRecording = useCallback(
    async (finalText?: string) => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (initialSilenceTimerRef.current) {
        clearTimeout(initialSilenceTimerRef.current);
        initialSilenceTimerRef.current = null;
      }

      setIsListening(false);
      isListeningRef.current = false;

      if (recognitionRef.current) {
        try {
          (recognitionRef.current as { stop: () => void }).stop();
        } catch {}
      }

      let recognizedQuery = (finalText || latestTranscriptRef.current || speechTranscript).trim();

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        const recorder = mediaRecorderRef.current;
        recorder.stop();
        recorder.stream.getTracks().forEach((t) => t.stop());

        await new Promise((r) => setTimeout(r, 100));

        if (audioChunksRef.current.length > 0 && !recognizedQuery) {
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
            console.warn("[Whisper STT Fallback]:", sttErr);
          }
        }
      }

      if (!recognizedQuery) {
        setSpeechTranscript("");
        return;
      }

      setIsProcessing(true);
      audioEngine.pause();

      try {
        const answer = await onAskQuestion(recognizedQuery);
        onAnswerReceived(answer);
      } catch (err) {
        console.error("[SonicOrb Ask Error]:", err);
      } finally {
        setIsProcessing(false);
        setSpeechTranscript("");
        latestTranscriptRef.current = "";
      }
    },
    [speechTranscript, locale, onAskQuestion, onAnswerReceived]
  );

  // Khởi tạo Web Speech API với bộ nhận diện im lặng 3s
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new (SpeechRecognition as new () => any)();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = LOCALE_MAP[locale]?.speechLang || "vi-VN";

        recognition.onresult = (event: any) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            interim += event.results[i][0].transcript;
          }
          if (interim && interim.trim()) {
            const currentText = interim.trim();
            setSpeechTranscript(currentText);
            latestTranscriptRef.current = currentText;

            // Xóa bộ đếm im lặng cũ khi người dùng còn đang nói
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
            }
            if (initialSilenceTimerRef.current) {
              clearTimeout(initialSilenceTimerRef.current);
            }

            // Tự động gửi sau 3.0s im lặng nếu người dùng dừng nói
            silenceTimerRef.current = setTimeout(() => {
              if (isListeningRef.current && latestTranscriptRef.current.trim().length > 0) {
                finishAndSubmitRecording(latestTranscriptRef.current.trim());
              }
            }, 3000);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("[WebSpeech Warning]:", event.error);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [locale, finishAndSubmitRecording]);

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

      const waveCount = isPlaying ? 3 : isListening ? 4 : isProcessing ? 2 : 1;
      const speed = isPlaying ? 0.04 : isListening ? 0.06 : isProcessing ? 0.03 : 0.015;
      time += speed;

      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        const points = 40;
        const currentRadius = baseRadius + w * (isListening ? 8 : 6);

        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const noise = Math.sin(angle * 3 + time + w) * (isListening ? 10 : isPlaying ? 8 : 4);
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

        if (isListening) {
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
  }, [isPlaying, isListening, isProcessing]);

  // Chạm vào nút Micro để Bật/Tắt thu âm thông minh
  const handleToggleListening = useCallback(async () => {
    if (isProcessing) return;

    audioEngine.unlockAudioContext();
    audioEngine.playBambooClickSound();

    if (isListening) {
      // Nếu đang nói mà bấm thêm lần nữa -> Gửi ngay lập tức
      await finishAndSubmitRecording();
      return;
    }

    // Bắt đầu lắng nghe
    setIsListening(true);
    isListeningRef.current = true;
    setSpeechTranscript("");
    latestTranscriptRef.current = "";
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
        console.warn("[MediaRecorder Error]:", err);
      }
    }

    // Nếu người dùng bật mic nhưng không nói gì sau 6s -> Tự động dừng
    initialSilenceTimerRef.current = setTimeout(() => {
      if (isListeningRef.current && !latestTranscriptRef.current.trim()) {
        setIsListening(false);
        isListeningRef.current = false;
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
        }
        if (recognitionRef.current) {
          try {
            (recognitionRef.current as { stop: () => void }).stop();
          } catch {}
        }
      }
    }, 6000);
  }, [isListening, isProcessing, finishAndSubmitRecording]);

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
      {/* 1. KHỐI ĐĨA ÂM THANH DI TÍCH (HERITAGE SOUND CAPSULE) */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Lớp hào quang thở nhẹ nhàng (Organic Warm Breathing Glow) */}
        <div
          className={`absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full transition-all duration-700 pointer-events-none ${
            isListening
              ? "bg-emerald-400/30 blur-3xl scale-110"
              : isPlaying
              ? "bg-amber-400/30 blur-3xl scale-105"
              : isProcessing
              ? "bg-amber-500/20 blur-2xl animate-pulse"
              : "bg-amber-300/20 blur-2xl"
          }`}
        />

        {/* NÚT CHÍNH TƯƠNG TÁC ÂM THANH THÂN THIỆN (CHẠM ĐỂ NÓI -> TỰ ĐỘNG GỬI SAU 3S IM LẶNG) */}
        <button
          onClick={handleToggleListening}
          className={`w-52 h-52 sm:w-60 sm:h-60 rounded-full relative cursor-pointer overflow-hidden transition-all duration-300 transform active:scale-95 shadow-2xl flex flex-col items-center justify-center border-2 ${
            isListening
              ? "bg-gradient-to-b from-white via-emerald-50 to-emerald-100/70 border-emerald-500 shadow-emerald-700/25"
              : isPlaying
              ? "bg-gradient-to-b from-white via-amber-50 to-amber-100/60 border-amber-500 shadow-amber-700/20"
              : "bg-gradient-to-b from-white via-[#FAF6EE] to-[#EFE8DC] border-[#D5CEBF] hover:border-amber-500 shadow-[#00000015]"
          }`}
          aria-label="Chạm để nói chuyện với hướng dẫn viên"
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
                isListening
                  ? "bg-emerald-100 text-emerald-700 scale-110"
                  : isPlaying
                  ? "bg-amber-100 text-amber-700 animate-pulse"
                  : isProcessing
                  ? "bg-amber-100 text-amber-800 animate-pulse"
                  : "bg-white/90 text-amber-700 border border-stone-200"
              }`}
            >
              {isListening ? (
                <Mic className="w-8 h-8 animate-bounce text-emerald-600" />
              ) : isPlaying ? (
                <Volume2 className="w-8 h-8 animate-pulse" />
              ) : isProcessing ? (
                <Sparkles className="w-8 h-8 animate-spin" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </div>

            {/* Dòng chữ trạng thái rõ ràng, dễ hiểu */}
            <div className="px-3.5 py-1 rounded-full bg-white/95 border border-stone-300 shadow-sm backdrop-blur-md">
              <span className="text-[11px] sm:text-xs font-bold tracking-wide text-stone-800 uppercase font-sans">
                {isListening
                  ? locale === "vi"
                    ? "Đang nghe... (Tự gửi sau 3s)"
                    : "Listening... (Auto-send)"
                  : isProcessing
                  ? locale === "vi"
                    ? "Đang tra sử liệu..."
                    : "Searching..."
                  : isPlaying
                  ? locale === "vi"
                    ? "Đang thuyết minh"
                    : "Narrating"
                  : locale === "vi"
                  ? "Chạm để nói"
                  : "Tap to Speak"}
              </span>
            </div>
          </div>
        </button>

        {/* CÁC VIÊN CHIP GỢI Ý CÂU HỎI ĐÀO SÂU (FOLLOW-UP DISCOVERY CHIPS) */}
        {followUpSuggestions && followUpSuggestions.length > 0 && !isListening && (
          <div className="mt-2.5 flex flex-col items-center gap-1.5 max-w-xs px-2 animate-fadeIn">
            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider text-center">
              💡 {locale === "vi" ? "Gợi ý hỏi tiếp:" : "Suggested questions:"}
            </span>
            <div className="flex flex-wrap justify-center gap-1.5">
              {followUpSuggestions.slice(0, 2).map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendTypedQuery(sug)}
                  className="px-3 py-1 rounded-full bg-white/95 border border-amber-300 text-stone-800 hover:bg-amber-100 hover:border-amber-500 hover:text-amber-950 active:scale-95 transition-all text-[11px] font-medium shadow-sm leading-tight text-center"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nút mở bàn phím gõ chữ phụ bên cạnh */}
        <button
          onClick={() => setIsTextModalOpen(true)}
          className="mt-3 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-stone-300 text-stone-700 hover:text-amber-800 hover:border-amber-500 active:scale-95 transition-all text-xs font-semibold shadow-sm"
        >
          <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
          <span>{locale === "vi" ? "Gõ câu hỏi bằng bàn phím" : "Type question"}</span>
        </button>
      </div>

      {/* 2. HIỂN THỊ LỜI NÓI THỜI GIAN THỰC (KHI ĐANG THU ÂM) */}
      {speechTranscript && (
        <div className="absolute bottom-1 max-w-[90%] px-4 py-2 rounded-2xl bg-white border-2 border-emerald-500 text-xs text-stone-900 font-semibold text-center shadow-xl backdrop-blur-md animate-in fade-in z-30">
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
