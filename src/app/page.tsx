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
        const title = getLocalizedText(target.title, locale);
        const summary = getLocalizedText(target.short_summary, locale);
        const story = getLocalizedText(target.human_story_hook, locale);
        audioEngine.playStationNarration(target.id, title, summary, story, locale);
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

  // Chọn trạm và phát giọng nữ thuyết minh Hoài My Neural
  const handleSelectStation = useCallback(
    (station: Station) => {
      setCurrentStation(station);
      setActiveSubtitle("");
      const title = getLocalizedText(station.title, locale);
      const summary = getLocalizedText(station.short_summary, locale);
      const story = getLocalizedText(station.human_story_hook, locale);
      audioEngine.playStationNarration(station.id, title, summary, story, locale);
    },
    [locale]
  );

  // Đổi ngôn ngữ hướng dẫn
  const handleToggleLocale = useCallback(
    (newLocale: Locale) => {
      setLocale(newLocale);
      const title = getLocalizedText(currentStation.title, newLocale);
      const summary = getLocalizedText(currentStation.short_summary, newLocale);
      const story = getLocalizedText(currentStation.human_story_hook, newLocale);
      audioEngine.playStationNarration(currentStation.id, title, summary, story, newLocale);
    },
    [currentStation]
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

  // Gửi câu hỏi tới API /api/ask — SSE Stream + Instant Neural TTS
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
          throw new Error("API Ask stream failed");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullAnswer = "";

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
                setActiveSubtitle(fullAnswer);
              }
            } catch {
              // Partial SSE line, skip
            }
          }
        }

        // Tự động phát ngay âm thanh Hoài My Neural
        if (fullAnswer.trim()) {
          audioEngine.playNeuralTTS(fullAnswer.trim(), locale);
        }

        return fullAnswer;
      } catch (err) {
        console.warn("[Ask Streaming Fallback]:", err);
        const fallback = getLocalizedText(currentStation.human_story_hook, locale);
        audioEngine.playNeuralTTS(fallback, locale);
        return fallback;
      }
    },
    [currentStation, locale]
  );

  // Khi nhận câu trả lời AI -> Đồng bộ phụ đề
  const handleAnswerReceived = useCallback(
    (answer: string) => {
      if (!answer?.trim()) return;
      setActiveSubtitle(answer);
    },
    []
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
          currentStation={currentStation}
          locale={locale}
          isPlaying={playbackState.isPlaying}
          currentTime={playbackState.currentTime}
          duration={playbackState.duration}
          activeSubtitle={activeSubtitle}
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
