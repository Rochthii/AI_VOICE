"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, Send, Sparkles, ChevronRight } from "lucide-react";
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
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

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

  // 🌟 HIỆU ỨNG 3D THẤU KÍNH ÂM THANH XÚC GIÁC (TACTILE 3D ACOUSTIC LENS)
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
      const R = canvas.width * 0.44;

      time += isProcessing ? 0.05 : isListening ? 0.045 : isPlaying ? 0.035 : 0.018;

      // 1. Chiều sâu ánh sáng nội vi hữu cơ
      const innerGradient = ctx.createRadialGradient(
        cx - R * 0.2,
        cy - R * 0.25,
        R * 0.1,
        cx,
        cy,
        R
      );

      if (isListening) {
        innerGradient.addColorStop(0, "rgba(52, 211, 153, 0.6)");
        innerGradient.addColorStop(0.5, "rgba(16, 185, 129, 0.35)");
        innerGradient.addColorStop(1, "rgba(6, 78, 59, 0.08)");
      } else if (isProcessing) {
        innerGradient.addColorStop(0, "rgba(251, 191, 36, 0.7)");
        innerGradient.addColorStop(0.5, "rgba(217, 119, 6, 0.4)");
        innerGradient.addColorStop(1, "rgba(180, 83, 9, 0.08)");
      } else if (isPlaying) {
        innerGradient.addColorStop(0, "rgba(252, 211, 77, 0.6)");
        innerGradient.addColorStop(0.5, "rgba(217, 119, 6, 0.3)");
        innerGradient.addColorStop(1, "rgba(146, 64, 14, 0.08)");
      } else {
        innerGradient.addColorStop(0, "rgba(245, 158, 11, 0.35)");
        innerGradient.addColorStop(0.6, "rgba(217, 119, 6, 0.15)");
        innerGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      }

      ctx.fillStyle = innerGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // 2. Sóng Âm & Dòng Năng Lượng Hữu Cơ 3D
      const numWaves = isProcessing ? 4 : isListening ? 3 : isPlaying ? 3 : 2;

      for (let w = 0; w < numWaves; w++) {
        ctx.beginPath();
        const baseWaveRadius = R * (0.35 + w * 0.18);
        const points = 60;

        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const harmonic =
            Math.sin(angle * 3 + time * 1.5 + w * 1.2) * (isProcessing ? 8 : isListening ? 6 : isPlaying ? 5 : 2.5) +
            Math.cos(angle * 2 - time * 1.2) * (isProcessing ? 5 : isListening ? 4 : isPlaying ? 3.5 : 1.5);

          const r = baseWaveRadius + harmonic;
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
          ctx.strokeStyle = `rgba(5, 150, 105, ${0.65 - w * 0.15})`;
          ctx.lineWidth = 2.4 - w * 0.4;
        } else if (isProcessing) {
          ctx.strokeStyle = `rgba(217, 119, 6, ${0.7 - w * 0.15})`;
          ctx.lineWidth = 2.4 - w * 0.4;
        } else if (isPlaying) {
          ctx.strokeStyle = `rgba(217, 119, 6, ${0.6 - w * 0.15})`;
          ctx.lineWidth = 2.2 - w * 0.4;
        } else {
          ctx.strokeStyle = `rgba(217, 119, 6, ${0.3 - w * 0.1})`;
          ctx.lineWidth = 1.6;
        }

        ctx.stroke();
      }

      // 3. Hạt Bụi Năng Lượng khi Xử Lý
      if (isProcessing) {
        for (let p = 0; p < 6; p++) {
          const pAngle = time * 2 + (p * Math.PI) / 3;
          const pDist = R * 0.5 + Math.sin(time * 3 + p) * (R * 0.15);
          const px = cx + Math.cos(pAngle) * pDist;
          const py = cy + Math.sin(pAngle) * pDist;

          ctx.fillStyle = "rgba(251, 191, 36, 0.9)";
          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Vệt Phản Quang Vòm Thủy Tinh (Curved Glass Reflection)
      const glare = ctx.createRadialGradient(
        cx - R * 0.35,
        cy - R * 0.4,
        R * 0.05,
        cx - R * 0.35,
        cy - R * 0.4,
        R * 0.65
      );
      glare.addColorStop(0, "rgba(255, 255, 255, 0.85)");
      glare.addColorStop(0.35, "rgba(255, 255, 255, 0.2)");
      glare.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = glare;
      ctx.beginPath();
      ctx.arc(cx - R * 0.35, cy - R * 0.4, R * 0.5, 0, Math.PI * 2);
      ctx.fill();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, isListening, isProcessing]);

  // Parallax Tilt 3D
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    setTilt({ x: y, y: x });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Chạm vào Thấu Kính để Bật/Tắt thu âm
  const handleToggleListening = useCallback(async () => {
    if (isProcessing) return;

    audioEngine.unlockAudioContext();
    audioEngine.playBambooClickSound();

    if (isListening) {
      await finishAndSubmitRecording();
      return;
    }

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
    <main
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full flex-1 flex flex-col items-center justify-between p-4 py-2 select-none overflow-hidden"
    >
      {/* 1. THẤU KÍNH ÂM THANH DI TÍCH 3D (TACTILE 3D ACOUSTIC SOUND LENS) */}
      <div className="relative flex flex-col items-center justify-center my-auto">
        {/* Hào quang nền khuếch tán hữu cơ */}
        <div
          className={`absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full transition-all duration-700 pointer-events-none ${
            isListening
              ? "bg-emerald-500/30 blur-3xl scale-125"
              : isProcessing
              ? "bg-amber-500/35 blur-2xl animate-pulse scale-110"
              : isPlaying
              ? "bg-amber-500/30 blur-3xl scale-115"
              : "bg-amber-400/20 blur-2xl"
          }`}
        />

        {/* THẤU KÍNH NGUYÊN BẢN (PURE TACTILE LENS) */}
        <button
          onClick={handleToggleListening}
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 0.15s ease-out"
          }}
          className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full relative cursor-pointer overflow-hidden transition-all duration-500 transform active:scale-95 shadow-2xl flex items-center justify-center border-4 ${
            isListening
              ? "bg-gradient-to-br from-white via-emerald-50 to-emerald-100/80 border-emerald-500 shadow-emerald-700/35"
              : isProcessing
              ? "bg-gradient-to-br from-white via-amber-50 to-amber-100/80 border-amber-500 shadow-amber-700/40 animate-pulse"
              : isPlaying
              ? "bg-gradient-to-br from-white via-amber-50 to-amber-100/70 border-amber-500 shadow-amber-700/30"
              : "bg-gradient-to-br from-white via-[#FBF8F2] to-[#EFE8DC] border-[#D0C7B7] hover:border-amber-500 shadow-[#00000020]"
          }`}
          aria-label="Chạm vào thấu kính để nói chuyện với hướng dẫn viên"
        >
          {/* Canvas Sóng Âm 3D */}
          <canvas
            ref={canvasRef}
            width={240}
            height={240}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {/* Vành Rim 3D mạ ánh sáng trong suốt */}
          <div className="absolute inset-0 rounded-full border-2 border-white/70 pointer-events-none shadow-inner" />
        </button>

        {/* Chú thích trạng thái tinh tế dưới thấu kính */}
        <div className="mt-3 text-center">
          <p className="text-xs font-bold text-stone-700 tracking-wide font-sans">
            {isListening
              ? locale === "vi"
                ? "Đang lắng nghe... (Tự gửi sau 3s)"
                : "Listening... (Auto-send after 3s)"
              : isProcessing
              ? locale === "vi"
                ? "Đang tra cứu sử liệu..."
                : "Searching archives..."
              : isPlaying
              ? locale === "vi"
                ? "Đang thuyết minh âm thanh"
                : "Playing narration"
              : locale === "vi"
              ? "Chạm vào thấu kính để hỏi"
              : "Tap lens to ask"}
          </p>
        </div>
      </div>

      {/* 2. DÒNG LỜI NÓI THỜI GIAN THỰC KHI ĐANG NÓI */}
      {speechTranscript && (
        <div className="max-w-[92%] px-4 py-2 my-1 rounded-2xl bg-white border-2 border-emerald-500 text-xs text-stone-900 font-semibold text-center shadow-xl backdrop-blur-md animate-in fade-in z-30 font-sans">
          &ldquo;{speechTranscript}&rdquo;
        </div>
      )}

      {/* 3. BẢNG THẺ GỢI Ý SỬ LIỆU TINH HOA (CURATED DISCOVERY CARDS PANEL) */}
      {followUpSuggestions && followUpSuggestions.length > 0 && !isListening && (
        <div className="w-full max-w-sm px-2 my-1 space-y-1.5 animate-cardSlideUp">
          <div className="flex items-center justify-center space-x-1.5 text-amber-900 font-extrabold text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>{locale === "vi" ? "Gợi ý khám phá tiếp theo:" : "Explore further:"}</span>
          </div>

          <div className="flex flex-col space-y-1.5">
            {followUpSuggestions.slice(0, 2).map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSendTypedQuery(sug)}
                className="w-full p-2.5 px-3 rounded-2xl bg-white hover:bg-amber-50/90 border border-[#E0D8C8] hover:border-amber-500 text-left text-xs font-semibold text-stone-900 active:scale-[0.98] transition-all shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex items-center justify-between group font-sans"
              >
                <span className="line-clamp-1 group-hover:text-amber-950">{sug}</span>
                <ChevronRight className="w-4 h-4 text-amber-700 ml-2 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. NÚT GÕ BÀN PHÍM */}
      <button
        onClick={() => setIsTextModalOpen(true)}
        className="my-1 flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-white border border-[#DDD4C2] text-stone-600 hover:text-amber-900 hover:border-amber-500 active:scale-95 transition-all text-xs font-semibold shadow-sm font-sans"
      >
        <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
        <span>{locale === "vi" ? "Gõ câu hỏi bằng bàn phím" : "Type question"}</span>
      </button>

      {/* 5. MODAL GÕ CÂU HỎI */}
      {isTextModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FAF7F2] border border-[#DDD7CC] rounded-3xl p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200 text-stone-900">
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
