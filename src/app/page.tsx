"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import stationsData from "@/data/stations.json";
import { Station, Locale } from "@/types/station";
import { SafetyBeacon } from "@/components/SafetyBeacon";
import { SonicOrb } from "@/components/SonicOrb";
import { CinemaTicker } from "@/components/CinemaTicker";
import { PanicModal } from "@/components/PanicModal";
import { audioEngine, AudioPlaybackState } from "@/lib/audio-engine";

const stations: Station[] = stationsData as unknown as Station[];

export default function HomePage() {
  const [currentStation, setCurrentStation] = useState<Station>(stations[0]);
  const [locale, setLocale] = useState<Locale>("vi");
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [activeSubtitle, setActiveSubtitle] = useState<string>("");
  const [isPanicOpen, setIsPanicOpen] = useState<boolean>(false);
  const [playbackState, setPlaybackState] = useState<AudioPlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    stationId: stations[0].id,
    locale: "vi"
  });

  // Quản lý phát hiện 3 lần chạm liên tiếp (Panic Triple-Tap)
  const tapTimesRef = useRef<number[]>([]);

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

  // Tải âm thanh của trạm được chọn
  const handleSelectStation = useCallback(
    (station: Station) => {
      setCurrentStation(station);
      setActiveSubtitle("");
      const audioAsset = station.audio_assets[locale];
      audioEngine.loadAndPlay(
        audioAsset.url,
        station.id,
        station.title[locale],
        station.short_summary[locale],
        locale
      );
    },
    [locale]
  );

  // Đổi ngôn ngữ song ngữ VI / EN
  const handleToggleLocale = useCallback(
    (newLocale: Locale) => {
      setLocale(newLocale);
      const audioAsset = currentStation.audio_assets[newLocale];
      const savedTime = playbackState.currentTime;
      audioEngine.loadAndPlay(
        audioAsset.url,
        currentStation.id,
        currentStation.title[newLocale],
        currentStation.short_summary[newLocale],
        newLocale
      );
      // Giữ nguyên số giây đang nghe
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

  // Xử lý gửi câu hỏi tới API /api/ask
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

        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }

        const data = await res.json();
        return data.answer || "";
      } catch (err) {
        console.warn("[Ask API Offline Fallback]:", err);
        // Fallback nội bộ nếu hoàn toàn mất mạng
        return locale === "vi"
          ? currentStation.faqs[0]?.answer.vi || currentStation.human_story_hook.vi
          : currentStation.faqs[0]?.answer.en || currentStation.human_story_hook.en;
      }
    },
    [currentStation, locale]
  );

  // Khi nhận được câu trả lời AI -> Cập nhật Cinema Ticker và đọc qua Web Speech TTS
  const handleAnswerReceived = useCallback(
    (answer: string) => {
      setActiveSubtitle(answer);

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(answer);
        utterance.lang = locale === "vi" ? "vi-VN" : "en-US";
        utterance.rate = 0.95; // Nhịp điệu chậm rãi, bình tĩnh
        utterance.onend = () => {
          // Tự động phát tiếp âm thanh nền sau khi AI trả lời xong
          audioEngine.play();
        };
        window.speechSynthesis.speak(utterance);
      }
    },
    [locale]
  );

  // Bắt sự kiện Panic Triple-Tap trên toàn bộ màn hình
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
    <div
      onClick={handleScreenTouch}
      className="h-[100dvh] w-full flex flex-col justify-between bg-tunnel-base text-tunnel-chalk overflow-hidden relative select-none font-sans"
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
  );
}
