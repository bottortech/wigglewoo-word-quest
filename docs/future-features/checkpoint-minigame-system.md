# Checkpoint Mini-Game System

**Status:** Future Enhancement — DO NOT BUILD until after the 9/26 MPL showing / v1.1
**Priority:** Medium-high (real player-facing repetition problem, but not urgent)
**Reason for deferral:** We're actively polishing and testing Word-Tac-Toe ahead of the 9/26 Community Tour event. Introducing progression/checkpoint changes right now — before that work is stable and tablet-tested — risks destabilizing something we're trying to ship, not improve.

---

## The problem

All 5 CVC quests (short-a, short-i, short-o, short-u, short-e) use the identical checkpoint structure: same word count, same checkpoint positions (word 4, and — once the near-term fix lands — word 12), same trophy cadence. A child who plays through multiple quests back to back experiences the same *shape* every time, even though the words and discovery-room environment differ.

Discussed and explicitly rejected as the fix: varying checkpoint *positions* per quest (e.g. quest 2 checks at word 3/10 instead of 4/12). That's mechanically trivial but wouldn't register as "variety" to a 4-8 year old — it'd just feel arbitrary.

## The actual goal

**Vary which mini-game the child encounters at a checkpoint, per quest** — not just which words. Today Cross-Match is the only mini-game wired into the checkpoint system at all (`CROSSMATCH_CHECKPOINTS` in `src/game/progression.ts`, currently applied identically to every quest). Word-Tac-Toe exists as a fully-built, tested screen but is only reachable as an *opt-in* Quest Map button — never as a required checkpoint.

The idea: build a proper per-quest checkpoint→mini-game mapping, so progressing through WiggleWoo across multiple quests means encountering *different activities*, not just different vocabulary. Long-term this should also make room for the other mini-games (`RhymePopGame`, `WordSortGame`, `SoundPopGame` — see `src/components/miniGames/`, currently parked/not live in the main flow) as they get brought back online.

## Proposed shape (not designed in detail yet — sketch only)

- Replace the single global `CROSSMATCH_CHECKPOINTS: number[]` with something like a per-quest map: `CHECKPOINT_MINIGAME_MAP: Record<questId, Record<checkpointWordIndex, MiniGameId>>`, where `MiniGameId` is `"cross-match" | "word-tac-toe" | ...` (eventually the parked mini-games too).
- `App.tsx`'s checkpoint-routing logic (currently `getPendingCrossMatch` + the `crossMatchCheckpoint` route) would need to branch on which mini-game the map assigns for that quest/checkpoint, rendering the right screen — `CrossMatchScreen` and `WordTacToeScreen` already exist and already follow a compatible self-contained-screen pattern, but their prop shapes differ (Cross-Match takes exactly the words being reviewed; Word-Tac-Toe takes the full quest word pool) and would need reconciling.
- Needs real design thought on *which* quest gets *which* mini-game at *which* checkpoint — not just an engineering task. Should probably also consider difficulty/pacing (Word-Tac-Toe takes longer per round than Cross-Match).

## Important dependent change — do this in the same pass

Once a quest can force Word-Tac-Toe as a required checkpoint, **the Quest Map's Word-Tac-Toe button and the discoverability nudge (added pre-9/26, see `docs/handoff.md`) must become conditional** — suppressed for any quest where the child will already encounter Word-Tac-Toe as a required checkpoint. Otherwise we'd be redundantly promoting it as an "optional side activity" on a quest where it's mandatory anyway, which is confusing rather than additive. This applies symmetrically if Cross-Match or any other mini-game ever gets its own opt-in entry point too.

## Explicitly out of scope for now

Do not start this until: (a) the 9/26 MPL Community Tour has happened, (b) Word-Tac-Toe (main + kiosk) is confirmed stable from that real-world test, and (c) there's been an actual design pass on the per-quest mapping — this doc is a placeholder for the idea and reasoning, not a build-ready spec.
