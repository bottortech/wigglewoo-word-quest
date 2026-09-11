# V2 Quest Tiers — CVCC, Magic-E, CVVC, Advanced Reading

**Status:** Future Enhancement — DO NOT unlock these tiers until every item below is resolved
**Priority:** Real v2 scope, not urgent for 9/26
**Reason for deferral:** v1 is CVC-only by design. The word data for these 4 tiers already exists in the codebase (`wordData.cvcc.ts`, `wordData.magicE.ts`, `wordData.cvvc.ts`, `wordData.advanced.ts`), but they are hidden behind two hardcoded gates and have real content gaps — this is an art-production project first, not a quick flag flip.

---

## What's blocking these tiers, ranked by size

### 1. Missing images — the actual biggest gap
**Corrected count: 47 words** need a picture, not the 148 first reported. That original number was wrong — it was inflated by dead, unconsumed `*_WORD_BANK` data (`CVCC_WORD_BANK`, `MAGIC_E_WORD_BANK`, `CVVC_WORD_BANK`, `ADVANCED_WORD_BANK`), which is exported from the word-data files but never actually imported anywhere in the app for these tiers — it doesn't feed the real gameplay word arrays at all. Corrected to only count words in the live `words: CvcWord[]` arrays that Potion Game / Cross-Match / Word-Tac-Toe actually read from. Breakdown: Advanced Reading 32, Magic-E 13, CVVC 2, CVCC 0. Full checklist, ready to hand to an illustrator: [docs/future-features/v2-missing-word-images.md](v2-missing-word-images.md).

Decode-mode words (no picture, by design — see below) are **not** part of this gap; only words explicitly meant to show a picture are missing one.

**Also resolved during this correction:** a batch of 20 words (best, cure, deal, feel, help, hope, keep, last, long, must, pure, rule, seek, send, soft, task, test, time, wait, week) were reviewed against the live quest data and confirmed already `mode: "decode"` — no code change was needed, they were never actually missing an image in real gameplay (the dead word-bank data made them look like they were). `read` is also currently `mode: "decode"` in the live CVVC data — left as-is intentionally, pending a separate decision on whether a clear enough picture can be found for it before reversing that choice.

### 2. Word-Tac-Toe / Cross-Match challenge-picker bug — code fix needed, separate from art
These tiers intentionally shift from picture-supported ("image" mode) to text-only ("decode" mode) words as a learner advances — confirmed as **intentional design, staying that way** for strictly advanced learners/readers, not something to fix with more art. Roughly 30–60% of nodes per tier are decode-mode by design.

The problem: Word-Tac-Toe's word-picture-match challenge type (and Cross-Match generally) currently has no awareness of word mode — it assumes every word has a picture. Once these tiers are reachable, the challenge picker needs to **skip word-picture-match entirely for decode-mode words** (fall back to missing-letter, which doesn't need a picture) — otherwise it will try to show a picture that will never exist, permanently, for every decode-mode word forever. This needs fixing in code regardless of how many of the 47 missing images get produced, since it's about words that are *never supposed to* have a picture.

### 3. Audio — nearly done
2 words (`junk`, `snowman`) — already handed off separately (`docs/Voiceover-Pickup-2026-09-V2-Words.md`).

### 4. Discovery Room content — already fully ready structurally
Every v2 quest already maps to one of the 5 existing environments (`QUEST_ENVIRONMENT_MAP` in `exploreData.ts`) — no new rooms needed to make these tiers functional.

**However, a real future idea surfaced during this scoping**: right now every room's fact language is written at a beginner reading level, regardless of which tier's learner is visiting it. The idea: keep the same facts/topics per room, but **write a second (or tiered) version of each fact's language**, pitched to where the learner actually is — a CVC beginner and an Advanced-tier reader visiting "Rumble Peak Volcano" would get the same topic explained at different depth/vocabulary levels. Not scoped or designed yet — just captured here so it isn't lost. Would need: a decision on how many tiers of language (2? matches CVC vs. everything-else? or more granular?), a content-writing pass per fact per tier, and a code change to `FactItem` to hold multiple text/audio variants selected by the active quest's tier.

### 5. Two code gates — hold off, do not flip until 1–4 above are resolved
- `ww_placement_tiers` clamp in `App.tsx` (hardcoded to `["CVC"]`)
- `SHIPPED_TIERS` set in `QuestMapScreen.tsx` (also hardcoded to `["CVC"]`)

Trivial one-line changes each, but they're what actually exposes these tiers to real players — flipping them before the above is resolved means shipping broken word-picture-match challenges and a wall of missing pictures.

### 6. BlendingPowerUnlock — hold off, re-wire only once CVCC is ready to ship
A dedicated celebration screen (`src/components/BlendingPowerUnlock.tsx`) built specifically for CVCC's consonant-blend skill, currently dormant — v1 fires the generic `QuestCompleteCelebration` instead. The component still exists and is ready to swap back in (see comments at `App.tsx:80-81, 765`), but there's no reason to re-enable a CVCC-specific celebration before CVCC itself is safe to ship.

---

## Explicitly out of scope for now

Do not flip the two tier gates, re-wire BlendingPowerUnlock, or start the tiered-language Discovery Room idea until this doc's items 1–2 are resolved and there's an explicit go-ahead. This is a placeholder for the idea and scope, not a build-ready spec.
