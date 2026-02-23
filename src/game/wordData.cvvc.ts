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

/** All CVVC quests in order */
export const CVVC_QUESTS: Quest[] = [
  QUEST_CVVC_LONG_A,
  QUEST_CVVC_LONG_E,
  QUEST_CVVC_LONG_O,
  QUEST_CVVC_LONG_U,
  QUEST_CVVC_MIXED_EA,
];

/** CVVC sentences for the learning UI */
export const CVVC_SENTENCES: Record<string, string> = {
  // Long A vowel teams (ai)
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

  // Long E vowel teams (ee)
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

  // Long O vowel teams (oa)
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

  // OO vowel teams
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

  // EA vowel teams
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
