"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import stationsData from "@/data/stations.json";
import { Station } from "@/types/station";
import { Locale, LOCALE_MAP, getLocalizedText } from "@/i18n";
import { SafetyBeacon } from "@/components/SafetyBeacon";
import { SonicOrb } from "@/components/SonicOrb";
import { CinemaTicker } from "@/components/CinemaTicker";
import { PanicModal } from "@/components/PanicModal";
import { audioEngine, AudioPlaybackState } from "@/lib/audio-engine";

const stations: Station[] = stationsData as unknown as Station[];

function MainGuideContent() {
  const searchParams = useSearchParams();
  const stationParam = searchParams.get("station") || searchParams.get("id");

  // Tìm trạm tương ứng từ URL param hoặc mặc định trạm 01
  const initialStation =
    stations.find((s) => s.id === stationParam || s.qr_code_key === stationParam) || stations[0];

  const [currentStation, setCurrentStation] = useState<Station>(initialStation);
  const [locale, setLocale] = useState<Locale>("vi");
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [activeSubtitle, setActiveSubtitle] = useState<string>("");
  const [isPanicOpen, setIsPanicOpen] = useState<boolean>(false);
  const [playbackState, setPlaybackState] = useState<AudioPlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    stationId: initialStation.id,
    locale: "vi"
  });

  const tapTimesRef = useRef<number[]>([]);

  // Tự động nhận diện khi URL query param thay đổi (VD: Quét mã QR trạm khác)
  useEffect(() => {
    if (stationParam) {
      const target = stations.find((s) => s.id === stationParam || s.qr_code_key === stationParam);
      if (target && target.id !== currentStation.id) {
        setCurrentStation(target);
        setActiveSubtitle("");
        const audioAsset =
          target.audio_assets[locale as "vi" | "en"] ||
          target.audio_assets.en ||
          target.audio_assets.vi;
        audioEngine.loadAndPlay(
          audioAsset.url,
          target.id,
          getLocalizedText(target.title, locale),
          getLocalizedText(target.short_summary, locale),
          locale
        );
      }
    }
  }, [stationParam, currentStation.id, locale]);

  // Lắng nghe trạng thái Online/Offline
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  // Lắng nghe trạng thái Audio Engine
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((state) => {
      setPlaybackState(state);
    });
    return () => unsubscribe();
  }, []);

  // Tải âm thanh  // Chọn trạm thủ công
  const handleSelectStation = useCallback(
    (station: Station) => {
      setCurrentStation(station);
      setActiveSubtitle("");
      const audioAsset =
        station.audio_assets[locale as "vi" | "en"] ||
        station.audio_assets.en ||
        station.audio_assets.vi;
      audioEngine.loadAndPlay(
        audioAsset.url,
        station.id,
        getLocalizedText(station.title, locale),
        getLocalizedText(station.short_summary, locale),
        locale
      );
    },
    [locale]
  );

  // Đổi ngôn ngữ hướng dẫn
  const handleToggleLocale = useCallback(
    (newLocale: Locale) => {
      setLocale(newLocale);
      const audioAsset =
        currentStation.audio_assets[newLocale as "vi" | "en"] ||
        currentStation.audio_assets.en ||
        currentStation.audio_assets.vi;
      const savedTime = playbackState.currentTime;
      audioEngine.loadAndPlay(
        audioAsset.url,
        currentStation.id,
        getLocalizedText(currentStation.title, newLocale),
        getLocalizedText(currentStation.short_summary, newLocale),
        newLocale
      );
      if (savedTime > 0) {
        audioEngine.seek(savedTime);
      }
    },
    [currentStation, playbackState.currentTime]
  );

  // Toggle Play / Pause
  const handleTogglePlay = useCallback(() => {
    if (playbackState.isPlaying) {
      audioEngine.pause();
    } else {
      if (!playbackState.duration || playbackState.stationId !== currentStation.id) {
        handleSelectStation(currentStation);
      } else {
        audioEngine.play();
      }
    }
  }, [playbackState, currentStation, handleSelectStation]);

  // Gửi câu hỏi tới API /api/ask — SSE Stream + Progressive TTS
  const handleAskQuestion = useCallback(
    async (query: string): Promise<string> => {
      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            current_station_id: currentStation.id,
            lang: locale
          })
        });

        if (!res.ok || !res.body) {
          throw new Error(`HTTP error ${res.status}`);
        }

        // Consume SSE stream với Progressive TTS
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullAnswer = "";
        let sentenceBuffer = "";
        let ttsStarted = false;

        const speakChunk = (text: string) => {
          if (!text.trim() || typeof window === "undefined" || !("speechSynthesis" in window)) return;
          window.speechSynthesis.cancel();
          const utt = new SpeechSynthesisUtterance(text.trim());
          utt.lang = LOCALE_MAP[locale]?.speechLang || "vi-VN";
          utt.rate = 0.92;
          window.speechSynthesis.speak(utt);
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const lines = decoder.decode(value, { stream: true }).split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const event = JSON.parse(line.slice(6));

              if (event.type === "chunk" && event.text) {
                fullAnswer += event.text;
                sentenceBuffer += event.text;
                setActiveSubtitle(fullAnswer);

                // Progressive TTS: đọc ngay khi có câu hoàn chỉnh
                if (sentenceBuffer.match(/[.!?।。！？]/)) {
                  speakChunk(sentenceBuffer);
                  sentenceBuffer = "";
                  ttsStarted = true;
                  // Dừng audio nền khi AI bắt đầu nói
                  audioEngine.pause();
                }
              } else if (event.type === "done") {
                // Đọc phần còn lại nếu có
                if (sentenceBuffer.trim() && !ttsStarted) {
                  speakChunk(sentenceBuffer);
                }
              }
            } catch {
              // Partial SSE line, skip
            }
          }
        }

        // Hoàn tất stream SSE
        return fullAnswer;
      } catch (err) {
        console.warn("[Ask Streaming Fallback]:", err);
        return getLocalizedText(currentStation.human_story_hook, locale);
      }
    },
    [currentStation, locale]
  );

  // Khi nhận câu trả lời AI -> Đọc qua Microsoft Neural TTS (HoaiMyNeural)
  const handleAnswerReceived = useCallback(
    async (answer: string) => {
      if (!answer?.trim()) return;
      setActiveSubtitle(answer);
      await audioEngine.playNeuralTTS(answer, locale);
    },
    [locale]
  );

  // Panic Triple-Tap
  const handleScreenTouch = () => {
    const now = Date.now();
    const recentTaps = tapTimesRef.current.filter((t) => now - t < 700);
    recentTaps.push(now);
    tapTimesRef.current = recentTaps;

    if (recentTaps.length >= 3) {
      tapTimesRef.current = [];
      audioEngine.triggerHapticFeedback();
      setIsPanicOpen(true);
    }
  };

  return (
    <div className="w-full h-[100dvh] bg-stone-950 flex items-center justify-center overflow-hidden">
      {/* KHUNG DI ĐỘNG SONIC MONOLITH */}
      <div
        onClick={handleScreenTouch}
        className="h-[100dvh] w-full max-w-md flex flex-col justify-between bg-tunnel-base text-tunnel-chalk overflow-hidden relative select-none font-sans shadow-2xl border-x border-stone-900/80"
      >
        {/* ZONE 1: BEACON AN TOÀN & ĐỊNH HƯỚNG (20vh) */}
        <SafetyBeacon
          station={currentStation}
          locale={locale}
          onToggleLocale={handleToggleLocale}
          isOffline={isOffline}
        />

        {/* ZONE 2: QUẢ CẦU ÂM BẢN TƯƠNG TÁC (50vh) */}
        <SonicOrb
          stationId={currentStation.id}
          locale={locale}
          isPlaying={playbackState.isPlaying}
          onAskQuestion={handleAskQuestion}
          onAnswerReceived={handleAnswerReceived}
        />

        {/* ZONE 3: DÒNG THỜI GIAN & PHỤ ĐỀ CINEMA TICKER (30vh) */}
        <CinemaTicker
          stations={stations}
          currentStation={currentStation}
          locale={locale}
          isPlaying={playbackState.isPlaying}
          currentTime={playbackState.currentTime}
          duration={playbackState.duration}
          activeSubtitle={activeSubtitle}
          onSelectStation={handleSelectStation}
          onTogglePlay={handleTogglePlay}
        />

        {/* MODAL CỨU HỘ KHẨN CẤP (PANIC TRIPLE-TAP TORCH) */}
        <PanicModal
          isOpen={isPanicOpen}
          station={currentStation}
          locale={locale}
          onClose={() => setIsPanicOpen(false)}
        />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="h-full w-full bg-stone-950" />}>
      <MainGuideContent />
    </Suspense>
  );
}
