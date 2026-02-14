// =============================================
// triggers.ts — Level/quest completion + hint
//               trigger logic
// Wigglewoo CVC Quest
// =============================================

import type { CelebrationType } from "../components/CelebrationOverlay";
import type { SlotPosition, WigglewooHint } from "./types";
import { WORDS_PER_QUEST } from "./types";

/** Auto-advance delay after celebration finishes (ms) */
export const AUTO_ADVANCE_DELAY = 300;

// ---- Celebration triggers ----

/**
 * Determine celebration type for a completed word.
 * 
 * Special cases:
 * - Node 8 (index 7): "level-complete" - player goes to Trophy Room
 * - Node 16 (index 15): "quest-complete" - quest is fully done
 * - All other nodes: "level-complete"
 */
export function getCelebrationTypeForWord(
  completedWordIndex: number
): CelebrationType {
  // Node 16 (index 15): All nodes done, player goes to map → trophy room
  // Show level-complete (not quest-complete) since trophy is the real finale
  if (completedWordIndex >= WORDS_PER_QUEST - 1) {
    return "level-complete";
  }
  
  return "level-complete";
}

export type PostCelebrationAction =
  | { action: "advance-to-quest-map" }
  | { action: "quest-summary" };

export function getPostCelebrationAction(
  type: CelebrationType
): PostCelebrationAction {
  if (type === "quest-complete") {
    return { action: "quest-summary" };
  }
  return { action: "advance-to-quest-map" };
}

// ---- Hint triggers ----

/**
 * Determine what Wigglewoo should do after an invalid drop.
 * This is called by GameScreen to decide the visual hint.
 *
 * Mapping (from behavior spec):
 *   hint.level 0→1: no visible reaction
 *   hint.level 1→2: WW points to the correct slot
 *   hint.level 2→3: WW points + phoneme replay indicator
 */
export function getHintAction(hint: WigglewooHint): {
  shouldPoint: boolean;
  targetSlot: SlotPosition | null;
  shouldReplayPhoneme: boolean;
} {
  return {
    shouldPoint: hint.level >= 2 && hint.targetSlot !== null,
    targetSlot: hint.targetSlot,
    shouldReplayPhoneme: hint.phonemeReplay,
  };
}

/**
 * Whether to show the phoneme replay indicator.
 * (No actual audio — just a visual cue for now.)
 */
export function shouldShowPhonemeReplay(hint: WigglewooHint): boolean {
  return hint.level >= 3 && hint.phonemeReplay;
}
