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
