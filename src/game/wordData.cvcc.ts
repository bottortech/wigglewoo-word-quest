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
    // Nodes 1-4: no distractors
    { word: "hand", imageKey: "hand", letters: ["h", "a", "n", "d"], distractors: [] },
    { word: "lamp", imageKey: "lamp", letters: ["l", "a", "m", "p"], distractors: [] },
    { word: "camp", imageKey: "camp", letters: ["c", "a", "m", "p"], distractors: [] },
    { word: "fast", imageKey: "fast", letters: ["f", "a", "s", "t"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "last", imageKey: "last", letters: ["l", "a", "s", "t"], distractors: ["n"] },
    { word: "band", imageKey: "band", letters: ["b", "a", "n", "d"], distractors: ["g"] },
    // Nodes 7-8: +2 distractors
    { word: "sand", imageKey: "sand", letters: ["s", "a", "n", "d"], distractors: ["g", "o"] },
    { word: "land", imageKey: "land", letters: ["l", "a", "n", "d"], distractors: ["p", "o"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "damp", imageKey: "damp", letters: ["d", "a", "m", "p"], distractors: [] },
    { word: "mask", imageKey: "mask", letters: ["m", "a", "s", "k"], distractors: [] },
    { word: "task", imageKey: "task", letters: ["t", "a", "s", "k"], distractors: [] },
    { word: "mast", imageKey: "mast", letters: ["m", "a", "s", "t"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "pant", imageKey: "pant", letters: ["p", "a", "n", "t"], distractors: ["g"] },
    { word: "rant", imageKey: "rant", letters: ["r", "a", "n", "t"], distractors: ["b"] },
    // Nodes 15-16: +2 distractors
    { word: "gift", imageKey: "gift", letters: ["g", "i", "f", "t"], distractors: ["n", "e"] },
    { word: "raft", imageKey: "raft", letters: ["r", "a", "f", "t"], distractors: ["l", "u"] },
  ],
};

/** CVCC Quest 2 — short-i ending blends (16 words) */
export const QUEST_CVCC_SHORT_I: Quest = {
  id: "quest-cvcc-short-i",
  title: "Short I Ending Blends",
  patternType: "cvcc",
  words: [
    // Nodes 1-4: no distractors
    { word: "milk", imageKey: "milk", letters: ["m", "i", "l", "k"], distractors: [] },
    { word: "ring", imageKey: "ring", letters: ["r", "i", "n", "g"], distractors: [] },
    { word: "sing", imageKey: "sing", letters: ["s", "i", "n", "g"], distractors: [] },
    { word: "wind", imageKey: "wind", letters: ["w", "i", "n", "d"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "silk", imageKey: "silk", letters: ["s", "i", "l", "k"], distractors: ["n"] },
    { word: "gift", imageKey: "gift", letters: ["g", "i", "f", "t"], distractors: ["n"] },
    // Nodes 7-8: +2 distractors
    { word: "lift", imageKey: "lift", letters: ["l", "i", "f", "t"], distractors: ["n", "a"] },
    { word: "fist", imageKey: "fist", letters: ["f", "i", "s", "t"], distractors: ["n", "a"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "list", imageKey: "list", letters: ["l", "i", "s", "t"], distractors: [] },
    { word: "mint", imageKey: "mint", letters: ["m", "i", "n", "t"], distractors: [] },
    { word: "hint", imageKey: "hint", letters: ["h", "i", "n", "t"], distractors: [] },
    { word: "king", imageKey: "king", letters: ["k", "i", "n", "g"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "limp", imageKey: "limp", letters: ["l", "i", "m", "p"], distractors: ["k"] },
    { word: "risk", imageKey: "risk", letters: ["r", "i", "s", "k"], distractors: ["n"] },
    // Nodes 15-16: +2 distractors
    { word: "film", imageKey: "film", letters: ["f", "i", "l", "m"], distractors: ["t", "o"] },
    { word: "tilt", imageKey: "tilt", letters: ["t", "i", "l", "t"], distractors: ["s", "a"] },
  ],
};

/** CVCC Quest 3 — short-o ending blends (16 words) */
export const QUEST_CVCC_SHORT_O: Quest = {
  id: "quest-cvcc-short-o",
  title: "Short O Ending Blends",
  patternType: "cvcc",
  words: [
    // Nodes 1-4: no distractors
    { word: "pond", imageKey: "pond", letters: ["p", "o", "n", "d"], distractors: [] },
    { word: "rock", imageKey: "rock", letters: ["r", "o", "c", "k"], distractors: [] },
    { word: "sock", imageKey: "sock", letters: ["s", "o", "c", "k"], distractors: [] },
    { word: "lock", imageKey: "lock", letters: ["l", "o", "c", "k"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "lost", imageKey: "lost", letters: ["l", "o", "s", "t"], distractors: ["n"] },
    { word: "long", imageKey: "long", letters: ["l", "o", "n", "g"], distractors: ["t"] },
    // Nodes 7-8: +2 distractors
    { word: "song", imageKey: "song", letters: ["s", "o", "n", "g"], distractors: ["t", "a"] },
    { word: "soft", imageKey: "soft", letters: ["s", "o", "f", "t"], distractors: ["n", "i"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "bond", imageKey: "bond", letters: ["b", "o", "n", "d"], distractors: [] },
    { word: "fond", imageKey: "fond", letters: ["f", "o", "n", "d"], distractors: [] },
    { word: "cost", imageKey: "cost", letters: ["c", "o", "s", "t"], distractors: [] },
    { word: "dock", imageKey: "dock", letters: ["d", "o", "c", "k"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "gong", imageKey: "gong", letters: ["g", "o", "n", "g"], distractors: ["t"] },
    { word: "romp", imageKey: "romp", letters: ["r", "o", "m", "p"], distractors: ["s"] },
    // Nodes 15-16: +2 distractors
    { word: "loft", imageKey: "loft", letters: ["l", "o", "f", "t"], distractors: ["n", "i"] },
    { word: "mock", imageKey: "mock", letters: ["m", "o", "c", "k"], distractors: ["l", "e"] },
  ],
};

/** CVCC Quest 4 — short-u ending blends (16 words) */
export const QUEST_CVCC_SHORT_U: Quest = {
  id: "quest-cvcc-short-u",
  title: "Short U Ending Blends",
  patternType: "cvcc",
  words: [
    // Nodes 1-4: no distractors
    { word: "dust", imageKey: "dust", letters: ["d", "u", "s", "t"], distractors: [] },
    { word: "must", imageKey: "must", letters: ["m", "u", "s", "t"], distractors: [] },
    { word: "jump", imageKey: "jump", letters: ["j", "u", "m", "p"], distractors: [] },
    { word: "pump", imageKey: "pump", letters: ["p", "u", "m", "p"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "bump", imageKey: "bump", letters: ["b", "u", "m", "p"], distractors: ["t"] },
    { word: "dump", imageKey: "dump", letters: ["d", "u", "m", "p"], distractors: ["g"] },
    // Nodes 7-8: +2 distractors
    { word: "gust", imageKey: "gust", letters: ["g", "u", "s", "t"], distractors: ["n", "a"] },
    { word: "rust", imageKey: "rust", letters: ["r", "u", "s", "t"], distractors: ["n", "a"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "bulk", imageKey: "bulk", letters: ["b", "u", "l", "k"], distractors: [] },
    { word: "hulk", imageKey: "hulk", letters: ["h", "u", "l", "k"], distractors: [] },
    { word: "bunk", imageKey: "bunk", letters: ["b", "u", "n", "k"], distractors: [] },
    { word: "dunk", imageKey: "dunk", letters: ["d", "u", "n", "k"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "lung", imageKey: "lung", letters: ["l", "u", "n", "g"], distractors: ["d"] },
    { word: "hung", imageKey: "hung", letters: ["h", "u", "n", "g"], distractors: ["t"] },
    // Nodes 15-16: +2 distractors
    { word: "dusk", imageKey: "dusk", letters: ["d", "u", "s", "k"], distractors: ["n", "o"] },
    { word: "must", imageKey: "must", letters: ["m", "u", "s", "t"], distractors: ["n", "a"] },
  ],
};

/** CVCC Quest 5 — short-e ending blends (16 words) */
export const QUEST_CVCC_SHORT_E: Quest = {
  id: "quest-cvcc-short-e",
  title: "Short E Ending Blends",
  patternType: "cvcc",
  words: [
    // Nodes 1-4: no distractors
    { word: "belt", imageKey: "belt", letters: ["b", "e", "l", "t"], distractors: [] },
    { word: "best", imageKey: "best", letters: ["b", "e", "s", "t"], distractors: [] },
    { word: "test", imageKey: "test", letters: ["t", "e", "s", "t"], distractors: [] },
    { word: "nest", imageKey: "nest", letters: ["n", "e", "s", "t"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "melt", imageKey: "melt", letters: ["m", "e", "l", "t"], distractors: ["n"] },
    { word: "felt", imageKey: "felt", letters: ["f", "e", "l", "t"], distractors: ["n"] },
    // Nodes 7-8: +2 distractors
    { word: "desk", imageKey: "desk", letters: ["d", "e", "s", "k"], distractors: ["n", "a"] },
    { word: "west", imageKey: "west", letters: ["w", "e", "s", "t"], distractors: ["p", "u"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "bend", imageKey: "bend", letters: ["b", "e", "n", "d"], distractors: [] },
    { word: "lend", imageKey: "lend", letters: ["l", "e", "n", "d"], distractors: [] },
    { word: "mend", imageKey: "mend", letters: ["m", "e", "n", "d"], distractors: [] },
    { word: "send", imageKey: "send", letters: ["s", "e", "n", "d"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "help", imageKey: "help", letters: ["h", "e", "l", "p"], distractors: ["t"] },
    { word: "yelp", imageKey: "yelp", letters: ["y", "e", "l", "p"], distractors: ["n"] },
    // Nodes 15-16: +2 distractors
    { word: "pest", imageKey: "pest", letters: ["p", "e", "s", "t"], distractors: ["r", "i"] },
    { word: "vent", imageKey: "vent", letters: ["v", "e", "n", "t"], distractors: ["s", "o"] },
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
