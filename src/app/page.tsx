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
import { OverviewHub } from "@/components/OverviewHub";
import { audioEngine, AudioPlaybackState } from "@/lib/audio-engine";
import { getSmartFollowUpSuggestions } from "@/lib/suggestion-engine";

const stations: Station[] = stationsData as unknown as Station[];

function MainGuideContent() {
  const searchParams = useSearchParams();
  const stationParam = searchParams.get("station") || searchParams.get("id");

  // Tìm trạm tương ứng nếu quét QR/URL, nếu vào tự nhiên thì là NULL (Tổng Quan Toàn Cảnh)
  const matchedStation = stationParam
    ? stations.find((s) => s.id === stationParam || s.qr_code_key === stationParam) || null
    : null;

  const [currentStation, setCurrentStation] = useState<Station | null>(matchedStation);
  const [locale, setLocale] = useState<Locale>("vi");
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isOverviewOpen, setIsOverviewOpen] = useState<boolean>(!matchedStation);
  const [activeSubtitle, setActiveSubtitle] = useState<string>("");
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>(() =>
    getSmartFollowUpSuggestions(matchedStation?.id, "vi")
  );
  const [isPanicOpen, setIsPanicOpen] = useState<boolean>(false);
  const [playbackState, setPlaybackState] = useState<AudioPlaybackState>({
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    stationId: matchedStation?.id || "global_overview",
    locale: "vi"
  });

  const tapTimesRef = useRef<number[]>([]);

  // Tự động nhận diện khi URL query param thay đổi (VD: Quét mã QR trạm khác)
  useEffect(() => {
    if (stationParam) {
      const target = stations.find((s) => s.id === stationParam || s.qr_code_key === stationParam);
      if (target) {
        setCurrentStation(target);
        setIsOverviewOpen(false);
        setActiveSubtitle("");
        setFollowUpSuggestions(getSmartFollowUpSuggestions(target.id, locale));
        const title = getLocalizedText(target.title, locale);
        const summary = getLocalizedText(target.short_summary, locale);
        const story = getLocalizedText(target.human_story_hook, locale);
        const audioUrl =
          (target.audio_assets as Record<string, { url: string }>)?.[locale]?.url ||
          (target.audio_assets as Record<string, { url: string }>)?.[locale === "vi" ? "vi" : "en"]?.url;
        audioEngine.playStationNarration(target.id, title, summary, story, locale, audioUrl);
      }
    }
  }, [stationParam, locale]);

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

  // Chọn trạm và phát thuyết minh (Ưu tiên MP3 có sẵn, fallback sang Neural)
  const handleSelectStation = useCallback(
    (station: Station) => {
      setCurrentStation(station);
      setIsOverviewOpen(false);
      setActiveSubtitle("");
      setFollowUpSuggestions(getSmartFollowUpSuggestions(station.id, locale));
      const title = getLocalizedText(station.title, locale);
      const summary = getLocalizedText(station.short_summary, locale);
      const story = getLocalizedText(station.human_story_hook, locale);
      const audioUrl =
        (station.audio_assets as Record<string, { url: string }>)?.[locale]?.url ||
        (station.audio_assets as Record<string, { url: string }>)?.[locale === "vi" ? "vi" : "en"]?.url;
      audioEngine.playStationNarration(station.id, title, summary, story, locale, audioUrl);
    },
    [locale]
  );

  // Đổi ngôn ngữ hướng dẫn
  const handleToggleLocale = useCallback(
    (newLocale: Locale) => {
      setLocale(newLocale);
      setFollowUpSuggestions(getSmartFollowUpSuggestions(currentStation?.id, newLocale));
      if (currentStation) {
        const title = getLocalizedText(currentStation.title, newLocale);
        const summary = getLocalizedText(currentStation.short_summary, newLocale);
        const story = getLocalizedText(currentStation.human_story_hook, newLocale);
        const audioUrl =
          (currentStation.audio_assets as Record<string, { url: string }>)?.[newLocale]?.url ||
          (currentStation.audio_assets as Record<string, { url: string }>)?.[newLocale === "vi" ? "vi" : "en"]?.url;
        audioEngine.playStationNarration(currentStation.id, title, summary, story, newLocale, audioUrl);
      }
    },
    [currentStation]
  );

  // Toggle Play / Pause
  const handleTogglePlay = useCallback(() => {
    if (playbackState.isPlaying) {
      audioEngine.pause();
    } else {
      if (currentStation) {
        const title = getLocalizedText(currentStation.title, locale);
        const summary = getLocalizedText(currentStation.short_summary, locale);
        const story = getLocalizedText(currentStation.human_story_hook, locale);
        const audioUrl =
          (currentStation.audio_assets as Record<string, { url: string }>)?.[locale]?.url ||
          (currentStation.audio_assets as Record<string, { url: string }>)?.[locale === "vi" ? "vi" : "en"]?.url;

        if (playbackState.duration > 0 && playbackState.stationId === currentStation.id) {
          audioEngine.play();
        } else {
          audioEngine.playStationNarration(currentStation.id, title, summary, story, locale, audioUrl);
        }
      } else {
        // Đang ở Tổng Quan Toàn Cảnh -> Phát bài giới thiệu toàn cảnh Củ Chi
        const globalIntro =
          locale === "vi"
            ? "Di tích Lịch sử Quốc gia Đặc biệt Địa đạo Củ Chi — 'Thành phố trong lòng đất' kỳ vĩ với hơn 250km đường hầm chia làm 3 tầng liên hoàn đào hoàn toàn thủ công, là biểu tượng kiên cường bất khuất của dân tộc Việt Nam."
            : "Cu Chi Tunnels Special National Relic — an underground city spanning over 250km across 3 hand-dug subterranean levels, standing as an enduring symbol of Vietnamese revolutionary heroism.";
        audioEngine.playNeuralTTS(globalIntro, locale);
      }
    }
  }, [playbackState, currentStation, locale]);

  // Gửi câu hỏi tới API /api/ask — SSE Stream + Instant Neural TTS
  const handleAskQuestion = useCallback(
    async (query: string): Promise<string> => {
      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            current_station_id: currentStation ? currentStation.id : "global_overview",
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
              } else if (event.type === "done" && Array.isArray(event.suggestions) && event.suggestions.length > 0) {
                setFollowUpSuggestions(event.suggestions);
              }
            } catch {
              // Partial SSE line, skip
            }
          }
        }

        // Tự động phát ngay âm thanh Hoài My Neural và đợi đến khi thực sự cất tiếng
        if (fullAnswer.trim()) {
          await audioEngine.playNeuralTTS(fullAnswer.trim(), locale);
        }

        return fullAnswer;
      } catch (err) {
        console.warn("[Ask Streaming Fallback]:", err);
        const fallback = currentStation
          ? getLocalizedText(currentStation.human_story_hook, locale)
          : locale === "vi"
          ? "Địa đạo Củ Chi dài hơn 250km với 3 tầng ngầm kiên cố trong lòng đất sét pha đá ong."
          : "Cu Chi tunnels span over 250km across 3 fortified subterranean layers.";
        await audioEngine.playNeuralTTS(fallback, locale);
        return fallback;
      }
    },
    [currentStation, locale]
  );

  // Khi nhận câu trả lời AI -> Đồng bộ phụ đề
  const handleAnswerReceived = useCallback((answer: string) => {
    if (!answer?.trim()) return;
    setActiveSubtitle(answer);
  }, []);

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
    <div className="w-full h-[100dvh] bg-[#ECE7DC] flex items-center justify-center overflow-hidden">
      {/* KHUNG DI ĐỘNG CỦ CHI VOICE GUIDE */}
      <div
        onClick={handleScreenTouch}
        className="h-[100dvh] w-full max-w-md flex flex-col justify-between bg-[#FAF7F2] text-[#1C1917] overflow-hidden relative select-none font-sans shadow-2xl border-x border-[#E0DACE]"
      >
        {/* ZONE 1: BEACON AN TOÀN & ĐỊNH HƯỚNG (20vh) */}
        <SafetyBeacon
          station={currentStation}
          locale={locale}
          onToggleLocale={handleToggleLocale}
          onOpenOverview={() => {
            setCurrentStation(null);
            setFollowUpSuggestions(getSmartFollowUpSuggestions("global_overview", locale));
            setIsOverviewOpen(true);
          }}
          isOffline={isOffline}
        />

        {/* ZONE 2: KHỐI ÂM THANH TƯƠNG TÁC & GỢI Ý CÂU HỎI (50vh) */}
        <SonicOrb
          stationId={currentStation ? currentStation.id : "global_overview"}
          locale={locale}
          isPlaying={playbackState.isPlaying}
          isLoadingAudio={playbackState.isLoading}
          followUpSuggestions={followUpSuggestions}
          onAskQuestion={handleAskQuestion}
          onAnswerReceived={handleAnswerReceived}
        />

        {/* ZONE 3: DÒNG THỜI GIAN & BỘ ĐIỀU KHIỂN ÂM THANH (30vh) */}
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
          station={currentStation || stations[0]}
          locale={locale}
          onClose={() => setIsPanicOpen(false)}
        />

        {/* MÀN HÌNH TỔNG QUAN KHU DI TÍCH & BẢN ĐỒ 5 TRẠM (OVERVIEW HUB) */}
        {isOverviewOpen && (
          <OverviewHub
            stations={stations}
            locale={locale}
            onSelectStation={handleSelectStation}
            onClose={() => setIsOverviewOpen(false)}
          />
        )}
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
