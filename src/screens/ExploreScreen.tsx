// =============================================
// ExploreScreen.tsx — Discovery Room environment viewer
// WiggleWoo's Word Quest
// =============================================
// Active first-visit flow (v1): letter-trace overlay on the
// targeted prop, with a per-day letter from TRACE_LETTER_ROTATION.
// On trace success the room reveals (volcano erupts, chest opens,
// etc.) and the kid taps props to learn facts.
//
// Steady-state loop:
//   - Tap object → learn a fact → animation → fact panel
//   - Every 4th fact → Picture Match challenge before learning
//   - Daily cap: 4 facts per room per day
//
// Parked: the discovery-room mini-game session (DiscoverySession)
// is fully wired but disabled via MINI_GAMES_ENABLED below. See
// the banner near that constant for the revival recipe.
// =============================================

import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { ENVIRONMENTS, isEnvironmentVowelMastered } from "../game/exploreData";
// PARKED for v1 — see MINI_GAMES_ENABLED below. Import + styles kept
// so we can flip the flag back on without re-plumbing the screen.
import DiscoverySession from "../components/miniGames/DiscoverySession";
import "../styles/miniGames.css";
import type { EnvironmentConfig, SceneProp, Hotspot, FactPanel, FactItem } from "../game/exploreData";
import {
  isDailyFactCapReached,
  recordFactDiscovery,
  getUnlockedFactCount,
  getVowelForQuest,
  loadDiscoveredProps,
  recordPropDiscovered,
} from "../game/progression";
import DailyCapModal from "../components/DailyCapModal";
import FactNarration from "../components/FactNarration";
import { playEvent, playRoomWelcome, playLetterSound } from "../audio/SoundEffects";
import TraceMoment from "../components/handwriting/TraceMoment";
import { LETTER_PATHS } from "../components/handwriting/letterPaths";
import { useTraceValidator } from "../components/handwriting/useTraceValidator";
import "../styles/explore.css";

// =============================================
// MINI-GAMES — PARKED for v1 (2026-05-08)
// =============================================
// The discovery-room mini-game session (RhymePop, SoundPop,
// LetterBuilder, WordSort, etc.) is intentionally OFF for v1 in
// favor of the first-visit letter-trace experience. All wiring is
// kept intact — DiscoverySession import, miniGames.css, the
// handlers, and the JSX branch — so flipping this flag back to
// `true` revives the feature without re-plumbing the screen.
//
// To revive (post-v1, after trace flow stabilizes):
//   1. Flip this constant to true.
//   2. Decide per-room policy: should mini-games run alongside
//      the trace, or replace it for some rooms? Today FIRST_VISIT_TRACE
//      covers all 5 rooms, so showMiniGames would still resolve false.
//      Either drop a room from FIRST_VISIT_TRACE or change the gate.
//   3. Re-record the mini-game VO slugs that were moved to the
//      Out-of-Scope list in docs/VO-Recording-Sheet-V1.md.
const MINI_GAMES_ENABLED = false;

// ---- Daily letter rotation ----
// All 5 Discovery Rooms run a first-visit trace; each day pulls 5 consecutive
// letters from this rotation and assigns one per room. Calendar-day boundary
// so kids who skip a day still come back to a fresh letter set, and any
// letter the kid skipped naturally reappears in a future cycle.
const TRACE_LETTER_ROTATION = [
  "a", "b", "c", "d", "e",
  "h", "i", "m", "n", "o",
  "p", "s", "t", "u", "v",
];
const TRACE_ROOM_ORDER = [
  "valcano",
  "castle-island",
  "small-coastal-village",
  "glass-dome",
  "industrial-tech-city",
];

/** Per-day index anchored at LOCAL midnight (so the rotation flips over with
 *  the kid's calendar day, not at UTC midnight). */
const getDayIndex = (): number => {
  const now = new Date();
  const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.floor(localMidnight / 86400000);
};

const getLetterForRoom = (envId: string): string | null => {
  const roomIdx = TRACE_ROOM_ORDER.indexOf(envId);
  if (roomIdx < 0) return null;
  const start = (getDayIndex() * TRACE_ROOM_ORDER.length) % TRACE_LETTER_ROTATION.length;
  return TRACE_LETTER_ROTATION[(start + roomIdx) % TRACE_LETTER_ROTATION.length];
};

// Global discovery-room flags — both "first-ever" cues fire once across the
// whole app lifetime, regardless of which room the kid enters first.


interface ExploreScreenProps {
  environmentId: string;
  questId?: string;
  onBack: () => void;
  /** Called once on first visit when used as discovery room reward */
  onComplete?: () => void;
}

// ---- Sub-components ----

