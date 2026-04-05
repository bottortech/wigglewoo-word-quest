// =============================================
// wordData.cvcc.ts — CVCC quest data (lazy-loaded)
// Wigglewoo CVC Quest
// =============================================
// This chunk is loaded dynamically when CVCC quests
// are unlocked. Not included in the initial bundle.
// =============================================

import type { Quest } from "./types";

// =============================================================
// CVCC QUESTS — Ending Blends
// Same 16-node structure: 1-4 none, 5-6 +1, 7-8 +2,
//   Trophy Room, 9-12 none, 13-14 +1, 15-16 +2
// =============================================================

/** CVCC Quest 1 — short-a ending blends (16 words) */
export const QUEST_CVCC_SHORT_A: Quest = {
  id: "quest-cvcc-short-a",
  title: "Short A Ending Blends",
  patternType: "cvcc",
  words: [
    { word: "hand", imageKey: "hand", letters: ["h", "a", "n", "d"], distractors: [], mode: "image" },
    { word: "lamp", imageKey: "lamp", letters: ["l", "a", "m", "p"], distractors: [], mode: "image" },
    { word: "camp", imageKey: "camp", letters: ["c", "a", "m", "p"], distractors: [], mode: "image" },
    { word: "band", imageKey: "band", letters: ["b", "a", "n", "d"], distractors: ["g"], mode: "image" },
    { word: "sand", imageKey: "sand", letters: ["s", "a", "n", "d"], distractors: ["g", "o"], mode: "image" },
    { word: "mask", imageKey: "mask", letters: ["m", "a", "s", "k"], distractors: [], mode: "image" },
    { word: "gift", imageKey: "gift", letters: ["g", "i", "f", "t"], distractors: ["n", "e"], mode: "image" },
    { word: "raft", imageKey: "raft", letters: ["r", "a", "f", "t"], distractors: ["l", "u"], mode: "image" },
    { word: "fast", imageKey: "fast", letters: ["f", "a", "s", "t"], distractors: [], mode: "decode" },
    { word: "last", imageKey: "last", letters: ["l", "a", "s", "t"], distractors: ["n"], mode: "decode" },
    { word: "land", imageKey: "land", letters: ["l", "a", "n", "d"], distractors: ["p", "o"], mode: "decode" },
    { word: "damp", imageKey: "damp", letters: ["d", "a", "m", "p"], distractors: [], mode: "decode" },
    { word: "task", imageKey: "task", letters: ["t", "a", "s", "k"], distractors: [], mode: "decode" },
    { word: "mast", imageKey: "mast", letters: ["m", "a", "s", "t"], distractors: [], mode: "decode" },
    { word: "pant", imageKey: "pant", letters: ["p", "a", "n", "t"], distractors: ["g"], mode: "decode" },
    { word: "rant", imageKey: "rant", letters: ["r", "a", "n", "t"], distractors: ["b"], mode: "decode" },
  ],
};

/** CVCC Quest 2 — short-i ending blends (16 words) */
export const QUEST_CVCC_SHORT_I: Quest = {
  id: "quest-cvcc-short-i",
  title: "Short I Ending Blends",
  patternType: "cvcc",
  words: [
    { word: "milk", imageKey: "milk", letters: ["m", "i", "l", "k"], distractors: [], mode: "image" },
    { word: "ring", imageKey: "ring", letters: ["r", "i", "n", "g"], distractors: [], mode: "image" },
    { word: "gift", imageKey: "gift", letters: ["g", "i", "f", "t"], distractors: ["n"], mode: "image" },
    { word: "fist", imageKey: "fist", letters: ["f", "i", "s", "t"], distractors: ["n", "a"], mode: "image" },
    { word: "king", imageKey: "king", letters: ["k", "i", "n", "g"], distractors: [], mode: "image" },
    { word: "film", imageKey: "film", letters: ["f", "i", "l", "m"], distractors: ["t", "o"], mode: "image" },
    { word: "sing", imageKey: "sing", letters: ["s", "i", "n", "g"], distractors: [], mode: "decode" },
    { word: "wind", imageKey: "wind", letters: ["w", "i", "n", "d"], distractors: [], mode: "decode" },
    { word: "silk", imageKey: "silk", letters: ["s", "i", "l", "k"], distractors: ["n"], mode: "decode" },
    { word: "lift", imageKey: "lift", letters: ["l", "i", "f", "t"], distractors: ["n", "a"], mode: "decode" },
    { word: "list", imageKey: "list", letters: ["l", "i", "s", "t"], distractors: [], mode: "decode" },
    { word: "mint", imageKey: "mint", letters: ["m", "i", "n", "t"], distractors: [], mode: "decode" },
    { word: "hint", imageKey: "hint", letters: ["h", "i", "n", "t"], distractors: [], mode: "decode" },
    { word: "limp", imageKey: "limp", letters: ["l", "i", "m", "p"], distractors: ["k"], mode: "decode" },
    { word: "risk", imageKey: "risk", letters: ["r", "i", "s", "k"], distractors: ["n"], mode: "decode" },
    { word: "tilt", imageKey: "tilt", letters: ["t", "i", "l", "t"], distractors: ["s", "a"], mode: "decode" },
  ],
};

