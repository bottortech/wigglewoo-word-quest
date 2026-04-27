// =============================================
// BackgroundMusic.ts — Global background music manager
// WiggleWoo's Word Quest
// =============================================
// Singleton that owns the looping music bed across screens.
// Two HTMLAudioElements ("a" and "b") let us crossfade between
// the main theme and per-room themes (trophy room, discovery
// rooms) without an audible cut.
// =============================================

import mainThemeFile from "../music/wigglewoo-main-theme.mp3";

const VOLUME = 0.30;
const CROSSFADE_MS = 600;
const FADE_TICK_MS = 30;

// Discovery room env ID → theme URL. Keys must match the values in
// QUEST_ENVIRONMENT_MAP (src/game/exploreData.ts) — those are what
// handleExplore() actually receives. null means "no dedicated theme
// yet — fall back to the main theme." Files live in /public/assets/audio/.
const DISCOVERY_THEMES: Record<string, string | null> = {
  "valcano": "/assets/audio/volcano-theme.mp3",
  "castle-island": "/assets/audio/castle-theme.mp3",
  "small-coastal-village": "/assets/audio/coral-theme.mp3",
  "glass-dome": "/assets/audio/greenhouse-theme.mp3",
  "industrial-tech-city": null,
};

const TROPHY_ROOM_THEME = "/assets/audio/trophy-room-theme.mp3";

class BackgroundMusicManager {
  private static instance: BackgroundMusicManager | null = null;

  // Two audio elements so we can crossfade between tracks.
  // "active" is whichever one is currently audible; the other
  // is idle until the next switch.
  private audioA: HTMLAudioElement | null = null;
  private audioB: HTMLAudioElement | null = null;
  private active: "a" | "b" = "a";

  private isInitialized = false;
  private userHasInteracted = false;
  private pendingPlay = false;
  private userMuted = false;

  // Track of what should be playing — used so unmute/resume restores
  // the correct theme rather than always reverting to main.
  private currentSrc: string = mainThemeFile;

  private fadeIntervalId: number | null = null;

  private constructor() {}

  static getInstance(): BackgroundMusicManager {
    if (!BackgroundMusicManager.instance) {
      BackgroundMusicManager.instance = new BackgroundMusicManager();
    }
    return BackgroundMusicManager.instance;
  }

  init(): void {
    if (this.isInitialized) return;

    this.audioA = this.makeElement(mainThemeFile);
    this.audioB = this.makeElement(""); // empty until first room switch

    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    const interactionEvents = ["click", "touchstart", "keydown"];
    const handleFirstInteraction = () => {
      this.userHasInteracted = true;
      if (this.pendingPlay) this.play();
      interactionEvents.forEach((event) => {
        document.removeEventListener(event, handleFirstInteraction);
      });
    };
    interactionEvents.forEach((event) => {
      document.addEventListener(event, handleFirstInteraction, { once: false });
    });

    this.isInitialized = true;
  }

  private makeElement(src: string): HTMLAudioElement {
    const el = new Audio(src || undefined);
    el.loop = true;
    el.volume = 0;
    el.preload = src ? "auto" : "none";
    return el;
  }

  private getActive(): HTMLAudioElement | null {
    return this.active === "a" ? this.audioA : this.audioB;
  }

  private getIdle(): HTMLAudioElement | null {
    return this.active === "a" ? this.audioB : this.audioA;
  }

  /**
   * Play the currently-intended track. If no user interaction yet,
   * queues until the first click/touch.
   */
  play(): void {
    if (!this.isInitialized) this.init();
    if (this.userMuted) return;

    if (!this.userHasInteracted) {
      this.pendingPlay = true;
      return;
    }

    const active = this.getActive();
    if (!active) return;

    if (!this.srcMatches(active, this.currentSrc)) {
      active.src = this.currentSrc;
    }

    if (active.paused) {
      active.volume = VOLUME;
      active.play().catch(() => { this.pendingPlay = true; });
    }
  }

  pause(): void {
    const active = this.getActive();
    if (active && !active.paused) active.pause();
  }

  mute(): void {
    this.userMuted = true;
    this.pause();
    const idle = this.getIdle();
    if (idle && !idle.paused) idle.pause();
    this.cancelFade();
  }

