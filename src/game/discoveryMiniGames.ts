// =============================================
// discoveryMiniGames.ts — Data models & configs
// for Discovery Room mini-game system
// =============================================
// Architecture:
//   1. Game logic (rhyme, build, sort) — generic
//   2. Visual theme (ocean, volcano, etc.) — swappable
//   3. Word data (room-specific sets) — curated
//
// Each room has 3 mini-games played in sequence:
//   1. RhymePop — tap matching rhyme words
//   2. LetterBuilder — tap letters in order to build word
//   3. WordSort — drag/tap words into rhyme family groups
// =============================================

// ---- Mini-game types ----

export type MiniGameType = "rhyme-pop" | "sound-pop" | "word-sort";

/** A single round of RhymePop data */
export interface RhymePopRound {
  targetPattern: string;       // e.g. "-at"
  correctWords: string[];      // e.g. ["cat", "hat", "bat"]
  distractorWords: string[];   // e.g. ["dog", "pig", "cup"]
}

/** A single Sound Pop challenge — hear word, tap correct ending letter */
export interface SoundPopChallenge {
  targetWord: string;          // e.g. "cat" — the full word (for audio + reveal)
  onset: string;               // e.g. "CA" — displayed as prompt: CA _
  correctEnding: string;       // e.g. "T" — the right answer
  endingChoices: string[];     // e.g. ["T", "P", "M", "B"] — letter options (shuffled)
}

/** Mini-game 2: Sound Pop — 3 rounds per session */
export interface SoundPopRound {
  challenges: SoundPopChallenge[];  // exactly 3 challenges
}

// ---- Onset-based word pool for Sound Pop (separate from ending-family data) ----
// Key = onset (first consonant + vowel), value = array of CVC words sharing that onset
// Only the final consonant differs. All real, decodable, kid-friendly CVC words.
// Pruned 2026-05-05: removed non-words, proper nouns, inappropriate words, and
// tricky/obscure vocabulary that would confuse early readers.

const ONSET_POOL: Record<string, string[]> = {
  // Short A onsets
  "ba": ["bag", "bad", "bat", "ban"],
  "ca": ["cat", "cap", "can", "cab"],
  "da": ["dad", "dam", "dab"],
  "fa": ["fan", "fat", "fad"],
  "ha": ["hat", "ham", "had", "has"],
  "ja": ["jam", "jab", "jag"],
  "la": ["lap", "lad", "lag"],
  "ma": ["map", "mat", "mad", "man"],
  "na": ["nap", "nag", "nab"],
  "pa": ["pan", "pat", "pad", "pal"],
  "ra": ["rat", "ram", "rag", "ran", "rap"],
  "sa": ["sad", "sat", "sap", "sag"],
  "ta": ["tag", "tab", "tap", "tan"],
  "va": ["van", "vat"],
  "wa": ["wag", "wax"],

  // Short I onsets
  "bi": ["big", "bit", "bid", "bin", "bib"],
  "di": ["dig", "dip", "did", "dim", "din"],
  "fi": ["fig", "fit", "fin", "fix", "fib"],
  "hi": ["hit", "hid", "him", "hip", "his"],
  "ki": ["kit", "kid", "kin"],
  "li": ["lid", "lip", "lit"],
  "mi": ["mix", "mid"],
  "pi": ["pig", "pin", "pit", "pip"],
  "ri": ["rig", "rim", "rip", "rid"],
  "si": ["sit", "sip", "six"],
  "ti": ["tip", "tin"],
  "wi": ["wig", "win", "wit"],
  "zi": ["zip", "zig"],

  // Short O onsets
  "bo": ["box"],
  "co": ["cot", "cob", "cod", "cop", "cog"],
  "do": ["dog", "dot"],
  "fo": ["fog", "fox"],
  "go": ["got"],
  "ho": ["hot", "hop", "hog", "hob"],
  "jo": ["jog", "job", "jot"],
  "lo": ["log", "lot", "lob"],
  "mo": ["mop", "mob", "mod", "mom"],
  "no": ["nod", "not"],
  "po": ["pot", "pop", "pod"],
  "ro": ["rot", "rob", "rod"],
  "so": ["sob", "sod", "sop"],
  "to": ["top", "tot"],

  // Short U onsets
  "bu": ["bug", "bus", "bud", "bun", "but"],
  "cu": ["cup", "cut", "cub"],
  "du": ["dug", "dub", "dud"],
  "fu": ["fun"],
  "gu": ["gum", "gut"],
  "hu": ["hug", "hum", "hub", "hut"],
  "ju": ["jug", "jut"],
  "mu": ["mud", "mug"],
  "nu": ["nut", "nun", "nub"],
  "pu": ["pup", "pun", "pub"],
  "ru": ["rug", "run", "rub", "rut"],
  "su": ["sun", "sub", "sum"],
  "tu": ["tub", "tug"],

  // Short E onsets
  "be": ["bed", "beg", "bet"],
  "de": ["den", "dew"],
  "ge": ["get", "gem", "gel"],
  "he": ["hen", "hem", "hex"],
  "je": ["jet"],
  "le": ["leg", "let", "led"],
  "ne": ["net"],
  "pe": ["pen", "pet", "peg", "pep"],
  "re": ["red", "rep", "ref"],
  "se": ["set"],
  "te": ["ten"],
  "ve": ["vet"],
  "we": ["wet", "web", "wed"],
};

