// =============================================
// wordData.cvvc.ts — CVVC quest data (lazy-loaded)
// Wigglewoo CVC Quest
// =============================================
// This chunk is loaded dynamically when CVVC quests
// are unlocked. Not included in the initial bundle.
// =============================================

import type { Quest } from "./types";

// =============================================================
// CVVC QUESTS — Vowel Teams
// Same 16-node structure: 1-4 none, 5-6 +1, 7-8 +2,
//   Trophy Room, 9-12 none, 13-14 +1, 15-16 +2
// =============================================================

/** CVVC Quest 1 — long-a vowel teams (16 words) */
export const QUEST_CVVC_LONG_A: Quest = {
  id: "quest-cvvc-long-a",
  title: "Long A Vowel Teams",
  patternType: "cvvc",
  words: [
    // Nodes 1-4: no distractors
    { word: "rain", imageKey: "rain", letters: ["r", "a", "i", "n"], distractors: [], mode: "image" },
    { word: "tail", imageKey: "tail", letters: ["t", "a", "i", "l"], distractors: [], mode: "pending" },
    { word: "mail", imageKey: "mail", letters: ["m", "a", "i", "l"], distractors: [], mode: "pending" },
    { word: "sail", imageKey: "sail", letters: ["s", "a", "i", "l"], distractors: [], mode: "pending" },
    // Nodes 5-6: +1 distractor
    { word: "pail", imageKey: "pail", letters: ["p", "a", "i", "l"], distractors: ["t"], mode: "pending" },
    { word: "wait", imageKey: "wait", letters: ["w", "a", "i", "t"], distractors: ["n"], mode: "decode" },
    // Nodes 7-8: +2 distractors
    { word: "pain", imageKey: "pain", letters: ["p", "a", "i", "n"], distractors: ["g", "o"], mode: "decode" },
    { word: "gain", imageKey: "gain", letters: ["g", "a", "i", "n"], distractors: ["s", "u"], mode: "decode" },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "rail", imageKey: "rail", letters: ["r", "a", "i", "l"], distractors: [], mode: "decode" },
    { word: "nail", imageKey: "nail", letters: ["n", "a", "i", "l"], distractors: [], mode: "image" },
    { word: "bait", imageKey: "bait", letters: ["b", "a", "i", "t"], distractors: [], mode: "decode" },
    { word: "paid", imageKey: "paid", letters: ["p", "a", "i", "d"], distractors: [], mode: "decode" },
    // Nodes 13-14: +1 distractor
    { word: "main", imageKey: "main", letters: ["m", "a", "i", "n"], distractors: ["t"], mode: "decode" },
    { word: "fail", imageKey: "fail", letters: ["f", "a", "i", "l"], distractors: ["d"], mode: "decode" },
    // Nodes 15-16: +2 distractors
    { word: "laid", imageKey: "laid", letters: ["l", "a", "i", "d"], distractors: ["p", "o"], mode: "decode" },
    { word: "wail", imageKey: "wail", letters: ["w", "a", "i", "l"], distractors: ["t", "o"], mode: "decode" },
  ],
};

