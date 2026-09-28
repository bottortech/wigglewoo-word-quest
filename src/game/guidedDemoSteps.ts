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

/**
 * Preset for the on-stage segment of a live presentation — a presenter-
 * narration aid, not a hands-on demo. It's map-centric on purpose: Home is
 * barely a "stop" (just the real door into the app, mostly a moment for the
 * presenter's own intro), then everything else showcases what actually
 * lives on the Map — WiggleWoo/wardrobe, progress stars, the Trophy Room,
 * all five Discovery Rooms, and finally Word-Tac-Toe. No timer and no
 * required gameplay (no vowel-choice/build-a-word step) — every stop
 * advances on a deliberate tap ("Got it" or the real element itself), at
 * the presenter's own speaking pace, so there's no live-gameplay risk while
 * they're talking to a room.
 *
 * Deliberately ends ON Word-Tac-Toe: the last step's message IS the pitch
 * ("a fun way to practice words together!"), and dismissing it drops back to
 * a fully normal, interactive map — the presenter's own cue to call up the
 * first two volunteers and start the real two-tablet versus game themselves
 * (see EventMenu's "Play Word-Tac-Toe"), not something this tour does for
 * them.
 *
 * Arrives at the Map BEFORE the wardrobe — Play Now goes straight there
 * (real navigation, same as any returning player), and the wardrobe only
 * opens afterward, as its own step, when the presenter taps the real
 * "Open Wardrobe" button live. That's why this list uses its own
 * "stage-home-play" / "stage-wardrobe-open" ids instead of reusing the full
 * tour's "home-play" (which auto-opens the wardrobe as a side effect —
 * exactly the ordering this preset deliberately avoids) — each needs its
 * own small App.tsx watcher.
 *
 * Reused verbatim from the full tour, each with zero extra wiring:
 * "wardrobe-intro" and "trophy-room-preview" (both app-state/tap-callout
 * effects already keyed by id, not by which list is running — Trophy Room's
 * exit doesn't require finishing the matching game, its "Continue Quest"
 * button is available immediately on entry); "map-overview",
 * "progress-rewards", "word-tac-toe-preview" (plain tap-callout, no watcher
 * at all). The five discovery-preview-* steps are new: unlike the full
 * tour's single "discovery-room-preview" (which only ever tags whichever
 * ONE room matches current progress), each targets its own stable
 * [data-room-id] so all five can be spotlighted individually in a fixed
 * order — preview-only, no need to actually enter any of them.
 */
export const STAGE_DEMO_STEPS: GuidedDemoStep[] = [
  {
    id: "stage-home-play",
    targetSelector: '[data-tour-id="play-now-btn"]',
    message: "This is WiggleWoo's Word Quest — built to make phonics practice feel like a game.",
    advance: "app-state",
  },
  {
    id: "map-overview",
    targetSelector: '[data-tour-id="quest-type-tabs"]',
    message: "This is the learning map — five sound families, each with its own set of quick word-building activities.",
    advance: "tap-callout",
  },
  {
    id: "stage-wardrobe-open",
    targetSelector: '[data-tour-id="wardrobe-open-btn"]',
    message: "And here's WiggleWoo — tap here to see his wardrobe!",
    advance: "app-state",
  },
  {
    id: "wardrobe-intro",
    targetSelector: '[data-tour-id="wardrobe-carousel"]',
    message: "Kids unlock new looks for him as they explore the app.",
    advance: "tap-callout",
  },
  {
    id: "progress-rewards",
    targetSelector: '[data-tour-id="vowel-tab"]',
    message: "Kids earn stars and see their progress every step of the way.",
    advance: "tap-callout",
  },
  // Reuses the full tour's "trophy-room-preview" id on purpose — that step
  // is already app-state (the shared "preview steps" watcher in App.tsx
  // advances once the presenter enters the real Trophy Room and exits back
  // to the map), so it works here with zero new wiring. Exiting doesn't
  // require finishing the matching game — TrophyRoomScreen's "Continue
  // Quest" button is available immediately on entry.
  {
    id: "trophy-room-preview",
    targetSelector: '[data-tour-id="trophy-room-btn"]',
    message: "The Trophy Room is a reward kids unlock as they go — let's peek inside.",
    advance: "app-state",
  },
  // Five individual stops, one per Discovery Room, in a fixed left-to-right
  // order — each targets its own stable [data-room-id], unlike the full
  // tour's single "discovery-room-preview" step (which only ever tags
  // whichever ONE room matches current progress). Preview-only by design —
  // no need to actually enter any of them to mention what they are.
  {
    id: "discovery-preview-valcano",
    targetSelector: '[data-room-id="valcano"]',
    message: "And these are the five Discovery Rooms — like Rumble Peak — kids unlock as they finish each sound family.",
    advance: "tap-callout",
  },
  {
    id: "discovery-preview-castle-island",
    targetSelector: '[data-room-id="castle-island"]',
    message: "Stonewall Castle.",
    advance: "tap-callout",
  },
  {
    id: "discovery-preview-small-coastal-village",
    targetSelector: '[data-room-id="small-coastal-village"]',
    message: "Coral Cove.",
    advance: "tap-callout",
  },
  {
    id: "discovery-preview-industrial-tech-city",
    targetSelector: '[data-room-id="industrial-tech-city"]',
    message: "Geartown.",
    advance: "tap-callout",
  },
  {
    id: "discovery-preview-glass-dome",
    targetSelector: '[data-room-id="glass-dome"]',
    message: "And Greenhouse — the last of the five.",
    advance: "tap-callout",
  },
  {
    id: "word-tac-toe-preview",
    targetSelector: '[data-tour-id="word-tac-toe-btn"]',
    message: "And here's Word-Tac-Toe — a fun, competitive way to practice words together!",
    advance: "tap-callout",
  },
];