/** A single round of WordSort data */
export interface WordSortRound {
  groups: {
    pattern: string;           // e.g. "-at"
    words: string[];           // e.g. ["cat", "hat", "bat"]
  }[];
}

/** Complete mini-game session for one room visit */
export interface MiniGameSession {
  rhymePop: RhymePopRound;
  soundPop: SoundPopRound;
  wordSort: WordSortRound;
}

// ---- Theme system ----

export type RoomTheme = "ocean" | "volcano" | "castle" | "geartown" | "greenhouse";

/** Visual config for themed objects in each mini-game */
export interface ThemeConfig {
  id: RoomTheme;
  label: string;
  /** If true, mini-game panels use transparent bg (room shows through) */
  transparentBg?: boolean;
  /** RhymePop: what the tappable objects look like */
  rhymePop: {
    objectType: string;        // e.g. "bubble", "lava-rock", "shield"
    objectEmoji: string;       // fallback emoji
    objectImage?: string;      // optional image path (replaces emoji)
    bgClass: string;           // CSS class for background
    popEffect: string;         // CSS class for pop/destroy animation
  };
  /** LetterBuilder: what carries the letters */
  letterBuilder: {
    carrierType: string;       // e.g. "fish", "fireball", "banner"
    carrierEmoji: string;
    carrierImage?: string;     // optional image path (replaces emoji)
    bgClass: string;
    direction: "left-to-right" | "right-to-left" | "float-up";
  };
  /** WordSort: what the sorting bins look like */
  wordSort: {
    binType: string;           // e.g. "coral", "volcano-slot", "gate"
    binEmoji: string;
    binImage?: string;         // optional image path for bins
    itemType: string;          // e.g. "shell", "rock", "scroll"
    itemEmoji: string;
    itemImage?: string;        // optional image path for sortable items
    bgClass: string;
  };
  /** Shared */
  accentColor: string;
  bgGradient: string;
}

// ---- Theme registry ----

