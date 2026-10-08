# Session Handoff

Living doc — overwritten each time work pauses/switches machines, not a dated snapshot. Read this first when picking the project back up.

Last updated: 2026-10-08, on the HP (Windows) machine. **ED Games Expo stage presentation is Oct 10, 2026 — hard deadline, 2 days out.** Long multi-session push since 9/11 built out the full event-build feature set (CVCC, all vowel tracks/Discovery Rooms open, Word-Tac-Toe + Play-with-a-Friend on all three builds), redesigned the versus win screen, fixed a wrong-answer VO mismatch, then (this session) reversed that same wrong-answer rule back to retry+hint after explicit new instructions — see "Versus wrong-answer rule" below, this is the freshest and most important thing to read before touching Word-Tac-Toe versus code.

---

## ⚠️ Before you do anything else

`git status` first. As of this write-up, working tree has uncommitted changes to the versus retry/hint reversal (see below) — not yet committed, tests pass, typecheck clean, not yet live-verified on real tablets. `tools/phase0-spike/` is an untracked scratch dir from earlier Phase-0 networking work, not part of the shipped app.

`npm install` first on a new machine/drive-switch — the portable drive's `node_modules` native binaries (and the Windows `.bin` shims specifically — `tsc`, `vite`, etc.) don't survive an OS switch. Fix is just `npm install` again.

## Versus wrong-answer rule — reversed back to retry+hint (2026-10-08, uncommitted)

The `070f1b3` commit (one wrong answer ends the turn, no retry) has been **fully reverted** per explicit user instruction: wrong answers must never end the turn — unlimited retries, with a hint (one wrong option eliminated) from the 2nd miss on, exactly matching single-player. Turn only advances on a correct answer.

Touched, all uncommitted as of this write-up:
- `tools/event-relay/game.mjs` — `WRONG_MS`/`resolveWrong()` removed; `HINT_AFTER_WRONG = 2` restored; `answer()` rewritten to retry+hint-elimination.
- `tools/event-relay/server.mjs` — `WRONG_MS` import/timer removed; no follow-up timer needed on a wrong answer.
- `src/versus/protocol.ts` — `ServerChallenge.status` back to `"open" | "correct"` (no `"wrong"`).
- `src/screens/WordTacToeVersusScreen.tsx` — wrong-answer VO back to `wrong-gentle`; removed the `status === "wrong"` panel branch (challenge stays rendered via the existing retry/hint-aware branch).
- `src/styles/word-tac-toe.css` — removed the now-orphaned `.wtt__panel-feedback--wrong` rule.
- `tools/event-relay/test/{game,relay,client}.test.mjs` — wrong-answer tests rewritten to assert retry+hint behavior instead of turn-ending. **All 60 tests pass**, `npx tsc -b` clean, encoding-checked.

**Not yet done:** a live two-tablet (or tablet + fake-`Client`) end-to-end check of the restored retry/hint behavior, and the commit itself. The win screen, winning-line display, and Play Again were not touched and should be unaffected by construction — worth a quick live glance anyway since the user explicitly asked to preserve them. A background relay process from earlier in this session (if still running) is serving **stale** pre-reversal code — restart it after these changes land before testing live.

## Decisions made this session (2026-09-11) — read before touching V2 tiers or WTT/Cross-Match

These came out of a Q&A pass on the previous Mac session's `docs/future-features/v2-quest-tiers.md` scoping doc. Nothing here is implemented yet — just decided/clarified so the next session (likely back on the Mac) doesn't have to re-derive it:

