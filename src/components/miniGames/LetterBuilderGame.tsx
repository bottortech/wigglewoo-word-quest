// =============================================
// LetterBuilderGame.tsx — Tap letters in order
// to build a CVC word
// =============================================
// Player sees the target word slots and themed
// carriers with letters. Must tap letters matching
// targetWord[0], then [1], then [2] in exact order.
// =============================================

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { ThemeConfig } from "../../game/discoveryMiniGames";
import MiniGameHeader from "./MiniGameHeader";

/** A round of letter builder challenges */
interface LetterBuilderRound {
  letters: string[];
  distractorLetters: string[];
  word: string;
}

interface LetterBuilderGameProps {
  round: LetterBuilderRound;
  theme: ThemeConfig;
  onComplete: () => void;
}

interface LetterCarrier {
  id: string;
  letter: string;
  x: number;
  y: number;
  delay: number;
}

const LetterBuilderGame: React.FC<LetterBuilderGameProps> = ({ round, theme, onComplete }) => {
  // Build carriers — correct letters + distractors, shuffled
  const carriers: LetterCarrier[] = useMemo(() => {
    const allLetters = [...round.letters, ...round.distractorLetters];
    const shuffled = allLetters
      .map((letter, i) => ({ letter, sort: Math.random(), origIdx: i }))
      .sort((a, b) => a.sort - b.sort);

    return shuffled.map((item, i) => ({
      id: `lb-${i}-${item.letter}`,
      letter: item.letter,
      x: 8 + i * (80 / shuffled.length) + Math.random() * 5,
      y: 25 + Math.random() * 40,
      delay: i * 0.2,
    }));
  }, [round]);

  // State
  const [builtLetters, setBuiltLetters] = useState<string[]>([]);
  const [usedCarrierIds, setUsedCarrierIds] = useState<Set<string>>(new Set());
  const [shakingId, setShakingId] = useState<string | null>(null);
  const nextIndexRef = useRef(0);
  const completed = useRef(false);

  // Target word for validation
  const targetLetters = round.letters; // e.g. ["n", "e", "t"]

  // Check completion
  useEffect(() => {
    if (builtLetters.length === targetLetters.length && !completed.current) {
      completed.current = true;
      const t = setTimeout(onComplete, 1000);
      return () => clearTimeout(t);
    }
  }, [builtLetters.length, targetLetters.length, onComplete]);

  const handleTap = useCallback((carrier: LetterCarrier) => {
    // Already used this carrier
    if (usedCarrierIds.has(carrier.id)) return;
    // Already complete
    if (nextIndexRef.current >= targetLetters.length) return;

    const expectedLetter = targetLetters[nextIndexRef.current];

    if (carrier.letter.toLowerCase() === expectedLetter.toLowerCase()) {
      // Correct letter in correct position
      nextIndexRef.current += 1;
      setBuiltLetters((prev) => [...prev, carrier.letter]);
      setUsedCarrierIds((prev) => new Set(prev).add(carrier.id));
    } else {
      // Wrong letter — shake feedback
      setShakingId(carrier.id);
      setTimeout(() => setShakingId(null), 500);
    }
  }, [targetLetters, usedCarrierIds]);

  const cfg = theme.letterBuilder;
  const wordComplete = builtLetters.length === targetLetters.length;

  // Available carriers (not yet used)
  const availableCarriers = carriers.filter((c) => !usedCarrierIds.has(c.id));

  return (
    <div className={`mg-game mg-game--letter-builder ${cfg.bgClass}`} style={{ background: theme.bgGradient }}>
      <MiniGameHeader
        title="Build the word!"
        subtitle="Tap the letters in order"
        accentColor={theme.accentColor}
      />

      {/* Built word display */}
      <div className={`mg-build-display ${wordComplete ? "mg-build-display--complete" : ""}`}>
        {targetLetters.map((_letter: string, i: number) => (
          <span
            key={i}
            className={`mg-build-slot ${i < builtLetters.length ? "mg-build-slot--filled" : ""}`}
          >
            {i < builtLetters.length ? builtLetters[i].toUpperCase() : "_"}
          </span>
        ))}
      </div>

      {/* Carrier field */}
      <div className="mg-builder-field">
        {availableCarriers.map((carrier) => (
          <button
            key={carrier.id}
            className={[
              "mg-carrier",
              `mg-carrier--${cfg.carrierType}`,
              `mg-carrier--${cfg.direction}`,
              shakingId === carrier.id ? "mg-carrier--shake" : "",
            ].filter(Boolean).join(" ")}
            style={{
              left: `${carrier.x}%`,
              top: `${carrier.y}%`,
              animationDelay: `${carrier.delay}s`,
              "--accent": theme.accentColor,
            } as React.CSSProperties}
            onClick={() => handleTap(carrier)}
          >
            {cfg.carrierImage ? (
              <img src={cfg.carrierImage} alt={cfg.carrierType} className="mg-carrier__image" />
            ) : (
              <span className="mg-carrier__emoji">{cfg.carrierEmoji}</span>
            )}
            <span className="mg-carrier__letter">{carrier.letter.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LetterBuilderGame;
