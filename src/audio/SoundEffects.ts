// =============================================
// SoundEffects.ts — Letter, word & phrase audio manager
// WiggleWoo's Word Quest
// =============================================
// Plays voice-over audio on game events. Files are
// served as static assets from /assets/audio/ and
// loaded lazily via HTMLAudioElement (no preloading).
// One HTMLAudioElement per channel so rapid taps
// interrupt instantly instead of stacking.
// =============================================

const AUDIO_BASE = "/assets/audio";

// ---- Phrase URL pools ----
const phraseUrl = (slug: string) => `${AUDIO_BASE}/phrases/${slug}.m4a`;

const SUCCESS_PHRASES = [
  phraseUrl("great-job"),
  phraseUrl("amazing"),
  phraseUrl("fantastic"),
  phraseUrl("nice-work"),
  phraseUrl("high-five"),
  phraseUrl("thats-the-right-word"),
  phraseUrl("hooray"),
  phraseUrl("you-did-it"),
  phraseUrl("way-to-go"),
  phraseUrl("youre-a-reading-scientist"),
  phraseUrl("youre-a-word-star"),
  phraseUrl("you-nailed-it"),
];

const ENCOURAGEMENT_PHRASES = [
  phraseUrl("keep-going"),
  phraseUrl("lets-build-a-word"),
];

const PROMPT_PHRASES = [
  phraseUrl("drag-a-letter"),
  phraseUrl("lets-build-a-word"),
];

const TAP_CARD_PHRASES = [phraseUrl("tap-a-card")];

const PROGRESSION_PHRASES = [
  phraseUrl("ready-for-the-next-word"),
  phraseUrl("lets-level-up"),
  phraseUrl("lets-try-another-one"),
];

const MATCH_PHRASES = [phraseUrl("its-a-match")];
const EXPLORE_PHRASES = [phraseUrl("lets-explore")];
const RETRY_PHRASES = [phraseUrl("try-it-again")];
const NEW_CHALLENGE_PHRASE = phraseUrl("time-for-a-new-challenge");

// ---- Channels: one Audio element per channel for instant interrupt ----
let letterAudio: HTMLAudioElement | null = null;
let phraseAudio: HTMLAudioElement | null = null;
let wordAudio: HTMLAudioElement | null = null;
let eventAudio: HTMLAudioElement | null = null;

type Channel = "letter" | "phrase" | "word" | "event";

function getChannel(which: Channel): HTMLAudioElement {
  switch (which) {
    case "letter":
      if (!letterAudio) letterAudio = new Audio();
      return letterAudio;
    case "phrase":
      if (!phraseAudio) phraseAudio = new Audio();
      return phraseAudio;
    case "word":
      if (!wordAudio) wordAudio = new Audio();
      return wordAudio;
    case "event":
      if (!eventAudio) eventAudio = new Audio();
      return eventAudio;
  }
}

function play(channel: Channel, src: string, volume: number): void {
  if (!src) return;
  const audio = getChannel(channel);
  audio.pause();
  audio.currentTime = 0;
  audio.src = src;
  audio.volume = volume;
  audio.play().catch(() => {});
}

let lastPhraseSrc = "";

function pickPhrase(pool: string[]): string {
  if (!pool.length) return "";
  if (pool.length === 1) return pool[0];
  let choice: string;
  do {
    choice = pool[Math.floor(Math.random() * pool.length)];
  } while (choice === lastPhraseSrc);
  lastPhraseSrc = choice;
  return choice;
}

// =============================================
// Public API
// =============================================

// Letters that have a recording in the new "Alphabet Phonemes A-Z" folder.
// Everything else falls back to the original "new phonetics" recordings.
// Add "c" here once the VO artist delivers that file.
const NEW_PHONEME_SET = new Set("abdefghijklmnopqrstuvwxyz".split(""));

export function playLetterSound(letter: string): void {
  const key = letter.toLowerCase();
  if (!/^[a-z]$/.test(key)) return;
  const audio = getChannel("letter");
  audio.pause();
  audio.currentTime = 0;
  audio.src = NEW_PHONEME_SET.has(key)
    ? `${AUDIO_BASE}/Alphabet%20Phonemes%20A-Z/Phoneme%20-%20${key.toUpperCase()}_1.wav`
    : `${AUDIO_BASE}/new%20phonetics/${key.toUpperCase()}%20Phoneme_1.wav`;
  audio.volume = 0.3;
  audio.playbackRate = document.documentElement.classList.contains("slow-phoneme") ? 0.7 : 1.0;
  audio.play().catch(() => {});
}

/** Pronounce a full word. Silent fallback if the VO file is missing. */
export function playWordSound(word: string): void {
  const key = word.toLowerCase().trim();
  if (!key) return;
  play("word", `${AUDIO_BASE}/words/${key}.m4a`, 0.5);
}

export function playSuccessPhrase(): void {
  play("phrase", pickPhrase(SUCCESS_PHRASES), 0.35);
}

export function playEncouragementPhrase(): void {
  play("phrase", pickPhrase(ENCOURAGEMENT_PHRASES), 0.35);
}

export function playPromptPhrase(): void {
  play("phrase", pickPhrase(PROMPT_PHRASES), 0.35);
}

export function playProgressionPhrase(): void {
  play("phrase", pickPhrase(PROGRESSION_PHRASES), 0.35);
}