1. **47-image checklist is final and in use** — user is sourcing/creating these images themselves (not delegating). List lives at `docs/future-features/v2-missing-word-images.md`, broken out by tier (Advanced Reading 32, Magic-E 13, CVVC 2). No changes needed to that doc.
2. **The "read" word (image vs. decode) — user's call, not blocking anything.** It's currently `mode: "decode"` in live CVVC data, deliberately excluded from the 47. Hard to depict as one clear picture since it's a verb, not an object. Leave it as decode unless/until the user finds or makes an image they're happy with, at which point it becomes a 48th image and flips to `mode: "image"`. No urgency, no code involved either way (it's a data-file field flip when/if it happens).
3. **WTT/Cross-Match decode-mode challenge-picker fix — direction chosen: case-matching, not fallback-to-missing-letter.** The v2-quest-tiers doc's original plan was "skip word-picture-match for decode-mode words, fall back to missing-letter." User's counter-proposal, confirmed as the better direction: give decode-mode words their own challenge type instead — match the word in one letter-case to itself in the other case (e.g., tap "CAT" to match lowercase "cat"), rather than just falling back to an existing challenge type. Still tests word/letter recognition without needing art. **Not implemented** — this is a code change (a new challenge-picker branch in `WordTacToeScreen.tsx`/`CrossMatchScreen.tsx` that checks word `mode` and picks case-matching over picture-matching for decode-mode words) that stays deferred until V2 tiers are actually being built, per the existing "don't start without an explicit go-ahead" guidance in CLAUDE.md. Worth updating `docs/future-features/v2-quest-tiers.md` section 2 to record this chosen direction before it's forgotten — **not yet done, still just captured here.**
4. **4-item Cross-Match round still unverified on-device — reason is structural, not an oversight.** Cross-Match only ever shows a 4-item round in the *main* (non-kiosk) build, at the checkpoint after word 4 — kiosk's own Cross-Match checkpoint always reviews exactly 3 words. Kiosk and main builds share the same Android `applicationId`, so installing main build to test this would overwrite whatever kiosk build is currently on the tablet. This is **not** a Mac-only task — it can be done from any machine with the tablet connected. Two ways to actually get it verified, still undecided:
   - Temporarily install main build on the current tablet, verify the 4-item layout, then reinstall kiosk build afterward to restore it (single-tablet, ~10 min round trip, safe as long as kiosk gets reinstalled before the next event).
   - Wait until there's a second tablet, so kiosk never has to come off the primary one.

## What shipped since 9/11 (all committed except the reversal above)

Building toward the Oct 10 ED Games Expo stage presentation:

- **`34e4ef0`..`d11da4d`** — Guided Demo mode for presentations, Phase 3 quick-stage-demo preset.
- **`16340bc`, `c786c27`, `f7e20ca`** — event build + two-tablet Word-Tac-Toe versus (relay, big-screen spectator, versus screen) — Phases 1–2.
- **`eddbc29`..`9a5ddc5`** — stage demo redesigned as a full map-centric highlight tour, several fixes, then reordered with new group highlights (16-gear-node overview, For-Parents+Badges together, all 5 Discovery Rooms together) and an off-screen-callout bug fix.
- **`de0f70e`, `ea7a069`** — CVCC ("Blending Power") opened for the **Oct 10 event build only** (`IS_EVENT_BUILD`-gated, main app stays CVC-only), decode-mode picture-challenge bug fixed; VO pickup doc added for 2 unrecorded WTT prompts (not urgent, no code depends on them).
- **`070f1b3`** — (superseded, see reversal above) briefly made one wrong answer end the versus turn; this is now fully reverted.
- **`e16ae7d`** — captured "main-app versus, one tablet hosts itself (no laptop)" + future cloud multiplayer as deferred v1.1+ ideas in `docs/future-features/main-app-versus-mode.md` — not started.
- **`5dcf32e`, `6694e7b`, `6ec4364`, `ca34a50`, `72e1dc7`** — the event-day feature push: CVCC shipped in all 3 builds (per-build unlock rules); Word-Tac-Toe + new "Play with a Friend" entry point live on all 3 builds; WTT word pool broadened to all words with audio (event build); all 5 vowel tracks + all 5 Discovery Rooms unlocked and freely clickable, including removing the daily fact-view cap — **event build only**, main app's real unlock gates untouched.
- **`2c40d3c`** — versus win screen redesigned into the side panel (board + winning line stay visible, mascot/name/"Three in a row!"/Play Again inside the same panel as every other state) — **explicitly protected, do not regress.**
- **`29fb865`** — (superseded, see reversal above) fixed the wrong-answer VO line to match one-wrong-ends-turn; now reverted back to the original line since that premise is gone.
- **Expo Stage Script** — Byron's dictated 15-stop presenter script, validated against the actual `STAGE_DEMO_STEPS` tour order (one real mismatch flagged and resolved: Trophy Room step is preview-only, narrate it without opening the room). Delivered as a published Artifact page and as `Expo-Stage-Script.pdf` on the user's OneDrive Desktop (`C:\Users\crjgr\OneDrive\Desktop\` — **not** the plain `C:\Users\crjgr\Desktop\`, which isn't what Explorer shows on this machine) for transfer to physical note cards. No code changed for this deliverable.

Full narrative detail on all of the above is in each commit's own message.

## Also still open

- **Finish and commit the versus wrong-answer reversal** — see section above. Live two-tablet verification + commit still pending.
- **HDMI-out / screen-extender setup for the stage laptop** — asked about during this segment ("did you get one?"), not yet confirmed answered.
- **Tablet 2 battery/availability** — died mid-session during event-feature testing; not re-checked since. Confirm charged before the Oct 10 live run-through.
- **Word-Tac-Toe's 4 VO lines + MilestoneCelebration's 2 VO lines** — scripts done and sent (see VO Pickup Round 3 docs), just waiting on the voice actor. No action needed until audio comes back.
- **4-item Cross-Match round** — still unverified, still undecided which of the two paths (decision #4 above) to take. Not urgent before Oct 10.
- **WTT/Cross-Match decode-mode challenge picker** — direction decided (case-matching, see #3 above), not implemented, deferred to V2 tiers work (CVCC's own picker bug is already fixed, see `de0f70e`).
- **V2 quest tiers overall (Magic-E/CVVC/Advanced Reading)** — still fully blocked by missing images in every build; do not touch the main app's gates or `BlendingPowerUnlock` without a separate explicit go-ahead (CVCC's event-build-only opening is not a general go-ahead).
- **Placement-test system** (`src/game/placementTest.ts`) — fully built, unreachable, needs a keep/revive/remove decision; not urgent.
- **Checkpoint mini-game system (full v1.1 version)** — deferred until after the 9/26 showing and Word-Tac-Toe confirmed stable (it is). Don't start without an explicit go-ahead.
- **iOS App Store submission** — blocked only on a Mac + Xcode; worth a status check next time the user is on the Mac.
- **MPL Community Tour** — library kiosk events: 9/26 (done), 10/17, 11/21/26, all 1–3pm (see memory `project-mpl-community-tour`).

## Recent commits (for context)

```
29fb865 Versus: fix wrong-answer voice-over promising a retry that never comes
2c40d3c Versus win screen: move into the side panel, keep the board visible
72e1dc7 Event build: Discovery Rooms never force-complete or block on a daily cap
ca34a50 Event build: unlock all 5 vowel tracks and all 5 Discovery Rooms
6ec4364 Event build: open Word-Tac-Toe immediately, broaden its word pool
6694e7b Word-Tac-Toe versus in all three builds, with per-build entry points
5dcf32e Ship CVCC in all three builds, with per-build unlock rules
```
