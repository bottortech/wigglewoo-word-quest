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
    { word: "cat", imageKey: "cat", letters: ["c", "a", "t"], distractors: [] },
    { word: "hat", imageKey: "hat", letters: ["h", "a", "t"], distractors: [] },
    { word: "map", imageKey: "map", letters: ["m", "a", "p"], distractors: [] },
    { word: "fan", imageKey: "fan", letters: ["f", "a", "n"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "bag", imageKey: "bag", letters: ["b", "a", "g"], distractors: ["s"] },
    { word: "bat", imageKey: "bat", letters: ["b", "a", "t"], distractors: ["n"] },
    // Nodes 7-8: +2 distractors
    { word: "cap", imageKey: "cap", letters: ["c", "a", "p"], distractors: ["n", "o"] },
    { word: "van", imageKey: "van", letters: ["v", "a", "n"], distractors: ["g", "o"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "ham", imageKey: "ham", letters: ["h", "a", "m"], distractors: [] },
    { word: "cab", imageKey: "cab", letters: ["c", "a", "b"], distractors: [] },
    { word: "rat", imageKey: "rat", letters: ["r", "a", "t"], distractors: [] },
    { word: "pan", imageKey: "pan", letters: ["p", "a", "n"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "can", imageKey: "can", letters: ["c", "a", "n"], distractors: ["t"] },
    { word: "nap", imageKey: "nap", letters: ["n", "a", "p"], distractors: ["d"] },
    // Nodes 15-16: +2 distractors
    { word: "sad", imageKey: "sad", letters: ["s", "a", "d"], distractors: ["m", "e"] },
    { word: "tag", imageKey: "tag", letters: ["t", "a", "g"], distractors: ["p", "u"] },
  ],
};

/** Quest 2 — short-i words (16 words for nodes 1-16) */
export const QUEST_SHORT_I: Quest = {
  id: "quest-short-i",
  title: "Short I Words",
  patternType: "cvc",
  words: [
    // Nodes 1-4: no distractors
    { word: "pig", imageKey: "pig", letters: ["p", "i", "g"], distractors: [] },
    { word: "sit", imageKey: "sit", letters: ["s", "i", "t"], distractors: [] },
    { word: "pin", imageKey: "pin", letters: ["p", "i", "n"], distractors: [] },
    { word: "dig", imageKey: "dig", letters: ["d", "i", "g"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "lid", imageKey: "lid", letters: ["l", "i", "d"], distractors: ["n"] },
    { word: "wig", imageKey: "wig", letters: ["w", "i", "g"], distractors: ["b"] },
    // Nodes 7-8: +2 distractors
    { word: "rip", imageKey: "rip", letters: ["r", "i", "p"], distractors: ["n", "a"] },
    { word: "mix", imageKey: "mix", letters: ["m", "i", "x"], distractors: ["t", "a"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "zip", imageKey: "zip", letters: ["z", "i", "p"], distractors: [] },
    { word: "bib", imageKey: "bib", letters: ["b", "i", "b"], distractors: [] },
    { word: "hit", imageKey: "hit", letters: ["h", "i", "t"], distractors: [] },
    { word: "kit", imageKey: "kit", letters: ["k", "i", "t"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "dip", imageKey: "dip", letters: ["d", "i", "p"], distractors: ["s"] },
    { word: "win", imageKey: "win", letters: ["w", "i", "n"], distractors: ["b"] },
    // Nodes 15-16: +2 distractors
    { word: "fin", imageKey: "fin", letters: ["f", "i", "n"], distractors: ["g", "o"] },
    { word: "sip", imageKey: "sip", letters: ["s", "i", "p"], distractors: ["m", "a"] },
  ],
};

/** Quest 3 — short-o words (16 words for nodes 1-16) */
export const QUEST_SHORT_O: Quest = {
  id: "quest-short-o",
  title: "Short O Words",
  patternType: "cvc",
  words: [
    // Nodes 1-4: no distractors
    { word: "dog", imageKey: "dog", letters: ["d", "o", "g"], distractors: [] },
    { word: "hop", imageKey: "hop", letters: ["h", "o", "p"], distractors: [] },
    { word: "top", imageKey: "top", letters: ["t", "o", "p"], distractors: [] },
    { word: "hot", imageKey: "hot", letters: ["h", "o", "t"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "pop", imageKey: "pop", letters: ["p", "o", "p"], distractors: ["t"] },
    { word: "log", imageKey: "log", letters: ["l", "o", "g"], distractors: ["n"] },
    // Nodes 7-8: +2 distractors
    { word: "box", imageKey: "box", letters: ["b", "o", "x"], distractors: ["n", "a"] },
    { word: "mop", imageKey: "mop", letters: ["m", "o", "p"], distractors: ["t", "a"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "cot", imageKey: "cot", letters: ["c", "o", "t"], distractors: [] },
    { word: "fox", imageKey: "fox", letters: ["f", "o", "x"], distractors: [] },
    { word: "cob", imageKey: "cob", letters: ["c", "o", "b"], distractors: [] },
    { word: "dot", imageKey: "dot", letters: ["d", "o", "t"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "jog", imageKey: "jog", letters: ["j", "o", "g"], distractors: ["n"] },
    { word: "rot", imageKey: "rot", letters: ["r", "o", "t"], distractors: ["n"] },
    // Nodes 15-16: +2 distractors
    { word: "sob", imageKey: "sob", letters: ["s", "o", "b"], distractors: ["n", "a"] },
    { word: "pot", imageKey: "pot", letters: ["p", "o", "t"], distractors: ["g", "i"] },
  ],
};

/** Quest 4 — short-u words (16 words for nodes 1-16) */
export const QUEST_SHORT_U: Quest = {
  id: "quest-short-u",
  title: "Short U Words",
  patternType: "cvc",
  words: [
    // Nodes 1-4: no distractors
    { word: "cup", imageKey: "cup", letters: ["c", "u", "p"], distractors: [] },
    { word: "sun", imageKey: "sun", letters: ["s", "u", "n"], distractors: [] },
    { word: "bus", imageKey: "bus", letters: ["b", "u", "s"], distractors: [] },
    { word: "tub", imageKey: "tub", letters: ["t", "u", "b"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "bug", imageKey: "bug", letters: ["b", "u", "g"], distractors: ["n"] },
    { word: "mud", imageKey: "mud", letters: ["m", "u", "d"], distractors: ["n"] },
    // Nodes 7-8: +2 distractors
    { word: "run", imageKey: "run", letters: ["r", "u", "n"], distractors: ["g", "a"] },
    { word: "rug", imageKey: "rug", letters: ["r", "u", "g"], distractors: ["n", "e"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "hug", imageKey: "hug", letters: ["h", "u", "g"], distractors: [] },
    { word: "gum", imageKey: "gum", letters: ["g", "u", "m"], distractors: [] },
    { word: "dug", imageKey: "dug", letters: ["d", "u", "g"], distractors: [] },
    { word: "nut", imageKey: "nut", letters: ["n", "u", "t"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "cut", imageKey: "cut", letters: ["c", "u", "t"], distractors: ["n"] },
    { word: "pup", imageKey: "pup", letters: ["p", "u", "p"], distractors: ["n"] },
    // Nodes 15-16: +2 distractors
    { word: "jug", imageKey: "jug", letters: ["j", "u", "g"], distractors: ["n", "a"] },
    { word: "fun", imageKey: "fun", letters: ["f", "u", "n"], distractors: ["t", "o"] },
  ],
};

/** Quest 5 — short-e words (16 words for nodes 1-16) */
export const QUEST_SHORT_E: Quest = {
  id: "quest-short-e",
  title: "Short E Words",
  patternType: "cvc",
  words: [
    // Nodes 1-4: no distractors
    { word: "bed", imageKey: "bed", letters: ["b", "e", "d"], distractors: [] },
    { word: "pen", imageKey: "pen", letters: ["p", "e", "n"], distractors: [] },
    { word: "red", imageKey: "red", letters: ["r", "e", "d"], distractors: [] },
    { word: "hen", imageKey: "hen", letters: ["h", "e", "n"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "jet", imageKey: "jet", letters: ["j", "e", "t"], distractors: ["s"] },
    { word: "net", imageKey: "net", letters: ["n", "e", "t"], distractors: ["g"] },
    // Nodes 7-8: +2 distractors
    { word: "wet", imageKey: "wet", letters: ["w", "e", "t"], distractors: ["p", "i"] },
    { word: "leg", imageKey: "leg", letters: ["l", "e", "g"], distractors: ["m", "o"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "pet", imageKey: "pet", letters: ["p", "e", "t"], distractors: [] },
    { word: "ten", imageKey: "ten", letters: ["t", "e", "n"], distractors: [] },
    { word: "beg", imageKey: "beg", letters: ["b", "e", "g"], distractors: [] },
    { word: "web", imageKey: "web", letters: ["w", "e", "b"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "ref", imageKey: "ref", letters: ["r", "e", "f"], distractors: ["m"] },
    { word: "fed", imageKey: "fed", letters: ["f", "e", "d"], distractors: ["n"] },
    // Nodes 15-16: +2 distractors
    { word: "gem", imageKey: "gem", letters: ["g", "e", "m"], distractors: ["t", "a"] },
    { word: "vet", imageKey: "vet", letters: ["v", "e", "t"], distractors: ["p", "u"] },
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
