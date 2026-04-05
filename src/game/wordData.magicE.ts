// =============================================
// wordData.magicE.ts — Magic E quest data (lazy-loaded)
// Wigglewoo CVC Quest
// =============================================
// Tier 3: Magic E (CVCe transformations)
// cap → cape, kit → kite, etc.
// Same 16-node structure per quest.
// =============================================

import type { Quest } from "./types";

// =============================================================
// MAGIC E QUESTS — Silent E / Long Vowel Shift
// =============================================================

/** Magic E Quest 1 — a_e words (16 words) */
export const QUEST_MAGIC_E_A: Quest = {
  id: "quest-magic-e-a",
  title: "Magic E: Long A",
  patternType: "magic-e",
  words: [
    // Nodes 1-4: no distractors
    { word: "cake", imageKey: "cake", letters: ["c", "a", "k", "e"], distractors: [], mode: "image" },
    { word: "name", imageKey: "name", letters: ["n", "a", "m", "e"], distractors: [], mode: "pending" },
    { word: "make", imageKey: "make", letters: ["m", "a", "k", "e"], distractors: [], mode: "decode" },
    { word: "lake", imageKey: "lake", letters: ["l", "a", "k", "e"], distractors: [], mode: "pending" },
    // Nodes 5-6: +1 distractor
    { word: "cape", imageKey: "cape", letters: ["c", "a", "p", "e"], distractors: ["n"], mode: "image" },
    { word: "gate", imageKey: "gate", letters: ["g", "a", "t", "e"], distractors: ["n"], mode: "pending" },
    // Nodes 7-8: +2 distractors
    { word: "maze", imageKey: "maze", letters: ["m", "a", "z", "e"], distractors: ["n", "o"], mode: "image" },
    { word: "wave", imageKey: "wave", letters: ["w", "a", "v", "e"], distractors: ["t", "o"], mode: "pending" },
    // === NODES 9-16 (after Trophy Room) ===
    { word: "tape", imageKey: "tape", letters: ["t", "a", "p", "e"], distractors: [], mode: "pending" },
    { word: "cave", imageKey: "cave", letters: ["c", "a", "v", "e"], distractors: [], mode: "image" },
    { word: "late", imageKey: "late", letters: ["l", "a", "t", "e"], distractors: [], mode: "decode" },
    { word: "bake", imageKey: "bake", letters: ["b", "a", "k", "e"], distractors: [], mode: "image" },
    // Nodes 13-14: +1 distractor
    { word: "safe", imageKey: "safe", letters: ["s", "a", "f", "e"], distractors: ["n"], mode: "pending" },
    { word: "game", imageKey: "game", letters: ["g", "a", "m", "e"], distractors: ["t"], mode: "image" },
    // Nodes 15-16: +2 distractors
    { word: "face", imageKey: "face", letters: ["f", "a", "c", "e"], distractors: ["k", "o"], mode: "decode" },
    { word: "race", imageKey: "race", letters: ["r", "a", "c", "e"], distractors: ["n", "u"], mode: "pending" },
  ],
};

/** Magic E Quest 2 — i_e words (16 words) */
export const QUEST_MAGIC_E_I: Quest = {
  id: "quest-magic-e-i",
  title: "Magic E: Long I",
  patternType: "magic-e",
  words: [
    { word: "bike", imageKey: "bike", letters: ["b", "i", "k", "e"], distractors: [], mode: "image" },
    { word: "time", imageKey: "time", letters: ["t", "i", "m", "e"], distractors: [], mode: "decode" },
    { word: "line", imageKey: "line", letters: ["l", "i", "n", "e"], distractors: [], mode: "pending" },
    { word: "five", imageKey: "five", letters: ["f", "i", "v", "e"], distractors: [], mode: "image" },
    { word: "kite", imageKey: "kite", letters: ["k", "i", "t", "e"], distractors: ["n"], mode: "image" },
    { word: "nine", imageKey: "nine", letters: ["n", "i", "n", "e"], distractors: ["t"], mode: "pending" },
    { word: "pine", imageKey: "pine", letters: ["p", "i", "n", "e"], distractors: ["t", "a"], mode: "pending" },
    { word: "hide", imageKey: "hide", letters: ["h", "i", "d", "e"], distractors: ["t", "a"], mode: "pending" },
    // Nodes 9-16
    { word: "ride", imageKey: "ride", letters: ["r", "i", "d", "e"], distractors: [], mode: "decode" },
    { word: "dice", imageKey: "dice", letters: ["d", "i", "c", "e"], distractors: [], mode: "image" },
    { word: "mice", imageKey: "mice", letters: ["m", "i", "c", "e"], distractors: [], mode: "pending" },
    { word: "life", imageKey: "life", letters: ["l", "i", "f", "e"], distractors: [], mode: "decode" },
    { word: "vine", imageKey: "vine", letters: ["v", "i", "n", "e"], distractors: ["d"], mode: "pending" },
    { word: "dime", imageKey: "dime", letters: ["d", "i", "m", "e"], distractors: ["t"], mode: "decode" },
    { word: "fire", imageKey: "fire", letters: ["f", "i", "r", "e"], distractors: ["n", "a"], mode: "image" },
    { word: "wide", imageKey: "wide", letters: ["w", "i", "d", "e"], distractors: ["t", "o"], mode: "decode" },
  ],
};

