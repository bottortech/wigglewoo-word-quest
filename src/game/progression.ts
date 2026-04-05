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
const DISCOVERY_KEY = "wigglewoo-discovery-all";

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

/** Discovery room progress */
export interface DiscoveryProgress {
  /** Whether the discovery room after node 16 has been completed */
  discoveryRoomComplete: boolean;
  /** Quest ID this discovery belongs to */
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
export function advanceWord(progress: QuestProgress, wordCount = WORDS_PER_QUEST): QuestProgress {
  const nextIndex = progress.currentWordIndex + 1;

  // All words in current mode complete
  if (nextIndex >= wordCount) {
    const updated: QuestProgress = {
      ...progress,
      currentWordIndex: nextIndex,
      questComplete: true,
    };
    saveQuestProgress(updated);
    return updated;
  }

  // Normal progression
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
 * Compute node states for a quest's map display.
 * wordCount = number of words in the current mode (not always 16).
 */
export function getNodeStates(progress: QuestProgress, wordCount = WORDS_PER_QUEST): NodeState[] {
  const states: NodeState[] = [];
  for (let i = 0; i < wordCount; i++) {
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
 * Check if a node is tappable. Active and completed nodes are playable
 * (allows replaying completed words for demo/practice).
 */
export function isNodeTappable(state: NodeState): boolean {
  return state === "active" || state === "completed";
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

// ---- Discovery Room Progress ----

/** Load all discovery progress */
function loadAllDiscoveryProgress(): Record<string, DiscoveryProgress> {
  try {
    const raw = localStorage.getItem(DISCOVERY_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return {};
}

function saveAllDiscoveryProgress(data: Record<string, DiscoveryProgress>): void {
  try {
    localStorage.setItem(DISCOVERY_KEY, JSON.stringify(data));
  } catch { /* fail silently */ }
}

/** Load discovery progress for a quest */
export function loadDiscoveryProgress(questId: string): DiscoveryProgress {
  const all = loadAllDiscoveryProgress();
  return all[questId] ?? { discoveryRoomComplete: false, questId };
}

/** Save discovery progress */
export function saveDiscoveryProgress(progress: DiscoveryProgress): void {
  const all = loadAllDiscoveryProgress();
  all[progress.questId] = progress;
  saveAllDiscoveryProgress(all);
}

/** Mark discovery room as complete */
export function completeDiscoveryRoom(questId: string): DiscoveryProgress {
  const progress: DiscoveryProgress = {
    questId,
    discoveryRoomComplete: true,
  };
  saveDiscoveryProgress(progress);
  return progress;
}

/** Reset discovery progress (for quest restart) */
export function resetDiscoveryProgress(questId: string): void {
  saveDiscoveryProgress({ questId, discoveryRoomComplete: false });
}

/**
 * Check if a specific quest is FULLY complete (all nodes + trophy + discovery).
 */
export function isQuestFullyComplete(questId: string): boolean {
  const qp = loadQuestProgress(questId);
  const tp = loadTrophyProgress(questId);
  const dp = loadDiscoveryProgress(questId);
  return qp.questComplete && tp.trophyRoomComplete && dp.discoveryRoomComplete;
}

/**
 * Check if ALL quests in a list are fully complete (nodes + trophy).
 */
export function areAllQuestsComplete(questIds: string[]): boolean {
  return questIds.every((id) => isQuestFullyComplete(id));
}

/**
 * Check if player should go to trophy room.
 * Triggers after node 8 (fixed position).
 */
export function shouldShowTrophyRoom(progress: QuestProgress, trophyProgress: TrophyProgress): boolean {
  return progress.currentWordIndex >= 8 && !trophyProgress.trophyRoomComplete;
}

/**
 * Get trophy node state based on progress.
 * Trophy unlocks after node 8 (fixed position between node 8 and 9).
 */
export function getTrophyNodeState(
  questProgress: QuestProgress,
  trophyProgress: TrophyProgress
): NodeState {
  if (questProgress.currentWordIndex < 8) {
    return "locked";
  }
  if (!trophyProgress.trophyRoomComplete) {
    return "active";
  }
  return "completed";
}

/**
 * Get discovery room node state based on progress.
 * Discovery room unlocks after Mode 1 (image words) is completed.
 */
export function getDiscoveryNodeState(
  questProgress: QuestProgress,
  discoveryProgress: DiscoveryProgress
): NodeState {
  if (!questProgress.questComplete) {
    return "locked";
  }
  if (!discoveryProgress.discoveryRoomComplete) {
    return "active";
  }
  return "completed";
}


// ---- Per-Node Performance Ratings ----

export type WordRating = "perfect" | "clean" | "assisted";

const RATINGS_KEY = "wigglewoo-node-ratings";

function loadAllRatings(): Record<string, Record<number, WordRating>> {
  try {
    const raw = localStorage.getItem(RATINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return {};
}

/** Save a rating for a specific node in a quest */
export function saveNodeRating(questId: string, wordIndex: number, rating: WordRating): void {
  const all = loadAllRatings();
  if (!all[questId]) all[questId] = {};
  all[questId][wordIndex] = rating;
  try {
    localStorage.setItem(RATINGS_KEY, JSON.stringify(all));
  } catch { /* fail silently */ }
}

/** Load all node ratings for a quest */
export function loadNodeRatings(questId: string): Record<number, WordRating> {
  return loadAllRatings()[questId] || {};
}

/** Clear ratings for a quest (on restart) */
export function clearNodeRatings(questId: string): void {
  const all = loadAllRatings();
  delete all[questId];
  try {
    localStorage.setItem(RATINGS_KEY, JSON.stringify(all));
  } catch { /* fail silently */ }
}

// ---- Trophy Unlock Animation Flag ----

const TROPHY_UNLOCK_SEEN_KEY = "wigglewoo-trophy-unlock-seen";

function loadTrophyUnlockSeen(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(TROPHY_UNLOCK_SEEN_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return {};
}

/** Check if trophy unlock animation has been shown for this quest */
export function hasTrophyUnlockBeenSeen(questId: string): boolean {
  return loadTrophyUnlockSeen()[questId] === true;
}

/** Mark trophy unlock animation as shown for this quest */
export function markTrophyUnlockSeen(questId: string): void {
  const all = loadTrophyUnlockSeen();
  all[questId] = true;
  try {
    localStorage.setItem(TROPHY_UNLOCK_SEEN_KEY, JSON.stringify(all));
  } catch { /* fail silently */ }
}

/** Clear trophy unlock seen flag (for quest restart) */
export function clearTrophyUnlockSeen(questId: string): void {
  const all = loadTrophyUnlockSeen();
  delete all[questId];
  try {
    localStorage.setItem(TROPHY_UNLOCK_SEEN_KEY, JSON.stringify(all));
  } catch { /* fail silently */ }
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

// ---- Environment / Explore tracking ----

const ENV_VISITED_KEY = "ww_env_visited";

export function markEnvironmentVisited(envId: string): void {
  const visited = JSON.parse(localStorage.getItem(ENV_VISITED_KEY) || "{}");
  visited[envId] = true;
  localStorage.setItem(ENV_VISITED_KEY, JSON.stringify(visited));
}

/**
 * Migration: auto-complete discovery rooms for players who had
 * fully-complete quests under the old system (nodes + trophy only).
 * Prevents "un-completing" quests that unlock CVCC/CVVC.
 */
export function migrateOldCompletedQuests(allQuestIds: string[]): void {
  for (const questId of allQuestIds) {
    const qp = loadQuestProgress(questId);
    const tp = loadTrophyProgress(questId);
    const dp = loadDiscoveryProgress(questId);
    // Old system: quest was fully complete if nodes + trophy done
    // New system also requires discovery. Auto-grant it.
    if (qp.questComplete && tp.trophyRoomComplete && !dp.discoveryRoomComplete) {
      completeDiscoveryRoom(questId);
    }
  }
}

export function countEarnedTrophies(): number {
  const all = loadAllTrophyProgress();
  return Object.values(all).filter(tp => tp.trophyRoomComplete).length;
}

// =============================================
// DAILY FACT PROGRESS — 4 facts per room per day
// =============================================
const FACT_PROGRESS_KEY = "ww_factProgress";
const MAX_FACTS_PER_DAY = 4;

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10); // "2026-03-16"
}

function loadFactProgress(): Record<string, Record<string, number>> {
  try {
    return JSON.parse(localStorage.getItem(FACT_PROGRESS_KEY) || "{}");
  } catch { return {}; }
}

function saveFactProgress(data: Record<string, Record<string, number>>): void {
  localStorage.setItem(FACT_PROGRESS_KEY, JSON.stringify(data));
}

/** Get how many facts discovered today for a room */
export function getFactsDiscoveredToday(roomId: string): number {
  const data = loadFactProgress();
  const today = getTodayKey();
  return data[today]?.[roomId] ?? 0;
}

/** Check if daily fact cap is reached for a room */
export function isDailyFactCapReached(roomId: string): boolean {
  return getFactsDiscoveredToday(roomId) >= MAX_FACTS_PER_DAY;
}

/** Record a fact discovery for a room today */
export function recordFactDiscovery(roomId: string): void {
  const data = loadFactProgress();
  const today = getTodayKey();
  if (!data[today]) {
    // New day — clear old entries
    const cleaned: Record<string, Record<string, number>> = {};
    cleaned[today] = {};
    data[today] = cleaned[today];
    // Remove old days
    for (const key of Object.keys(data)) {
      if (key !== today) delete data[key];
    }
  }
  data[today][roomId] = (data[today][roomId] ?? 0) + 1;
  saveFactProgress(data);
}

/** Check if player has ≥75% accuracy over last 8 words in a quest.
 *  "perfect" and "clean" count as accurate, "assisted" does not. */
export function hasHighAccuracy(questId: string, minWords = 8): boolean {
  const ratings = loadNodeRatings(questId);
  const entries = Object.entries(ratings);
  if (entries.length < minWords) return false;
  // Take the last `minWords` by node index
  const sorted = entries
    .map(([idx, r]) => ({ idx: Number(idx), r }))
    .sort((a, b) => b.idx - a.idx)
    .slice(0, minWords);
  const accurate = sorted.filter((e) => e.r === "perfect" || e.r === "clean").length;
  return accurate / sorted.length >= 0.75;
}

// =============================================
// CHALLENGE MODE — track unlocked quests
// =============================================
const CHALLENGE_MODE_KEY = "ww_challenge_mode";

function loadChallengeData(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(CHALLENGE_MODE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveChallengeData(data: Record<string, boolean>): void {
  try {
    localStorage.setItem(CHALLENGE_MODE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

/** Check if Challenge Mode is unlocked for a quest */
export function isChallengeUnlocked(questId: string): boolean {
  return loadChallengeData()[questId] === true;
}

/** Unlock Challenge Mode for a quest */
export function unlockChallengeMode(questId: string): void {
  const data = loadChallengeData();
  data[questId] = true;
  saveChallengeData(data);
}

/** Get all quest IDs with Challenge Mode unlocked */
export function getChallengeUnlockedQuests(): string[] {
  const data = loadChallengeData();
  return Object.keys(data).filter((k) => data[k]);
}

