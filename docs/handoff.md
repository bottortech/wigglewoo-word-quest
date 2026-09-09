# Session Handoff

Living doc — overwritten each time work pauses/switches machines, not a dated snapshot. Read this first when picking the project back up.

Last updated: 2026-09-08, on Windows, about to switch to Mac.

---

## ⚠️ Before you do anything else on the Mac

This machine had **uncommitted local changes** when this doc was written:
```
 M src/App.tsx
 M src/game/progression.ts
 M src/screens/ExploreScreen.tsx
?? src/assets/wigglewoo_O.png
?? src/assets/wigglewoo_X.png
```
If these weren't committed + pushed before you left the Windows machine, `git pull` on the Mac will **not** include:
- Cross-Match re-enabled (main build: word 4 only; kiosk build: new insertion between word 3 and the final word)
- Auto-return to the Discovery Room fact grid after a correct comprehension-question answer
- The two new WiggleWoo pose assets (`wigglewoo_X.png` / `wigglewoo_O.png`, for the Word-Tac-Toe plan below)

Check `git log --oneline -3` and `git status` on the Mac first. If that work is missing, it's still sitting on the Windows machine — don't redo it from scratch, go get it.

## Fresh-machine setup

This repo lives on a portable drive — `node_modules` binaries don't travel between machines. On the Mac:
```
npm install
```
before anything else (build, dev server, `cap sync`).

---

## What shipped this session (2026-09-08, MPL library-tour follow-up)

1. **Cross-Match mini-game re-enabled** (`src/game/progression.ts` — `CROSSMATCH_CHECKPOINTS`), scoped to word 4 only across all tiers. Word 12 deliberately excluded — CVCC/Magic-E/CVVC/Advanced quests have no picture assets for words 9+ (they're "decode mode"), so a word-12 checkpoint would silently degrade to text-only matching.
   - Also wired into the **kiosk build** (new — previously architecturally unreachable there): fires after kiosk's 3rd word, reviewing those exact 3 words, before continuing into the final mastery-check word. See `src/App.tsx`'s `kioskCrossMatchActive` state and the `handleNavigate` kiosk branch.
   - Verified live on-device, both builds, full flow through to Trophy Room.
2. **Discovery Room comprehension-question auto-return**: after a correct answer, holds the celebration ~1.8s then auto-returns to the fact-selection grid (`ExploreScreen.tsx`'s `handleQuestionCorrect`). Verified via CDP-driven clicks (physical touch taps on this device have a known queuing/timing quirk during rapid testing — see below).

## Known testing quirk (not an app bug)

Physical `adb shell input tap` commands sent in quick succession during live-device testing have repeatedly shown a timing/queuing artifact on the Tab A7 Lite this session — taps occasionally land on a later screen than intended, or seem to "phantom-trigger" actions that weren't tapped. When verifying anything time-sensitive, prefer driving clicks through CDP (`element.click()` via `Runtime.evaluate`) over physical taps, or add longer waits + screenshot-confirm after every single tap.

---

## Next planned feature: Word-Tac-Toe

Full spec came from the user; a codebase investigation (not yet any code) produced a recommended plan. **Nothing has been built yet.** Summary below — see the conversation this session for the complete original spec if more detail is needed.

### Concept
Single-player tic-tac-toe: child = teal X, WiggleWoo/CPU = orange O. Tapping an empty square triggers a phonics challenge; answering correctly (first try or after hints — wrong answers never cost the turn) places the X. CPU plays instantly, "soft" difficulty (mostly random, occasional smart block/win). Target age 4–8, tablet landscape first.

### Recommended architecture (confirmed via investigation, not yet built)
- **New self-contained screen**: `src/screens/WordTacToeScreen.tsx` + `src/styles/word-tac-toe.css`, following `CrossMatchScreen.tsx`'s pattern exactly — owns all its own state (board, turns, active challenge, CPU logic) internally, reports back to `App.tsx` via one `onComplete`/`onBack` callback. Do **not** spread game state into `App.tsx` — it's already large after this session's kiosk + Cross-Match wiring.
- **Entry/exit**: new pill button on the Quest Map, copied from the existing "Badges" button (`QuestMapScreen.tsx:1340`) — same styling convention, new `onOpenWordTacToe` prop, its own `right` CSS offset so it doesn't collide with Badges/For Parents. New `Route` union member `"word-tac-toe"` in `App.tsx`, mounted with Badges' simple footprint (not Cross-Match's dual-purpose complexity — there's only one entry point here).
- **Challenge card visual style**: reuse the parked mini-games' `.mg-play-board`/`.mg-soundpop-letters` convention (`src/styles/miniGames.css`) — full-screen dimmed overlay, floating glass card, large circular tap-target buttons — not `ComprehensionQuestion`'s compact sidebar-quiz look, which reads too small/list-like for a game moment.
- **Assets**: `wigglewoo_X.png` / `wigglewoo_O.png` already sit in `src/assets/` (untracked as of this doc) — import as ES modules, matching every other character-pose PNG in that folder.
- **CPU logic + win-detection**: nothing like this exists anywhere in the codebase (confirmed via grep) — built entirely from scratch.

### Challenge-type decision (recommended, pending user confirmation)
Investigated what's buildable from *existing* data with zero new content authoring:
- **Missing-letter** — every `CvcWord` in every tier already has `letters` + `distractors`. Works across the whole curriculum (CVC through Advanced), not just short-vowel rooms. **Recommended as one of the two V1 types.**
- **Word-picture-match** — every `CvcWord` already has `word` + `imageKey`. Also free. **Recommended as the other V1 type.**
- Rhyme/beginning/ending-sound — buildable but only by borrowing the parked `discoveryMiniGames.ts`'s `ROOM_WORD_DATA`/`ONSET_POOL`, which only covers 5 short-vowel CVC rooms (silently inapplicable to later tiers). Reasonable as a V1.1 addition scoped to CVC only.
- Magic-E / vowel-team as their own distinct challenge type — needs genuinely new curated data, not free.

**Recommendation given to the user**: ship V1 with just missing-letter + word-picture-match (zero new content, works for every tier), matching their explicit "keep V1 small" instruction. **Not yet confirmed by the user** — confirm before building.

### Other open decisions (not yet confirmed)
- CPU difficulty weighting — proposed default ~70% random / ~30% take-a-win-or-block-if-available, but genuinely a "tune after playing it" number, not locked in.
- Whether Word-Tac-Toe should be reachable in kiosk builds at all — the original spec never mentions kiosk, and kiosk sessions are deliberately short / don't linger on the Quest Map. Leaning toward main-build-only unless told otherwise.

---

## Also still open (pre-existing, unrelated to this session's work)

- **iOS App Store submission** — real prior progress (paid Apple Developer account, drafted metadata, privacy policy) documented in `docs/v1-launch-checklist.md`, but blocked on needing an actual Mac + Xcode for `pod install` / archive / TestFlight / real-device testing — this is now unblocked by working on the Mac. The `ios/` Xcode project's bundled web content was manually re-synced once this session (`npx cap sync ios`, production build) but nothing has been built/archived since — do that fresh on the Mac rather than trusting the old sync is still current if more work has landed since.
- **MPL Community Tour**: 3 more library kiosk events booked — 9/26, 10/17, 11/21/26, all 1–3pm (see memory `project-mpl-community-tour`). Kiosk build is currently stable/event-tested as of 9/5 and 9/8 sessions.
