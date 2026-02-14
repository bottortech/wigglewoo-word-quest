// =============================================
// BackgroundMusic.ts — Global background music manager
// WiggleWoo's Word Quest
// =============================================
// Handles looping background music that persists
// across screens and levels. Singleton pattern
// ensures only one instance ever plays.
// =============================================

import musicFile from "../music/Wigglewoo Word Quest Music Background .mp3";

class BackgroundMusicManager {
  private static instance: BackgroundMusicManager | null = null;
  private audio: HTMLAudioElement | null = null;
  private isInitialized = false;
  private isPaused = false;
  private userHasInteracted = false;
  private pendingPlay = false;

  // Volume: 20-30% as requested (0.25 = 25%)
  private readonly VOLUME = 0.25;

  private constructor() {
    // Singleton — use getInstance()
  }

  static getInstance(): BackgroundMusicManager {
    if (!BackgroundMusicManager.instance) {
      BackgroundMusicManager.instance = new BackgroundMusicManager();
    }
    return BackgroundMusicManager.instance;
  }

  /**
   * Initialize the audio element (call once on app mount)
   */
  init(): void {
    if (this.isInitialized) return;

    this.audio = new Audio(musicFile);
    this.audio.loop = true;
    this.audio.volume = this.VOLUME;
    this.audio.preload = "auto";

    // Handle visibility change (pause when tab loses focus)
    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    // Listen for user interaction to enable autoplay
    const interactionEvents = ["click", "touchstart", "keydown"];
    const handleFirstInteraction = () => {
      this.userHasInteracted = true;
      if (this.pendingPlay) {
        this.play();
      }
      // Remove listeners after first interaction
      interactionEvents.forEach((event) => {
        document.removeEventListener(event, handleFirstInteraction);
      });
    };

    interactionEvents.forEach((event) => {
      document.addEventListener(event, handleFirstInteraction, { once: false });
    });

    this.isInitialized = true;
  }

  /**
   * Start playing background music
   * If user hasn't interacted yet, queues playback for after first interaction
   */
  play(): void {
    if (!this.audio) {
      this.init();
    }

    if (!this.userHasInteracted) {
      this.pendingPlay = true;
      return;
    }

    if (this.audio && this.audio.paused) {
      this.audio.play().catch((err) => {
        // Autoplay was blocked — will retry on user interaction
        console.log("Background music autoplay blocked, waiting for user interaction");
        this.pendingPlay = true;
      });
      this.isPaused = false;
    }
  }

  /**
   * Pause background music
   */
  pause(): void {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
      this.isPaused = true;
    }
  }

  /**
   * Resume background music if it was paused
   */
  resume(): void {
    if (this.audio && this.isPaused && this.userHasInteracted) {
      this.audio.play().catch(() => {
        // Ignore errors on resume
      });
      this.isPaused = false;
    }
  }

  /**
   * Stop and reset background music
   */
  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPaused = false;
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.audio?.volume ?? this.VOLUME;
  }

  /**
   * Check if music is currently playing
   */
  isPlaying(): boolean {
    return this.audio ? !this.audio.paused : false;
  }

  /**
   * Handle tab visibility changes
   */
  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      // Tab lost focus — pause music
      if (this.audio && !this.audio.paused) {
        this.audio.pause();
        this.isPaused = true;
      }
    } else {
      // Tab regained focus — resume if was playing
      if (this.isPaused && this.userHasInteracted) {
        this.resume();
      }
    }
  };

  /**
   * Cleanup (call on app unmount)
   */
  destroy(): void {
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    this.stop();
    this.audio = null;
    this.isInitialized = false;
    BackgroundMusicManager.instance = null;
  }
}

// Export singleton instance getter
export const backgroundMusic = BackgroundMusicManager.getInstance();
export default backgroundMusic;
