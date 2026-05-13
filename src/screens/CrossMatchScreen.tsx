// =============================================
// CrossMatchScreen.tsx — Mid-quest review activity
// Wigglewoo CVC Quest
// =============================================
// After every 4 quest nodes (checkpoints 4 and 12), the player reviews the
// 4 words they just learned by drag-matching each WORD on the left to its
// PICTURE on the right. Pictures are shuffled. Wrong matches snap back with
// a gentle shake; correct matches lock in. All 4 → short celebration, exit.
// =============================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CvcWord } from "../game/types";
import {
  playWordSound,
  playMatchPhrase,
  playEvent,
} from "../audio/SoundEffects";
import continueQuestBtn from "../assets/cont_quest.png";
import { getActiveSkinAssets } from "../game/skins";
import "../styles/cross-match.css";

type WigglewooReaction = "idle" | "watching" | "happy" | "encourage" | "celebrate";

// Submarine-monitor phrase pools.
// Per-match "system" phrases keep the green CRT screen alive in-world
// (it should read like the sub computer responding to the player's actions,
// not a UI toast). Final celebration uses warmer emotional praise.
const SYSTEM_PHRASES = [
  "MATCH CONFIRMED",
  "LOCKED IN",
  "TARGET FOUND",
  "CONNECTION STABLE",
  "SIGNAL RECEIVED",
  "TARGET LOCKED",
  "SIGNAL STABLE",
  "CONNECTION VERIFIED",
];
const CELEBRATION_PHRASES = [
  "AMAZING WORK!",
  "GREAT JOB!",
  "MISSION COMPLETE!",
  "FANTASTIC!",
];

type MonitorPhrase = {
  id: number;
  text: string;
  category: "system" | "celebration";
};

interface CrossMatchScreenProps {
  /** The 4 words being reviewed at this checkpoint (in original order). */
  words: CvcWord[];
  /** Called once all 4 are correctly matched and the celebration finishes. */
  onComplete: () => void;
}

interface Anchor {
  /** Center coords (in viewport pixels) of the slot's connector point. */
  x: number;
  y: number;
}