  unmute(): void {
    this.userMuted = false;
    this.play();
  }

  resume(): void {
    if (this.userMuted) return;
    this.play();
  }

  stop(): void {
    if (this.audioA) { this.audioA.pause(); this.audioA.currentTime = 0; }
    if (this.audioB) { this.audioB.pause(); this.audioB.currentTime = 0; }
    this.cancelFade();
  }

  setVolume(_v: number): void {
    // Reserved — VOLUME is a fixed mix level. Kept for API compatibility.
  }

  getVolume(): number {
    return VOLUME;
  }

  isPlaying(): boolean {
    const active = this.getActive();
    return active ? !active.paused : false;
  }

  // =============================================
  // Per-room theme switching
  // =============================================

  /**
   * Crossfade to the theme for a discovery room. Unknown or null-mapped
   * IDs (e.g. geartown until its theme arrives) fall back to the main theme.
   */
  playDiscoveryTheme(envId: string): void {
    const themeSrc = DISCOVERY_THEMES[envId];
    if (themeSrc) {
      this.crossfadeTo(themeSrc);
    } else {
      this.restoreMainTheme();
    }
  }

  /** Crossfade to the trophy ceremony theme. */
  playTrophyTheme(): void {
    this.crossfadeTo(TROPHY_ROOM_THEME);
  }

  /** Crossfade back to the main theme. */
  restoreMainTheme(): void {
    this.crossfadeTo(mainThemeFile);
  }

  private crossfadeTo(newSrc: string): void {
    if (!this.isInitialized) this.init();

    // No-op if we're already playing this exact track.
    const active = this.getActive();
    if (active && this.srcMatches(active, newSrc) && !active.paused) {
      this.currentSrc = newSrc;
      return;
    }

    this.currentSrc = newSrc;

    // If muted or no user interaction yet, just remember the intent —
    // play() will pick it up later.
    if (this.userMuted) return;
    if (!this.userHasInteracted) {
      this.pendingPlay = true;
      // Pre-load the new src on the active element so first play works.
      if (active) active.src = newSrc;
      return;
    }

    const idle = this.getIdle();
    if (!active || !idle) return;

    this.cancelFade();

    idle.src = newSrc;
    idle.currentTime = 0;
    idle.volume = 0;
    const playPromise = idle.play().catch(() => null);

    const startTime = Date.now();
    const startActiveVol = active.volume;

    this.fadeIntervalId = window.setInterval(() => {
      const t = Math.min((Date.now() - startTime) / CROSSFADE_MS, 1);
      active.volume = startActiveVol * (1 - t);
      idle.volume = VOLUME * t;

      if (t >= 1) {
        this.cancelFade();
        active.pause();
        active.currentTime = 0;
        this.active = this.active === "a" ? "b" : "a";
        // If autoplay was blocked, surface it for a future interaction.
        if (playPromise === null) this.pendingPlay = true;
      }
    }, FADE_TICK_MS);
  }

  private cancelFade(): void {
    if (this.fadeIntervalId !== null) {
      clearInterval(this.fadeIntervalId);
      this.fadeIntervalId = null;
    }
  }

  // Audio.src returns the resolved URL, so endsWith comparison is safer
  // than equality across bundled-asset and static-path differences.
  private srcMatches(el: HTMLAudioElement, src: string): boolean {
    if (!el.src) return false;
    if (el.src === src) return true;
    if (src.startsWith("/")) return el.src.endsWith(src);
    // Bundled asset: Vite gives a hashed URL — compare the basename.
    const basename = src.split("/").pop() || src;
    return el.src.includes(basename);
  }

  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      const active = this.getActive();
      if (active && !active.paused) active.pause();
    } else {
      if (!this.userMuted && this.userHasInteracted) {
        const active = this.getActive();
        if (active && active.paused) active.play().catch(() => {});
      }
    }
  };

  destroy(): void {
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    this.stop();
    this.audioA = null;
    this.audioB = null;
    this.isInitialized = false;
    BackgroundMusicManager.instance = null;
  }
}

export const backgroundMusic = BackgroundMusicManager.getInstance();
export default backgroundMusic;
