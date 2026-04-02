// =============================================
// VowelBuilderGame.tsx — Missing vowel CVC builder
// =============================================
// Shows a CVC word with the vowel missing:
//   C _ T  →  player taps A  →  CAT
//
// 3 words per round. 5 vowel choices (A E I O U).
// Only the correct vowel advances.
// =============================================

import React, { useState, useCallback, useEffect, useRef } from "react";
import type { ThemeConfig } from "../../game/discoveryMiniGames";
import MiniGameHeader from "./MiniGameHeader";

/** Word entry for the vowel builder mini-game */
interface VowelBuilderWord {
  word: string;
  consonants: [string, string];
  correctVowel: string;
}

/** A round of vowel builder challenges */
interface VowelBuilderRound {
  words: VowelBuilderWord[];
}

interface VowelBuilderGameProps {
  round: VowelBuilderRound;
  theme: ThemeConfig;
  onComplete: () => void;
}

const VOWELS = ["a", "e", "i", "o", "u"];

const VowelBuilderGame: React.FC<VowelBuilderGameProps> = ({ round, theme, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrongVowel, setWrongVowel] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const completed = useRef(false);
  const totalWords = round.words.length;

  const currentWord = currentIndex < totalWords ? round.words[currentIndex] : null;

  // Check full completion
  useEffect(() => {
    if (currentIndex >= totalWords && !completed.current) {
      completed.current = true;
      const t = setTimeout(onComplete, 800);
      return () => clearTimeout(t);
    }
  }, [currentIndex, totalWords, onComplete]);

  const handleVowelTap = useCallback((vowel: string) => {
    if (!currentWord || solved || completed.current) return;

    if (vowel.toLowerCase() === currentWord.correctVowel.toLowerCase()) {
      // Correct!
      setSolved(true);
      setShowSuccess(true);
      setWrongVowel(null);

      // Brief success display, then advance to next word
      setTimeout(() => {
        setSolved(false);
        setShowSuccess(false);
        setCurrentIndex((i) => i + 1);
      }, 1200);
    } else {
      // Wrong — gentle shake feedback
      setWrongVowel(vowel);
      setTimeout(() => setWrongVowel(null), 500);
    }
  }, [currentWord, solved]);

  return (
    <div className="mg-game mg-game--vowel-builder" style={{ background: "transparent" }}>
      <MiniGameHeader
        title="Find the missing vowel!"
        subtitle="Tap the right vowel to complete the word"
        accentColor={theme.accentColor}
      />

      {currentWord && (
        <>
          {/* Word display with missing vowel */}
          <div className={`mg-vowel-word ${showSuccess ? "mg-vowel-word--correct" : ""}`}>
            <span className="mg-vowel-letter">{currentWord.consonants[0].toUpperCase()}</span>
            <span className={`mg-vowel-blank ${solved ? "mg-vowel-blank--filled" : ""}`}>
              {solved ? currentWord.correctVowel.toUpperCase() : "?"}
            </span>
            <span className="mg-vowel-letter">{currentWord.consonants[1].toUpperCase()}</span>
          </div>

          {/* Success: show the full word */}
          {showSuccess && (
            <div className="mg-vowel-success">
              {currentWord.word.toUpperCase()}!
            </div>
          )}

          {/* Vowel choices */}
          {!solved && (
            <div className="mg-vowel-choices">
              {VOWELS.map((v) => (
                <button
                  key={v}
                  className={[
                    "mg-vowel-btn",
                    wrongVowel === v ? "mg-vowel-btn--wrong" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => handleVowelTap(v)}
                  style={{ "--accent": theme.accentColor } as React.CSSProperties}
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Progress */}
      <div className="mg-progress">
        {Math.min(currentIndex + (solved ? 1 : 0), totalWords)} / {totalWords}
      </div>
    </div>
  );
};

export default VowelBuilderGame;
