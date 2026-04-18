// =============================================
// RhymePopGame.tsx — Tap matching rhyme words
// =============================================
// Themed objects float with words inside.
// Player taps objects with words matching the
// target rhyme pattern. Correct = pop, wrong = wobble.
//
// IMPORTANT: No nested setState calls. Count is
// derived from items state to avoid StrictMode
// double-invoke issues.
// =============================================

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { RhymePopRound, ThemeConfig } from "../../game/discoveryMiniGames";
import MiniGameHeader from "./MiniGameHeader";
import { playWordSound } from "../../audio/SoundEffects";

interface RhymePopGameProps {
  round: RhymePopRound;
  theme: ThemeConfig;
  onComplete: () => void;
}

interface FloatingWord {
  id: string;
  word: string;
  isCorrect: boolean;
  x: number;
  y: number;
  delay: number;
  popped: boolean;
  wobbling: boolean;
}

const RhymePopGame: React.FC<RhymePopGameProps> = ({ round, theme, onComplete }) => {
  const initialWords: FloatingWord[] = useMemo(() => {
    const all = [
      ...round.correctWords.map((w) => ({ word: w, isCorrect: true })),
      ...round.distractorWords.map((w) => ({ word: w, isCorrect: false })),
    ].sort(() => Math.random() - 0.5);

    return all.slice(0, 9).map((w, i) => ({
      id: `rp-${i}`,
      ...w,
      x: 0,
      y: 0,
      delay: i * 0.1,
      popped: false,
      wobbling: false,
    }));
  }, [round]);

  const [items, setItems] = useState(initialWords);
  const [showHints, setShowHints] = useState(false);
  const totalCorrect = round.correctWords.length;
  const completed = useRef(false);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Derive correct count from items — single source of truth, no separate counter
  const correctCount = items.filter((i) => i.isCorrect && i.popped).length;

  // Check completion
  useEffect(() => {
    if (correctCount >= totalCorrect && !completed.current) {
      completed.current = true;
      const t = setTimeout(onComplete, 800);
      return () => clearTimeout(t);
    }
  }, [correctCount, totalCorrect, onComplete]);

  // Hint: after 5s of no taps, pulse remaining correct words
  useEffect(() => {
    if (completed.current) return;
    setShowHints(false);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setShowHints(true), 5000);
    return () => { if (hintTimerRef.current) clearTimeout(hintTimerRef.current); };
  }, [correctCount]);

  const handleTap = useCallback((id: string) => {
    if (completed.current) return;

    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      // Guard: already popped, or not found
      if (!item || item.popped) return prev;

      playWordSound(item.word);

      if (item.isCorrect) {
        // Pop it — this is the ONLY state change
        return prev.map((i) => i.id === id ? { ...i, popped: true } : i);
      } else {
        // Wrong — wobble
        setTimeout(() => {
          setItems((p) => p.map((i) => i.id === id ? { ...i, wobbling: false } : i));
        }, 600);
        return prev.map((i) => i.id === id ? { ...i, wobbling: true } : i);
      }
    });
  }, []);

  const cfg = theme.rhymePop;

  return (
    <div
      className={`mg-game mg-game--rhyme-pop ${cfg.bgClass}`}
      style={{ background: "transparent" }}
    >
      <MiniGameHeader
        title={`Pop the "${round.targetPattern}" words!`}
        subtitle="Tap the rhyming words"
        accentColor={theme.accentColor}
      />

      <div className="mg-rhyme-field">
        <div className="mg-play-board">
          <div className="mg-play-grid">
            {items.map((item) => (
              <div key={item.id} className="mg-grid-cell">
                {item.popped ? (
                  <div className={`mg-rhyme-pop-effect--grid ${cfg.popEffect}`}>⭐</div>
                ) : (
                  <button
                    className={[
                      "mg-rhyme-object--grid",
                      `mg-rhyme-object--${cfg.objectType}`,
                      cfg.objectImage ? "mg-rhyme-object--has-image" : "",
                      item.wobbling ? "mg-rhyme-object--wobble-grid" : "",
                      showHints && item.isCorrect && !item.popped ? "mg-rhyme-object--hint" : "",
                    ].filter(Boolean).join(" ")}
                    style={{
                      animationDelay: `${item.delay}s`,
                      "--accent": theme.accentColor,
                    } as React.CSSProperties}
                    onClick={() => handleTap(item.id)}
                  >
                    {cfg.objectImage && (
                      <img
                        src={cfg.objectImage}
                        alt=""
                        className="mg-rhyme-object__image"
                        draggable={false}
                      />
                    )}
                    <span className="mg-rhyme-object__word">{item.word}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mg-progress">
        {correctCount} / {totalCorrect}
      </div>
    </div>
  );
};

export default RhymePopGame;
