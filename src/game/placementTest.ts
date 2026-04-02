// =============================================
// placementTest.ts — Placement test data, scoring,
// and persistence for WiggleWoo's Word Quest
// =============================================
// 5-tier placement: 3 words per tier, 15 total.
// Pass = 2/3 correct. Fail = stop and place here.
// Tier sequence: CVC → Blending → Magic E → Vowel Teams → Advanced
// =============================================

// ---- Tier definitions (scalable) ----

export const PLACEMENT_TIERS = [
  "CVC",
  "CVCC",
  "MAGIC_E",
  "CVVC",
  "ADVANCED",
] as const;

export type PlacementTier = typeof PLACEMENT_TIERS[number];

/** Map placement tier → default quest ID for that tier */
export const TIER_DEFAULT_QUEST: Record<PlacementTier, string> = {
  CVC: "quest-short-a",
  CVCC: "quest-cvcc-short-a",
  MAGIC_E: "quest-magic-e-a",
  CVVC: "quest-cvvc-long-a",
  ADVANCED: "quest-adv-ar-or",
};

// ---- Constants ----

export const QUESTIONS_PER_TIER = 3;
export const PASS_THRESHOLD = 2; // must get ≥2 of 3 correct to pass
export const MAX_ATTEMPTS = 3;   // wrong taps before auto-skip

// ---- Test word set (3 per tier, 15 total) ----

export type WordTier = "cvc" | "blend" | "magic-e" | "vowel-team" | "advanced";

export interface PlacementWord {
  word: string;
  letters: string[];
  distractors: string[];
  imageKey: string;
  tier: WordTier;
}

/** Map word tier → placement tier */
/** Map word tier → placement tier */
export const WORD_TIER_TO_PLACEMENT: Record<WordTier, PlacementTier> = {
  "cvc": "CVC",
  "blend": "CVCC",
  "magic-e": "MAGIC_E",
  "vowel-team": "CVVC",
  "advanced": "ADVANCED",
};

// 15 placement words: 3 per tier (in progression order)
export const PLACEMENT_WORDS: PlacementWord[] = [
  // Tier 1: CVC (3 words)
  { word: "cat", letters: ["c", "a", "t"], distractors: ["d", "r"], imageKey: "cat", tier: "cvc" },
  { word: "dog", letters: ["d", "o", "g"], distractors: ["p", "b"], imageKey: "dog", tier: "cvc" },
  { word: "map", letters: ["m", "a", "p"], distractors: ["t", "n"], imageKey: "map", tier: "cvc" },

  // Tier 2: Blending Power (3 words)
  { word: "hand", letters: ["h", "a", "n", "d"], distractors: ["t", "r"], imageKey: "hand", tier: "blend" },
  { word: "stop", letters: ["s", "t", "o", "p"], distractors: ["l", "a"], imageKey: "stop", tier: "blend" },
  { word: "flag", letters: ["f", "l", "a", "g"], distractors: ["r", "n"], imageKey: "flag", tier: "blend" },

  // Tier 3: Magic E (3 words)
  { word: "cape", letters: ["c", "a", "p", "e"], distractors: ["t", "i"], imageKey: "cape", tier: "magic-e" },
  { word: "kite", letters: ["k", "i", "t", "e"], distractors: ["n", "o"], imageKey: "kite", tier: "magic-e" },
  { word: "cone", letters: ["c", "o", "n", "e"], distractors: ["t", "a"], imageKey: "cone", tier: "magic-e" },

  // Tier 4: Vowel Teams (3 words)
  { word: "boat", letters: ["b", "o", "a", "t"], distractors: ["r", "e"], imageKey: "boat", tier: "vowel-team" },
  { word: "rain", letters: ["r", "a", "i", "n"], distractors: ["s", "o"], imageKey: "rain", tier: "vowel-team" },
  { word: "team", letters: ["t", "e", "a", "m"], distractors: ["n", "i"], imageKey: "team", tier: "vowel-team" },

  // Tier 5: Advanced (multisyllable + compound)
  { word: "sunset", letters: ["s", "u", "n", "s", "e", "t"], distractors: ["r", "a"], imageKey: "sunset", tier: "advanced" },
  { word: "basket", letters: ["b", "a", "s", "k", "e", "t"], distractors: ["r", "n"], imageKey: "basket", tier: "advanced" },
  { word: "cupcake", letters: ["c", "u", "p", "c", "a", "k", "e"], distractors: ["t", "n"], imageKey: "cupcake", tier: "advanced" },
];

