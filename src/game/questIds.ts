// =============================================
// questIds.ts — Lightweight quest ID arrays
// Wigglewoo CVC Quest
// =============================================
// No word data here — just string IDs for lock
// checking and quest ordering. Always in the
// main bundle so QuestMapScreen and UnlockModal
// can check progression without loading full
// quest data.
//
// Tier sequence:
//   CVC → Blending Power → Magic E → Vowel Teams → Advanced Reading
// =============================================

/** Tier 1: Sound Builders (CVC) — always in main bundle */
export const CVC_QUEST_IDS = [
  "quest-short-a",
  "quest-short-i",
  "quest-short-o",
  "quest-short-u",
  "quest-short-e",
] as const;

/** Tier 2: Blending Power (CVCC + future CCVC) — data lazy-loaded */
export const CVCC_QUEST_IDS = [
  "quest-cvcc-short-a",
  "quest-cvcc-short-i",
  "quest-cvcc-short-o",
  "quest-cvcc-short-u",
  "quest-cvcc-short-e",
] as const;

/** Tier 3: Magic E (CVCe) — data lazy-loaded */
export const MAGIC_E_QUEST_IDS = [
  "quest-magic-e-a",
  "quest-magic-e-i",
  "quest-magic-e-o",
  "quest-magic-e-u",
  "quest-magic-e-mixed",
] as const;

/** Tier 4: Vowel Teams (CVVC) — data lazy-loaded */
export const CVVC_QUEST_IDS = [
  "quest-cvvc-long-a",
  "quest-cvvc-long-e",
  "quest-cvvc-long-o",
  "quest-cvvc-long-u",
  "quest-cvvc-mixed-ea",
] as const;

/** Tier 5: Advanced Reading (r-controlled + multisyllable) — data lazy-loaded */
export const ADVANCED_QUEST_IDS = [
  "quest-adv-ar-or",
  "quest-adv-er-ir-ur",
  "quest-adv-bossy-r-mix",
  "quest-adv-2syl-closed",
  "quest-adv-mixed-mastery",
] as const;

/** Full ordered sequence of all quest IDs (all tiers) */
export const ALL_QUEST_IDS = [
  ...CVC_QUEST_IDS,
  ...CVCC_QUEST_IDS,
  ...MAGIC_E_QUEST_IDS,
  ...CVVC_QUEST_IDS,
  ...ADVANCED_QUEST_IDS,
] as const;

/** Default quest for fresh installs */
export const DEFAULT_QUEST_ID = "quest-short-a";
