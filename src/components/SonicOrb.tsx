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

// 3D Particle Interface
interface Particle3D {
  r: number;
  theta: number;
  phi: number;
  speedTheta: number;
  speedPhi: number;
  size: number;
  colorType: number;
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

  // Khởi tạo hệ hạt bụi 3D đa chiều sâu (Volumetric 3D Particle Cloud)
  const particlesRef = useRef<Particle3D[]>([]);
  useEffect(() => {
    const pts: Particle3D[] = [];
    const count = 28;
    for (let i = 0; i < count; i++) {
      pts.push({
        r: 0.25 + Math.random() * 0.55,
        theta: Math.random() * Math.PI * 2,
        phi: (Math.random() - 0.5) * Math.PI,
        speedTheta: (Math.random() - 0.5) * 0.02 + 0.01,
        speedPhi: (Math.random() - 0.5) * 0.015,
        size: 1.2 + Math.random() * 2.2,
        colorType: Math.random() > 0.4 ? 1 : 0
      });
    }
    particlesRef.current = pts;
  }, []);

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

  // 🌟 HIỆU ỨNG QUẢ CẦU 3D ĐA TẦNG CHIỀU SÂU QUANG HỌC (VOLUMETRIC 3D OPTICAL CORE)
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

      const speed = isProcessing ? 0.045 : isListening ? 0.035 : isPlaying ? 0.025 : 0.015;
      time += speed;

      // ─── TẦNG 1: LÒNG SÂU NỘI VI & TÁN SẮC BỀ MẶT (VOLUMETRIC AMBIENT BASE) ───
      const baseGrad = ctx.createRadialGradient(
        cx + Math.sin(time * 0.5) * (R * 0.15),
        cy + Math.cos(time * 0.5) * (R * 0.15),
        R * 0.05,
        cx,
        cy,
        R
      );

      if (isListening) {
        baseGrad.addColorStop(0, "rgba(52, 211, 153, 0.7)");
        baseGrad.addColorStop(0.35, "rgba(16, 185, 129, 0.45)");
        baseGrad.addColorStop(0.7, "rgba(6, 78, 59, 0.2)");
        baseGrad.addColorStop(1, "rgba(2, 44, 34, 0.05)");
      } else if (isProcessing) {
        baseGrad.addColorStop(0, "rgba(251, 191, 36, 0.85)");
        baseGrad.addColorStop(0.3, "rgba(217, 119, 6, 0.5)");
        baseGrad.addColorStop(0.7, "rgba(180, 83, 9, 0.25)");
        baseGrad.addColorStop(1, "rgba(120, 53, 15, 0.05)");
      } else if (isPlaying) {
        baseGrad.addColorStop(0, "rgba(252, 211, 77, 0.75)");
        baseGrad.addColorStop(0.35, "rgba(217, 119, 6, 0.4)");
        baseGrad.addColorStop(0.75, "rgba(146, 64, 14, 0.18)");
        baseGrad.addColorStop(1, "rgba(69, 26, 3, 0.03)");
      } else {
        baseGrad.addColorStop(0, "rgba(245, 158, 11, 0.45)");
        baseGrad.addColorStop(0.4, "rgba(217, 119, 6, 0.2)");
        baseGrad.addColorStop(0.8, "rgba(146, 64, 14, 0.06)");
        baseGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      }

      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // ─── TẦNG 2: CÁC VÒNG XOÁY NĂNG LƯỢNG 3D XOAY ĐA CHIỀU (3D ORBITAL RESONANCE RINGS) ───
      // Vẽ 3 vành elip 3D xoay quanh các trục Euler (X, Y, Z)
      const numRings = 3;
      for (let rIdx = 0; rIdx < numRings; rIdx++) {
        const ringAngle = time * (rIdx % 2 === 0 ? 1 : -1) * 0.8 + (rIdx * Math.PI) / 3;
        const ringTiltX = 0.65 + Math.sin(time * 0.4 + rIdx) * 0.25;
        const ringTiltY = 0.5 + Math.cos(time * 0.3 + rIdx) * 0.2;
        const ringRadius = R * (0.42 + rIdx * 0.18);
        const steps = 48;

        // Tách thành nửa sau (back z < 0) và nửa trước (front z > 0)
        for (let pass = 0; pass < 2; pass++) {
          ctx.beginPath();
          let hasPoints = false;

          for (let i = 0; i <= steps; i++) {
            const a = (i / steps) * Math.PI * 2;
            // Tọa độ 3D trước khi chiếu
            const x0 = Math.cos(a) * ringRadius;
            const y0 = Math.sin(a) * ringRadius;
            const z0 = Math.sin(a * 2 + time + rIdx) * (R * 0.2);

            // Xoay 3D Euler
            const x1 = x0 * Math.cos(ringAngle) - y0 * Math.sin(ringAngle);
            const y1 = (x0 * Math.sin(ringAngle) + y0 * Math.cos(ringAngle)) * ringTiltX;
            const z1 = z0 + y0 * ringTiltY;

            // Kiểm tra pass (0: nửa sau, 1: nửa trước)
            if ((pass === 0 && z1 <= 0) || (pass === 1 && z1 > 0)) {
              const px = cx + x1;
              const py = cy + y1;
              if (!hasPoints) {
                ctx.moveTo(px, py);
                hasPoints = true;
              } else {
                ctx.lineTo(px, py);
              }
            } else {
              hasPoints = false;
            }
          }

          if (hasPoints) {
            if (isListening) {
              ctx.strokeStyle = pass === 1 ? "rgba(5, 150, 105, 0.75)" : "rgba(6, 78, 59, 0.3)";
              ctx.lineWidth = pass === 1 ? 2.5 : 1.2;
            } else if (isProcessing) {
              ctx.strokeStyle = pass === 1 ? "rgba(251, 191, 36, 0.85)" : "rgba(180, 83, 9, 0.35)";
              ctx.lineWidth = pass === 1 ? 2.8 : 1.4;
            } else if (isPlaying) {
              ctx.strokeStyle = pass === 1 ? "rgba(217, 119, 6, 0.7)" : "rgba(146, 64, 14, 0.25)";
              ctx.lineWidth = pass === 1 ? 2.2 : 1.2;
            } else {
              ctx.strokeStyle = pass === 1 ? "rgba(217, 119, 6, 0.35)" : "rgba(180, 83, 9, 0.12)";
              ctx.lineWidth = pass === 1 ? 1.6 : 1.0;
            }
            ctx.stroke();
          }
        }
      }

