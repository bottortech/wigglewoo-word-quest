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
    { word: "web", imageKey: "web", letters: ["w", "e", "b"], distractors: [] },
    // Nodes 13-14: +1 distractor
    { word: "set", imageKey: "set", letters: ["s", "e", "t"], distractors: ["m"] },
    { word: "get", imageKey: "get", letters: ["g", "e", "t"], distractors: ["n"] },
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
// SENTENCE REGISTRY — CVC loaded immediately, others lazily
// =============================================================

/** CVC sentences (always in main bundle) */
const CVC_SENTENCES: Record<string, string> = {
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
  bag: "I pack my lunch in a ___.",
  nap: "When I am sleepy, I take a short ___.",
  sad: "When my friend moved away, I felt ___.",
  tag: "The ___ is on my bag.",

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
  kit: "Mom got the first-aid ___ to fix my cut.",
  dip: "I ___ my chip into the yummy salsa.",
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
  wet: "I bring an umbrella when it's raining so I don't get ___.",
  leg: "I have two of these to run and jump. Each one is a ___.",
  // Short E words (nodes 9-16)
  pet: "A dog or cat that lives with you is a ___.",
  ten: "I have ___ fingers on my two hands.",
  beg: "My dog will ___ for a treat.",
  web: "A spider makes a sticky ___.",
  set: "The kids play on the swing ___.",
  get: "I ___ my backpack before school.",
  gem: "The ___ is in a chest.",
  vet: "When my pet is sick, I take it to the ___.",
};

let sentenceRegistry: Record<string, string> = { ...CVC_SENTENCES };

/** Register sentences from a lazy-loaded chunk */
export function registerSentences(sentences: Record<string, string>): void {
  sentenceRegistry = { ...sentenceRegistry, ...sentences };
}

/** Get the learning sentence for a word */
export function getWordSentence(word: string): string {
  return sentenceRegistry[word] || `Can you spell the word ___?`;
}

// =============================================================
// LAZY LOADERS — load CVCC/CVVC chunks on demand
// =============================================================

let cvccLoaded = false;
let cvvcLoaded = false;
let cvccLoadPromise: Promise<void> | null = null;
let cvvcLoadPromise: Promise<void> | null = null;

/** Load CVCC quest data. Idempotent — safe to call multiple times. */
export async function loadCvccQuests(): Promise<void> {
  if (cvccLoaded) return;
  if (cvccLoadPromise) return cvccLoadPromise;

  cvccLoadPromise = import("./wordData.cvcc").then((mod) => {
    registerQuests(mod.CVCC_QUESTS);
    registerSentences(mod.CVCC_SENTENCES);
    cvccLoaded = true;
  });

  return cvccLoadPromise;
}

/** Load CVVC quest data. Idempotent — safe to call multiple times. */
export async function loadCvvcQuests(): Promise<void> {
  if (cvvcLoaded) return;
  if (cvvcLoadPromise) return cvvcLoadPromise;

  cvvcLoadPromise = import("./wordData.cvvc").then((mod) => {
    registerQuests(mod.CVVC_QUESTS);
    registerSentences(mod.CVVC_SENTENCES);
    cvvcLoaded = true;
  });

  return cvvcLoadPromise;
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
