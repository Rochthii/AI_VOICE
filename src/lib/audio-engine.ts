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
      this.initAudioElements();
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
   * Khởi tạo HTML5 Audio Elements sẵn sàng cho cả nhạc nền và Neural TTS
   */
  private initAudioElements(): void {
    this.audioElement = new Audio();
    this.audioElement.preload = "auto";
    this.audioElement.addEventListener("timeupdate", () => this.notifyListeners());
    this.audioElement.addEventListener("play", () => this.notifyListeners());
    this.audioElement.addEventListener("playing", () => this.notifyListeners());
    this.audioElement.addEventListener("pause", () => this.notifyListeners());
    this.audioElement.addEventListener("ended", () => this.notifyListeners());
    this.audioElement.addEventListener("canplay", () => this.notifyListeners());
    this.audioElement.addEventListener("loadedmetadata", () => this.notifyListeners());

    this.ttsAudioElement = new Audio();
    this.ttsAudioElement.preload = "auto";
    this.ttsAudioElement.addEventListener("timeupdate", () => this.notifyListeners());
    this.ttsAudioElement.addEventListener("play", () => this.notifyListeners());
    this.ttsAudioElement.addEventListener("playing", () => this.notifyListeners());
    this.ttsAudioElement.addEventListener("pause", () => this.notifyListeners());
    this.ttsAudioElement.addEventListener("canplay", () => this.notifyListeners());
    this.ttsAudioElement.addEventListener("loadedmetadata", () => this.notifyListeners());
    this.ttsAudioElement.addEventListener("ended", () => this.notifyListeners());

    this.setupMediaSession();
  }

  /**
   * Mở khóa AudioContext và User Activation State cho Web Audio / Safari / Chrome
   */
  public async unlockAudioContext(): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioContext && AudioCtx) {
        this.audioContext = new AudioCtx();
      }

      if (this.audioContext && this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      if (this.audioContext && !this.isUnlocked) {
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
   * Phát toàn bộ bài thuyết minh của trạm di tích:
   * 1. Ưu tiên phát tệp MP3 phòng thu có sẵn (/audio/stations/...) để tải 0ms, không tốn token và hoạt động offline 100%.
   * 2. Nếu không có file MP3, tự động chuyển sang ElevenLabs / Neural TTS.
   */
  public async playStationNarration(
    stationId: string,
    title: string,
    shortSummary: string,
    storyHook: string,
    locale: Locale = "vi",
    audioFileUrl?: string
  ): Promise<void> {
    this.stop();
    await this.unlockAudioContext();
    this.currentStationId = stationId;
    this.currentLocale = locale;
    this.updateMetadata(title, shortSummary);

    // 1. Ưu tiên phát file MP3 thu sẵn của trạm
    if (audioFileUrl && audioFileUrl.trim()) {
      if (!this.audioElement) {
        this.initAudioElements();
      }
      if (this.audioElement) {
        this.audioElement.src = audioFileUrl;
        this.audioElement.load();
        try {
          await this.audioElement.play();
          this.notifyListeners();
          return;
        } catch (playErr) {
          console.warn("[AudioEngine] Pre-recorded MP3 play failed, falling back to TTS:", playErr);
        }
      }
    }

    // 2. Fallback sang ElevenLabs / Neural TTS
    const narrationText = `${title}. ${shortSummary} ${storyHook}`;
    await this.playNeuralTTS(narrationText, locale);
  }

  /**
   * Phát giọng đọc Neural TTS độc quyền (Chỉ phát 1 luồng duy nhất, không trùng lặp)
   */
  public async playNeuralTTS(text: string, lang: Locale = "vi"): Promise<void> {
    if (!text?.trim()) return;

    // 1. Tắt toàn bộ mọi nguồn âm thanh đang phát trước đó
    this.stop();
    await this.unlockAudioContext();

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

      if (!this.ttsAudioElement) {
        this.initAudioElements();
      }

      if (this.ttsAudioElement) {
        this.ttsAudioElement.src = audioUrl;
        this.ttsAudioElement.load();
        try {
          await this.ttsAudioElement.play();
        } catch (playErr) {
          console.warn("[AudioEngine] Immediate TTS autoplay prevented by browser policy:", playErr);
        }
        this.notifyListeners();
      }
    } catch (err) {
      console.warn("[AudioEngine] Neural TTS playback warning:", err);
    }
  }

  public play(): void {
    if (this.audioElement && this.audioElement.src && this.audioElement.paused) {
      this.audioElement.play().catch((err) => console.warn("[AudioEngine] Station MP3 Play failed:", err));
    } else if (this.ttsAudioElement && this.ttsAudioElement.src && this.ttsAudioElement.paused) {
      this.ttsAudioElement.play().catch((err) => console.warn("[AudioEngine] TTS Play failed:", err));
    }
  }

  public pause(): void {
    if (this.ttsAudioElement && !this.ttsAudioElement.paused) {
      this.ttsAudioElement.pause();
    }
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
    }
    this.notifyListeners();
  }

  public stop(): void {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (this.ttsAudioElement) {
      this.ttsAudioElement.pause();
      this.ttsAudioElement.currentTime = 0;
      this.ttsAudioElement.removeAttribute("src");
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.notifyListeners();
  }

  public seek(seconds: number): void {
    const active = (!this.audioElement?.paused && this.audioElement?.src)
      ? this.audioElement
      : (!this.ttsAudioElement?.paused && this.ttsAudioElement?.src)
      ? this.ttsAudioElement
      : (this.audioElement?.src ? this.audioElement : this.ttsAudioElement);

    if (active && Number.isFinite(seconds)) {
      active.currentTime = Math.max(0, Math.min(seconds, active.duration || 0));
      this.notifyListeners();
    }
  }

  public seekRelative(offsetSeconds: number): void {
    const active = (!this.audioElement?.paused && this.audioElement?.src)
      ? this.audioElement
      : (!this.ttsAudioElement?.paused && this.ttsAudioElement?.src)
      ? this.ttsAudioElement
      : (this.audioElement?.src ? this.audioElement : this.ttsAudioElement);

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
    let activeAudio: HTMLAudioElement | null = null;
    if (this.audioElement && !this.audioElement.paused) {
      activeAudio = this.audioElement;
    } else if (this.ttsAudioElement && !this.ttsAudioElement.paused) {
      activeAudio = this.ttsAudioElement;
    } else if (this.audioElement && this.audioElement.src && this.audioElement.duration > 0) {
      activeAudio = this.audioElement;
    } else if (this.ttsAudioElement && this.ttsAudioElement.src) {
      activeAudio = this.ttsAudioElement;
    } else {
      activeAudio = this.audioElement;
    }

    const isPlaying = Boolean(
      (this.audioElement && !this.audioElement.paused) ||
      (this.ttsAudioElement && !this.ttsAudioElement.paused)
    );

    return {
      isPlaying,
      currentTime: activeAudio?.currentTime || 0,
      duration: activeAudio?.duration && !isNaN(activeAudio.duration) && isFinite(activeAudio.duration) ? activeAudio.duration : 0,
      stationId: this.currentStationId,
      locale: this.currentLocale
    };
  }
}

export const audioEngine = AudioEngine.getInstance();