      // ─── TẦNG 3: BỤI NĂNG LƯỢNG 3D ĐA TẦNG CHIỀU SÂU (VOLUMETRIC PARTICLE CLOUD) ───
      const pts = particlesRef.current;
      pts.forEach((p) => {
        // Cập nhật vị trí cầu 3D
        p.theta += p.speedTheta * (isProcessing ? 2.5 : 1);
        p.phi += p.speedPhi * (isProcessing ? 2 : 1);

        // Chuyển từ Spherical sang Cartesian 3D (X, Y, Z)
        const rad = p.r * R;
        const x3d = rad * Math.cos(p.phi) * Math.cos(p.theta);
        const y3d = rad * Math.cos(p.phi) * Math.sin(p.theta);
        const z3d = rad * Math.sin(p.phi);

        // Chiếu phối cảnh Perspective 3D
        const depthFactor = (z3d + R) / (2 * R); // 0 (tận đáy sau) -> 1 (ngay trước mắt)
        const px = cx + x3d;
        const py = cy + y3d * 0.85; // Bẹp nhẹ tạo góc nhìn 3D isometric
        const renderedSize = Math.max(0.6, p.size * (0.5 + depthFactor * 0.9));
        const alpha = Math.max(0.1, depthFactor * (isProcessing ? 0.95 : 0.7));

        if (px >= cx - R && px <= cx + R && py >= cy - R && py <= cy + R) {
          ctx.beginPath();
          ctx.arc(px, py, renderedSize, 0, Math.PI * 2);

          if (isListening) {
            ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`;
          } else if (isProcessing) {
            ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
          } else {
            ctx.fillStyle = p.colorType === 1 ? `rgba(251, 191, 36, ${alpha})` : `rgba(217, 119, 6, ${alpha})`;
          }

          ctx.fill();

          // Tia lóe sáng nhỏ cho các hạt bay ngay mặt trước (z3d > R * 0.3)
          if (z3d > R * 0.3 && renderedSize > 2.0) {
            ctx.beginPath();
            ctx.arc(px, py, renderedSize * 2.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.35})`;
            ctx.fill();
          }
        }
      });

