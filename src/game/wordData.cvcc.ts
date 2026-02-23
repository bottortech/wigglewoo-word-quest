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

/** All CVCC quests in order */
export const CVCC_QUESTS: Quest[] = [
  QUEST_CVCC_SHORT_A,
  QUEST_CVCC_SHORT_I,
  QUEST_CVCC_SHORT_O,
  QUEST_CVCC_SHORT_U,
  QUEST_CVCC_SHORT_E,
];

/** CVCC sentences for the learning UI */
export const CVCC_SENTENCES: Record<string, string> = {
  // Short A ending blends
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

  // Short I ending blends
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

  // Short O ending blends
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

  // Short U ending blends
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

  // Short E ending blends
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
};

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
