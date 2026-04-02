// =============================================
// wordData.advanced.ts — Advanced Reading quest data (lazy-loaded)
// Wigglewoo CVC Quest
// =============================================
// Tier 5: Advanced Reading
// Focus: multisyllable, compound words, longer decodable words
// All words are kid-friendly (K-2), decodable, high-frequency
// Quest 1: 2-syllable closed (CVC+CVC pattern)
// Quest 2: Compound words
// Quest 3: Tricky two-syllable words (blends + digraphs)
// Quest 4: Longer decodable words (5-6 letters)
// Quest 5: Mixed advanced mastery (compounds + multisyllable)
// =============================================

import type { Quest } from "./types";

/** Advanced Quest 1 — Two-Syllable Words (16 words) */
export const QUEST_ADV_AR_OR: Quest = {
  id: "quest-adv-ar-or",
  title: "Two-Syllable Words",
  patternType: "advanced",
  words: [
    { word: "sunset", imageKey: "sunset", letters: ["s", "u", "n", "s", "e", "t"], distractors: [] },
    { word: "basket", imageKey: "basket", letters: ["b", "a", "s", "k", "e", "t"], distractors: [] },
    { word: "rabbit", imageKey: "rabbit", letters: ["r", "a", "b", "b", "i", "t"], distractors: [] },
    { word: "napkin", imageKey: "napkin", letters: ["n", "a", "p", "k", "i", "n"], distractors: [] },
    { word: "kitten", imageKey: "kitten", letters: ["k", "i", "t", "t", "e", "n"], distractors: ["r"] },
    { word: "mitten", imageKey: "mitten", letters: ["m", "i", "t", "t", "e", "n"], distractors: ["s"] },
    { word: "magnet", imageKey: "magnet", letters: ["m", "a", "g", "n", "e", "t"], distractors: ["r", "o"] },
    { word: "puppet", imageKey: "puppet", letters: ["p", "u", "p", "p", "e", "t"], distractors: ["n", "a"] },
    // Nodes 9-16
    { word: "picnic", imageKey: "picnic", letters: ["p", "i", "c", "n", "i", "c"], distractors: [] },
    { word: "insect", imageKey: "insect", letters: ["i", "n", "s", "e", "c", "t"], distractors: [] },
    { word: "cactus", imageKey: "cactus", letters: ["c", "a", "c", "t", "u", "s"], distractors: [] },
    { word: "rocket", imageKey: "rocket", letters: ["r", "o", "c", "k", "e", "t"], distractors: [] },
    { word: "pocket", imageKey: "pocket", letters: ["p", "o", "c", "k", "e", "t"], distractors: ["n"] },
    { word: "jacket", imageKey: "jacket", letters: ["j", "a", "c", "k", "e", "t"], distractors: ["n"] },
    { word: "helmet", imageKey: "helmet", letters: ["h", "e", "l", "m", "e", "t"], distractors: ["n", "a"] },
    { word: "muffin", imageKey: "muffin", letters: ["m", "u", "f", "f", "i", "n"], distractors: ["t", "o"] },
  ],
};

