import { Locale, LOCALE_MAP } from "@/i18n";

export interface AudioPlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  stationId: string;
  locale: Locale;
}

type PlaybackListener = (state: AudioPlaybackState) => void;

class AudioEngine {
  private static instance: AudioEngine;
  private audioElement: HTMLAudioElement | null = null;
  private ttsAudioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private isUnlocked: boolean = false;

  private currentStationId: string = "";
  private currentLocale: Locale = "vi";
  private listeners: Set<PlaybackListener> = new Set();

  private constructor() {
    if (typeof window !== "undefined") {
      this.initAudioElement();
      this.setupDeviceChangeListener();
    }
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  /**
   * Khởi tạo HTML5 Audio Element và kết nối MediaSession
   */
  private initAudioElement(): void {
    this.audioElement = new Audio();
    this.audioElement.preload = "auto";

    this.audioElement.addEventListener("timeupdate", () => this.notifyListeners());
    this.audioElement.addEventListener("play", () => this.notifyListeners());
    this.audioElement.addEventListener("pause", () => this.notifyListeners());
    this.audioElement.addEventListener("ended", () => this.notifyListeners());
    this.audioElement.addEventListener("loadedmetadata", () => this.notifyListeners());

    this.setupMediaSession();
  }

  /**
   * Mở khóa AudioContext cho iOS Safari bằng Silent Buffer ở lần chạm đầu tiên
   */
  public async unlockAudioContext(): Promise<void> {
    if (this.isUnlocked || typeof window === "undefined") return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioContext && AudioCtx) {
        this.audioContext = new AudioCtx();
      }

      if (this.audioContext && this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      if (this.audioContext) {
        const buffer = this.audioContext.createBuffer(1, 1, 22050);
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(0);
      }

      this.isUnlocked = true;
    } catch (err) {
      console.warn("[AudioEngine] Could not unlock AudioContext:", err);
    }
  }

