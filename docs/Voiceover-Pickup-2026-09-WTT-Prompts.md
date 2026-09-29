# WiggleWoo's Word Quest — Voiceover Pickup (Word-Tac-Toe Challenge Prompts)

**Prepared for:** Phrase Narrator (same voice as the existing short prompt/encouragement clips already in the game, e.g. "Drag a letter," "Let's build a word!")
**Scope:** 2 phrases
**Status:** Not urgent — text-only fallback is fine for now. Flagged during Oct 10 ED Games Expo prep; no code currently plays these, so nothing breaks by leaving them unrecorded.

---

## Context

Word-Tac-Toe shows one of two on-screen prompts depending on the challenge type, but neither is currently spoken — the game only shows the text. Noticed while confirming CVCC word-pronunciation audio coverage ahead of the Expo. Both prompts already exist verbatim in the UI (`WordTacToeScreen.tsx` and `WordTacToeVersusScreen.tsx`), used in both single-player and the two-tablet versus mode.

## Phrases needed

| # | On-screen text | Suggested file name | Shown when |
|---|---|---|---|
| 1 | "Choose the missing letter!" | `choose-the-missing-letter.m4a` | The challenge is a missing-letter (fill-in-the-blank) type |
| 2 | "Which word matches the picture?" | `which-word-matches-the-picture.m4a` | The challenge is a word-picture-match type |

## Delivery

- **Voice/style:** Match the existing short prompt-phrase clips already in the game (`/assets/audio/phrases/`, e.g. `drag-a-letter.m4a`, `lets-build-a-word.m4a`) — upbeat, kid-facing instruction, not the single-word pronunciation voice and not the WiggleWoo character voice.
- **File type:** Match the existing phrase-audio format (`.m4a`).
- **Naming:** Use the file names above exactly.
- **Timing:** No rush — batch in whenever convenient, after the Oct 10 Expo. Not wired into the code yet; the game reads fine with these silent (text-only).

## Once recorded

The code isn't wired up yet — someone needs to add a `playChooseLetterPhrase()` / `playWhichWordPhrase()` (or similar) pair in `src/audio/SoundEffects.ts`, following the exact pattern of `playTapCardPhrase()`, and call them alongside the existing `playWordSound(...)` calls in both `WordTacToeScreen.tsx`'s `startChallenge` and `WordTacToeVersusScreen.tsx`'s `handleCellTap`/`onState`. Small, low-risk addition once the files exist.

*End of pickup script — Word-Tac-Toe Prompts.*
