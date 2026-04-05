// =============================================
// wordData.ts — CVC word definitions & quests
// Wigglewoo CVC Quest
// =============================================
// CVC quest data lives here (always in main bundle).
// CVCC/CVVC data is lazy-loaded from separate chunks.
// =============================================
// Letter bank rules:
//   Early levels (words 1-4): 3 correct letters only
//   Later levels (words 5-6): +1 distractor
//   Final levels (words 7-8): +2 distractors
// =============================================

import type { Quest, LetterCategory } from "./types";
import { ALL_QUEST_IDS } from "./questIds";

/** Classify a letter */
export function getLetterCategory(letter: string): LetterCategory {
  return "aeiou".includes(letter.toLowerCase()) ? "vowel" : "consonant";
}

/** Sample Quest 1 — short-a words (16 words for nodes 1-16) */
export const QUEST_SHORT_A: Quest = {
  id: "quest-short-a",
  title: "Short A Words",
  patternType: "cvc",
  words: [
    // Nodes 1-4: no distractors
    { word: "cat", imageKey: "cat", letters: ["c", "a", "t"], distractors: [], mode: "image" },
    { word: "hat", imageKey: "hat", letters: ["h", "a", "t"], distractors: [], mode: "image" },
    { word: "map", imageKey: "map", letters: ["m", "a", "p"], distractors: [], mode: "image" },
    { word: "fan", imageKey: "fan", letters: ["f", "a", "n"], distractors: [], mode: "image" },
    // Nodes 5-6: +1 distractor
    { word: "bag", imageKey: "bag", letters: ["b", "a", "g"], distractors: ["s"], mode: "image" },
    { word: "bat", imageKey: "bat", letters: ["b", "a", "t"], distractors: ["n"], mode: "image" },
    // Nodes 7-8: +2 distractors
    { word: "cap", imageKey: "cap", letters: ["c", "a", "p"], distractors: ["n", "o"], mode: "image" },
    { word: "van", imageKey: "van", letters: ["v", "a", "n"], distractors: ["g", "o"], mode: "image" },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "ham", imageKey: "ham", letters: ["h", "a", "m"], distractors: [], mode: "image" },
    { word: "cab", imageKey: "cab", letters: ["c", "a", "b"], distractors: [], mode: "image" },
    { word: "rat", imageKey: "rat", letters: ["r", "a", "t"], distractors: [], mode: "image" },
    { word: "pan", imageKey: "pan", letters: ["p", "a", "n"], distractors: [], mode: "image" },
    // Nodes 13-14: +1 distractor
    { word: "can", imageKey: "can", letters: ["c", "a", "n"], distractors: ["t"], mode: "image" },
    { word: "nap", imageKey: "nap", letters: ["n", "a", "p"], distractors: ["d"], mode: "image" },
    // Nodes 15-16: +2 distractors
    { word: "tag", imageKey: "tag", letters: ["t", "a", "g"], distractors: ["p", "u"], mode: "image" },
    { word: "sad", imageKey: "sad", letters: ["s", "a", "d"], distractors: ["m", "e"], mode: "image" },
  ],
};