// Fisher-Yates shuffle, returns a new array
function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const CrossMatchScreen: React.FC<CrossMatchScreenProps> = ({ words, onComplete }) => {
  // Fix the picture-side order once on mount.
  const pictureOrder = useMemo(() => {
    const shuffled = shuffleArray(words.map((w) => w.word));
    // Guarantee not identical to the word-side order (avoids "1-to-1 line" cheats)
    if (shuffled.every((w, i) => w === words[i].word) && shuffled.length > 1) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }
    return shuffled;
  }, [words]);

  // Refs so we can read up-to-date connector positions on resize / scroll.
  const wordRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const pictureRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const stageRef = useRef<HTMLDivElement>(null);

  // Active skin's helper asset — same image for every reaction state;
  // the bounce/wiggle/celebrate animations live in cross-match.css
  // keyed off the wrapper's reaction-state class.
  const skinAssets = useMemo(() => getActiveSkinAssets(), []);

  // Set of words that are correctly matched (by word string).
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongPicture, setWrongPicture] = useState<string | null>(null);

  // Drag state
  const [dragWord, setDragWord] = useState<string | null>(null);
  const [dragFrom, setDragFrom] = useState<Anchor | null>(null);
  const [dragTo, setDragTo] = useState<Anchor | null>(null);
  // Picture currently under the pointer during a drag (drop-target preview).
  const [hoveredTarget, setHoveredTarget] = useState<string | null>(null);
  const dragPointerId = useRef<number | null>(null);

  /** Pixels of invisible padding around each picture tile, so the kid's
   *  finger doesn't have to land precisely on the small image. */
  const HITBOX_PADDING = 14;

  const [showCelebration, setShowCelebration] = useState(false);

  /** Active line on the submarine CRT monitor. `id` ensures React remounts
   *  the text on every flash, so the type-on animation replays even when
   *  the same phrase repeats. */
  const [monitorPhrase, setMonitorPhrase] = useState<MonitorPhrase | null>(null);
  const monitorIdRef = useRef(0);
  const monitorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Pick a random phrase from the right pool, push it onto the monitor,
   *  and auto-clear after the type-on + hold + fade window. */
  const flashMonitor = useCallback((category: "system" | "celebration") => {
    const pool = category === "system" ? SYSTEM_PHRASES : CELEBRATION_PHRASES;
    const text = pool[Math.floor(Math.random() * pool.length)];
    monitorIdRef.current += 1;
    setMonitorPhrase({ id: monitorIdRef.current, text, category });
    if (monitorTimerRef.current) clearTimeout(monitorTimerRef.current);
    // System: 0.5s type + 1.6s hold + 0.3s fade = 2.4s
    // Celebration: holds longer so the win feels weightier
    const lifeMs = category === "celebration" ? 3200 : 2400;
    monitorTimerRef.current = setTimeout(() => {
      setMonitorPhrase(null);
      monitorTimerRef.current = null;
    }, lifeMs);
  }, []);

  /** Transient WW reaction set on correct/wrong matches; auto-cleared after a
   *  short window so we fall back to the natural state (watching / idle /
   *  celebrate) computed below. */
  const [reactionOverride, setReactionOverride] = useState<"happy" | "encourage" | null>(null);

  /** Effective WW reaction — override wins, otherwise derived from drag /
   *  celebration state. Drives both the image swap and the CSS animation. */
  const wwReaction: WigglewooReaction =
    reactionOverride ??
    (showCelebration ? "celebrate" :
      dragWord ? "watching" :
        "idle");

  // Greet on first mount with the cross-match-specific intro line
  // ("Drag the word to its picture!"). Replaces the trophy-room "Tap a card!"
  // phrase that used to live here. File lands at
  // /assets/audio/events/cross-match-intro.m4a — silent until then.
  useEffect(() => {
    const t = setTimeout(() => playEvent("cross-match-intro"), 400);
    return () => clearTimeout(t);
  }, []);

  // When all 4 are matched → flip into celebration mode. (Note: this effect
  // only triggers the state flip; the completion timer lives in its own
  // effect below — keeping them separate avoids the timer being cancelled
  // by the very state change it depends on.)
  useEffect(() => {
    if (matched.size === words.length && !showCelebration) {
      setShowCelebration(true);
      // Cross-match-specific completion VO; file lands at
      // /assets/audio/events/cross-match-complete.m4a — silent until then.
      playEvent("cross-match-complete");
      // Bigger emotional praise on the submarine monitor for the win.
      flashMonitor("celebration");
    }
  }, [matched.size, words.length, showCelebration, flashMonitor]);

  // Clear any pending monitor timer on unmount so a stale setTimeout can't
  // fire after the screen tears down.
  useEffect(() => {
    return () => {
      if (monitorTimerRef.current) clearTimeout(monitorTimerRef.current);
    };
  }, []);

  // Once celebrating, schedule a generous auto-exit AND show a Continue
  // Quest button. Kid taps to advance immediately, or waits — whichever
  // comes first calls onComplete. Cleanup only fires on unmount (the flag
  // never goes back to false), so the timer is guaranteed to run.
  const autoExitRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!showCelebration) return;
    autoExitRef.current = setTimeout(() => onComplete(), 6000);
    return () => {
      if (autoExitRef.current) clearTimeout(autoExitRef.current);
    };
  }, [showCelebration, onComplete]);

  const handleContinue = useCallback(() => {
    if (autoExitRef.current) {
      clearTimeout(autoExitRef.current);
      autoExitRef.current = null;
    }
    onComplete();
  }, [onComplete]);

  // ---- Geometry helpers ----

  const getAnchor = useCallback((el: HTMLElement | null, side: "right" | "left"): Anchor | null => {
    const stage = stageRef.current;
    if (!el || !stage) return null;
    const rect = el.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    return {
      x: (side === "right" ? rect.right : rect.left) - stageRect.left,
      y: rect.top + rect.height / 2 - stageRect.top,
    };
  }, []);

  const getPointerStagePos = useCallback((e: React.PointerEvent | PointerEvent): Anchor => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const rect = stage.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const findPictureAtPointer = useCallback((e: PointerEvent | React.PointerEvent): string | null => {
    for (const word of pictureOrder) {
      const el = pictureRefs.current[word];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      // Expanded hit area — easier to hit small tiles with a finger.
      if (
        e.clientX >= r.left - HITBOX_PADDING &&
        e.clientX <= r.right + HITBOX_PADDING &&
        e.clientY >= r.top - HITBOX_PADDING &&
        e.clientY <= r.bottom + HITBOX_PADDING
      ) {
        return word;
      }
    }
    return null;
  }, [pictureOrder]);

  // ---- Drag handlers ----

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, word: string) => {
      if (matched.has(word) || showCelebration) return;
      e.preventDefault();
      const anchor = getAnchor(wordRefs.current[word], "right");
      if (!anchor) return;
      dragPointerId.current = e.pointerId;
      setDragWord(word);
      setDragFrom(anchor);
      setDragTo(getPointerStagePos(e));
      try { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); } catch { /* noop */ }
      playWordSound(word);
    },
    [matched, showCelebration, getAnchor, getPointerStagePos]
  );

  // Use window-level move/up so the line keeps tracking even when the pointer
  // leaves the originating word card.
  useEffect(() => {
    if (!dragWord) return;

    const handleMove = (e: PointerEvent) => {
      if (e.pointerId !== dragPointerId.current) return;
      e.preventDefault();
      setDragTo(getPointerStagePos(e));
      const over = findPictureAtPointer(e);
      // Don't preview already-matched targets.
      setHoveredTarget(over && !matched.has(over) ? over : null);
    };

    const handleUp = (e: PointerEvent) => {
      if (e.pointerId !== dragPointerId.current) return;
      const dropped = findPictureAtPointer(e);
      if (dropped && dropped === dragWord) {
        // Correct match — lock in
        setMatched((prev) => {
          const next = new Set(prev);
          next.add(dragWord);
          return next;
        });
        playMatchPhrase();
        flashMonitor("system");
        setReactionOverride("happy");
        setTimeout(() => setReactionOverride(null), 750);
      } else if (dropped) {
        // Wrong picture — shake target, gentle audio cue
        setWrongPicture(dropped);
        playEvent("wrong-gentle");
        setTimeout(() => setWrongPicture(null), 600);
        setReactionOverride("encourage");
        setTimeout(() => setReactionOverride(null), 650);
      }
      // Either way (correct, wrong, or dropped on nothing), clear the drag.
      setDragWord(null);
      setDragFrom(null);
      setDragTo(null);
      setHoveredTarget(null);
      dragPointerId.current = null;
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [dragWord, getPointerStagePos, findPictureAtPointer, matched, flashMonitor]);

  // ---- Render the persistent lines for matched pairs ----
  const matchedLines = useMemo(() => {
    return Array.from(matched).map((word) => {
      const from = getAnchor(wordRefs.current[word], "right");
      const to = getAnchor(pictureRefs.current[word], "left");
      if (!from || !to) return null;
      return { word, from, to };
    }).filter(Boolean) as { word: string; from: Anchor; to: Anchor }[];
  }, [matched, getAnchor]);

  // Re-run measurement when window resizes (so lines stay aligned).
  const [, forceRedraw] = useState(0);
  useEffect(() => {
    const onResize = () => forceRedraw((n) => n + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="cross-match" ref={stageRef}>
      <div className="cross-match__columns">
        {/* WORDS — left column */}
        <div className="cross-match__column cross-match__column--words">
          {words.map((w) => {
            const isMatched = matched.has(w.word);
            return (
              <div
                key={w.word}
                ref={(el) => { wordRefs.current[w.word] = el; }}
                className={[
                  "cross-match__word-card",
                  isMatched ? "cross-match__word-card--matched" : "",
                  dragWord === w.word ? "cross-match__word-card--dragging" : "",
                ].filter(Boolean).join(" ")}
                onPointerDown={(e) => startDrag(e, w.word)}
                role="button"
                aria-label={`Word ${w.word} — drag to its picture`}
                tabIndex={isMatched ? -1 : 0}
              >
                <span className="cross-match__word-text">{w.word.toUpperCase()}</span>
                <span className="cross-match__connector cross-match__connector--right" aria-hidden="true" />
              </div>
            );
          })}
        </div>

        {/* PICTURES — right column, shuffled */}
        <div className="cross-match__column cross-match__column--pictures">
          {pictureOrder.map((word) => {
            const isMatched = matched.has(word);
            const isWrong = wrongPicture === word;
            const isHover = hoveredTarget === word;
            return (
              <div
                key={word}
                ref={(el) => { pictureRefs.current[word] = el; }}
                className={[
                  "cross-match__picture-card",
                  isMatched ? "cross-match__picture-card--matched" : "",
                  isWrong ? "cross-match__picture-card--wrong" : "",
                  isHover ? "cross-match__picture-card--hover" : "",
                ].filter(Boolean).join(" ")}
                aria-label={`Picture for ${word}`}
              >
                <span className="cross-match__connector cross-match__connector--left" aria-hidden="true" />
                <img
                  className="cross-match__picture-img"
                  src={`/assets/words/${word}.png`}
                  alt={word}
                  draggable={false}
                  onError={(e) => {
                    // Fallback to word text if image missing
                    const img = e.target as HTMLImageElement;
                    img.style.display = "none";
                    const parent = img.parentElement;
                    if (parent && !parent.querySelector(".cross-match__picture-fallback")) {
                      const span = document.createElement("span");
                      span.className = "cross-match__picture-fallback";
                      span.textContent = word.toUpperCase();
                      parent.appendChild(span);
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* SVG overlay for drag line + matched lines */}
      <svg className="cross-match__lines" aria-hidden="true">
        {matchedLines.map(({ word, from, to }) => (
          <line
            key={`m-${word}`}
            className="cross-match__line cross-match__line--matched"
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
          />
        ))}
        {dragWord && dragFrom && dragTo && (
          <line
            className="cross-match__line cross-match__line--active"
            x1={dragFrom.x}
            y1={dragFrom.y}
            x2={dragTo.x}
            y2={dragTo.y}
          />
        )}
      </svg>

      {/* Submarine CRT monitor — overlays the painted green screen in the
          background. Shows system-style status during gameplay and a bigger
          emotional praise line on completion. Idle state shows a subtle
          scan pulse + faint "SYSTEM READY". */}
      <div className="cross-match__monitor" aria-hidden="true">
        <div className="cross-match__monitor-scanlines" />
        <div className="cross-match__monitor-flicker" />
        {monitorPhrase ? (
          <div
            key={monitorPhrase.id}
            className={`cross-match__monitor-line cross-match__monitor-line--${monitorPhrase.category}`}
          >
            <span className="cross-match__monitor-prompt">&gt;</span>
            <span className="cross-match__monitor-text">{monitorPhrase.text}</span>
          </div>
        ) : (
          <>
            <div className="cross-match__monitor-sweep" />
            <div className="cross-match__monitor-idle">SYSTEM READY</div>
          </>
        )}
      </div>

      {/* WiggleWoo character — reacts to drags / matches / completion */}
      <div
        className={`cross-match__wigglewoo cross-match__wigglewoo--${wwReaction}`}
        aria-hidden="true"
      >
        <img
          src={skinAssets.helperImg}
          alt=""
          className="cross-match__wigglewoo-img"
          draggable={false}
        />
      </div>

      {showCelebration && (
        <div className="cross-match__celebration" aria-live="polite">
          <span className="cross-match__celebration-text">🌟 Nice work! 🌟</span>
        </div>
      )}

      {/* Reserved bottom bar — always present so the columns shrink to fit
          and the Continue Quest button is guaranteed to be on-stage when
          it appears. */}
      <div className="cross-match__bottom-bar">
        {showCelebration && (
          <button
            className="cross-match__continue-btn"
            onClick={handleContinue}
            aria-label="Continue Quest"
          >
            <img src={continueQuestBtn} alt="Continue Quest" draggable={false} />
          </button>
        )}
      </div>
    </div>
  );
};

export default CrossMatchScreen;
