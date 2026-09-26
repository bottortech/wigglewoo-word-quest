// =============================================
// guidedDemoSteps.ts — Guided Demo step definitions
// WiggleWoo's Word Quest
// =============================================
// Data-driven step list for the presentation/event walkthrough (ED Games
// Expo, etc.). Each step names a real, already-existing element to spotlight
// (via a `data-tour-id` attribute added to that element) and how the demo
// advances past it. Reordering, rewriting, adding, or removing steps is just
// editing this array — no changes needed in the overlay renderer or the
// controller reducer.
//
// `advance` describes what unblocks the NEXT step:
//   - "tap-callout": the visitor (or presenter) taps "Got it" on the callout
//     itself — used for informational steps with nothing to actually do.
//   - "app-state": a real app-state transition already produced by normal
//     gameplay (opening the wardrobe, navigating to a screen, completing a
//     word, equipping a skin) advances the step. App.tsx watches for the
//     specific transition named by `id` — see GUIDED_DEMO_ADVANCE_SIGNALS.
// =============================================

export type GuidedDemoAdvanceMode = "tap-callout" | "app-state";

export interface GuidedDemoStep {
  id: string;
  /** CSS selector for the real element to spotlight, e.g. '[data-tour-id="wardrobe-btn"]'. */
  targetSelector: string;
  message: string;
  advance: GuidedDemoAdvanceMode;
}

export const GUIDED_DEMO_STEPS: GuidedDemoStep[] = [
  {
    id: "home-play",
    targetSelector: '[data-tour-id="play-now-btn"]',
    message: "Welcome to WiggleWoo's Word Quest! Let's take a look around — tap Play Now to begin.",
    advance: "app-state",
  },
  {
    id: "wardrobe-intro",
    targetSelector: '[data-tour-id="wardrobe-carousel"]',
    message: "This is WiggleWoo! You can dress him up — swipe to browse, then tap Use This Character to pick one.",
    advance: "app-state",
  },
  {
    id: "map-overview",
    targetSelector: '[data-tour-id="quest-type-tabs"]',
    message: "This is the Map — it's where kids choose what to practice.",
    advance: "tap-callout",
  },
  {
    id: "vowel-choice",
    targetSelector: '[data-tour-id="vowel-tab"]',
    message: "Each tab is a different sound family. Tap one to open it.",
    advance: "app-state",
  },
  {
    id: "start-activity",
    targetSelector: '[data-tour-id="gear-node-1"]',
    message: "Tap a gear to start a word!",
    advance: "app-state",
  },
  {
    id: "complete-word",
    targetSelector: '[data-potion-letter]',
    message: "Build the word by tapping the potions in order.",
    advance: "app-state",
  },
  {
    id: "progress-rewards",
    targetSelector: '[data-tour-id="vowel-tab"]',
    message: "Great job! Stars like these track progress on every sound family.",
    advance: "tap-callout",
  },
  {
    id: "word-tac-toe-preview",
    targetSelector: '[data-tour-id="word-tac-toe-btn"]',
    message: "Here's Word-Tac-Toe — a fun way to review words. Give it a try!",
    advance: "app-state",
  },
  {
    id: "discovery-room-preview",
    targetSelector: '[data-tour-id="discovery-room-btn"]',
    message: "And here's a Discovery Room — read fun facts about the world!",
    advance: "app-state",
  },
  {
    id: "trophy-room-preview",
    targetSelector: '[data-tour-id="trophy-room-btn"]',
    message: "The Trophy Room is a reward game kids unlock as they go. Let's peek inside.",
    advance: "app-state",
  },
  {
    id: "free-play",
    targetSelector: '[data-tour-id="quest-type-tabs"]',
    message: "You're ready! Explore anything you like.",
    advance: "tap-callout",
  },
];
