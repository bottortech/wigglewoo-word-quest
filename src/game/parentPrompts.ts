// =============================================
// parentPrompts.ts — Home-extension prompts shown after each lesson
// =============================================
// One short prompt per lesson (4 per quest) surfaced under the
// MasteryBadgeUnlock celebration. Default-shown, dismissable. The
// goal per the educator brief is to bridge classroom-style practice
// into home conversation without nagging the parent.
//
// Indexed by [vowel, lessonIndex]. Falls back to a generic prompt
// when no vowel-specific copy exists (e.g. CVCC quests share copy).
// =============================================

export interface ParentPrompt {
  /** One short, conversational sentence (≤ ~120 chars). */
  text: string;
  /** Optional teacher-style follow-up question they can ask at home. */
  ask?: string;
}

/** Vowel-specific prompts, one per lesson. */
const PROMPTS_BY_VOWEL: Record<string, ParentPrompt[]> = {
  a: [
    { text: "Listen for the short A sound!", ask: "Can you say another word with the A sound, like CAT?" },
    { text: "Build words together at home.", ask: "What other -AT words can you think of? (BAT, MAT, RAT...)" },
    { text: "Trace the letters in the air.", ask: "Can you draw an A on the table with your finger?" },
    { text: "Reading is a superpower!", ask: "Find something around the house that starts with A." },
  ],
  e: [
    { text: "Listen for the short E sound!", ask: "Can you say another word with the E sound, like PEN?" },
    { text: "Build words together at home.", ask: "What other -ET words can you think of? (PET, NET, GET...)" },
    { text: "Trace letters in the air.", ask: "Can you draw an E on the table with your finger?" },
    { text: "Reading is a superpower!", ask: "Find something around the house that starts with E." },
  ],
  i: [
    { text: "Listen for the short I sound!", ask: "Can you say another word with the I sound, like SIT?" },
    { text: "Build words together at home.", ask: "What other -IT words can you think of? (HIT, BIT, KIT...)" },
    { text: "Trace letters in the air.", ask: "Can you draw an I on the table with your finger?" },
    { text: "Reading is a superpower!", ask: "Find something around the house that starts with I." },
  ],
  o: [
    { text: "Listen for the short O sound!", ask: "Can you say another word with the O sound, like DOG?" },
    { text: "Build words together at home.", ask: "What other -OT words can you think of? (HOT, POT, NOT...)" },
    { text: "Trace letters in the air.", ask: "Can you draw an O on the table with your finger?" },
    { text: "Reading is a superpower!", ask: "Find something around the house that starts with O." },
  ],
  u: [
    { text: "Listen for the short U sound!", ask: "Can you say another word with the U sound, like CUP?" },
    { text: "Build words together at home.", ask: "What other -UN words can you think of? (RUN, SUN, FUN...)" },
    { text: "Trace letters in the air.", ask: "Can you draw a U on the table with your finger?" },
    { text: "Reading is a superpower!", ask: "Find something around the house that starts with U." },
  ],
};

const FALLBACK_PROMPTS: ParentPrompt[] = [
  { text: "Listen for the new sound!", ask: "What other words start with this sound?" },
  { text: "Build words together at home.", ask: "Can you think of another word that fits this pattern?" },
  { text: "Trace letters in the air.", ask: "Can you draw the letter with your finger on the table?" },
  { text: "Reading is a superpower!", ask: "Find a word like this in a book you have at home." },
];

/** Look up the home-extension prompt for a quest's lesson.
 *  vowel is the lowercase quest vowel (e.g. "a") — see getVowelForQuest. */
export function getParentPrompt(
  vowel: string | null,
  lessonIndex: number,
): ParentPrompt {
  const set = (vowel && PROMPTS_BY_VOWEL[vowel]) || FALLBACK_PROMPTS;
  return set[lessonIndex] ?? set[0];
}