  /**
   * Lắng nghe sự kiện rơi tai nghe Bluetooth hoặc rút jack cắm
   */
  private setupDeviceChangeListener(): void {
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener("devicechange", () => {
        if (this.isPlaying()) {
          console.warn("[AudioEngine] Audio output device changed (Headphone disconnected) -> Emergency Pause");
          this.pause();
        }
      });
    }
  }

  /**
   * Tích hợp MediaSession API
   */
  private setupMediaSession(): void {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", () => this.play());
    navigator.mediaSession.setActionHandler("pause", () => this.pause());
    navigator.mediaSession.setActionHandler("seekbackward", () => this.seekRelative(-15));
    navigator.mediaSession.setActionHandler("seekforward", () => this.seekRelative(15));
    navigator.mediaSession.setActionHandler("stop", () => this.stop());
  }

  public updateMetadata(title: string, stationName: string): void {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: title,
      artist: "CHI VOICE — Thuyết Minh Địa Đạo Củ Chi",
      album: stationName,
      artwork: [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
      ]
    });
  }

  /**
   * Phát toàn bộ bài thuyết minh của trạm di tích bằng giọng nữ Hoài My Neural (vi-VN-HoaiMyNeural)
   */
  public async playStationNarration(
    stationId: string,
    title: string,
    shortSummary: string,
    storyHook: string,
    locale: Locale = "vi"
  ): Promise<void> {
    await this.unlockAudioContext();
    this.currentStationId = stationId;
    this.currentLocale = locale;
    this.updateMetadata(title, shortSummary);

    const narrationText = `${title}. ${shortSummary} ${storyHook}`;
    await this.playNeuralTTS(narrationText, locale);
  }

  /**
   * Phát giọng đọc Microsoft Neural TTS cao cấp (vi-VN-HoaiMyNeural)
   */
  public async playNeuralTTS(text: string, lang: Locale = "vi"): Promise<void> {
    if (!text?.trim()) return;

    // Tạm dừng phát âm thanh đang chạy
    this.pause();

    if (this.ttsAudioElement) {
      this.ttsAudioElement.pause();
      this.ttsAudioElement.src = "";
      this.ttsAudioElement = null;
      this.notifyListeners();
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), lang })
      });

      if (!res.ok) {
        throw new Error(`TTS API returned status ${res.status}`);
      }

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      this.ttsAudioElement = audio;

      audio.addEventListener("timeupdate", () => this.notifyListeners());
      audio.addEventListener("play", () => this.notifyListeners());
      audio.addEventListener("pause", () => this.notifyListeners());
      audio.addEventListener("loadedmetadata", () => this.notifyListeners());
      audio.addEventListener("ended", () => {
        URL.revokeObjectURL(audioUrl);
        if (this.ttsAudioElement === audio) {
          this.ttsAudioElement = null;
        }
        this.notifyListeners();
      });

      await audio.play();
      this.notifyListeners();
    } catch (err) {
      console.warn("[AudioEngine] Neural TTS failed, falling back to Web Speech API:", err);

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utt = new SpeechSynthesisUtterance(text.trim());
        utt.lang = lang === "vi" ? "vi-VN" : lang === "fr" ? "fr-FR" : lang === "ja" ? "ja-JP" : lang === "ko" ? "ko-KR" : lang === "zh" ? "zh-CN" : "en-US";
        utt.rate = 1.0;
        
        utt.onstart = () => this.notifyListeners();
        utt.onend = () => this.notifyListeners();
        
        window.speechSynthesis.speak(utt);
      }
    }
  }

  public play(): void {
    if (this.ttsAudioElement && this.ttsAudioElement.paused) {
      this.ttsAudioElement.play().catch((err) => console.warn("[AudioEngine] TTS Play failed:", err));
    } else if (this.audioElement && this.audioElement.paused) {
      this.audioElement.play().catch((err) => console.warn("[AudioEngine] Play failed:", err));
    }
  }

  public pause(): void {
    if (this.ttsAudioElement && !this.ttsAudioElement.paused) {
      this.ttsAudioElement.pause();
      this.notifyListeners();
    }
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
      this.notifyListeners();
    }
  }

  public stop(): void {
    if (this.ttsAudioElement) {
      this.ttsAudioElement.pause();
      this.ttsAudioElement.currentTime = 0;
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.notifyListeners();
  }

  public seek(seconds: number): void {
    const active = this.ttsAudioElement || this.audioElement;
    if (active && Number.isFinite(seconds)) {
      active.currentTime = Math.max(0, Math.min(seconds, active.duration || 0));
    }
  }

  public seekRelative(offsetSeconds: number): void {
    const active = this.ttsAudioElement || this.audioElement;
    if (active) {
      this.seek(active.currentTime + offsetSeconds);
    }
  }

  public triggerHapticFeedback(): void {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(40);
      } catch {}
    }
  }

  public playBambooClickSound(): void {
    if (!this.audioContext) return;

    try {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(120, this.audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start();
      osc.stop(this.audioContext.currentTime + 0.08);
    } catch (err) {
      console.warn("[AudioEngine] Could not play click SFX:", err);
    }
  }

  public isPlaying(): boolean {
    return (this.ttsAudioElement && !this.ttsAudioElement.paused) || (this.audioElement && !this.audioElement.paused) || false;
  }

  public subscribe(listener: PlaybackListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }

  public getState(): AudioPlaybackState {
    const activeAudio = this.ttsAudioElement || this.audioElement;
    return {
      isPlaying: activeAudio ? !activeAudio.paused : false,
      currentTime: activeAudio?.currentTime || 0,
      duration: activeAudio?.duration && !isNaN(activeAudio.duration) && isFinite(activeAudio.duration) ? activeAudio.duration : 0,
      stationId: this.currentStationId,
      locale: this.currentLocale
    };
  }
}

export const audioEngine = AudioEngine.getInstance();
