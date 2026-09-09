# Session Handoff

Living doc — overwritten each time work pauses/switches machines, not a dated snapshot. Read this first when picking the project back up.

Last updated: 2026-09-09, on Mac. Two approved gameplay-loop fixes shipped; Windows session's uncommitted logo-button work folded into the same commit.

---

## ⚠️ Before you do anything else

`git status` first. As of this write-up, still true:
- **~40 unrelated modified files** (`capacitor.config.ts`, `package.json`/`package-lock.json`, `vite.config.ts`, most `src/styles/*.css`, `GameShell.tsx`, `Stage.tsx`, etc.) — confirmed CRLF/LF line-ending noise, not content changes. Still no `.gitattributes` rule in place; still nobody's explicitly asked for one.
- `src/assets/word-tac-toe-logo.png` (untracked, on disk) — superseded, non-transparent leftover logo, not imported anywhere (`transparent-word-tac-toe-logo.png` is the one actually used, now committed). **Still no decision made** on deleting it — left alone again this session.
- `background_wigglewoo_game.png`, `cat.png` — still show as deleted in the working tree. Checked this session: both are genuinely gone from disk, unreferenced by any code (grepped), and date back to a very early "CSS recovery" commit. Looks like harmless root-level clutter — safe to let the deletion stand, but not staged/committed by this session since it wasn't an explicit decision.

`npm install` first on a new machine — **hit this again this session**, moving from Windows back to Mac. `node_modules`'s native rollup binary was Windows-specific again; `rm -rf node_modules && npm install` fixed it both times it came up. This will keep happening every time the portable drive switches OS — worth just expecting it as a routine first step, not re-diagnosing each time.

## What shipped this session (2026-09-09, on Mac)

Continuation of the Windows session's "gameplay-loop review" — two of the three flagged items were approved and built; the third was discussed and explicitly deferred to a documented v1.1 idea rather than decided ad hoc.

1. **Second Cross-Match checkpoint at word 12** (`src/game/progression.ts`) — `CROSSMATCH_CHECKPOINTS` is now `[4, 12]`. Both `getPendingCrossMatch` and the word-slicing logic in `App.tsx` were already written generically over the array, so this was a one-line change. **Important nuance the "stale comment" framing undersold**: the original comment wasn't stale, it was a deliberate, correct warning — CVCC/Magic-E/CVVC/Advanced quests switch to picture-less "decode" mode by word 9, so a word-12 Cross-Match would degrade to text-only matching there. It's safe *right now* only because v1 clamps play to CVC-only (`ww_placement_tiers` forced to `["CVC"]`), and every CVC quest keeps `mode: "image"` through all 16 words (verified directly in `wordData.ts`). **Re-check this before ever lifting that clamp for v1.1** — the comment in `progression.ts` now says so explicitly.
2. **Word-Tac-Toe discoverability nudge** (`QuestMapScreen.tsx` + `questmap.css`) — one-time "New game!" callout + bobbing arrow above the Quest Map button, shown once ever, gated on `trophyProgress.tier !== "none"` (Phase-1 Trophy earned) and a `ww_wtt_nudge_seen` localStorage flag. Dismissed by tapping the button itself (which also opens Word-Tac-Toe — no separate dismiss-without-opening affordance). Verified live via a driven browser session (seeded trophy state, confirmed the callout renders and the flag gets set on tap).
3. **Per-quest checkpoint mini-game variety** — discussed, explicitly deferred. Documented as a proper v1.1 spec: [docs/future-features/checkpoint-minigame-system.md](future-features/checkpoint-minigame-system.md), with a row in `CLAUDE.md`'s deferred-features table. Key point captured: when that system is built, the Word-Tac-Toe button/nudge must become conditional (suppressed on any quest where WTT is already a required checkpoint) so it's not redundantly promoted as optional.

**Also folded into the same commit**: the Windows session's final Word-Tac-Toe entry-button pass (`QuestMapScreen.tsx`/`questmap.css` — logo-image button replacing the hand-built card) was sitting uncommitted; since I was already touching these same two files for the nudge, it went into this commit too rather than staying stranded. It had already been reviewed and tested live on the Tab A7 Lite per the Windows session's notes.

**Verification:** `tsc -b` clean, `eslint .` unchanged from baseline (103/76/27).

**Correction to a claim I made earlier this session:** I told the user "nothing has been tested in the actual kiosk build yet," based on this doc's own prior wording. The user clarified: they *did* manually verify the kiosk build themselves on Windows — it just hadn't been independently verified by Claude/this session. Distinguish these two going forward: "user manually confirmed X on-device" and "Claude verified X" are not the same claim, and this doc should say which one happened.

## Also still open (pre-existing, unrelated to this session's work)

- **iOS App Store submission** — real prior progress (paid Apple Developer account, drafted metadata, privacy policy) documented in `docs/v1-launch-checklist.md`, blocked only on needing a Mac + Xcode, which is available now. Nothing built/archived yet.
- **MPL Community Tour** — library kiosk events booked 9/26, 10/17, 11/21/26, all 1–3pm (see memory `project-mpl-community-tour`). The redesigned Word-Tac-Toe (side-by-side layout, mark selection, nudge) has been manually tested by the user on the Tab A7 Lite via the Quest Map's direct entry button; whether it's been run all the way through an actual kiosk build (`npm run build:kiosk`) sequence on-device is unconfirmed by this doc — ask before assuming either way.
- **VO pickup script** for the 4 `word-tac-toe-intro/win/lose/tie` lines — still not drafted, still just failing silently.
- **CRLF line-ending cleanup** — still nobody's asked for it, still noisy in `git status`.