/** CVCC Quest 3 — short-o ending blends (16 words) */
export const QUEST_CVCC_SHORT_O: Quest = {
  id: "quest-cvcc-short-o",
  title: "Short O Ending Blends",
  patternType: "cvcc",
  words: [
    { word: "pond", imageKey: "pond", letters: ["p", "o", "n", "d"], distractors: [], mode: "image" },
    { word: "rock", imageKey: "rock", letters: ["r", "o", "c", "k"], distractors: [], mode: "image" },
    { word: "sock", imageKey: "sock", letters: ["s", "o", "c", "k"], distractors: [], mode: "image" },
    { word: "lock", imageKey: "lock", letters: ["l", "o", "c", "k"], distractors: [], mode: "image" },
    { word: "lost", imageKey: "lost", letters: ["l", "o", "s", "t"], distractors: ["n"], mode: "decode" },
    { word: "long", imageKey: "long", letters: ["l", "o", "n", "g"], distractors: ["t"], mode: "decode" },
    { word: "song", imageKey: "song", letters: ["s", "o", "n", "g"], distractors: ["t", "a"], mode: "decode" },
    { word: "soft", imageKey: "soft", letters: ["s", "o", "f", "t"], distractors: ["n", "i"], mode: "decode" },
    { word: "bond", imageKey: "bond", letters: ["b", "o", "n", "d"], distractors: [], mode: "decode" },
    { word: "fond", imageKey: "fond", letters: ["f", "o", "n", "d"], distractors: [], mode: "decode" },
    { word: "cost", imageKey: "cost", letters: ["c", "o", "s", "t"], distractors: [], mode: "decode" },
    { word: "dock", imageKey: "dock", letters: ["d", "o", "c", "k"], distractors: [], mode: "decode" },
    { word: "gong", imageKey: "gong", letters: ["g", "o", "n", "g"], distractors: ["t"], mode: "decode" },
    { word: "romp", imageKey: "romp", letters: ["r", "o", "m", "p"], distractors: ["s"], mode: "decode" },
    { word: "loft", imageKey: "loft", letters: ["l", "o", "f", "t"], distractors: ["n", "i"], mode: "decode" },
    { word: "mock", imageKey: "mock", letters: ["m", "o", "c", "k"], distractors: ["l", "e"], mode: "decode" },
  ],
};

/** CVCC Quest 4 — short-u ending blends (16 words) */
export const QUEST_CVCC_SHORT_U: Quest = {
  id: "quest-cvcc-short-u",
  title: "Short U Ending Blends",
  patternType: "cvcc",
  words: [
    { word: "jump", imageKey: "jump", letters: ["j", "u", "m", "p"], distractors: [], mode: "image" },
    { word: "bunk", imageKey: "bunk", letters: ["b", "u", "n", "k"], distractors: [], mode: "image" },
    { word: "lung", imageKey: "lung", letters: ["l", "u", "n", "g"], distractors: ["d"], mode: "image" },
    { word: "dust", imageKey: "dust", letters: ["d", "u", "s", "t"], distractors: [], mode: "decode" },
    { word: "must", imageKey: "must", letters: ["m", "u", "s", "t"], distractors: [], mode: "decode" },
    { word: "pump", imageKey: "pump", letters: ["p", "u", "m", "p"], distractors: [], mode: "decode" },
    { word: "bump", imageKey: "bump", letters: ["b", "u", "m", "p"], distractors: ["t"], mode: "decode" },
    { word: "dump", imageKey: "dump", letters: ["d", "u", "m", "p"], distractors: ["g"], mode: "decode" },
    { word: "gust", imageKey: "gust", letters: ["g", "u", "s", "t"], distractors: ["n", "a"], mode: "decode" },
    { word: "rust", imageKey: "rust", letters: ["r", "u", "s", "t"], distractors: ["n", "a"], mode: "decode" },
    { word: "bulk", imageKey: "bulk", letters: ["b", "u", "l", "k"], distractors: [], mode: "decode" },
    { word: "hulk", imageKey: "hulk", letters: ["h", "u", "l", "k"], distractors: [], mode: "decode" },
    { word: "dunk", imageKey: "dunk", letters: ["d", "u", "n", "k"], distractors: [], mode: "decode" },
    { word: "hung", imageKey: "hung", letters: ["h", "u", "n", "g"], distractors: ["t"], mode: "decode" },
    { word: "dusk", imageKey: "dusk", letters: ["d", "u", "s", "k"], distractors: ["n", "o"], mode: "decode" },
    { word: "must", imageKey: "must", letters: ["m", "u", "s", "t"], distractors: ["n", "a"], mode: "decode" },
  ],
};