/** Quest 2 — short-i words (16 words for nodes 1-16) */
export const QUEST_SHORT_I: Quest = {
  id: "quest-short-i",
  title: "Short I Words",
  patternType: "cvc",
  words: [
    // Nodes 1-4: no distractors
    { word: "pig", imageKey: "pig", letters: ["p", "i", "g"], distractors: [], mode: "image" },
    { word: "pin", imageKey: "pin", letters: ["p", "i", "n"], distractors: [], mode: "image" },
    { word: "dig", imageKey: "dig", letters: ["d", "i", "g"], distractors: [], mode: "image" },
    { word: "sit", imageKey: "sit", letters: ["s", "i", "t"], distractors: [], mode: "image" },
    // Nodes 5-6: +1 distractor
    { word: "lid", imageKey: "lid", letters: ["l", "i", "d"], distractors: ["n"], mode: "image" },
    { word: "wig", imageKey: "wig", letters: ["w", "i", "g"], distractors: ["b"], mode: "image" },
    // Nodes 7-8: +2 distractors
    { word: "rip", imageKey: "rip", letters: ["r", "i", "p"], distractors: ["n", "a"], mode: "image" },
    { word: "mix", imageKey: "mix", letters: ["m", "i", "x"], distractors: ["t", "a"], mode: "image" },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "zip", imageKey: "zip", letters: ["z", "i", "p"], distractors: [], mode: "image" },
    { word: "bib", imageKey: "bib", letters: ["b", "i", "b"], distractors: [], mode: "image" },
    { word: "kit", imageKey: "kit", letters: ["k", "i", "t"], distractors: [], mode: "image" },
    { word: "hit", imageKey: "hit", letters: ["h", "i", "t"], distractors: [], mode: "image" },
    // Nodes 13-14: +1 distractor
    { word: "dip", imageKey: "dip", letters: ["d", "i", "p"], distractors: ["s"], mode: "image" },
    { word: "win", imageKey: "win", letters: ["w", "i", "n"], distractors: ["b"], mode: "image" },
    // Nodes 15-16: +2 distractors
    { word: "fin", imageKey: "fin", letters: ["f", "i", "n"], distractors: ["g", "o"], mode: "image" },
    { word: "sip", imageKey: "sip", letters: ["s", "i", "p"], distractors: ["m", "a"], mode: "image" },
  ],
};

/** Quest 3 — short-o words (16 words for nodes 1-16) */
export const QUEST_SHORT_O: Quest = {
  id: "quest-short-o",
  title: "Short O Words",
  patternType: "cvc",
  words: [
    // Nodes 1-4: no distractors
    { word: "dog", imageKey: "dog", letters: ["d", "o", "g"], distractors: [], mode: "image" },
    { word: "top", imageKey: "top", letters: ["t", "o", "p"], distractors: [], mode: "image" },
    { word: "hop", imageKey: "hop", letters: ["h", "o", "p"], distractors: [], mode: "image" },
    { word: "hot", imageKey: "hot", letters: ["h", "o", "t"], distractors: [], mode: "image" },
    // Nodes 5-6: +1 distractor
    { word: "log", imageKey: "log", letters: ["l", "o", "g"], distractors: ["n"], mode: "image" },
    { word: "pop", imageKey: "pop", letters: ["p", "o", "p"], distractors: ["t"], mode: "image" },
    // Nodes 7-8: +2 distractors
    { word: "box", imageKey: "box", letters: ["b", "o", "x"], distractors: ["n", "a"], mode: "image" },
    { word: "mop", imageKey: "mop", letters: ["m", "o", "p"], distractors: ["t", "a"], mode: "image" },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "cot", imageKey: "cot", letters: ["c", "o", "t"], distractors: [], mode: "image" },
    { word: "fox", imageKey: "fox", letters: ["f", "o", "x"], distractors: [], mode: "image" },
    { word: "cop", imageKey: "cop", letters: ["c", "o", "p"], distractors: [], mode: "image" },
    { word: "dot", imageKey: "dot", letters: ["d", "o", "t"], distractors: [], mode: "image" },
    // Nodes 13-14: +1 distractor
    { word: "jog", imageKey: "jog", letters: ["j", "o", "g"], distractors: ["n"], mode: "image" },
    { word: "rot", imageKey: "rot", letters: ["r", "o", "t"], distractors: ["n"], mode: "image" },
    // Nodes 15-16: +2 distractors
    { word: "pot", imageKey: "pot", letters: ["p", "o", "t"], distractors: ["g", "i"], mode: "image" },
    { word: "sob", imageKey: "sob", letters: ["s", "o", "b"], distractors: ["n", "a"], mode: "image" },
  ],
};

