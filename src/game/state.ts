// =============================================
// state.ts — Game state + reducer
// Wigglewoo CVC Quest
// =============================================
// All game state transitions live here.
// GameScreen dispatches actions; this file
// determines the next state.
//
// GAME RULES (enforced here):
//   ✓ Only correct letters snap into matching slot
//   ✓ Incorrect drops → snap back, no penalty
//   ✓ Hints escalate per-word: 1st=nothing, 2nd=point, 3rd=point+phoneme
//   ✓ All 3 correct → lock → celebration → auto-advance
//   ✓ No score, timer, lives, or penalties
//   ✓ Unlimited attempts
// =============================================

import type {
  SlotState,
  SlotPosition,
  WigglewooHint,
  HintLevel,
  LetterTile,
  CvcWord,
} from "./types";
import { getLetterCategory } from "./wordData";
import type { CelebrationType } from "../components/CelebrationOverlay";
import { getCelebrationTypeForWord } from "./triggers";

// =============================================
// Celebration sub-state (unchanged)
// =============================================

export interface CelebrationState {
  isActive: boolean;
  type: CelebrationType | null;
}

export const initialCelebrationState: CelebrationState = {
  isActive: false,
  type: null,
};

// =============================================
// Game state shape
// =============================================

export interface GameState {
  questId: string;
  currentWordIndex: number;
  /** The word being solved (3-5 letters) */
  correctWord: string[];
  /** The word slots (dynamic based on word length) */
  slots: SlotState[];
  /** All letter tiles (correct + distractors) */
  letterBank: LetterTile[];
  /** Hint escalation for current word */
  hint: WigglewooHint;
  /** Celebration overlay */
  celebration: CelebrationState;
  /** True when all slots correct & locked */
  wordComplete: boolean;
}

// =============================================
// Actions — everything that can happen
// =============================================

export type GameAction =
  | { type: "PLACE_LETTER"; slotIndex: SlotPosition; tileId: string; letter: string }
  | { type: "REMOVE_LETTER"; slotIndex: SlotPosition }
  | { type: "INVALID_DROP" }
  | { type: "CELEBRATION_DONE" }
  | { type: "RESET_WORD"; questId: string; wordIndex: number; word: CvcWord }
  | { type: "RESET_SLOTS" };

// =============================================
// Pure helpers
// =============================================

function emptySlot(): SlotState {
  return { placedLetter: null, tileId: null, locked: false };
}

function emptySlots(count: number): SlotState[] {
  return Array.from({ length: count }, () => emptySlot());
}

const initialHint: WigglewooHint = {
  level: 0,
  targetSlot: null,
  phonemeReplay: false,
};

export { initialHint };

// ---- Letter bank builder ----

let _tileIdCounter = 0;

export function buildLetterBank(word: CvcWord): LetterTile[] {
  _tileIdCounter = 0;
  const allLetters = [...word.letters, ...word.distractors];
  const tiles: LetterTile[] = allLetters.map((letter) => ({
    id: `tile-${_tileIdCounter++}`,
    letter,
    category: getLetterCategory(letter),
  }));
  // Fisher-Yates shuffle
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  return tiles;
}

// ---- Drop validation ----
// Only correct letter for that exact slot position can stay.
// Everything else snaps back. No partial credit, no penalty.

export function isDropValid(
  letter: string,
  slotIndex: SlotPosition,
  correctWord: string[]
): boolean {
  if (slotIndex >= correctWord.length) return false;
  return letter.toLowerCase() === correctWord[slotIndex].toLowerCase();
}

// ---- Hint escalation ----
// Per-word mistake counter. Resets on new word.
//   0→1: silent (no visible reaction)
//   1→2: Wigglewoo points to the first needy slot
//   2→3: points + phoneme replay cue
//   3+:  stays at level 3 (keeps pointing + phoneme)

