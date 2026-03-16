// =============================================
// SoundEffects.ts — Letter & phrase audio manager
// WiggleWoo's Word Quest
// =============================================
// Plays letter-name sounds on tile tap and
// celebratory/encouragement phrases on game events.
// Uses a single HTMLAudioElement per channel to
// ensure instant interruption on rapid taps.
// Audio files are resolved via import.meta.glob
// with { query: '?url' } so Vite returns URL strings.
// =============================================

// Glob all .wav files as URL strings (no eager loading of file contents)
const alphabetFiles = import.meta.glob(
  "./Wiggle Woo Alphabet/*_1.wav",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

const phraseFiles = import.meta.glob(
  "./Wiggle Woo Phrases/*_1.wav",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

// ---- Build letter map ----
const LETTER_SOUNDS: Record<string, string> = {};
for (const [path, url] of Object.entries(alphabetFiles)) {
  const match = path.match(/\/([A-Z])_1\.wav$/);
  if (match) LETTER_SOUNDS[match[1]] = url;
}

// ---- Phrase lookup helper ----
function findPhrase(needle: string): string {
  for (const [path, url] of Object.entries(phraseFiles)) {
    if (path.includes(needle)) return url;
  }
  return "";
}

// ---- Phrase pools ----
const SUCCESS_PHRASES = [
  findPhrase("Great Job"),
  findPhrase("Amazing"),
  findPhrase("Fantastic"),
  findPhrase("Nice work"),
  findPhrase("High five"),
  findPhrase("the right word"),
  findPhrase("Hooray"),
  findPhrase("You did it"),
  findPhrase("Way to Go"),
  findPhrase("reading scientist"),
  findPhrase("word star"),
  findPhrase("You nailed it"),
].filter(Boolean);

const ENCOURAGEMENT_PHRASES = [
  findPhrase("Keep Going"),
  findPhrase("build a word"),
].filter(Boolean);

const PROMPT_PHRASES = [
  findPhrase("Drag a letter"),
  findPhrase("build a word"),
].filter(Boolean);

const TAP_CARD_PHRASES = [
  findPhrase("Tap a card"),
].filter(Boolean);

const PROGRESSION_PHRASES = [
  findPhrase("Ready for the next"),
  findPhrase("level up"),
  findPhrase("try another one"),
].filter(Boolean);

const NEW_CHALLENGE_PHRASE = findPhrase("new challenge");
const MATCH_PHRASES = [findPhrase("match")].filter(Boolean);
const EXPLORE_PHRASES = [findPhrase("explore")].filter(Boolean);
const RETRY_PHRASES = [findPhrase("Try it again")].filter(Boolean);

// ---- Two-channel audio player ----
let letterAudio: HTMLAudioElement | null = null;
let phraseAudio: HTMLAudioElement | null = null;

function getLetterChannel(): HTMLAudioElement {
  if (!letterAudio) letterAudio = new Audio();
  return letterAudio;
}

function getPhraseChannel(): HTMLAudioElement {
  if (!phraseAudio) phraseAudio = new Audio();
  return phraseAudio;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let lastPhraseSrc = "";

function pickPhrase(pool: string[]): string {
  if (!pool.length) return "";
  if (pool.length <= 1) return pool[0];
  let choice: string;
  do { choice = pick(pool); } while (choice === lastPhraseSrc);
  lastPhraseSrc = choice;
  return choice;
}

// =============================================
// Public API
// =============================================

export function playLetterSound(letter: string): void {
  const src = LETTER_SOUNDS[letter.toUpperCase()];
  if (!src) return;
  const audio = getLetterChannel();
  audio.pause();
  audio.currentTime = 0;
  audio.src = src;
  audio.volume = 0.65;
  audio.playbackRate = document.documentElement.classList.contains("slow-phoneme") ? 0.7 : 1.0;
  audio.play().catch(() => {});
}

function playPhrase(src: string): void {
  if (!src) return;
  const audio = getPhraseChannel();
  audio.pause();
  audio.currentTime = 0;
  audio.src = src;
  audio.volume = 0.75;
  audio.play().catch(() => {});
}

export function playSuccessPhrase(): void {
  playPhrase(pickPhrase(SUCCESS_PHRASES));
}

export function playEncouragementPhrase(): void {
  playPhrase(pickPhrase(ENCOURAGEMENT_PHRASES));
}

export function playPromptPhrase(): void {
  playPhrase(pickPhrase(PROMPT_PHRASES));
}

export function playProgressionPhrase(): void {
  playPhrase(pickPhrase(PROGRESSION_PHRASES));
}

/** "Tap a card" — trophy room entry cue */
export function playTapCardPhrase(): void {
  playPhrase(pickPhrase(TAP_CARD_PHRASES));
}

export function playMatchPhrase(): void {
  playPhrase(pickPhrase(MATCH_PHRASES));
}

export function playExplorePhrase(): void {
  playPhrase(pickPhrase(EXPLORE_PHRASES));
}

export function playRetryPhrase(): void {
  playPhrase(pickPhrase(RETRY_PHRASES));
}

export function playNewChallengePhrase(): void {
  if (NEW_CHALLENGE_PHRASE) playPhrase(NEW_CHALLENGE_PHRASE);
}

export function stopAllSfx(): void {
  if (letterAudio) { letterAudio.pause(); letterAudio.currentTime = 0; }
  if (phraseAudio) { phraseAudio.pause(); phraseAudio.currentTime = 0; }
}
