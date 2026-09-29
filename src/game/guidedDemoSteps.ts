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
 * Reused verbatim from the full tour, each with zero extra wiring: "map-overview",
 * "wardrobe-intro", "progress-rewards", "word-tac-toe-preview" — all plain
 * tap-callout, advanced by App.tsx's step-id-keyed effects the same way
 * regardless of which list is running. "quest-nodes-overview" is new,
 * highlighting the whole node path (all 16 gears) as one step rather than
 * any single gear, and comes right before "progress-rewards" — App.tsx's
 * `questBoxViewOverride` resets the quest-type box to its normal vowels view
 * on "progress-rewards" (not "stage-wardrobe-open", since that step no
 * longer immediately follows "map-overview" in this list).
 *
 * Two steps spotlight more than one element at once, via GuidedDemoOverlay's
 * union-rect measure(): "stage-parents-badges" (a comma-separated selector —
 * the For Parents and Badges pills are each independently `position:
 * absolute`, so no wrapper div could size around both) right after the
 * stars, for the parents/teachers/educators in the audience; and
 * "discovery-rooms-all" (a single container selector, since its five icons
 * are normal flex children) right before the five individual
 * discovery-preview-* stops, so the room highlights go "all five together,
 * then one by one" rather than folding the "these are the five..." framing
 * into the first individual stop.
 *
 * Trophy Room and the five Discovery Rooms are preview-only here — no real
 * entry into any of them, unlike the full tour's "trophy-room-preview" and
 * "discovery-room-preview" (both of which do enter/exit for real). A
 * presenter-paced highlight tour has no use for gameplay happening inside
 * either (the Trophy Room's win celebration only plays if someone actually
 * finishes its memory-match game), so this list uses its own
 * "stage-trophy-preview" id — tap-callout, no watcher — instead of reusing
 * "trophy-room-preview". The five discovery-preview-* steps are similarly
 * new: unlike the full tour's single "discovery-room-preview" (which only
 * ever tags whichever ONE room matches current progress), each targets its
 * own stable [data-room-id] so all five can be spotlighted individually in a
 * fixed order, each message terse since discovery-rooms-all already said
 * "these are the five Discovery Rooms."
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
    id: "quest-nodes-overview",
    targetSelector: '[data-tour-id="quest-nodes-overview"]',
    message: "Each quest has 16 fun word-building stops along the path — tap a gear to practice a word!",
    advance: "tap-callout",
  },
  {
    id: "progress-rewards",
    targetSelector: '[data-tour-id="vowel-tab"]',
    message: "Kids earn stars and see their progress every step of the way.",
    advance: "tap-callout",
  },
  // Group highlight — the For Parents and Badges pills sit right next to
  // each other (top-right corner), each `position: absolute` on their own,
  // so a comma-separated selector (not a wrapper div) is what lets
  // GuidedDemoOverlay spotlight both as one hole — see its union-rect
  // measure(). Placed right after the stars step since that's the natural
  // "progress" cluster for this audience (parents/teachers/educators at the
  // Expo), even though Badges physically sits with For Parents, not with
  // the vowel-tab stars box itself.
  {
    id: "stage-parents-badges",
    targetSelector: '[data-tour-id="for-parents-btn"], [data-tour-id="badges-btn"]',
    message: "For Parents and educators, plus Badges — where kids can see every skill they've picked up.",
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
  // Preview-only, unlike the full tour's "trophy-room-preview" (which
  // actually enters/exits the real room) — deliberately its own id, own
  // tap-callout advance, no real entry. A presenter-paced highlight tour
  // has no use for the win celebration inside (it only plays if someone
  // actually finishes the memory-match game), and skipping entry entirely
  // removes any chance of it firing mid-narration.
  {
    id: "stage-trophy-preview",
    targetSelector: '[data-tour-id="trophy-room-btn"]',
    message: "The Trophy Room is a reward kids unlock as they go.",
    advance: "tap-callout",
  },
  // Group highlight first — all five Discovery Room icons together, via the
  // same union-rect selector mechanism as stage-parents-badges (here just a
  // single container selector, .discovery-preview-row, since its five
  // buttons are normal flex children rather than independently absolute-
  // positioned — the container's own rect already encloses all five).
  {
    id: "discovery-rooms-all",
    targetSelector: '[data-tour-id="discovery-rooms-group"]',
    message: "And these are the five Discovery Rooms — kids unlock each one as they finish a sound family.",
    advance: "tap-callout",
  },
  // Five individual stops, one per Discovery Room, in a fixed left-to-right
  // order — each targets its own stable [data-room-id], unlike the full
  // tour's single "discovery-room-preview" step (which only ever tags
  // whichever ONE room matches current progress). Preview-only by design —
  // no need to actually enter any of them to mention what they are. Terse
  // on purpose — "these are the five Discovery Rooms" was already said by
  // discovery-rooms-all just above, so these just name each one.
  {
    id: "discovery-preview-valcano",
    targetSelector: '[data-room-id="valcano"]',
    message: "Rumble Peak.",
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