function escalateHint(
  current: WigglewooHint,
  correctWord: string[],
  slots: SlotState[]
): WigglewooHint {
  const nextLevel = Math.min(current.level + 1, 3) as HintLevel;

  if (nextLevel <= 1) {
    return { level: nextLevel, targetSlot: null, phonemeReplay: false };
  }

  // Point at the first empty or wrong slot
  let target: SlotPosition | null = null;
  for (let i = 0; i < correctWord.length; i++) {
    if (!slots[i].locked && slots[i].placedLetter !== correctWord[i]) {
      target = i as SlotPosition;
      break;
    }
  }

  return {
    level: nextLevel,
    targetSlot: target,
    phonemeReplay: nextLevel >= 3,
  };
}

// ---- Refresh hint target after a correct placement ----
// After the player correctly fills one slot, update which
// slot Wigglewoo should point at (if hint is active).

function refreshHintTarget(
  hint: WigglewooHint,
  correctWord: string[],
  slots: SlotState[]
): WigglewooHint {
  if (hint.level < 2) return hint;

  let target: SlotPosition | null = null;
  for (let i = 0; i < correctWord.length; i++) {
    if (!slots[i].locked && slots[i].placedLetter !== correctWord[i]) {
      target = i as SlotPosition;
      break;
    }
  }
  return { ...hint, targetSlot: target };
}

// =============================================
// Reducer — single place for all transitions
// =============================================

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    // ---- Player places a correct letter ----
    case "PLACE_LETTER": {
      const { slotIndex, tileId, letter } = action;
      if (state.wordComplete) return state;
      if (state.slots[slotIndex]?.locked) return state;

      // Place letter into slot
      const newSlots = [...state.slots];
      newSlots[slotIndex] = { placedLetter: letter, tileId, locked: false };

      // Check: are all slots now correct?
      const allCorrect = newSlots.every(
        (s, i) => s.placedLetter?.toLowerCase() === state.correctWord[i].toLowerCase()
      );

      if (allCorrect) {
        // WORD COMPLETE → lock all slots → trigger celebration
        const locked = newSlots.map((s) => ({ ...s, locked: true }));
        const celebType = getCelebrationTypeForWord(state.currentWordIndex);
        return {
          ...state,
          slots: locked,
          wordComplete: true,
          hint: initialHint,
          celebration: { isActive: true, type: celebType },
        };
      }

      // Not complete yet — update hint target if pointing
      return {
        ...state,
        slots: newSlots,
        hint: refreshHintTarget(state.hint, state.correctWord, newSlots),
      };
    }

    // ---- Player drags a letter OUT of a slot ----
    case "REMOVE_LETTER": {
      if (state.wordComplete) return state;
      if (state.slots[action.slotIndex]?.locked) return state;

      const newSlots = [...state.slots];
      newSlots[action.slotIndex] = emptySlot();

      return {
        ...state,
        slots: newSlots,
        hint: refreshHintTarget(state.hint, state.correctWord, newSlots),
      };
    }

    // ---- Incorrect drop — escalate hint, no penalty ----
    case "INVALID_DROP": {
      return {
        ...state,
        hint: escalateHint(state.hint, state.correctWord, state.slots),
      };
    }

    // ---- Celebration finished — ready for auto-advance ----
    case "CELEBRATION_DONE": {
      return {
        ...state,
        celebration: { isActive: false, type: null },
      };
    }

    // ---- New word (next level or fresh start) ----
    case "RESET_WORD": {
      return initGameState(action.questId, action.wordIndex, action.word);
    }

    // ---- Start Over — clear slots but keep same word ----
    case "RESET_SLOTS": {
      return {
        ...state,
        slots: emptySlots(state.correctWord.length),
        hint: initialHint,
        celebration: initialCelebrationState,
        wordComplete: false,
        letterBank: buildLetterBank({
          word: "",
          imageKey: "",
          letters: state.correctWord,
          distractors: state.letterBank
            .filter((t) => !state.correctWord.includes(t.letter))
            .map((t) => t.letter),
        }),
      };
    }

    default:
      return state;
  }
}

// =============================================
// Initial state factory
// =============================================

export function initGameState(
  questId: string,
  wordIndex: number,
  word: CvcWord
): GameState {
  return {
    questId,
    currentWordIndex: wordIndex,
    correctWord: word.letters,
    slots: emptySlots(word.letters.length),
    letterBank: buildLetterBank(word),
    hint: initialHint,
    celebration: initialCelebrationState,
    wordComplete: false,
  };
}
