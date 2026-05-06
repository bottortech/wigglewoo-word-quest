// =============================================
// ExploreScreen.tsx — Discovery Room environment viewer
// WiggleWoo's Word Quest
// =============================================
// Smart Discovery Room system:
//   - Tap object → learn a fact → animation → fact panel
//   - Every 4th fact → Picture Match challenge before learning
//   - Daily cap: 4 facts per room per day
// =============================================

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { ENVIRONMENTS, ENVIRONMENT_QUEST_MAP } from "../game/exploreData";
import DiscoverySession from "../components/miniGames/DiscoverySession";
import "../styles/miniGames.css";
import type { EnvironmentConfig, SceneProp, Hotspot, FactPanel, FactItem } from "../game/exploreData";
import {
  isDailyFactCapReached,
  recordFactDiscovery,
  getUnlockedFactCount,
  getVowelForQuest,
} from "../game/progression";
import DailyCapModal from "../components/DailyCapModal";
import FactNarration from "../components/FactNarration";
import PictureMatch from "../components/PictureMatch";
import { playEvent } from "../audio/SoundEffects";
import "../styles/explore.css";

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
  onFactNarrationEnded?: () => void;
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
                      onEnded={onFactNarrationEnded}
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

  // Mini-game session state — show on first visit to each room
  const miniGameSeenKey = `ww_minigames_seen_${environmentId}`;
  const hasSeenMiniGames = localStorage.getItem(miniGameSeenKey) === "true";
  const [showMiniGames, setShowMiniGames] = useState(!!onComplete && !hasSeenMiniGames);
  const [, setMiniGamesCompleted] = useState(false);

  const handleMiniGamesComplete = useCallback(() => {
    setMiniGamesCompleted(true);
    setShowMiniGames(false);
    localStorage.setItem(miniGameSeenKey, "true");
    // Welcome VO ("search around for cool facts") fires here — once the
    // mini-games clear and the kid can actually see the room.
    playEvent("discover-welcome");
    // Do NOT call onComplete here — room completes after viewing 2 facts
  }, [miniGameSeenKey]);

  // Welcome VO on first mount — only when mini-games aren't covering the room
  // (returning visits, or entries that bypass the discovery flow). First-visit
  // welcome plays inside handleMiniGamesComplete instead.
  const [welcomePlayed, setWelcomePlayed] = useState(false);
  useEffect(() => {
    if (welcomePlayed) return;
    if (showMiniGames) return;
    playEvent("discover-welcome");
    setWelcomePlayed(true);
  }, [showMiniGames, welcomePlayed]);

  // Room completion — triggers after viewing 2 facts (first visit only)
  useEffect(() => {
    if (!needsCompletion || roomJustCompleted) return;
    if (factsViewedThisVisit.size >= FACTS_REQUIRED) {
      setRoomJustCompleted(true);
      localStorage.setItem(roomCompleteKey, "true");
      playEvent("discover-complete");
      // Brief celebration then auto-exit
      setTimeout(() => {
        onComplete?.();
        onBack();
      }, 2000);
    }
  }, [factsViewedThisVisit.size, needsCompletion, roomJustCompleted, roomCompleteKey, onComplete, onBack]);

  const handleMiniGamesBack = useCallback(() => {
    setShowMiniGames(false);
    onBack();
  }, [onBack]);

  // Gather facts for mini-game rewards
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

  // Resolve vowel group for picture match challenges
  const vowelGroup = useMemo(() => {
    const qId = questId ?? ENVIRONMENT_QUEST_MAP[environmentId] ?? "";
    if (qId.includes("short-a")) return "shortA";
    if (qId.includes("short-e")) return "shortE";
    if (qId.includes("short-i")) return "shortI";
    if (qId.includes("short-o")) return "shortO";
    if (qId.includes("short-u")) return "shortU";
    return "shortA";
  }, [questId, environmentId]);

  // ---- UI state ----
  const [activePanel, setActivePanel] = useState<FactPanel | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [tappedHotspotId, setTappedHotspotId] = useState<string | null>(null);

  // Choice modal state
  const [choiceTarget, setChoiceTarget] = useState<SceneProp | null>(null);
  const [showDailyCap, setShowDailyCap] = useState(false);
  const [showPictureMatch, setShowPictureMatch] = useState(false);
  const [factsDiscoveredThisSession, setFactsDiscoveredThisSession] = useState(0);

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
    setFactsDiscoveredThisSession(c => c + 1);
    // "wow did you know that" reaction fires AFTER the kid actually hears the
    // fact — wired into FactNarration's onEnded below, not here.

    playObjectAnimation(prop);
    showFactForProp(prop);
  }, [environmentId, playObjectAnimation, showFactForProp]);

  // After picture match challenge completes, award the fact
  const handlePictureMatchCorrect = useCallback(() => {
    setShowPictureMatch(false);
    if (!choiceTarget?.factPanel) return;
    learnFactForProp(choiceTarget);
    setChoiceTarget(null);
  }, [choiceTarget, learnFactForProp]);

  const handleChallengeClose = useCallback(() => {
    setShowPictureMatch(false);
    setChoiceTarget(null);
  }, []);

  // ---- Main prop click handler ----
  const handlePropClick = useCallback((prop: SceneProp) => {
    // Light switch — no fact, just toggle
    if (prop.id === "light-switch") {
      setLightsOn((on) => !on);
      return;
    }

    // Only fact-panel props trigger the discovery flow
    if (!prop.factPanel) return;

    // Check daily cap (skip in dev)
    if (!import.meta.env.DEV && isDailyFactCapReached(environmentId)) {
      setShowDailyCap(true);
      return;
    }

    // Every 4th fact → PictureMatch challenge before learning (skip in dev)
    if (!import.meta.env.DEV && (factsDiscoveredThisSession + 1) % 4 === 0) {
      setChoiceTarget(prop);
      setShowPictureMatch(true);
    } else {
      // Learn fact directly
      learnFactForProp(prop);
    }
  }, [environmentId, factsDiscoveredThisSession, learnFactForProp]);

  const handleHotspotClick = useCallback((hotspot: Hotspot) => {
    setTappedHotspotId(hotspot.id);
    setTimeout(() => setTappedHotspotId(null), 500);
    setActiveHotspot(hotspot);
  }, []);

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
        return (
          <button
            key={prop.id}
            className="explore-prop explore-prop--interactive"
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
    <div className={`explore-screen ${quaking ? "quake" : ""}`} style={bgStyle}>
      {/* Mini-game overlay — renders ON TOP of the room */}
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
      {/* Geartown dust particles */}
      {environmentId === "industrial-tech-city" && (
        <div className="geartown-dust">
          <span className="dust-particle dust-particle--1" />
          <span className="dust-particle dust-particle--2" />
          <span className="dust-particle dust-particle--3" />
          <span className="dust-particle dust-particle--4" />
          <span className="dust-particle dust-particle--5" />
          <span className="dust-particle dust-particle--6" />
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

      {/* Room completion progress (first visit only) */}
      {needsCompletion && !roomJustCompleted && !showMiniGames && (
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

      {/* Hint text */}
      <div className="explore-hint">
        {needsCompletion && !roomJustCompleted
          ? "Tap objects and read facts to complete this room!"
          : "Tap objects to discover facts!"}
      </div>

      {/* Daily cap modal — hidden in dev or when VITE_DISABLE_COMPLETION_MODAL is set */}
      {!import.meta.env.DEV && !import.meta.env.VITE_DISABLE_COMPLETION_MODAL && showDailyCap && (
        <DailyCapModal onClose={() => setShowDailyCap(false)} />
      )}

      {/* Picture Match challenge (every 4th fact) */}
      {showPictureMatch && (
        <PictureMatch
          vowelGroup={vowelGroup}
          onCorrect={handlePictureMatchCorrect}
          onClose={handleChallengeClose}
        />
      )}

      {/* Fact panel (bottom sheet) */}
      {activePanel && (
        <FactPanelSheet
          panel={activePanel}
          onClose={() => setActivePanel(null)}
          ambientColor={env.ambientColor}
          onFactViewed={(factId) => {
            setFactsViewedThisVisit((prev) => {
              const next = new Set(prev);
              next.add(factId);
              return next;
            });
          }}
          onFactNarrationEnded={() => playEvent("discover-fact-reaction")}
        />
      )}

      {/* Hotspot popup */}
      {activeHotspot && (
        <HotspotPopup
          hotspot={activeHotspot}
          onClose={() => setActiveHotspot(null)}
        />
      )}
    </div>
  );
};

export default ExploreScreen;
