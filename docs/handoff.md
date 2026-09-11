# Session Handoff

Living doc — overwritten each time work pauses/switches machines, not a dated snapshot. Read this first when picking the project back up.

Last updated: 2026-09-11, on the HP (Windows) machine. Short session: reviewed and committed the prior Mac session's uncommitted docs/cleanup work, then worked through several open decisions with the user. Nothing code-level changed this session — this is mostly a decisions log for the Mac to pick up.

---

## ⚠️ Before you do anything else

`git status` first. Should be clean as of this write-up — everything below was committed (`011db21`).

`npm install` first on a new machine/drive-switch — the portable drive's `node_modules` native binaries (and the Windows `.bin` shims specifically — `tsc`, `vite`, etc.) don't survive an OS switch. Fix is just `npm install` again.

## Decisions made this session (2026-09-11) — read before touching V2 tiers or WTT/Cross-Match

These came out of a Q&A pass on the previous Mac session's `docs/future-features/v2-quest-tiers.md` scoping doc. Nothing here is implemented yet — just decided/clarified so the next session (likely back on the Mac) doesn't have to re-derive it:

1. **47-image checklist is final and in use** — user is sourcing/creating these images themselves (not delegating). List lives at `docs/future-features/v2-missing-word-images.md`, broken out by tier (Advanced Reading 32, Magic-E 13, CVVC 2). No changes needed to that doc.
2. **The "read" word (image vs. decode) — user's call, not blocking anything.** It's currently `mode: "decode"` in live CVVC data, deliberately excluded from the 47. Hard to depict as one clear picture since it's a verb, not an object. Leave it as decode unless/until the user finds or makes an image they're happy with, at which point it becomes a 48th image and flips to `mode: "image"`. No urgency, no code involved either way (it's a data-file field flip when/if it happens).
3. **WTT/Cross-Match decode-mode challenge-picker fix — direction chosen: case-matching, not fallback-to-missing-letter.** The v2-quest-tiers doc's original plan was "skip word-picture-match for decode-mode words, fall back to missing-letter." User's counter-proposal, confirmed as the better direction: give decode-mode words their own challenge type instead — match the word in one letter-case to itself in the other case (e.g., tap "CAT" to match lowercase "cat"), rather than just falling back to an existing challenge type. Still tests word/letter recognition without needing art. **Not implemented** — this is a code change (a new challenge-picker branch in `WordTacToeScreen.tsx`/`CrossMatchScreen.tsx` that checks word `mode` and picks case-matching over picture-matching for decode-mode words) that stays deferred until V2 tiers are actually being built, per the existing "don't start without an explicit go-ahead" guidance in CLAUDE.md. Worth updating `docs/future-features/v2-quest-tiers.md` section 2 to record this chosen direction before it's forgotten — **not yet done, still just captured here.**
4. **4-item Cross-Match round still unverified on-device — reason is structural, not an oversight.** Cross-Match only ever shows a 4-item round in the *main* (non-kiosk) build, at the checkpoint after word 4 — kiosk's own Cross-Match checkpoint always reviews exactly 3 words. Kiosk and main builds share the same Android `applicationId`, so installing main build to test this would overwrite whatever kiosk build is currently on the tablet. This is **not** a Mac-only task — it can be done from any machine with the tablet connected. Two ways to actually get it verified, still undecided:
   - Temporarily install main build on the current tablet, verify the 4-item layout, then reinstall kiosk build afterward to restore it (single-tablet, ~10 min round trip, safe as long as kiosk gets reinstalled before the next event).
   - Wait until there's a second tablet, so kiosk never has to come off the primary one.

## What shipped in the prior sessions (all committed)

- **`011db21`** (this session, HP) — committed the Mac session's uncommitted work: V2 quest tiers scoped, 47-image checklist, VO Pickup Round 3 prepared (Word-Tac-Toe's 4 lines + MilestoneCelebration's 2 lines — **docs are ready, just waiting on the voice actor to get back to the user**, nothing further needed from this end), and cleanup (deleted orphaned `trophy-transition.css`, `background_wigglewoo_game.png`, `cat.png`).
- **`9ee1750`** — shared `MilestoneCelebration` full-screen celebration system (4 tiers: activity/room/unlock/trophy), wired into Trophy Room entry, Discovery Room unlock, Cross-Match win, Word-Tac-Toe win/lose/tie. Also fixed a real stale-closure bug in `ExploreScreen`'s room-completion check found while wiring it.
- **`48be2bb`..`150cc36`** — kiosk retest + 3 bug fixes (onboarding-skip/trophy-room-skip bug, Comprehension Question answer shuffle, Cross-Match centering).

Full narrative detail on all of the above is in each commit's own message — kept short here since re-reading `git log` is just as easy.

## Also still open

- **Word-Tac-Toe's 4 VO lines + MilestoneCelebration's 2 VO lines** — scripts done and sent (see VO Pickup Round 3 docs), just waiting on the voice actor. No action needed until audio comes back — then it's just dropping files into `/assets/audio/`.
- **4-item Cross-Match round** — see decision #4 above, still unverified, still undecided which of the two paths to take.
- **WTT/Cross-Match decode-mode challenge picker** — direction decided (case-matching, see #3 above), not implemented, deferred to V2 tiers work.
- **"read" word image vs. decode** — user's call whenever, see #2 above.
- **V2 quest tiers overall** — do NOT flip `ww_placement_tiers`/`SHIPPED_TIERS` gates or re-wire `BlendingPowerUnlock` until the blockers in `docs/future-features/v2-quest-tiers.md` are resolved and there's an explicit go-ahead (per CLAUDE.md).
- **"Say it out loud" interstitial** in Potion Game — plain white card, no mic/voice validation exists, expected child action unclear. Flagged in the 9/9 audit, not touched.
- **Placement-test system** (`src/game/placementTest.ts`) — fully built, fully scored, completely unreachable in the current app. Needs a keep/revive/remove decision; not urgent.
- **Checkpoint mini-game system (full v1.1 version)** — per-quest configurable mapping, spec at `docs/future-features/checkpoint-minigame-system.md`. Deferred until after 9/26 and Word-Tac-Toe is confirmed stable (it now is). Don't start without an explicit go-ahead.
- **CRLF line-ending cleanup** — still nobody's asked for it, still noisy in `git status` on some machines.
- **iOS App Store submission** — real prior progress (paid Apple Developer account, drafted metadata, privacy policy) documented in `docs/v1-launch-checklist.md`, blocked only on needing a Mac + Xcode. Worth a status check next time the user is actually on the Mac, since that blocker is otherwise resolved.
- **MPL Community Tour** — library kiosk events booked 9/26, 10/17, 11/21/26, all 1–3pm (see memory `project-mpl-community-tour`). Kiosk mode was freshly retested end-to-end on a real tablet as of the prior session and is in good shape for 9/26.

## Recent commits (for context)

```
011db21 Scope V2 quest tiers, prep VO pickup round 3, clean up orphaned files
9ee1750 Add shared MilestoneCelebration system for meaningful milestones
150cc36 Cross-Match: vertically center WORDS/PICTURES item groups
e1bdb29 Comprehension Question: shuffle answers, redesign answer buttons
48be2bb Kiosk: skip the onboarding tutorial, always jump to character pick
```
