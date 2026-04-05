// =============================================
// types.ts — Core type definitions
// Wigglewoo CVC Quest
// =============================================

/** CVC letter categories */
export type LetterCategory = "consonant" | "vowel";

/** Slot positions (0-4 for up to 5-letter words) */
export type SlotPosition = 0 | 1 | 2 | 3 | 4;

/** Expected category per slot for CVC: C-V-C */
/** For CVCC/CCVC/CVCVC patterns, this may vary */
export const SLOT_CATEGORIES: Record<number, LetterCategory> = {
  0: "consonant",
  1: "vowel",
  2: "consonant",
  3: "consonant", // For 4-5 letter words
  4: "consonant", // For 5 letter words
};

/** A single letter tile in the bank */
export interface LetterTile {
  id: string;
  letter: string;
  category: LetterCategory;
}

/** Word gameplay mode */
export type WordMode = "image" | "decode" | "pending";

/** A single CVC word challenge (supports 3-5 letters) */
export interface CvcWord {
  /** The target word, e.g. "cat" */
  word: string;
  /** Path or key for the target image */
  imageKey: string;
  /** The correct letters in order (3-5 letters) */
  letters: string[];
  /** Extra distractor letters (0–2) */
  distractors: string[];
  /** Gameplay mode: "image" = with picture, "decode" = no picture (Challenge Mode) */
  mode?: WordMode;
}

/** Supported word pattern types */
export type PatternType = "cvc" | "cvcc" | "magic-e" | "cvvc" | "advanced";

/** Which patterns are currently playable (images/audio ready) */
export const ENABLED_PATTERNS: PatternType[] = ["cvc"];

/** A single subtrack within a tier quest (e.g., "Short A" within CVC) */
export interface Subtrack {
  id: string;           // e.g., "short-a", "long-a"
  label: string;        // e.g., "Short A", "Long A"
  vowel: string;        // e.g., "A", "AI"
  words: CvcWord[];     // 16 words (image + decode mixed)
}

/** A tier quest = multiple ordered subtracks played in sequence */
export interface TierQuest {
  id: string;           // e.g., "quest-cvc", "quest-cvvc"
  title: string;        // e.g., "Sound Builders", "Vowel Teams"
  patternType: PatternType;
  subtracks: Subtrack[];  // 5 ordered subtracks
}

/** Progress within a tier quest */
export interface TierProgress {
  questId: string;
  currentSubtrackIndex: number;   // 0-4
  currentWordIndex: number;       // within active subtrack
  subtrackComplete: boolean[];    // per-subtrack completion
  questComplete: boolean;         // all subtracks done
}

/** Legacy quest format — used by placement test and GameScreen */
export interface Quest {
  id: string;
  title: string;
  patternType: PatternType;
  words: CvcWord[];
}

/** Convert a subtrack to a legacy Quest for GameScreen compatibility */
export function subtrackToQuest(tierQuest: TierQuest, subtrackIndex: number): Quest {
  const sub = tierQuest.subtracks[subtrackIndex];
  return {
    id: `${tierQuest.id}-${sub.id}`,
    title: `${tierQuest.title}: ${sub.label}`,
    patternType: tierQuest.patternType,
    words: sub.words,
  };
}

/** Node states on the Quest Map (matches wireframe) */
export type NodeState = "locked" | "active" | "completed";

/** State of a single word slot */
export interface SlotState {
  /** Which letter is currently placed (null = empty) */
  placedLetter: string | null;
  /** The letter tile ID occupying this slot (null = empty) */
  tileId: string | null;
  /** Whether this slot is locked (word completed) */
  locked: boolean;
}

/** Hint level — escalates with mistakes on same word */
export type HintLevel = 0 | 1 | 2 | 3;

/** Wigglewoo's current behavior on Game Screen */
export interface WigglewooHint {
  /** Current hint escalation level */
  level: HintLevel;
  /** Which slot to point at (null = no pointing) */
  targetSlot: SlotPosition | null;
  /** Whether phoneme replay is active */
  phonemeReplay: boolean;
}

/** Drag operation in progress */
export interface DragOperation {
  /** The tile being dragged */
  tileId: string;
  /** Letter value */
  letter: string;
  /** Where the tile came from: "bank" or a slot index */
  origin: "bank" | SlotPosition;
  /** Current pointer position */
  currentX: number;
  currentY: number;
  /** Starting pointer position */
  startX: number;
  startY: number;
}

/** Words per quest — 16 levels total (8 before trophy, 8 after) */
export const WORDS_PER_QUEST = 16;

/** First half of quest (nodes 1-8, before trophy room) */
export const FIRST_HALF_WORDS = 8;

/** Vowel IDs for quest selection */
export type VowelId = "shortA" | "shortE" | "shortI" | "shortO" | "shortU";

/** Trophy node position (after node 8, before node 9) */
export const TROPHY_NODE_POSITION = 8.5;