/** CVCC Quest 5 — short-e ending blends (16 words) */
export const QUEST_CVCC_SHORT_E: Quest = {
  id: "quest-cvcc-short-e",
  title: "Short E Ending Blends",
  patternType: "cvcc",
  words: [
    { word: "belt", imageKey: "belt", letters: ["b", "e", "l", "t"], distractors: [], mode: "image" },
    { word: "nest", imageKey: "nest", letters: ["n", "e", "s", "t"], distractors: [], mode: "image" },
    { word: "melt", imageKey: "melt", letters: ["m", "e", "l", "t"], distractors: ["n"], mode: "image" },
    { word: "desk", imageKey: "desk", letters: ["d", "e", "s", "k"], distractors: ["n", "a"], mode: "image" },
    { word: "best", imageKey: "best", letters: ["b", "e", "s", "t"], distractors: [], mode: "decode" },
    { word: "test", imageKey: "test", letters: ["t", "e", "s", "t"], distractors: [], mode: "decode" },
    { word: "felt", imageKey: "felt", letters: ["f", "e", "l", "t"], distractors: ["n"], mode: "decode" },
    { word: "west", imageKey: "west", letters: ["w", "e", "s", "t"], distractors: ["p", "u"], mode: "decode" },
    { word: "bend", imageKey: "bend", letters: ["b", "e", "n", "d"], distractors: [], mode: "decode" },
    { word: "lend", imageKey: "lend", letters: ["l", "e", "n", "d"], distractors: [], mode: "decode" },
    { word: "mend", imageKey: "mend", letters: ["m", "e", "n", "d"], distractors: [], mode: "decode" },
    { word: "send", imageKey: "send", letters: ["s", "e", "n", "d"], distractors: [], mode: "decode" },
    { word: "help", imageKey: "help", letters: ["h", "e", "l", "p"], distractors: ["t"], mode: "decode" },
    { word: "yelp", imageKey: "yelp", letters: ["y", "e", "l", "p"], distractors: ["n"], mode: "decode" },
    { word: "pest", imageKey: "pest", letters: ["p", "e", "s", "t"], distractors: ["r", "i"], mode: "decode" },
    { word: "vent", imageKey: "vent", letters: ["v", "e", "n", "t"], distractors: ["s", "o"], mode: "decode" },
  ],
};

/** All CVCC quests in order */
export const CVCC_QUESTS: Quest[] = [
  QUEST_CVCC_SHORT_A,
  QUEST_CVCC_SHORT_I,
  QUEST_CVCC_SHORT_O,
  QUEST_CVCC_SHORT_U,
  QUEST_CVCC_SHORT_E,
];

/** CVCC Word Bank for Trophy Room mini-game */
export const CVCC_WORD_BANK: Record<string, Array<{ word: string; imageKey: string }>> = {
  shortA: [
    { word: "lamp", imageKey: "lamp" }, { word: "camp", imageKey: "camp" },
    { word: "band", imageKey: "band" }, { word: "hand", imageKey: "hand" },
    { word: "sand", imageKey: "sand" }, { word: "mask", imageKey: "mask" },
    { word: "fast", imageKey: "fast" }, { word: "task", imageKey: "task" },
    { word: "raft", imageKey: "raft" }, { word: "last", imageKey: "last" },
  ],
  shortI: [
    { word: "milk", imageKey: "milk" }, { word: "silk", imageKey: "silk" },
    { word: "gift", imageKey: "gift" }, { word: "lift", imageKey: "lift" },
    { word: "fist", imageKey: "fist" }, { word: "mint", imageKey: "mint" },
    { word: "king", imageKey: "king" }, { word: "ring", imageKey: "ring" },
    { word: "sing", imageKey: "sing" }, { word: "film", imageKey: "film" },
  ],
  shortO: [
    { word: "pond", imageKey: "pond" }, { word: "bond", imageKey: "bond" },
    { word: "lost", imageKey: "lost" }, { word: "lock", imageKey: "lock" },
    { word: "dock", imageKey: "dock" }, { word: "rock", imageKey: "rock" },
    { word: "sock", imageKey: "sock" }, { word: "long", imageKey: "long" },
    { word: "song", imageKey: "song" }, { word: "soft", imageKey: "soft" },
  ],
  shortU: [
    { word: "dust", imageKey: "dust" }, { word: "gust", imageKey: "gust" },
    { word: "rust", imageKey: "rust" }, { word: "bump", imageKey: "bump" },
    { word: "jump", imageKey: "jump" }, { word: "pump", imageKey: "pump" },
    { word: "bulk", imageKey: "bulk" }, { word: "bunk", imageKey: "bunk" },
    { word: "dunk", imageKey: "dunk" }, { word: "must", imageKey: "must" },
  ],
  shortE: [
    { word: "belt", imageKey: "belt" }, { word: "melt", imageKey: "melt" },
    { word: "desk", imageKey: "desk" }, { word: "nest", imageKey: "nest" },
    { word: "best", imageKey: "best" }, { word: "test", imageKey: "test" },
    { word: "bend", imageKey: "bend" }, { word: "send", imageKey: "send" },
    { word: "help", imageKey: "help" }, { word: "vent", imageKey: "vent" },
  ],
};
