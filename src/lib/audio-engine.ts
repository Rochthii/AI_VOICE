import { Locale, LOCALE_MAP } from "@/i18n";

export interface AudioPlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  stationId: string | null;
  locale: Locale;
}

type PlaybackListener = (state: AudioPlaybackState) => void;

class AudioEngine {
  private static instance: AudioEngine | null = null;
  private audioContext: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private isUnlocked: boolean = false;
  private listeners: Set<PlaybackListener> = new Set();
  private currentStationId: string | null = null;
  private currentLocale: Locale = "vi";

  private constructor() {
    // Chỉ khởi tạo trong môi trường Browser
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

      // Phát 1 frame âm thanh câm (0.01s) để iOS mở quyền Audio
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
   * Tự động tạm dừng ngay trong 10ms, TUYỆT ĐỐI không phát loa ngoài dưới hầm kín.
   */
  private setupDeviceChangeListener(): void {
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener("devicechange", () => {
        if (this.audioElement && !this.audioElement.paused) {
          console.warn("[AudioEngine] Audio output device changed (Headphone disconnected) -> Emergency Pause");
          this.pause();
        }
      });
    }
  }

  /**
   * Tích hợp MediaSession API cho phép điều khiển qua Lock Screen / Cất vào túi quần
   */
  private setupMediaSession(): void {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", () => this.play());
    navigator.mediaSession.setActionHandler("pause", () => this.pause());
    navigator.mediaSession.setActionHandler("seekbackward", () => this.seekRelative(-15));
    navigator.mediaSession.setActionHandler("seekforward", () => this.seekRelative(15));
    navigator.mediaSession.setActionHandler("stop", () => this.stop());
  }

  /**
   * Cập nhật thông tin trạm hiển thị trên màn hình khoá điện thoại (Lock Screen Metadata)
   */
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
   * Nạp và phát âm thanh của một trạm di tích
   */
  public async loadAndPlay(
    audioUrl: string,
    stationId: string,
    title: string,
    stationName: string,
    locale: Locale = "vi"
  ): Promise<void> {
    await this.unlockAudioContext();

    if (!this.audioElement) return;

    this.currentStationId = stationId;
    this.currentLocale = locale;

    // Nếu đang phát cùng URL thì chỉ cần toggle hoặc resume
    if (this.audioElement.src.endsWith(audioUrl) && !this.audioElement.error) {
      if (this.audioElement.paused) {
        await this.audioElement.play();
      }
      return;
    }

    this.audioElement.src = audioUrl;
    this.audioElement.load();
    this.updateMetadata(title, stationName);

    try {
      await this.audioElement.play();
    } catch (err) {
      console.warn("[AudioEngine] MP3 playback fallback to Web Speech TTS:", err);
      // Fallback tự động đọc nội dung thuyết minh bằng Web Speech API
      this.speakFallbackText(title, stationName, locale);
    }
  }

  /**
   * Phát giọng đọc thuyết minh qua Web Speech API khi file MP3 chưa tải hoặc môi trường test
   */
  public speakFallbackText(title: string, content: string, locale: Locale = "vi"): void {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const textToRead = `${title}. ${content}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = LOCALE_MAP[locale]?.speechLang || "vi-VN";
      utterance.rate = 0.95;
      
      utterance.onstart = () => {
        this.notifyListeners();
      };
      
      utterance.onend = () => {
        this.notifyListeners();
      };

      window.speechSynthesis.speak(utterance);
    }
  }

  public play(): void {
    if (this.audioElement && this.audioElement.paused) {
      this.audioElement.play().catch((err) => console.warn("[AudioEngine] Play failed:", err));
    }
  }

  public pause(): void {
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
    }
  }

  public stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
  }

  public seek(seconds: number): void {
    if (this.audioElement && Number.isFinite(seconds)) {
      this.audioElement.currentTime = Math.max(0, Math.min(seconds, this.audioElement.duration || 0));
    }
  }

  public seekRelative(offsetSeconds: number): void {
    if (this.audioElement) {
      this.seek(this.audioElement.currentTime + offsetSeconds);
    }
  }

  /**
   * Phản hồi xúc giác Haptic Pulse (40ms) khi chạm nút
   */
  public triggerHapticFeedback(): void {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(40);
      } catch {
        // Bỏ qua nếu thiết bị không hỗ trợ rung
      }
    }
  }

  /**
   * Phát âm thanh gõ mõ tre trầm 120Hz dã chiến (Synthesized Bamboo Click)
   */
  public playBambooClickSound(): void {
    if (!this.audioContext) return;

    try {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(120, this.audioContext.currentTime); // 120Hz trầm ấm
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
    return {
      isPlaying: this.audioElement ? !this.audioElement.paused : false,
      currentTime: this.audioElement?.currentTime || 0,
      duration: this.audioElement?.duration || 0,
      stationId: this.currentStationId,
      locale: this.currentLocale
    };
  }
}

export const audioEngine = AudioEngine.getInstance();
