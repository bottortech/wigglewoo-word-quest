// =============================================
// QuestMapScreen.tsx — Quest map with gear nodes,
//   glowing path, Word Quest Box, and Wigglewoo
// WiggleWoo's Word Quest
// =============================================

import React, { useMemo, useState, useEffect, useRef, useCallback, Component } from "react";
import type { Quest, NodeState } from "../game/types";
import { FIRST_HALF_WORDS } from "../game/types";
import {
  loadQuestProgress,
  isNodeTappable,
  loadTrophyProgress,
  getTrophyNodeState,
  loadDiscoveryProgress,
  areAllQuestsComplete,
  hasTrophyUnlockBeenSeen,
  markTrophyUnlockSeen,
  loadNodeRatings,
  isQuestFullyComplete,
} from "../game/progression";
import { getActiveSkinAssets } from "../game/skins";
import { CVC_QUEST_IDS, CVCC_QUEST_IDS, MAGIC_E_QUEST_IDS, CVVC_QUEST_IDS, ADVANCED_QUEST_IDS } from "../game/questIds";
import { loadCvccQuests, loadCvvcQuests, loadMagicEQuests, loadAdvancedQuests, areAllImageWordsComplete } from "../game/wordData";
import heroImg from "../assets/wiggle_woo_hero_stance.png";
import badgeLogo from "../assets/wigglewoos_word_quest_badge-logo.png";
import trophyIcon from "../assets/trophy.png";
import GlassDisplayCase from "../components/GlassDisplayCase";
import UnlockModal from "../components/UnlockModal";
import ParentGate from "../components/ParentGate";
import WaterBaseLayer from "../components/WaterBaseLayer";
// import RiverLayer from "../components/RiverLayer"; // temp hidden
import WaterAmbientLayer from "../components/WaterAmbientLayer";
import WaterSparklesLayer from "../components/WaterSparklesLayer";
import IslandLayer from "../components/IslandLayer";
import SkyLayer from "../components/SkyLayer";
import { playNewChallengePhrase, playEvent } from "../audio/SoundEffects";
import { isEnvironmentUnlocked, QUEST_ENVIRONMENT_MAP } from "../game/exploreData";
import "../styles/game.css";
import "../styles/home.css";
import "../styles/questmap.css";
import "../styles/challenge-mode.css";
import { isChallengeUnlocked } from "../game/progression";

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
  { x: 12, y: 93 },   // 1 — LOCKED
  { x: 18, y: 77 },   // 2 — LOCKED
  { x: 10, y: 67 },   // 3 — LOCKED
  { x: 28, y: 67 },   // 4 — LOCKED
  { x: 35, y: 78 },   // 5 — LOCKED
  { x: 60, y: 94 },   // 6
  { x: 79, y: 90 },   // 7 — LOCKED
  { x: 67, y: 74 },   // 8
  // Top row (nodes 9-16, left to right) - y=30% (within 8-92% safe zone)
  { x: 37, y: 58 },   // 9 — LOCKED
  { x: 14, y: 51 },   // 10 — LOCKED
  { x: 23, y: 30 },   // 11 — LOCKED
  { x: 37, y: 31 },   // 12 — LOCKED
  { x: 45, y: 17 },   // 13 — LOCKED
  { x: 62, y: 39 },   // 14 — LOCKED
  { x: 78, y: 22 },   // 15 — LOCKED
  { x: 86, y: 48 },   // 16 — LOCKED
];

// Trophy node position — ~65% along the curve between node 8 and node 9
// Node 8: (84, 75), Node 9: (14, 30), Curve control point: (89, 52.5)
// Quadratic Bezier at t=0.65 (closer to node 9, away from node 8)
// x = (1-t)²×84 + 2(1-t)t×89 + t²×14 ≈ 57
// y = (1-t)²×75 + 2(1-t)t×52.5 + t²×30 ≈ 46
const TROPHY_POSITION = { x: 52, y: 46 };

// Discovery room node position — after node 16 (86, 48), slightly offset
const DISCOVERY_POSITION = { x: 92, y: 32 };

// Discovery room preview — images for the top-of-screen reward shelf
const DISCOVERY_ROOM_PREVIEWS: { envId: string; image: string; label: string }[] = [
  { envId: "valcano", image: "/assets/volcano-no-erupt.png", label: "Rumble Peak" },
  { envId: "castle-island", image: "/assets/castle-island.png", label: "Stonewall Castle" },
  { envId: "small-coastal-village", image: "/assets/small-coastal-village.png", label: "Coral Cove" },
  { envId: "industrial-tech-city", image: "/assets/industrial-tech-city.png", label: "Geartown" },
  { envId: "glass-dome", image: "/assets/glass-dome.png", label: "Greenhouse" },
];