export const THEME_CONFIGS: Record<RoomTheme, ThemeConfig> = {
  ocean: {
    id: "ocean",
    label: "Ocean",
    transparentBg: true,
    rhymePop: {
      objectType: "bubble",
      objectEmoji: "🫧",
      objectImage: "/assets/discovery rooms/coral-cove-village/single-bubble.png",
      bgClass: "mg-bg--ocean",
      popEffect: "mg-pop--bubble",
    },
    letterBuilder: {
      carrierType: "fish",
      carrierEmoji: "🐟",
      carrierImage: "/assets/discovery rooms/coral-cove-village/clownfish.png",
      bgClass: "mg-bg--ocean",
      direction: "left-to-right",
    },
    wordSort: {
      binType: "coral",
      binEmoji: "🪸",
      binImage: "/assets/discovery rooms/coral-cove-village/coral-archway.png",
      itemType: "clam",
      itemEmoji: "🐚",
      itemImage: "/assets/discovery rooms/coral-cove-village/closed-clam.png",
      bgClass: "mg-bg--ocean",
    },
    accentColor: "#4FC3F7",
    bgGradient: "linear-gradient(180deg, #0277BD 0%, #01579B 50%, #002F6C 100%)",
  },
  volcano: {
    id: "volcano",
    label: "Volcano",
    transparentBg: true,
    rhymePop: {
      objectType: "lava-rock",
      objectEmoji: "🪨",
      objectImage: "/assets/discovery rooms/rumble-peak-volcano/lava-rock.png",
      bgClass: "mg-bg--volcano",
      popEffect: "mg-pop--lava",
    },
    letterBuilder: {
      carrierType: "fireball",
      carrierEmoji: "🔥",
      carrierImage: "/assets/discovery rooms/rumble-peak-volcano/lava-bubble.png",
      bgClass: "mg-bg--volcano",
      direction: "float-up",
    },
    wordSort: {
      binType: "volcano-slot",
      binEmoji: "🌋",
      binImage: "/assets/discovery rooms/rumble-peak-volcano/pit.png",
      itemType: "rock",
      itemEmoji: "🪨",
      itemImage: "/assets/discovery rooms/rumble-peak-volcano/volcanic-rocks-1.png",
      bgClass: "mg-bg--volcano",
    },
    accentColor: "#FF6D00",
    bgGradient: "linear-gradient(180deg, #BF360C 0%, #8B1A00 50%, #3E0000 100%)",
  },
  castle: {
    id: "castle",
    label: "Castle",
    transparentBg: true,
    rhymePop: {
      objectType: "shield",
      objectEmoji: "🛡️",
      objectImage: "/assets/discovery rooms/stonewall-castle/shield.png",
      bgClass: "mg-bg--castle",
      popEffect: "mg-pop--shield",
    },
    letterBuilder: {
      carrierType: "banner",
      carrierEmoji: "🏳️",
      carrierImage: "/assets/discovery rooms/stonewall-castle/left-banner.png",
      bgClass: "mg-bg--castle",
      direction: "left-to-right",
    },
    wordSort: {
      binType: "gate",
      binEmoji: "🏰",
      binImage: "/assets/discovery rooms/stonewall-castle/closed-treasure-box.png",
      itemType: "scroll",
      itemEmoji: "📜",
      itemImage: "/assets/discovery rooms/stonewall-castle/scrolled-up.png",
      bgClass: "mg-bg--castle",
    },
    accentColor: "#9C7C38",
    bgGradient: "linear-gradient(180deg, #5D4037 0%, #3E2723 50%, #1B0F0A 100%)",
  },
  geartown: {
    id: "geartown",
    label: "Geartown",
    transparentBg: true,
    rhymePop: {
      objectType: "gear",
      objectEmoji: "⚙️",
      objectImage: "/assets/discovery rooms/geartown-workshop/single-gear.png",
      bgClass: "mg-bg--geartown",
      popEffect: "mg-pop--gear",
    },
    letterBuilder: {
      carrierType: "conveyor",
      carrierEmoji: "🔩",
      carrierImage: "/assets/discovery rooms/geartown-workshop/robot-parts.png",
      bgClass: "mg-bg--geartown",
      direction: "left-to-right",
    },
    wordSort: {
      binType: "machine-slot",
      binEmoji: "🏭",
      binImage: "/assets/discovery rooms/geartown-workshop/tool-rack.png",
      itemType: "part",
      itemEmoji: "⚙️",
      itemImage: "/assets/discovery rooms/geartown-workshop/robot-parts-2.png",
      bgClass: "mg-bg--geartown",
    },
    accentColor: "#78909C",
    bgGradient: "linear-gradient(180deg, #455A64 0%, #263238 50%, #0D1B21 100%)",
  },
  greenhouse: {
    id: "greenhouse",
    label: "Greenhouse",
    transparentBg: true,
    rhymePop: {
      objectType: "butterfly",
      objectEmoji: "🦋",
      objectImage: "/assets/discovery rooms/greenhouse-domes/butterfly-view-2.png",
      bgClass: "mg-bg--greenhouse",
      popEffect: "mg-pop--butterfly",
    },
    letterBuilder: {
      carrierType: "vine",
      carrierEmoji: "🌿",
      carrierImage: "/assets/discovery rooms/greenhouse-domes/flower-stage-3.png",
      bgClass: "mg-bg--greenhouse",
      direction: "float-up",
    },
    wordSort: {
      binType: "flower-pot",
      binEmoji: "🌻",
      binImage: "/assets/discovery rooms/greenhouse-domes/flower-pot.png",
      itemType: "water-pot",
      itemEmoji: "💧",
      itemImage: "/assets/discovery rooms/greenhouse-domes/water-pot.png",
      bgClass: "mg-bg--greenhouse",
    },
    accentColor: "#66BB6A",
    bgGradient: "linear-gradient(180deg, #2E7D32 0%, #1B5E20 50%, #0D3B0F 100%)",
  },
};

