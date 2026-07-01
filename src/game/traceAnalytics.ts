// traceAnalytics.ts — Per-letter handwriting trace analytics
// Client-only (localStorage). Structured for future backend sync.
// All events are appended; summaries are derived at read-time.

const TRACE_KEY = "ww_trace_analytics";
const MAX_EVENTS = 500; // rolling cap to prevent unbounded storage growth

export type LetterPosition = "first" | "vowel" | "last";

export interface LetterTraceEvent {
  childId:              null;           // reserved — future multi-profile support
  timestamp:            number;         // Date.now() when this letter was shown
  lessonIndex:          number;         // 0–3
  difficultyLevel:      number;         // same as lessonIndex (0=easiest, 3=hardest)
  questId:              string;         // e.g. "quest-short-a"
  word:                 string;         // e.g. "cat"
  letter:               string;         // e.g. "c"
  letterPosition:       LetterPosition; // "first" | "vowel" | "last"
  sessionAttemptNumber: number;         // 1 = first time word was traced this session
  completed:            boolean;        // true = traced through; false = skipped/backed out
  completionPct:        number;         // 0 or 100 (per-letter; finer granularity in future)
  timeSpentMs:          number;         // ms from letter shown to completion or exit
  hintUsed:             boolean;        // true when skip/back was used instead of tracing
  device:               string;         // navigator.platform (e.g. "iPhone", "MacIntel")
}

export interface LetterTraceSummary {
  letter:         string;
  totalAttempts:  number;
  completed:      number;
  skipped:        number;
  successRate:    number;        // 0–100
  avgTimeMs:      number;        // average ms for completed traces
  lastPracticed:  number | null; // timestamp of most recent attempt
}

// ---- Storage ----

interface TraceStore {
  events:  LetterTraceEvent[];
  version: number;
}

function loadStore(): TraceStore {
  try {
    const raw = localStorage.getItem(TRACE_KEY);
    if (raw) return JSON.parse(raw) as TraceStore;
  } catch { /* ignore parse errors */ }
  return { events: [], version: 1 };
}

function saveStore(store: TraceStore): void {
  if (store.events.length > MAX_EVENTS) {
    store.events = store.events.slice(-MAX_EVENTS);
  }
  localStorage.setItem(TRACE_KEY, JSON.stringify(store));
}

// ---- Public write API ----

export function recordTraceEvent(event: LetterTraceEvent): void {
  const store = loadStore();
  store.events.push(event);
  saveStore(store);
}

// ---- Public read API ----

export function getAllTraceEvents(): LetterTraceEvent[] {
  return loadStore().events;
}

/** Per-letter aggregates — most practiced letters first. */
export function getLetterTraceSummaries(): LetterTraceSummary[] {
  const events = getAllTraceEvents();
  const byLetter: Record<string, LetterTraceEvent[]> = {};

  for (const ev of events) {
    (byLetter[ev.letter] ??= []).push(ev);
  }

  return Object.entries(byLetter)
    .map(([letter, evs]): LetterTraceSummary => {
      const done    = evs.filter(e => e.completed);
      const skipped = evs.filter(e => !e.completed);
      const avgTimeMs = done.length > 0
        ? Math.round(done.reduce((s, e) => s + e.timeSpentMs, 0) / done.length)
        : 0;
      const lastPracticed = evs.reduce((mx, e) => Math.max(mx, e.timestamp), 0) || null;
      return {
        letter,
        totalAttempts: evs.length,
        completed:     done.length,
        skipped:       skipped.length,
        successRate:   evs.length > 0 ? Math.round((done.length / evs.length) * 100) : 0,
        avgTimeMs,
        lastPracticed,
      };
    })
    .sort((a, b) => b.totalAttempts - a.totalAttempts);
}

export function resetTraceAnalytics(): void {
  localStorage.removeItem(TRACE_KEY);
}
