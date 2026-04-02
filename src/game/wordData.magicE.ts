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
    { word: "cake", imageKey: "cake", letters: ["c", "a", "k", "e"], distractors: [] },
    { word: "name", imageKey: "name", letters: ["n", "a", "m", "e"], distractors: [] },
    { word: "make", imageKey: "make", letters: ["m", "a", "k", "e"], distractors: [] },
    { word: "lake", imageKey: "lake", letters: ["l", "a", "k", "e"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "cape", imageKey: "cape", letters: ["c", "a", "p", "e"], distractors: ["n"] },
    { word: "gate", imageKey: "gate", letters: ["g", "a", "t", "e"], distractors: ["n"] },
    // Nodes 7-8: +2 distractors
    { word: "maze", imageKey: "maze", letters: ["m", "a", "z", "e"], distractors: ["n", "o"] },
    { word: "wave", imageKey: "wave", letters: ["w", "a", "v", "e"], distractors: ["t", "o"] },
    // === NODES 9-16 (after Trophy Room) ===
    { word: "tape", imageKey: "tape", letters: ["t", "a", "p", "e"], distractors: [] },
    { word: "cave", imageKey: "cave", letters: ["c", "a", "v", "e"], distractors: [] },
    { word: "late", imageKey: "late", letters: ["l", "a", "t", "e"], distractors: [] },
    { word: "bake", imageKey: "bake", letters: ["b", "a", "k", "e"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "safe", imageKey: "safe", letters: ["s", "a", "f", "e"], distractors: ["n"] },
    { word: "game", imageKey: "game", letters: ["g", "a", "m", "e"], distractors: ["t"] },
    // Nodes 15-16: +2 distractors
    { word: "face", imageKey: "face", letters: ["f", "a", "c", "e"], distractors: ["k", "o"] },
    { word: "race", imageKey: "race", letters: ["r", "a", "c", "e"], distractors: ["n", "u"] },
  ],
};

/** Magic E Quest 2 — i_e words (16 words) */
export const QUEST_MAGIC_E_I: Quest = {
  id: "quest-magic-e-i",
  title: "Magic E: Long I",
  patternType: "magic-e",
  words: [
    { word: "bike", imageKey: "bike", letters: ["b", "i", "k", "e"], distractors: [] },
    { word: "time", imageKey: "time", letters: ["t", "i", "m", "e"], distractors: [] },
    { word: "line", imageKey: "line", letters: ["l", "i", "n", "e"], distractors: [] },
    { word: "five", imageKey: "five", letters: ["f", "i", "v", "e"], distractors: [] },
    { word: "kite", imageKey: "kite", letters: ["k", "i", "t", "e"], distractors: ["n"] },
    { word: "nine", imageKey: "nine", letters: ["n", "i", "n", "e"], distractors: ["t"] },
    { word: "pine", imageKey: "pine", letters: ["p", "i", "n", "e"], distractors: ["t", "a"] },
    { word: "hide", imageKey: "hide", letters: ["h", "i", "d", "e"], distractors: ["t", "a"] },
    // Nodes 9-16
    { word: "ride", imageKey: "ride", letters: ["r", "i", "d", "e"], distractors: [] },
    { word: "dice", imageKey: "dice", letters: ["d", "i", "c", "e"], distractors: [] },
    { word: "mice", imageKey: "mice", letters: ["m", "i", "c", "e"], distractors: [] },
    { word: "life", imageKey: "life", letters: ["l", "i", "f", "e"], distractors: [] },
    { word: "vine", imageKey: "vine", letters: ["v", "i", "n", "e"], distractors: ["d"] },
    { word: "dime", imageKey: "dime", letters: ["d", "i", "m", "e"], distractors: ["t"] },
    { word: "fire", imageKey: "fire", letters: ["f", "i", "r", "e"], distractors: ["n", "a"] },
    { word: "wide", imageKey: "wide", letters: ["w", "i", "d", "e"], distractors: ["t", "o"] },
  ],
};

/** Magic E Quest 3 — o_e words (16 words) */
export const QUEST_MAGIC_E_O: Quest = {
  id: "quest-magic-e-o",
  title: "Magic E: Long O",
  patternType: "magic-e",
  words: [
    { word: "home", imageKey: "home", letters: ["h", "o", "m", "e"], distractors: [] },
    { word: "rope", imageKey: "rope", letters: ["r", "o", "p", "e"], distractors: [] },
    { word: "nose", imageKey: "nose", letters: ["n", "o", "s", "e"], distractors: [] },
    { word: "bone", imageKey: "bone", letters: ["b", "o", "n", "e"], distractors: [] },
    { word: "cone", imageKey: "cone", letters: ["c", "o", "n", "e"], distractors: ["t"] },
    { word: "rose", imageKey: "rose", letters: ["r", "o", "s", "e"], distractors: ["n"] },
    { word: "hole", imageKey: "hole", letters: ["h", "o", "l", "e"], distractors: ["n", "a"] },
    { word: "pole", imageKey: "pole", letters: ["p", "o", "l", "e"], distractors: ["t", "i"] },
    // Nodes 9-16
    { word: "note", imageKey: "note", letters: ["n", "o", "t", "e"], distractors: [] },
    { word: "vote", imageKey: "vote", letters: ["v", "o", "t", "e"], distractors: [] },
    { word: "hope", imageKey: "hope", letters: ["h", "o", "p", "e"], distractors: [] },
    { word: "joke", imageKey: "joke", letters: ["j", "o", "k", "e"], distractors: [] },
    { word: "woke", imageKey: "woke", letters: ["w", "o", "k", "e"], distractors: ["n"] },
    { word: "zone", imageKey: "zone", letters: ["z", "o", "n", "e"], distractors: ["t"] },
    { word: "dome", imageKey: "dome", letters: ["d", "o", "m", "e"], distractors: ["n", "a"] },
    { word: "mode", imageKey: "mode", letters: ["m", "o", "d", "e"], distractors: ["l", "i"] },
  ],
};

