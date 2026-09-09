// =============================================
// WordTacToeScreen.tsx — Phonics-gated tic-tac-toe
// Wigglewoo CVC Quest
// =============================================
// The child first chooses to play as teal X or orange O — WiggleWoo (CPU)
// takes whichever mark is left. That choice drives everything downstream:
// board markers, the instruction-bar portrait, turn feedback, the win/lose
// text, and the CPU's own move logic — nothing assumes the child is X.
//
// Tapping an empty square triggers a phonics challenge (missing-letter or
// word-picture-match, chosen at random); a correct answer places the
// child's mark. Wrong answers never cost the turn — the same challenge
// just stays open for another try, with a hint (one wrong option removed)
// after 2 misses. A quiet "N in a row!" streak chip rewards consecutive
// first-try-correct answers; it isn't a persistent scoreboard.
//
// CPU plays immediately after the child, "soft" difficulty: mostly random,
// occasionally smart (take a win, else block the child's win).
//
// Fully self-contained, mirroring CrossMatchScreen.tsx's pattern — owns
// all state internally, reports back to the caller via onComplete/onBack
// only. Used both from the Quest Map (main build, has a Back button) and
// as a kiosk interlude (no Back button — see App.tsx's kiosk wiring). Same
// taught flow — choose a mark, tap-a-square prompt, challenge, placement,
// CPU turn — in both builds.
// =============================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CvcWord } from "../game/types";
import { playWordSound, playSuccessPhrase, playEvent } from "../audio/SoundEffects";
import continueQuestBtn from "../assets/cont_quest.png";
import wigglewooX from "../assets/wigglewoo_X.png";
import wigglewooO from "../assets/wigglewoo_O.png";
import "../styles/word-tac-toe.css";

interface WordTacToeScreenProps {
  /** Challenge pool — the active quest's full word list. */
  words: CvcWord[];
  /** Fires after the win/lose/tie celebration finishes. */
  onComplete: () => void;
  /** Quit mid-game. Omit entirely to hide the Back button (kiosk mode). */
  onBack?: () => void;
}

type Mark = "X" | "O";
type Cell = Mark | null;
type ChallengeType = "missing-letter" | "word-picture-match";
type GameResult = "win" | "lose" | "tie" | null;

interface Challenge {
  type: ChallengeType;
  word: CvcWord;
  blankIndex?: number; // missing-letter only
  options: string[];
  correctIndex: number;
}

const MARK_ASSET: Record<Mark, string> = { X: wigglewooX, O: wigglewooO };

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const FALLBACK_LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