/** Advanced Quest 2 — Compound Words (16 words) */
export const QUEST_ADV_ER_IR_UR: Quest = {
  id: "quest-adv-er-ir-ur",
  title: "Compound Words",
  patternType: "advanced",
  words: [
    { word: "cupcake", imageKey: "cupcake", letters: ["c", "u", "p", "c", "a", "k", "e"], distractors: [] },
    { word: "hotdog", imageKey: "hotdog", letters: ["h", "o", "t", "d", "o", "g"], distractors: [] },
    { word: "bathtub", imageKey: "bathtub", letters: ["b", "a", "t", "h", "t", "u", "b"], distractors: [] },
    { word: "doghouse", imageKey: "doghouse", letters: ["d", "o", "g", "h", "o", "u", "s", "e"], distractors: [] },
    { word: "bedtime", imageKey: "bedtime", letters: ["b", "e", "d", "t", "i", "m", "e"], distractors: ["n"] },
    { word: "fishbowl", imageKey: "fishbowl", letters: ["f", "i", "s", "h", "b", "o", "w", "l"], distractors: ["n"] },
    { word: "catnap", imageKey: "catnap", letters: ["c", "a", "t", "n", "a", "p"], distractors: ["r", "o"] },
    { word: "hilltop", imageKey: "hilltop", letters: ["h", "i", "l", "l", "t", "o", "p"], distractors: ["n", "a"] },
    // Nodes 9-16
    { word: "anthill", imageKey: "anthill", letters: ["a", "n", "t", "h", "i", "l", "l"], distractors: [] },
    { word: "laptop", imageKey: "laptop", letters: ["l", "a", "p", "t", "o", "p"], distractors: [] },
    { word: "cobweb", imageKey: "cobweb", letters: ["c", "o", "b", "w", "e", "b"], distractors: [] },
    { word: "zigzag", imageKey: "zigzag", letters: ["z", "i", "g", "z", "a", "g"], distractors: [] },
    { word: "pigtail", imageKey: "pigtail", letters: ["p", "i", "g", "t", "a", "i", "l"], distractors: ["n"] },
    { word: "sandbox", imageKey: "sandbox", letters: ["s", "a", "n", "d", "b", "o", "x"], distractors: ["t"] },
    { word: "teacup", imageKey: "teacup", letters: ["t", "e", "a", "c", "u", "p"], distractors: ["n"] },
    { word: "pigpen", imageKey: "pigpen", letters: ["p", "i", "g", "p", "e", "n"], distractors: ["t", "o"] },
  ],
};

/** Advanced Quest 3 — Tricky Two-Syllable Words (16 words) */
export const QUEST_ADV_BOSSY_R_MIX: Quest = {
  id: "quest-adv-bossy-r-mix",
  title: "Tricky Syllables",
  patternType: "advanced",
  words: [
    { word: "plastic", imageKey: "plastic", letters: ["p", "l", "a", "s", "t", "i", "c"], distractors: [] },
    { word: "blanket", imageKey: "blanket", letters: ["b", "l", "a", "n", "k", "e", "t"], distractors: [] },
    { word: "pumpkin", imageKey: "pumpkin", letters: ["p", "u", "m", "p", "k", "i", "n"], distractors: [] },
    { word: "trumpet", imageKey: "trumpet", letters: ["t", "r", "u", "m", "p", "e", "t"], distractors: [] },
    { word: "picnic", imageKey: "picnic", letters: ["p", "i", "c", "n", "i", "c"], distractors: ["t"] },
    { word: "napkin", imageKey: "napkin", letters: ["n", "a", "p", "k", "i", "n"], distractors: ["t"] },
    { word: "kitchen", imageKey: "kitchen", letters: ["k", "i", "t", "c", "h", "e", "n"], distractors: ["s", "o"] },
    { word: "chicken", imageKey: "chicken", letters: ["c", "h", "i", "c", "k", "e", "n"], distractors: ["s", "o"] },
    // Nodes 9-16
    { word: "kingdom", imageKey: "kingdom", letters: ["k", "i", "n", "g", "d", "o", "m"], distractors: [] },
    { word: "dentist", imageKey: "dentist", letters: ["d", "e", "n", "t", "i", "s", "t"], distractors: [] },
    { word: "contest", imageKey: "contest", letters: ["c", "o", "n", "t", "e", "s", "t"], distractors: [] },
    { word: "catfish", imageKey: "catfish", letters: ["c", "a", "t", "f", "i", "s", "h"], distractors: [] },
    { word: "dolphin", imageKey: "dolphin", letters: ["d", "o", "l", "p", "h", "i", "n"], distractors: ["t"] },
    { word: "frisbee", imageKey: "frisbee", letters: ["f", "r", "i", "s", "b", "e", "e"], distractors: ["n"] },
    { word: "penguin", imageKey: "penguin", letters: ["p", "e", "n", "g", "u", "i", "n"], distractors: ["t", "o"] },
    { word: "monster", imageKey: "monster", letters: ["m", "o", "n", "s", "t", "e", "r"], distractors: ["d", "i"] },
  ],
};