/** CVVC Quest 2 — long-e vowel teams (16 words) */
export const QUEST_CVVC_LONG_E: Quest = {
  id: "quest-cvvc-long-e",
  title: "Long E Vowel Teams",
  patternType: "cvvc",
  words: [
    // Nodes 1-4: no distractors
    { word: "seed", imageKey: "seed", letters: ["s", "e", "e", "d"], distractors: [], mode: "pending" },
    { word: "feed", imageKey: "feed", letters: ["f", "e", "e", "d"], distractors: [], mode: "pending" },
    { word: "feel", imageKey: "feel", letters: ["f", "e", "e", "l"], distractors: [], mode: "decode" },
    { word: "deep", imageKey: "deep", letters: ["d", "e", "e", "p"], distractors: [], mode: "pending" },
    // Nodes 5-6: +1 distractor
    { word: "keep", imageKey: "keep", letters: ["k", "e", "e", "p"], distractors: ["d"], mode: "pending" },
    { word: "week", imageKey: "week", letters: ["w", "e", "e", "k"], distractors: ["n"], mode: "pending" },
    // Nodes 7-8: +2 distractors
    { word: "peel", imageKey: "peel", letters: ["p", "e", "e", "l"], distractors: ["d", "a"], mode: "pending" },
    { word: "heel", imageKey: "heel", letters: ["h", "e", "e", "l"], distractors: ["s", "a"], mode: "pending" },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "weed", imageKey: "weed", letters: ["w", "e", "e", "d"], distractors: [], mode: "pending" },
    { word: "seek", imageKey: "seek", letters: ["s", "e", "e", "k"], distractors: [], mode: "decode" },
    { word: "peek", imageKey: "peek", letters: ["p", "e", "e", "k"], distractors: [], mode: "decode" },
    { word: "deer", imageKey: "deer", letters: ["d", "e", "e", "r"], distractors: [], mode: "image" },
    // Nodes 13-14: +1 distractor
    { word: "jeep", imageKey: "jeep", letters: ["j", "e", "e", "p"], distractors: ["n"], mode: "pending" },
    { word: "reef", imageKey: "reef", letters: ["r", "e", "e", "f"], distractors: ["n"], mode: "image" },
    // Nodes 15-16: +2 distractors
    { word: "beef", imageKey: "beef", letters: ["b", "e", "e", "f"], distractors: ["n", "i"], mode: "pending" },
    { word: "seep", imageKey: "seep", letters: ["s", "e", "e", "p"], distractors: ["n", "a"], mode: "decode" },
  ],
};

/** CVVC Quest 3 — long-o vowel teams (16 words) */
export const QUEST_CVVC_LONG_O: Quest = {
  id: "quest-cvvc-long-o",
  title: "Long O Vowel Teams",
  patternType: "cvvc",
  words: [
    // Nodes 1-4: no distractors
    { word: "boat", imageKey: "boat", letters: ["b", "o", "a", "t"], distractors: [], mode: "image" },
    { word: "coat", imageKey: "coat", letters: ["c", "o", "a", "t"], distractors: [], mode: "pending" },
    { word: "road", imageKey: "road", letters: ["r", "o", "a", "d"], distractors: [], mode: "pending" },
    { word: "goat", imageKey: "goat", letters: ["g", "o", "a", "t"], distractors: [], mode: "image" },
    // Nodes 5-6: +1 distractor
    { word: "toad", imageKey: "toad", letters: ["t", "o", "a", "d"], distractors: ["n"], mode: "pending" },
    { word: "load", imageKey: "load", letters: ["l", "o", "a", "d"], distractors: ["s"], mode: "decode" },
    // Nodes 7-8: +2 distractors
    { word: "soap", imageKey: "soap", letters: ["s", "o", "a", "p"], distractors: ["t", "i"], mode: "pending" },
    { word: "foam", imageKey: "foam", letters: ["f", "o", "a", "m"], distractors: ["d", "e"], mode: "pending" },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "coal", imageKey: "coal", letters: ["c", "o", "a", "l"], distractors: [], mode: "pending" },
    { word: "goal", imageKey: "goal", letters: ["g", "o", "a", "l"], distractors: [], mode: "decode" },
    { word: "moan", imageKey: "moan", letters: ["m", "o", "a", "n"], distractors: [], mode: "decode" },
    { word: "loan", imageKey: "loan", letters: ["l", "o", "a", "n"], distractors: [], mode: "decode" },
    // Nodes 13-14: +1 distractor
    { word: "soak", imageKey: "soak", letters: ["s", "o", "a", "k"], distractors: ["d"], mode: "decode" },
    { word: "roam", imageKey: "roam", letters: ["r", "o", "a", "m"], distractors: ["t"], mode: "decode" },
    // Nodes 15-16: +2 distractors
    { word: "foal", imageKey: "foal", letters: ["f", "o", "a", "l"], distractors: ["t", "i"], mode: "pending" },
    { word: "moat", imageKey: "moat", letters: ["m", "o", "a", "t"], distractors: ["l", "e"], mode: "pending" },
  ],
};