// ---- Scoring ----

export interface WordResult {
  word: string;
  tier: WordTier;
  attempts: number;
  correct: boolean;
}

export type PlacementLevel = "beginner" | "early-reader" | "blender" | "magic-e-reader" | "intermediate" | "advanced";

/** Per-tier breakdown for analytics/debugging */
export interface TierSummary {
  tier: PlacementTier;
  correctCount: number;
  totalCount: number;
  passed: boolean;
  failedWords: string[];
  autoSkippedWords: string[];
}

export interface PlacementResult {
  level: PlacementLevel;
  assignedTier: PlacementTier;
  startingNode: number;
  unlockedTiers: PlacementTier[];
  wordResults: WordResult[];
  tierSummaries: TierSummary[];
  completedAt: number;
}

/** Did the student pass a tier? (≥2 of 3 correct) */
function didPassTier(results: WordResult[]): boolean {
  const correct = results.filter((r) => r.correct).length;
  return correct >= PASS_THRESHOLD;
}

/**
 * Score placement: evaluate tiers in order, stop at first failure.
 *
 * Pass tier → skip it → test next tier
 * Fail tier → place student HERE
 * Pass all → place into Advanced mid-quest
 */
export function scorePlacement(results: WordResult[]): PlacementResult {
  const tierOrder: WordTier[] = ["cvc", "blend", "magic-e", "vowel-team", "advanced"];

  // Group results by tier
  const resultsByTier: Record<WordTier, WordResult[]> = {
    "cvc": [],
    "blend": [],
    "magic-e": [],
    "vowel-team": [],
    "advanced": [],
  };
  for (const r of results) {
    resultsByTier[r.tier].push(r);
  }

  // Walk tiers in order — stop at first failure
  let failedTierIndex = -1;
  for (let i = 0; i < tierOrder.length; i++) {
    const tierResults = resultsByTier[tierOrder[i]];
    if (tierResults.length === 0 || !didPassTier(tierResults)) {
      failedTierIndex = i;
      break;
    }
  }

  // If no failure found, student passed everything
  const passedAll = failedTierIndex === -1;
  const placementIndex = passedAll ? tierOrder.length - 1 : failedTierIndex;
  const assignedTier = PLACEMENT_TIERS[placementIndex];

  // Unlock all tiers up to and including the assigned one
  const unlockedTiers = [...PLACEMENT_TIERS.slice(0, placementIndex + 1)];

  // Starting node: mid-quest if passed all, otherwise node 0
  const startingNode = passedAll ? 4 : 0;

  // Readable level label
  const levelLabels: PlacementLevel[] = [
    "beginner",       // CVC
    "early-reader",   // Blending Power
    "blender",        // Magic E
    "magic-e-reader", // Vowel Teams
    "intermediate",   // Advanced
  ];
  const level: PlacementLevel = passedAll
    ? "advanced"
    : levelLabels[placementIndex];

  // Build per-tier summaries for analytics/debugging
  const tierSummaries: TierSummary[] = tierOrder.map((wt, i) => {
    const tierResults = resultsByTier[wt];
    const correctCount = tierResults.filter((r) => r.correct).length;
    return {
      tier: PLACEMENT_TIERS[i],
      correctCount,
      totalCount: tierResults.length,
      passed: tierResults.length > 0 && correctCount >= PASS_THRESHOLD,
      failedWords: tierResults.filter((r) => !r.correct).map((r) => r.word),
      autoSkippedWords: tierResults.filter((r) => !r.correct && r.attempts >= MAX_ATTEMPTS).map((r) => r.word),
    };
  });

  return {
    level,
    assignedTier,
    startingNode,
    unlockedTiers,
    wordResults: results,
    tierSummaries,
    completedAt: Date.now(),
  };
}

// ---- Persistence ----

const STORAGE_KEY = "ww_placement";

export function savePlacementResult(result: PlacementResult): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
}

export function loadPlacementResult(): PlacementResult | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PlacementResult;
  } catch {
    return null;
  }
}

export function isPlacementComplete(): boolean {
  return loadPlacementResult() !== null;
}

export function resetPlacement(): void {
  localStorage.removeItem(STORAGE_KEY);
}
