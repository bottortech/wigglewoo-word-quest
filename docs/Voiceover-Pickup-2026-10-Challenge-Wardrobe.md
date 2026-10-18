# WiggleWoo's Word Quest — Voiceover Pickup (Challenge Mode + Wardrobe)

**Prepared for:** Phrase Narrator (same voice as the existing short prompt/encouragement clips already in the game, e.g. "Drag a letter," "Let's build a word!")
**Scope:** 4 phrases
**Status:** Not urgent — text-only fallback is fine for now. Flagged during a silent-spot audit of the live (non-event) app ahead of the v1 App Store submission; neither spot is gated behind the event or kiosk builds, so both are reachable by every real App Store player.

---

## Context

Two spots in the standard app show kid-facing text with no audio at all, found while auditing the app for places a pre-reader has no way to know what's happening:

1. **Challenge Mode unlock** (`ChallengeModeUnlock.tsx`) — a 2-second celebration overlay shown once a player finishes all image-mode words in a quest and unlocks the no-picture "Challenge Mode." Auto-dismisses; a child who can't read the banner in time misses the moment entirely.
2. **Wardrobe** (`WardrobeModal.tsx`) — the outfit-picker carousel where a child browses and equips a WiggleWoo skin. Locked/equipped status and the "pick an outfit" framing are text-only.

Kept intentionally small: rather than a separate line per outfit (5 skins today, more later), the wardrobe lines below are generic enough to cover any skin without growing every time a new one ships.

## Phrases needed

| # | Line to record | Suggested file name | Shown when |
|---|---|---|---|
| 1 | "Challenge Mode unlocked! No pictures — you're leveling up!" | `challenge-mode-unlocked.m4a` | A player finishes all image-mode words in a quest (`ChallengeModeUnlock` overlay) |
| 2 | "Pick your favorite WiggleWoo look!" | `wardrobe-intro.m4a` | The Wardrobe opens (main-build voluntary entry and the kiosk first-visit intro) |
| 3 | "Finish the Discovery Room to unlock this WiggleWoo!" | `wardrobe-locked.m4a` | The browsed skin in the carousel is locked (generic — doesn't name the specific room) |
| 4 | "Great choice! You're wearing this WiggleWoo now." | `wardrobe-equipped.m4a` | A player equips a new skin (`handleSelect` fires) |

## Delivery

- **Voice/style:** Match the existing short prompt-phrase clips already in the game (`/assets/audio/phrases/`, e.g. `drag-a-letter.m4a`, `lets-build-a-word.m4a`) — upbeat, kid-facing instruction, not the single-word pronunciation voice and not the WiggleWoo character voice.
- **File type:** Match the existing phrase-audio format (`.m4a`).
- **Naming:** Use the file names above exactly.
- **Timing:** No rush — batch in whenever convenient. Not wired into the code yet; the game reads fine with these silent (text-only), exactly as it does today.

## Once recorded

Not wired up yet — someone needs to add `playChallengeModeUnlockedPhrase()` / `playWardrobeIntroPhrase()` / `playWardrobeLockedPhrase()` / `playWardrobeEquippedPhrase()` (or similar) in `src/audio/SoundEffects.ts`, following the exact pattern of `playTapCardPhrase()`, then call them from `ChallengeModeUnlock.tsx` (on mount) and `WardrobeModal.tsx` (on open, when the displayed skin is locked, and in `handleSelect`). Small, low-risk addition once the files exist.

*End of pickup script — Challenge Mode + Wardrobe.*
