// =============================================
// placementTest.ts — Placement test data, scoring,
// and persistence for WiggleWoo's Word Quest
// =============================================
// v1 (CVC-only): 4 CVC words. Score determines
// starting node inside quest-short-a. Every result
// is placed into the CVC tier — higher tiers are
// not shipped yet.
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

// v1 = a single 4-word CVC tier. QUESTIONS_PER_TIER matches total
// so the mid-test tier-check only fires at the final question.
export const QUESTIONS_PER_TIER = 4;
export const PASS_THRESHOLD = 1;
export const MAX_ATTEMPTS = 2;   // wrong taps before auto-skip

// ---- Test word set (2 per tier, 10 total) ----

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

// v1 — 4 CVC words spanning short A / O / I / U.
// All images confirmed present under public/assets/words/.
export const PLACEMENT_WORDS: PlacementWord[] = [
  { word: "cat", letters: ["c", "a", "t"], distractors: ["d"], imageKey: "cat", tier: "cvc" },
  { word: "dog", letters: ["d", "o", "g"], distractors: ["p"], imageKey: "dog", tier: "cvc" },
  { word: "pig", letters: ["p", "i", "g"], distractors: ["b"], imageKey: "pig", tier: "cvc" },
  { word: "sun", letters: ["s", "u", "n"], distractors: ["m"], imageKey: "sun", tier: "cvc" },
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

/**
 * v1 scoring — every placement result is CVC. The correct-count maps
 * to a starting node inside quest-short-a so strong readers skip the
 * easiest nodes but still see every later-node gameplay feature.
 *
 *   4/4 correct → node 4 (strong)
 *   3/4 correct → node 2 (warming up)
 *   0-2/4       → node 0 (start at the very beginning)
 */
export function scorePlacement(results: WordResult[]): PlacementResult {
  const correctCount = results.filter((r) => r.correct).length;
  const totalCount = results.length;

  let startingNode: number;
  let level: PlacementLevel;
  if (correctCount >= 4) {
    startingNode = 4;
    level = "early-reader";
  } else if (correctCount >= 3) {
    startingNode = 2;
    level = "early-reader";
  } else {
    startingNode = 0;
    level = "beginner";
  }

  const tierSummary: TierSummary = {
    tier: "CVC",
    correctCount,
    totalCount,
    passed: correctCount >= PASS_THRESHOLD,
    failedWords: results.filter((r) => !r.correct).map((r) => r.word),
    autoSkippedWords: results
      .filter((r) => !r.correct && r.attempts >= MAX_ATTEMPTS)
      .map((r) => r.word),
  };

  return {
    level,
    assignedTier: "CVC",
    startingNode,
    unlockedTiers: ["CVC"],
    wordResults: results,
    tierSummaries: [tierSummary],
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