// Get all quest IDs in the same tier as a given quest
function getTierQuestIds(questId: string): readonly string[] {
  if (CVC_QUEST_IDS.includes(questId as typeof CVC_QUEST_IDS[number])) return CVC_QUEST_IDS;
  if (CVCC_QUEST_IDS.includes(questId as typeof CVCC_QUEST_IDS[number])) return CVCC_QUEST_IDS;
  if (MAGIC_E_QUEST_IDS.includes(questId as typeof MAGIC_E_QUEST_IDS[number])) return MAGIC_E_QUEST_IDS;
  if (CVVC_QUEST_IDS.includes(questId as typeof CVVC_QUEST_IDS[number])) return CVVC_QUEST_IDS;
  if (ADVANCED_QUEST_IDS.includes(questId as typeof ADVANCED_QUEST_IDS[number])) return ADVANCED_QUEST_IDS;
  return [questId];
}

// Quest type definitions for Word Quest Box
// 5 tiers in order: CVC → Blending → Magic E → Vowel Teams → Advanced
type QuestType = "CVC" | "CVCC" | "MAGIC_E" | "CVVC" | "ADVANCED";

// Tier unlock rules (sequential):
// CVC: always unlocked
// Blending Power: all CVC complete OR placement
// Magic E: all CVCC complete OR placement
// Vowel Teams: all Magic E complete OR placement
// Advanced: all CVVC complete OR placement

/** Check if a tier was unlocked via placement test */
function isPlacementUnlocked(tier: string): boolean {
  try {
    const raw = localStorage.getItem("ww_placement_tiers");
    if (!raw) return false;
    const tiers: string[] = JSON.parse(raw);
    return tiers.includes(tier);
  } catch {
    return false;
  }
}

// Tiers that ship in this release. Everything else is shown as
// "Coming soon" and locked regardless of placement / completion state.
// Expand this set as Magic E / Vowel Teams / Advanced ship.
// V1 ships CVC only. Blending Power (CVCC) is parked for the 1.1 update —
// flip this back to ["CVC", "CVCC"] when re-enabling.
const SHIPPED_TIERS: ReadonlySet<QuestType> = new Set<QuestType>(["CVC"]);

function isTierShipped(tier: QuestType): boolean {
  return SHIPPED_TIERS.has(tier);
}

