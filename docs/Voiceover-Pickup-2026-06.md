# WiggleWoo's Word Quest — Voiceover Pickup Round 2

**Prepared for:** Voice Actor
**Date:** June 2026
**Game:** WiggleWoo's Word Quest (children's reading game, ages 4–8)
**Scope:** 6 short pickup lines

---

## Context

Thank you for the May 2026 pickup batch — `trophy-phase2-intro`, `discover-exit-bridge`, `cross-match-intro`, and `cross-match-complete` all landed great and are integrated.

This round is the **final 6 lines** from the May pickup script that we haven't received yet. Same voice, same energy — once these arrive, every wired VO event in the v1.0 game has audio and we're clear to ship.

---

## Voice Direction

Same direction as the April and May sessions — keep tone, energy, and pace consistent so these blend seamlessly with the rest of the show.

- **Tone:** Warm, encouraging, playful — friendly teacher / older sibling
- **Pace:** Slightly slower than conversation
- **Energy:** Upbeat but not over-the-top
- **Length target:** ~1.5–2s for prompts, ~2–3s for celebrations
- **Format:** WAV, 44.1kHz, 16-bit minimum

---

## Section 1: Trace + Title Screen (2)

| # | Line | File Name | When Played | Direction |
|---|------|-----------|-------------|-----------|
| 1 | "Trace the letter with your finger!" | `trace-prompt.wav` | First-visit letter-trace overlay opens in any Discovery Room (different letter each day, but the prompt is generic). Plays ~400ms after the trace appears. | Friendly instruction, like inviting them into the activity. Same energy as "Drag a letter!" ~1.5s. |
| 2 | "Tap Play Now when you're ready!" | `play-now-nudge.wav` | Plays once on the title screen if the kid sits there for ~8s without tapping Play. Stays silent if they tap right away. | Soft nudge, no urgency — a gentle "I'm here whenever you are." ~1.5–2s. |

---

## Section 2: Idle Pool — Quest Map (4)

Plays one of these at random when the kid sits on the quest map for ~20s without tapping anything. Pool of 4 so it varies and never feels canned. Re-arms after each idle fire so it can speak again later in the same session.

| # | Line | File Name | Direction |
|---|------|-----------|-----------|
| 3 | "Tap a gear when you're ready!" | `idle-tap-gear.wav` | Encouraging, light. ~1.5s. |
| 4 | "Pick up where you left off!" | `idle-pickup.wav` | Warm, like reminding a friend. ~1.5s. |
| 5 | "Ready for another word?" | `idle-another-word.wav` | Curious, inviting. ~1.5s. |
| 6 | "Let's keep reading!" | `idle-keep-reading.wav` | Upbeat, momentum-y. ~1.5s. |

---

## Delivery

- **File type:** WAV (44.1kHz, 16-bit or higher) — we'll convert to .m4a in production
- **Naming:** Use the `File Name` column above exactly — these slugs are wired into the code
- **Trim:** ~100ms head/tail silence
- **Normalize:** Peak to -1dB to match the April and May sessions

If any line wants to be reworded for flow or character, the *file name is what matters* — the line itself is a starting point, not locked in.

---

*End of pickup script — Round 2.*
