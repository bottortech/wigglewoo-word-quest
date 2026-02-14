// =============================================
// QuestMapScreen.tsx — Quest map with gear nodes,
//   glowing path, Word Quest Box, and Wigglewoo
// WiggleWoo's Word Quest
// =============================================

import React, { useMemo, useState, useEffect, useRef, useCallback, Component } from "react";
import type { Quest, NodeState } from "../game/types";
import {
  loadQuestProgress,
  isNodeTappable,
  loadTrophyProgress,
  getTrophyNodeState,
  areAllQuestsComplete,
  isQuestFullyComplete,
  hasTrophyUnlockBeenSeen,
  markTrophyUnlockSeen,
} from "../game/progression";
import { ALL_QUESTS, CVC_QUESTS, CVCC_QUESTS, CVVC_QUESTS } from "../game/wordData";
import heroImg from "../assets/wiggle_woo_hero_stance.png";
import badgeLogo from "../assets/wigglewoos_word_quest_badge-logo.png";
import trophyIcon from "../assets/trophy.png";
import Bulb from "../components/Bulb";
import GlassDisplayCase from "../components/GlassDisplayCase";
import UnlockModal from "../components/UnlockModal";
import ParentGate from "../components/ParentGate";
import "../styles/game.css";
import "../styles/home.css";
import "../styles/questmap.css";

// ---- ErrorBoundary (safety net) ----
interface EBProps { children: React.ReactNode }
interface EBState { error: Error | null }
class QuestMapErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 32, textAlign: "center", fontFamily: "sans-serif",
          background: "#fff3cd", color: "#856404", minHeight: "100vh",
        }}>
          <h2>⚠️ Quest Map failed to render</h2>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// 16 node positions - HORIZONTAL layout within safe zone
// Safe zone: 8% inset from all sides (usable area: 8% to 92%)
// Node 1 at left, Node 16 at right, arranged in two rows
const NODE_POSITIONS = [
  // Bottom row (nodes 1-8, left to right) - y=75% (within 8-92% safe zone)
  { x: 4, y: 95 },   // 1 — LOCKED
  { x: 14, y: 75 },   // 2 — LOCKED
  { x: 26, y: 88 },   // 3 — LOCKED
  { x: 39, y: 108 },   // 4 — LOCKED
  { x: 39, y: 78 },   // 5 — LOCKED
  { x: 53, y: 103 },   // 6
  { x: 69, y: 98 },   // 7 — LOCKED
  { x: 79, y: 78 },   // 8
  // Top row (nodes 9-16, left to right) - y=30% (within 8-92% safe zone)
  { x: 37, y: 58 },   // 9 — LOCKED
  { x: 6, y: 56 },   // 10 — LOCKED
  { x: 23, y: 30 },   // 11 — LOCKED
  { x: 37, y: 25 },   // 12 — LOCKED
  { x: 45, y: 7 },   // 13 — LOCKED
  { x: 62, y: 26 },   // 14 — LOCKED
  { x: 78, y: 22 },   // 15 — LOCKED
  { x: 86, y: 48 },   // 16 — LOCKED
];

// Trophy node position — ~65% along the curve between node 8 and node 9
// Node 8: (84, 75), Node 9: (14, 30), Curve control point: (89, 52.5)
// Quadratic Bezier at t=0.65 (closer to node 9, away from node 8)
// x = (1-t)²×84 + 2(1-t)t×89 + t²×14 ≈ 57
// y = (1-t)²×75 + 2(1-t)t×52.5 + t²×30 ≈ 46
const TROPHY_POSITION = { x: 52, y: 46 };

// Quest type definitions for Word Quest Box
type QuestType = "CVC" | "CVCC" | "CVVC" | "CCVC";

// Quest type lock rules:
// CVC: always unlocked
// CVCC: unlocked when ALL CVC quests (A,E,I,O,U) + trophies complete
// CVVC: unlocked when ALL CVCC quests complete
// CCVC: unlocked when ALL CVVC quests complete
function getQuestTypeLockState(): { id: QuestType; label: string; unlocked: boolean }[] {
  const cvcIds = CVC_QUESTS.map((q) => q.id);
  const cvccIds = CVCC_QUESTS.map((q) => q.id);
  const cvvcIds = CVVC_QUESTS.map((q) => q.id);
  return [
    { id: "CVC", label: "CVC", unlocked: true },
    { id: "CVCC", label: "CVCC", unlocked: areAllQuestsComplete(cvcIds) },
    { id: "CVVC", label: "CVVC", unlocked: areAllQuestsComplete(cvccIds) },
    { id: "CCVC", label: "CCVC", unlocked: areAllQuestsComplete(cvvcIds) },
  ];
}