      // ─── TẦNG 4: LÕI PHA LÊ PHÁT QUANG ĐẬM ĐẶC (DENSE RADIANT CRYSTAL CORE) ───
      const corePulse = Math.sin(time * 2) * (R * 0.04);
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.28 + corePulse);

      if (isListening) {
        coreGrad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
        coreGrad.addColorStop(0.3, "rgba(52, 211, 153, 0.65)");
        coreGrad.addColorStop(0.8, "rgba(16, 185, 129, 0.2)");
        coreGrad.addColorStop(1, "rgba(6, 78, 59, 0)");
      } else if (isProcessing) {
        coreGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        coreGrad.addColorStop(0.3, "rgba(251, 191, 36, 0.8)");
        coreGrad.addColorStop(0.8, "rgba(217, 119, 6, 0.3)");
        coreGrad.addColorStop(1, "rgba(180, 83, 9, 0)");
      } else if (isPlaying) {
        coreGrad.addColorStop(0, "rgba(255, 255, 255, 0.85)");
        coreGrad.addColorStop(0.3, "rgba(252, 211, 77, 0.6)");
        coreGrad.addColorStop(0.8, "rgba(217, 119, 6, 0.2)");
        coreGrad.addColorStop(1, "rgba(146, 64, 14, 0)");
      } else {
        coreGrad.addColorStop(0, "rgba(255, 255, 255, 0.7)");
        coreGrad.addColorStop(0.35, "rgba(245, 158, 11, 0.35)");
        coreGrad.addColorStop(0.85, "rgba(217, 119, 6, 0.08)");
        coreGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      }

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.28 + corePulse, 0, Math.PI * 2);
      ctx.fill();

      // ─── TẦNG 5: VÀNH TÁN SẮC FRESNEL & ĐỘ BÓNG KÍNH ĐÔI (DUAL CURVED GLASS GLARE) ───
      // 1. Phản quang chính góc trên bên trái
      const mainGlare = ctx.createRadialGradient(
        cx - R * 0.38,
        cy - R * 0.42,
        R * 0.02,
        cx - R * 0.38,
        cy - R * 0.42,
        R * 0.65
      );
      mainGlare.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      mainGlare.addColorStop(0.2, "rgba(255, 255, 255, 0.5)");
      mainGlare.addColorStop(0.6, "rgba(255, 255, 255, 0.08)");
      mainGlare.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = mainGlare;
      ctx.beginPath();
      ctx.arc(cx - R * 0.38, cy - R * 0.42, R * 0.55, 0, Math.PI * 2);
      ctx.fill();

      // 2. Phản quang đáy mềm mại (Subsurface Floor Bounce)
      const floorBounce = ctx.createRadialGradient(
        cx + R * 0.3,
        cy + R * 0.45,
        R * 0.02,
        cx + R * 0.3,
        cy + R * 0.45,
        R * 0.4
      );
      floorBounce.addColorStop(0, "rgba(255, 255, 255, 0.35)");
      floorBounce.addColorStop(0.5, "rgba(255, 255, 255, 0.08)");
      floorBounce.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = floorBounce;
      ctx.beginPath();
      ctx.arc(cx + R * 0.3, cy + R * 0.45, R * 0.35, 0, Math.PI * 2);
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
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
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
      {/* 1. THẤU KÍNH ÂM THANH DI TÍCH 3D ĐA TẦNG CHIỀU SÂU (VOLUMETRIC 3D OPTICAL CORE) */}
      <div className="relative flex flex-col items-center justify-center my-auto">
        {/* Hào quang nền khuếch tán hữu cơ */}
        <div
          className={`absolute w-60 h-60 sm:w-68 sm:h-68 rounded-full transition-all duration-700 pointer-events-none ${
            isListening
              ? "bg-emerald-500/35 blur-3xl scale-125"
              : isProcessing
              ? "bg-amber-500/40 blur-3xl animate-pulse scale-115"
              : isPlaying
              ? "bg-amber-500/35 blur-3xl scale-115"
              : "bg-amber-400/25 blur-2xl"
          }`}
        />

        {/* THẤU KÍNH NGUYÊN BẢN (PURE TACTILE LENS WITH SUBTERRANEAN 3D DEPTH) */}
        <button
          onClick={handleToggleListening}
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 0.15s ease-out"
          }}
          className={`w-52 h-52 sm:w-60 sm:h-60 rounded-full relative cursor-pointer overflow-hidden transition-all duration-500 transform active:scale-95 shadow-2xl flex items-center justify-center border-4 ${
            isListening
              ? "bg-gradient-to-br from-[#FAFFF8] via-[#E6F8ED] to-[#D1F2DE] border-emerald-500 shadow-emerald-700/40"
              : isProcessing
              ? "bg-gradient-to-br from-[#FFFDF7] via-[#FEF3D6] to-[#FDE68A] border-amber-500 shadow-amber-700/45 animate-pulse"
              : isPlaying
              ? "bg-gradient-to-br from-[#FFFDF9] via-[#FEF3D6] to-[#FDE8B3] border-amber-500 shadow-amber-700/35"
              : "bg-gradient-to-br from-[#FFFDF9] via-[#FAF4E8] to-[#EFE4D0] border-[#CFC5B3] hover:border-amber-500 shadow-[#00000025]"
          }`}
          aria-label="Chạm vào thấu kính để nói chuyện với hướng dẫn viên"
        >
          {/* Canvas Sóng Âm & Lõi Hạt 3D Đa Chiều Sâu */}
          <canvas
            ref={canvasRef}
            width={260}
            height={260}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {/* Vành Rim 3D mạ ánh sáng trong suốt */}
          <div className="absolute inset-0 rounded-full border-2 border-white/80 pointer-events-none shadow-inner" />
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
              ? "Chạm vào quả cầu để hỏi"
              : "Tap sphere to ask"}
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
