// =============================================
// ExploreScreen.tsx — Discovery Room environment viewer
// WiggleWoo's Word Quest
// =============================================
// Smart Discovery Room system:
//   - Tap object → Choice Modal (Learn a Fact / Power It Up)
//   - Learn a Fact → animation → fact panel → +1 sticker
//   - Power It Up → mini CVC challenge → enhanced animation → fact → +2 stickers
//   - Daily cap: 4 facts per room per day
// =============================================

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { ENVIRONMENTS, ENVIRONMENT_QUEST_MAP } from "../game/exploreData";
import { getQuestById } from "../game/wordData";
import type { EnvironmentConfig, SceneProp, Hotspot, FactPanel, FactItem } from "../game/exploreData";
import type { CvcWord } from "../game/types";
import {
  isDailyFactCapReached,
  recordFactDiscovery,
  awardSticker,
} from "../game/progression";
import ChoiceModal from "../components/ChoiceModal";
import DailyCapModal from "../components/DailyCapModal";
import MiniChallenge from "../components/MiniChallenge";
import FactNarration from "../components/FactNarration";
import PictureMatch from "../components/PictureMatch";
import "../styles/explore.css";

interface ExploreScreenProps {
  environmentId: string;
  questId?: string;
  onBack: () => void;
}

// ---- Sub-components ----

/** Fact panel — bottom sheet with 2-col grid of tappable fact items */
const FactPanelSheet: React.FC<{
  panel: FactPanel;
  onClose: () => void;
  ambientColor: string;
}> = ({ panel, onClose }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className={`fact-panel__item ${isExpanded ? "fact-panel__item--expanded" : ""}`}
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <div className="fact-panel__item-header">
                  <span className="fact-panel__item-emoji">{item.emoji}</span>
                  <span className="fact-panel__item-name">{item.name}</span>
                </div>
                {isExpanded && (
                  <>
                    <p className="fact-panel__item-fact">{item.fact}</p>
                    <FactNarration text={item.fact} audioSrc={item.audioSrc} autoPlay />
                  </>
                )}
              </div>
            );
          })}
        </div>
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

