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
