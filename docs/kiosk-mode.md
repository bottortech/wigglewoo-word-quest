# Kiosk Mode — Saturday 9/5/26 Event

## Why

This is the user's own event (partnering with Vision Minds Entertainment / VME), first public demo of the game, running on 2 Galaxy tablets (Tab A 8.4" 2020, Tab A7 Lite). The full v1 game (16 words → phase-1 trophy → 8 more words → phase-2 trophy → discovery room → auto-chain to next quest) is far too long per child for a table with a line of kids waiting.

Kiosk mode shortens this to: **4 core potion games → one trophy room (the full/phase-2 one) → a randomly picked discovery room (2 facts) → auto-reset for the next child.**

## What was implemented (status: code complete, NOT yet build-tested on device)

All gated behind a build-time flag so the default/App-Store build (`main`, no kiosk env var) is completely unaffected — nothing about normal gameplay changed.

- **`src/game/kioskMode.ts`** (new) — `IS_KIOSK_BUILD` (reads `import.meta.env.VITE_KIOSK_MODE === "true"`) and `KIOSK_WORD_INDICES = [0, 1, 2, 15]`.
- **`.env.kiosk`** (new, gitignored like all `.env.*` — no secret in it, just `VITE_KIOSK_MODE=true`, so **it does not travel with the repo across machines / drives**. If it's missing when you pull this repo onto a new machine, recreate it: a file named `.env.kiosk` at the repo root containing exactly `VITE_KIOSK_MODE=true`.)
- **`package.json`** — added scripts:
  - `npm run dev:kiosk` → `vite --mode kiosk`
  - `npm run build:kiosk` → `tsc -b && vite build --mode kiosk`
  - (normal `npm run dev` / `npm run build` unchanged)
- **`src/App.tsx`** — kiosk branches added to:
  - `handlePlay` / `handleOnboardingComplete` — skip the map, jump straight into game 1 (`KIOSK_WORD_INDICES[0]`)
  - `handleNavigate`'s `"quest-map"` branch — chains directly into the next kiosk word instead of returning to the map
  - the mount `useEffect` — pre-seeds trophy tier to `"half"` on kiosk launch (see mechanism below)
  - `handleTrophyRoomExit` — picks a **random** discovery-room environment (from `ENVIRONMENTS` in `exploreData.ts`: valcano, castle-island, small-coastal-village, industrial-tech-city, glass-dome) instead of the one mapped to the quest played
  - `handleDiscoveryRoomComplete` / `handleDiscoveryRoomExit` — skip skin-unlock/quest-chaining; instead call `handleDemoReset(true)` to hand off to the next child
  - `handleDemoReset` — now takes an optional `keepOnboarding` param (kiosk auto-reset passes `true` so the onboarding intro doesn't replay for every child; the staff hidden 3-tap reset still passes `false`/default to clear it)

**The core mechanism:** the existing "quest complete → phase-2 trophy" trigger fires off whichever word index was actually rendered to the player (`triggers.ts` `getCelebrationTypeForWord`, checked against `quest.words.length - 1` = index 15), not off how many words came before it. So the kiosk's 4th game deliberately plays the quest's **real** last word (index 15) — this makes the existing trophy/discovery logic fire correctly with zero changes to `progression.ts`, `triggers.ts`, `TrophyRoomScreen.tsx`, or `ExploreScreen.tsx`. The only extra piece needed was pre-seeding the trophy tier to `"half"` (normally earned via the phase-1 room, which kiosk mode skips) so the phase-2 check passes.

## Bug fixed along the way (affects normal builds too, not just kiosk)

`ExploreScreen.tsx` sets a per-room flag `ww_room_complete_<envId>` that was **never cleared by any reset** (`handleDemoReset` or `handleDevResetAll`). Once a room had been completed once, revisiting it would never auto-fire the "2 facts viewed" completion again. Fixed by adding `ww_room_complete_<envId>` for all 5 rooms to both reset functions' key-removal lists. This matters a lot for kiosk mode since it randomly cycles through all 5 rooms — without this fix, kids would eventually get stuck in an already-completed room with no auto-exit.

## Verified so far

- `npx tsc -b` — compiles clean, no type errors.
- `npx eslint src/App.tsx` — identical 21 errors / 12 warnings before and after these changes (confirmed via `git stash`), all pre-existing, nothing new introduced.
- **NOT yet verified:** actually running the kiosk flow (`npm run dev:kiosk`), building it (`npm run build:kiosk`), or installing on either Galaxy tablet.

## Known blocker (pre-existing, unrelated to kiosk code)

`vite build` (both normal and kiosk mode) currently fails on this machine with:
```
Error: Cannot find module @rollup/rollup-darwin-x64
```
This is npm's known optional-dependency bug (npm/cli#4828) — `node_modules` has a platform/arch-specific native binary that doesn't match the machine it's being run on. Confirmed via `git stash` that a plain `npm run build` fails identically even without any of this session's changes — so it's not something introduced here.

**This will very likely need `npm install` run fresh on whichever machine actually builds for the tablets** (native binaries in `node_modules` don't travel between machines/architectures — the repo lives on a portable "Backup Plus" drive, so this is expected when switching computers). Fix:
```
npm install
```
(if that's not enough: delete `node_modules` and `package-lock.json` first, then `npm install` again)

## Build steps for the event (run on whichever machine does the tablet installs)

1. `npm install` (if not already fresh on this machine)
2. Confirm `.env.kiosk` exists at repo root with `VITE_KIOSK_MODE=true` (recreate if missing — see note above)
3. `npm run build:kiosk`
4. `npx cap sync android`
5. Open the Android project, build + install onto **both** Galaxy tablets (Tab A 8.4" 2020, Tab A7 Lite)

## Playtest checklist before Saturday

- [ ] Play through once: home → 4 games (confirm the 4th is genuinely the quest's last word, not a repeat) → **phase-2** trophy room (not phase-1) → discovery room → tap 2 facts → auto-reset lands back on home (~3.5s after 2nd fact)
- [ ] Repeat 3-4 times back to back: onboarding does NOT replay after the first time; discovery room environment differs across runs (random pick working); no leftover skins/ratings/analytics bleed into the next run
- [ ] Test physically on both Galaxy tablets — touch targets, audio, orientation lock
- [ ] Confirm a normal (non-kiosk) build still plays the full 16-node game unaffected
- [ ] Time one full kiosk playthrough end-to-end to sanity-check table throughput for the event

## Full plan reference

The original approved implementation plan (context, alternatives considered, exact rationale) is saved at `/Users/owner/.claude/plans/toasty-meandering-brook.md` on the Mac this was built on — not part of the repo, so it won't travel to the HP laptop. This doc is the portable summary.
