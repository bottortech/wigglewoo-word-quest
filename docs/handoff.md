# Session Handoff

Living doc — overwritten each time work pauses/switches machines, not a dated snapshot. Read this first when picking the project back up.

Last updated: 2026-09-09, on Mac. Full activity audit done; checkpoint-12 now routes to Word-Tac-Toe instead of a 2nd Cross-Match; WTT discoverability nudge added earlier today then retired same day (see below — don't be confused if you see it referenced in an older note).

---

## ⚠️ Before you do anything else

`git status` first. As of this write-up, still true:
- **~40 unrelated modified files** (`capacitor.config.ts`, `package.json`/`package-lock.json`, `vite.config.ts`, most `src/styles/*.css`, `GameShell.tsx`, `Stage.tsx`, etc.) — confirmed CRLF/LF line-ending noise, not content changes. Still no `.gitattributes` rule in place; still nobody's explicitly asked for one.
- `src/assets/word-tac-toe-logo.png` (untracked, on disk) — superseded, non-transparent leftover logo, not imported anywhere (`transparent-word-tac-toe-logo.png` is the one actually used, already committed). **Still no decision made** on deleting it.
- `background_wigglewoo_game.png`, `cat.png` — still show as deleted in the working tree. Confirmed genuinely gone from disk, unreferenced by any code, dating back to an early "CSS recovery" commit. Harmless root-level clutter — safe to let the deletion stand, but not staged/committed since it wasn't an explicit decision.

`npm install` first on a new machine — the portable drive's `node_modules` native binaries are OS-specific and will need reinstalling every time it switches between this Mac and the Windows machine. Expect it, don't re-diagnose it each time.

## What shipped this session (2026-09-09, on Mac)

### 1. Full visual + educational audit of every reachable activity

Went through Potion Game, Trace-Prep/handwriting, Cross-Match, Word-Tac-Toe, Discovery Room, and the Comprehension Question — actually driving the running dev server for each (not just reading source), scored 1–10 on visual/educational/curriculum/gameplay/UX + overall. Full ratings and reasoning are in this conversation's history (not saved as a separate doc — worth asking the user if they want it written up separately if it needs to survive independently of chat history).

**Headline finding, which drove everything else this session:** individual activities are strong (Cross-Match and Word-Tac-Toe both scored 8/10), but the *main quest* leans almost entirely on Potion Game, which is mechanically identical every single word/node/quest — repetition was the real problem, not activity quality.

**Comprehension Question** (inside Discovery Room facts) was re-scored after actually reaching it live — harder to get to than expected, since it's audio-`onended`-gated and narration audio doesn't exist yet in this dev environment (so `onerror` fires instead of `onended`, and the question never mounts through normal interaction — had to patch `HTMLMediaElement.prototype.play` via a CDP init script to force it through for testing purposes only, nothing changed in the app). Once seen: Visual 7/10 (better than expected — shares the fact card's exact styling, reads as part of the room), Gameplay/Fun 5/10 (the one real gap: plain rectangular list-row answer buttons, the only tap targets in the whole app that aren't colorful/circular/tactile like everywhere else), UX 8/10, Overall 6/10. Not fixed this session — flagged for later, see below.

**Also surfaced, not acted on:** the placement-test system (`src/game/placementTest.ts`) is fully built, fully scored, and completely unreachable in the current app — zero call sites anywhere. Needs a keep/revive/remove decision at some point; not urgent.

### 2. Checkpoint 12 now routes to Word-Tac-Toe instead of a 2nd Cross-Match (committed `2585c8b`)

Direct response to the repetition finding above. Smallest safe change, explicitly *not* the full configurable per-quest system:

```
Word1 → Word2 → Word3(trace) → Word4 → CROSS-MATCH → Word5 → Word6 → Word7(trace) → Word8 → TROPHY 1
→ Word9 → Word10 → Word11(trace) → Word12 → WORD-TAC-TOE → Word13 → Word14 → Word15(trace) → Word16 → TROPHY 2 → Discovery
```

- Word 4 → Cross-Match, unchanged.
- Word 12 → Word-Tac-Toe now, was Cross-Match. New `mainWordTacToeCheckpoint` state in `App.tsx`, reuses the *existing* `markCrossMatchComplete`/`getPendingCrossMatch` bookkeeping to track "checkpoint 12 satisfied" — no new persistence/schema, since that bookkeeping never cared which mini-game actually satisfied a checkpoint.
- **Kiosk mode is completely untouched** — it already has its own separate, hardcoded interleaving of both mini-games on a different sequence, so this main-build change doesn't apply there.
- This is *not* the configurable per-quest checkpoint-mini-game system from `docs/future-features/checkpoint-minigame-system.md` — that's still parked for after 9/26, per the user's explicit instruction not to open that scope yet. This is a fixed, hardcoded swap: every quest, same two checkpoints, same two mini-games, no per-quest mapping.

**Verified live**, both required checks: word 12 correctly opens Word-Tac-Toe (confirmed NOT Cross-Match); completing it as **either X or O** returns to the map identically — `currentWordIndex` advances to 12 (word 13 next) and `wigglewoo-crossmatch-all` shows `[4, 12]` (checkpoint 12 marked satisfied) in both cases. Mark choice structurally can't affect this — `WordTacToeScreen`'s `onComplete` takes no arguments.

**Also in this same commit:** the Word-Tac-Toe discoverability nudge (the "New game!" callout above the map button) was added earlier in *this same session*, then retired a few messages later once the checkpoint-12 change made it redundant — every quest now guarantees a Word-Tac-Toe encounter automatically, so nudging toward the optional button right after Phase-1 Trophy no longer serves a purpose. If you're reading an older note that mentions the nudge as a current feature, it's stale — the nudge state/handler/JSX/CSS are all removed. **The map button itself is untouched and still works for voluntary replay.**

**Verification:** `tsc -b` clean. `eslint .` moved from 103→105 problems — traced precisely, not just diffed by count: both new findings (a use-before-declare on the new state setter, a `useCallback` dependency-array warning) are the *exact same pre-existing pattern* already present ~10-11 other times each in this file (e.g. `crossMatchCheckpoint`, `trophyPhase` do the identical thing). Left as-is per explicit instruction — `App.tsx`'s broader lint/style cleanup is a separate future task, not mixed into this feature commit.

## Also still open (pre-existing, unrelated to this session's work)

- **Comprehension Question's plain answer buttons** — the one visual gap the audit surfaced with live confirmation. Not fixed yet; would mean restyling to match the colorful/circular tap-target convention used everywhere else (Word-Tac-Toe circles, Cross-Match word cards, Potion Game bottles).
- **"Say it out loud" interstitial** in Potion Game — plain white card dropped into the otherwise richly-themed lab scene, no mic/voice validation exists so the expected child action is unclear. Flagged in the audit, not touched.
- **Word-Tac-Toe's 4 VO lines** (`word-tac-toe-intro/win/lose/tie`) — still unrecorded, still failing silently.
- **Placement-test system** — fully built, completely unreachable, needs a keep/revive/remove decision (see audit finding above).
- **Checkpoint mini-game system (full v1.1 version)** — per-quest configurable mapping, spec at `docs/future-features/checkpoint-minigame-system.md`. Explicitly deferred until after 9/26 and Word-Tac-Toe is confirmed stable. Don't start without an explicit go-ahead.
- **CRLF line-ending cleanup** — still nobody's asked for it, still noisy in `git status`.
- **iOS App Store submission** — real prior progress (paid Apple Developer account, drafted metadata, privacy policy) documented in `docs/v1-launch-checklist.md`, blocked only on needing a Mac + Xcode, which is available now. Nothing built/archived yet.
- **MPL Community Tour** — library kiosk events booked 9/26, 10/17, 11/21/26, all 1–3pm (see memory `project-mpl-community-tour`). Kiosk mode itself is unchanged by anything this session, but the main-build progression it's built on top of just changed (checkpoint 12) — worth a fresh on-device pass before 9/26 given how much has moved since the last confirmed kiosk test.
