# WiggleWoo's Word Quest — Voiceover Pickup Round 5 (Remaining Silent Spots)

**Prepared for:** Phrase Narrator (same voice as the existing short prompt/encouragement clips already in the game, e.g. "Drag a letter," "Let's build a word!")
**Status:** 8 of the original 8 lines delivered and wired into the code (commit `6a54193`). One new line added below, not yet recorded.

**Hand the new line over together with `Voiceover-Pickup-2026-09-Comprehension.md` ("Round 4")**, which is still outstanding — a separate 80-line doc for a different narrator (Content Narrator, matching the Discovery Room fact-narration voice), covering the comprehension questions that follow each Discovery Room fact.

---

## ✅ Delivered and wired (no action needed)

| # | Line | File | Shown when |
|---|---|---|---|
| 1 | "Let's make CAT! Tap the C potion." | `onboarding-tap-c.m4a` | First-time tutorial, step 1 |
| 2 | "Now tap the A potion." | `onboarding-tap-a.m4a` | First-time tutorial, step 2 |
| 3 | "Last one — tap the T potion!" | `onboarding-tap-t.m4a` | First-time tutorial, step 3 |
| 4 | "Choose your piece!" | `wtt-choose-piece.m4a` | Word-Tac-Toe's piece-select screen |
| 5 | "Great exploring! You found some facts today — come back tomorrow for more!" | `daily-cap-reached.m4a` | Discovery Room daily fact cap reached |
| 6 | "Trace the letter with your finger!" | `trace-the-letter.m4a` | First-visit letter-trace overlay |
| 7 | "Pick your favorite WiggleWoo look!" | `wardrobe-intro.m4a` | Wardrobe opens |
| 8 | "Finish the Discovery Room to unlock this WiggleWoo!" | `wardrobe-locked.m4a` | Browsed skin in the carousel is locked |

## 🔴 Still needed — 1 new line

| # | Line to record | Suggested file name | Shown when |
|---|---|---|---|
| 9 | "Great choice! You're wearing this WiggleWoo now." | `wardrobe-equipped.m4a` | A player equips a new skin (`handleSelect` fires in `WardrobeModal.tsx`) |

Cut from the original draft of this doc to hold the line count down — restored since it's just as real and silent as the other two Wardrobe lines (a kid equips a new look and gets no audio confirmation it worked).

## Delivery

- **Voice/style:** Match the existing short prompt-phrase clips already in the game (`/assets/audio/phrases/`, e.g. `drag-a-letter.m4a`, `lets-build-a-word.m4a`) — upbeat, kid-facing instruction, not the single-word pronunciation voice and not the WiggleWoo character voice.
- **File type:** `.m4a` (or `.wav` — the last delivery came as `.wav` and was converted locally; either works).
- **Naming:** Use the file name above exactly.
- **Timing:** No rush — not wired into the code yet; the game reads fine with this one silent (text-only), exactly as it did for the other 8 before this round.

## Once recorded

Add `playWardrobeEquippedPhrase()` to `src/audio/SoundEffects.ts`, following the exact pattern of the other 8 lines just added, then call it from `WardrobeModal.tsx`'s `handleSelect`.

## Already wired, no recording needed (from the prior audit)

Both of these reuse existing, already-recorded audio that just wasn't being called — already fixed in commit `7f01b36`, kept here for reference:

1. **"Challenge Mode Unlocked!"** — now reuses `decode-unlock.m4a`.
2. **"Tap here to start!"** (first-time onboarding arrow) — now plays `onboard-tap-gear.m4a`.

*End of pickup script — Round 5, Remaining Silent Spots.*
