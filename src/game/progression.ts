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

import type { NodeState, Quest, TrophyTier } from "./types";
import {
  WORDS_PER_QUEST,
  FIRST_HALF_WORDS,
  WORDS_PER_LESSON,
  LESSONS_PER_QUEST,
} from "./types";

const STORAGE_KEY = "wigglewoo-cvc-progress";
const GLOBAL_KEY = "wigglewoo-global-progress";
const TROPHY_KEY = "wigglewoo-trophy-progress";
const DISCOVERY_KEY = "wigglewoo-discovery-all";
const CROSSMATCH_KEY = "wigglewoo-crossmatch-all";

/** Cross-match review checkpoints (1-indexed word numbers). After completing
 *  word 4, the player does a cross-match review of words 1–4; after word 12,
 *  a review of words 9–12. Trophy nodes (8 and 16) are intentionally clean. */
export const CROSSMATCH_CHECKPOINTS: readonly number[] = [4, 12];

/** Persisted progress for a single quest */
export interface QuestProgress {
  questId: string;
  /** Index of the current (not yet completed) word. 0-7. */
  currentWordIndex: number;
  /** Set to true when all 8 words done */
  questComplete: boolean;
}

/** Trophy room progress (tiered).
 *  - "none": no trophy earned
 *  - "half": phase 1 done (after node 8)
 *  - "full": phase 2 done (after node 16) */
