# Word-Tac-Toe Versus in the Main App (No Laptop)

**Status:** Future Enhancement — DO NOT BUILD FOR v1.0
**Priority:** Real v1.1+ idea, not urgent — surfaced while prepping the Oct 10 ED Games Expo two-tablet demo
**Reason for deferral:** v1.0 is a launch candidate; the event build's versus mode (laptop-hosted relay) is proven and freezes for the Expo, but shipping versus to real App Store families needs a genuinely different hosting model, not a reuse of what already exists.

---

## Goal

Two family tablets/phones play Word-Tac-Toe head-to-head, **with no laptop or third device involved** — one tablet hosts the game itself, the other joins over the same Wi-Fi. Long-term, separately, a real cloud-hosted multiplayer service for remote (not-same-Wi-Fi) play — see "Later, separate goal" below.

---

## What already exists and is directly reusable

The event build (`tools/event-relay/`, `src/versus/`) has a fully proven versus system — 59 automated tests, extensively live-verified on real hardware:

- **`game.mjs`** — the authoritative rules engine (seating, turns, challenges, win/tie detection, scores) is a **pure state machine with no I/O** ("no sockets, no timers, no I/O" per its own top comment). This is the one piece that's genuinely portable as-is into whatever hosts the game on-device — no rewrite needed, just a new caller.
- **`src/versus/*`** (tablet-side client: `RelayClient`, wire protocol, address discovery) and **`WordTacToeVersusScreen.tsx`** — the tablet UI and networking client. Reusable with minimal change; it already just speaks JSON-over-WebSocket to whatever's on the other end.
- **The wire protocol itself** (documented at the top of `game.mjs`) — no reason to redesign it.

## The actual gap

**`server.mjs`** — the piece that currently turns `game.mjs` into something reachable over the network — is a Node.js HTTP/WebSocket server, built to run via `node server.mjs` on a laptop. That's fine for a presenter's laptop at an event; it is not something a real family has lying around, and "install Node.js and run a script from a terminal" is not a real consumer flow.

For one tablet to host instead of a laptop, that hosting capability needs to exist **inside the Capacitor app itself** — a local WebSocket/HTTP server running on-device. That's real, new platform work, not a reuse of `server.mjs`:

1. **A Capacitor plugin (or equivalent) that can run a local server on-device.** Needs research: what's actually reliable on Android (foreground/background service lifecycle, does the OS kill it, battery impact) and, if this ships to iOS too (the app already targets Capacitor 7 iOS per the main project notes), iOS's local-network-access permission prompt needs to be framed so it doesn't read as suspicious to a parent.
2. **Pairing/discovery**, so the joining tablet finds the host without a presenter typing an IP into a hidden menu. The event build's EventMenu ("Game address" field + "Find the game" probe/network scan) is presenter-appropriate but not a real end-user flow. Options to evaluate: a short manual code/PIN entered on the joining device (simplest MVP, no discovery infra needed), local network discovery (mDNS/Bonjour-style), or a QR code shown on the host tablet.
3. **A real "Play with a friend" entry point in the main app UI** — not the hidden triple-tap presenter corner. Needs actual UX design (how do two kids/parents even find this, what does "hosting" vs "joining" look like to them).
4. **Rewriting the small amount of state-persistence/logging `server.mjs` does today** (writes `state.json`, appends a log file) for whatever the on-device host's actual needs are — probably much simpler than the event version, since there's no "presenter restarts the relay mid-event" scenario to recover from.

## Recommended way to prototype, when this is picked up

- Reuse `game.mjs` untouched as the rules engine.
- Start with the simplest possible pairing (manual code entry) rather than solving discovery first — matches how the event build itself started (Phase 0 proved the network layer before building UI on top of it).
- Spike the on-device local server piece first and validate it survives realistic conditions (screen off, backgrounded, real Android OEM battery-optimization behavior) before building any UI on top of it — this is the one part with real unknowns.

## Later, separate goal: real cloud-hosted multiplayer

Distinct from the above, and bigger: play between two devices **not** on the same Wi-Fi (matchmaking, accounts, real hosting infrastructure and its ongoing cost). This is the "eventual full online multiplayer system" already explicitly deferred when the Expo demo was first scoped — captured here only so the two ideas (same-Wi-Fi tablet-to-tablet vs. real remote multiplayer) aren't conflated. They're different projects with different starting points; same-Wi-Fi tablet-hosting is the nearer, smaller one.

---

## Explicitly out of scope for now

Do not start this — including the on-device server spike — without an explicit go-ahead. This is a placeholder for the idea and its real technical shape, not a build-ready spec.
