// =============================================
// progression.ts — Node states, quest progress,
//                  persistence (localStorage)
// Wigglewoo CVC Quest
// =============================================
// Manages:
//   - Which nodes are locked/active/completed
//   - Advancing to next word after completion
//   - Saving/loading progress for resume
//   - Quest completion detection
//   - Global quest sequence tracking
// =============================================

import type { NodeState, Quest } from "./types";
import { WORDS_PER_QUEST } from "./types";

const STORAGE_KEY = "wigglewoo-cvc-progress";
const GLOBAL_KEY = "wigglewoo-global-progress";
const TROPHY_KEY = "wigglewoo-trophy-progress";

/** Persisted progress for a single quest */
export interface QuestProgress {
  questId: string;
  /** Index of the current (not yet completed) word. 0-7. */
  currentWordIndex: number;
  /** Set to true when all 8 words done */
  questComplete: boolean;
}

/** Trophy room progress */
export interface TrophyProgress {
  /** Whether the trophy room after node 8 has been completed */
  trophyRoomComplete: boolean;
  /** Quest ID this trophy belongs to */
  questId: string;
}

/** All saved progress */
export interface SavedProgress {
  quests: Record<string, QuestProgress>;
}

/** Global progress — which quest is active */
export interface GlobalProgress {
  activeQuestId: string;
}

// ---- Persistence ----

function loadAll(): SavedProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* Corrupted — start fresh */ }
  return { quests: {} };
}

function saveAll(data: SavedProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* Storage full — fail silently */ }
}

