// =============================================
// FactNarration.tsx — Fact audio narration player
// WiggleWoo's Word Quest
// =============================================
// Plays pre-recorded audio for discovery facts.
// Falls back to Web Speech API if audio file missing.
// Supports play, replay, and autoplay on open.
// =============================================

import { useState, useEffect, useRef, useCallback } from "react";
import { loadSettings } from "../game/settings";

interface FactNarrationProps {
  text: string;
  audioSrc?: string;
  autoPlay?: boolean;
  /** Fires once the narration audio finishes playing naturally. */
  onEnded?: () => void;
}

/** After the narration audio finishes, wait this many ms before firing
 *  `onEnded` so the kid has time to actually read the fact text. The window
 *  scales with text length but never drops below the floor. */
const READ_DWELL_MS_PER_CHAR = 50;
const READ_DWELL_FLOOR_MS = 2000;
function computeDwellMs(text: string): number {
  return Math.max(READ_DWELL_FLOOR_MS, text.length * READ_DWELL_MS_PER_CHAR);
}

const FactNarration: React.FC<FactNarrationProps> = ({ text, audioSrc, autoPlay = false, onEnded }) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settings = loadSettings();

  // Don't render if narration is disabled
  if (!settings.factNarration) return null;

  const play = useCallback(() => {
    if (playing) return;

    if (audioSrc) {
      // Use pre-recorded audio
      if (!audioRef.current) audioRef.current = new Audio();
      const audio = audioRef.current;
      audio.src = audioSrc;
      audio.volume = 0.8;
      audio.playbackRate = settings.slowPhoneme ? 0.75 : 1.0;
      const startedAt = Date.now();
      setPlaying(true);
      audio.play().catch(() => {
        setPlaying(false);
      });
      audio.onended = () => {
        setPlaying(false);
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
      };
    }
    // TTS fallback disabled — will be replaced with voice actor recordings
  }, [audioSrc, text, playing, settings.slowPhoneme, onEnded]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
    setPlaying(false);
  }, []);

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
    <button
      className="fact-narration-btn"
      onClick={playing ? stop : play}
      aria-label={playing ? "Stop narration" : "Play narration"}
    >
      {playing ? "⏹" : "🔊"}
    </button>
  );
};

export default FactNarration;