/** CVVC Quest 4 — oo/ou vowel teams (16 words) */
export const QUEST_CVVC_LONG_U: Quest = {
  id: "quest-cvvc-long-u",
  title: "OO Vowel Teams",
  patternType: "cvvc",
  words: [
    // Nodes 1-4: no distractors
    { word: "moon", imageKey: "moon", letters: ["m", "o", "o", "n"], distractors: [], mode: "image" },
    { word: "boot", imageKey: "boot", letters: ["b", "o", "o", "t"], distractors: [], mode: "image" },
    { word: "pool", imageKey: "pool", letters: ["p", "o", "o", "l"], distractors: [], mode: "image" },
    { word: "room", imageKey: "room", letters: ["r", "o", "o", "m"], distractors: [], mode: "pending" },
    // Nodes 5-6: +1 distractor
    { word: "noon", imageKey: "noon", letters: ["n", "o", "o", "n"], distractors: ["t"], mode: "decode" },
    { word: "soon", imageKey: "soon", letters: ["s", "o", "o", "n"], distractors: ["t"], mode: "decode" },
    // Nodes 7-8: +2 distractors
    { word: "hoop", imageKey: "hoop", letters: ["h", "o", "o", "p"], distractors: ["n", "a"], mode: "image" },
    { word: "loop", imageKey: "loop", letters: ["l", "o", "o", "p"], distractors: ["t", "a"], mode: "pending" },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "roof", imageKey: "roof", letters: ["r", "o", "o", "f"], distractors: [], mode: "pending" },
    { word: "cool", imageKey: "cool", letters: ["c", "o", "o", "l"], distractors: [], mode: "pending" },
    { word: "fool", imageKey: "fool", letters: ["f", "o", "o", "l"], distractors: [], mode: "pending" },
    { word: "tool", imageKey: "tool", letters: ["t", "o", "o", "l"], distractors: [], mode: "pending" },
    // Nodes 13-14: +1 distractor
    { word: "zoom", imageKey: "zoom", letters: ["z", "o", "o", "m"], distractors: ["l"], mode: "pending" },
    { word: "boom", imageKey: "boom", letters: ["b", "o", "o", "m"], distractors: ["n"], mode: "pending" },
    // Nodes 15-16: +2 distractors
    { word: "loom", imageKey: "loom", letters: ["l", "o", "o", "m"], distractors: ["s", "a"], mode: "pending" },
    { word: "hoot", imageKey: "hoot", letters: ["h", "o", "o", "t"], distractors: ["p", "i"], mode: "pending" },
  ],
};

/** CVVC Quest 5 — ea/ee mixed vowel teams (16 words) */
export const QUEST_CVVC_MIXED_EA: Quest = {
  id: "quest-cvvc-mixed-ea",
  title: "EA Vowel Teams",
  patternType: "cvvc",
  words: [
    // Nodes 1-4: no distractors
    { word: "bean", imageKey: "bean", letters: ["b", "e", "a", "n"], distractors: [], mode: "pending" },
    { word: "leaf", imageKey: "leaf", letters: ["l", "e", "a", "f"], distractors: [], mode: "image" },
    { word: "meal", imageKey: "meal", letters: ["m", "e", "a", "l"], distractors: [], mode: "pending" },
    { word: "seal", imageKey: "seal", letters: ["s", "e", "a", "l"], distractors: [], mode: "image" },
    // Nodes 5-6: +1 distractor
    { word: "bead", imageKey: "bead", letters: ["b", "e", "a", "d"], distractors: ["n"], mode: "pending" },
    { word: "read", imageKey: "read", letters: ["r", "e", "a", "d"], distractors: ["l"], mode: "pending" },
    // Nodes 7-8: +2 distractors
    { word: "heap", imageKey: "heap", letters: ["h", "e", "a", "p"], distractors: ["t", "o"], mode: "pending" },
    { word: "lean", imageKey: "lean", letters: ["l", "e", "a", "n"], distractors: ["d", "i"], mode: "pending" },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "peak", imageKey: "peak", letters: ["p", "e", "a", "k"], distractors: [], mode: "pending" },
    { word: "beak", imageKey: "beak", letters: ["b", "e", "a", "k"], distractors: [], mode: "pending" },
    { word: "deal", imageKey: "deal", letters: ["d", "e", "a", "l"], distractors: [], mode: "decode" },
    { word: "heal", imageKey: "heal", letters: ["h", "e", "a", "l"], distractors: [], mode: "pending" },
    // Nodes 13-14: +1 distractor
    { word: "real", imageKey: "real", letters: ["r", "e", "a", "l"], distractors: ["n"], mode: "decode" },
    { word: "beat", imageKey: "beat", letters: ["b", "e", "a", "t"], distractors: ["n"], mode: "pending" },
    // Nodes 15-16: +2 distractors
    { word: "teak", imageKey: "teak", letters: ["t", "e", "a", "k"], distractors: ["n", "o"], mode: "pending" },
    { word: "heat", imageKey: "heat", letters: ["h", "e", "a", "t"], distractors: ["s", "u"], mode: "pending" },
  ],
};

