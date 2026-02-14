// =============================================
// analytics.ts — Learning Insights data store
// WiggleWoo's Word Quest
// =============================================
// Separate localStorage store for analytics.
// COPPA-safe: no PII, no child accounts.
// Tracks: attempts, accuracy, timing per node/word.
// =============================================

const ANALYTICS_KEY = "wigglewoo-analytics";

// ---- Data shapes ----

export interface WordAttempt {
  correct: number;
  incorrect: number;
  lastPlayed: number; // timestamp
}

export interface NodeStats {
  attempts: number;
  correct: number;
  incorrect: number;
  completedAt: number | null; // timestamp
  timeSpentMs: number; // cumulative time on this node
  words: Record<string, WordAttempt>; // keyed by word string
}

export interface QuestAnalytics {
  questId: string;
  patternType: string;
  nodesCompleted: number;
  trophyEarned: boolean;
  nodes: Record<number, NodeStats>; // keyed by node index (0-15)
  startedAt: number;
  completedAt: number | null;
}

export interface AnalyticsStore {
  version: 1;
  quests: Record<string, QuestAnalytics>;
}

// ---- Persistence ----

function loadAnalytics(): AnalyticsStore {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.version === 1) return parsed;
    }
  } catch { /* corrupted — start fresh */ }
  return { version: 1, quests: {} };
}

function saveAnalytics(data: AnalyticsStore): void {
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
  } catch { /* storage full — fail silently */ }
}

// ---- Quest-level helpers ----

function ensureQuest(store: AnalyticsStore, questId: string, patternType: string): QuestAnalytics {
  if (!store.quests[questId]) {
    store.quests[questId] = {
      questId,
      patternType,
      nodesCompleted: 0,
      trophyEarned: false,
      nodes: {},
      startedAt: Date.now(),
      completedAt: null,
    };
  }
  return store.quests[questId];
}

function ensureNode(quest: QuestAnalytics, nodeIndex: number): NodeStats {
  if (!quest.nodes[nodeIndex]) {
    quest.nodes[nodeIndex] = {
      attempts: 0,
      correct: 0,
      incorrect: 0,
      completedAt: null,
      timeSpentMs: 0,
      words: {},
    };
  }
  return quest.nodes[nodeIndex];
}

// ---- Public API ----

/** Record a correct letter placement */
export function recordCorrectPlacement(
  questId: string,
  patternType: string,
  nodeIndex: number,
  word: string
): void {
  const store = loadAnalytics();
  const quest = ensureQuest(store, questId, patternType);
  const node = ensureNode(quest, nodeIndex);
  node.correct++;
  node.attempts++;
  if (!node.words[word]) {
    node.words[word] = { correct: 0, incorrect: 0, lastPlayed: Date.now() };
  }
  node.words[word].correct++;
  node.words[word].lastPlayed = Date.now();
  saveAnalytics(store);
}

/** Record an incorrect letter placement */
export function recordIncorrectPlacement(
  questId: string,
  patternType: string,
  nodeIndex: number,
  word: string
): void {
  const store = loadAnalytics();
  const quest = ensureQuest(store, questId, patternType);
  const node = ensureNode(quest, nodeIndex);
  node.incorrect++;
  node.attempts++;
  if (!node.words[word]) {
    node.words[word] = { correct: 0, incorrect: 0, lastPlayed: Date.now() };
  }
  node.words[word].incorrect++;
  node.words[word].lastPlayed = Date.now();
  saveAnalytics(store);
}

/** Record node completion */
export function recordNodeComplete(
  questId: string,
  patternType: string,
  nodeIndex: number
): void {
  const store = loadAnalytics();
  const quest = ensureQuest(store, questId, patternType);
  const node = ensureNode(quest, nodeIndex);
  node.completedAt = Date.now();
  quest.nodesCompleted = Object.values(quest.nodes).filter(n => n.completedAt !== null).length;
  saveAnalytics(store);
}

/** Record trophy earned */
export function recordTrophyEarned(questId: string, patternType: string): void {
  const store = loadAnalytics();
  const quest = ensureQuest(store, questId, patternType);
  quest.trophyEarned = true;
  quest.completedAt = Date.now();
  saveAnalytics(store);
}

/** Add time spent on a node */
export function recordTimeSpent(
  questId: string,
  patternType: string,
  nodeIndex: number,
  ms: number
): void {
  const store = loadAnalytics();
  const quest = ensureQuest(store, questId, patternType);
  const node = ensureNode(quest, nodeIndex);
  node.timeSpentMs += ms;
  saveAnalytics(store);
}

// ---- Aggregation for Insights screen ----

export interface VowelInsight {
  questId: string;
  vowelLabel: string;
  patternType: string;
  nodesCompleted: number;
  totalNodes: number;
  trophyEarned: boolean;
  accuracy: number; // 0-100
  totalAttempts: number;
  totalCorrect: number;
  totalIncorrect: number;
}

export interface OverallInsight {
  totalQuests: number;
  completedQuests: number;
  overallAccuracy: number;
  vowels: VowelInsight[];
  needsPractice: string[]; // auto-generated suggestions
}

