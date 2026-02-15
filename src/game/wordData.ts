// =============================================
// wordData.ts — CVC word definitions & quests
// Wigglewoo CVC Quest
// =============================================
// Letter bank rules:
//   Early levels (words 1-4): 3 correct letters only
//   Later levels (words 5-6): +1 distractor
//   Final levels (words 7-8): +2 distractors
// =============================================

import type { CvcWord, Quest, LetterCategory, PatternType } from "./types";

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
    { word: "bat", imageKey: "bat", letters: ["b", "a", "t"], distractors: [] },
    { word: "map", imageKey: "map", letters: ["m", "a", "p"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "cap", imageKey: "cap", letters: ["c", "a", "p"], distractors: ["r"] },
    { word: "van", imageKey: "van", letters: ["v", "a", "n"], distractors: ["g"] },
    // Nodes 7-8: +2 distractors
    { word: "ham", imageKey: "ham", letters: ["h", "a", "m"], distractors: ["s", "o"] },
    { word: "cab", imageKey: "cab", letters: ["c", "a", "b"], distractors: ["l", "i"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "rat", imageKey: "rat", letters: ["r", "a", "t"], distractors: [] },
    { word: "pan", imageKey: "pan", letters: ["p", "a", "n"], distractors: [] },
    { word: "can", imageKey: "can", letters: ["c", "a", "n"], distractors: [] },
    { word: "fan", imageKey: "fan", letters: ["f", "a", "n"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "bag", imageKey: "bag", letters: ["b", "a", "g"], distractors: ["s"] },
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
    { word: "sit", imageKey: "sit", letters: ["s", "i", "t"], distractors: [] },
    { word: "pin", imageKey: "pin", letters: ["p", "i", "n"], distractors: [] },
    { word: "dig", imageKey: "dig", letters: ["d", "i", "g"], distractors: [] },
    { word: "lid", imageKey: "lid", letters: ["l", "i", "d"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "wig", imageKey: "wig", letters: ["w", "i", "g"], distractors: ["b"] },
    { word: "rip", imageKey: "rip", letters: ["r", "i", "p"], distractors: ["n"] },
    // Nodes 7-8: +2 distractors
    { word: "mix", imageKey: "mix", letters: ["m", "i", "x"], distractors: ["t", "a"] },
    { word: "zip", imageKey: "zip", letters: ["z", "i", "p"], distractors: ["k", "u"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "pig", imageKey: "pig", letters: ["p", "i", "g"], distractors: [] },
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
    { word: "pot", imageKey: "pot", letters: ["p", "o", "t"], distractors: [] },
    { word: "log", imageKey: "log", letters: ["l", "o", "g"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "box", imageKey: "box", letters: ["b", "o", "x"], distractors: ["n"] },
    { word: "mop", imageKey: "mop", letters: ["m", "o", "p"], distractors: ["t"] },
    // Nodes 7-8: +2 distractors
    { word: "cot", imageKey: "cot", letters: ["c", "o", "t"], distractors: ["r", "a"] },
    { word: "fox", imageKey: "fox", letters: ["f", "o", "x"], distractors: ["w", "i"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "cob", imageKey: "cob", letters: ["c", "o", "b"], distractors: [] },
    { word: "dot", imageKey: "dot", letters: ["d", "o", "t"], distractors: [] },
    { word: "jog", imageKey: "jog", letters: ["j", "o", "g"], distractors: [] },
    { word: "rot", imageKey: "rot", letters: ["r", "o", "t"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "top", imageKey: "top", letters: ["t", "o", "p"], distractors: ["s"] },
    { word: "sob", imageKey: "sob", letters: ["s", "o", "b"], distractors: ["n"] },
    // Nodes 15-16: +2 distractors
    { word: "pop", imageKey: "pop", letters: ["p", "o", "p"], distractors: ["t", "a"] },
    { word: "nod", imageKey: "nod", letters: ["n", "o", "d"], distractors: ["g", "i"] },
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
    { word: "bus", imageKey: "bus", letters: ["b", "u", "s"], distractors: [] },
    { word: "tub", imageKey: "tub", letters: ["t", "u", "b"], distractors: [] },
    { word: "rug", imageKey: "rug", letters: ["r", "u", "g"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "sun", imageKey: "sun", letters: ["s", "u", "n"], distractors: ["m"] },
    { word: "hug", imageKey: "hug", letters: ["h", "u", "g"], distractors: ["p"] },
    // Nodes 7-8: +2 distractors
    { word: "mud", imageKey: "mud", letters: ["m", "u", "d"], distractors: ["f", "e"] },
    { word: "bug", imageKey: "bug", letters: ["b", "u", "g"], distractors: ["l", "a"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "pup", imageKey: "pup", letters: ["p", "u", "p"], distractors: [] },
    { word: "jug", imageKey: "jug", letters: ["j", "u", "g"], distractors: [] },
    { word: "gum", imageKey: "gum", letters: ["g", "u", "m"], distractors: [] },
    { word: "run", imageKey: "run", letters: ["r", "u", "n"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "fun", imageKey: "fun", letters: ["f", "u", "n"], distractors: ["t"] },
    { word: "dug", imageKey: "dug", letters: ["d", "u", "g"], distractors: ["b"] },
    // Nodes 15-16: +2 distractors
    { word: "nut", imageKey: "nut", letters: ["n", "u", "t"], distractors: ["s", "a"] },
    { word: "cut", imageKey: "cut", letters: ["c", "u", "t"], distractors: ["p", "o"] },
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
    { word: "hen", imageKey: "hen", letters: ["h", "e", "n"], distractors: [] },
    { word: "red", imageKey: "red", letters: ["r", "e", "d"], distractors: [] },
    { word: "pen", imageKey: "pen", letters: ["p", "e", "n"], distractors: [] },
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
    { word: "peg", imageKey: "peg", letters: ["p", "e", "g"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "set", imageKey: "set", letters: ["s", "e", "t"], distractors: ["m"] },
    { word: "get", imageKey: "get", letters: ["g", "e", "t"], distractors: ["n"] },
    // Nodes 15-16: +2 distractors
    { word: "men", imageKey: "men", letters: ["m", "e", "n"], distractors: ["t", "a"] },
    { word: "vet", imageKey: "vet", letters: ["v", "e", "t"], distractors: ["p", "u"] },
  ],
};

// =============================================================
// CVCC QUESTS — Ending Blends (LOCKED — no images/audio yet)
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
    { word: "lamp", imageKey: "lamp", letters: ["l", "a", "m", "p"], distractors: [] },
    { word: "camp", imageKey: "camp", letters: ["c", "a", "m", "p"], distractors: [] },
    { word: "damp", imageKey: "damp", letters: ["d", "a", "m", "p"], distractors: [] },
    { word: "band", imageKey: "band", letters: ["b", "a", "n", "d"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "hand", imageKey: "hand", letters: ["h", "a", "n", "d"], distractors: ["k"] },
    { word: "sand", imageKey: "sand", letters: ["s", "a", "n", "d"], distractors: ["g"] },
    // Nodes 7-8: +2 distractors
    { word: "land", imageKey: "land", letters: ["l", "a", "n", "d"], distractors: ["p", "o"] },
    { word: "mask", imageKey: "mask", letters: ["m", "a", "s", "k"], distractors: ["t", "i"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "task", imageKey: "task", letters: ["t", "a", "s", "k"], distractors: [] },
    { word: "fast", imageKey: "fast", letters: ["f", "a", "s", "t"], distractors: [] },
    { word: "last", imageKey: "last", letters: ["l", "a", "s", "t"], distractors: [] },
    { word: "mast", imageKey: "mast", letters: ["m", "a", "s", "t"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "pant", imageKey: "pant", letters: ["p", "a", "n", "t"], distractors: ["g"] },
    { word: "rant", imageKey: "rant", letters: ["r", "a", "n", "t"], distractors: ["b"] },
    // Nodes 15-16: +2 distractors
    { word: "daft", imageKey: "daft", letters: ["d", "a", "f", "t"], distractors: ["n", "e"] },
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
    { word: "silk", imageKey: "silk", letters: ["s", "i", "l", "k"], distractors: [] },
    { word: "gift", imageKey: "gift", letters: ["g", "i", "f", "t"], distractors: [] },
    { word: "lift", imageKey: "lift", letters: ["l", "i", "f", "t"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "fist", imageKey: "fist", letters: ["f", "i", "s", "t"], distractors: ["n"] },
    { word: "list", imageKey: "list", letters: ["l", "i", "s", "t"], distractors: ["p"] },
    // Nodes 7-8: +2 distractors
    { word: "mint", imageKey: "mint", letters: ["m", "i", "n", "t"], distractors: ["d", "a"] },
    { word: "hint", imageKey: "hint", letters: ["h", "i", "n", "t"], distractors: ["g", "u"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "king", imageKey: "king", letters: ["k", "i", "n", "g"], distractors: [] },
    { word: "ring", imageKey: "ring", letters: ["r", "i", "n", "g"], distractors: [] },
    { word: "sing", imageKey: "sing", letters: ["s", "i", "n", "g"], distractors: [] },
    { word: "wind", imageKey: "wind", letters: ["w", "i", "n", "d"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "limp", imageKey: "limp", letters: ["l", "i", "m", "p"], distractors: ["k"] },
    { word: "disk", imageKey: "disk", letters: ["d", "i", "s", "k"], distractors: ["n"] },
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
    { word: "bond", imageKey: "bond", letters: ["b", "o", "n", "d"], distractors: [] },
    { word: "fond", imageKey: "fond", letters: ["f", "o", "n", "d"], distractors: [] },
    { word: "lost", imageKey: "lost", letters: ["l", "o", "s", "t"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "cost", imageKey: "cost", letters: ["c", "o", "s", "t"], distractors: ["n"] },
    { word: "lock", imageKey: "lock", letters: ["l", "o", "c", "k"], distractors: ["d"] },
    // Nodes 7-8: +2 distractors
    { word: "dock", imageKey: "dock", letters: ["d", "o", "c", "k"], distractors: ["m", "i"] },
    { word: "rock", imageKey: "rock", letters: ["r", "o", "c", "k"], distractors: ["t", "a"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "sock", imageKey: "sock", letters: ["s", "o", "c", "k"], distractors: [] },
    { word: "long", imageKey: "long", letters: ["l", "o", "n", "g"], distractors: [] },
    { word: "song", imageKey: "song", letters: ["s", "o", "n", "g"], distractors: [] },
    { word: "gong", imageKey: "gong", letters: ["g", "o", "n", "g"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "romp", imageKey: "romp", letters: ["r", "o", "m", "p"], distractors: ["s"] },
    { word: "loft", imageKey: "loft", letters: ["l", "o", "f", "t"], distractors: ["n"] },
    // Nodes 15-16: +2 distractors
    { word: "mock", imageKey: "mock", letters: ["m", "o", "c", "k"], distractors: ["l", "e"] },
    { word: "soft", imageKey: "soft", letters: ["s", "o", "f", "t"], distractors: ["n", "i"] },
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
    { word: "gust", imageKey: "gust", letters: ["g", "u", "s", "t"], distractors: [] },
    { word: "must", imageKey: "must", letters: ["m", "u", "s", "t"], distractors: [] },
    { word: "rust", imageKey: "rust", letters: ["r", "u", "s", "t"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "bump", imageKey: "bump", letters: ["b", "u", "m", "p"], distractors: ["t"] },
    { word: "dump", imageKey: "dump", letters: ["d", "u", "m", "p"], distractors: ["g"] },
    // Nodes 7-8: +2 distractors
    { word: "jump", imageKey: "jump", letters: ["j", "u", "m", "p"], distractors: ["s", "a"] },
    { word: "pump", imageKey: "pump", letters: ["p", "u", "m", "p"], distractors: ["l", "i"] },
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
    { word: "husk", imageKey: "husk", letters: ["h", "u", "s", "k"], distractors: ["n", "o"] },
    { word: "tusk", imageKey: "tusk", letters: ["t", "u", "s", "k"], distractors: ["m", "a"] },
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
    { word: "melt", imageKey: "melt", letters: ["m", "e", "l", "t"], distractors: [] },
    { word: "felt", imageKey: "felt", letters: ["f", "e", "l", "t"], distractors: [] },
    { word: "desk", imageKey: "desk", letters: ["d", "e", "s", "k"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "nest", imageKey: "nest", letters: ["n", "e", "s", "t"], distractors: ["g"] },
    { word: "best", imageKey: "best", letters: ["b", "e", "s", "t"], distractors: ["m"] },
    // Nodes 7-8: +2 distractors
    { word: "test", imageKey: "test", letters: ["t", "e", "s", "t"], distractors: ["r", "a"] },
    { word: "west", imageKey: "west", letters: ["w", "e", "s", "t"], distractors: ["p", "u"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "bend", imageKey: "bend", letters: ["b", "e", "n", "d"], distractors: [] },
    { word: "lend", imageKey: "lend", letters: ["l", "e", "n", "d"], distractors: [] },
    { word: "mend", imageKey: "mend", letters: ["m", "e", "n", "d"], distractors: [] },
    { word: "send", imageKey: "send", letters: ["s", "e", "n", "d"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "help", imageKey: "help", letters: ["h", "e", "l", "p"], distractors: ["t"] },
    { word: "kelp", imageKey: "kelp", letters: ["k", "e", "l", "p"], distractors: ["n"] },
    // Nodes 15-16: +2 distractors
    { word: "pest", imageKey: "pest", letters: ["p", "e", "s", "t"], distractors: ["r", "i"] },
    { word: "vent", imageKey: "vent", letters: ["v", "e", "n", "t"], distractors: ["s", "o"] },
  ],
};

// =============================================================
// CVVC QUESTS — Vowel Teams (LOCKED — no images/audio yet)
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
    { word: "rain", imageKey: "rain", letters: ["r", "a", "i", "n"], distractors: [] },
    { word: "tail", imageKey: "tail", letters: ["t", "a", "i", "l"], distractors: [] },
    { word: "mail", imageKey: "mail", letters: ["m", "a", "i", "l"], distractors: [] },
    { word: "sail", imageKey: "sail", letters: ["s", "a", "i", "l"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "pail", imageKey: "pail", letters: ["p", "a", "i", "l"], distractors: ["t"] },
    { word: "wait", imageKey: "wait", letters: ["w", "a", "i", "t"], distractors: ["n"] },
    // Nodes 7-8: +2 distractors
    { word: "pain", imageKey: "pain", letters: ["p", "a", "i", "n"], distractors: ["g", "o"] },
    { word: "gain", imageKey: "gain", letters: ["g", "a", "i", "n"], distractors: ["s", "u"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "rail", imageKey: "rail", letters: ["r", "a", "i", "l"], distractors: [] },
    { word: "nail", imageKey: "nail", letters: ["n", "a", "i", "l"], distractors: [] },
    { word: "bait", imageKey: "bait", letters: ["b", "a", "i", "t"], distractors: [] },
    { word: "laid", imageKey: "laid", letters: ["l", "a", "i", "d"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "paid", imageKey: "paid", letters: ["p", "a", "i", "d"], distractors: ["m"] },
    { word: "main", imageKey: "main", letters: ["m", "a", "i", "n"], distractors: ["t"] },
    // Nodes 15-16: +2 distractors
    { word: "fail", imageKey: "fail", letters: ["f", "a", "i", "l"], distractors: ["d", "e"] },
    { word: "wail", imageKey: "wail", letters: ["w", "a", "i", "l"], distractors: ["p", "o"] },
  ],
};

/** CVVC Quest 2 — long-e vowel teams (16 words) */
export const QUEST_CVVC_LONG_E: Quest = {
  id: "quest-cvvc-long-e",
  title: "Long E Vowel Teams",
  patternType: "cvvc",
  words: [
    // Nodes 1-4: no distractors
    { word: "seed", imageKey: "seed", letters: ["s", "e", "e", "d"], distractors: [] },
    { word: "feed", imageKey: "feed", letters: ["f", "e", "e", "d"], distractors: [] },
    { word: "weed", imageKey: "weed", letters: ["w", "e", "e", "d"], distractors: [] },
    { word: "feel", imageKey: "feel", letters: ["f", "e", "e", "l"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "peel", imageKey: "peel", letters: ["p", "e", "e", "l"], distractors: ["d"] },
    { word: "heel", imageKey: "heel", letters: ["h", "e", "e", "l"], distractors: ["s"] },
    // Nodes 7-8: +2 distractors
    { word: "reef", imageKey: "reef", letters: ["r", "e", "e", "f"], distractors: ["t", "a"] },
    { word: "beef", imageKey: "beef", letters: ["b", "e", "e", "f"], distractors: ["n", "i"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "deep", imageKey: "deep", letters: ["d", "e", "e", "p"], distractors: [] },
    { word: "keep", imageKey: "keep", letters: ["k", "e", "e", "p"], distractors: [] },
    { word: "seep", imageKey: "seep", letters: ["s", "e", "e", "p"], distractors: [] },
    { word: "week", imageKey: "week", letters: ["w", "e", "e", "k"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "seek", imageKey: "seek", letters: ["s", "e", "e", "k"], distractors: ["n"] },
    { word: "peek", imageKey: "peek", letters: ["p", "e", "e", "k"], distractors: ["f"] },
    // Nodes 15-16: +2 distractors
    { word: "deer", imageKey: "deer", letters: ["d", "e", "e", "r"], distractors: ["t", "o"] },
    { word: "jeep", imageKey: "jeep", letters: ["j", "e", "e", "p"], distractors: ["l", "a"] },
  ],
};

/** CVVC Quest 3 — long-o vowel teams (16 words) */
export const QUEST_CVVC_LONG_O: Quest = {
  id: "quest-cvvc-long-o",
  title: "Long O Vowel Teams",
  patternType: "cvvc",
  words: [
    // Nodes 1-4: no distractors
    { word: "boat", imageKey: "boat", letters: ["b", "o", "a", "t"], distractors: [] },
    { word: "coat", imageKey: "coat", letters: ["c", "o", "a", "t"], distractors: [] },
    { word: "goat", imageKey: "goat", letters: ["g", "o", "a", "t"], distractors: [] },
    { word: "road", imageKey: "road", letters: ["r", "o", "a", "d"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "toad", imageKey: "toad", letters: ["t", "o", "a", "d"], distractors: ["n"] },
    { word: "load", imageKey: "load", letters: ["l", "o", "a", "d"], distractors: ["s"] },
    // Nodes 7-8: +2 distractors
    { word: "soap", imageKey: "soap", letters: ["s", "o", "a", "p"], distractors: ["t", "i"] },
    { word: "foam", imageKey: "foam", letters: ["f", "o", "a", "m"], distractors: ["d", "e"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "coal", imageKey: "coal", letters: ["c", "o", "a", "l"], distractors: [] },
    { word: "foal", imageKey: "foal", letters: ["f", "o", "a", "l"], distractors: [] },
    { word: "goal", imageKey: "goal", letters: ["g", "o", "a", "l"], distractors: [] },
    { word: "moan", imageKey: "moan", letters: ["m", "o", "a", "n"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "loan", imageKey: "loan", letters: ["l", "o", "a", "n"], distractors: ["t"] },
    { word: "soak", imageKey: "soak", letters: ["s", "o", "a", "k"], distractors: ["d"] },
    // Nodes 15-16: +2 distractors
    { word: "roam", imageKey: "roam", letters: ["r", "o", "a", "m"], distractors: ["t", "i"] },
    { word: "moat", imageKey: "moat", letters: ["m", "o", "a", "t"], distractors: ["l", "e"] },
  ],
};

/** CVVC Quest 4 — oo/ou vowel teams (16 words) */
export const QUEST_CVVC_LONG_U: Quest = {
  id: "quest-cvvc-long-u",
  title: "OO Vowel Teams",
  patternType: "cvvc",
  words: [
    // Nodes 1-4: no distractors
    { word: "moon", imageKey: "moon", letters: ["m", "o", "o", "n"], distractors: [] },
    { word: "noon", imageKey: "noon", letters: ["n", "o", "o", "n"], distractors: [] },
    { word: "soon", imageKey: "soon", letters: ["s", "o", "o", "n"], distractors: [] },
    { word: "boot", imageKey: "boot", letters: ["b", "o", "o", "t"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "hoop", imageKey: "hoop", letters: ["h", "o", "o", "p"], distractors: ["n"] },
    { word: "loop", imageKey: "loop", letters: ["l", "o", "o", "p"], distractors: ["t"] },
    // Nodes 7-8: +2 distractors
    { word: "roof", imageKey: "roof", letters: ["r", "o", "o", "f"], distractors: ["m", "a"] },
    { word: "pool", imageKey: "pool", letters: ["p", "o", "o", "l"], distractors: ["t", "e"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "cool", imageKey: "cool", letters: ["c", "o", "o", "l"], distractors: [] },
    { word: "fool", imageKey: "fool", letters: ["f", "o", "o", "l"], distractors: [] },
    { word: "tool", imageKey: "tool", letters: ["t", "o", "o", "l"], distractors: [] },
    { word: "room", imageKey: "room", letters: ["r", "o", "o", "m"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "zoom", imageKey: "zoom", letters: ["z", "o", "o", "m"], distractors: ["l"] },
    { word: "boom", imageKey: "boom", letters: ["b", "o", "o", "m"], distractors: ["n"] },
    // Nodes 15-16: +2 distractors
    { word: "loom", imageKey: "loom", letters: ["l", "o", "o", "m"], distractors: ["s", "a"] },
    { word: "hoot", imageKey: "hoot", letters: ["h", "o", "o", "t"], distractors: ["p", "i"] },
  ],
};

/** CVVC Quest 5 — ea/ee mixed vowel teams (16 words) */
export const QUEST_CVVC_MIXED_EA: Quest = {
  id: "quest-cvvc-mixed-ea",
  title: "EA Vowel Teams",
  patternType: "cvvc",
  words: [
    // Nodes 1-4: no distractors
    { word: "bean", imageKey: "bean", letters: ["b", "e", "a", "n"], distractors: [] },
    { word: "leaf", imageKey: "leaf", letters: ["l", "e", "a", "f"], distractors: [] },
    { word: "meal", imageKey: "meal", letters: ["m", "e", "a", "l"], distractors: [] },
    { word: "seal", imageKey: "seal", letters: ["s", "e", "a", "l"], distractors: [] },
    // Nodes 5-6: +1 distractor
    { word: "bead", imageKey: "bead", letters: ["b", "e", "a", "d"], distractors: ["n"] },
    { word: "read", imageKey: "read", letters: ["r", "e", "a", "d"], distractors: ["l"] },
    // Nodes 7-8: +2 distractors
    { word: "heap", imageKey: "heap", letters: ["h", "e", "a", "p"], distractors: ["t", "o"] },
    { word: "lean", imageKey: "lean", letters: ["l", "e", "a", "n"], distractors: ["d", "i"] },
    // === NODES 9-16 (after Trophy Room) ===
    // Nodes 9-12: no distractors
    { word: "peak", imageKey: "peak", letters: ["p", "e", "a", "k"], distractors: [] },
    { word: "beak", imageKey: "beak", letters: ["b", "e", "a", "k"], distractors: [] },
    { word: "teak", imageKey: "teak", letters: ["t", "e", "a", "k"], distractors: [] },
    { word: "deal", imageKey: "deal", letters: ["d", "e", "a", "l"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "heal", imageKey: "heal", letters: ["h", "e", "a", "l"], distractors: ["p"] },
    { word: "real", imageKey: "real", letters: ["r", "e", "a", "l"], distractors: ["n"] },
    // Nodes 15-16: +2 distractors
    { word: "beat", imageKey: "beat", letters: ["b", "e", "a", "t"], distractors: ["l", "o"] },
    { word: "heat", imageKey: "heat", letters: ["h", "e", "a", "t"], distractors: ["s", "u"] },
  ],
};

/** CVC quests only (for current enabled gameplay) */
export const CVC_QUESTS: Quest[] = [
  QUEST_SHORT_A,
  QUEST_SHORT_I,
  QUEST_SHORT_O,
  QUEST_SHORT_U,
  QUEST_SHORT_E,
];

/** CVCC quests (locked — no images/audio yet) */
export const CVCC_QUESTS: Quest[] = [
  QUEST_CVCC_SHORT_A,
  QUEST_CVCC_SHORT_I,
  QUEST_CVCC_SHORT_O,
  QUEST_CVCC_SHORT_U,
  QUEST_CVCC_SHORT_E,
];

/** CVVC quests (locked — no images/audio yet) */
export const CVVC_QUESTS: Quest[] = [
  QUEST_CVVC_LONG_A,
  QUEST_CVVC_LONG_E,
  QUEST_CVVC_LONG_O,
  QUEST_CVVC_LONG_U,
  QUEST_CVVC_MIXED_EA,
];

/** Ordered quest sequence — all patterns */
export const ALL_QUESTS: Quest[] = [
  ...CVC_QUESTS,
  ...CVCC_QUESTS,
  ...CVVC_QUESTS,
];

/** Get a quest by ID */
export function getQuestById(id: string): Quest | undefined {
  return ALL_QUESTS.find((q) => q.id === id);
}

/** Get the next quest in sequence (null if at end) */
export function getNextQuest(currentQuestId: string): Quest | null {
  const idx = ALL_QUESTS.findIndex((q) => q.id === currentQuestId);
  if (idx < 0 || idx >= ALL_QUESTS.length - 1) return null;
  return ALL_QUESTS[idx + 1];
}

/** 
 * Context-rich sentences for each word
 * Each sentence provides a semantic clue to help early readers
 */
export const WORD_SENTENCES: Record<string, string> = {
  // Short A words (nodes 1-8)
  cat: "This furry pet says meow. It is a ___.",
  hat: "I put this on my head when it is sunny. It is a ___.",
  bat: "This animal flies at night and sleeps upside down. It is a ___.",
  map: "When we get lost, we look at a ___.",
  cap: "A baseball player wears this on their head. It is a ___.",
  van: "My family drives this big car on road trips. It is a ___.",
  ham: "This pink meat comes from a pig. It is ___.",
  cab: "This yellow car takes you where you need to go. It is a ___.",
  // Short A words (nodes 9-16)
  rat: "This small animal has a long tail and lives in holes. It is a ___.",
  pan: "I cook eggs in this flat metal thing. It is a ___.",
  can: "Soup comes in this metal container. It is a ___.",
  fan: "When I am hot, I turn on the ___ to cool down.",
  bag: "I carry my lunch to school in a ___.",
  nap: "When I am sleepy, I take a short ___.",
  sad: "When my friend moved away, I felt ___.",
  tag: "The game where you chase and touch someone is called ___.",
  
  // Short I words (nodes 1-8)
  sit: "When I am tired, I find a chair and ___.",
  pin: "I use this sharp little thing to hold fabric together. It is a ___.",
  dig: "Dogs love to ___ holes in the yard.",
  lid: "I put this on top of the pot to keep it covered. It is a ___.",
  wig: "An actor wears this fake hair on their head. It is a ___.",
  rip: "Oh no! I tore my paper. Now it has a ___.",
  mix: "To make a cake, I stir and ___ all the ingredients.",
  zip: "I pull this up to close my jacket. It goes ___.",
  // Short I words (nodes 9-16)
  pig: "This pink farm animal says oink. It is a ___.",
  bib: "A baby wears this to keep food off their clothes. It is a ___.",
  hit: "In baseball, I use a bat to ___ the ball.",
  kit: "A box with supplies for a project is called a ___.",
  tip: "The pointy end of a pencil is called the ___.",
  win: "When you finish first in a race, you ___!",
  fin: "A fish uses this to swim. It is a ___.",
  sip: "I take a small ___ of my juice.",
  
  // Short O words (nodes 1-8)
  dog: "This pet barks and wags its tail. It is a ___.",
  hop: "A bunny likes to ___ around the garden.",
  pot: "I cook soup in this. It is a ___.",
  log: "We burn this piece of wood in the fireplace. It is a ___.",
  box: "I put my toys inside this cardboard ___.",
  mop: "I clean the wet floor with a ___.",
  cot: "When camping, I sleep on this small folding bed. It is a ___.",
  fox: "This clever orange animal has a bushy tail. It is a ___.",
  // Short O words (nodes 9-16)
  cob: "Corn grows on a ___.",
  dot: "A tiny round spot is called a ___.",
  jog: "When I run slowly for exercise, I ___.",
  rot: "When fruit gets old and bad, it starts to ___.",
  top: "A spinning toy is called a ___.",
  sob: "When you cry hard, you ___.",
  pop: "A balloon makes a loud ___ when it bursts.",
  nod: "I ___ my head up and down to say yes.",
  
  // Short U words (nodes 1-8)
  cup: "I drink my milk from a ___.",
  bus: "I ride this big yellow vehicle to school. It is a ___.",
  tub: "I take a bubble bath in the ___.",
  rug: "This soft mat covers the floor. It is a ___.",
  sun: "This big bright star shines in the sky. It is the ___.",
  hug: "When I love someone, I give them a big ___.",
  mud: "After it rains, the dirt turns into wet ___.",
  bug: "This tiny crawling creature has six legs. It is a ___.",
  // Short U words (nodes 9-16)
  pup: "A baby dog is called a ___.",
  jug: "I pour water from a big ___.",
  gum: "I chew this sticky treat. It is ___.",
  run: "When I want to go fast, I ___!",
  fun: "Playing at the park is so much ___!",
  dug: "The dog ___ a hole in the backyard.",
  nut: "A squirrel loves to eat this crunchy seed. It is a ___.",
  cut: "I use scissors to ___ the paper.",
  
  // Short E words (nodes 1-8)
  bed: "At night, I sleep in my cozy ___.",
  hen: "This farm bird lays eggs. It is a ___.",
  red: "A fire truck is this bright color. It is ___.",
  pen: "I use this to write my name. It is a ___.",
  jet: "This fast airplane flies through the sky. It is a ___.",
  net: "I catch butterflies with a ___.",
  wet: "After swimming, my hair is all ___.",
  leg: "I have two of these to walk and run. Each one is a ___.",
  // Short E words (nodes 9-16)
  pet: "A dog or cat that lives with you is a ___.",
  ten: "I have ___ fingers on my two hands.",
  beg: "My dog will ___ for a treat.",
  peg: "I hang my coat on a wooden ___.",
  set: "I ___ the table for dinner.",
  get: "I ___ my backpack before school.",
  men: "Grown-up boys are called ___.",
  vet: "When my pet is sick, I take it to the ___.",

  // ── CVCC: Short A ending blends ──
  lamp: "I turn on the ___ so I can read at night.",
  camp: "In the summer, we set up tents at ___.",
  damp: "After the rain, the grass feels ___.",
  band: "The ___ plays music on stage.",
  hand: "I wave my ___ to say hello.",
  sand: "At the beach, I build castles in the ___.",
  land: "The airplane comes down to ___ on the runway.",
  mask: "On Halloween, I wear a spooky ___.",
  task: "The teacher gave us a fun ___ to finish.",
  fast: "A cheetah can run really ___.",
  last: "I was the ___ one to finish the race.",
  mast: "The tall pole on a sailboat is called a ___.",
  pant: "After running, I huff and ___.",
  rant: "When someone talks angrily for a long time, they ___.",
  daft: "That silly idea sounds a bit ___.",
  raft: "We floated down the river on a ___.",

  // ── CVCC: Short I ending blends ──
  milk: "I pour cold ___ into my cereal.",
  silk: "This smooth, shiny fabric is called ___.",
  gift: "On my birthday, I open a wrapped ___.",
  lift: "I ___ the heavy box off the floor.",
  fist: "I make a ___ by closing my hand tight.",
  list: "I wrote a ___ of things to buy at the store.",
  mint: "This fresh green herb is called ___.",
  hint: "Give me a ___ so I can guess the answer.",
  king: "The ___ wears a golden crown.",
  ring: "I wear a shiny ___ on my finger.",
  sing: "The birds ___ a pretty song in the morning.",
  wind: "The ___ blows the leaves off the trees.",
  limp: "When my leg hurts, I walk with a ___.",
  disk: "I saved my work on a round ___.",
  film: "We watched a fun ___ at the movies.",
  tilt: "If you lean the cup, it will ___ and spill.",

  // ── CVCC: Short O ending blends ──
  pond: "Ducks swim in the ___ at the park.",
  bond: "Best friends share a strong ___.",
  fond: "I am very ___ of my grandma's cookies.",
  lost: "I can't find my toy — it is ___.",
  cost: "How much does this candy ___?",
  lock: "I use a key to open the ___.",
  dock: "The boat is tied up at the ___.",
  rock: "I found a smooth ___ by the river.",
  sock: "I put a ___ on each foot before my shoes.",
  long: "A giraffe has a very ___ neck.",
  song: "My favorite ___ makes me want to dance.",
  gong: "The big metal ___ makes a loud ringing sound.",
  romp: "The puppies love to ___ and play in the yard.",
  loft: "We store old boxes up in the ___.",
  mock: "It is not nice to ___ someone or make fun of them.",
  soft: "This fluffy pillow feels very ___.",

  // ── CVCC: Short U ending blends ──
  dust: "I wipe the ___ off the shelf with a cloth.",
  gust: "A strong ___ of wind blew my hat away.",
  must: "I ___ brush my teeth before bed.",
  rust: "Old metal turns orange-brown with ___.",
  bump: "I hit a ___ in the road and bounced up.",
  dump: "The truck will ___ the dirt in a pile.",
  jump: "I love to ___ on the trampoline.",
  pump: "I use a ___ to fill my bike tire with air.",
  bulk: "We buy snacks in ___ to save money.",
  hulk: "The big strong green hero is called the ___.",
  bunk: "I sleep on the top ___ bed.",
  dunk: "I ___ my cookie in the milk.",
  lung: "I take a deep breath and fill my ___ with air.",
  hung: "I ___ my coat on the hook by the door.",
  husk: "The dry outer shell of corn is called a ___.",
  tusk: "An elephant has a long white ___ made of ivory.",

  // ── CVCC: Short E ending blends ──
  belt: "I wear a ___ to hold up my pants.",
  melt: "Ice cream will ___ if you leave it in the sun.",
  felt: "I ___ happy when my friend came to visit.",
  desk: "I do my homework sitting at my ___.",
  nest: "A bird builds a ___ for its eggs.",
  best: "You are my ___ friend in the whole world.",
  test: "The teacher gave us a spelling ___.",
  west: "The sun goes down in the ___.",
  bend: "I ___ down to tie my shoe.",
  lend: "Can you ___ me your pencil?",
  mend: "Mom will ___ the hole in my sock.",
  send: "I will ___ a letter to my grandma.",
  help: "Can you ___ me reach the top shelf?",
  kelp: "Long green seaweed in the ocean is called ___.",
  pest: "A bug that bothers you is called a ___.",
  vent: "Cool air blows out of the ___ on the ceiling.",

  // ── CVVC: Long A vowel teams (ai) ──
  rain: "Water falls from the clouds when it starts to ___.",
  tail: "A dog wags its ___ when it is happy.",
  mail: "The letter carrier brings the ___ to our house.",
  sail: "The wind fills the ___ and pushes the boat.",
  pail: "I carry water in a ___.",
  wait: "We have to ___ in line for our turn.",
  pain: "When I stubbed my toe, I felt ___.",
  gain: "I study hard to ___ new knowledge.",
  rail: "I hold onto the ___ when I walk down the stairs.",
  nail: "I hammer a ___ into the wood.",
  bait: "We put ___ on the hook to catch a fish.",
  laid: "The hen ___ an egg in the nest.",
  paid: "Mom ___ for the groceries at the store.",
  main: "The ___ road through town is always busy.",
  fail: "If you try your best, you will not ___.",
  wail: "The baby started to ___ and cry loudly.",

  // ── CVVC: Long E vowel teams (ee) ──
  seed: "I plant a ___ in the garden and watch it grow.",
  feed: "I ___ my fish every morning.",
  weed: "I pull out this unwanted plant — it is a ___.",
  feel: "I ___ happy when the sun is shining.",
  peel: "I ___ the banana before I eat it.",
  heel: "The back of my shoe rubs against my ___.",
  reef: "Colorful fish swim around the coral ___.",
  beef: "A hamburger is made from ___.",
  deep: "The ocean is very ___ in the middle.",
  keep: "I ___ my favorite toys in a special box.",
  seep: "Water will ___ slowly through the cracks.",
  week: "There are seven days in a ___.",
  seek: "In hide and seek, one person must ___ the others.",
  peek: "I ___ through the window to see outside.",
  deer: "A ___ has big antlers and lives in the forest.",
  jeep: "We drove the big ___ over the bumpy trail.",

  // ── CVVC: Long O vowel teams (oa) ──
  boat: "We ride across the lake in a ___.",
  coat: "I wear my warm ___ when it is cold outside.",
  goat: "This farm animal has a beard and says baa. It is a ___.",
  road: "Cars drive on the ___.",
  toad: "A ___ is like a bumpy frog that lives on land.",
  load: "The truck carries a heavy ___ of bricks.",
  soap: "I wash my hands with bubbly ___.",
  foam: "The waves leave white ___ on the sand.",
  coal: "This black rock burns in a fireplace. It is ___.",
  foal: "A baby horse is called a ___.",
  goal: "I kicked the ball into the ___!",
  moan: "When my tummy hurts, I ___ a little.",
  loan: "The library will ___ you books for free.",
  soak: "I ___ in a warm bath to feel better.",
  roam: "The dogs love to ___ around the big yard.",
  moat: "A castle has water around it called a ___.",

  // ── CVVC: OO vowel teams ──
  moon: "The ___ shines bright in the night sky.",
  noon: "Lunchtime is at ___, right in the middle of the day.",
  soon: "We will arrive at the park very ___.",
  boot: "I put on my rain ___ to splash in puddles.",
  hoop: "I throw the ball through the basketball ___.",
  loop: "I tied my ribbon in a big ___.",
  roof: "The ___ of the house keeps the rain out.",
  pool: "I swim in the ___ when it is hot outside.",
  cool: "The breeze feels nice and ___.",
  fool: "April first is when people play ___ tricks.",
  tool: "A hammer is a ___ you use to build things.",
  room: "My bedroom is my favorite ___ in the house.",
  zoom: "The race car goes ___ around the track.",
  boom: "Thunder makes a loud ___ sound.",
  loom: "Dark clouds ___ in the sky before a storm.",
  hoot: "An owl says ___ at night.",

  // ── CVVC: EA vowel teams ──
  bean: "I like to eat green ___ with my dinner.",
  leaf: "A green ___ fell from the tree.",
  meal: "Breakfast is the first ___ of the day.",
  seal: "This animal claps its flippers and lives by the sea. It is a ___.",
  bead: "I string each colorful ___ onto the necklace.",
  read: "I love to ___ books before bedtime.",
  heap: "I raked the leaves into a big ___.",
  lean: "Don't ___ too far over the railing.",
  peak: "The mountain ___ is covered in snow.",
  beak: "A bird picks up food with its ___.",
  teak: "This strong brown wood is called ___.",
  deal: "Let's make a ___— I'll trade you my apple.",
  heal: "A bandage helps a cut ___ faster.",
  real: "Is that a ___ diamond or a fake one?",
  beat: "I ___ the drum with my sticks.",
  heat: "The ___ from the sun warms my face.",
};

/** Get the learning sentence for a word */
export function getWordSentence(word: string): string {
  return WORD_SENTENCES[word] || `Can you spell the word ___?`;
}

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

/** 
 * CVCC Word Bank organized by vowel for Trophy Room mini-game
 * (Locked — included for data completeness)
 */
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
    { word: "dunk", imageKey: "dunk" }, { word: "tusk", imageKey: "tusk" },
  ],
  shortE: [
    { word: "belt", imageKey: "belt" }, { word: "melt", imageKey: "melt" },
    { word: "desk", imageKey: "desk" }, { word: "nest", imageKey: "nest" },
    { word: "best", imageKey: "best" }, { word: "test", imageKey: "test" },
    { word: "bend", imageKey: "bend" }, { word: "send", imageKey: "send" },
    { word: "help", imageKey: "help" }, { word: "vent", imageKey: "vent" },
  ],
};

/** 
 * CVVC Word Bank organized by vowel team for Trophy Room mini-game
 * (Locked — included for data completeness)
 */
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