// ---- Room word data (curated per room) ----

export interface WordFamily {
  pattern: string;           // e.g. "-at"
  words: string[];           // e.g. ["cat", "hat", "bat", "mat"]
}

export interface RoomWordData {
  roomId: string;
  theme: RoomTheme;
  families: WordFamily[];
  /** Extra words NOT in any family (used as distractors) */
  distractors: string[];
}

export const ROOM_WORD_DATA: Record<string, RoomWordData> = {
  "small-coastal-village": {
    roomId: "small-coastal-village",
    theme: "ocean",
    families: [
      { pattern: "-at", words: ["cat", "bat", "hat", "mat"] },
      { pattern: "-og", words: ["dog", "log", "hog"] },
      { pattern: "-ig", words: ["pig", "wig", "dig"] },
      { pattern: "-op", words: ["hop", "mop", "top"] },
      { pattern: "-am", words: ["jam", "ham", "ram"] },
    ],
    distractors: ["bus", "red", "sun", "cup", "bed", "net", "run"],
  },
  "valcano": {
    roomId: "valcano",
    theme: "volcano",
    families: [
      { pattern: "-at", words: ["cat", "hat", "bat", "rat"] },
      { pattern: "-an", words: ["pan", "can", "fan", "van"] },
      { pattern: "-ap", words: ["cap", "nap", "map", "tap"] },
      { pattern: "-ag", words: ["bag", "tag", "rag", "wag"] },
      { pattern: "-ad", words: ["sad", "bad", "dad", "mad"] },
    ],
    distractors: ["dog", "pig", "bus", "bed", "sun", "cup", "net"],
  },
  "castle-island": {
    roomId: "castle-island",
    theme: "castle",
    families: [
      { pattern: "-it", words: ["sit", "hit", "kit", "bit"] },
      { pattern: "-ig", words: ["dig", "pig", "wig", "big"] },
      { pattern: "-ip", words: ["dip", "sip", "zip", "rip"] },
      { pattern: "-in", words: ["pin", "win", "fin", "bin"] },
      { pattern: "-id", words: ["lid", "hid", "kid", "did"] },
    ],
    distractors: ["cat", "dog", "bus", "bed", "sun", "cup", "hot"],
  },
  "industrial-tech-city": {
    roomId: "industrial-tech-city",
    theme: "geartown",
    families: [
      { pattern: "-ug", words: ["bug", "hug", "mug", "rug"] },
      { pattern: "-un", words: ["run", "fun", "sun", "bun"] },
      { pattern: "-up", words: ["cup", "pup"] },
      { pattern: "-ut", words: ["cut", "nut", "hut", "gut"] },
      { pattern: "-ub", words: ["tub", "rub", "sub", "hub"] },
    ],
    distractors: ["cat", "dog", "pig", "bed", "hot", "net", "hat"],
  },
  "glass-dome": {
    roomId: "glass-dome",
    theme: "greenhouse",
    families: [
      { pattern: "-et", words: ["net", "wet", "jet", "vet"] },
      { pattern: "-en", words: ["hen", "pen", "ten", "den"] },
      { pattern: "-ed", words: ["bed", "red", "fed"] },
      { pattern: "-eg", words: ["beg", "leg", "peg"] },
      { pattern: "-eb", words: ["web"] },
    ],
    distractors: ["cat", "dog", "pig", "bus", "sun", "cup", "hot"],
  },
};

