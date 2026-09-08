// =============================================
// FactNarration.tsx — Fact audio narration player
// WiggleWoo's Word Quest
// =============================================
// Plays pre-recorded audio for discovery facts.
// Falls back to Web Speech API if audio file missing.
// Supports play, replay, and autoplay on open.
// =============================================

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { loadSettings } from "../game/settings";

interface FactNarrationProps {
  text: string;
  audioSrc?: string;
  /** The fact's title/name, if the audio recording speaks it before
   *  reading `text` (it does, for these voice-actor files). Used only to
   *  estimate how much of the audio's duration is "used up" before the
   *  fact sentence itself starts, so word-by-word highlighting of `text`
   *  doesn't start too early and drift out of sync. Never rendered. */
  titleText?: string;
  autoPlay?: boolean;
  /** Fires once the narration audio finishes playing naturally. */
  onEnded?: () => void;
}

/** Word-by-word highlight pacing when the audio's real duration isn't known
 *  yet (fallback only — normally we pace evenly across audio.duration). */
const FALLBACK_MS_PER_WORD = 380;

/** After the narration audio finishes, wait this many ms before firing
 *  `onEnded` so the kid has time to actually read the fact text. The window
 *  scales with text length but never drops below the floor. */
const READ_DWELL_MS_PER_CHAR = 50;
const READ_DWELL_FLOOR_MS = 2000;
function computeDwellMs(text: string): number {
  return Math.max(READ_DWELL_FLOOR_MS, text.length * READ_DWELL_MS_PER_CHAR);
}

// Module-level singleton Audio element shared across every FactNarration
// instance. iOS Safari only "primes" Audio elements that have been touched
// by a user gesture — creating a fresh `new Audio()` per fact means each
// new fact's element is un-primed and `.play()` silently rejects. Sharing
// one element keeps the gesture-priming intact across the whole session.
let narrationAudio: HTMLAudioElement | null = null;
function getNarrationAudio(): HTMLAudioElement {
  if (!narrationAudio) narrationAudio = new Audio();
  return narrationAudio;
}

const FactNarration: React.FC<FactNarrationProps> = ({ text, audioSrc, titleText, autoPlay = false, onEnded }) => {
  const [playing, setPlaying] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const titleOffsetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settings = loadSettings();
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const titleWordCount = useMemo(
    () => (titleText ? titleText.split(/\s+/).filter(Boolean).length : 0),
    [titleText]
  );

  const stopHighlight = useCallback(() => {
    if (highlightTimerRef.current) {
      clearInterval(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }
    if (titleOffsetTimerRef.current) {
      clearTimeout(titleOffsetTimerRef.current);
      titleOffsetTimerRef.current = null;
    }
  }, []);

  // Advances the highlighted word on a timer paced evenly across the
  // audio's actual duration. There's no per-word timestamp data for these
  // pre-recorded voice-actor files (and no TTS boundary events to hook —
  // narration deliberately moved away from Web Speech API), so this is an
  // estimate rather than a frame-accurate sync. It reads naturally enough
  // for a read-along effect without needing hand-authored timing per fact.
  //
  // The recordings speak the fact's TITLE before the fact text itself, so
  // the per-word pace is estimated across (title words + text words) —
  // otherwise dividing the full audio duration by only the text's word
  // count overestimates each word's share and the highlight drifts later
  // and later. Highlighting of `text` itself only starts once that
  // estimated title-speaking segment has elapsed.
  const startHighlight = useCallback((durationSec: number) => {
    stopHighlight();
    if (words.length === 0) return;
    const totalUnits = titleWordCount + words.length;
    const perWordMs = durationSec && isFinite(durationSec) && durationSec > 0
      ? Math.max(120, (durationSec * 1000) / totalUnits)
      : FALLBACK_MS_PER_WORD;

    const beginTextHighlight = () => {
      setActiveWordIndex(0);
      if (words.length === 1) return;
      let i = 0;
      highlightTimerRef.current = setInterval(() => {
        i += 1;
        if (i >= words.length) {
          stopHighlight();
          return;
        }
        setActiveWordIndex(i);
      }, perWordMs);
    };

    const titleOffsetMs = titleWordCount * perWordMs;
    if (titleOffsetMs > 0) {
      titleOffsetTimerRef.current = window.setTimeout(beginTextHighlight, titleOffsetMs);
    } else {
      beginTextHighlight();
    }
  }, [words.length, titleWordCount, stopHighlight]);

  // Don't render if narration is disabled — still show the plain fact text
  // (previously owned by the parent) so turning narration off doesn't also
  // hide the fact itself.
  if (!settings.factNarration) {
    return <p className="fact-panel__item-fact">{text}</p>;
  }

  const play = useCallback(() => {
    if (playing) return;

    if (audioSrc) {
      const audio = getNarrationAudio();
      audio.src = audioSrc;
      audio.volume = 0.8;
      audio.playbackRate = settings.slowPhoneme ? 0.75 : 1.0;
      const startedAt = Date.now();
      setPlaying(true);
      audio.play().then(() => {
        startHighlight(audio.duration);
      }).catch(() => {
        setPlaying(false);
      });
      audio.onended = () => {
        setPlaying(false);
        stopHighlight();
        setActiveWordIndex(-1);
        // Hold off the onEnded callback so a kid can finish reading the
        // text before any downstream "reaction" VO fires. Total dwell scales
        // with the text length and is measured from when audio started, so
        // long narrations don't double-pay.
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, computeDwellMs(text) - elapsed);
        if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
        dwellTimerRef.current = setTimeout(() => {
          onEnded?.();
          dwellTimerRef.current = null;
        }, remaining);
      };
      audio.onerror = () => {
        setPlaying(false);
        stopHighlight();
        setActiveWordIndex(-1);
      };
    }
    // TTS fallback disabled — will be replaced with voice actor recordings
  }, [audioSrc, text, playing, settings.slowPhoneme, onEnded, startHighlight, stopHighlight]);

  const stop = useCallback(() => {
    if (narrationAudio) {
      narrationAudio.pause();
      narrationAudio.currentTime = 0;
      // Drop callbacks so a late `ended` event from the previous fact
      // doesn't fire the new fact's onEnded.
      narrationAudio.onended = null;
      narrationAudio.onerror = null;
    }
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
    stopHighlight();
    setActiveWordIndex(-1);
    setPlaying(false);
  }, [stopHighlight]);

  // Autoplay on mount when autoPlay prop is true
  useEffect(() => {
    if (autoPlay) {
      const timer = setTimeout(() => play(), 300);
      return () => clearTimeout(timer);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stop();
  }, [stop]);

  return (
    <>
      <p className="fact-panel__item-fact">
        {words.map((word, idx) => (
          <span
            key={idx}
            className={idx === activeWordIndex ? "fact-word fact-word--active" : "fact-word"}
          >
            {word}{idx < words.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
      <button
        className="fact-narration-btn"
        onClick={playing ? stop : play}
        aria-label={playing ? "Stop narration" : "Play narration"}
      >
        {playing ? "⏹" : "🔊"}
      </button>
    </>
  );
};

export default FactNarration;
