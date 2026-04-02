// =============================================
// learningAnalytics.ts — Local learning analytics
// WiggleWoo's Word Quest
// =============================================
// Tracks per-word mastery, vowel progress, and overall
// performance. All data stored in localStorage, structured
// for future backend sync.
// =============================================

import { countEarnedTrophies } from "./progression";

const ANALYTICS_KEY = "ww_learning_analytics";

// ---- Mastery Levels ----
export type MasteryLevel = "not-seen" | "mastered" | "learning" | "practicing" | "needs-support";

export function getMasteryLevel(incorrectAttempts: number, completed: boolean): MasteryLevel {
  if (!completed) return "not-seen";
  if (incorrectAttempts === 0) return "mastered";
  if (incorrectAttempts === 1) return "learning";
  if (incorrectAttempts <= 3) return "practicing";
  return "needs-support";
}

// ---- Per-Word Data ----
export interface WordAnalytics {
  word: string;
  questId: string;
  vowelGroup: string;           // "shortA", "shortE", etc.
  incorrectAttempts: number;    // wrong letter drops
  completed: boolean;
  firstTry: boolean;            // completed with 0 incorrect
  completedAt: number | null;   // timestamp
  timeSpentMs: number;
}

// ---- Vowel Group Summary ----
export interface VowelSummary {
  vowelGroup: string;
  label: string;                // "Short A"
  totalWords: number;
  wordsSeen: number;
  wordsMastered: number;
  wordsLearning: number;
  wordsPracticing: number;
  wordsNeedSupport: number;
  accuracy: number;             // 0-100
  avgAttempts: number;
}

// ---- Overall Summary ----
export interface OverallSummary {
  totalWords: number;
  totalSeen: number;
  totalMastered: number;
  accuracy: number;             // 0-100
  avgAttempts: number;
  longestStreak: number;
  currentStreak: number;
  questsCompleted: number;
  nodesCompleted: number;
  vowelSummaries: VowelSummary[];
}

// ---- Storage ----
interface AnalyticsStore {
  words: Record<string, WordAnalytics>;
  streaks: {
    current: number;
    longest: number;
  };
  version: number;
}

function loadStore(): AnalyticsStore {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { words: {}, streaks: { current: 0, longest: 0 }, version: 1 };
}

function saveStore(store: AnalyticsStore): void {
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(store));
}

// ---- Public API ----

/** Record a word completion with its incorrect attempt count */
export function recordWordCompletion(
  word: string,
  questId: string,
  vowelGroup: string,
  incorrectAttempts: number,
  timeSpentMs: number,
): void {
  const store = loadStore();
  const key = `${questId}:${word}`;
  const existing = store.words[key];

  // Only update if this is first completion or fewer attempts
  if (!existing || !existing.completed) {
    store.words[key] = {
      word,
      questId,
      vowelGroup,
      incorrectAttempts,
      completed: true,
      firstTry: incorrectAttempts === 0,
      completedAt: Date.now(),
      timeSpentMs,
    };
  } else if (incorrectAttempts < existing.incorrectAttempts) {
    // Player improved — update mastery
    store.words[key] = {
      ...existing,
      incorrectAttempts,
      firstTry: incorrectAttempts === 0,
      completedAt: Date.now(),
      timeSpentMs,
    };
  }

  // Update streak
  if (incorrectAttempts === 0) {
    store.streaks.current++;
    if (store.streaks.current > store.streaks.longest) {
      store.streaks.longest = store.streaks.current;
    }
  } else {
    store.streaks.current = 0;
  }

  saveStore(store);
}

/** Record an incorrect letter drop (called during gameplay) */
export function recordIncorrectDrop(word: string, questId: string, vowelGroup: string): void {
  const store = loadStore();
  const key = `${questId}:${word}`;
  const existing = store.words[key];

  if (!existing) {
    store.words[key] = {
      word,
      questId,
      vowelGroup,
      incorrectAttempts: 1,
      completed: false,
      firstTry: false,
      completedAt: null,
      timeSpentMs: 0,
    };
  } else if (!existing.completed) {
    existing.incorrectAttempts++;
    existing.firstTry = false;
  }

  saveStore(store);
}

/** Get analytics for a specific word */
export function getWordAnalytics(questId: string, word: string): WordAnalytics | null {
  const store = loadStore();
  return store.words[`${questId}:${word}`] ?? null;
}

/** Get vowel group summary */
export function getVowelSummary(vowelGroup: string, label: string, totalWords: number): VowelSummary {
  const store = loadStore();

  let seen = 0;
  let mastered = 0;
  let learning = 0;
  let practicing = 0;
  let needsSupport = 0;
  let totalIncorrect = 0;
  let totalCompleted = 0;

  for (const wa of Object.values(store.words)) {
    if (wa.vowelGroup !== vowelGroup) continue;
    if (!wa.completed) continue;
    seen++;
    totalCompleted++;
    totalIncorrect += wa.incorrectAttempts;

    const level = getMasteryLevel(wa.incorrectAttempts, wa.completed);
    if (level === "mastered") mastered++;
    else if (level === "learning") learning++;
    else if (level === "practicing") practicing++;
    else if (level === "needs-support") needsSupport++;
  }

  const totalAttempts = totalCompleted + totalIncorrect;
  const accuracy = totalAttempts > 0 ? Math.round((totalCompleted / totalAttempts) * 100) : 0;
  const avgAttempts = totalCompleted > 0 ? Math.round((totalIncorrect / totalCompleted) * 10) / 10 : 0;

  return {
    vowelGroup,
    label,
    totalWords,
    wordsSeen: seen,
    wordsMastered: mastered,
    wordsLearning: learning,
    wordsPracticing: practicing,
    wordsNeedSupport: needsSupport,
    accuracy,
    avgAttempts,
  };
}

/** Get overall summary across all quests */
export function getOverallSummary(): OverallSummary {
  const store = loadStore();

  const VOWEL_GROUPS = [
    { group: "shortA", label: "Short A", total: 16 },
    { group: "shortE", label: "Short E", total: 16 },
    { group: "shortI", label: "Short I", total: 16 },
    { group: "shortO", label: "Short O", total: 16 },
    { group: "shortU", label: "Short U", total: 16 },
  ];

  const vowelSummaries = VOWEL_GROUPS.map(v => getVowelSummary(v.group, v.label, v.total));

  let totalSeen = 0;
  let totalMastered = 0;
  let totalIncorrect = 0;
  let totalCompleted = 0;

  for (const wa of Object.values(store.words)) {
    if (!wa.completed) continue;
    totalSeen++;
    totalCompleted++;
    totalIncorrect += wa.incorrectAttempts;
    if (wa.incorrectAttempts === 0) totalMastered++;
  }

  const totalAttempts = totalCompleted + totalIncorrect;
  const accuracy = totalAttempts > 0 ? Math.round((totalCompleted / totalAttempts) * 100) : 0;
  const avgAttempts = totalCompleted > 0 ? Math.round((totalIncorrect / totalCompleted) * 10) / 10 : 0;

  const questsCompleted = countEarnedTrophies();

  return {
    totalWords: 80,
    totalSeen,
    totalMastered,
    accuracy,
    avgAttempts,
    longestStreak: store.streaks.longest,
    currentStreak: store.streaks.current,
    questsCompleted,
    nodesCompleted: totalSeen,
    vowelSummaries,
  };
}

/** Reset all analytics data */
export function resetAnalytics(): void {
  localStorage.removeItem(ANALYTICS_KEY);
}
