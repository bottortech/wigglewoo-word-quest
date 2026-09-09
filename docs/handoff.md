# Session Handoff

Living doc — overwritten each time work pauses/switches machines, not a dated snapshot. Read this first when picking the project back up.

Last updated: 2026-09-09, on Mac. Word-Tac-Toe redesign complete and committed.

---

## ⚠️ Before you do anything else

`git status` first. As of this write-up, the working tree still has **~40 unrelated modified files** (`capacitor.config.ts`, `package.json`/`package-lock.json`, `vite.config.ts`, most `src/styles/*.css`, `GameShell.tsx`, `Stage.tsx`, `LessonObjectiveCard.tsx`, `LoadingScreen.tsx`, handwriting files, `main.tsx`) sitting dirty. **Confirmed this session: these are Windows-CRLF vs Mac-LF line-ending noise, not real content changes** — `git diff package.json` showed every line removed+re-added with byte-identical content. Almost certainly true of the rest too, though not individually re-verified. Still worth a deliberate decision (normalize + commit once, or add a `.gitattributes` line-ending rule) rather than leaving it dirty indefinitely — not done yet, still nobody's explicitly asked for it.

`npm install` first on a new machine — native `node_modules` binaries don't travel on the portable drive this repo lives on. (Hit this personally this session: `vite`/`vite build` failed with `Cannot find module @rollup/rollup-darwin-x64` until a clean `rm -rf node_modules && npm install`.)

## What shipped this session (2026-09-09, on Mac)

**Word-Tac-Toe — full redesign, committed.** The first pass (built in an earlier session, already committed) worked but tested as a confusing "functional prototype" with no onboarding and a generic dark modal for the challenge card. This session's rework, based on user feedback + an approved design mockup (`docs/word-tac-toe-redesign.pdf`):

1. **Choose Your Piece screen** (new) — the child picks teal X or orange O before anything else; WiggleWoo/CPU takes whichever is left. This choice now drives *everything* downstream: board markers, the instruction-bar portrait, turn feedback text, win/lose text, and the CPU's own move logic (`cpuChooseMove`/`findWinningMove` take `cpuMark`/`childMark` params — nothing is hardcoded to "child is X" anymore).
2. **Taught flow** — instruction bar (WiggleWoo portrait + speech bubble) walks through "Tap a square to make your move!" → "Choose the missing letter!" / "Which word matches the picture?" → placement → CPU's turn, in both builds.
3. **Streak chip** — small "⭐ N in a row!" pill, appears at streak ≥ 2, resets on any wrong attempt within a challenge (still doesn't cost the turn). Not a persistent scoreboard.
4. **Visual redesign** — warm wood/parchment board panel with dashed cells and a soft glow on empty ones (was flat dark blurred boxes); challenge card is now a bottom-anchored drawer that opens out of the board (board dims to 55%/scales to 94%, never a full dark modal) instead of covering it.
5. Real `wigglewoo_X.png`/`wigglewoo_O.png` character art used throughout (board pieces, choose-piece cards, portrait) — no placeholders left.
6. **Fixed mid-session**: the drawer's connector "tab" was a rectangular nub trying to visually touch the board's bottom edge, but the board sits at a different (dimmed/scaled) position with no shared coordinate reference — looked like a seam. Replaced with a self-contained pill "handle" straddling the drawer's own top border, styled from the drawer's own colors — looks right regardless of board position/size.

**Verification this session:**
- `tsc -b` clean, `eslint .` unchanged from the pre-existing baseline (103 problems / 76 errors / 27 warnings, confirmed via direct re-run, not just `git stash` diffing this time).
- **Visually audited by driving the actual running dev server via raw CDP** (Chrome headless + native Node WebSocket, no puppeteer dep — script at hand if needed again, wasn't kept since it's throwaway tooling) — captured real screenshots at the 1366×1024 reference size through the full flow: Quest Map button → Choose Piece → board idle → challenge drawer open → post-round-1 (pieces placed) → 2-in-a-row streak chip. All confirmed matching the approved design direction. This was reviewed and approved by the user before committing.
- Kiosk build was **not** re-tested this session (same component, so the taught flow carries over automatically in principle, but not verified on-device or even in `dev:kiosk`).

**Not done yet:**
- VO pickup script for the 4 new `word-tac-toe-intro/win/lose/tie` lines — still just wired to fail silently (no audio files exist). Not drafted.
- The CRLF line-ending cleanup mentioned above.
- **On-device kiosk testing on the actual Galaxy tablets — this is the explicit next step**, ahead of the next MPL Community Tour event on **9/26**. User plans to first play through the main-build redesign themselves on the running dev server, then move to kiosk/tablet testing.

## Also still open (pre-existing, unrelated to this session's work)

- **iOS App Store submission** — real prior progress (paid Apple Developer account, drafted metadata, privacy policy) documented in `docs/v1-launch-checklist.md`, blocked only on needing a Mac + Xcode, which is available now. Nothing built/archived yet.
- **MPL Community Tour** — library kiosk events booked 9/26, 10/17, 11/21/26, all 1–3pm (see memory `project-mpl-community-tour`). Kiosk build was stable/event-tested as of 9/5 and 9/8, but Word-Tac-Toe (in either its old or redesigned form) has never been tested in the kiosk build on a physical tablet — don't assume it's ready for 9/26 without doing that first.