/** Quest 4 — short-u words (16 words for nodes 1-16) */
export const QUEST_SHORT_U: Quest = {
  id: "quest-short-u",
  title: "Short U Words",
  patternType: "cvc",
  words: [
    // Nodes 1-4: no distractors
    { word: "cup", imageKey: "cup", letters: ["c", "u", "p"], distractors: [], mode: "image" },
    { word: "sun", imageKey: "sun", letters: ["s", "u", "n"], distractors: [], mode: "image" },
    { word: "bus", imageKey: "bus", letters: ["b", "u", "s"], distractors: [], mode: "image" },
    { word: "tub", imageKey: "tub", letters: ["t", "u", "b"], distractors: [], mode: "image" },
    // Nodes 5-6: +1 distractor
    { word: "bug", imageKey: "bug", letters: ["b", "u", "g"], distractors: ["n"], mode: "image" },
    { word: "mud", imageKey: "mud", letters: ["m", "u", "d"], distractors: ["n"], mode: "image" },
    // Nodes 7-8: +2 distractors
    { word: "rug", imageKey: "rug", letters: ["r", "u", "g"], distractors: ["n", "e"], mode: "image" },
    { word: "run", imageKey: "run", letters: ["r", "u", "n"], distractors: ["g", "a"], mode: "image" },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "gum", imageKey: "gum", letters: ["g", "u", "m"], distractors: [], mode: "image" },
    { word: "nut", imageKey: "nut", letters: ["n", "u", "t"], distractors: [], mode: "image" },
    { word: "hug", imageKey: "hug", letters: ["h", "u", "g"], distractors: [], mode: "image" },
    { word: "dug", imageKey: "dug", letters: ["d", "u", "g"], distractors: [], mode: "image" },
    // Nodes 13-14: +1 distractor
    { word: "pup", imageKey: "pup", letters: ["p", "u", "p"], distractors: ["n"], mode: "image" },
    { word: "cut", imageKey: "cut", letters: ["c", "u", "t"], distractors: ["n"], mode: "image" },
    // Nodes 15-16: +2 distractors
    { word: "jug", imageKey: "jug", letters: ["j", "u", "g"], distractors: ["n", "a"], mode: "image" },
    { word: "fun", imageKey: "fun", letters: ["f", "u", "n"], distractors: ["t", "o"], mode: "image" },
  ],
};

/** Quest 5 — short-e words (16 words for nodes 1-16) */
export const QUEST_SHORT_E: Quest = {
  id: "quest-short-e",
  title: "Short E Words",
  patternType: "cvc",
  words: [
    // Nodes 1-4: no distractors
    { word: "bed", imageKey: "bed", letters: ["b", "e", "d"], distractors: [], mode: "image" },
    { word: "pen", imageKey: "pen", letters: ["p", "e", "n"], distractors: [], mode: "image" },
    { word: "hen", imageKey: "hen", letters: ["h", "e", "n"], distractors: [], mode: "image" },
    { word: "red", imageKey: "red", letters: ["r", "e", "d"], distractors: [], mode: "image" },
    // Nodes 5-6: +1 distractor
    { word: "jet", imageKey: "jet", letters: ["j", "e", "t"], distractors: ["s"], mode: "image" },
    { word: "net", imageKey: "net", letters: ["n", "e", "t"], distractors: ["g"], mode: "image" },
    // Nodes 7-8: +2 distractors
    { word: "leg", imageKey: "leg", letters: ["l", "e", "g"], distractors: ["m", "o"], mode: "image" },
    { word: "wet", imageKey: "wet", letters: ["w", "e", "t"], distractors: ["p", "i"], mode: "image" },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "pet", imageKey: "pet", letters: ["p", "e", "t"], distractors: [], mode: "image" },
    { word: "ten", imageKey: "ten", letters: ["t", "e", "n"], distractors: [], mode: "image" },
    { word: "web", imageKey: "web", letters: ["w", "e", "b"], distractors: [], mode: "image" },
    { word: "beg", imageKey: "beg", letters: ["b", "e", "g"], distractors: [], mode: "image" },
    // Nodes 13-14: +1 distractor
    { word: "ref", imageKey: "ref", letters: ["r", "e", "f"], distractors: ["m"], mode: "image" },
    { word: "fed", imageKey: "fed", letters: ["f", "e", "d"], distractors: ["n"], mode: "image" },
    // Nodes 15-16: +2 distractors
    { word: "gem", imageKey: "gem", letters: ["g", "e", "m"], distractors: ["t", "a"], mode: "image" },
    { word: "vet", imageKey: "vet", letters: ["v", "e", "t"], distractors: ["p", "u"], mode: "image" },
  ],
};

/** CVC quests (always in main bundle) */
export const CVC_QUESTS: Quest[] = [
  QUEST_SHORT_A,
  QUEST_SHORT_I,
  QUEST_SHORT_O,
  QUEST_SHORT_U,
  QUEST_SHORT_E,
];

