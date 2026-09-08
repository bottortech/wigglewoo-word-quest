# WiggleWoo's Word Quest — Agent Notes

Phonics game for K–1st graders. React 19 + Vite + Capacitor 7 (iOS). Landscape-locked iPad app. Client-only (localStorage); no backend wired in v1. App ID `com.bottortech.wigglewoo`.

Active branches:
- `main` — v1 launch candidate. Treat as release-ready; only land bug fixes / polish here.
- `schoolconomy` — partner integration (separate Vercel deploy). See memory `project-schoolconomy-partnership` for scope.

## Deferred features (do NOT build on `main` for v1.0)

| Feature | Spec | Status |
|---|---|---|
| **Word Dunk Arena** — basketball-themed mastery activity at checkpoints | [docs/future-features/word-dunk-arena.md](docs/future-features/word-dunk-arena.md) | Post-launch v1.1. Do not start until v1.0 has shipped and launch analytics are reviewed. |

If the user asks about a deferred feature, read its spec before answering. Do not begin implementation without explicit confirmation that v1.0 has shipped and the feature has been greenlit for the current sprint.

## Event kiosk mode (Saturday 9/5/26)

A shortened, build-flagged play flow for the user's live event (partnering with Vision Minds Entertainment / VME), running on 2 Galaxy tablets. Code is complete but **not yet build-tested or installed on device** — see [docs/kiosk-mode.md](docs/kiosk-mode.md) for what was built, the mechanism, a known pre-existing build blocker (`npm install` needed fresh per machine — native `node_modules` binaries don't travel on the portable drive this repo lives on), exact build steps, and the pre-event playtest checklist. Read that doc before touching kiosk-mode code or before running the tablet builds.