const QUEST_TYPES = getQuestTypeLockState();

// =============================================
// QUEST CATALOG — track definitions per type
// Controls which tracks are shown in the UI.
// Does NOT rebuild word lists.
// =============================================
interface TrackDef {
  id: string;       // quest ID from wordData
  label: string;    // display label
  vowel: string;    // short display letter(s)
}

type QuestCatalog = Record<QuestType, {
  tracks: TrackDef[];
  defaultTrackId: string;
}>;

// CVC tracks — 5 short vowels
const CVC_TRACKS: TrackDef[] = [
  { id: "quest-short-a", label: "Short A", vowel: "A" },
  { id: "quest-short-e", label: "Short E", vowel: "E" },
  { id: "quest-short-i", label: "Short I", vowel: "I" },
  { id: "quest-short-o", label: "Short O", vowel: "O" },
  { id: "quest-short-u", label: "Short U", vowel: "U" },
];

// CVCC tracks — 5 short vowels (ending blends)
const CVCC_TRACKS: TrackDef[] = [
  { id: "quest-cvcc-short-a", label: "Short A", vowel: "A" },
  { id: "quest-cvcc-short-i", label: "Short I", vowel: "I" },
  { id: "quest-cvcc-short-o", label: "Short O", vowel: "O" },
  { id: "quest-cvcc-short-u", label: "Short U", vowel: "U" },
  { id: "quest-cvcc-short-e", label: "Short E", vowel: "E" },
];

// CVVC tracks — existing 5 quests mapped to vowel-team labels
// Future: expand to 25 vowel-pair tracks (AA, AE, AI, ...)
const CVVC_TRACKS: TrackDef[] = [
  { id: "quest-cvvc-long-a", label: "Long A Teams", vowel: "AI" },
  { id: "quest-cvvc-long-e", label: "Long E Teams", vowel: "EA" },
  { id: "quest-cvvc-long-o", label: "Long O Teams", vowel: "OA" },
  { id: "quest-cvvc-long-u", label: "OO Teams", vowel: "OO" },
  { id: "quest-cvvc-mixed-ea", label: "EA Teams", vowel: "EE" },
];

// CCVC tracks — placeholder (no quests in wordData yet)
const CCVC_TRACKS: TrackDef[] = [];

const QUEST_CATALOG: QuestCatalog = {
  CVC:  { tracks: CVC_TRACKS,  defaultTrackId: "quest-short-a" },
  CVCC: { tracks: CVCC_TRACKS, defaultTrackId: "quest-cvcc-short-a" },
  CVVC: { tracks: CVVC_TRACKS, defaultTrackId: "quest-cvvc-long-a" },
  CCVC: { tracks: CCVC_TRACKS, defaultTrackId: "" },
};

// Derive quest type from a quest's patternType
function questTypeFromPattern(patternType: string): QuestType {
  return patternType.toUpperCase() as QuestType;
}

