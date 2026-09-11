# V2 Missing Word Images — Production Checklist

**Corrected count: 47 words.** An earlier version of this doc said 148 — that count was wrong, inflated by dead/unconsumed `*_WORD_BANK` data (`CVCC_WORD_BANK`, `MAGIC_E_WORD_BANK`, `CVVC_WORD_BANK`, `ADVANCED_WORD_BANK`) that is exported from the word-data files but never actually imported or used anywhere in the app for these tiers. This checklist now only counts words that appear in the real, live `words: CvcWord[]` gameplay arrays — the ones Potion Game, Cross-Match, and Word-Tac-Toe actually read from.

**Total:** 47 unique words in live gameplay data have `mode: "image"` (or default to it) but have no picture yet at `/assets/words/{word}.png`.
**Context:** These belong to the CVCC/Magic-E/CVVC/Advanced Reading quest tiers, not part of v1. See `docs/future-features/v2-quest-tiers.md` for the full unlock picture.

**Also resolved during this correction:** a separate batch of 20 words (best, cure, deal, feel, help, hope, keep, last, long, must, pure, rule, seek, send, soft, task, test, time, wait, week) were reviewed and confirmed to already be `mode: "decode"` in the live quest data — no code change needed, they were never actually missing an image in real gameplay. `read` is also currently `mode: "decode"` in the live CVVC data; left as-is for now pending a separate decision on whether a clear enough picture exists for it.

**Style:** Match the existing word-picture set already used in the game (`/assets/words/`) — same art style, same simple single-object-on-plain-background framing, so new and old pictures don't look mismatched once these tiers ship.

**Naming:** Save each file as `{word}.png` (lowercase, exact word) directly — e.g. `basket.png`, `chicken.png` — matching the naming convention every existing word picture already uses.

---

## Advanced Reading (32)

| Word | Current mode | Status |
|---|---|---|
| anthill | image (default) | needs picture |
| basket | image (default) | needs picture |
| bathtub | image (default) | needs picture |
| blanket | image (default) | needs picture |
| butter | image (default) | needs picture |
| cactus | image (default) | needs picture |
| chicken | image (default) | needs picture |
| cobweb | image (default) | needs picture |
| cupcake | image (default) | needs picture |
| doctor | image (default) | needs picture |
| dolphin | image (default) | needs picture |
| football | image (default) | needs picture |
| goldfish | image (default) | needs picture |
| hammer | image (default) | needs picture |
| helmet | image (default) | needs picture |
| insect | image (default) | needs picture |
| jacket | image (default) | needs picture |
| kitten | image (default) | needs picture |
| melon | image (default) | needs picture |
| mitten | image (default) | needs picture |
| monster | image (default) | needs picture |
| mushroom | image (default) | needs picture |
| napkin | image (default) | needs picture |
| penguin | image (default) | needs picture |
| popcorn | image (default) | needs picture |
| pumpkin | image (default) | needs picture |
| puppet | image (default) | needs picture |
| rainbow | image (default) | needs picture |
| rocket | image (default) | needs picture |
| sandwich | image (default) | needs picture |
| sunset | image (default) | needs picture |
| windmill | image (default) | needs picture |

## Magic-E (13)

| Word | Current mode | Status |
|---|---|---|
| cube | image (default) | needs picture |
| gate | image (default) | needs picture |
| huge | image (default) | needs picture |
| lake | image (default) | needs picture |
| mice | image (default) | needs picture |
| mule | image (default) | needs picture |
| nose | image (default) | needs picture |
| note | image (default) | needs picture |
| rope | image (default) | needs picture |
| rose | image (default) | needs picture |
| tape | image (default) | needs picture |
| tune | image (default) | needs picture |
| wave | image (default) | needs picture |

## CVVC (2)

| Word | Current mode | Status |
|---|---|---|
| road | image (default) | needs picture |
| tail | image (default) | needs picture |

---

*47 images total — some words may appear in more than one tier above; each only needs one picture.*