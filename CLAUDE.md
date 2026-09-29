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
| **V2 quest tiers** — unlocking CVCC/Magic-E/CVVC/Advanced Reading (data already exists, hidden behind two hardcoded gates). Real blockers: missing word images (Magic-E 13, CVVC 2, Advanced Reading 32 — CVCC is now 0, see below), a Word-Tac-Toe/Cross-Match challenge-picker bug for decode-mode words (fixed for CVCC, see below), plus a captured idea for tiered Discovery Room fact language | [docs/future-features/v2-quest-tiers.md](docs/future-features/v2-quest-tiers.md) | **CVCC is opened, but event-build-only**: `IS_EVENT_BUILD`-gated in both `SHIPPED_TIERS` (QuestMapScreen.tsx) and `SHIPPED_PLACEMENT_TIERS` (App.tsx), with the decode-mode picker bug fixed, for the Oct 10 ED Games Expo — explicit go-ahead given for that build only, not a general v1.1 ship. The main app stays CVC-only. Magic-E/CVVC/Advanced Reading remain fully blocked (real missing images) in every build. Do not touch the main app's gates or re-wire `BlendingPowerUnlock` without a separate explicit go-ahead. |
| **Word-Tac-Toe versus in the main app** — two tablets/phones playing head-to-head with no laptop, one device hosting itself (vs. the event build's laptop-hosted relay). Later, separately: real cloud-hosted multiplayer for remote (not-same-Wi-Fi) play | [docs/future-features/main-app-versus-mode.md](docs/future-features/main-app-versus-mode.md) | Real v1.1+ idea, not urgent. `game.mjs` (pure rules engine) is directly reusable; the gap is on-device hosting (a Capacitor plugin, not a reuse of `server.mjs`) plus real pairing/discovery UX. Do not start without an explicit go-ahead. |

If the user asks about a deferred feature, read its spec before answering. Do not begin implementation without explicit confirmation that v1.0 has shipped and the feature has been greenlit for the current sprint.

## Event kiosk mode / MPL Community Tour

A shortened, build-flagged play flow (`VITE_KIOSK_MODE`) originally built for the 9/5/26 launch event, now an ongoing library kiosk tour with more dates booked (9/26, 10/17, 11/21 — see memory `project-mpl-community-tour`). See [docs/kiosk-mode.md](docs/kiosk-mode.md) for the build mechanism and steps, and **`docs/handoff.md`** for current state — it's a living doc, overwritten each session/machine switch, and is the actual source of truth for what's shipped, what's uncommitted, and what's next. Read `docs/handoff.md` first before touching kiosk-mode or Word-Tac-Toe code.