const ExploreScreen: React.FC<ExploreScreenProps> = ({ environmentId, questId, onBack }) => {
  const env: EnvironmentConfig | undefined = ENVIRONMENTS[environmentId];

  // Resolve quest words and vowel group for challenges
  const questWords: CvcWord[] = useMemo(() => {
    const qId = questId ?? ENVIRONMENT_QUEST_MAP[environmentId];
    if (!qId) return [];
    const quest = getQuestById(qId);
    return quest?.words ?? [];
  }, [questId, environmentId]);

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
  const [showMiniChallenge, setShowMiniChallenge] = useState(false);
  const [showPictureMatch, setShowPictureMatch] = useState(false);
  const [factsDiscoveredThisSession, setFactsDiscoveredThisSession] = useState(0);
  const [poweredUpProp, setPoweredUpProp] = useState<string | null>(null); // prop ID currently powered up

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
  const [flowerAnimating, setFlowerAnimating] = useState(false);

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
  const playObjectAnimation = useCallback((prop: SceneProp, enhanced: boolean) => {
    const delay = enhanced ? 600 : 400;

    if (prop.id === "flower-stage") {
      setFlowerStage(1);
      setTimeout(() => setFlowerStage(2), delay);
      setTimeout(() => setFlowerStage(3), delay * 2);
      setTimeout(() => { setFlowerStage(0); }, delay * 3);
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

    if (enhanced) {
      setPoweredUpProp(prop.id);
      setTimeout(() => setPoweredUpProp(null), 2000);
    }
  }, []);

  // ---- Fact discovery flow ----
  const showFactForProp = useCallback((prop: SceneProp) => {
    if (prop.factPanel) {
      setTimeout(() => setActivePanel(prop.factPanel!), 500);
    }
  }, []);

  const handleLearnFact = useCallback(() => {
    if (!choiceTarget?.factPanel) return;
    const prop = choiceTarget;
    setChoiceTarget(null);

    recordFactDiscovery(environmentId);
    awardSticker(environmentId, prop.factPanel!.items[0]?.id ?? prop.id, 1);
    setFactsDiscoveredThisSession(c => c + 1);

    playObjectAnimation(prop, false);
    showFactForProp(prop);
  }, [choiceTarget, environmentId, playObjectAnimation, showFactForProp]);

  const handlePowerUp = useCallback(() => {
    if (!choiceTarget) return;
    setChoiceTarget(null);
    // Every 3rd fact → PictureMatch, otherwise MiniChallenge
    if ((factsDiscoveredThisSession + 1) % 3 === 0) {
      setShowPictureMatch(true);
    } else {
      setShowMiniChallenge(true);
    }
  }, [choiceTarget, factsDiscoveredThisSession]);

  const completePowerUp = useCallback(() => {
    const prop = choiceTarget;
    if (!prop?.factPanel) return;

    recordFactDiscovery(environmentId);
    awardSticker(environmentId, prop.factPanel.items[0]?.id ?? prop.id, 2);
    setFactsDiscoveredThisSession(c => c + 1);

    playObjectAnimation(prop, true);
    showFactForProp(prop);
  }, [choiceTarget, environmentId, playObjectAnimation, showFactForProp]);

  const handleMiniChallengeCorrect = useCallback(() => {
    setShowMiniChallenge(false);
    completePowerUp();
  }, [completePowerUp]);

  const handlePictureMatchCorrect = useCallback(() => {
    setShowPictureMatch(false);
    completePowerUp();
  }, [completePowerUp]);

  const handleChallengeClose = useCallback(() => {
    setShowMiniChallenge(false);
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

    // Only fact-panel props trigger the choice flow
    if (!prop.factPanel) return;

    // Check daily cap
    if (isDailyFactCapReached(environmentId)) {
      setShowDailyCap(true);
      return;
    }

    // Show choice modal
    setChoiceTarget(prop);
  }, [environmentId]);

  const handleHotspotClick = useCallback((hotspot: Hotspot) => {
    setTappedHotspotId(hotspot.id);
    setTimeout(() => setTappedHotspotId(null), 500);
    setActiveHotspot(hotspot);
  }, []);

  // Volcano eruption handler
  const handleErupt = useCallback(() => {
    if (erupting) return;
    setErupting(true);
    setQuaking(true);
    if (eruptTimerRef.current) clearTimeout(eruptTimerRef.current);
    setTimeout(() => setQuaking(false), 500);
    eruptTimerRef.current = setTimeout(() => setErupting(false), 1500);
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
      const isPoweredUp = poweredUpProp === prop.id;
      const anchorTransform =
        prop.anchor === "top" ? "translate(-50%, 0%)" : "translate(-50%, -100%)";

      // Dynamic image source swaps
      let imgSrc = prop.src;
      if (isVolcanoImage && erupting) {
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
            className={`explore-prop explore-prop--interactive ${isPoweredUp ? "explore-prop--powered-up" : ""}`}
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
            <div
              key={hotspot.id}
              className={`explore-hotspot explore-hotspot--${hotspot.idleAnimation} ${tapClass}`}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              onClick={() => handleHotspotClick(hotspot)}
            >
              <div className="explore-hotspot__marker">{hotspot.emoji}</div>
              <div className="explore-hotspot__label">{hotspot.label}</div>
            </div>
          );
        })}
      </div>

      {/* Back button */}
      <button className="explore-back-btn" onClick={onBack}>
        ← Back
      </button>

      {/* Hint text */}
      <div className="explore-hint">Tap objects to discover facts!</div>

      {/* Choice modal — Learn a Fact / Power It Up */}
      {choiceTarget && !showMiniChallenge && (
        <ChoiceModal
          objectName={choiceTarget.factPanel?.title ?? "Discovery"}
          onLearnFact={handleLearnFact}
          onPowerUp={handlePowerUp}
          onClose={() => setChoiceTarget(null)}
        />
      )}

      {/* Daily cap modal */}
      {showDailyCap && (
        <DailyCapModal onClose={() => setShowDailyCap(false)} />
      )}

      {/* Mini CVC challenge (Power It Up) */}
      {showMiniChallenge && questWords.length >= 3 && (
        <MiniChallenge
          questWords={questWords}
          onCorrect={handleMiniChallengeCorrect}
          onClose={handleChallengeClose}
        />
      )}

      {/* Picture Match challenge (every 3rd fact Power It Up) */}
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