function getQuestTypeLockState(): { id: QuestType; label: string; unlocked: boolean; unlockHint?: string; comingSoon?: boolean }[] {
  const raw: { id: QuestType; label: string; unlocked: boolean; unlockHint?: string }[] = [
    { id: "CVC", label: "Sound Builders", unlocked: true },
    { id: "CVCC", label: "Blending Power", unlocked: areAllQuestsComplete([...CVC_QUEST_IDS]) || isPlacementUnlocked("CVCC"), unlockHint: "Complete all Sound Builder quests to unlock" },
    { id: "MAGIC_E", label: "Magic E", unlocked: areAllQuestsComplete([...CVCC_QUEST_IDS]) || isPlacementUnlocked("MAGIC_E"), unlockHint: "Complete all Blending Power quests to unlock" },
    { id: "CVVC", label: "Vowel Teams", unlocked: areAllQuestsComplete([...MAGIC_E_QUEST_IDS]) || isPlacementUnlocked("CVVC"), unlockHint: "Complete all Magic E quests to unlock" },
    { id: "ADVANCED", label: "Advanced Reading", unlocked: areAllQuestsComplete([...CVVC_QUEST_IDS]) || isPlacementUnlocked("ADVANCED"), unlockHint: "Complete all Vowel Team quests to unlock" },
  ];

  return raw.map((t) =>
    isTierShipped(t.id)
      ? t
      : { ...t, unlocked: false, comingSoon: true, unlockHint: "Coming soon!" },
  );
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

// CVC tracks — 5 short vowels (A → I → O → U → E progression order)
const CVC_TRACKS: TrackDef[] = [
  { id: "quest-short-a", label: "Short A", vowel: "A" },
  { id: "quest-short-i", label: "Short I", vowel: "I" },
  { id: "quest-short-o", label: "Short O", vowel: "O" },
  { id: "quest-short-u", label: "Short U", vowel: "U" },
  { id: "quest-short-e", label: "Short E", vowel: "E" },
];

// CVCC tracks — 5 short vowels (ending blends)
const CVCC_TRACKS: TrackDef[] = [
  { id: "quest-cvcc-short-a", label: "Short A", vowel: "A" },
  { id: "quest-cvcc-short-i", label: "Short I", vowel: "I" },
  { id: "quest-cvcc-short-o", label: "Short O", vowel: "O" },
  { id: "quest-cvcc-short-u", label: "Short U", vowel: "U" },
  { id: "quest-cvcc-short-e", label: "Short E", vowel: "E" },
];

// Magic E tracks — 4 vowels + mixed review
const MAGIC_E_TRACKS: TrackDef[] = [
  { id: "quest-magic-e-a", label: "Long A (a_e)", vowel: "A" },
  { id: "quest-magic-e-i", label: "Long I (i_e)", vowel: "I" },
  { id: "quest-magic-e-o", label: "Long O (o_e)", vowel: "O" },
  { id: "quest-magic-e-u", label: "Long U (u_e)", vowel: "U" },
  { id: "quest-magic-e-mixed", label: "Mixed Review", vowel: "MIX" },
];

// CVVC tracks — vowel teams
const CVVC_TRACKS: TrackDef[] = [
  { id: "quest-cvvc-long-a", label: "Long A Teams", vowel: "AI" },
  { id: "quest-cvvc-long-e", label: "Long E Teams", vowel: "EA" },
  { id: "quest-cvvc-long-o", label: "Long O Teams", vowel: "OA" },
  { id: "quest-cvvc-long-u", label: "OO Teams", vowel: "OO" },
  { id: "quest-cvvc-mixed-ea", label: "EA Teams", vowel: "EE" },
];

// Advanced Reading tracks — r-controlled + multisyllable
const ADVANCED_TRACKS: TrackDef[] = [
  { id: "quest-adv-ar-or", label: "AR & OR", vowel: "AR" },
  { id: "quest-adv-er-ir-ur", label: "ER, IR & UR", vowel: "ER" },
  { id: "quest-adv-bossy-r-mix", label: "Bossy R Mix", vowel: "R" },
  { id: "quest-adv-2syl-closed", label: "2-Syllable", vowel: "2S" },
  { id: "quest-adv-mixed-mastery", label: "Mixed Mastery", vowel: "MX" },
];

const QUEST_CATALOG: QuestCatalog = {
  CVC:      { tracks: CVC_TRACKS,      defaultTrackId: "quest-short-a" },
  CVCC:     { tracks: CVCC_TRACKS,     defaultTrackId: "quest-cvcc-short-a" },
  MAGIC_E:  { tracks: MAGIC_E_TRACKS,  defaultTrackId: "quest-magic-e-a" },
  CVVC:     { tracks: CVVC_TRACKS,     defaultTrackId: "quest-cvvc-long-a" },
  ADVANCED: { tracks: ADVANCED_TRACKS, defaultTrackId: "quest-adv-ar-or" },
};

// Derive quest type from a quest's patternType
function questTypeFromPattern(patternType: string): QuestType {
  const map: Record<string, QuestType> = {
    cvc: "CVC",
    cvcc: "CVCC",
    "magic-e": "MAGIC_E",
    cvvc: "CVVC",
    advanced: "ADVANCED",
  };
  return map[patternType] ?? "CVC";
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
  onSelectQuest?: (questId: string) => void;
  onGoHome?: () => void;
  onEnterTrophyRoom?: () => void;
  onViewTrophyRoom?: () => void;
  onEnterDiscoveryRoom?: () => void;
  onOpenInsights?: () => void;
  onExplore?: (envId: string) => void;
  onOpenWardrobe?: () => void;
  hasNewSkin?: boolean;
  onDevResetAll?: () => void;
  arrivedFromWord: number | null;
  trophyJustEarned?: boolean;
  challengeMode?: boolean;
  onToggleChallengeMode?: () => void;
}

const QuestMapInner: React.FC<QuestMapScreenProps> = ({
  quest,
  onStartLevel,
  onRestartQuest,
  onSelectQuest,
  onGoHome,
  onEnterTrophyRoom,
  onViewTrophyRoom,
  onEnterDiscoveryRoom,
  onOpenInsights,
  onExplore,

  onOpenWardrobe,
  hasNewSkin,
  onDevResetAll,
  arrivedFromWord,
  challengeMode: _challengeMode,
  onToggleChallengeMode: _onToggleChallengeMode,
}) => {
  void _challengeMode; void _onToggleChallengeMode;

  // First-time onboarding arrow — show once ever.
  // ?onboarding=reset/off URL flags are dev-only; stripped from production builds.
  const [showOnboardingArrow, setShowOnboardingArrow] = useState(() => {
    if (import.meta.env.DEV) {
      const params = new URLSearchParams(window.location.search);
      if (params.get("onboarding") === "off") return false;
      if (params.get("onboarding") === "reset") {
        localStorage.removeItem("ww_onboarding_arrow_seen");
        return true;
      }
    }
    return localStorage.getItem("ww_onboarding_arrow_seen") !== "true";
  });

  const handleOnboardingTap = useCallback(() => {
    localStorage.setItem("ww_onboarding_arrow_seen", "true");
    setShowOnboardingArrow(false);
    onStartLevel(0); // Start level 1 directly
  }, [onStartLevel]);

  const progress = useMemo(() => loadQuestProgress(quest.id), [quest.id]);
  const trophyProgress = useMemo(() => loadTrophyProgress(quest.id), [quest.id]);
  const discoveryProgress = useMemo(() => loadDiscoveryProgress(quest.id), [quest.id]);

  // Count image vs decode words
  const imageWordCount = useMemo(() =>
    quest.words.filter(w => (w.mode ?? "image") === "image").length,
    [quest.words]
  );
  const wordCount = quest.words.length;

  // Check if decode nodes are unlocked
  // Requires ALL image words across ALL quests in this tier to be complete
  const tierQuestIds = useMemo(() => getTierQuestIds(quest.id), [quest.id]);
  const decodeUnlocked = useMemo(() => {
    return areAllImageWordsComplete(tierQuestIds);
  }, [tierQuestIds, progress.currentWordIndex]);

  // Detect decode unlock moment — show modal once per quest
  const [decodeJustUnlocked, setDecodeJustUnlocked] = useState(false);
  const [showDecodeModal, setShowDecodeModal] = useState(false);
  const decodeSeenKey = `ww_decode_seen_${quest.id}`;
  const prevDecodeUnlocked = useRef(decodeUnlocked);
  useEffect(() => {
    if (decodeUnlocked && !prevDecodeUnlocked.current) {
      const alreadySeen = localStorage.getItem(decodeSeenKey) === "true";
      if (!alreadySeen) {
        setDecodeJustUnlocked(true);
        setShowDecodeModal(true);
        playEvent("decode-unlock");
        localStorage.setItem(decodeSeenKey, "true");
        // Glow fades after 3s
        const timer = setTimeout(() => setDecodeJustUnlocked(false), 3000);
        return () => clearTimeout(timer);
      }
    }
    prevDecodeUnlocked.current = decodeUnlocked;
  }, [decodeUnlocked, decodeSeenKey]);

  const handleDecodeStart = useCallback(() => {
    setShowDecodeModal(false);
    // Jump to first decode node
    onStartLevel(imageWordCount);
  }, [imageWordCount, onStartLevel]);

  const handleDecodeStayOnMap = useCallback(() => {
    setShowDecodeModal(false);
  }, []);

  // Quest fully done — nodes, path, trophy, discovery, WiggleWoo all hidden
  const questFullyDone = progress.questComplete && trophyProgress.tier === "full" && discoveryProgress.discoveryRoomComplete;

  // V1-end: every CVC vowel quest fully complete (nodes + trophy + discovery
  // for all 5). When true the map switches into "free explore" mode — every
  // landmark becomes a direct tap-to-room, the discovery cluster gets a
  // beacon arrow, and quest UI fades back out of the way. The component is
  // keyed on map+skin revision in App.tsx, so this is recomputed naturally
  // whenever progress can have changed.
  const allCvcComplete = areAllQuestsComplete([...CVC_QUEST_IDS]);

  // Per-environment completion set — drives the green ✓ checkmarks on
  // landmarks. Earned per-vowel as the player progresses, NOT gated on
  // allCvcComplete.
  const completedEnvs = (() => {
    const set = new Set<string>();
    for (const qid of CVC_QUEST_IDS) {
      if (!isQuestFullyComplete(qid)) continue;
      const envId = QUEST_ENVIRONMENT_MAP[qid];
      if (envId) set.add(envId);
    }
    return set;
  })();

  // Trophy node state — midpoint of IMAGE words only
  const trophyNodeState = useMemo(() =>
    getTrophyNodeState(progress, trophyProgress),
    [progress, trophyProgress, imageWordCount]
  );

  // Discovery room node state — triggers after image words complete
  // Discovery room ONLY unlocks after ALL 16 nodes complete (image + decode)
  const discoveryNodeState = useMemo(() => {
    if (progress.currentWordIndex < wordCount) return "locked" as NodeState;
    if (!discoveryProgress.discoveryRoomComplete) return "active" as NodeState;
    return "completed" as NodeState;
  }, [progress.currentWordIndex, wordCount, discoveryProgress]);

  // Skin-aware WiggleWoo hero image
  const skinAssets = useMemo(() => getActiveSkinAssets(), []);

  // Per-node performance ratings
  const nodeRatings = useMemo(() => loadNodeRatings(quest.id), [quest.id]);

  // Generate states for all nodes — image nodes progress normally, decode nodes gated.
  // Additionally, nodes 9–16 stay locked until the player earns the half trophy
  // (phase 1) — completing node 8 alone is not enough.
  const trophyGateActive = trophyProgress.tier === "none";
  const nodeStates: NodeState[] = useMemo(() => {
    const states: NodeState[] = [];
    for (let i = 0; i < wordCount; i++) {
      const isDecodeNode = i >= imageWordCount;
      const isTrophyGated = i >= FIRST_HALF_WORDS && trophyGateActive;

      if (isDecodeNode && !decodeUnlocked) {
        // Decode node locked until mastery
        states.push("locked");
      } else if (isTrophyGated) {
        // Locked behind phase 1 trophy
        states.push("locked");
      } else if (progress.questComplete) {
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
  }, [progress.questComplete, progress.currentWordIndex, wordCount, imageWordCount, decodeUnlocked, trophyGateActive]);

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
  const [, setZoomTarget] = useState<{ x: number; y: number } | null>(null);
  const mapOverlayRef = useRef<HTMLDivElement>(null);
  
  // Detect if we're on mobile
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768 || 'ontouchstart' in window;
  }, []);



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
  const [, setCompletionAnimating] = useState(false);
  
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

  // =============================================
  // NEXT-TARGET HIGHLIGHT (after word completion)
  // =============================================
  const [nextTargetNode, setNextTargetNode] = useState<number | null>(null);

  useEffect(() => {
    if (arrivedFromWord !== null && activeNodeIndex >= 0) {
      // Delay slightly so map renders first, then highlight kicks in
      const showTimer = setTimeout(() => {
        setNextTargetNode(activeNodeIndex);
      }, 400);
      // Auto-clear after 3 seconds
      const clearTimer = setTimeout(() => {
        setNextTargetNode(null);
      }, 3400);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [arrivedFromWord, activeNodeIndex]);



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

  // Dev: hide nodes to see board layout clearly
  const [devHideNodes, setDevHideNodes] = useState(false);
  // Dev: collapse dev controls (default hidden for clean preview)
  const [devShowControls, setDevShowControls] = useState(false);

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

  // Pre-load quest chunks when prerequisites are met.
  // Non-shipped tiers are skipped unless dev unlock is on, so v1 never
  // pulls CVCC/Magic E/Vowel Teams/Advanced chunks into a kid's session.
  useEffect(() => {
    if (isTierShipped("CVCC") && (areAllQuestsComplete([...CVC_QUEST_IDS]) || devUnlock || isPlacementUnlocked("CVCC"))) {
      loadCvccQuests();
    }
    if (isTierShipped("MAGIC_E") && (areAllQuestsComplete([...CVCC_QUEST_IDS]) || devUnlock || isPlacementUnlocked("MAGIC_E"))) {
      loadMagicEQuests();
    }
    if (isTierShipped("CVVC") && (areAllQuestsComplete([...MAGIC_E_QUEST_IDS]) || devUnlock || isPlacementUnlocked("CVVC"))) {
      loadCvvcQuests();
    }
    if (isTierShipped("ADVANCED") && (areAllQuestsComplete([...CVVC_QUEST_IDS]) || devUnlock || isPlacementUnlocked("ADVANCED"))) {
      loadAdvancedQuests();
    }
  }, [devUnlock]);

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
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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
        playNewChallengePhrase();
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

  const isVowelUnlocked = (_questId: string): boolean => {
    // All vowel tracks within a quest type are freely selectable.
    // Players can jump between any Short A/E/I/O/U at will.
    return true;
  };

  // ---- WW positioning ----
  // RESTING POSITION: always derived from real progress, never from animation state
  const wwRestingNode: number | 'trophy' | 'discovery' = useMemo(() => {
    if (discoveryNodeState === "active" || discoveryNodeState === "completed") {
      return 'discovery';
    }
    if (trophyNodeState === "active") {
      return 'trophy';
    }
    return Math.max(0, Math.min(progress.currentWordIndex, wordCount - 1));
  }, [discoveryNodeState, trophyNodeState, progress.currentWordIndex, wordCount]);

  // ANIMATION: temporary override that resolves back to resting position
  const [wwAnimOverride, setWwAnimOverride] = useState<number | 'trophy' | 'discovery' | null>(null);
  const [wwAnimating, setWwAnimating] = useState(false);
  const animTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    // Only animate when arrivedFromWord is set (just completed a word)
    if (arrivedFromWord === null) {
      setWwAnimOverride(null);
      setWwAnimating(false);
      return;
    }

    // Start at the old node, then animate to the resting node
    setWwAnimOverride(Math.max(0, arrivedFromWord));
    setWwAnimating(false);

    animTimerRef.current = setTimeout(() => {
      setWwAnimating(true);
      setWwAnimOverride(null); // clear override → snaps to resting position
    }, 80);

    return () => { if (animTimerRef.current) clearTimeout(animTimerRef.current); };
  }, [arrivedFromWord, wwRestingNode]);

  // FINAL POSITION: animation override if active, otherwise resting position
  const wwLevel = wwAnimOverride !== null ? wwAnimOverride : wwRestingNode;

  // Calculate WW coordinates from node index
  const wwPosition = useMemo(() => {
    if (wwLevel === 'discovery') {
      return {
        left: `${DISCOVERY_POSITION.x}%`,
        top: `calc(${DISCOVERY_POSITION.y}% - 70px)`,
        transform: 'translateX(-50%)',
      };
    }
    if (wwLevel === 'trophy') {
      return {
        left: `${TROPHY_POSITION.x}%`,
        top: `calc(${TROPHY_POSITION.y}% - 70px)`,
        transform: 'translateX(-50%)',
      };
    }
    const maxIdx = Math.min(wordCount, NODE_POSITIONS.length) - 1;
    const nodeIdx = Math.max(0, Math.min(wwLevel, maxIdx));
    const pos = NODE_POSITIONS[nodeIdx];
    return {
      left: `${pos.x}%`,
      top: `calc(${pos.y}% - 70px)`,
      transform: 'translateX(-50%)',
    };
  }, [wwLevel, wordCount]);

  // Generate SVG path for the glowing learning line (horizontal flow)
  const pathD = useMemo(() => {
    // Path flows: 1→...→8 → TROPHY → 9→...→16 → DISCOVERY
    const points = NODE_POSITIONS;

    // Nodes 1-8
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < 8; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }

    // Node 8 to Trophy node (midpoint reward)
    d += ` L ${TROPHY_POSITION.x} ${TROPHY_POSITION.y}`;

    // Trophy to Nodes 9-16
    for (let i = 8; i < 16; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }

    // Node 16 to Discovery node (final reward)
    d += ` L ${DISCOVERY_POSITION.x} ${DISCOVERY_POSITION.y}`;

    return d;
  }, []);

  return (
    <div className="machine-world">
      {/* ---- Map viewport (blue rounded frame) ---- */}
      <div className="map-window">
        {/* Layer 2: Animated water */}
        <WaterBaseLayer />
        {/* <RiverLayer /> — TEMP HIDDEN to identify straight line */}
        <WaterAmbientLayer />
        {/* Layer 2b: Water sparkles — sibling of WaterBaseLayer (NOT
            nested inside it) so they aren't clipped by the river_mask.
            That mask was painted for a different layout and was hiding
            sparkles in the very spots we want them. */}
        <WaterSparklesLayer />
        {/* Layer 3-4: Land pieces, objects, landmarks */}
        <IslandLayer
          onExplore={onExplore}
          devUnlock={devUnlock}
          hideBadges={!questFullyDone && !devUnlock}
          allComplete={allCvcComplete}
          completedEnvs={completedEnvs}
        />
        {/* Layer 5: Clouds at top of map */}
        <SkyLayer />

        {/* Layer 5: Quest Map Overlay — nodes, trophy, path, wigglewoo */}
      <div
        ref={mapOverlayRef}
        className="quest-map-overlay"
        style={devHideNodes ? { display: "none" } : questFullyDone ? { pointerEvents: "none" } : undefined}
      >
        {/* DEV: Red dashed guideline for safe-zone calibration */}
        <div className="quest-map-guideline" />

        {!questFullyDone && (<>
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
        {NODE_POSITIONS.slice(0, wordCount).map((pos, i) => {
          const state = nodeStates[i];
          const isDecodeNode = i >= imageWordCount;
          const isDecodeLocked = isDecodeNode && !decodeUnlocked;
          const tappable = isNodeTappable(state) && !isDecodeLocked;
          return (
            <div
              key={i}
              className={[
                'gear-node-wrapper',
                shakingNodeIndex === i ? 'gear-node-wrapper--shaking' : '',
                nextTargetNode === i ? 'gear-node-wrapper--next-target' : '',
                state === 'completed' && nodeRatings[i] ? `rating-${nodeRatings[i]}` : '',
                isDecodeNode ? 'gear-node-wrapper--decode' : '',
                isDecodeLocked ? 'gear-node-wrapper--decode-locked' : '',
                isDecodeNode && decodeJustUnlocked && !isDecodeLocked ? 'gear-node-wrapper--decode-unlocking' : '',
              ].filter(Boolean).join(' ')}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
              }}
            >
              <GearNode
                state={isDecodeLocked ? "locked" : state}
                number={i + 1}
                onClick={() => {
                  if (isDecodeLocked) {
                    setLockedToast("🔒 Complete the picture words first to unlock challenge words");
                    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
                    shakeTimerRef.current = setTimeout(() => setLockedToast(null), 1800);
                  } else if (tappable) {
                    onStartLevel(i);
                  } else if (state === 'locked') {
                    handleLockedTap(i);
                  }
                }}
                disabled={false}
              />
              {isDecodeLocked && <span className="decode-lock-icon">🔒</span>}
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
          
          {/* Layer 4: Animated sparkles — DISABLED 2026-05-09 to keep
              the map calm/atmospheric. Six gold twinkles around the
              trophy node read as visual noise alongside the new water
              treatment. Re-enable by uncommenting if the trophy node
              ever needs more emphasis. */}
          {/*
          <div className="trophy-node__sparkles">
            <span className="trophy-sparkle trophy-sparkle--1" />
            <span className="trophy-sparkle trophy-sparkle--2" />
            <span className="trophy-sparkle trophy-sparkle--3" />
            <span className="trophy-sparkle trophy-sparkle--4" />
            <span className="trophy-sparkle trophy-sparkle--5" />
            <span className="trophy-sparkle trophy-sparkle--6" />
          </div>
          */}
          
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
          </button>
        </div>

        {/* Discovery Room Node — only visible when active or completed */}
        {discoveryNodeState !== "locked" && (
        <div
          className={`trophy-node-wrapper${discoveryNodeState === "active" ? ' trophy-node-wrapper--celebrating' : ''}`}
          style={{
            position: 'absolute',
            left: `${DISCOVERY_POSITION.x}%`,
            top: `${DISCOVERY_POSITION.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 15,
          }}
        >
          <div className="trophy-node__spotlight" />
          <button
            className={`trophy-node trophy-node--${discoveryNodeState}`}
            onClick={() => {
              if (discoveryNodeState === "active") {
                onEnterDiscoveryRoom?.();
              }
            }}
            aria-label={`Discovery Room — ${discoveryNodeState}`}
          >
            <span style={{ fontSize: 28 }}>🔬</span>
            {discoveryNodeState === "active" && (
              <div className="trophy-node__glow" />
            )}
            {discoveryNodeState === "completed" && (
              <span className="trophy-node__check">✓</span>
            )}
          </button>
        </div>
        )}

        {/* WiggleWoo positioned near active node, trophy, or discovery */}
        {(activeNodeIndex >= 0 || trophyNodeState === "active" || discoveryNodeState === "active") && (
          <div
            className={`map-wigglewoo ${wwAnimating ? "map-wigglewoo--moving" : ""} ${showOnboardingArrow ? "map-wigglewoo--onboarding" : ""}`}
            style={{...wwPosition, cursor: showOnboardingArrow ? "pointer" : undefined}}
            onClick={showOnboardingArrow ? handleOnboardingTap : undefined}
          >
            <img
              src={skinAssets.heroImg || heroImg}
              alt="WiggleWoo"
              className="map-wigglewoo__img"
              draggable={false}
            />
            {showOnboardingArrow && (
              <div className="onboarding-cue">
                <div className="onboarding-cue__arrow">▼</div>
                <div className="onboarding-cue__label">Tap here to start!</div>
              </div>
            )}
          </div>
        )}

        {/* Onboarding dim overlay — focuses attention on character */}
        {showOnboardingArrow && (
          <div className="onboarding-dim" onClick={handleOnboardingTap} />
        )}

        </>)}
      </div>
      {/* end quest-map-overlay */}

      {/* V1-end discovery beacon — appears once every CVC vowel is fully
          complete. Sits above the map content as a non-interactive guide
          banner pointing at the Discovery Rooms. The actual click targets
          are the landmarks themselves (handled by IslandLayer's free-
          explore unlock). */}
      {allCvcComplete && (
        <div className="discovery-beacon" aria-hidden="true">
          <span className="discovery-beacon__sparkle">✨</span>
          <span className="discovery-beacon__text">
            Tap any island to explore the Discovery Rooms!
          </span>
          <span className="discovery-beacon__sparkle">✨</span>
        </div>
      )}
      </div>
      {/* end map-window */}

      {/* ==== OUTER UI — outside the blue frame ==== */}

      {/* Mechanical environment */}
      <div className="machine-world-pipes-top" />
      <div className="machine-world-pipes-bottom" />
      <span className="machine-bolt machine-bolt--tl" />
      <span className="machine-bolt machine-bolt--tr" />
      <span className="machine-bolt machine-bolt--bl" />
      <span className="machine-bolt machine-bolt--br" />

      {/* DISCOVERY ROOM PREVIEW ROW — reward shelf above the map */}
      <div className="discovery-preview-row">
        {DISCOVERY_ROOM_PREVIEWS.map((room) => {
          const unlocked = isEnvironmentUnlocked(room.envId);
          return (
            <button
              key={room.envId}
              className={`discovery-preview ${unlocked ? "discovery-preview--unlocked" : "discovery-preview--locked"}`}
              onClick={() => {
                if (unlocked && onExplore) {
                  onExplore(room.envId);
                } else if (!unlocked) {
                  setLockedToast("🔒 Complete all 16 quests to unlock this Discovery Room");
                  if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
                  shakeTimerRef.current = setTimeout(() => setLockedToast(null), 1800);
                }
              }}
              aria-label={unlocked ? `Explore ${room.label}` : `${room.label} — locked`}
            >
              <img
                src={room.image}
                alt={room.label}
                className="discovery-preview__img"
                draggable={false}
              />
              {!unlocked && <span className="discovery-preview__lock">🔒</span>}
            </button>
          );
        })}
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

      {/* TROPHY SHOWCASE — below badge logo, glass display case.
          Clickable once any trophy is earned (half or full), so the player can
          replay the trophy room in view-only mode. */}
      <div
        className={`trophy-showcase ${trophyProgress.tier !== "none" ? 'trophy-showcase--clickable' : ''}`}
        onClick={() => trophyProgress.tier !== "none" && onViewTrophyRoom?.()}
        role={trophyProgress.tier !== "none" ? "button" : undefined}
        tabIndex={trophyProgress.tier !== "none" ? 0 : undefined}
      >
        <GlassDisplayCase
          tier={trophyProgress.tier}
          patternType={quest.patternType}
          size="medium"
        />
      </div>

      {/* WARDROBE — skin selector button */}
      <button
        className={`wardrobe-map-btn ${hasNewSkin ? "wardrobe-map-btn--new" : ""}`}
        onClick={onOpenWardrobe}
        aria-label="Open Wardrobe"
        title="Change WiggleWoo's outfit"
      >
        <img
          src={skinAssets.heroImg || heroImg}
          alt="Equipped WiggleWoo"
          className="wardrobe-map-btn__img"
          draggable={false}
        />
        {hasNewSkin && <span className="wardrobe-map-btn__badge">NEW</span>}
      </button>

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
            {questBoxView === "types" ? "Quest Type" : `${effectiveQuestTypes.find(t => t.id === selectedQuestType)?.label ?? selectedQuestType} Quests`}
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
                  {!type.unlocked && type.unlockHint && (
                    <span className="word-quest-box__tooltip">{type.unlockHint}</span>
                  )}
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
                    {isUnlocked && isChallengeUnlocked(track.id) && (
                      <span className="challenge-star-badge" title="Challenge Mode available">⭐</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Demo educator banner */}
      <div className="demo-banner">
        <span className="demo-banner__text">Tap a gear node to start a word!</span>
      </div>

      {/* For Parents — Apple Kids requires reachable privacy policy + parental gate */}
      {!showOnboardingArrow && (
        <button
          className="for-parents-btn"
          onClick={handleInsightsClick}
          aria-label="For parents and teachers"
        >
          <span className="for-parents-btn__wave" aria-hidden="true">👋</span>
          <span className="for-parents-btn__label">For Parents</span>
        </button>
      )}

      {/* DEV CONTROLS — collapsible, hidden by default */}
      {import.meta.env.DEV && (
        <>
          <button
            className="dev-toggle-btn"
            onClick={() => setDevShowControls((s) => !s)}
            title="Toggle dev controls"
          >
            {devShowControls ? "✕" : "⚙"}
          </button>
          {devShowControls && (
            <div className="dev-controls-bar dev-controls-bar--bottom">
              <button
                className={`dev-unlock-btn ${devUnlock ? "dev-unlock-btn--active" : ""}`}
                onClick={toggleDevUnlock}
                title={`Dev Unlock: ${devUnlock ? "ON" : "OFF"}`}
              >
                🔓 {devUnlock ? "ON" : "OFF"}
              </button>
              <button
                className={`dev-unlock-btn ${devHideNodes ? "dev-unlock-btn--active" : ""}`}
                onClick={() => setDevHideNodes((h) => !h)}
                title="Toggle node visibility"
              >
                {devHideNodes ? "👁 Nodes" : "🙈 Nodes"}
              </button>
              <button
                className="dev-unlock-btn"
                onClick={onRestartQuest}
                title="Reset current quest"
              >
                🔄 Quest
              </button>
              <button
                className="dev-unlock-btn"
                style={{ color: "#ff6b6b" }}
                onClick={onDevResetAll}
                title="Reset ALL progress"
              >
                💣 Reset
              </button>
              <button
                className="dev-unlock-btn"
                style={{ color: "#4FC3F7" }}
                onClick={onEnterDiscoveryRoom}
                title="Jump to Discovery Room"
              >
                🔬 Discovery
              </button>
              <button
                className="dev-unlock-btn"
                style={{ color: "#FFD700" }}
                onClick={onEnterTrophyRoom}
                title="Jump to Trophy Room"
              >
                🏆 Trophy
              </button>
              <button
                className="dev-unlock-btn"
                style={{ color: "#CE93D8" }}
                onClick={() => {
                  // Skip to after all image words to trigger decode unlock
                  const prog = { questId: quest.id, currentWordIndex: imageWordCount, questComplete: false };
                  import("../game/progression").then(m => {
                    m.saveQuestProgress(prog);
                    localStorage.removeItem(decodeSeenKey);
                    window.location.reload();
                  });
                }}
                title="Skip to decode unlock"
              >
                🔓 Decode
              </button>
            </div>
          )}
        </>
      )}

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
          comingSoon={!isTierShipped(unlockModalType)}
          onClose={() => setShowUnlockModal(false)}
        />
      )}

      {/* DECODE UNLOCK MODAL */}
      {showDecodeModal && (
        <div className="decode-unlock-overlay" onClick={handleDecodeStayOnMap}>
          <div className="decode-unlock-modal" onClick={(e) => e.stopPropagation()}>
            <div className="decode-unlock-modal__icon">⭐</div>
            <h2 className="decode-unlock-modal__title">Challenge Mode Unlocked!</h2>
            <p className="decode-unlock-modal__subtitle">You can now play without pictures</p>
            <p className="decode-unlock-modal__desc">You're ready to decode words on your own</p>
            <div className="decode-unlock-modal__buttons">
              <button className="decode-unlock-modal__btn decode-unlock-modal__btn--primary" onClick={handleDecodeStart}>
                Start Challenge
              </button>
              <button className="decode-unlock-modal__btn decode-unlock-modal__btn--secondary" onClick={handleDecodeStayOnMap}>
                Stay on Map
              </button>
            </div>
          </div>
        </div>
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
