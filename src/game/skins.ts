// =============================================
// skins.ts — WiggleWoo skin/costume system
// Wigglewoo CVC Quest
// =============================================
// Manages:
//   - Skin registry (environment → skin mapping)
//   - Unlocked skins (localStorage persistence)
//   - Active skin selection
//   - Asset path resolution for map + game screen
// =============================================

const SKINS_KEY = "wigglewoo-skins";
const ACTIVE_SKIN_KEY = "wigglewoo-active-skin";

export const DEFAULT_SKIN_ID = "default";

/** Metadata for a single WiggleWoo skin */
export interface SkinDef {
  skinId: string;
  environmentId: string;
  questId: string;
  label: string;
  /** Path to the hero image (used on quest map) */
  heroImgPath: string;
  /** Path to the helper image (used on game screen) */
  helperImgPath: string;
  /** Thumbnail for wardrobe display */
  thumbnailPath: string;
}

/**
 * Skin registry — one skin per discovery room.
 * Paths are public asset paths (served from /public/).
 */
export const SKIN_REGISTRY: SkinDef[] = [
  {
    skinId: "volcano",
    environmentId: "valcano",
    questId: "quest-short-a",
    label: "Volcano WiggleWoo",
    heroImgPath: "/assets/discovery rooms/rumble-peak-volcano/wigglewoo-volcano.png",
    helperImgPath: "/assets/discovery rooms/rumble-peak-volcano/wigglewoo-volcano.png",
    thumbnailPath: "/assets/discovery rooms/rumble-peak-volcano/wigglewoo-volcano.png",
  },
  {
    skinId: "stonewall",
    environmentId: "castle-island",
    questId: "quest-short-i",
    label: "Castle WiggleWoo",
    heroImgPath: "/assets/discovery rooms/stonewall-castle/wigglewoo-stonewall.png",
    helperImgPath: "/assets/discovery rooms/stonewall-castle/wigglewoo-stonewall.png",
    thumbnailPath: "/assets/discovery rooms/stonewall-castle/wigglewoo-stonewall.png",
  },
  {
    skinId: "coral-cove",
    environmentId: "small-coastal-village",
    questId: "quest-short-o",
    label: "Coral Cove WiggleWoo",
    heroImgPath: "/assets/discovery rooms/coral-cove-village/wigglewoo-coral-cove.png",
    helperImgPath: "/assets/discovery rooms/coral-cove-village/wigglewoo-coral-cove.png",
    thumbnailPath: "/assets/discovery rooms/coral-cove-village/wigglewoo-coral-cove.png",
  },
  {
    skinId: "geartown",
    environmentId: "industrial-tech-city",
    questId: "quest-short-u",
    label: "Geartown WiggleWoo",
    heroImgPath: "/assets/discovery rooms/geartown-workshop/wigglewoo-geartown.png",
    helperImgPath: "/assets/discovery rooms/geartown-workshop/wigglewoo-geartown.png",
    thumbnailPath: "/assets/discovery rooms/geartown-workshop/wigglewoo-geartown.png",
  },
  {
    skinId: "greenhouse",
    environmentId: "glass-dome",
    questId: "quest-short-e",
    label: "Greenhouse WiggleWoo",
    heroImgPath: "/assets/discovery rooms/greenhouse-domes/wigglewoo-greenhouse.png",
    helperImgPath: "/assets/discovery rooms/greenhouse-domes/wigglewoo-greenhouse.png",
    thumbnailPath: "/assets/discovery rooms/greenhouse-domes/wigglewoo-greenhouse.png",
  },
];

// ---- Persistence ----

function loadUnlockedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(SKINS_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* corrupted */ }
  return new Set();
}

function saveUnlockedSet(set: Set<string>): void {
  try {
    localStorage.setItem(SKINS_KEY, JSON.stringify([...set]));
  } catch { /* fail silently */ }
}

/** Get all unlocked skin IDs */
export function loadUnlockedSkins(): string[] {
  return [...loadUnlockedSet()];
}

/** Check if a specific skin is unlocked */
export function isSkinUnlocked(skinId: string): boolean {
  if (skinId === DEFAULT_SKIN_ID) return true;
  return loadUnlockedSet().has(skinId);
}

/** Unlock a skin by ID */
export function unlockSkin(skinId: string): void {
  const set = loadUnlockedSet();
  set.add(skinId);
  saveUnlockedSet(set);
}

/** Get the currently active skin ID */
export function getActiveSkinId(): string {
  try {
    const raw = localStorage.getItem(ACTIVE_SKIN_KEY);
    if (raw) return raw;
  } catch { /* corrupted */ }
  return DEFAULT_SKIN_ID;
}

/** Set the active skin */
export function setActiveSkin(skinId: string): void {
  try {
    localStorage.setItem(ACTIVE_SKIN_KEY, skinId);
  } catch { /* fail silently */ }
}

// ---- Asset resolution ----

/** Default asset paths (bundled imports — resolved at call site) */
let defaultHeroImg = "";
let defaultHelperImg = "";

/** Initialize default skin paths (called once from App with bundled imports) */
export function initDefaultSkinPaths(heroImg: string, helperImg: string): void {
  defaultHeroImg = heroImg;
  defaultHelperImg = helperImg;
}

/** Get the image paths for the currently active skin */
export function getActiveSkinAssets(): { heroImg: string; helperImg: string } {
  const skinId = getActiveSkinId();
  if (skinId === DEFAULT_SKIN_ID) {
    return { heroImg: defaultHeroImg, helperImg: defaultHelperImg };
  }
  const def = SKIN_REGISTRY.find((s) => s.skinId === skinId);
  if (def) {
    return { heroImg: def.heroImgPath, helperImg: def.helperImgPath };
  }
  // Fallback to default if skin not found
  return { heroImg: defaultHeroImg, helperImg: defaultHelperImg };
}

// ---- Skin unlock from discovery room ----

/**
 * Unlock the skin associated with a discovery room environment.
 * Returns the skinId if found, or null.
 */
export function unlockSkinForEnvironment(envId: string): string | null {
  const def = SKIN_REGISTRY.find((s) => s.environmentId === envId);
  if (!def) return null;
  unlockSkin(def.skinId);
  return def.skinId;
}

/** Look up a skin definition by environment ID */
export function getSkinForEnvironment(envId: string): SkinDef | undefined {
  return SKIN_REGISTRY.find((s) => s.environmentId === envId);
}