/** Map quest IDs to friendly vowel labels */
const QUEST_LABELS: Record<string, string> = {
  "quest-short-a": "Short A",
  "quest-short-e": "Short E",
  "quest-short-i": "Short I",
  "quest-short-o": "Short O",
  "quest-short-u": "Short U",
  "quest-cvcc-short-a": "Short A Blends",
  "quest-cvcc-short-i": "Short I Blends",
  "quest-cvcc-short-o": "Short O Blends",
  "quest-cvcc-short-u": "Short U Blends",
  "quest-cvcc-short-e": "Short E Blends",
  "quest-cvvc-long-a": "Long A Teams",
  "quest-cvvc-long-e": "Long E Teams",
  "quest-cvvc-long-o": "Long O Teams",
  "quest-cvvc-long-u": "OO Teams",
  "quest-cvvc-mixed-ea": "EA Teams",
};

/** All known quests grouped by pattern type, in display order */
const ALL_KNOWN_QUESTS: { questId: string; patternType: string }[] = [
  { questId: "quest-short-a", patternType: "cvc" },
  { questId: "quest-short-e", patternType: "cvc" },
  { questId: "quest-short-i", patternType: "cvc" },
  { questId: "quest-short-o", patternType: "cvc" },
  { questId: "quest-short-u", patternType: "cvc" },
  { questId: "quest-cvcc-short-a", patternType: "cvcc" },
  { questId: "quest-cvcc-short-i", patternType: "cvcc" },
  { questId: "quest-cvcc-short-o", patternType: "cvcc" },
  { questId: "quest-cvcc-short-u", patternType: "cvcc" },
  { questId: "quest-cvcc-short-e", patternType: "cvcc" },
  { questId: "quest-cvvc-long-a", patternType: "cvvc" },
  { questId: "quest-cvvc-long-e", patternType: "cvvc" },
  { questId: "quest-cvvc-long-o", patternType: "cvvc" },
  { questId: "quest-cvvc-long-u", patternType: "cvvc" },
  { questId: "quest-cvvc-mixed-ea", patternType: "cvvc" },
];

/** Get aggregated insights for the Learning Insights screen */
export function getInsights(): OverallInsight {
  const store = loadAnalytics();
  const vowels: VowelInsight[] = [];
  let totalCorrect = 0;
  let totalIncorrect = 0;

  for (const { questId, patternType } of ALL_KNOWN_QUESTS) {
    const quest = store.quests[questId];
    let qCorrect = 0;
    let qIncorrect = 0;
    let qAttempts = 0;
    let nodesCompleted = 0;
    let trophyEarned = false;

    if (quest) {
      for (const node of Object.values(quest.nodes)) {
        qCorrect += node.correct;
        qIncorrect += node.incorrect;
        qAttempts += node.attempts;
      }
      nodesCompleted = quest.nodesCompleted;
      trophyEarned = quest.trophyEarned;
    }

    totalCorrect += qCorrect;
    totalIncorrect += qIncorrect;

    vowels.push({
      questId,
      vowelLabel: QUEST_LABELS[questId] || questId,
      patternType,
      nodesCompleted,
      totalNodes: 16,
      trophyEarned,
      accuracy: qAttempts > 0 ? Math.round((qCorrect / qAttempts) * 100) : 0,
      totalAttempts: qAttempts,
      totalCorrect: qCorrect,
      totalIncorrect: qIncorrect,
    });
  }

  // Sort by pattern type then label
  vowels.sort((a, b) => {
    if (a.patternType !== b.patternType) return a.patternType.localeCompare(b.patternType);
    return a.vowelLabel.localeCompare(b.vowelLabel);
  });

  const totalAttempts = totalCorrect + totalIncorrect;
  const overallAccuracy = totalAttempts > 0
    ? Math.round((totalCorrect / totalAttempts) * 100)
    : 0;

  // Generate "needs practice" suggestions
  const needsPractice: string[] = [];
  const played = vowels.filter(v => v.totalAttempts > 0);
  // Find lowest accuracy (below 70%)
  const lowAccuracy = played
    .filter(v => v.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy);
  for (const v of lowAccuracy.slice(0, 3)) {
    needsPractice.push(`${v.vowelLabel} accuracy is ${v.accuracy}% — needs more practice`);
  }
  // Find incomplete quests
  const incomplete = vowels.filter(v => v.nodesCompleted > 0 && v.nodesCompleted < 16);
  for (const v of incomplete.slice(0, 2)) {
    if (!lowAccuracy.find(la => la.questId === v.questId)) {
      needsPractice.push(`${v.vowelLabel}: ${v.nodesCompleted}/16 nodes — keep going!`);
    }
  }

  return {
    totalQuests: vowels.length,
    completedQuests: vowels.filter(v => v.nodesCompleted >= 16).length,
    overallAccuracy,
    vowels,
    needsPractice: needsPractice.slice(0, 3),
  };
}

/** Reset all analytics data */
export function resetAnalytics(): void {
  localStorage.removeItem(ANALYTICS_KEY);
}
