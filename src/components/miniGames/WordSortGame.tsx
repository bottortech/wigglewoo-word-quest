// =============================================
// WordSortGame.tsx — Sort words into rhyme
// family groups
// =============================================
// Words appear and player taps to place them
// into the correct rhyme family bin.
// =============================================

import React, { useState, useCallback, useMemo, useEffect } from "react";
import type { WordSortRound, ThemeConfig } from "../../game/discoveryMiniGames";
import MiniGameHeader from "./MiniGameHeader";

interface WordSortGameProps {
  round: WordSortRound;
  theme: ThemeConfig;
  onComplete: () => void;
}

interface SortableWord {
  id: string;
  word: string;
  correctGroup: string; // pattern
  sorted: boolean;
  wrongGuess: boolean;
}

const WordSortGame: React.FC<WordSortGameProps> = ({ round, theme, onComplete }) => {
  // Build shuffled word list from all groups
  const allWords: SortableWord[] = useMemo(() => {
    const words: SortableWord[] = [];
    round.groups.forEach((g) => {
      g.words.forEach((w, i) => {
        words.push({
          id: `ws-${g.pattern}-${i}`,
          word: w,
          correctGroup: g.pattern,
          sorted: false,
          wrongGuess: false,
        });
      });
    });
    return words.sort(() => Math.random() - 0.5);
  }, [round]);

  const [words, setWords] = useState(allWords);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [sortedCount, setSortedCount] = useState(0);
  const totalWords = allWords.length;

  // Bins — track what's been placed
  const [bins, setBins] = useState<Record<string, string[]>>(() => {
    const b: Record<string, string[]> = {};
    round.groups.forEach((g) => { b[g.pattern] = []; });
    return b;
  });

  // Check completion
  useEffect(() => {
    if (sortedCount >= totalWords) {
      const t = setTimeout(onComplete, 800);
      return () => clearTimeout(t);
    }
  }, [sortedCount, totalWords, onComplete]);

  // Select a word from the unsorted list
  const handleWordTap = useCallback((wordId: string) => {
    setSelectedWord(wordId);
  }, []);

  // Tap a bin to place the selected word
  const handleBinTap = useCallback((pattern: string) => {
    if (!selectedWord) return;

    setWords((prev) => prev.map((w) => {
      if (w.id !== selectedWord) return w;
      if (w.correctGroup === pattern) {
        // Correct!
        setBins((b) => ({ ...b, [pattern]: [...b[pattern], w.word] }));
        setSortedCount((c) => c + 1);
        setSelectedWord(null);
        return { ...w, sorted: true };
      } else {
        // Wrong bin — flash and deselect
        setTimeout(() => {
          setWords((p) => p.map((i) => i.id === w.id ? { ...i, wrongGuess: false } : i));
        }, 500);
        setSelectedWord(null);
        return { ...w, wrongGuess: true };
      }
    }));
  }, [selectedWord]);

  const cfg = theme.wordSort;
  const unsorted = words.filter((w) => !w.sorted);
  const currentWord = unsorted.length > 0 ? unsorted[0] : null;

  return (
    <div className={`mg-game mg-game--word-sort ${cfg.bgClass}`} style={{ background: "transparent" }}>
      <MiniGameHeader
        title="Sort the words!"
        subtitle="Tap the word, then tap the right group"
        accentColor={theme.accentColor}
      />

      {/* Centered panel — matches Game 1 layout */}
      <div className="mg-play-board">
        {/* Current word to sort */}
        <div className="mg-sort-current">
          {currentWord && (
            <button
              className={[
                "mg-sort-word",
                selectedWord === currentWord.id ? "mg-sort-word--selected" : "",
                currentWord.wrongGuess ? "mg-sort-word--wrong" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => handleWordTap(currentWord.id)}
              style={{ "--accent": theme.accentColor } as React.CSSProperties}
            >
              {cfg.itemImage ? (
                <img src={cfg.itemImage} alt={cfg.itemType} className="mg-sort-word__image" />
              ) : (
                <span className="mg-sort-word__emoji">{cfg.itemEmoji}</span>
              )}
              <span className="mg-sort-word__text">{currentWord.word}</span>
            </button>
          )}
          {!currentWord && (
            <div className="mg-sort-complete">All sorted!</div>
          )}
        </div>

        {/* Sorting bins */}
        <div className="mg-sort-bins">
          {round.groups.map((group) => (
            <button
              key={group.pattern}
              className="mg-sort-bin"
              onClick={() => handleBinTap(group.pattern)}
              style={{ "--accent": theme.accentColor } as React.CSSProperties}
            >
              {cfg.binImage ? (
                <img src={cfg.binImage} alt={cfg.binType} className="mg-sort-bin__image" />
              ) : (
                <span className="mg-sort-bin__emoji">{cfg.binEmoji}</span>
              )}
              <span className="mg-sort-bin__label">{group.pattern}</span>
              <span className="mg-sort-bin__count">
                {bins[group.pattern]?.length ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mg-progress">
        {sortedCount} / {totalWords}
      </div>
    </div>
  );
};

export default WordSortGame;
