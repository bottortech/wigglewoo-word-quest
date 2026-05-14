// =============================================
// reviewerMode.ts — App Store Review unlock cheat
// =============================================
// Apple reviewers spend ~3-5 minutes on a kids/edu app. Several of our
// App Store screenshots (letter tracing, Discovery Rooms) live behind
// quest-completion gates that a reviewer realistically won't grind
// through. To prevent a "screenshots misrepresent functionality"
// rejection, we expose a hidden trigger on the title screen: tap the
// logo 5 times in a row to mark every quest fully complete (nodes +
// full trophy + discovery). Higher-tier quest groups (CVCC, Magic E,
// CVVC, Advanced) cascade-unlock via areAllQuestsComplete().
//
// We deliberately DO NOT touch the per-environment first-visit flag
// (`ww_first_visit_seen_*`), so a reviewer entering a Discovery Room
// still sees the letter-trace screen — matching screenshots 6/7.
// =============================================

import { ALL_QUEST_IDS } from "./questIds";
import { WORDS_PER_QUEST } from "./types";
import {
  saveQuestProgress,
  awardTrophyTier,
  completeDiscoveryRoom,
} from "./progression";

const REVIEWER_MODE_KEY = "ww_reviewer_mode";

/** Marks every quest in ALL_QUEST_IDS as fully complete: all nodes,
 *  full trophy tier, discovery room flagged complete. Idempotent. */
export function enableReviewerMode(): void {
  for (const questId of ALL_QUEST_IDS) {
    saveQuestProgress({
      questId,
      currentWordIndex: WORDS_PER_QUEST,
      questComplete: true,
    });
    awardTrophyTier(questId, "full");
    completeDiscoveryRoom(questId);
  }
  try {
    localStorage.setItem(REVIEWER_MODE_KEY, "true");
  } catch {
    /* storage disabled — unlocks above still applied for this session */
  }
}

/** True if reviewer mode was previously activated on this device. */
export function isReviewerMode(): boolean {
  try {
    return localStorage.getItem(REVIEWER_MODE_KEY) === "true";
  } catch {
    return false;
  }
}
