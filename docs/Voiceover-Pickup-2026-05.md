# WiggleWoo's Word Quest — Voiceover Pickup Session

**Prepared for:** Voice Actor
**Date:** May 2026
**Game:** WiggleWoo's Word Quest (children's reading game, ages 4–8)
**Scope:** 10 short pickup lines

---

## Context

The full April 2026 script is recorded and integrated — words, phrases, mini-games, placement test, onboarding, celebrations, trophy room, discovery rooms, decode mode are all in the build and playing as expected.

Since then the game has grown a few new beats:

- A second-tier "full trophy" reveal once the kid clears node 16
- A quick-review drag-and-match game between quests
- A soft send-off as the discovery rooms auto-exit
- A first-visit letter-tracing moment in every Discovery Room
- A small idle-nudge layer (Play Now title and the Quest Map) so the game gently prompts kids who walk away or pause

That's the full pickup — 10 short lines grouped in three sections below. Once these land, every wired VO event in the game has audio.

---

## Voice Direction

Same direction as the April session — keep tone, energy, and pace consistent so the new lines blend seamlessly with the existing recordings.

- **Tone:** Warm, encouraging, playful — friendly teacher / older sibling
- **Pace:** Slightly slower than conversation
- **Energy:** Upbeat but not over-the-top
- **Length target:** ~1.5–2s for prompts, ~2–3s for celebrations
- **Format:** WAV, 44.1kHz, 16-bit minimum

---

## Section 1: New Game Beats (4)

These four cover new moments in the core game loop.

| # | Line | File Name | When Played | Direction |
|---|------|-----------|-------------|-----------|
| 1 | "One more challenge — let's earn the full trophy!" | `trophy-phase2-intro.wav` | Trophy Room entry on phase 2 (after the kid clears node 16). Plays ~500ms after entry. | Warmer / a step more elevated than the phase-1 trophy intro — this is the bigger reward. ~1.5–2s. |
| 2 | "Nice exploring! Let's keep going." | `discover-exit-bridge.wav` | Discovery room is auto-exiting; plays ~2.2s after the room-complete VO as a soft send-off into the map. | Gentle, satisfied — the kid just finished, this is the door closing behind them. ~1.5s. |
| 3 | "Drag the word to its picture!" | `cross-match-intro.wav` | Quick Review (cross-match) screen opens — kid sees four words and four pictures and needs to draw lines to match them. Plays ~400ms after mount. | Inviting instruction, like starting a fun game. Same energy as "Let's build a word!" ~1.5s. |
| 4 | "Great matching!" | `cross-match-complete.wav` | All four matches locked in — celebration moment. | Proud and impressed celebration. Could also be a take like "You got 'em all!" or "Nice matching!" — pick the one that lands warmest. ~1.5–2s. |

---

## Section 2: Trace + Title Screen (2)

Two short instructional/welcome lines that don't exist yet.

| # | Line | File Name | When Played | Direction |
|---|------|-----------|-------------|-----------|
| 5 | "Trace the letter with your finger!" | `trace-prompt.wav` | First-visit letter-trace overlay opens in any Discovery Room (different letter each day, but the prompt is generic). Plays ~400ms after the trace appears. | Friendly instruction, like inviting them into the activity. Same energy as "Drag a letter!" ~1.5s. |
| 6 | "Tap Play Now when you're ready!" | `play-now-nudge.wav` | Plays once on the title screen if the kid sits there for ~8s without tapping Play. Stays silent if they tap right away. | Soft nudge, no urgency — a gentle "I'm here whenever you are." ~1.5–2s. |

---

## Section 3: Idle Pool — Quest Map (4)

Plays one of these at random when the kid sits on the quest map for ~20s without tapping anything. Pool of 4 so it varies and never feels canned. Re-arms after each idle fire so it can speak again later in the same session.

| # | Line | File Name | Direction |
|---|------|-----------|-----------|
| 7 | "Tap a gear when you're ready!" | `idle-tap-gear.wav` | Encouraging, light. ~1.5s. |
| 8 | "Pick up where you left off!" | `idle-pickup.wav` | Warm, like reminding a friend. ~1.5s. |
| 9 | "Ready for another word?" | `idle-another-word.wav` | Curious, inviting. ~1.5s. |
| 10 | "Let's keep reading!" | `idle-keep-reading.wav` | Upbeat, momentum-y. ~1.5s. |

---

## Delivery

- **File type:** WAV (44.1kHz, 16-bit or higher) — we'll convert to .m4a in production
- **Naming:** Use the `File Name` column above exactly — these slugs are wired into the code
- **Trim:** ~100ms head/tail silence
- **Normalize:** Peak to -1dB to match the April session

If any line wants to be reworded for flow or character, the *file name is what matters* — the line itself is a starting point, not locked in.

---

*End of pickup script.*
