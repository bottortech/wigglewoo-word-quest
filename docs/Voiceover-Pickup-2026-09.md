# WiggleWoo's Word Quest — Voiceover Pickup Round 3

**Prepared for:** Voice Actor
**Date:** September 2026
**Game:** WiggleWoo's Word Quest (children's reading game, ages 4–8)
**Scope:** 6 lines — every remaining silent VO event in the current build, independently verified against the codebase (not just the two features that prompted this list)

---

## Context

Two feature additions since the last pickup round wired new audio events into the game, but no lines have been recorded for them yet — they currently fail silently (an established, intentional fallback in this codebase, not a bug). This is the complete list; nothing else is missing. Same voice, same energy as the April/May/June rounds.

---

## Section 1: Word-Tac-Toe (4)

The new phonics-gated tic-tac-toe mini-game. Reachable both as a voluntary Quest Map activity and as a required checkpoint partway through a normal quest.

| # | Line | File Name | When Played | Direction |
|---|------|-----------|-------------|-----------|
| 1 | "Let's play Word Tac Toe!" | `word-tac-toe-intro.wav` | Once, ~400ms after the child picks their piece (X or O) and the board first appears. | Inviting, a little playful — like kicking off a fun side activity, not a lesson. ~1.5–2s. |
| 2 | "You got three in a row! Great game!" | `word-tac-toe-win.wav` | The child's mark completes a line — the win celebration moment. | Big, genuine excitement — this is the payoff moment for the whole mini-game. ~2–3s. |
| 3 | "So close! Want to play again?" | `word-tac-toe-lose.wav` | WiggleWoo (the CPU) completes a line first. | **Important: gentle, warm, zero-penalty tone.** This is a kids' app — losing to WiggleWoo should feel like a friendly nudge to try again, never a downer. Same encouraging register as the existing "wrong answer" retry lines. ~2s. |
| 4 | "It's a tie — great game!" | `word-tac-toe-tie.wav` | Board fills completely with no winner. | Upbeat, same energy as the win line but slightly less peak — still a good outcome, not a letdown. ~2s. |

## Section 2: Milestone Celebrations (2)

A new full-screen celebration overlay system with on-screen text that varies (3 random headline variants per tier, so it never looks identical twice). **These 2 lines each play under whichever headline variant happens to show** — so the line needs to work generically, not reference one specific headline word-for-word.

| # | Line | File Name | When Played | On-screen text it plays under (any of 3, random) | Direction |
|---|------|-----------|-------------|---|-----------|
| 5 | "You earned a trophy! Amazing work!" | `celebrate-milestone-trophy.m4a` | Both the halfway (phase 1) and full (phase 2) trophy-earning moments — the single biggest celebration in the game. | "Trophy Earned!" / "You Earned It!" / "Incredible Work!" | The peak celebration line in the whole app — biggest energy allowed, genuine pride. Should feel great alongside any of the three headlines above without sounding locked to one. ~2–3s. |
| 6 | "A brand new room is ready to explore!" | `celebrate-milestone-unlock.m4a` | A new Discovery Room becomes available (2nd biggest celebration, just under trophy). | "New Discovery Room!" / "Something New Awaits!" / "Unlocked!" | Excited and inviting — building anticipation for exploring, not just "good job." ~2–3s. |

---

## Delivery

- **File type:** WAV (44.1kHz, 16-bit or higher) — same as every prior round, regardless of which folder each line ends up in on the production side.
- **Naming:** Use the `File Name` column exactly (note: 4 files end in `.wav`, 2 end in `.m4a` in the column above — deliver all 6 as WAV regardless; the `.m4a` ones get converted during production the same way past rounds have been).
- **Trim:** ~100ms head/tail silence.
- **Normalize:** Peak to -1dB, matching prior rounds.
- **Wording:** As with every past round, the line text above is a starting point, not locked in — the file name is what actually matters for wiring it up.

---

*End of pickup script — Round 3.*