// Gear SVG component for nodes — friendly rounded gear shape
const GearNode: React.FC<{
  state: NodeState;
  number: number;
  onClick: () => void;
  disabled: boolean;
}> = ({ state, number, onClick, disabled }) => {
  const isActive = state === "active";
  const isCompleted = state === "completed";

  // Mobile touch fallback — ensure taps register even with touch-action: manipulation
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!disabled) {
      e.preventDefault(); // Prevent ghost click delay
      onClick();
    }
  };

  return (
    <button
      className={`gear-node gear-node--${state}`}
      onClick={onClick}
      onTouchEnd={handleTouchEnd}
      disabled={disabled}
      aria-label={`Level ${number} — ${state}`}
    >
      <svg
        className={`gear-node__svg ${isActive ? "gear-node__svg--spinning" : ""}`}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Friendly rounded gear with 8 soft teeth */}
        <path
          className="gear-node__shape"
          d="M50 2
             C53 2 56 6 57 10 C60 9 64 8 67 10 C70 12 71 16 71 19
             C74 18 78 18 81 21 C84 24 84 28 83 31
             C86 33 89 36 90 40 C91 44 89 48 86 50
             C89 52 91 56 90 60 C89 64 86 67 83 69
             C84 72 84 76 81 79 C78 82 74 82 71 81
             C71 84 70 88 67 90 C64 92 60 91 57 90
             C56 94 53 98 50 98
             C47 98 44 94 43 90 C40 91 36 92 33 90 C30 88 29 84 29 81
             C26 82 22 82 19 79 C16 76 16 72 17 69
             C14 67 11 64 10 60 C9 56 11 52 14 50
             C11 48 9 44 10 40 C11 36 14 33 17 31
             C16 28 16 24 19 21 C22 18 26 18 29 19
             C29 16 30 12 33 10 C36 8 40 9 43 10
             C44 6 47 2 50 2 Z"
          fill="currentColor"
        />
        {/* Inner circle for content area */}
        <circle
          className="gear-node__inner"
          cx="50"
          cy="50"
          r="30"
          fill="currentColor"
        />
      </svg>
      
      {/* Node content: number (always shown) */}
      <span className="gear-node__content">
        {number}
      </span>

      {/* Completed badge — small green check circle */}
      {isCompleted && (
        <span className="gear-node__check-badge" aria-label="completed">✓</span>
      )}
      
      {/* Pulsing glow effect for active node only */}
      {isActive && <div className="gear-node__glow" />}
    </button>
  );
};

interface QuestMapScreenProps {
  quest: Quest;
  onStartLevel: (wordIndex: number) => void;
  onRestartQuest: () => void;
  onNextQuest: () => void;
  onSelectQuest?: (questId: string) => void;
  onGoHome?: () => void;
  onEnterTrophyRoom?: () => void;
  onViewTrophyRoom?: () => void;
  onOpenInsights?: () => void;
  arrivedFromWord: number | null;
  hasNextQuest: boolean;
  trophyJustEarned?: boolean; // true when coming from trophy-transition → triggers snap animation
}