/** Load global progress (which quest we're on) */
export function loadGlobalProgress(defaultQuestId: string): GlobalProgress {
  try {
    const raw = localStorage.getItem(GLOBAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return { activeQuestId: defaultQuestId };
}

/** Save global progress */
export function saveGlobalProgress(gp: GlobalProgress): void {
  try {
    localStorage.setItem(GLOBAL_KEY, JSON.stringify(gp));
  } catch { /* fail silently */ }
}

/** Load progress for a specific quest */
export function loadQuestProgress(questId: string): QuestProgress {
  const all = loadAll();
  return (
    all.quests[questId] ?? {
      questId,
      currentWordIndex: 0,
      questComplete: false,
    }
  );
}

/** Save progress for a specific quest */
export function saveQuestProgress(progress: QuestProgress): void {
  const all = loadAll();
  all.quests[progress.questId] = progress;
  saveAll(all);
}

/**
 * Advance to next word after completion.
 * Returns updated progress.
 * 
 * Node 16 (index 15 → nextIndex 16): Quest is fully complete,
 * player proceeds to Trophy Room as final reward.
 */
export function advanceWord(progress: QuestProgress): QuestProgress {
  const nextIndex = progress.currentWordIndex + 1;

  // Node 16 complete (nextIndex = 16): Quest is FULLY complete
  if (nextIndex >= WORDS_PER_QUEST) {
    const updated: QuestProgress = {
      ...progress,
      currentWordIndex: nextIndex,
      questComplete: true,
    };
    saveQuestProgress(updated);
    return updated;
  }

  // Normal progression (nodes 1-16, no mid-quest gate)
  const updated: QuestProgress = {
    ...progress,
    currentWordIndex: nextIndex,
    questComplete: false,
  };
  saveQuestProgress(updated);
  return updated;
}

// ---- Node state derivation ----

/**
 * Compute the 8 node states for a quest's map display.
 */
export function getNodeStates(progress: QuestProgress): NodeState[] {
  const states: NodeState[] = [];
  for (let i = 0; i < WORDS_PER_QUEST; i++) {
    if (progress.questComplete) {
      states.push("completed");
    } else if (i < progress.currentWordIndex) {
      states.push("completed");
    } else if (i === progress.currentWordIndex) {
      states.push("active");
    } else {
      states.push("locked");
    }
  }
  return states;
}

/**
 * Check if a node is tappable. Only ACTIVE nodes.
 */
export function isNodeTappable(state: NodeState): boolean {
  return state === "active";
}

// ---- Trophy Room Progress ----

const TROPHY_PROGRESS_KEY = "wigglewoo-trophy-all";

/** Load all trophy progress */
function loadAllTrophyProgress(): Record<string, TrophyProgress> {
  try {
    const raw = localStorage.getItem(TROPHY_PROGRESS_KEY);
    if (raw) return JSON.parse(raw);
    // Migrate from old single-trophy format
    const oldRaw = localStorage.getItem(TROPHY_KEY);
    if (oldRaw) {
      const old = JSON.parse(oldRaw);
      if (old.questId) {
        const migrated: Record<string, TrophyProgress> = { [old.questId]: old };
        localStorage.setItem(TROPHY_PROGRESS_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch { /* corrupted */ }
  return {};
}

function saveAllTrophyProgress(data: Record<string, TrophyProgress>): void {
  try {
    localStorage.setItem(TROPHY_PROGRESS_KEY, JSON.stringify(data));
  } catch { /* fail silently */ }
}

/** Load trophy progress for a quest */
export function loadTrophyProgress(questId: string): TrophyProgress {
  const all = loadAllTrophyProgress();
  return all[questId] ?? { trophyRoomComplete: false, questId };
}

/** Save trophy progress */
export function saveTrophyProgress(progress: TrophyProgress): void {
  const all = loadAllTrophyProgress();
  all[progress.questId] = progress;
  saveAllTrophyProgress(all);
}

/** Mark trophy room as complete */
export function completeTrophyRoom(questId: string): TrophyProgress {
  const progress: TrophyProgress = {
    questId,
    trophyRoomComplete: true,
  };
  saveTrophyProgress(progress);
  return progress;
}

/** Reset trophy progress (for new quest) */
export function resetTrophyProgress(questId: string): void {
  saveTrophyProgress({ questId, trophyRoomComplete: false });
}

/**
 * Check if a specific quest is FULLY complete (all nodes + trophy).
 */
export function isQuestFullyComplete(questId: string): boolean {
  const qp = loadQuestProgress(questId);
  const tp = loadTrophyProgress(questId);
  return qp.questComplete && tp.trophyRoomComplete;
}

/**
 * Check if ALL quests in a list are fully complete (nodes + trophy).
 */
export function areAllQuestsComplete(questIds: string[]): boolean {
  return questIds.every((id) => isQuestFullyComplete(id));
}

/**
 * Check if player should go to trophy room.
 * Returns true after all 16 nodes are complete and trophy hasn't been collected.
 */
export function shouldShowTrophyRoom(progress: QuestProgress): boolean {
  return progress.questComplete;
}

/**
 * Get trophy node state based on progress.
 * Trophy unlocks only after all 16 nodes are completed.
 */
export function getTrophyNodeState(
  questProgress: QuestProgress,
  trophyProgress: TrophyProgress
): NodeState {
  // Trophy node is locked until all 16 nodes are complete
  if (!questProgress.questComplete) {
    return "locked";
  }
  // Trophy node is active if quest complete but trophy not collected
  if (!trophyProgress.trophyRoomComplete) {
    return "active";
  }
  // Trophy collected
  return "completed";
}


/**
 * Get the next playable quest within the SAME pattern type.
 * Follows fixed order (A → E → I → O → U for CVC/CVCC/CCVC).
 * Returns the first incomplete quest, or null if all done.
 */
export function getNextPlayableQuestInType(
  currentQuestId: string,
  allQuests: Quest[]
): Quest | null {
  const current = allQuests.find((q) => q.id === currentQuestId);
  if (!current) return null;
  
  const sameType = allQuests.filter((q) => q.patternType === current.patternType);
  const currentIdx = sameType.findIndex((q) => q.id === currentQuestId);
  
  // Try the next quest in sequence within this type
  for (let i = currentIdx + 1; i < sameType.length; i++) {
    if (!isQuestFullyComplete(sameType[i].id)) {
      return sameType[i];
    }
  }
  
  // Wrap around: check from the beginning
  for (let i = 0; i < currentIdx; i++) {
    if (!isQuestFullyComplete(sameType[i].id)) {
      return sameType[i];
    }
  }
  
  return null; // All quests in this type are complete
}