// =============================================================
// QUEST REGISTRY — CVC registered at load, others added lazily
// =============================================================

const questRegistry = new Map<string, Quest>();

// Register CVC quests immediately
for (const q of CVC_QUESTS) {
  questRegistry.set(q.id, q);
}

/** Register quests from a lazy-loaded chunk */
export function registerQuests(quests: Quest[]): void {
  for (const q of quests) {
    questRegistry.set(q.id, q);
  }
}

/** Get all currently loaded quests */
export function getLoadedQuests(): Quest[] {
  return Array.from(questRegistry.values());
}

/** Get a quest by ID (returns undefined if chunk not loaded) */
export function getQuestById(id: string): Quest | undefined {
  return questRegistry.get(id);
}

/** Get the next quest in the global sequence (null if at end or chunk not loaded) */
export function getNextQuest(currentQuestId: string): Quest | null {
  const idx = ALL_QUEST_IDS.indexOf(currentQuestId as typeof ALL_QUEST_IDS[number]);
  if (idx < 0 || idx >= ALL_QUEST_IDS.length - 1) return null;
  const nextId = ALL_QUEST_IDS[idx + 1];
  return questRegistry.get(nextId) ?? null;
}

/** Check if all image words are complete across all quests in a list */
export function areAllImageWordsComplete(questIds: readonly string[]): boolean {
  for (const qid of questIds) {
    const quest = questRegistry.get(qid);
    if (!quest) continue;
    const imageCount = quest.words.filter(w => (w.mode ?? "image") === "image").length;
    const progress = JSON.parse(localStorage.getItem("wigglewoo-cvc-progress") || '{"quests":{}}');
    const qp = progress.quests[qid];
    if (!qp || qp.currentWordIndex < imageCount) return false;
  }
  return true;
}

/** Filter out pending words (no image yet). Returns playable words only. */
export function filterPlayableWords(quest: Quest): Quest {
  return {
    ...quest,
    words: quest.words.filter((w) => (w.mode ?? "image") !== "pending"),
  };
}

/** Filter a quest's words by mode. Returns a new Quest with only matching words. */
export function getQuestByMode(quest: Quest, mode: "image" | "decode"): Quest {
  return {
    ...quest,
    words: quest.words.filter((w) => (w.mode ?? "image") === mode),
  };
}

/** Get image-mode words only (normal gameplay) */
export function getImageWords(quest: Quest): Quest {
  return getQuestByMode(quest, "image");
}

/** Get decode-mode words only (Challenge Mode) */
export function getDecodeWords(quest: Quest): Quest {
  return getQuestByMode(quest, "decode");
}

// =============================================================
// LAZY LOADERS — load quest chunks on demand
// =============================================================

let cvccLoaded = false;
let cvvcLoaded = false;
let magicELoaded = false;
let advancedLoaded = false;
let cvccLoadPromise: Promise<void> | null = null;
let cvvcLoadPromise: Promise<void> | null = null;
let magicELoadPromise: Promise<void> | null = null;
let advancedLoadPromise: Promise<void> | null = null;

/** Load CVCC quest data. Idempotent — safe to call multiple times. */
export async function loadCvccQuests(): Promise<void> {
  if (cvccLoaded) return;
  if (cvccLoadPromise) return cvccLoadPromise;

  cvccLoadPromise = import("./wordData.cvcc").then((mod) => {
    registerQuests(mod.CVCC_QUESTS);
    cvccLoaded = true;
  });

  return cvccLoadPromise;
}

/** Load Magic E quest data. Idempotent. */
export async function loadMagicEQuests(): Promise<void> {
  if (magicELoaded) return;
  if (magicELoadPromise) return magicELoadPromise;

  magicELoadPromise = import("./wordData.magicE").then((mod) => {
    registerQuests(mod.MAGIC_E_QUESTS);
    magicELoaded = true;
  });

  return magicELoadPromise;
}

/** Load CVVC quest data. Idempotent. */
export async function loadCvvcQuests(): Promise<void> {
  if (cvvcLoaded) return;
  if (cvvcLoadPromise) return cvvcLoadPromise;

  cvvcLoadPromise = import("./wordData.cvvc").then((mod) => {
    registerQuests(mod.CVVC_QUESTS);
    cvvcLoaded = true;
  });

  return cvvcLoadPromise;
}