/** Advanced Quest 4 — Longer Decodable Words (16 words) */
export const QUEST_ADV_2SYL_CLOSED: Quest = {
  id: "quest-adv-2syl-closed",
  title: "Longer Words",
  patternType: "advanced",
  words: [
    { word: "garden", imageKey: "garden", letters: ["g", "a", "r", "d", "e", "n"], distractors: [] },
    { word: "winter", imageKey: "winter", letters: ["w", "i", "n", "t", "e", "r"], distractors: [] },
    { word: "dinner", imageKey: "dinner", letters: ["d", "i", "n", "n", "e", "r"], distractors: [] },
    { word: "hammer", imageKey: "hammer", letters: ["h", "a", "m", "m", "e", "r"], distractors: [] },
    { word: "butter", imageKey: "butter", letters: ["b", "u", "t", "t", "e", "r"], distractors: ["n"] },
    { word: "sister", imageKey: "sister", letters: ["s", "i", "s", "t", "e", "r"], distractors: ["n"] },
    { word: "corner", imageKey: "corner", letters: ["c", "o", "r", "n", "e", "r"], distractors: ["t", "i"] },
    { word: "market", imageKey: "market", letters: ["m", "a", "r", "k", "e", "t"], distractors: ["n", "i"] },
    // Nodes 9-16
    { word: "doctor", imageKey: "doctor", letters: ["d", "o", "c", "t", "o", "r"], distractors: [] },
    { word: "number", imageKey: "number", letters: ["n", "u", "m", "b", "e", "r"], distractors: [] },
    { word: "pencil", imageKey: "pencil", letters: ["p", "e", "n", "c", "i", "l"], distractors: [] },
    { word: "tunnel", imageKey: "tunnel", letters: ["t", "u", "n", "n", "e", "l"], distractors: [] },
    { word: "button", imageKey: "button", letters: ["b", "u", "t", "t", "o", "n"], distractors: ["s"] },
    { word: "cotton", imageKey: "cotton", letters: ["c", "o", "t", "t", "o", "n"], distractors: ["s"] },
    { word: "lemon", imageKey: "lemon", letters: ["l", "e", "m", "o", "n"], distractors: ["t", "i"] },
    { word: "melon", imageKey: "melon", letters: ["m", "e", "l", "o", "n"], distractors: ["t", "i"] },
  ],
};

/** Advanced Quest 5 — Mixed Advanced Mastery (16 words) */
export const QUEST_ADV_MIXED_MASTERY: Quest = {
  id: "quest-adv-mixed-mastery",
  title: "Advanced: Mixed Mastery",
  patternType: "advanced",
  words: [
    { word: "backpack", imageKey: "backpack", letters: ["b", "a", "c", "k", "p", "a", "c", "k"], distractors: [] },
    { word: "doghouse", imageKey: "doghouse", letters: ["d", "o", "g", "h", "o", "u", "s", "e"], distractors: [] },
    { word: "rainbow", imageKey: "rainbow", letters: ["r", "a", "i", "n", "b", "o", "w"], distractors: [] },
    { word: "pancake", imageKey: "pancake", letters: ["p", "a", "n", "c", "a", "k", "e"], distractors: [] },
    { word: "popcorn", imageKey: "popcorn", letters: ["p", "o", "p", "c", "o", "r", "n"], distractors: ["t"] },
    { word: "sandwich", imageKey: "sandwich", letters: ["s", "a", "n", "d", "w", "i", "c", "h"], distractors: ["t"] },
    { word: "football", imageKey: "football", letters: ["f", "o", "o", "t", "b", "a", "l", "l"], distractors: ["n", "i"] },
    { word: "notebook", imageKey: "notebook", letters: ["n", "o", "t", "e", "b", "o", "o", "k"], distractors: ["s", "i"] },
    // Nodes 9-16
    { word: "jellyfish", imageKey: "jellyfish", letters: ["j", "e", "l", "l", "y", "f", "i", "s", "h"], distractors: [] },
    { word: "drumstick", imageKey: "drumstick", letters: ["d", "r", "u", "m", "s", "t", "i", "c", "k"], distractors: [] },
    { word: "windmill", imageKey: "windmill", letters: ["w", "i", "n", "d", "m", "i", "l", "l"], distractors: [] },
    { word: "goldfish", imageKey: "goldfish", letters: ["g", "o", "l", "d", "f", "i", "s", "h"], distractors: [] },
    { word: "mushroom", imageKey: "mushroom", letters: ["m", "u", "s", "h", "r", "o", "o", "m"], distractors: ["n"] },
    { word: "starfish", imageKey: "starfish", letters: ["s", "t", "a", "r", "f", "i", "s", "h"], distractors: ["n"] },
    { word: "snowflake", imageKey: "snowflake", letters: ["s", "n", "o", "w", "f", "l", "a", "k", "e"], distractors: ["t", "i"] },
    { word: "lunchbox", imageKey: "lunchbox", letters: ["l", "u", "n", "c", "h", "b", "o", "x"], distractors: ["t", "s"] },
  ],
};