function checkWinner(board: Cell[]): Cell {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

function findWinningMove(board: Cell[], player: Mark): number | null {
  for (let i = 0; i < board.length; i++) {
    if (board[i] !== null) continue;
    const clone = [...board];
    clone[i] = player;
    if (checkWinner(clone) === player) return i;
  }
  return null;
}

/** ~30% "smart" (win if possible, else block), otherwise random. Tune after playtesting. */
const CPU_SMART_CHANCE = 0.3;

function cpuChooseMove(board: Cell[], cpuMark: Mark, childMark: Mark): number | null {
  const empties = board.reduce<number[]>((acc, v, i) => (v === null ? [...acc, i] : acc), []);
  if (empties.length === 0) return null;
  if (Math.random() < CPU_SMART_CHANCE) {
    const winMove = findWinningMove(board, cpuMark);
    if (winMove !== null) return winMove;
    const blockMove = findWinningMove(board, childMark);
    if (blockMove !== null) return blockMove;
  }
  return empties[Math.floor(Math.random() * empties.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Build a missing-letter challenge from a word: blank one letter, offer
 *  the correct letter plus its own distractors (padded with random
 *  letters if the word has fewer than 2). */
function buildMissingLetterChallenge(word: CvcWord): Challenge {
  const blankIndex = Math.floor(Math.random() * word.letters.length);
  const correct = word.letters[blankIndex];
  const wrong: string[] = [...word.distractors];
  while (wrong.length < 2) {
    const candidate = FALLBACK_LETTERS[Math.floor(Math.random() * FALLBACK_LETTERS.length)];
    if (candidate !== correct && !wrong.includes(candidate) && !word.letters.includes(candidate)) {
      wrong.push(candidate);
    }
  }
  const options = shuffle([correct, ...wrong.slice(0, 2)]);
  return { type: "missing-letter", word, blankIndex, options, correctIndex: options.indexOf(correct) };
}

/** Build a word-picture-match challenge: show the picture, offer the
 *  correct word plus 2 distractor words sampled from the rest of the pool. */
function buildWordPictureChallenge(word: CvcWord, pool: CvcWord[]): Challenge {
  const others = shuffle(pool.filter((w) => w.word !== word.word)).slice(0, 2).map((w) => w.word);
  const options = shuffle([word.word, ...others]);
  return { type: "word-picture-match", word, options, correctIndex: options.indexOf(word.word) };
}

const WordTacToeScreen: React.FC<WordTacToeScreenProps> = ({ words, onComplete, onBack }) => {
  // ---- Mark selection — drives everything below. Null until chosen. ----
  const [childMark, setChildMark] = useState<Mark | null>(null);
  const cpuMark: Mark | null = childMark ? (childMark === "X" ? "O" : "X") : null;

  // Shuffled once on mount; popped one per move (up to 9 unique challenges).
  const wordQueue = useRef<CvcWord[]>(shuffle(words));
  const nextWord = useCallback(() => {
    if (wordQueue.current.length === 0) wordQueue.current = shuffle(words);
    return wordQueue.current.shift()!;
  }, [words]);

  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<"child" | "cpu">("child");
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const wrongAttemptsRef = useRef(0);
  const [eliminated, setEliminated] = useState<Set<number>>(new Set());
  const [wrongOption, setWrongOption] = useState<number | null>(null);
  const [result, setResult] = useState<GameResult>(null);
  const [streak, setStreak] = useState(0);
  // Brief "Correct!" pause in the side panel before the mark actually
  // places — gives the answer a visible moment to land instead of the
  // mark just appearing instantly on tap.
  const [correctFeedback, setCorrectFeedback] = useState(false);

  // Intro VO, once the child has committed to a mark and play begins.
  useEffect(() => {
    if (!childMark) return;
    const t = setTimeout(() => playEvent("word-tac-toe-intro"), 400);
    return () => clearTimeout(t);
  }, [childMark]);

  const handleChooseMark = useCallback((mark: Mark) => {
    setChildMark(mark);
  }, []);

  const startChallenge = useCallback((cellIndex: number) => {
    const word = nextWord();
    const built = Math.random() < 0.5
      ? buildMissingLetterChallenge(word)
      : buildWordPictureChallenge(word, words);
    setActiveCell(cellIndex);
    setChallenge(built);
    wrongAttemptsRef.current = 0;
    setEliminated(new Set());
    playWordSound(word.word);
  }, [nextWord, words]);

  const handleCellTap = useCallback((index: number) => {
    if (board[index] !== null || challenge !== null || turn !== "child" || result !== null) return;
    startChallenge(index);
  }, [board, challenge, turn, result, startChallenge]);

  const runCpuTurn = useCallback((currentBoard: Cell[], cpu: Mark, child: Mark) => {
    setTimeout(() => {
      const move = cpuChooseMove(currentBoard, cpu, child);
      if (move === null) return; // board full — draw already handled by caller
      const next = [...currentBoard];
      next[move] = cpu;
      setBoard(next);
      const winner = checkWinner(next);
      if (winner === cpu) {
        setResult("lose");
      } else if (next.every((c) => c !== null)) {
        setResult("tie");
      } else {
        setTurn("child");
      }
    }, 550);
  }, []);

  const handleOptionTap = useCallback((optionIndex: number) => {
    if (!challenge || activeCell === null || !childMark || !cpuMark) return;
    if (optionIndex === challenge.correctIndex) {
      playSuccessPhrase();
      setCorrectFeedback(true);
      const cellIndex = activeCell;
      setTimeout(() => {
        setCorrectFeedback(false);
        const next = [...board];
        next[cellIndex] = childMark;
        setBoard(next);
        setChallenge(null);
        setActiveCell(null);
        setStreak((s) => (wrongAttemptsRef.current === 0 ? s + 1 : 0));
        const winner = checkWinner(next);
        if (winner === childMark) {
          setResult("win");
        } else if (next.every((c) => c !== null)) {
          setResult("tie");
        } else {
          setTurn("cpu");
          runCpuTurn(next, cpuMark, childMark);
        }
      }, 700);
    } else {
      playEvent("wrong-gentle");
      setWrongOption(optionIndex);
      setTimeout(() => setWrongOption(null), 500);
      wrongAttemptsRef.current += 1;
      if (wrongAttemptsRef.current >= 2) {
        // Hint: eliminate one incorrect, not-yet-eliminated option.
        setEliminated((prevElim) => {
          const wrongIndices = challenge.options
            .map((_, i) => i)
            .filter((i) => i !== challenge.correctIndex && !prevElim.has(i));
          if (wrongIndices.length === 0) return prevElim;
          const pick = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
          return new Set(prevElim).add(pick);
        });
      }
    }
  }, [challenge, activeCell, board, childMark, cpuMark, runCpuTurn]);

  // End-of-game VO + auto-exit (mirrors CrossMatchScreen's celebration timer).
  const autoExitRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!result) return;
    playEvent(
      result === "win" ? "word-tac-toe-win"
        : result === "lose" ? "word-tac-toe-lose"
          : "word-tac-toe-tie"
    );
    autoExitRef.current = setTimeout(() => onComplete(), 4500);
    return () => {
      if (autoExitRef.current) clearTimeout(autoExitRef.current);
    };
  }, [result, onComplete]);

  const handleContinue = useCallback(() => {
    if (autoExitRef.current) {
      clearTimeout(autoExitRef.current);
      autoExitRef.current = null;
    }
    onComplete();
  }, [onComplete]);

  const resultText = result === "win" ? "🌟 You got three in a row! 🌟"
    : result === "lose" ? "So close! Want to play again?"
      : result === "tie" ? "It's a tie — great game!"
        : "";

  // ---- Instruction-bar copy + which mark's portrait is "speaking" ----
  const speakingMark: Mark | null = turn === "child" ? childMark : cpuMark;
  const instructionText = useMemo(() => {
    if (challenge) {
      return challenge.type === "missing-letter"
        ? "Choose the missing letter!"
        : "Which word matches the picture?";
    }
    if (turn === "cpu") return "My turn!";
    return "Tap a square to make your move!";
  }, [challenge, turn]);

  // ---- Screen 1: choose your piece ----
  if (!childMark) {
    return (
      <div className="wtt wtt--choose">
        <h1 className="wtt-choose__title">Choose your piece!</h1>
        <div className="wtt-choose__cards">
          <button
            className="wtt-choose__card wtt-choose__card--x"
            onClick={() => handleChooseMark("X")}
            aria-label="Play as X"
          >
            <img src={wigglewooX} alt="" className="wtt-choose__mascot" draggable={false} />
            <span className="wtt-choose__label">Play as X</span>
          </button>
          <button
            className="wtt-choose__card wtt-choose__card--o"
            onClick={() => handleChooseMark("O")}
            aria-label="Play as O"
          >
            <img src={wigglewooO} alt="" className="wtt-choose__mascot" draggable={false} />
            <span className="wtt-choose__label">Play as O</span>
          </button>
        </div>
        {onBack && (
          <button className="wtt__back-btn wtt__back-btn--choose" onClick={onBack} aria-label="Back to map">✕</button>
        )}
      </div>
    );
  }

  // ---- Screen 2: the board ----
  return (
    <div className="wtt">
      {streak >= 2 && (
        <div className="wtt__streak-chip" key={streak}>⭐ {streak} in a row!</div>
      )}
      {onBack && (
        <button className="wtt__back-btn" onClick={onBack} aria-label="Back to map">✕</button>
      )}

      <div className="wtt__stage">
        <div className="wtt__board-col">
          <div className="wtt__board">
            <div className="wtt__grid">
              {board.map((cell, i) => (
                <button
                  key={i}
                  className={[
                    "wtt__cell",
                    cell ? "wtt__cell--filled" : "wtt__cell--empty",
                    activeCell === i ? "wtt__cell--active" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => handleCellTap(i)}
                  disabled={cell !== null || turn !== "child" || result !== null}
                  aria-label={cell ? `Square ${i + 1}, ${cell}` : `Square ${i + 1}, empty`}
                >
                  {cell && <img src={MARK_ASSET[cell]} alt={cell} className="wtt__piece" draggable={false} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right side panel — always present, never covers the board.
            Three internal states: idle (waiting for a tap), the active
            challenge, and a brief "Correct!" pause before the mark places. */}
        <div className="wtt__panel">
          {correctFeedback ? (
            <div className="wtt__panel-feedback wtt__panel-feedback--correct">
              <span className="wtt__panel-feedback-icon">✅</span>
              <span>Correct!</span>
            </div>
          ) : challenge ? (
            <div className="wtt__panel-challenge">
              <div className="wtt__panel-question">{instructionText}</div>
              {challenge.type === "missing-letter" ? (
                <>
                  <div className="wtt__prompt">
                    {challenge.word.letters.map((l, i) => (
                      <span key={i} className="wtt__prompt-letter">
                        {i === challenge.blankIndex ? "_" : l.toUpperCase()}
                      </span>
                    ))}
                  </div>
                  <div className="wtt__options">
                    {challenge.options.map((opt, i) => (
                      !eliminated.has(i) && (
                        <button
                          key={i}
                          className={["wtt__option", wrongOption === i ? "wtt__option--wrong" : ""].join(" ")}
                          onClick={() => handleOptionTap(i)}
                        >
                          {opt.toUpperCase()}
                        </button>
                      )
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <img
                    className="wtt__prompt-picture"
                    src={`/assets/words/${challenge.word.word}.png`}
                    alt=""
                    draggable={false}
                    onError={(e) => { (e.target as HTMLImageElement).style.visibility = "hidden"; }}
                  />
                  <div className="wtt__options wtt__options--words">
                    {challenge.options.map((opt, i) => (
                      !eliminated.has(i) && (
                        <button
                          key={i}
                          className={["wtt__option", "wtt__option--word", wrongOption === i ? "wtt__option--wrong" : ""].join(" ")}
                          onClick={() => handleOptionTap(i)}
                        >
                          {opt.toUpperCase()}
                        </button>
                      )
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="wtt__panel-idle">
              {speakingMark && (
                <img src={MARK_ASSET[speakingMark]} alt="" className="wtt__panel-idle-mascot" draggable={false} />
              )}
              <span className="wtt__panel-idle-text">{instructionText}</span>
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="wtt__celebration" aria-live="polite">
          <span className="wtt__celebration-text">{resultText}</span>
          <button className="wtt__continue-btn" onClick={handleContinue} aria-label="Continue">
            <img src={continueQuestBtn} alt="Continue" draggable={false} />
          </button>
        </div>
      )}
    </div>
  );
};

export default WordTacToeScreen;