/** Magic E Quest 3 — o_e words (16 words) */
export const QUEST_MAGIC_E_O: Quest = {
  id: "quest-magic-e-o",
  title: "Magic E: Long O",
  patternType: "magic-e",
  words: [
    { word: "home", imageKey: "home", letters: ["h", "o", "m", "e"], distractors: [], mode: "image" },
    { word: "rope", imageKey: "rope", letters: ["r", "o", "p", "e"], distractors: [], mode: "pending" },
    { word: "nose", imageKey: "nose", letters: ["n", "o", "s", "e"], distractors: [], mode: "pending" },
    { word: "bone", imageKey: "bone", letters: ["b", "o", "n", "e"], distractors: [], mode: "image" },
    { word: "cone", imageKey: "cone", letters: ["c", "o", "n", "e"], distractors: ["t"], mode: "image" },
    { word: "rose", imageKey: "rose", letters: ["r", "o", "s", "e"], distractors: ["n"], mode: "pending" },
    { word: "hole", imageKey: "hole", letters: ["h", "o", "l", "e"], distractors: ["n", "a"], mode: "pending" },
    { word: "pole", imageKey: "pole", letters: ["p", "o", "l", "e"], distractors: ["t", "i"], mode: "pending" },
    // Nodes 9-16
    { word: "note", imageKey: "note", letters: ["n", "o", "t", "e"], distractors: [], mode: "pending" },
    { word: "vote", imageKey: "vote", letters: ["v", "o", "t", "e"], distractors: [], mode: "decode" },
    { word: "hope", imageKey: "hope", letters: ["h", "o", "p", "e"], distractors: [], mode: "decode" },
    { word: "joke", imageKey: "joke", letters: ["j", "o", "k", "e"], distractors: [], mode: "pending" },
    { word: "woke", imageKey: "woke", letters: ["w", "o", "k", "e"], distractors: ["n"], mode: "decode" },
    { word: "zone", imageKey: "zone", letters: ["z", "o", "n", "e"], distractors: ["t"], mode: "pending" },
    { word: "dome", imageKey: "dome", letters: ["d", "o", "m", "e"], distractors: ["n", "a"], mode: "pending" },
    { word: "mode", imageKey: "mode", letters: ["m", "o", "d", "e"], distractors: ["l", "i"], mode: "decode" },
  ],
};

/** Magic E Quest 4 — u_e words (16 words) */
export const QUEST_MAGIC_E_U: Quest = {
  id: "quest-magic-e-u",
  title: "Magic E: Long U",
  patternType: "magic-e",
  words: [
    { word: "cute", imageKey: "cute", letters: ["c", "u", "t", "e"], distractors: [], mode: "decode" },
    { word: "cube", imageKey: "cube", letters: ["c", "u", "b", "e"], distractors: [], mode: "decode" },
    { word: "mule", imageKey: "mule", letters: ["m", "u", "l", "e"], distractors: [], mode: "pending" },
    { word: "tune", imageKey: "tune", letters: ["t", "u", "n", "e"], distractors: [], mode: "pending" },
    { word: "dune", imageKey: "dune", letters: ["d", "u", "n", "e"], distractors: ["t"], mode: "decode" },
    { word: "rule", imageKey: "rule", letters: ["r", "u", "l", "e"], distractors: ["n"], mode: "decode" },
    { word: "huge", imageKey: "huge", letters: ["h", "u", "g", "e"], distractors: ["t", "a"], mode: "pending" },
    { word: "fuse", imageKey: "fuse", letters: ["f", "u", "s", "e"], distractors: ["n", "o"], mode: "decode" },
    // Nodes 9-16
    { word: "rude", imageKey: "rude", letters: ["r", "u", "d", "e"], distractors: [], mode: "decode" },
    { word: "dude", imageKey: "dude", letters: ["d", "u", "d", "e"], distractors: [], mode: "decode" },
    { word: "lute", imageKey: "lute", letters: ["l", "u", "t", "e"], distractors: [], mode: "decode" },
    { word: "muse", imageKey: "muse", letters: ["m", "u", "s", "e"], distractors: [], mode: "decode" },
    { word: "pure", imageKey: "pure", letters: ["p", "u", "r", "e"], distractors: ["n"], mode: "decode" },
    { word: "lure", imageKey: "lure", letters: ["l", "u", "r", "e"], distractors: ["t"], mode: "decode" },
    { word: "duke", imageKey: "duke", letters: ["d", "u", "k", "e"], distractors: ["n", "a"], mode: "decode" },
    { word: "flute", imageKey: "flute", letters: ["f", "l", "u", "t", "e"], distractors: [], mode: "image" },
  ],
};

