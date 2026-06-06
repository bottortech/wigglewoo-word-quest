# Word Dunk Arena

**Status:** Future Enhancement — DO NOT BUILD FOR v1.0
**Priority:** High (post-launch v1.1)
**Reason for deferral:** v1 gameplay loop is complete; App Store launch should not be delayed. Word Dunk Arena is a future engagement upgrade that reinforces the same phonics skills already taught in the core experience.

---

## Goal

A short basketball-themed phonics challenge that serves as a **mastery activity**. The child is still practicing phonics, decoding, blending, and letter–sound correspondence — but the framing feels like a reward and celebration of learning, not a separate game mode.

---

## Design Philosophy

WDA does **not** replace the existing word-building gameplay. The current loop remains:

```
Quest Map → Word Building → Mastery Check → Trophy Room → Discovery Room
```

WDA enhances mastery moments. It does not replace the instructional flow.

---

## Proposed Placement

Trigger after mastery checkpoints. Current checkpoints occur at words **4, 8, 12, 16**.

Two candidate flows:

```
Word Build → Word Dunk Arena Challenge → Mastery Badge → Parent Prompt
```

or, more selective (champion-moment framing):

```
Word 8  → Word Dunk Arena            → Half Trophy
Word 16 → Word Dunk Arena Championship → Full Trophy
```

Final placement decision should be made after v1 launch analytics are reviewed.

---

## Core Gameplay

The child is shown a phonics challenge. A basketball hoop appears, along with several basketballs each carrying a letter, sound, or word chunk. The child taps the correct basketball; the ball automatically launches toward the hoop.

**Correct answer**
- Swish animation
- Crowd cheers
- WiggleWoo celebration
- Positive reinforcement audio

**Incorrect answer**
- Rim bounce
- Encouraging feedback
- Unlimited retries

**Constraints:** No timers. No penalties. No failure state.

---

## Example Activities

### Missing Letter Challenge

| Element | Value |
|---|---|
| Word shown | `C _ T` |
| Balls | A · O · U |
| Correct | A |
| Result | Ball swishes → CAT appears → word audio plays |

### Beginning Sound Challenge

| Element | Value |
|---|---|
| Picture | Dog |
| Prompt | "Which sound starts DOG?" |
| Balls | D · B · M |
| Correct | D |
| Result | Swish → word revealed |

### Ending Sound Challenge

| Element | Value |
|---|---|
| Word shown | `CA _` |
| Balls | T · P · M |
| Correct | T |
| Result | Word completed |

### Build The Whole Word

| Element | Value |
|---|---|
| Picture | Pig |
| Balls | P · I · G · T · N |
| Sequence | Shoot P → I → G |
| Result | Three successful baskets complete the word |

> **Design note from review:** *Build The Whole Word* is structurally identical to the existing GameScreen tap-to-place flow with a basketball skin. If used at every checkpoint, it risks diluting the championship framing. Consider reserving this variant exclusively for the **Word-16 Championship**, and using the three other variants (missing letter, beginning sound, ending sound) for the lighter checkpoints. Revisit at build time.

---

## Curriculum Coverage

The framework must scale across all reading tiers:

| Tier | Example words / units |
|---|---|
| Sound Builders (CVC) | CAT, DOG, PIG |
| Blending Power (CVCC) | DUCK, JUMP |
| Magic E | CAKE, BIKE |
| Vowel Teams | RAIN, BOAT |
| Advanced Reading | sound chunks, syllables, word parts |

Same game framework — only the prompt content changes.

---

## Theme Variants

Inherit the existing quest themes; only visuals change, gameplay is identical.

| Vowel | Arena |
|---|---|
| Short A | Volcano Arena |
| Short E | Greenhouse Arena |
| Short I | Knight Arena |
| Short O | Coral Cove Arena |
| Short U | Geartown Robo Arena |

---

## Technical Notes (proposed shape)

| Path | Purpose |
|---|---|
| `src/screens/WordDunkArenaScreen.tsx` | New screen |
| `src/components/wordDunk/` | Hoop, ball, swish/rim animations |
| `src/game/wordDunkData.ts` | Per-tier challenge data |
| Route `word-dunk` | Added to the App router |

Keep isolated from the v1 gameplay loop until activated.

---

## Success Criteria

The feature should:

- Reinforce phonics skills
- Require minimal reading ability
- Feel rewarding
- Add gameplay variety
- Scale across all curriculum tiers
- Reuse existing audio assets where possible
- Avoid introducing timers, competition, or frustration

> The goal is not to create a basketball game. The goal is to create a phonics mastery activity that feels like a championship moment.
