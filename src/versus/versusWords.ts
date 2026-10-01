import { CVC_QUESTS } from "../game/wordData";
import type { CvcWord, Quest } from "../game/types";

/**
 * Challenge pool for the two-tablet versus game: every quest's picture words
 * in the given tier (so a demo mixes all five vowels, not just short-A).
 * Only words the relay's challenge format can represent are kept — a real
 * picture on file and one letter per phoneme, so the blank always lines up
 * with the word. Defaults to CVC_QUESTS; the event build's "follow the
 * tablet's active quest" behavior (App.tsx) passes CVCC_QUESTS instead when
 * a CVCC quest is active, reusing the exact same filtering.
 */
export function getVersusWords(quests: Quest[] = CVC_QUESTS): CvcWord[] {
  const seen = new Set<string>();
  const out: CvcWord[] = [];
  for (const quest of quests) {
    for (const w of quest.words) {
      if ((w.mode ?? "image") !== "image") continue;
      if (!/^[a-z]{1,16}$/.test(w.word)) continue;
      if (w.letters.length !== w.word.length || w.letters.some((l) => l.length !== 1)) continue;
      if (seen.has(w.word)) continue;
      seen.add(w.word);
      out.push(w);
    }
  }
  return out;
}

/** Checked against /assets/audio/words/<word>.m4a as of 2026-10-01 (see
 *  docs/Voiceover-Pickup-2026-09-V2-Words.md) — "junk" is the one CVCC word
 *  without a recording yet. playWordSound() already falls back silently for
 *  any missing file, so this exclusion is belt-and-suspenders, not load-
 *  bearing: it just keeps the word from coming up at all rather than
 *  showing up silent. Remove once the recording lands. */
const WORDS_MISSING_AUDIO = new Set(["junk"]);

/**
 * Broader challenge pool for single-player Word-Tac-Toe on the event build
 * (Oct 3rd walk-up event, see App.tsx) — mixes CVC + CVCC instead of
 * whichever one quest/vowel the player currently has active, for variety.
 * Unlike getVersusWords(), this keeps decode-mode words (WordTacToeScreen's
 * own challenge picker already routes them to missing-letter only, never
 * word-picture-match — see its decode-mode guard), so the only exclusion
 * here is "would be silent" (no voice-over on file), not "would show a
 * broken picture."
 */
export function getFreeExploreWttWords(quests: Quest[]): CvcWord[] {
  const seen = new Set<string>();
  const out: CvcWord[] = [];
  for (const quest of quests) {
    for (const w of quest.words) {
      if (WORDS_MISSING_AUDIO.has(w.word)) continue;
      if (seen.has(w.word)) continue;
      seen.add(w.word);
      out.push(w);
    }
  }
  return out;
}
