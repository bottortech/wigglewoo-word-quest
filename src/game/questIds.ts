// =============================================
// questIds.ts — Lightweight quest ID arrays
// Wigglewoo CVC Quest
// =============================================
// No word data here — just string IDs for lock
// checking and quest ordering. Always in the
// main bundle so QuestMapScreen and UnlockModal
// can check progression without loading full
// quest data.
// =============================================

/** CVC quest IDs (always in main bundle) */
export const CVC_QUEST_IDS = [
  "quest-short-a",
  "quest-short-i",
  "quest-short-o",
  "quest-short-u",
  "quest-short-e",
] as const;

/** CVCC quest IDs (data lazy-loaded) */
export const CVCC_QUEST_IDS = [
  "quest-cvcc-short-a",
  "quest-cvcc-short-i",
  "quest-cvcc-short-o",
  "quest-cvcc-short-u",
  "quest-cvcc-short-e",
] as const;

/** CVVC quest IDs (data lazy-loaded) */
export const CVVC_QUEST_IDS = [
  "quest-cvvc-long-a",
  "quest-cvvc-long-e",
  "quest-cvvc-long-o",
  "quest-cvvc-long-u",
  "quest-cvvc-mixed-ea",
] as const;

/** Full ordered sequence of all quest IDs */
export const ALL_QUEST_IDS = [
  ...CVC_QUEST_IDS,
  ...CVCC_QUEST_IDS,
  ...CVVC_QUEST_IDS,
] as const;

/** Default quest for fresh installs */
export const DEFAULT_QUEST_ID = "quest-short-a";