/** Magic E Quest 5 — Mixed review (16 words from all vowels) */
export const QUEST_MAGIC_E_MIXED: Quest = {
  id: "quest-magic-e-mixed",
  title: "Magic E: Mixed Review",
  patternType: "magic-e",
  words: [
    { word: "make", imageKey: "make", letters: ["m", "a", "k", "e"], distractors: [], mode: "decode" },
    { word: "hope", imageKey: "hope", letters: ["h", "o", "p", "e"], distractors: [], mode: "decode" },
    { word: "bite", imageKey: "bite", letters: ["b", "i", "t", "e"], distractors: [], mode: "decode" },
    { word: "mile", imageKey: "mile", letters: ["m", "i", "l", "e"], distractors: [], mode: "pending" },
    { word: "hike", imageKey: "hike", letters: ["h", "i", "k", "e"], distractors: ["n"], mode: "image" },
    { word: "cure", imageKey: "cure", letters: ["c", "u", "r", "e"], distractors: ["t"], mode: "decode" },
    { word: "mute", imageKey: "mute", letters: ["m", "u", "t", "e"], distractors: ["n", "a"], mode: "decode" },
    { word: "tone", imageKey: "tone", letters: ["t", "o", "n", "e"], distractors: ["d", "i"], mode: "decode" },
    // Nodes 9-16
    { word: "date", imageKey: "date", letters: ["d", "a", "t", "e"], distractors: [], mode: "decode" },
    { word: "pile", imageKey: "pile", letters: ["p", "i", "l", "e"], distractors: [], mode: "pending" },
    { word: "poke", imageKey: "poke", letters: ["p", "o", "k", "e"], distractors: [], mode: "pending" },
    { word: "fume", imageKey: "fume", letters: ["f", "u", "m", "e"], distractors: [], mode: "decode" },
    { word: "fade", imageKey: "fade", letters: ["f", "a", "d", "e"], distractors: ["n"], mode: "decode" },
    { word: "June", imageKey: "june", letters: ["j", "u", "n", "e"], distractors: ["t"], mode: "decode" },
    { word: "sake", imageKey: "sake", letters: ["s", "a", "k", "e"], distractors: ["n", "o"], mode: "pending" },
    { word: "dose", imageKey: "dose", letters: ["d", "o", "s", "e"], distractors: ["n", "a"], mode: "decode" },
  ],
};

/** All Magic E quests in order */
export const MAGIC_E_QUESTS: Quest[] = [
  QUEST_MAGIC_E_A,
  QUEST_MAGIC_E_I,
  QUEST_MAGIC_E_O,
  QUEST_MAGIC_E_U,
  QUEST_MAGIC_E_MIXED,
];

/** Magic E Word Bank for Trophy Room */
export const MAGIC_E_WORD_BANK: Record<string, Array<{ word: string; imageKey: string }>> = {
  magicA: [
    { word: "cape", imageKey: "cape" }, { word: "cake", imageKey: "cake" },
    { word: "lake", imageKey: "lake" }, { word: "gate", imageKey: "gate" },
    { word: "maze", imageKey: "maze" }, { word: "wave", imageKey: "wave" },
    { word: "cave", imageKey: "cave" }, { word: "name", imageKey: "name" },
    { word: "face", imageKey: "face" }, { word: "race", imageKey: "race" },
  ],
  magicI: [
    { word: "kite", imageKey: "kite" }, { word: "bike", imageKey: "bike" },
    { word: "nine", imageKey: "nine" }, { word: "pine", imageKey: "pine" },
    { word: "hide", imageKey: "hide" }, { word: "ride", imageKey: "ride" },
    { word: "time", imageKey: "time" }, { word: "five", imageKey: "five" },
    { word: "dice", imageKey: "dice" }, { word: "mice", imageKey: "mice" },
  ],
  magicO: [
    { word: "cone", imageKey: "cone" }, { word: "bone", imageKey: "bone" },
    { word: "home", imageKey: "home" }, { word: "rope", imageKey: "rope" },
    { word: "nose", imageKey: "nose" }, { word: "rose", imageKey: "rose" },
    { word: "hole", imageKey: "hole" }, { word: "note", imageKey: "note" },
    { word: "hope", imageKey: "hope" }, { word: "joke", imageKey: "joke" },
  ],
  magicU: [
    { word: "cube", imageKey: "cube" }, { word: "cute", imageKey: "cute" },
    { word: "mule", imageKey: "mule" }, { word: "tune", imageKey: "tune" },
    { word: "dune", imageKey: "dune" }, { word: "rule", imageKey: "rule" },
    { word: "huge", imageKey: "huge" }, { word: "fuse", imageKey: "fuse" },
    { word: "pure", imageKey: "pure" }, { word: "duke", imageKey: "duke" },
  ],
  magicMixed: [
    { word: "make", imageKey: "make" }, { word: "bite", imageKey: "bite" },
    { word: "hope", imageKey: "hope" }, { word: "mute", imageKey: "mute" },
    { word: "date", imageKey: "date" }, { word: "pile", imageKey: "pile" },
    { word: "poke", imageKey: "poke" }, { word: "cure", imageKey: "cure" },
    { word: "fade", imageKey: "fade" }, { word: "mile", imageKey: "mile" },
  ],
};