// ---- Session generator ----

/**
 * Build a mini-game session from room word data.
 * ALL 3 mini-games use the SAME word family for focused learning.
 * A secondary family is used for sort game grouping + distractors.
 */
export function generateSession(roomId: string): MiniGameSession | null {
  const data = ROOM_WORD_DATA[roomId];
  if (!data) return null;

  // Only use families with at least 3 words
  const usableFamilies = data.families.filter((f) => f.words.length >= 3);
  if (usableFamilies.length < 2) return null;

  // Shuffle and pick the focus family for this round
  const shuffled = [...usableFamilies].sort(() => Math.random() - 0.5);
  const focusFamily = shuffled[0];
  const secondFamily = shuffled[1];

  // ---- 1. RhymePop — focus family words + distractors from other families/pool ----
  const rhymeDistractors = [
    ...secondFamily.words.slice(0, 2),
    ...data.distractors.slice(0, 1),
  ].sort(() => Math.random() - 0.5).slice(0, 3);

  // ---- 2. SoundPop — ending sound builder (onset-based) ----
  // Pick 3 target words that have onset groups with ≥2 entries
  const allRoomWords = data.families.flatMap((f) => f.words);
  const validTargets = allRoomWords.filter((w) => {
    if (w.length < 3) return false;
    const onset = w.slice(0, 2);
    const group = ONSET_POOL[onset];
    return group && group.length >= 2;
  });

  const soundPopTargets = [...validTargets]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const soundPopChallenges: SoundPopChallenge[] = soundPopTargets.map((target) => {
    const onsetStr = target.slice(0, 2);
    const group = ONSET_POOL[onsetStr] || [target];
    const correctEnding = target[target.length - 1].toUpperCase();
    // Get distractor endings from same onset group (different final letters)
    const otherEndings = group
      .filter((w) => w !== target)
      .map((w) => w[w.length - 1].toUpperCase())
      .filter((e, i, arr) => e !== correctEnding && arr.indexOf(e) === i); // unique, not correct
    const distractorEndings = [...otherEndings]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    // Shuffle correct ending into choices
    const endingChoices = [correctEnding, ...distractorEndings]
      .sort(() => Math.random() - 0.5);
    return {
      targetWord: target,
      onset: onsetStr.toUpperCase(),
      correctEnding,
      endingChoices,
    };
  });

  // ---- 3. WordSort — focus family + second family as two groups ----
  const sortGroups = [
    { pattern: focusFamily.pattern, words: focusFamily.words.slice(0, 3) },
    { pattern: secondFamily.pattern, words: secondFamily.words.slice(0, 3) },
  ];

  return {
    rhymePop: {
      targetPattern: focusFamily.pattern,
      correctWords: focusFamily.words.slice(0, 4),
      distractorWords: rhymeDistractors,
    },
    soundPop: {
      challenges: soundPopChallenges,
    },
    wordSort: {
      groups: sortGroups,
    },
  };
}

// ---- Environment ID → theme lookup ----

export function getThemeForRoom(roomId: string): RoomTheme {
  return ROOM_WORD_DATA[roomId]?.theme ?? "ocean";
}