/** All Advanced Reading quests in order */
export const ADVANCED_QUESTS: Quest[] = [
  QUEST_ADV_AR_OR,
  QUEST_ADV_ER_IR_UR,
  QUEST_ADV_BOSSY_R_MIX,
  QUEST_ADV_2SYL_CLOSED,
  QUEST_ADV_MIXED_MASTERY,
];

/** Advanced Word Bank for Trophy Room */
export const ADVANCED_WORD_BANK: Record<string, Array<{ word: string; imageKey: string }>> = {
  arOr: [
    { word: "sunset", imageKey: "sunset" }, { word: "basket", imageKey: "basket" },
    { word: "rabbit", imageKey: "rabbit" }, { word: "napkin", imageKey: "napkin" },
    { word: "kitten", imageKey: "kitten" }, { word: "magnet", imageKey: "magnet" },
    { word: "picnic", imageKey: "picnic" }, { word: "rocket", imageKey: "rocket" },
    { word: "pocket", imageKey: "pocket" }, { word: "muffin", imageKey: "muffin" },
  ],
  erIrUr: [
    { word: "cupcake", imageKey: "cupcake" }, { word: "hotdog", imageKey: "hotdog" },
    { word: "bathtub", imageKey: "bathtub" }, { word: "laptop", imageKey: "laptop" },
    { word: "cobweb", imageKey: "cobweb" }, { word: "zigzag", imageKey: "zigzag" },
    { word: "sandbox", imageKey: "sandbox" }, { word: "snowman", imageKey: "snowman" },
    { word: "anthill", imageKey: "anthill" }, { word: "catnap", imageKey: "catnap" },
  ],
  bossyRMix: [
    { word: "blanket", imageKey: "blanket" }, { word: "pumpkin", imageKey: "pumpkin" },
    { word: "trumpet", imageKey: "trumpet" }, { word: "kitchen", imageKey: "kitchen" },
    { word: "chicken", imageKey: "chicken" }, { word: "kingdom", imageKey: "kingdom" },
    { word: "dentist", imageKey: "dentist" }, { word: "dolphin", imageKey: "dolphin" },
    { word: "penguin", imageKey: "penguin" }, { word: "monster", imageKey: "monster" },
  ],
  twoSyl: [
    { word: "garden", imageKey: "garden" }, { word: "market", imageKey: "market" },
    { word: "winter", imageKey: "winter" }, { word: "dinner", imageKey: "dinner" },
    { word: "hammer", imageKey: "hammer" }, { word: "butter", imageKey: "butter" },
    { word: "doctor", imageKey: "doctor" }, { word: "pencil", imageKey: "pencil" },
    { word: "tunnel", imageKey: "tunnel" }, { word: "sister", imageKey: "sister" },
  ],
  mixedMastery: [
    { word: "rainbow", imageKey: "rainbow" }, { word: "pancake", imageKey: "pancake" },
    { word: "popcorn", imageKey: "popcorn" }, { word: "football", imageKey: "football" },
    { word: "sandwich", imageKey: "sandwich" }, { word: "goldfish", imageKey: "goldfish" },
    { word: "windmill", imageKey: "windmill" }, { word: "notebook", imageKey: "notebook" },
    { word: "starfish", imageKey: "starfish" }, { word: "lunchbox", imageKey: "lunchbox" },
  ],
};