export interface TrophyProgress {
  /** Quest ID this trophy belongs to */
  questId: string;
  /** Current trophy tier */
  tier: TrophyTier;
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

/** Normalize one trophy record to the tiered shape, migrating legacy
 *  `{ trophyRoomComplete: true }` records to `tier: "full"`. */
function normalizeTrophyRecord(raw: unknown, fallbackId: string): TrophyProgress {
  if (raw && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    const questId = typeof r.questId === "string" ? r.questId : fallbackId;
    if (r.tier === "none" || r.tier === "half" || r.tier === "full") {
      return { questId, tier: r.tier };
    }
    // Legacy: { trophyRoomComplete: boolean }
    if (typeof r.trophyRoomComplete === "boolean") {
      return { questId, tier: r.trophyRoomComplete ? "full" : "none" };
    }
  }
  return { questId: fallbackId, tier: "none" };
}

/** Load all trophy progress (with migration of legacy records). */
function loadAllTrophyProgress(): Record<string, TrophyProgress> {
  try {
    const raw = localStorage.getItem(TROPHY_PROGRESS_KEY);
    let parsed: Record<string, unknown> | null = null;
    if (raw) {
      parsed = JSON.parse(raw);
    } else {
      // Migrate from older single-trophy format
      const oldRaw = localStorage.getItem(TROPHY_KEY);
      if (oldRaw) {
        const old = JSON.parse(oldRaw);
        if (old?.questId) {
          parsed = { [old.questId]: old };
        }
      }
    }
    if (!parsed) return {};
    const out: Record<string, TrophyProgress> = {};
    let migrated = false;
    for (const [id, val] of Object.entries(parsed)) {
      const normalized = normalizeTrophyRecord(val, id);
      out[id] = normalized;
      // Detect if the on-disk record needed re-shaping
      if (
        !val ||
        typeof val !== "object" ||
        !("tier" in (val as object))
      ) {
        migrated = true;
      }
    }
    if (migrated) {
      try {
        localStorage.setItem(TROPHY_PROGRESS_KEY, JSON.stringify(out));
      } catch { /* fail silently */ }
    }
    return out;
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
  return all[questId] ?? { questId, tier: "none" };
}

/** Save trophy progress */
export function saveTrophyProgress(progress: TrophyProgress): void {
  const all = loadAllTrophyProgress();
  all[progress.questId] = progress;
  saveAllTrophyProgress(all);
}

/** Award (or upgrade) the trophy tier for a quest. Tier is monotonic:
 *  attempting to downgrade is ignored. */
export function awardTrophyTier(questId: string, tier: TrophyTier): TrophyProgress {
  const current = loadTrophyProgress(questId);
  const rank: Record<TrophyTier, number> = { none: 0, half: 1, full: 2 };
  const nextTier: TrophyTier = rank[tier] >= rank[current.tier] ? tier : current.tier;
  const updated: TrophyProgress = { questId, tier: nextTier };
  saveTrophyProgress(updated);
  return updated;
}

/** Reset trophy progress (for new quest) */
export function resetTrophyProgress(questId: string): void {
  saveTrophyProgress({ questId, tier: "none" });
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

// ---- Cross-Match Review Progress ----

/** Per-quest set of completed cross-match checkpoints (1-indexed word numbers). */
function loadAllCrossMatchProgress(): Record<string, number[]> {
  try {
    const raw = localStorage.getItem(CROSSMATCH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch { /* corrupted */ }
  return {};
}

function saveAllCrossMatchProgress(data: Record<string, number[]>): void {
  try {
    localStorage.setItem(CROSSMATCH_KEY, JSON.stringify(data));
  } catch { /* fail silently */ }
}

/** Has the cross-match review been completed at this checkpoint? */
export function isCrossMatchComplete(questId: string, checkpoint: number): boolean {
  const all = loadAllCrossMatchProgress();
  return (all[questId] ?? []).includes(checkpoint);
}

/** Mark a cross-match checkpoint as completed for this quest. */
export function markCrossMatchComplete(questId: string, checkpoint: number): void {
  const all = loadAllCrossMatchProgress();
  const list = all[questId] ?? [];
  if (!list.includes(checkpoint)) {
    all[questId] = [...list, checkpoint];
    saveAllCrossMatchProgress(all);
  }
}

/** Reset cross-match progress for a quest (used on restart). */
export function resetCrossMatchProgress(questId: string): void {
  const all = loadAllCrossMatchProgress();
  if (questId in all) {
    delete all[questId];
    saveAllCrossMatchProgress(all);
  }
}

/** Find the next pending cross-match checkpoint for this quest, given the
 *  player's current word index. Returns null if none pending. The checkpoint
 *  fires once the player has completed *at least* that word number. */
export function getPendingCrossMatch(
  questId: string,
  currentWordIndex: number
): number | null {
  for (const cp of CROSSMATCH_CHECKPOINTS) {
    if (currentWordIndex >= cp && !isCrossMatchComplete(questId, cp)) {
      return cp;
    }
  }
  return null;
}

/**
 * Check if a specific quest is FULLY complete (all nodes + full trophy + discovery).
 */
export function isQuestFullyComplete(questId: string): boolean {
  const qp = loadQuestProgress(questId);
  const tp = loadTrophyProgress(questId);
  const dp = loadDiscoveryProgress(questId);
  return qp.questComplete && tp.tier === "full" && dp.discoveryRoomComplete;
}

/**
 * Check if ALL quests in a list are fully complete (nodes + trophy).
 */
export function areAllQuestsComplete(questIds: string[]): boolean {
  return questIds.every((id) => isQuestFullyComplete(id));
}

/**
 * Should phase 1 trophy room run? Triggers once after node 8.
 */
export function shouldShowTrophyPhase1(
  progress: QuestProgress,
  trophyProgress: TrophyProgress
): boolean {
  return progress.currentWordIndex >= FIRST_HALF_WORDS && trophyProgress.tier === "none";
}

/**
 * Should phase 2 trophy room run? Triggers once after node 16, and only
 * when phase 1 has already been earned (tier === "half"). Migrated players
 * with tier "full" already skip phase 2.
 */
export function shouldShowTrophyPhase2(
  progress: QuestProgress,
  trophyProgress: TrophyProgress
): boolean {
  return progress.currentWordIndex >= WORDS_PER_QUEST && trophyProgress.tier === "half";
}

/**
 * Get trophy node state for the map (used as a milestone marker for phase 1).
 * Trophy node is "active" when the player has completed node 8 but hasn't
 * earned any trophy yet. Once half or full, the node renders as completed.
 */
export function getTrophyNodeState(
  questProgress: QuestProgress,
  trophyProgress: TrophyProgress
): NodeState {
  if (questProgress.currentWordIndex < FIRST_HALF_WORDS) {
    return "locked";
  }
  if (trophyProgress.tier === "none") {
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
    if (qp.questComplete && tp.tier === "full" && !dp.discoveryRoomComplete) {
      completeDiscoveryRoom(questId);
    }
  }
}

/** Count quests with a fully-earned trophy (tier === "full"). */
export function countEarnedTrophies(): number {
  const all = loadAllTrophyProgress();
  return Object.values(all).filter(tp => tp.tier === "full").length;
}

// =============================================
// LESSON STRUCTURE — quests are 4 lessons of 4 words
// =============================================
// Words 1-3 / 5-7 / 9-11 / 13-15 are guided practice (audio model on
// mount, hand-pointer hint on idle, letter-tap sounds). Words 4 / 8 /
// 12 / 16 are independent mastery checks — same word mechanic, but
// the model audio and hand-pointer hint are suppressed so the kid
// has to recall the spelling on their own. Passing a mastery check
// records a silver-star skill badge for that lesson.

/** True if this word index opens a new lesson (0, 4, 8, 12). */
export function isLessonStart(wordIndex: number): boolean {
  return wordIndex >= 0 && wordIndex % WORDS_PER_LESSON === 0
    && wordIndex < WORDS_PER_QUEST;
}

/** True if this word index is the lesson's mastery check (3, 7, 11, 15). */
export function isMasteryCheckWord(wordIndex: number): boolean {
  return wordIndex >= 0 && (wordIndex + 1) % WORDS_PER_LESSON === 0
    && wordIndex < WORDS_PER_QUEST;
}

/** 0-based lesson index this word belongs to (0..3). */
export function getLessonIndex(wordIndex: number): number {
  return Math.floor(wordIndex / WORDS_PER_LESSON);
}

const LESSON_MASTERY_KEY = "ww_lessonMastery";

function loadAllLessonMastery(): Record<string, boolean[]> {
  try {
    return JSON.parse(localStorage.getItem(LESSON_MASTERY_KEY) || "{}");
  } catch { return {}; }
}

/** Returns the kid's mastery-badge state for a quest as a length-4 boolean
 *  array (one entry per lesson). Default = all false. */
export function loadLessonMastery(questId: string): boolean[] {
  const stored = loadAllLessonMastery()[questId];
  const out = new Array<boolean>(LESSONS_PER_QUEST).fill(false);
  if (Array.isArray(stored)) {
    for (let i = 0; i < LESSONS_PER_QUEST; i++) out[i] = !!stored[i];
  }
  return out;
}

/** Marks a lesson's mastery badge as earned. Idempotent. Returns the
 *  updated mastery array so callers can react to the new state. */
export function recordLessonMastery(
  questId: string,
  lessonIndex: number,
): boolean[] {
  const all = loadAllLessonMastery();
  const current = loadLessonMastery(questId);
  if (lessonIndex < 0 || lessonIndex >= LESSONS_PER_QUEST) return current;
  if (current[lessonIndex]) return current;
  current[lessonIndex] = true;
  all[questId] = current;
  try { localStorage.setItem(LESSON_MASTERY_KEY, JSON.stringify(all)); }
  catch { /* storage disabled — ok */ }
  return current;
}

// =============================================
// DISCOVERED PROPS — per-room, persistent across days
// =============================================
// Tracks which fact-bearing props the kid has tapped at least once,
// so the soft glow halo on undiscovered props can fade out after
// they've heard the fact. Survives day rollovers because the goal
// is "find the new ones", not a daily re-discovery loop.
const DISCOVERED_PROPS_KEY = "ww_discoveredProps";

function loadAllDiscoveredProps(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem(DISCOVERED_PROPS_KEY) || "{}");
  } catch { return {}; }
}

/** Get the set of prop IDs the kid has already discovered in a room. */
export function loadDiscoveredProps(roomId: string): Set<string> {
  return new Set(loadAllDiscoveredProps()[roomId] ?? []);
}

/** Mark a prop as discovered in a room. Idempotent. */
export function recordPropDiscovered(roomId: string, propId: string): void {
  const all = loadAllDiscoveredProps();
  const list = all[roomId] ?? [];
  if (!list.includes(propId)) {
    all[roomId] = [...list, propId];
    try { localStorage.setItem(DISCOVERED_PROPS_KEY, JSON.stringify(all)); }
    catch { /* storage disabled — ok */ }
  }
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

// =============================================
// VOWEL PROGRESS — tracks quest completions per vowel pattern
// Used for progressive fact unlocking in discovery rooms
// =============================================

/** Map quest ID to its vowel pattern */
const QUEST_TO_VOWEL: Record<string, string> = {
  "quest-short-a": "a", "quest-cvcc-short-a": "a", "quest-magic-e-a": "a",
  "quest-cvvc-long-a": "a", "quest-adv-ar-or": "a",
  "quest-short-i": "i", "quest-cvcc-short-i": "i", "quest-magic-e-i": "i",
  "quest-cvvc-mixed-ea": "i", "quest-adv-er-ir-ur": "i",
  "quest-short-o": "o", "quest-cvcc-short-o": "o", "quest-magic-e-o": "o",
  "quest-cvvc-long-o": "o", "quest-adv-bossy-r-mix": "o",
  "quest-short-u": "u", "quest-cvcc-short-u": "u", "quest-magic-e-u": "u",
  "quest-cvvc-long-u": "u", "quest-adv-2syl-closed": "u",
  "quest-short-e": "e", "quest-cvcc-short-e": "e", "quest-magic-e-mixed": "e",
  "quest-cvvc-long-e": "e", "quest-adv-mixed-mastery": "e",
};

const VOWEL_PROGRESS_KEY = "ww_vowel_progress";

function loadVowelProgress(): Record<string, number> {
  try {
    const raw = localStorage.getItem(VOWEL_PROGRESS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveVowelProgress(data: Record<string, number>): void {
  try {
    localStorage.setItem(VOWEL_PROGRESS_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

/** Get the vowel pattern for a quest ID */
export function getVowelForQuest(questId: string): string | null {
  return QUEST_TO_VOWEL[questId] ?? null;
}

/** Get current progress level for a vowel (number of quest completions) */
export function getVowelProgressLevel(vowel: string): number {
  const data = loadVowelProgress();
  return data[vowel] ?? 0;
}

/** Record a quest completion for its vowel pattern. Call once per quest complete. */
export function recordVowelQuestCompletion(questId: string): void {
  const vowel = QUEST_TO_VOWEL[questId];
  if (!vowel) return;
  const data = loadVowelProgress();
  data[vowel] = (data[vowel] ?? 0) + 1;
  saveVowelProgress(data);
}

/** Calculate how many facts should be unlocked for a vowel.
 *  2 facts per completion, max 16. */
export function getUnlockedFactCount(vowel: string): number {
  const level = getVowelProgressLevel(vowel);
  return Math.min(level * 2, 16);
}