const QuestMapInner: React.FC<QuestMapScreenProps> = ({
  quest,
  onStartLevel,
  onRestartQuest,
  onNextQuest,
  onSelectQuest,
  onGoHome,
  onEnterTrophyRoom,
  onViewTrophyRoom,
  onOpenInsights,
  arrivedFromWord,
  hasNextQuest,
}) => {
  const progress = useMemo(() => loadQuestProgress(quest.id), [quest.id]);
  const trophyProgress = useMemo(() => loadTrophyProgress(quest.id), [quest.id]);
  
  // Trophy node state
  const trophyNodeState = useMemo(() => 
    getTrophyNodeState(progress, trophyProgress), 
    [progress, trophyProgress]
  );
  
  // Generate states for all 16 nodes — linear progression, no mid-quest gate
  const nodeStates: NodeState[] = useMemo(() => {
    const states: NodeState[] = [];
    for (let i = 0; i < 16; i++) {
      if (progress.questComplete) {
        states.push("completed");
      } else if (i < progress.currentWordIndex) {
        states.push("completed");
      } else if (i === progress.currentWordIndex) {
        states.push("active");
      } else {
        states.push("locked");
      }
    }
    return states;
  }, [progress.questComplete, progress.currentWordIndex]);

  // Find active node index (could be a regular node OR trophy is active)
  const activeNodeIndex = useMemo(() => {
    // If trophy is active, WiggleWoo should be at trophy, not at a numbered node
    if (trophyNodeState === "active") {
      return -1; // Special case: WiggleWoo at trophy
    }
    return nodeStates.findIndex(s => s === "active");
  }, [nodeStates, trophyNodeState]);

  // =============================================
  // GUIDED ZOOM STATE (mobile navigation)
  // =============================================
  const [zoomState, setZoomState] = useState<'overview' | 'zoomed-node' | 'zoomed-trophy'>('overview');
  const [zoomTarget, setZoomTarget] = useState<{ x: number; y: number } | null>(null);
  const mapOverlayRef = useRef<HTMLDivElement>(null);
  
  // Detect if we're on mobile
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768 || 'ontouchstart' in window;
  }, []);

  // Detect landscape mobile — disable zoom for landscape phones
  const isLandscapeMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return isMobile && window.innerHeight <= 500;
  }, [isMobile]);

  // Calculate zoom target position based on active node or trophy
  useEffect(() => {
    if (!isMobile) {
      setZoomState('overview');
      setZoomTarget(null);
      return;
    }

    // Delay zoom-in slightly to allow initial render
    const zoomTimer = setTimeout(() => {
      if (trophyNodeState === "active") {
        // Trophy active: stronger zoom, center on trophy
        setZoomTarget({ x: TROPHY_POSITION.x, y: TROPHY_POSITION.y });
        setZoomState('zoomed-trophy');
      } else if (activeNodeIndex >= 0) {
        // Regular node active: standard zoom
        const pos = NODE_POSITIONS[activeNodeIndex];
        setZoomTarget({ x: pos.x, y: pos.y });
        setZoomState('zoomed-node');
      } else {
        // No active node (quest complete or initial): show overview
        setZoomState('overview');
        setZoomTarget(null);
      }
    }, 300);

    return () => clearTimeout(zoomTimer);
  }, [activeNodeIndex, trophyNodeState, isMobile]);

  // Completion animation: zoom out then refocus
  const [completionAnimating, setCompletionAnimating] = useState(false);
  
  useEffect(() => {
    if (arrivedFromWord !== null && isMobile) {
      // Node was just completed - trigger zoom-out then zoom-in sequence
      setCompletionAnimating(true);
      setZoomState('overview');
      
      const refocusTimer = setTimeout(() => {
        setCompletionAnimating(false);
        // Will re-trigger the zoom effect via the activeNodeIndex change
      }, 800);
      
      return () => clearTimeout(refocusTimer);
    }
  }, [arrivedFromWord, isMobile]);

  // Calculate CSS transform for guided zoom
  // Slightly less aggressive since landscape is enforced
  const zoomTransform = useMemo(() => {
    if (!isMobile || zoomState === 'overview' || !zoomTarget) {
      return {
        transform: 'scale(1) translate(0, 0)',
        transformOrigin: 'center center',
      };
    }

    // Reduced zoom levels for landscape-locked mobile
    const scale = zoomState === 'zoomed-trophy' ? 1.18 : 1.10;
    // Convert percentage to offset from center (50%)
    const offsetX = (50 - zoomTarget.x) * (scale - 1) * 0.75;
    const offsetY = (50 - zoomTarget.y) * (scale - 1) * 0.75;
    
    return {
      transform: `scale(${scale}) translate(${offsetX}%, ${offsetY}%)`,
      transformOrigin: `${zoomTarget.x}% ${zoomTarget.y}%`,
    };
  }, [zoomState, zoomTarget, isMobile]);

  // =============================================
  // WORD QUEST BOX STATE
  // =============================================
  // Derive initial quest type from the active quest prop (survives remount)
  const [selectedQuestType, setSelectedQuestType] = useState<QuestType>(
    () => questTypeFromPattern(quest.patternType)
  );
  const [questBoxView, setQuestBoxView] = useState<"types" | "vowels">("vowels");
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockModalType, setUnlockModalType] = useState<QuestType | null>(null);
  const activeVowelId = quest.id;

  // =============================================
  // DEV UNLOCK — bypass quest locks (DEV only)
  // =============================================
  const [devUnlock, setDevUnlock] = useState(() => {
    if (!import.meta.env.DEV) return false;
    return localStorage.getItem("ww_dev_unlock") === "true";
  });

  const toggleDevUnlock = () => {
    setDevUnlock((prev) => {
      const next = !prev;
      localStorage.setItem("ww_dev_unlock", String(next));
      return next;
    });
  };

  // Keyboard shortcuts: [ and ] to cycle quest types in DEV
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const handleDevKeys = (e: KeyboardEvent) => {
      if (e.key === "[" || e.key === "]") {
        const typeIds = QUEST_TYPES.map((t) => t.id);
        const idx = typeIds.indexOf(selectedQuestType);
        const next =
          e.key === "]"
            ? typeIds[(idx + 1) % typeIds.length]
            : typeIds[(idx - 1 + typeIds.length) % typeIds.length];
        handleQuestTypeSelect(next);
      }
    };
    window.addEventListener("keydown", handleDevKeys);
    return () => window.removeEventListener("keydown", handleDevKeys);
  }, [selectedQuestType, onSelectQuest]);

  // Compute effective unlock state (dynamic lock check + dev override)
  const effectiveQuestTypes = useMemo(() =>
    getQuestTypeLockState().map((type) => ({
      ...type,
      unlocked: devUnlock ? true : type.unlocked,
    })),
    [devUnlock]
  );

  // =============================================
  // PARENT GATE — guard for Learning Insights
  // =============================================
  const [showParentGate, setShowParentGate] = useState(false);

  // =============================================
  // LOCKED NODE FEEDBACK
  // =============================================
  const [shakingNodeIndex, setShakingNodeIndex] = useState<number | null>(null);
  const [shakingTrophy, setShakingTrophy] = useState(false);
  const [lockedToast, setLockedToast] = useState<string | null>(null);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const showLockedFeedback = useCallback((toast: string, setShake: () => void, clearShake: () => void) => {
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    setShake();
    setLockedToast(toast);
    shakeTimerRef.current = setTimeout(() => {
      clearShake();
      setLockedToast(null);
    }, 1200);
  }, []);

  const handleLockedTap = useCallback((nodeIndex: number) => {
    showLockedFeedback(
      "\uD83D\uDD12 Complete the current word first!",
      () => setShakingNodeIndex(nodeIndex),
      () => setShakingNodeIndex(null),
    );
  }, [showLockedFeedback]);

  const handleLockedTrophyTap = useCallback(() => {
    showLockedFeedback(
      "\uD83C\uDFC6 Complete all words to unlock the trophy!",
      () => setShakingTrophy(true),
      () => setShakingTrophy(false),
    );
  }, [showLockedFeedback]);

  // =============================================
  // TROPHY UNLOCK CELEBRATION (one-time)
  // =============================================
  const [trophyUnlockCelebrating, setTrophyUnlockCelebrating] = useState(false);

  useEffect(() => {
    // Trophy just became active (quest complete) and we haven't shown the celebration yet
    if (
      trophyNodeState === "active" &&
      !hasTrophyUnlockBeenSeen(quest.id)
    ) {
      // Small delay so the map renders first, then sparkle kicks in
      const timer = setTimeout(() => {
        setTrophyUnlockCelebrating(true);
        setLockedToast("\uD83C\uDFC6 Trophy unlocked!");
        markTrophyUnlockSeen(quest.id);

        // Auto-clear after animation
        setTimeout(() => {
          setTrophyUnlockCelebrating(false);
          setLockedToast(null);
        }, 2500);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [trophyNodeState, quest.id]);

  const handleInsightsClick = () => {
    setShowParentGate(true);
  };

  const handleParentGatePass = () => {
    setShowParentGate(false);
    if (onOpenInsights) onOpenInsights();
  };

  const handleParentGateCancel = () => {
    setShowParentGate(false);
  };

  const handleQuestTypeSelect = (type: QuestType) => {
    setSelectedQuestType(type);

    // Load the default track for this quest type
    const catalog = QUEST_CATALOG[type];
    if (catalog.defaultTrackId && onSelectQuest) {
      onSelectQuest(catalog.defaultTrackId);
    }
    setQuestBoxView("vowels");
  };

  const handleVowelSelect = (questId: string) => {
    if (onSelectQuest) {
      onSelectQuest(questId);
    }
  };

  const handleBackToTypes = () => {
    setQuestBoxView("types");
  };

  const isVowelUnlocked = (questId: string): boolean => {
    // Dev override — bypass all track locking
    if (devUnlock) return true;

    // Find which track list this quest belongs to
    const catalog = QUEST_CATALOG[selectedQuestType];
    const trackIndex = catalog.tracks.findIndex(t => t.id === questId);

    // First track in any type is always unlocked
    if (trackIndex <= 0) return true;

    // Track N unlocks when Track N-1 is fully complete (16 nodes + trophy)
    const prevTrackId = catalog.tracks[trackIndex - 1].id;
    return isQuestFullyComplete(prevTrackId);
  };

  // ---- WW positioning ----
  // Special value: 'trophy' means WW is at trophy node
  const initialWwLevel = useMemo(() => {
    if (trophyNodeState === "active") {
      return 'trophy' as const;
    }
    return progress.currentWordIndex;
  }, []);
  
  const [wwLevel, setWwLevel] = useState<number | 'trophy'>(
    arrivedFromWord !== null ? arrivedFromWord : initialWwLevel
  );
  const [wwAnimating, setWwAnimating] = useState(false);
  const animTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Case 1: Arrived from node 16 (index 15), trophy is active → animate to trophy
    if (arrivedFromWord === 15 && trophyNodeState === "active") {
      setWwLevel(15); // Start at node 16
      setWwAnimating(false);
      animTimerRef.current = setTimeout(() => {
        setWwAnimating(true);
        setWwLevel('trophy'); // Slide to trophy
      }, 80);
    }
    // Case 2: Arrived back from trophy room (trophy now complete)
    // → WW stays at trophy, quest fully done
    else if (arrivedFromWord === 15 && trophyProgress.trophyRoomComplete) {
      setWwLevel('trophy');
      setWwAnimating(false);
    }
    // Case 3: Normal node-to-node movement
    else if (arrivedFromWord !== null && arrivedFromWord !== progress.currentWordIndex) {
      setWwLevel(arrivedFromWord);
      setWwAnimating(false);
      animTimerRef.current = setTimeout(() => {
        setWwAnimating(true);
        setWwLevel(progress.currentWordIndex);
      }, 80);
    }
    // Case 4: Trophy is active but no animation needed (fresh load)
    else if (trophyNodeState === "active" && arrivedFromWord === null) {
      setWwLevel('trophy');
    }
    
    return () => { if (animTimerRef.current) clearTimeout(animTimerRef.current); };
  }, [arrivedFromWord, progress.currentWordIndex, trophyNodeState, trophyProgress.trophyRoomComplete]);

  // Calculate WW position based on active node (horizontal layout)
  // Special case: when trophy node is active, position WW at trophy
  const wwPosition = useMemo(() => {
    // If WW level is 'trophy', position at trophy node
    if (wwLevel === 'trophy') {
      return {
        left: `${TROPHY_POSITION.x}%`,
        top: `calc(${TROPHY_POSITION.y}% - 70px)`,
        transform: 'translateX(-50%)',
      };
    }
    // Normal node positioning
    const nodeIdx = Math.min(wwLevel, NODE_POSITIONS.length - 1);
    const pos = NODE_POSITIONS[nodeIdx];
    return {
      left: `${pos.x}%`,
      top: `calc(${pos.y}% - 70px)`,
      transform: 'translateX(-50%)',
    };
  }, [wwLevel]);

  // Generate SVG path for the glowing learning line (horizontal flow)
  const pathD = useMemo(() => {
    // Path flows: 1→2→3→...→16 → TROPHY (linear, trophy at the end)
    const points = NODE_POSITIONS;
    
    // Full path through all 16 nodes
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < 16; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    
    // Node 16 to Trophy node (final reward)
    d += ` L ${TROPHY_POSITION.x} ${TROPHY_POSITION.y}`;
    
    return d;
  }, []);

  return (
    <div className="machine-world">
      {/* ---- Mechanical environment (bulbs only — left machine removed for now) ---- */}
      <div className="bulb-overlay">
        <Bulb className="bulb-top-1" interval={4000} delay={300} onDuration={1400} />
        <Bulb className="bulb-top-2" interval={3500} delay={1200} onDuration={1200} />
        <Bulb className="bulb-top-3" interval={4500} delay={2000} onDuration={1300} />
        <Bulb className="bulb-top-4" interval={3800} delay={700} onDuration={1100} />
      </div>

      {/* TITLE BADGE — top-left, clickable home button */}
      <img 
        src={badgeLogo} 
        alt="WiggleWoo's Word Quest - Go Home" 
        className="title-badge title-badge--clickable"
        draggable={false}
        onClick={onGoHome}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onGoHome?.()}
      />

      {/* TROPHY SHOWCASE — below badge logo, glass display case */}
      <div 
        className={`trophy-showcase ${trophyProgress.trophyRoomComplete ? 'trophy-showcase--clickable' : ''}`}
        onClick={() => trophyProgress.trophyRoomComplete && onViewTrophyRoom?.()}
        role={trophyProgress.trophyRoomComplete ? "button" : undefined}
        tabIndex={trophyProgress.trophyRoomComplete ? 0 : undefined}
      >
        <GlassDisplayCase
          earned={trophyProgress.trophyRoomComplete}
          patternType={quest.patternType}
          size="medium"
        />
      </div>

      {/* WORD QUEST BOX — right side */}
      <div className="word-quest-box">
        <div className="word-quest-box__header">
          {questBoxView === "vowels" && (
            <button 
              className="word-quest-box__back-btn"
              onClick={handleBackToTypes}
              aria-label="Back to quest types"
            >
              ←
            </button>
          )}
          <span className="word-quest-box__title">
            {questBoxView === "types" ? "Quest Type" : `${selectedQuestType} Quests`}
          </span>
        </div>
        
        <div className="word-quest-box__content">
          {questBoxView === "types" ? (
            <div className="word-quest-box__types">
              {effectiveQuestTypes.map((type) => (
                <button
                  key={type.id}
                  className={`word-quest-box__type-btn ${
                    selectedQuestType === type.id ? "word-quest-box__type-btn--active" : ""
                  } ${!type.unlocked ? "word-quest-box__type-btn--locked" : ""}`}
                  onClick={() => {
                    if (type.unlocked) {
                      handleQuestTypeSelect(type.id);
                    } else {
                      setUnlockModalType(type.id);
                      setShowUnlockModal(true);
                    }
                  }}
                >
                  {type.label}
                  {!type.unlocked && <span className="word-quest-box__lock">🔒</span>}
                </button>
              ))}
            </div>
          ) : (
            <div className="word-quest-box__vowels">
              {QUEST_CATALOG[selectedQuestType].tracks.map((track) => {
                const isActive = activeVowelId === track.id;
                const isUnlocked = devUnlock || isVowelUnlocked(track.id);
                return (
                  <button
                    key={track.id}
                    className={`word-quest-box__vowel-btn ${
                      isActive ? "word-quest-box__vowel-btn--active" : ""
                    } ${!isUnlocked ? "word-quest-box__vowel-btn--locked" : ""}`}
                    onClick={() => isUnlocked && handleVowelSelect(track.id)}
                    disabled={!isUnlocked}
                  >
                    <span className="word-quest-box__vowel-letter">{track.vowel}</span>
                    <span className="word-quest-box__vowel-label">{track.label}</span>
                    {!isUnlocked && <span className="word-quest-box__lock">🔒</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* LEARNING INSIGHTS — Parent/Teacher button */}
      <button
        className="insights-map-btn"
        onClick={handleInsightsClick}
        title="Learning Insights (For Parents & Teachers)"
      >
        📊 Insights
      </button>

      {/* DEV UNLOCK TOGGLE — only visible in development */}
      {import.meta.env.DEV && (
        <button
          className={`dev-unlock-btn ${devUnlock ? "dev-unlock-btn--active" : ""}`}
          onClick={toggleDevUnlock}
          title={`Dev Unlock: ${devUnlock ? "ON" : "OFF"} — [ ] to cycle quests`}
        >
          🔓 Dev {devUnlock ? "ON" : "OFF"}
        </button>
      )}

      {/* DEBUG LABEL — temporary routing verification */}
      {import.meta.env.DEV && (
        <div className="dev-debug-label">
          ActiveQuest: {quest.patternType.toUpperCase()} ({quest.id})<br />
          ActiveTrack: {quest.title}
        </div>
      )}

      {/* Decorative pipe strips */}
      <div className="machine-world-pipes-top" />
      <div className="machine-world-pipes-bottom" />
      <span className="machine-bolt machine-bolt--tl" />
      <span className="machine-bolt machine-bolt--tr" />
      <span className="machine-bolt machine-bolt--bl" />
      <span className="machine-bolt machine-bolt--br" />

      {/* Quest Map Overlay (inside blue frame area) */}
      <div 
        ref={mapOverlayRef}
        className="quest-map-overlay"
      >
        {/* DEV: Red dashed guideline for safe-zone calibration */}
        <div className="quest-map-guideline" />
        
        {/* Glowing learning path SVG */}
        <svg className="learning-path" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pathGlow" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#4FC3F7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#81D4FA" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#B3E5FC" stopOpacity="0.4" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* Background glow path */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#pathGlow)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#glow)"
            className="learning-path__line"
          />
          {/* Foreground bright path */}
          <path
            d={pathD}
            fill="none"
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="4 6"
            className="learning-path__dots"
          />
        </svg>

        {/* 16 Gear Nodes */}
        {NODE_POSITIONS.map((pos, i) => {
          const state = nodeStates[i];
          const tappable = isNodeTappable(state);
          const isActiveNode = state === "active";
          // Only dim nodes during active zoom transitions, NOT in normal view
          const shouldDim = false; // Disabled — nodes should always be solid
          const shouldDimHard = false;
          
          return (
            <div
              key={i}
              className={`gear-node-wrapper ${shakingNodeIndex === i ? 'gear-node-wrapper--shaking' : ''}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
              }}
            >
              <GearNode
                state={state}
                number={i + 1}
                onClick={() => {
                  if (tappable) {
                    onStartLevel(i);
                  } else if (state === 'locked') {
                    handleLockedTap(i);
                  }
                }}
                disabled={false}
              />
            </div>
          );
        })}

        {/* Trophy Node — bonus node on path between node 8 and node 9 */}
        <div
          className={`trophy-node-wrapper ${
            isMobile && zoomState === 'zoomed-trophy' ? 'trophy-node-wrapper--focused' : ''
          }${trophyUnlockCelebrating ? ' trophy-node-wrapper--celebrating' : ''}`}
          style={{
            position: 'absolute',
            left: `${TROPHY_POSITION.x}%`,
            top: `${TROPHY_POSITION.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 15,
          }}
        >
          {/* Layer 1: Localized vignette/dimming around trophy */}
          <div className="trophy-node__vignette" />
          
          {/* Layer 2: Large soft spotlight glow behind trophy */}
          <div className="trophy-node__spotlight" />
          
          {/* Layer 3: Pedestal highlight ring beneath trophy */}
          <div className="trophy-node__pedestal" />
          
          {/* Layer 4: Animated sparkles */}
          <div className="trophy-node__sparkles">
            <span className="trophy-sparkle trophy-sparkle--1" />
            <span className="trophy-sparkle trophy-sparkle--2" />
            <span className="trophy-sparkle trophy-sparkle--3" />
            <span className="trophy-sparkle trophy-sparkle--4" />
            <span className="trophy-sparkle trophy-sparkle--5" />
            <span className="trophy-sparkle trophy-sparkle--6" />
          </div>
          
          <button
            className={`trophy-node trophy-node--${trophyNodeState}${shakingTrophy ? ' trophy-node--shaking' : ''}`}
            onClick={() => {
              if (trophyNodeState === "active") {
                onEnterTrophyRoom?.();
              } else if (trophyNodeState === "locked") {
                handleLockedTrophyTap();
              }
            }}
            disabled={false}
            aria-label={`Trophy Room — ${trophyNodeState}`}
          >
            <img 
              src={trophyIcon} 
              alt="Trophy" 
              className="trophy-node__img"
              draggable={false}
            />
            {trophyNodeState === "active" && (
              <div className="trophy-node__glow" />
            )}
            {trophyNodeState === "completed" && (
              <span className="trophy-node__check">✓</span>
            )}
          </button>
        </div>

        {/* WiggleWoo positioned near active node or trophy */}
        {(activeNodeIndex >= 0 || trophyNodeState === "active") && (
          <div
            className={`map-wigglewoo ${wwAnimating ? "map-wigglewoo--moving" : ""}`}
            style={wwPosition}
          >
            <img
              src={heroImg}
              alt="WiggleWoo"
              className="map-wigglewoo__img"
              draggable={false}
            />
          </div>
        )}

        {/* Quest complete banner — only after trophy room is done */}
        {progress.questComplete && trophyProgress.trophyRoomComplete && (
          <div className="quest-complete-overlay">
            <div className="quest-complete-banner">
              <span className="quest-complete-banner__icon">🏆</span>
              <span className="quest-complete-banner__text">Quest Complete!</span>
              <div className="quest-complete-banner__actions">
                <button className="quest-complete-btn" onClick={onRestartQuest}>
                  🔄 Play Again
                </button>
                {hasNextQuest && (
                  <button className="quest-complete-btn quest-complete-btn--next" onClick={onNextQuest}>
                    ➡️ Next Quest
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LOCKED NODE TOAST */}
      {lockedToast && (
        <div className="locked-toast" key={lockedToast}>
          {lockedToast}
        </div>
      )}

      {/* Restart link (during quest, not at completion) */}
      {!progress.questComplete && progress.currentWordIndex > 0 && (
        <button
          className="map-restart-btn"
          onClick={onRestartQuest}
        >
          ↩ Restart Quest
        </button>
      )}

      {/* UNLOCK MODAL — shown when clicking a locked quest type */}
      {showUnlockModal && unlockModalType && (
        <UnlockModal
          questType={unlockModalType}
          onClose={() => setShowUnlockModal(false)}
        />
      )}

      {/* PARENT GATE — guard for Learning Insights */}
      {showParentGate && (
        <ParentGate
          onPass={handleParentGatePass}
          onCancel={handleParentGateCancel}
        />
      )}
    </div>
  );
};

const QuestMapScreen: React.FC<QuestMapScreenProps> = (props) => (
  <QuestMapErrorBoundary>
    <QuestMapInner {...props} />
  </QuestMapErrorBoundary>
);

export default QuestMapScreen;