/** Load Advanced Reading quest data. Idempotent. */
export async function loadAdvancedQuests(): Promise<void> {
  if (advancedLoaded) return;
  if (advancedLoadPromise) return advancedLoadPromise;

  advancedLoadPromise = import("./wordData.advanced").then((mod) => {
    registerQuests(mod.ADVANCED_QUESTS);
    advancedLoaded = true;
  });

  return advancedLoadPromise;
}

// =============================================================
// CVC WORD BANK — Trophy Room mini-game
// =============================================================

/**
 * CVC Word Bank organized by vowel for Trophy Room mini-game
 * Each entry has word and imageKey for potential future use
 */
export const CVC_WORD_BANK: Record<string, Array<{ word: string; imageKey: string }>> = {
  shortA: [
    { word: "cat", imageKey: "cat" },
    { word: "hat", imageKey: "hat" },
    { word: "bat", imageKey: "bat" },
    { word: "map", imageKey: "map" },
    { word: "cap", imageKey: "cap" },
    { word: "van", imageKey: "van" },
    { word: "ham", imageKey: "ham" },
    { word: "cab", imageKey: "cab" },
    { word: "rat", imageKey: "rat" },
    { word: "pan", imageKey: "pan" },
    { word: "can", imageKey: "can" },
    { word: "fan", imageKey: "fan" },
  ],
  shortE: [
    { word: "bed", imageKey: "bed" },
    { word: "hen", imageKey: "hen" },
    { word: "red", imageKey: "red" },
    { word: "pen", imageKey: "pen" },
    { word: "jet", imageKey: "jet" },
    { word: "net", imageKey: "net" },
    { word: "wet", imageKey: "wet" },
    { word: "leg", imageKey: "leg" },
    { word: "pet", imageKey: "pet" },
    { word: "ten", imageKey: "ten" },
  ],
  shortI: [
    { word: "sit", imageKey: "sit" },
    { word: "pin", imageKey: "pin" },
    { word: "dig", imageKey: "dig" },
    { word: "lid", imageKey: "lid" },
    { word: "wig", imageKey: "wig" },
    { word: "rip", imageKey: "rip" },
    { word: "mix", imageKey: "mix" },
    { word: "zip", imageKey: "zip" },
    { word: "pig", imageKey: "pig" },
    { word: "bib", imageKey: "bib" },
  ],
  shortO: [
    { word: "dog", imageKey: "dog" },
    { word: "hop", imageKey: "hop" },
    { word: "pot", imageKey: "pot" },
    { word: "log", imageKey: "log" },
    { word: "box", imageKey: "box" },
    { word: "mop", imageKey: "mop" },
    { word: "cot", imageKey: "cot" },
    { word: "fox", imageKey: "fox" },
    { word: "cob", imageKey: "cob" },
    { word: "dot", imageKey: "dot" },
  ],
  shortU: [
    { word: "cup", imageKey: "cup" },
    { word: "bus", imageKey: "bus" },
    { word: "tub", imageKey: "tub" },
    { word: "rug", imageKey: "rug" },
    { word: "sun", imageKey: "sun" },
    { word: "hug", imageKey: "hug" },
    { word: "mud", imageKey: "mud" },
    { word: "bug", imageKey: "bug" },
    { word: "pup", imageKey: "pup" },
    { word: "jug", imageKey: "jug" },
  ],
};

/** Convert quest ID to VowelId */
export function questIdToVowelId(questId: string): string {
  const mapping: Record<string, string> = {
    "quest-short-a": "shortA",
    "quest-short-e": "shortE",
    "quest-short-i": "shortI",
    "quest-short-o": "shortO",
    "quest-short-u": "shortU",
    "quest-cvcc-short-a": "shortA",
    "quest-cvcc-short-e": "shortE",
    "quest-cvcc-short-i": "shortI",
    "quest-cvcc-short-o": "shortO",
    "quest-cvcc-short-u": "shortU",
    "quest-cvvc-long-a": "longA",
    "quest-cvvc-long-e": "longE",
    "quest-cvvc-long-o": "longO",
    "quest-cvvc-long-u": "longOO",
    "quest-cvvc-mixed-ea": "longEA",
  };
  return mapping[questId] || "shortA";
}
