# WiggleWoo's Word Quest — Agent Notes

Phonics game for K–1st graders. React 19 + Vite + Capacitor 7 (iOS). Landscape-locked iPad app. Client-only (localStorage); no backend wired in v1. App ID `com.bottortech.wigglewoo`.

Active branches:
- `main` — v1 launch candidate. Treat as release-ready; only land bug fixes / polish here.
- `schoolconomy` — partner integration (separate Vercel deploy). See memory `project-schoolconomy-partnership` for scope.

## Deferred features (do NOT build on `main` for v1.0)

| Feature | Spec | Status |
|---|---|---|
| **Word Dunk Arena** — basketball-themed mastery activity at checkpoints | [docs/future-features/word-dunk-arena.md](docs/future-features/word-dunk-arena.md) | Post-launch v1.1. Do not start until v1.0 has shipped and launch analytics are reviewed. |
| **Checkpoint mini-game system** — per-quest mapping so different quests use different checkpoint interludes (Cross-Match, Word-Tac-Toe, eventually the parked mini-games) instead of one global checkpoint mini-game for every quest | [docs/future-features/checkpoint-minigame-system.md](docs/future-features/checkpoint-minigame-system.md) | Deferred until after the 9/26 MPL Community Tour showing, once Word-Tac-Toe is confirmed stable. Do not start without an explicit go-ahead. |
| **V2 quest tiers** — unlocking CVCC/Magic-E/CVVC/Advanced Reading (data already exists, hidden behind two hardcoded gates). Real blockers: 47 missing word images (corrected — an earlier count of 148 was wrong, inflated by dead unused word-bank data), a Word-Tac-Toe/Cross-Match challenge-picker bug for decode-mode words, plus a captured idea for tiered Discovery Room fact language | [docs/future-features/v2-quest-tiers.md](docs/future-features/v2-quest-tiers.md) | Art-production project first, not a code task. Do NOT flip the `ww_placement_tiers`/`SHIPPED_TIERS` gates or re-wire `BlendingPowerUnlock` until the doc's blockers are resolved and there's an explicit go-ahead. |

If the user asks about a deferred feature, read its spec before answering. Do not begin implementation without explicit confirmation that v1.0 has shipped and the feature has been greenlit for the current sprint.

## Event kiosk mode / MPL Community Tour

A shortened, build-flagged play flow (`VITE_KIOSK_MODE`) originally built for the 9/5/26 launch event, now an ongoing library kiosk tour with more dates booked (9/26, 10/17, 11/21 — see memory `project-mpl-community-tour`). See [docs/kiosk-mode.md](docs/kiosk-mode.md) for the build mechanism and steps, and **`docs/handoff.md`** for current state — it's a living doc, overwritten each session/machine switch, and is the actual source of truth for what's shipped, what's uncommitted, and what's next. Read `docs/handoff.md` first before touching kiosk-mode or Word-Tac-Toe code.