/** "Tap a card" — trophy room entry cue */
export function playTapCardPhrase(): void {
  play("phrase", pickPhrase(TAP_CARD_PHRASES), 0.35);
}

export function playMatchPhrase(): void {
  play("phrase", pickPhrase(MATCH_PHRASES), 0.35);
}

export function playExplorePhrase(): void {
  play("phrase", pickPhrase(EXPLORE_PHRASES), 0.35);
}

export function playRetryPhrase(): void {
  play("phrase", pickPhrase(RETRY_PHRASES), 0.35);
}

export function playNewChallengePhrase(): void {
  play("phrase", NEW_CHALLENGE_PHRASE, 0.35);
}

// =============================================
// Event VOs — specific moment narrations
// Slugs map 1:1 to files in /assets/audio/events/
// =============================================

export type EventSlug =
  // Celebrate
  | "celebrate-perfect" | "celebrate-assisted"
  | "celebrate-quest-complete" | "celebrate-word-power"
  // Wrong / feedback
  | "wrong-gentle" | "wrong-almost" | "wrong-hint"
  // Placement test
  | "placement-intro" | "placement-prompt"
  | "placement-reassure" | "placement-complete" | "placement-skip"
  // Onboarding
  | "onboard-intro" | "onboard-tap-gear" | "onboard-first-complete"
  // Trophy room
  | "trophy-flying" | "trophy-all-matched" | "trophy-return"
  | "trophy-phase2-intro"          // NEW — phase 2 entry ("One more challenge — let's earn the full trophy!")
  // Decode (Challenge Mode)
  | "decode-unlock" | "decode-complete"
  // Discovery rooms
  | "discover-welcome" | "discover-fact-reaction"
  | "discover-skin-unlocked" | "discover-complete"
  | "discover-exit-bridge"         // plays as the room fades out ("Nice exploring! Let's keep going.")
  | "welcome-intro"                // first-ever discovery room visit ("Welcome to the Discovery Room!")
  | "welcome-volcano" | "welcome-castle" | "welcome-coastal"
  | "welcome-geartown" | "welcome-greenhouse" // per-room thematic welcome (replaces generic discover-welcome)
  | "tap-to-listen"                // first-discovery hotspot interaction hint
  // Mini-games
  | "mini-vowel-builder" | "mini-word-sort"
  | "mini-correct" | "mini-complete"
  // Cross-match (Quick Review) — drag-line word→picture mini-game
  | "cross-match-intro"            // "Drag the word to its picture!"
  | "cross-match-complete"         // "Great matching!"
  // Quest completion
  | "v1-quest-complete";           // CVC tier (all 5 vowel quests) complete

const ADDITIONAL_LINES = new Set<EventSlug>([
  "cross-match-complete", "cross-match-intro",
  "discover-exit-bridge", "tap-to-listen",
  "trophy-phase2-intro", "v1-quest-complete",
  "welcome-castle", "welcome-coastal", "welcome-geartown",
  "welcome-greenhouse", "welcome-intro", "welcome-volcano",
]);

export function playEvent(slug: EventSlug): void {
  const src = ADDITIONAL_LINES.has(slug)
    ? `${AUDIO_BASE}/WiggleWooAdditionalLines/${slug}.wav`
    : `${AUDIO_BASE}/events/${slug}.m4a`;
  play("event", src, 0.4);
}

const ROOM_WELCOME_SLUG: Record<string, EventSlug> = {
  "valcano": "welcome-volcano",
  "castle-island": "welcome-castle",
  "small-coastal-village": "welcome-coastal",
  "industrial-tech-city": "welcome-geartown",
  "glass-dome": "welcome-greenhouse",
};

/**
 * Plays the per-room welcome VO. Falls back to the generic discover-welcome
 * line if the environment id isn't in the room map.
 */
export function playRoomWelcome(envId: string): void {
  playEvent(ROOM_WELCOME_SLUG[envId] ?? "discover-welcome");
}

export function stopAllSfx(): void {
  if (letterAudio) { letterAudio.pause(); letterAudio.currentTime = 0; }
  if (phraseAudio) { phraseAudio.pause(); phraseAudio.currentTime = 0; }
  if (wordAudio)   { wordAudio.pause();   wordAudio.currentTime = 0; }
  if (eventAudio)  { eventAudio.pause();  eventAudio.currentTime = 0; }
}

/**
 * Resolves when the letter channel finishes playing (or immediately
 * if idle). Use this before playing a word/phrase so the final
 * phoneme isn't cut off by the next VO.
 */
export function waitForLetterDone(): Promise<void> {
  return waitForChannelDone(letterAudio, 1500);
}

/**
 * Resolves when the word channel finishes playing (or immediately if
 * idle). Use this before playing an event/phrase so the word VO doesn't
 * overlap the celebration ("cat" + "great job!" sounded layered).
 */
export function waitForWordDone(): Promise<void> {
  return waitForChannelDone(wordAudio, 2500);
}

function waitForChannelDone(audio: HTMLAudioElement | null, fallbackMs: number): Promise<void> {
  if (!audio || audio.paused || audio.ended || !audio.src) {
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      audio.removeEventListener("ended", done);
      audio.removeEventListener("pause", done);
      resolve();
    };
    audio.addEventListener("ended", done, { once: true });
    audio.addEventListener("pause", done, { once: true });
    setTimeout(done, fallbackMs);
  });
}
