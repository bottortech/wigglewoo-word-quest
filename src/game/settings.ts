// =============================================
// settings.ts — Local accessibility & app settings
// WiggleWoo's Word Quest
// =============================================
// All settings stored in localStorage. Structured
// for future backend sync.
// =============================================

const SETTINGS_KEY = "ww_settings";

export interface AppSettings {
  dyslexiaFont: boolean;
  slowPhoneme: boolean;
  colorBlindMode: boolean;
  reducedMotion: boolean;
  factNarration: boolean;       // auto-play narration on fact panel open
  factNarrationAutoPlay: boolean;
  backgroundMusic: boolean;     // background music on/off
  version: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  dyslexiaFont: false,
  slowPhoneme: false,
  colorBlindMode: false,
  reducedMotion: false,
  factNarration: true,
  factNarrationAutoPlay: false,
  backgroundMusic: true,
  version: 1,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): AppSettings {
  const settings = loadSettings();
  settings[key] = value;
  saveSettings(settings);
  return settings;
}

/** Apply accessibility CSS classes to document root */
export function applySettingsToDOM(settings: AppSettings): void {
  const root = document.documentElement;

  root.classList.toggle("dyslexia-font", settings.dyslexiaFont);
  root.classList.toggle("color-blind-mode", settings.colorBlindMode);
  root.classList.toggle("slow-phoneme", settings.slowPhoneme);
  root.classList.toggle("reduced-motion", settings.reducedMotion);
}
