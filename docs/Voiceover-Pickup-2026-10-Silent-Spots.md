# WiggleWoo's Word Quest — Voiceover Pickup Round 5 (Remaining Silent Spots)

**Prepared for:** Phrase Narrator (same voice as the existing short prompt/encouragement clips already in the game, e.g. "Drag a letter," "Let's build a word!")
**Scope:** 8 phrases
**Status:** Not urgent for app functionality (text-only fallback works today) but worth prioritizing — several of these are a brand-new player's very first moments in the app.

**Hand this over together with `Voiceover-Pickup-2026-09-Comprehension.md` ("Round 4")** — that's a separate 80-line doc for a different narrator (Content Narrator, matching the Discovery Room fact-narration voice), covering the comprehension questions that follow each Discovery Room fact. Both rounds came out of the same silent-spot audit; Round 4 just didn't need rewriting.

---

## Context

Full audit of the standard (non-event, non-kiosk) app for kid-facing text with no audio, prompted by the Comprehension Questions find. Two items from this audit turned out to need no recording at all — see "Free fixes, no recording needed" at the bottom — everything above that line is a genuine new line to record.

## Phrases needed

| # | Line to record | Suggested file name | Shown when |
|---|---|---|---|
| 1 | "Let's make CAT! Tap the C potion." | `onboarding-tap-c.m4a` | First-time tutorial, step 1 (`OnboardingScreen.tsx`) |
| 2 | "Now tap the A potion." | `onboarding-tap-a.m4a` | First-time tutorial, step 2 |
| 3 | "Last one — tap the T potion!" | `onboarding-tap-t.m4a` | First-time tutorial, step 3 |
| 4 | "Choose your piece!" | `wtt-choose-piece.m4a` | Word-Tac-Toe's piece-select screen, before the board appears (`WordTacToeScreen.tsx`) |
| 5 | "Great exploring! You found some facts today — come back tomorrow for more!" | `daily-cap-reached.m4a` | Discovery Room daily fact cap reached (`DailyCapModal.tsx`) — reworded slightly from the on-screen text to drop the hardcoded "4," since that number lives in config and could change without this recording being updated |
| 6 | "Trace the letter with your finger!" | `trace-the-letter.m4a` | First-visit letter-trace overlay, ~400ms after it opens (`TraceMoment.tsx`) — carried over from the original May pickup, never recorded or wired |
| 7 | "Pick your favorite WiggleWoo look!" | `wardrobe-intro.m4a` | The Wardrobe opens (main-build voluntary entry and the kiosk first-visit intro) |
| 8 | "Finish the Discovery Room to unlock this WiggleWoo!" | `wardrobe-locked.m4a` | The browsed skin in the carousel is locked (generic — doesn't name the specific room) |

Dropped from the prior draft of this doc: "Great choice! You're wearing this WiggleWoo now." (wardrobe-equipped) — kept out for now to hold the line count down; easy to add back later if wanted. Also dropped: "Challenge Mode unlocked!" — turned out a recording for this already exists, see below.

## Delivery

- **Voice/style:** Match the existing short prompt-phrase clips already in the game (`/assets/audio/phrases/`, e.g. `drag-a-letter.m4a`, `lets-build-a-word.m4a`) — upbeat, kid-facing instruction, not the single-word pronunciation voice and not the WiggleWoo character voice.
- **File type:** `.m4a`, matching the current phrase-audio format.
- **Naming:** Use the file names above exactly.
- **Timing:** No rush — batch in whenever convenient. Not wired into the code yet; the game reads fine with these silent (text-only), exactly as it does today.

## Once recorded

Not wired up yet — someone needs to add a dedicated `play*Phrase()` function per line in `src/audio/SoundEffects.ts` (following the exact pattern of `playTapCardPhrase()`), then call each one from its component: `OnboardingScreen.tsx` (one per guide step, alongside the existing `onboard-intro` call), `WordTacToeScreen.tsx` (on the piece-choose screen's mount), `DailyCapModal.tsx` and `TraceMoment.tsx` (on mount), `WardrobeModal.tsx` (on open, and when the displayed skin is locked). Small, low-risk additions once the files exist.

## Free fixes, no recording needed

Found during the same audit — both are existing, already-recorded audio that just never got called from the code:

1. **"Challenge Mode Unlocked!"** — `ChallengeModeUnlock.tsx` (the per-quest version, triggered from `App.tsx`) has no audio, but the exact same message is already recorded as `decode-unlock.m4a` and used by a *different* Challenge Mode modal on the Quest Map (the tier-wide version). Fix: call `playEvent("decode-unlock")` from `ChallengeModeUnlock.tsx` on mount.
2. **"Tap here to start!"** — the first-time onboarding arrow pointing at WiggleWoo on the Quest Map has no audio, but `onboard-tap-gear.m4a` already exists on disk and is never referenced anywhere in the code. Fix: call `playEvent("onboard-tap-gear")` where `showOnboardingArrow` first becomes true.

*End of pickup script — Round 5, Remaining Silent Spots.*