/** Fact panel — bottom sheet with 2-col grid of tappable fact items */
const FactPanelSheet: React.FC<{
  panel: FactPanel;
  onClose: () => void;
  ambientColor: string;
  onFactViewed?: (factId: string) => void;
  onFactNarrationEnded?: (factId: string) => void;
}> = ({ panel, onClose, onFactViewed, onFactNarrationEnded }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lockedToast] = useState<string | null>(null);

  return (
    <>
      <div className="fact-panel-backdrop" onClick={onClose} />
      <div className="fact-panel">
        <div className="fact-panel__handle" />
        <button className="fact-panel__close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h3 className="fact-panel__title">{panel.title}</h3>
        <div className="fact-panel__grid">
          {panel.items.map((item: FactItem) => {
            const isLocked = false; // All facts accessible
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className={[
                  "fact-panel__item",
                  isExpanded ? "fact-panel__item--expanded" : "",
                  isLocked ? "fact-panel__item--locked" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => {
                  if (!isExpanded) {
                    onFactViewed?.(item.id);
                  }
                  setExpandedId(isExpanded ? null : item.id);
                }}
              >
                <div className="fact-panel__item-header">
                  <span className="fact-panel__item-emoji">{isLocked ? "🔒" : item.emoji}</span>
                  <span className="fact-panel__item-name">{isLocked ? "???" : item.name}</span>
                </div>
                {isExpanded && !isLocked && (
                  <>
                    <p className="fact-panel__item-fact">{item.core}</p>
                    <FactNarration
                      text={item.core}
                      audioSrc={item.audioSrc}
                      autoPlay
                      onEnded={() => onFactNarrationEnded?.(item.id)}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
        {lockedToast && (
          <div className="fact-panel__locked-toast">{lockedToast}</div>
        )}
      </div>
    </>
  );
};

/** Hotspot fact popup — centered card */
const HotspotPopup: React.FC<{
  hotspot: Hotspot;
  onClose: () => void;
}> = ({ hotspot, onClose }) => (
  <div className="explore-popup-backdrop" onClick={onClose}>
    <div className="explore-fact-popup" onClick={(e) => e.stopPropagation()}>
      <div className="explore-fact-popup__emoji">{hotspot.emoji}</div>
      <h3 className="explore-fact-popup__title">{hotspot.label}</h3>
      <p className="explore-fact-popup__text">{hotspot.fact}</p>
      <button className="explore-fact-popup__close-btn" onClick={onClose}>
        Got it!
      </button>
    </div>
  </div>
);

// ---- Main component ----

const ExploreScreen: React.FC<ExploreScreenProps> = ({ environmentId, questId, onBack, onComplete }) => {
  const env: EnvironmentConfig | undefined = ENVIRONMENTS[environmentId];

  // Progressive fact unlocking — based on vowel quest completions
  // Also count completions directly from quest progress as a safety net
  const vowel = questId ? getVowelForQuest(questId) : null;
  let unlockedFactCount = vowel ? getUnlockedFactCount(vowel) : 16;
  // If entering this room, player must have completed at least 1 quest — ensure minimum 2 facts
  if (unlockedFactCount < 2 && questId) {
    unlockedFactCount = 2;
  }

  // Room completion state
  const roomCompleteKey = `ww_room_complete_${environmentId}`;
  const isRoomAlreadyComplete = localStorage.getItem(roomCompleteKey) === "true";
  const [factsViewedThisVisit, setFactsViewedThisVisit] = useState<Set<string>>(new Set());
  const [roomJustCompleted, setRoomJustCompleted] = useState(false);
  const FACTS_REQUIRED = 2;
  const needsCompletion = !!onComplete && !isRoomAlreadyComplete;

  // The fact whose narration finishing should trigger discover-complete
  // (instead of the usual fact-reaction). Captured the moment the kid views
  // the FACTS_REQUIRED-th fact, so we can let its narration play out + dwell
  // and then segue cleanly into the room-complete VO without stomping on
  // a per-fact reaction.
  const [completingFactId, setCompletingFactId] = useState<string | null>(null);

  // Per-room first-visit trace experience. The trace renders directly over
  // the targeted in-room prop — the prop itself swaps to its "active" sprite
  // via existing room state (e.g. `erupting` for the volcano), so we don't
  // need to pass our own dim/active asset pair. The actual letter is picked
  // from the daily rotation (see TRACE_LETTER_ROTATION) so the kid works
  // through the alphabet over time rather than seeing the same letter forever.
  const FIRST_VISIT_TRACE: Record<string, { targetPropId: string; theme: string } | undefined> = {
    "valcano":               { targetPropId: "volcano-image", theme: "volcano" },
    "castle-island":         { targetPropId: "treasure-box",  theme: "castle" },
    "small-coastal-village": { targetPropId: "clam",          theme: "coral" },
    "glass-dome":            { targetPropId: "flower-stage",  theme: "greenhouse" },
    "industrial-tech-city":  { targetPropId: "light-switch",  theme: "geartown" },
  };
  const firstVisitTraceConfig = FIRST_VISIT_TRACE[environmentId];
  const traceLetter = firstVisitTraceConfig ? getLetterForRoom(environmentId) : null;

  // First-visit gate (active flow): show the letter-trace overlay once per
  // calendar day per room. Date-keyed so kids who revisit across days get a
  // fresh letter from the rotation and continue alphabet practice. The same
  // key gates the parked mini-game branch below — whichever first-visit
  // experience renders, completing it sets the flag for the day.
  const firstVisitSeenKey = `ww_first_visit_seen_${environmentId}_${getDayIndex()}`;
  const hasSeenFirstVisit = localStorage.getItem(firstVisitSeenKey) === "true";
  const [showFirstVisitTrace, setShowFirstVisitTrace] = useState(
    !!onComplete && !hasSeenFirstVisit && !!firstVisitTraceConfig
  );
  // PARKED — gated by MINI_GAMES_ENABLED (false for v1). Even when revived,
  // a room with a firstVisitTraceConfig will still take the trace path; the
  // mini-game branch only runs in rooms without a trace config.
  const [showMiniGames, setShowMiniGames] = useState(
    MINI_GAMES_ENABLED && !!onComplete && !hasSeenFirstVisit && !firstVisitTraceConfig
  );
  const [, setMiniGamesCompleted] = useState(false);

  // Plays the per-room thematic welcome VO on every discovery-room entry.
  const playWelcomeForRoom = useCallback(() => {
    playRoomWelcome(environmentId);
  }, [environmentId]);

  // PARKED — only reachable when MINI_GAMES_ENABLED is flipped on.
  const handleMiniGamesComplete = useCallback(() => {
    setMiniGamesCompleted(true);
    setShowMiniGames(false);
    localStorage.setItem(firstVisitSeenKey, "true");
    playWelcomeForRoom();
    // Do NOT call onComplete here — room completes after viewing 2 facts
  }, [firstVisitSeenKey, playWelcomeForRoom]);

  // Welcome VO on first mount — only when no first-visit experience is
  // covering the room. First-visit welcome plays inside each completion
  // handler instead. The showMiniGames check is a no-op while mini-games
  // are parked, but kept for symmetry with the trace gate so the predicate
  // still reads correctly when the parked branch is revived.
  const [welcomePlayed, setWelcomePlayed] = useState(false);
  useEffect(() => {
    if (welcomePlayed) return;
    if (showMiniGames) return;
    if (showFirstVisitTrace) return;
    playWelcomeForRoom();
    setWelcomePlayed(true);
  }, [showMiniGames, showFirstVisitTrace, welcomePlayed, playWelcomeForRoom]);

  // Single entry point for room completion — fires the discover-complete VO,
  // then a brief bridge VO, then exits. Idempotent so both the "narration
  // ended" path and the narration-disabled fallback can call it safely.
  // The exit-bridge file lands at /assets/audio/events/discover-exit-bridge.m4a
  // — until then playEvent fails silently and the gap is just background music.
  const triggerRoomComplete = useCallback(() => {
    if (!needsCompletion || roomJustCompleted) return;
    setRoomJustCompleted(true);
    localStorage.setItem(roomCompleteKey, "true");
    playEvent("discover-complete");
    // discover-complete plays for ~2s, then the bridge line plays as the
    // room is fading out. Total dwell before exit = ~3.5s.
    setTimeout(() => playEvent("discover-exit-bridge"), 2200);
    setTimeout(() => {
      onComplete?.();
      onBack();
    }, 3500);
  }, [needsCompletion, roomJustCompleted, roomCompleteKey, onComplete, onBack]);

  /** Routed from `<FactNarration onEnded>`. Fires the per-fact reaction VO
   *  for every fact (including the completing one) — the room-complete VO
   *  no longer fires here. Instead it's gated on the kid actively closing
   *  the fact panel, so they can read/digest at their own pace before the
   *  completion sequence kicks off. */
  const handleFactNarrationEnded = useCallback((_factId: string) => {
    if (roomJustCompleted) return;
    playEvent("discover-fact-reaction");
  }, [roomJustCompleted]);

  /** Called when the fact panel closes (X button or backdrop tap). If the
   *  kid has already viewed the threshold-th fact, this is the moment to
   *  fire discover-complete + auto-exit. */
  const handleFactPanelClose = useCallback(() => {
    setActivePanel(null);
    if (
      completingFactId !== null &&
      needsCompletion &&
      !roomJustCompleted
    ) {
      triggerRoomComplete();
    }
  }, [completingFactId, needsCompletion, roomJustCompleted, triggerRoomComplete]);

  // PARKED — only reachable when MINI_GAMES_ENABLED is flipped on.
  const handleMiniGamesBack = useCallback(() => {
    setShowMiniGames(false);
    onBack();
  }, [onBack]);

  // Feeds the parked DiscoverySession (3 facts as mini-game rewards).
  // Computed unconditionally so React-hooks order stays stable across
  // the flag flip; cheap memoized walk over env.props.
  const roomFacts = useMemo(() => {
    if (!env?.props) return [];
    const facts: string[] = [];
    for (const prop of env.props) {
      if (prop.factPanel?.items) {
        for (const item of prop.factPanel.items) {
          if (item.core) facts.push(item.core);
        }
      }
    }
    return facts;
  }, [env]);

  // ---- UI state ----
  const [activePanel, setActivePanel] = useState<FactPanel | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [tappedHotspotId, setTappedHotspotId] = useState<string | null>(null);

  // Per-room set of prop IDs whose facts have already been heard. Drives the
  // soft glow halo: undiscovered fact props get the pulse, discovered ones
  // fade it off. Loaded once on mount, mutated via setDiscoveredProps when
  // a new fact is learned so the halo fades within the current visit.
  const [discoveredProps, setDiscoveredProps] = useState<Set<string>>(
    () => loadDiscoveredProps(environmentId)
  );
  useEffect(() => {
    setDiscoveredProps(loadDiscoveredProps(environmentId));
  }, [environmentId]);

  // Choice modal state
  const [showDailyCap, setShowDailyCap] = useState(false);

  // Volcano eruption state
  const [erupting, setErupting] = useState(false);
  const [quaking, setQuaking] = useState(false);
  const eruptTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Castle: treasure chest and scroll state
  const [chestOpen, setChestOpen] = useState(false);
  const [scrollOpen, setScrollOpen] = useState(false);

  // Coral Cove: clam and octopus state
  const [clamOpen, setClamOpen] = useState(false);
  const [octopusGlowing, setOctopusGlowing] = useState(false);

  // Geartown: light switch and power core state
  const [lightsOn, setLightsOn] = useState(false);
  const [powerCoreGlowing, setPowerCoreGlowing] = useState(false);

  // MVP embedded handwriting — only wired for Geartown power core.
  // Holds the SceneProp that was tapped while the trace overlay is active.
  const [tracePropTarget, setTracePropTarget] = useState<SceneProp | null>(null);
  const tracedPropsRef = useRef<Set<string>>(new Set());

  // Greenhouse flower stage cycling
  const [flowerStage, setFlowerStage] = useState(0);

  // Butterfly wing-flap animation
  const [butterflyFrame, setButterflyFrame] = useState(1);
  const butterflyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (environmentId !== "glass-dome") return;
    let mounted = true;
    const loop = () => {
      if (!mounted) return;
      setButterflyFrame(1);
      butterflyTimerRef.current = setTimeout(() => {
        if (!mounted) return;
        setButterflyFrame(2);
        butterflyTimerRef.current = setTimeout(() => {
          if (mounted) loop();
        }, 3000);
      }, 3000);
    };
    loop();
    return () => { mounted = false; if (butterflyTimerRef.current) clearTimeout(butterflyTimerRef.current); };
  }, [environmentId]);

  // ---- Object animation triggers ----
  const playObjectAnimation = useCallback((prop: SceneProp) => {
    const delay = 400;

    if (prop.id === "flower-stage") {
      setFlowerStage(1);
      setTimeout(() => setFlowerStage(2), delay);
      setTimeout(() => setFlowerStage(3), delay * 2);
    } else if (prop.id === "clam") {
      setClamOpen(true);
    } else if (prop.id === "octopus") {
      setOctopusGlowing(true);
    } else if (prop.id === "treasure-box") {
      setChestOpen(true);
    } else if (prop.id === "castle-scroll") {
      setScrollOpen(true);
    } else if (prop.id === "power-core") {
      setPowerCoreGlowing(true);
    }
  }, []);

  // ---- Fact discovery flow ----
  const showFactForProp = useCallback((prop: SceneProp) => {
    if (prop.factPanel) {
      // Wait for object animation to finish before showing fact panel
      const delay = prop.id === "flower-stage" ? 1800 : 1500;
      setTimeout(() => setActivePanel(prop.factPanel!), delay);
    }
  }, []);

  // Learn a fact directly (no choice modal)
  const learnFactForProp = useCallback((prop: SceneProp) => {
    recordFactDiscovery(environmentId);
    // Mark the specific prop as discovered so its glow halo fades. Persists
    // to localStorage AND updates local state so the halo dims within the
    // current room visit, not just on next entry.
    if (prop.factPanel) {
      recordPropDiscovered(environmentId, prop.id);
      setDiscoveredProps((s) => {
        if (s.has(prop.id)) return s;
        const next = new Set(s);
        next.add(prop.id);
        return next;
      });
    }
    // "wow did you know that" reaction fires AFTER the kid actually hears the
    // fact — wired into FactNarration's onEnded below, not here.

    playObjectAnimation(prop);
    showFactForProp(prop);
  }, [environmentId, playObjectAnimation, showFactForProp]);


  // ---- Main prop click handler ----
  const handlePropClick = useCallback((prop: SceneProp) => {
    // Light switch — no fact, just toggle
    if (prop.id === "light-switch") {
      setLightsOn((on) => !on);
      return;
    }

    // MVP handwriting intercept — Geartown power core, first tap only.
    // After tracing, the prop falls through to the normal discovery flow on
    // any subsequent tap.
    if (
      environmentId === "industrial-tech-city" &&
      prop.id === "power-core" &&
      !tracedPropsRef.current.has(prop.id)
    ) {
      setTracePropTarget(prop);
      return;
    }

    // Only fact-panel props trigger the discovery flow
    if (!prop.factPanel) return;

    // Check daily cap (skip in dev). The cap is also lifted once any quest
    // tied to this environment is fully complete — kids who finished the
    // content shouldn't be told to come back tomorrow for two more facts.
    if (
      !import.meta.env.DEV &&
      isDailyFactCapReached(environmentId) &&
      !isEnvironmentVowelMastered(environmentId)
    ) {
      setShowDailyCap(true);
      return;
    }

    learnFactForProp(prop);
  }, [environmentId, learnFactForProp]);

  const handleHotspotClick = useCallback((hotspot: Hotspot) => {
    setTappedHotspotId(hotspot.id);
    setTimeout(() => setTappedHotspotId(null), 500);
    setActiveHotspot(hotspot);
  }, []);

  // ---- Trace moment (MVP, Geartown power-core only) ----
  const handleTraceComplete = useCallback(() => {
    const prop = tracePropTarget;
    if (!prop) return;
    tracedPropsRef.current.add(prop.id);
    // Hero swap + chained light cascade — uses existing room state.
    setPowerCoreGlowing(true);
    setLightsOn(true);
    setTracePropTarget(null);
    // Continue into the existing discovery flow so the fact panel still opens
    // (room-completion logic depends on facts viewed).
    if (prop.factPanel) {
      learnFactForProp(prop);
    }
  }, [tracePropTarget, learnFactForProp]);

  const handleTraceSkip = useCallback(() => {
    const prop = tracePropTarget;
    setTracePropTarget(null);
    // Skipping must not soft-lock progression — fall through to the normal flow.
    if (prop) {
      tracedPropsRef.current.add(prop.id);
      if (prop.factPanel) learnFactForProp(prop);
    }
  }, [tracePropTarget, learnFactForProp]);

  // Volcano eruption handler — 2.5s cycle then full reset
  const handleErupt = useCallback(() => {
    if (erupting) return;
    setErupting(true);
    setQuaking(true);
    if (eruptTimerRef.current) clearTimeout(eruptTimerRef.current);
    // Quake ends after 400ms, eruption visuals continue
    setTimeout(() => setQuaking(false), 400);
    // Full reset after 2.5s
    eruptTimerRef.current = setTimeout(() => {
      setErupting(false);
    }, 2500);
  }, [erupting]);

  // First-visit trace complete → reveal the room. Mark seen, fire the
  // welcome VO, and trigger a thematic reveal reaction per room — the kid
  // sees the room "wake up" in a way that matches the environment.
  const handleFirstVisitTraceComplete = useCallback(() => {
    setShowFirstVisitTrace(false);
    localStorage.setItem(firstVisitSeenKey, "true");
    playWelcomeForRoom();
    switch (firstVisitTraceConfig?.targetPropId) {
      case "volcano-image":
        handleErupt();
        break;
      case "treasure-box":
        setChestOpen(true);
        break;
      case "clam":
        setClamOpen(true);
        break;
      case "flower-stage":
        // Bloom in stages so it feels like growth, mirroring the existing
        // greenhouse interaction sequence.
        setFlowerStage(1);
        setTimeout(() => setFlowerStage(2), 600);
        setTimeout(() => setFlowerStage(3), 1200);
        break;
      case "light-switch":
        setLightsOn(true);
        break;
    }
  }, [firstVisitSeenKey, firstVisitTraceConfig, handleErupt, playWelcomeForRoom]);

  // First-visit trace plumbing — SVG positioned over the targeted in-room
  // prop. Validator handles pointer events; on success, the room's existing
  // state machine handles the visual reaction (volcano erupts via handleErupt).
  const traceSvgRef = useRef<SVGSVGElement | null>(null);
  const tracePathRef = useRef<SVGPathElement | null>(null);
  const traceLetterPath = traceLetter ? LETTER_PATHS[traceLetter] : null;
  const traceTargetProp = firstVisitTraceConfig
    ? env?.props?.find((p) => p.id === firstVisitTraceConfig.targetPropId)
    : null;

  // Where the start-here indicator should sit RIGHT NOW. For multi-stroke
  // letters (m, t) the indicator hops onto the next stroke's start once
  // the previous stroke is mostly complete — guides the kid through the
  // letter one stroke at a time.
  // Returns null when:
  //   - the kid is actively tracing a stroke (mid-progress), or
  //   - every stroke is sufficiently complete.
  // Two thresholds:
  //   STROKE_HOP_COVERAGE   — fraction of the current stroke covered
  //                           before the indicator hops to the next.
  //   STROKE_DONE_COVERAGE  — fraction every stroke must hit before the
  //                           letter is treated as complete.
  // Hop is more lenient so the kid sees the next-stroke hint while still
  // tying off the current one; success is stricter so the kid actually
  // finishes the letter (reaches the end of every stroke) before the
  // success phrase plays — a P that fires halfway through the bowl, or
  // a partially-traced final stroke, both feel premature.
  const STROKE_HOP_COVERAGE = 0.7;
  const STROKE_DONE_COVERAGE = 0.95;

  const handleTraceSuccess = useCallback(() => {
    if (!firstVisitTraceConfig || !traceLetter) return;
    playLetterSound(traceLetter);
    playEvent("mini-correct");
    // Hold the lit V briefly so the kid sees the trace complete, then
    // finalize the first-visit flow. Eruption (and any other room reaction)
    // fires from handleFirstVisitTraceComplete so it lines up with the
    // prop reveal rather than happening while props are still hidden.
    setTimeout(() => {
      handleFirstVisitTraceComplete();
    }, 1500);
  }, [firstVisitTraceConfig, traceLetter, handleFirstVisitTraceComplete]);

  const traceValidator = useTraceValidator({
    pathRef: tracePathRef,
    svgRef: traceSvgRef,
    // Validator's built-in success fires on GLOBAL coverage, but for multi-
    // stroke letters that lets the longest sub-path alone trip success.
    // We disable the auto-fire here and gate completion in our own effect
    // below that requires every sub-path to reach STROKE_DONE_COVERAGE.
    onSuccess: () => {},
    coverageThreshold: 2,
    // Tighter hit radius (was the default 9). With 9, the kid's finger at
    // the top of one stroke registers a hit on the next stroke's first
    // waypoint too — causing a small bleed at sub-path boundaries.
    hitRadius: 5,
  });

  // (Per-stroke completion gate is set up further below, AFTER subpathInfo
  //  is declared — see the `traceSuccessTriggered` block.)
  const traceSuccessTriggered = useRef(false);

  // Split the letter's path into its sub-paths so each stroke can fill
  // independently. A multi-sub-path letter (M, T) was treating the whole
  // glyph as one shared progress bar; tracing one stroke would bleed into
  // the next at the sub-path boundary. With per-sub-path rendering, each
  // stroke has its own <path> + its own dasharray and stays dark until
  // its OWN waypoints are hit.
  const subpathInfo = useMemo(() => {
    if (!traceLetterPath || typeof document === "undefined") {
      return [] as { d: string; len: number; startLen: number }[];
    }
    // Split at each M command (capture the M as the start of each chunk).
    const chunks = (traceLetterPath.d.match(/M[^M]*/g) ?? []).map((s) => s.trim()).filter(Boolean);
    const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let cum = 0;
    return chunks.map((d) => {
      tempPath.setAttribute("d", d);
      let len = 0;
      try { len = tempPath.getTotalLength(); } catch { /* path malformed */ }
      const startLen = cum;
      cum += len;
      return { d, len, startLen };
    });
  }, [traceLetterPath]);

  // Per-sub-path dasharray: lights only segments WITHIN that sub-path whose
  // waypoint pair is fully hit. Cross-boundary segments never light up
  // because we treat each sub-path as its own visual rendering pass.
  const subpathDasharrays = useMemo(() => {
    const hits = traceValidator.hitMask;
    const total = traceValidator.pathLength;
    const N = hits.length;
    if (!total || N < 2 || subpathInfo.length === 0) {
      return subpathInfo.map(() => undefined as string | undefined);
    }
    const segLen = total / (N - 1);

    return subpathInfo.map(({ len, startLen }) => {
      // Global waypoint indices that land inside this sub-path.
      const startIdx = Math.max(0, Math.ceil(startLen / segLen));
      const endIdx = Math.min(N, Math.floor((startLen + len) / segLen) + 1);
      if (endIdx - startIdx < 2) return `0 ${len.toFixed(2)}`;

      // Each segment is "on" iff both endpoints are hit AND both endpoints
      // are within THIS sub-path. By scoping startIdx/endIdx to local hits
      // only, cross-stroke leakage is impossible.
      const segOn: boolean[] = [];
      for (let i = startIdx; i < endIdx - 1; i++) {
        segOn.push(hits[i] && hits[i + 1]);
      }

      // Leading prefix (sub-path length before the first scoped waypoint)
      // — always OFF.
      const leadingOffset = Math.max(0, startIdx * segLen - startLen);
      // Trailing suffix (sub-path length after the last scoped waypoint).
      const trailingOffset = Math.max(
        0,
        startLen + len - (endIdx - 1) * segLen
      );

      // Run-length encode segOn into ON/OFF run lengths.
      const runs: number[] = [];
      let currentOn = segOn[0];
      let currentLen = 0;
      for (const isOn of segOn) {
        if (isOn === currentOn) {
          currentLen += segLen;
        } else {
          runs.push(currentLen);
          currentOn = isOn;
          currentLen = segLen;
        }
      }
      runs.push(currentLen);

      // Stitch the leading prefix in. dasharray must start with an ON run.
      if (segOn[0]) {
        // First run is ON — prepend a zero-length ON + the leading OFF.
        if (leadingOffset > 0) runs.unshift(0, leadingOffset);
      } else {
        // First run is OFF — extend it by leadingOffset, then prepend 0 ON.
        runs[0] += leadingOffset;
        runs.unshift(0);
      }

      // Append trailing suffix. After the unshift dance, runs always starts
      // with an ON (possibly zero-length), so even-indexed entries are ON
      // and odd-indexed are OFF. The trailing region is always OFF.
      if (trailingOffset > 0) {
        if (runs.length % 2 === 0) {
          // Last run is OFF — extend it.
          runs[runs.length - 1] += trailingOffset;
        } else {
          // Last run is ON — append a new OFF run.
          runs.push(trailingOffset);
        }
      }

      return runs.map((n) => n.toFixed(2)).join(" ");
    });
  }, [traceValidator.hitMask, traceValidator.pathLength, subpathInfo]);

  // Per-stroke success: every sub-path must reach STROKE_DONE_COVERAGE
  // before we treat the letter as complete. Single-sub-path letters
  // collapse to a single check and behave identically to the old global
  // threshold; multi-stroke letters (m, t) actually require all strokes.
  useEffect(() => {
    // Re-arm whenever the letter swaps (different room → different trace).
    traceSuccessTriggered.current = false;
  }, [traceLetterPath]);

  useEffect(() => {
    if (traceSuccessTriggered.current) return;
    if (!firstVisitTraceConfig) return;
    if (subpathInfo.length === 0) return;
    // Wait for the kid to actually LIFT their finger before firing the
    // success phrase. Coverage can cross threshold mid-drag while the kid
    // is still moving — playing "that's right" while their finger is in
    // motion feels premature.
    if (traceValidator.pointerPos) return;
    const totalLen = traceValidator.pathLength;
    const N = traceValidator.hitMask.length;
    if (!totalLen || N < 2) return;
    const segLen = totalLen / (N - 1);
    for (const sp of subpathInfo) {
      const startIdx = Math.max(0, Math.ceil(sp.startLen / segLen));
      const endIdx = Math.min(N, Math.floor((sp.startLen + sp.len) / segLen) + 1);
      const total = endIdx - startIdx;
      if (total <= 0) continue;
      let hits = 0;
      for (let i = startIdx; i < endIdx; i++) {
        if (traceValidator.hitMask[i]) hits++;
      }
      if (hits / total < STROKE_DONE_COVERAGE) return; // some stroke isn't done yet
    }
    traceSuccessTriggered.current = true;
    handleTraceSuccess();
  }, [
    traceValidator.hitMask,
    traceValidator.pathLength,
    traceValidator.pointerPos,
    subpathInfo,
    firstVisitTraceConfig,
    handleTraceSuccess,
  ]);

  // Active stroke's start point — the indicator dot hops here as the kid
  // moves through the strokes. For each sub-path in order:
  //   - coverage < threshold + zero hits  → indicator at this stroke's start
  //   - coverage < threshold + some hits  → kid is mid-trace, hide indicator
  //   - coverage >= threshold             → move on to the next stroke
  // Returns null when every stroke is complete or no path is loaded.
  const activeStrokeStart = useMemo(() => {
    if (!traceLetterPath) return null;
    const totalLen = traceValidator.pathLength;
    const N = traceValidator.hitMask.length;
    // Until subpaths/waypoints are sampled, fall back to the path's first M
    // so the indicator shows immediately on mount.
    if (!totalLen || N < 2 || subpathInfo.length === 0) {
      const m = traceLetterPath.d.match(/^M\s+([\d.]+)[\s,]+([\d.]+)/);
      return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : null;
    }
    const segLen = totalLen / (N - 1);
    for (const sp of subpathInfo) {
      const startIdx = Math.max(0, Math.ceil(sp.startLen / segLen));
      const endIdx = Math.min(N, Math.floor((sp.startLen + sp.len) / segLen) + 1);
      const total = endIdx - startIdx;
      if (total <= 0) continue;
      let hits = 0;
      for (let i = startIdx; i < endIdx; i++) {
        if (traceValidator.hitMask[i]) hits++;
      }
      const coverage = hits / total;
      if (coverage >= STROKE_HOP_COVERAGE) continue;
      if (hits > 0) return null; // mid-stroke, keep out of the kid's way
      const m = sp.d.match(/^M\s+([\d.]+)[\s,]+([\d.]+)/);
      return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : null;
    }
    return null;
  }, [traceLetterPath, traceValidator.pathLength, traceValidator.hitMask, subpathInfo]);

  if (!env) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#fff" }}>
        <p>Environment not found: {environmentId}</p>
        <button onClick={onBack} style={{ marginLeft: 16 }}>Back</button>
      </div>
    );
  }

  const bgStyle: React.CSSProperties = env.backgroundImage
    ? {
        backgroundImage: `url("${env.backgroundImage}")`,
        backgroundSize: "100% 100%",
        backgroundPosition: "center center",
      }
    : { background: env.backgroundGradient };

  const renderProps = () =>
    env.props?.map((prop) => {
      const isInteractive = !!prop.factPanel || prop.id === "light-switch";
      const isEruptButton = prop.id === "erupt-button";
      const isVolcanoImage = prop.id === "volcano-image";
      const isLavaPit = prop.id === "lava-pit";
      const isFlower = prop.id === "flower-stage";
      const isButterfly = prop.id === "butterfly";
      const isHangingLight = prop.id.startsWith("hanging-light-");
      const isLightSwitch = prop.id === "light-switch";
      const isBlueprint = prop.id === "blueprint";
      const isPowerCore = prop.id === "power-core";
      const isTreasureBox = prop.id === "treasure-box";
      const isCastleScroll = prop.id === "castle-scroll";
      const isClam = prop.id === "clam";
      const isOctopus = prop.id === "octopus";
      const isGeartownSpinner = prop.id.startsWith("geartown-spinner-");
      const anchorTransform =
        prop.anchor === "top" ? "translate(-50%, 0%)" : "translate(-50%, -100%)";

      // Dynamic image source swaps
      let imgSrc = prop.src;
      if (isEruptButton && erupting) {
        imgSrc = "/assets/discovery rooms/rumble-peak-volcano/erupt-button-green.png";
      } else if (isVolcanoImage && erupting) {
        imgSrc = "/assets/discovery rooms/rumble-peak-volcano/erupt-volcano.png";
      } else if (isFlower && flowerStage > 0) {
        imgSrc = `/assets/discovery rooms/greenhouse-domes/flower-stage-${flowerStage}.png`;
      } else if (isButterfly) {
        imgSrc = `/assets/discovery rooms/greenhouse-domes/butterfly-view-${butterflyFrame}.png`;
      } else if (isHangingLight) {
        const lightNum = prop.id.replace("hanging-light-", "");
        imgSrc = `/assets/discovery rooms/geartown-workshop/hanging light ${lightsOn ? "on" : "off"}-${lightNum}.png`;
      } else if (isLightSwitch) {
        imgSrc = `/assets/discovery rooms/geartown-workshop/${lightsOn ? "on" : "off"} switch.png`;
      } else if (isBlueprint) {
        imgSrc = `/assets/discovery rooms/geartown-workshop/blueprint-lights-${lightsOn ? "on" : "off"}.png`;
      } else if (isPowerCore) {
        imgSrc = `/assets/discovery rooms/geartown-workshop/power-core-${powerCoreGlowing ? "glowing" : "not-glowing"}.png`;
      } else if (isTreasureBox) {
        imgSrc = `/assets/discovery rooms/stonewall-castle/${chestOpen ? "open" : "closed"}-treasure-box.png`;
      } else if (isCastleScroll) {
        imgSrc = `/assets/discovery rooms/stonewall-castle/scrolled-${scrollOpen ? "down" : "up"}.png`;
      } else if (isClam) {
        imgSrc = `/assets/discovery rooms/coral-cove-village/${clamOpen ? "open" : "closed"}-clam.png`;
      } else if (isOctopus) {
        imgSrc = `/assets/discovery rooms/coral-cove-village/${octopusGlowing ? "glowing-octopus" : "stone-octopus"}.png`;
      }

      const propEl = (
        <img
          src={imgSrc}
          alt=""
          draggable={false}
          style={{ width: "100%", height: "auto" }}
        />
      );

      // Erupt button
      if (isEruptButton) {
        return (
          <button
            key={prop.id}
            className={`explore-prop explore-prop--interactive ${erupting ? "explore-prop--erupting" : ""}`}
            style={{
              position: "absolute",
              left: `${prop.x}%`,
              top: `${prop.y}%`,
              width: `${prop.width}%`,
              transform: anchorTransform,
            }}
            onClick={handleErupt}
            aria-label="Erupt the volcano!"
          >
            {propEl}
          </button>
        );
      }

      // Interactive prop with fact panel (or light switch)
      if (isInteractive) {
        // Soft glow halo for fact-bearing props only (not the light switch).
        // Fades out once this specific prop's fact has been heard so the
        // hint stays on the things the kid hasn't found yet.
        const hasFact = !!prop.factPanel;
        const isDiscovered = hasFact && discoveredProps.has(prop.id);
        return (
          <button
            key={prop.id}
            className={[
              "explore-prop",
              "explore-prop--interactive",
              hasFact ? "explore-prop--has-fact" : "",
              isDiscovered ? "explore-prop--fact-discovered" : "",
            ].filter(Boolean).join(" ")}
            style={{
              position: "absolute",
              left: `${prop.x}%`,
              top: `${prop.y}%`,
              width: `${prop.width}%`,
              transform: anchorTransform,
            }}
            onClick={() => handlePropClick(prop)}
            aria-label={prop.factPanel?.title ?? prop.id}
          >
            {propEl}
            {isLavaPit && erupting && (
              <img
                className="lava-bubbling-overlay"
                src="/assets/discovery rooms/rumble-peak-volcano/bubbling-lava.png"
                alt=""
                draggable={false}
              />
            )}
          </button>
        );
      }

      // Spinning gear overlay (Geartown wall) — non-interactive, continuous
      // rotation. Each spinner has its own modifier class so individual
      // size/speed/direction is controlled in explore.css.
      if (isGeartownSpinner) {
        const variant = prop.id.replace("geartown-spinner-", "");
        return (
          <div
            key={prop.id}
            className={`explore-prop geartown-spinner geartown-spinner--${variant}`}
            style={{
              position: "absolute",
              left: `${prop.x}%`,
              top: `${prop.y}%`,
              width: `${prop.width}%`,
              transform: anchorTransform,
            }}
            aria-hidden="true"
          >
            {propEl}
          </div>
        );
      }

      // Logo/sign — anchored at top
      if (prop.anchor === "top" && !isHangingLight) {
        return (
          <div
            key={prop.id}
            className="explore-prop"
            style={{
              position: "absolute",
              left: `${prop.x}%`,
              top: `${prop.y}%`,
              width: `${prop.width}%`,
              transform: "translate(-50%, 0%)",
            }}
          >
            {propEl}
          </div>
        );
      }

      // Butterfly — crossfade
      if (isButterfly) {
        return (
          <div
            key={prop.id}
            className="explore-prop explore-prop--butterfly"
            style={{
              position: "absolute",
              left: `${prop.x}%`,
              top: `${prop.y}%`,
              width: `${prop.width}%`,
            }}
          >
            <img
              src="/assets/discovery rooms/greenhouse-domes/butterfly-view-1.png"
              alt=""
              draggable={false}
              className="butterfly-frame"
              style={{ width: "100%", height: "auto", opacity: butterflyFrame === 1 ? 1 : 0 }}
            />
            <img
              src="/assets/discovery rooms/greenhouse-domes/butterfly-view-2.png"
              alt=""
              draggable={false}
              className="butterfly-frame butterfly-frame--alt"
              style={{ width: "100%", height: "auto", opacity: butterflyFrame === 2 ? 1 : 0 }}
            />
          </div>
        );
      }

      // Non-interactive decorative prop
      const isFlame = prop.id === "left-flame" || prop.id === "right-flame";
      const fishClass = prop.id === "school-of-fish" ? "explore-prop--fish-1" : prop.id === "school-of-fish-2" ? "explore-prop--fish-2" : "";
      return (
        <div
          key={prop.id}
          className={`explore-prop ${isFlame ? "explore-prop--flame" : ""} ${fishClass}`}
          style={{
            position: "absolute",
            left: `${prop.x}%`,
            top: `${prop.y}%`,
            width: `${prop.width}%`,
            transform: anchorTransform,
          }}
        >
          {propEl}
        </div>
      );
    });

  return (
    <div
      className={[
        "explore-screen",
        quaking ? "quake" : "",
        showFirstVisitTrace ? "explore-screen--first-visit-trace" : "",
      ].filter(Boolean).join(" ")}
      style={bgStyle}
      data-room-theme={firstVisitTraceConfig?.theme}
    >
      {/* PARKED for v1: mini-game overlay. `showMiniGames` is gated by
          MINI_GAMES_ENABLED (false) at the top of this file, so this
          branch never renders today — kept intact so flipping the flag
          revives the feature without re-plumbing the JSX. The active
          first-visit flow is the trace overlay rendered further below. */}
      {showMiniGames && (
        <div className="mg-overlay">
          <div className="mg-overlay__backdrop" />
          <div className="mg-overlay__panel">
            <DiscoverySession
              roomId={environmentId}
              facts={roomFacts.slice(0, 3)}
              onComplete={handleMiniGamesComplete}
              onBack={handleMiniGamesBack}
            />
          </div>
        </div>
      )}
      {/* Geartown atmospheric dust — two layered copies of dust.png drifting
          behind the props. The "catch" layer brightens once the lights flip
          on so the room feels like the new light is revealing dust in the
          air. Pointer-events: none so it never blocks gameplay. */}
      {environmentId === "industrial-tech-city" && (
        <div className={`geartown-dust ${lightsOn ? "geartown-dust--lit" : ""}`} aria-hidden="true">
          <img
            className="geartown-dust__layer geartown-dust__layer--bg"
            src="/assets/discovery%20rooms/geartown-workshop/dust.png"
            alt=""
            draggable={false}
          />
          <img
            className="geartown-dust__layer geartown-dust__layer--catch"
            src="/assets/discovery%20rooms/geartown-workshop/dust.png"
            alt=""
            draggable={false}
          />
        </div>
      )}

      {/* Coral Cove bubbles */}
      {environmentId === "small-coastal-village" && (
        <div className="coral-bubbles">
          <img className="bubble-img bubble-img--1" src="/assets/discovery rooms/coral-cove-village/bubbles.png" alt="" draggable={false} />
          <img className="bubble-img bubble-img--2" src="/assets/discovery rooms/coral-cove-village/bubbles.png" alt="" draggable={false} />
          <img className="bubble-img bubble-img--3" src="/assets/discovery rooms/coral-cove-village/bubbles.png" alt="" draggable={false} />
          <img className="bubble-img bubble-img--4" src="/assets/discovery rooms/coral-cove-village/bubbles.png" alt="" draggable={false} />
          <img className="bubble-img bubble-img--5" src="/assets/discovery rooms/coral-cove-village/bubbles.png" alt="" draggable={false} />
          <img className="bubble-img bubble-img--6" src="/assets/discovery rooms/coral-cove-village/bubbles.png" alt="" draggable={false} />
          <img className="bubble-img bubble-img--7" src="/assets/discovery rooms/coral-cove-village/bubbles.png" alt="" draggable={false} />
          <img className="bubble-img bubble-img--8" src="/assets/discovery rooms/coral-cove-village/bubbles.png" alt="" draggable={false} />
          <img className="bubble-img bubble-img--9" src="/assets/discovery rooms/coral-cove-village/bubbles.png" alt="" draggable={false} />
          <img className="bubble-img bubble-img--fg1" src="/assets/discovery rooms/coral-cove-village/bubbles.png" alt="" draggable={false} />
          <img className="bubble-img bubble-img--fg2" src="/assets/discovery rooms/coral-cove-village/bubbles.png" alt="" draggable={false} />
          <img className="bubble-img bubble-img--fg3" src="/assets/discovery rooms/coral-cove-village/bubbles.png" alt="" draggable={false} />
          <img className="bubble-img bubble-img--close1" src="/assets/discovery rooms/coral-cove-village/bubbles.png" alt="" draggable={false} />
          <img className="bubble-img bubble-img--close2" src="/assets/discovery rooms/coral-cove-village/bubbles.png" alt="" draggable={false} />
          <img className="bubble-img bubble-img--close3" src="/assets/discovery rooms/coral-cove-village/bubbles.png" alt="" draggable={false} />
          <img className="bubble-img bubble-img--close4" src="/assets/discovery rooms/coral-cove-village/bubbles.png" alt="" draggable={false} />
        </div>
      )}

      {/* Scene props */}
      {renderProps()}

      {/* Hotspot markers */}
      <div className="explore-hotspots">
        {env.hotspots.map((hotspot) => {
          const isTapped = tappedHotspotId === hotspot.id;
          const tapClass = isTapped ? `explore-hotspot--tap-${hotspot.tapAnimation}` : "";
          return (
            <button
              key={hotspot.id}
              className={`explore-hotspot explore-hotspot--${hotspot.idleAnimation} ${tapClass}`}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, background: "none", border: "none", padding: 0 }}
              onClick={() => handleHotspotClick(hotspot)}
              aria-label={hotspot.label}
            >
              <div className="explore-hotspot__marker" aria-hidden="true">{hotspot.emoji}</div>
              <div className="explore-hotspot__label">{hotspot.label}</div>
            </button>
          );
        })}
      </div>

      {/* Back button */}
      <button className="explore-back-btn" onClick={onBack} aria-label="Go back to map">
        ← Back
      </button>

      {/* Fact counter removed */}

      {/* Room completion progress (first visit only). Hidden during the
          first-visit trace so the trace screen reads as its own moment. */}
      {needsCompletion && !roomJustCompleted && !showMiniGames && !showFirstVisitTrace && (
        <div className="explore-room-progress">
          <span className="explore-room-progress__text">
            {factsViewedThisVisit.size === 0
              ? `View ${FACTS_REQUIRED} facts to complete this room`
              : `${factsViewedThisVisit.size} of ${FACTS_REQUIRED} facts viewed`
            }
          </span>
        </div>
      )}

      {/* Room Complete overlay */}
      {roomJustCompleted && (
        <div className="explore-room-complete">
          <div className="explore-room-complete__card">
            <span className="explore-room-complete__icon">🎉</span>
            <h2 className="explore-room-complete__title">Room Complete!</h2>
            <p className="explore-room-complete__sub">Great exploring!</p>
          </div>
        </div>
      )}

      {/* Hint text — hidden during the first-visit trace */}
      {!showFirstVisitTrace && (
        <div className="explore-hint">
          {needsCompletion && !roomJustCompleted
            ? "Tap objects and read facts to complete this room!"
            : "Tap objects to discover facts!"}
        </div>
      )}

      {/* Skip button — appears only during the first-visit trace so the
          trace stays optional. Tapping it reveals the room the same way
          completing the trace would. */}
      {showFirstVisitTrace && (
        <button
          className="explore-trace-skip"
          onClick={handleFirstVisitTraceComplete}
          aria-label="Skip the trace and continue"
        >
          Skip →
        </button>
      )}

      {/* Daily cap modal — hidden in dev or when VITE_DISABLE_COMPLETION_MODAL is set */}
      {!import.meta.env.DEV && !import.meta.env.VITE_DISABLE_COMPLETION_MODAL && showDailyCap && (
        <DailyCapModal onClose={() => setShowDailyCap(false)} />
      )}

      {/* Fact panel (bottom sheet) */}
      {activePanel && (
        <FactPanelSheet
          panel={activePanel}
          onClose={handleFactPanelClose}
          ambientColor={env.ambientColor}
          onFactViewed={(factId) => {
            setFactsViewedThisVisit((prev) => {
              const next = new Set(prev);
              next.add(factId);
              // Capture the fact whose narration end should trigger
              // discover-complete (the one that just crossed the threshold).
              if (
                needsCompletion &&
                !roomJustCompleted &&
                next.size >= FACTS_REQUIRED &&
                completingFactId === null
              ) {
                setCompletingFactId(factId);
              }
              return next;
            });
          }}
          onFactNarrationEnded={handleFactNarrationEnded}
        />
      )}

      {/* Hotspot popup */}
      {activeHotspot && (
        <HotspotPopup
          hotspot={activeHotspot}
          onClose={() => setActiveHotspot(null)}
        />
      )}

      {/* First-visit trace — SVG positioned center-stage on the empty
          background. All in-room props are hidden during this phase
          (see .explore-screen--first-visit-trace) so the letter is the
          single focal element. On success the props fade back in. */}
      {showFirstVisitTrace && traceLetterPath && traceTargetProp && (
        <>
          {/* Prompt label above the trace area */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "12%",
              transform: "translateX(-50%)",
              color: "#FFE08A",
              fontWeight: 800,
              fontSize: "calc(22px * var(--u))",
              letterSpacing: "calc(1px * var(--u))",
              textShadow: "0 calc(2px * var(--u)) 0 rgba(0, 0, 0, 0.6)",
              pointerEvents: "none",
              zIndex: 32,
            }}
          >
            Trace the letter
          </div>
          <svg
            ref={traceSvgRef}
            viewBox={traceLetterPath.viewBox}
            preserveAspectRatio="xMidYMid meet"
            data-trace-theme={firstVisitTraceConfig?.theme}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "30%",
              aspectRatio: "1",
              transform: "translate(-50%, -50%)",
              touchAction: "none",
              zIndex: 32,
            }}
            onPointerDown={traceValidator.onPointerDown}
            onPointerMove={traceValidator.onPointerMove}
            onPointerUp={traceValidator.onPointerUp}
            onPointerCancel={traceValidator.onPointerCancel}
          >
            {/* Hidden reference path for the global hit detector. The
                validator samples ALL waypoints across the combined geometry;
                only the visual rendering below is split per-stroke. */}
            <path
              ref={tracePathRef}
              d={traceLetterPath.d}
              fill="none"
              stroke="none"
              style={{ visibility: "hidden" }}
            />
            {/* Per-sub-path masks. Each subpath gets a matched pair:
                  - completed-mask: black bg + white stroke using the
                    subpath dasharray → reveals only traced segments
                  - pending-mask:   white bg + black stroke (inverse) →
                    HIDES the traced segments so flowing pending dashes
                    don't visually bleed through completed dashes
                strokeWidth 14 is wide enough to cover the visible
                stroke (≤9px) plus glow halos. */}
            <defs>
              {subpathInfo.map((sp, i) => (
                <React.Fragment key={`mask-${i}`}>
                  <mask id={`trace-completed-mask-${i}`}>
                    <rect width="100%" height="100%" fill="black" />
                    <path
                      d={sp.d}
                      stroke="white"
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      strokeDasharray={subpathDasharrays[i]}
                      strokeDashoffset={0}
                    />
                  </mask>
                  <mask id={`trace-pending-mask-${i}`}>
                    <rect width="100%" height="100%" fill="white" />
                    <path
                      d={sp.d}
                      stroke="black"
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      strokeDasharray={subpathDasharrays[i]}
                      strokeDashoffset={0}
                    />
                  </mask>
                </React.Fragment>
              ))}
            </defs>
            {/* Per-sub-path dim + pending + completed. Pending dashes flow
                in the trace direction; completed dashes lock in behind
                the finger. The pending mask hides flowing dashes in the
                traced region so completed dashes appear clean on top. */}
            {subpathInfo.map((sp, i) => (
              <g key={`sp-${i}`}>
                <path className="trace-moment__path-dim" d={sp.d} />
                <path className="trace-moment__path-track" d={sp.d} />
                <path
                  className="trace-moment__path-pending"
                  d={sp.d}
                  mask={`url(#trace-pending-mask-${i})`}
                />
                <path
                  className="trace-moment__path-completed"
                  d={sp.d}
                  mask={`url(#trace-completed-mask-${i})`}
                />
              </g>
            ))}
            {traceValidator.pointerPos && (
              <circle
                className="trace-moment__spark"
                cx={traceValidator.pointerPos.x}
                cy={traceValidator.pointerPos.y}
                r={3.2}
              />
            )}
            {/* Start-here indicator — pulsing ring + dot + arrow at the
                path's first point. Hides as soon as the kid begins tracing
                (any coverage progress). */}
            {activeStrokeStart && (
              <g className="trace-start" pointerEvents="none">
                <circle
                  className="trace-start__ring"
                  cx={activeStrokeStart.x}
                  cy={activeStrokeStart.y}
                />
                <circle
                  className="trace-start__dot"
                  cx={activeStrokeStart.x}
                  cy={activeStrokeStart.y}
                  r={2.2}
                />
                <text
                  className="trace-start__arrow"
                  x={activeStrokeStart.x}
                  y={activeStrokeStart.y > 50 ? activeStrokeStart.y - 7 : activeStrokeStart.y + 11}
                  textAnchor="middle"
                >
                  {activeStrokeStart.y > 50 ? "▼" : "▲"}
                </text>
              </g>
            )}
          </svg>
        </>
      )}

      {/* MVP embedded handwriting — Geartown power core only */}
      {tracePropTarget && tracePropTarget.id === "power-core" && (
        <TraceMoment
          letter="c"
          dimSrc="/assets/discovery rooms/geartown-workshop/power-core-not-glowing.png"
          activeSrc="/assets/discovery rooms/geartown-workshop/power-core-glowing.png"
          onComplete={handleTraceComplete}
          onSkip={handleTraceSkip}
        />
      )}
    </div>
  );
};

export default ExploreScreen;