/** All CVVC quests in order */
export const CVVC_QUESTS: Quest[] = [
  QUEST_CVVC_LONG_A,
  QUEST_CVVC_LONG_E,
  QUEST_CVVC_LONG_O,
  QUEST_CVVC_LONG_U,
  QUEST_CVVC_MIXED_EA,
];

/** CVVC Word Bank for Trophy Room mini-game */
export const CVVC_WORD_BANK: Record<string, Array<{ word: string; imageKey: string }>> = {
  longA: [
    { word: "rain", imageKey: "rain" }, { word: "tail", imageKey: "tail" },
    { word: "mail", imageKey: "mail" }, { word: "sail", imageKey: "sail" },
    { word: "pail", imageKey: "pail" }, { word: "wait", imageKey: "wait" },
    { word: "nail", imageKey: "nail" }, { word: "bait", imageKey: "bait" },
    { word: "paid", imageKey: "paid" }, { word: "rail", imageKey: "rail" },
  ],
  longE: [
    { word: "seed", imageKey: "seed" }, { word: "feed", imageKey: "feed" },
    { word: "feel", imageKey: "feel" }, { word: "peel", imageKey: "peel" },
    { word: "reef", imageKey: "reef" }, { word: "deep", imageKey: "deep" },
    { word: "keep", imageKey: "keep" }, { word: "week", imageKey: "week" },
    { word: "seek", imageKey: "seek" }, { word: "deer", imageKey: "deer" },
    { word: "jeep", imageKey: "jeep" },
  ],
  longO: [
    { word: "boat", imageKey: "boat" }, { word: "coat", imageKey: "coat" },
    { word: "goat", imageKey: "goat" }, { word: "road", imageKey: "road" },
    { word: "toad", imageKey: "toad" }, { word: "soap", imageKey: "soap" },
    { word: "coal", imageKey: "coal" }, { word: "goal", imageKey: "goal" },
    { word: "soak", imageKey: "soak" }, { word: "moat", imageKey: "moat" },
  ],
  longOO: [
    { word: "moon", imageKey: "moon" }, { word: "boot", imageKey: "boot" },
    { word: "hoop", imageKey: "hoop" }, { word: "loop", imageKey: "loop" },
    { word: "roof", imageKey: "roof" }, { word: "pool", imageKey: "pool" },
    { word: "cool", imageKey: "cool" }, { word: "tool", imageKey: "tool" },
    { word: "room", imageKey: "room" }, { word: "zoom", imageKey: "zoom" },
  ],
  longEA: [
    { word: "bean", imageKey: "bean" }, { word: "leaf", imageKey: "leaf" },
    { word: "meal", imageKey: "meal" }, { word: "seal", imageKey: "seal" },
    { word: "read", imageKey: "read" }, { word: "peak", imageKey: "peak" },
    { word: "beak", imageKey: "beak" }, { word: "deal", imageKey: "deal" },
    { word: "heal", imageKey: "heal" }, { word: "beat", imageKey: "beat" },
  ],
};