/** Magic E Quest 4 — u_e words (16 words) */
export const QUEST_MAGIC_E_U: Quest = {
  id: "quest-magic-e-u",
  title: "Magic E: Long U",
  patternType: "magic-e",
  words: [
    { word: "cute", imageKey: "cute", letters: ["c", "u", "t", "e"], distractors: [] },
    { word: "cube", imageKey: "cube", letters: ["c", "u", "b", "e"], distractors: [] },
    { word: "mule", imageKey: "mule", letters: ["m", "u", "l", "e"], distractors: [] },
    { word: "tune", imageKey: "tune", letters: ["t", "u", "n", "e"], distractors: [] },
    { word: "dune", imageKey: "dune", letters: ["d", "u", "n", "e"], distractors: ["t"] },
    { word: "rule", imageKey: "rule", letters: ["r", "u", "l", "e"], distractors: ["n"] },
    { word: "huge", imageKey: "huge", letters: ["h", "u", "g", "e"], distractors: ["t", "a"] },
    { word: "fuse", imageKey: "fuse", letters: ["f", "u", "s", "e"], distractors: ["n", "o"] },
    // Nodes 9-16
    { word: "rude", imageKey: "rude", letters: ["r", "u", "d", "e"], distractors: [] },
    { word: "dude", imageKey: "dude", letters: ["d", "u", "d", "e"], distractors: [] },
    { word: "lute", imageKey: "lute", letters: ["l", "u", "t", "e"], distractors: [] },
    { word: "muse", imageKey: "muse", letters: ["m", "u", "s", "e"], distractors: [] },
    { word: "pure", imageKey: "pure", letters: ["p", "u", "r", "e"], distractors: ["n"] },
    { word: "lure", imageKey: "lure", letters: ["l", "u", "r", "e"], distractors: ["t"] },
    { word: "duke", imageKey: "duke", letters: ["d", "u", "k", "e"], distractors: ["n", "a"] },
    { word: "flute", imageKey: "flute", letters: ["f", "l", "u", "t", "e"], distractors: [] },
  ],
};

/** Magic E Quest 5 — Mixed review (16 words from all vowels) */
export const QUEST_MAGIC_E_MIXED: Quest = {
  id: "quest-magic-e-mixed",
  title: "Magic E: Mixed Review",
  patternType: "magic-e",
  words: [
    { word: "make", imageKey: "make", letters: ["m", "a", "k", "e"], distractors: [] },
    { word: "hope", imageKey: "hope", letters: ["h", "o", "p", "e"], distractors: [] },
    { word: "bite", imageKey: "bite", letters: ["b", "i", "t", "e"], distractors: [] },
    { word: "mile", imageKey: "mile", letters: ["m", "i", "l", "e"], distractors: [] },
    { word: "hike", imageKey: "hike", letters: ["h", "i", "k", "e"], distractors: ["n"] },
    { word: "cure", imageKey: "cure", letters: ["c", "u", "r", "e"], distractors: ["t"] },
    { word: "mute", imageKey: "mute", letters: ["m", "u", "t", "e"], distractors: ["n", "a"] },
    { word: "tone", imageKey: "tone", letters: ["t", "o", "n", "e"], distractors: ["d", "i"] },
    // Nodes 9-16
    { word: "date", imageKey: "date", letters: ["d", "a", "t", "e"], distractors: [] },
    { word: "pile", imageKey: "pile", letters: ["p", "i", "l", "e"], distractors: [] },
    { word: "poke", imageKey: "poke", letters: ["p", "o", "k", "e"], distractors: [] },
    { word: "fume", imageKey: "fume", letters: ["f", "u", "m", "e"], distractors: [] },
    { word: "fade", imageKey: "fade", letters: ["f", "a", "d", "e"], distractors: ["n"] },
    { word: "June", imageKey: "june", letters: ["j", "u", "n", "e"], distractors: ["t"] },
    { word: "sake", imageKey: "sake", letters: ["s", "a", "k", "e"], distractors: ["n", "o"] },
    { word: "dose", imageKey: "dose", letters: ["d", "o", "s", "e"], distractors: ["n", "a"] },
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
