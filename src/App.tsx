// =============================================
// App.tsx — Root router for WiggleWoo's Word Quest
// =============================================
// Routes between PlayNowScreen, QuestMapScreen, and GameScreen.
// Owns multi-quest sequencing, progression,
// and signals for map entry animation.
//
// Boot screen: PlayNowScreen
// =============================================

import { useState, useCallback, useEffect } from "react";
import PlayNowScreen from "./screens/PlayNowScreen";
import QuestMapScreen from "./screens/QuestMapScreen";
import GameScreen from "./screens/GameScreen";
import TrophyRoomScreen from "./screens/TrophyRoomScreen";
import LearningInsightsScreen from "./screens/LearningInsightsScreen";
import ExploreScreen from "./screens/ExploreScreen";

import { loadSettings } from "./game/settings";
import OrientationGuard from "./components/OrientationOverlay";
import Stage from "./components/Stage";
import ScreenGate from "./components/ScreenGate";
import {
  CVC_QUESTS,
  getQuestById,
  questIdToVowelId,
  loadCvccQuests,
  loadCvvcQuests,
  loadMagicEQuests,
  loadAdvancedQuests,
  getImageWords,
  getDecodeWords,
  getNextAutoAdvanceQuest,
  areImageWordsComplete,
} from "./game/wordData";
import { DEFAULT_QUEST_ID } from "./game/questIds";
import { QUEST_ENVIRONMENT_MAP } from "./game/exploreData";
import {
  loadQuestProgress,
  advanceWord,
  loadGlobalProgress,
  saveGlobalProgress,
  saveQuestProgress,
  completeTrophyRoom,
  resetTrophyProgress,
  clearTrophyUnlockSeen,
  clearNodeRatings,
  markEnvironmentVisited,
  completeDiscoveryRoom,
  resetDiscoveryProgress,
  migrateOldCompletedQuests,
  isChallengeUnlocked,
  recordVowelQuestCompletion,
  unlockChallengeMode,
  hasHighAccuracy,
} from "./game/progression";
import { unlockSkinForEnvironment, initDefaultSkinPaths } from "./game/skins";
import { CVC_QUEST_IDS, CVCC_QUEST_IDS, CVVC_QUEST_IDS } from "./game/questIds";
import WardrobeModal from "./components/WardrobeModal";
import SkinUnlockCelebration from "./components/SkinUnlockCelebration";
import heroImgDefault from "./assets/wiggle_woo_hero_stance.png";
import helperImgDefault from "./assets/wigglewoo_helper_transparent.png";
import { backgroundMusic } from "./audio/BackgroundMusic";
import { recordTrophyEarned } from "./game/analytics";
import trophyTransitionImg from "./assets/trophy.png";
import "./styles/trophy-transition.css";
import ChallengeModeUnlock from "./components/ChallengeModeUnlock";
import PlacementTestScreen from "./screens/PlacementTestScreen";
import {
  isPlacementComplete,
  savePlacementResult,
  resetPlacement,
  TIER_DEFAULT_QUEST,
  type PlacementResult,
} from "./game/placementTest";
import type { Quest, VowelId } from "./game/types";

type Route = "home" | "placement" | "map" | "game" | "trophy-room" | "trophy-room-view" | "trophy-transition" | "insights" | "explore" | "discovery-room" | "wardrobe";

/** Load the correct quest chunk for a given quest ID */
async function ensureQuestLoaded(questId: string): Promise<void> {
  if (questId.includes("cvcc")) await loadCvccQuests();
  else if (questId.includes("magic-e")) await loadMagicEQuests();
  else if (questId.includes("cvvc")) await loadCvvcQuests();
  else if (questId.includes("adv")) await loadAdvancedQuests();
}

export default function App() {
  // Initialize background music on app mount (respects settings)
  useEffect(() => {
    backgroundMusic.init();
    const settings = loadSettings();
    if (settings.backgroundMusic) {
      backgroundMusic.play();
    } else {
      backgroundMusic.mute(); // mark as user-muted so tab-refocus won't resume
    }

    return () => {
      backgroundMusic.destroy();
    };
  }, []);

  // Initialize default skin asset paths (bundled imports)
  useEffect(() => {
    initDefaultSkinPaths(heroImgDefault, helperImgDefault);
    // Migrate old completed quests to include discovery room progress
    migrateOldCompletedQuests([...CVC_QUEST_IDS, ...CVCC_QUEST_IDS, ...CVVC_QUEST_IDS]);
  }, []);

  // Global quest tracker — which vowel set we're on
  const globalProg = loadGlobalProgress(DEFAULT_QUEST_ID);

  // Resolve initial quest synchronously for CVC, null if chunk not loaded
  const resolvedInitial = getQuestById(globalProg.activeQuestId) ?? null;

  // Ensure all tiers are unlocked
  useEffect(() => {
    const tiers = localStorage.getItem("ww_placement_tiers");
    if (!tiers || !tiers.includes("ADVANCED")) {
      localStorage.setItem(
        "ww_placement_tiers",
        JSON.stringify(["CVC", "CVCC", "MAGIC_E", "CVVC", "ADVANCED"]),
      );
    }
  }, []);

  // Start on Play Now screen
  const [route, setRoute] = useState<Route>("home");
  const [activeQuest, setActiveQuest] = useState<Quest | null>(resolvedInitial);
  const [wordIndex, setWordIndex] = useState<number>(0);
  // All 16 words passed to screens — decode gating handled in QuestMapScreen
  void getImageWords; void getDecodeWords;

  // If saved quest is from an unloaded chunk (CVCC/CVVC), load it
  useEffect(() => {
    if (activeQuest) return; // already resolved
    ensureQuestLoaded(globalProg.activeQuestId).then(() => {
      setActiveQuest(getQuestById(globalProg.activeQuestId) ?? CVC_QUESTS[0]);
    });
  }, []);

  // Bumped to force QuestMapScreen re-read progress
  const [mapRevision, setMapRevision] = useState(0);

  // Previous word index — tells the map to animate WW moving
  // null = no animation (fresh load), number = animate from that node
  const [arrivedFromWord, setArrivedFromWord] = useState<number | null>(null);

  // ---- Home Screen → Placement or Map ----
  const handlePlay = useCallback(() => {
    if (loadSettings().backgroundMusic) backgroundMusic.play();
    if (isPlacementComplete()) {
      setRoute("map");
    } else {
      setRoute("placement");
    }
  }, []);

  // ---- Go Home (from badge click) ----
  const handleGoHome = useCallback(() => {
    setTrophyJustCompleted(false);
    setRoute("home");
  }, []);

  // ---- Placement Test Complete ----
  const handlePlacementComplete = useCallback((result: PlacementResult) => {
    // Result is already saved to localStorage by the screen.
    // Ensure all tiers stay unlocked for demo regardless of placement score.
    localStorage.setItem(
      "ww_placement_tiers",
      JSON.stringify(["CVC", "CVCC", "MAGIC_E", "CVVC", "ADVANCED"]),
    );

    // If placement assigns a starting node > 0, mark earlier nodes as completed
    if (result.startingNode > 0) {
      // Use the tier's default quest from placement data
      const targetQuestId = TIER_DEFAULT_QUEST[result.assignedTier] || "quest-short-a";

      // Save progress at the assigned starting node
      saveQuestProgress({
        questId: targetQuestId,
        currentWordIndex: result.startingNode,
        questComplete: false,
      });

      // Select this quest as active
      saveGlobalProgress({ activeQuestId: targetQuestId });
      ensureQuestLoaded(targetQuestId).then(() => {
        const quest = getQuestById(targetQuestId);
        if (quest) setActiveQuest(quest);
        setMapRevision((r) => r + 1);
      });
    }

    setRoute("map");
  }, []);

  // ---- Placement Test Skip → start at beginning ----
  const handlePlacementSkip = useCallback(() => {
    // Save a beginner result so placement isn't shown again
    const skipResult: PlacementResult = {
      level: "beginner",
      assignedTier: "CVC",
      startingNode: 0,
      unlockedTiers: ["CVC"],
      wordResults: [],
      tierSummaries: [],
      completedAt: Date.now(),
    };
    savePlacementResult(skipResult);
    localStorage.setItem("ww_placement_tiers", JSON.stringify(["CVC"]));
    setRoute("home");
  }, []);

  // ---- Quest Map → Game Screen ----
  const handleStartLevel = useCallback((selectedWordIndex: number) => {
    // Ensure music is playing when starting a level
    if (loadSettings().backgroundMusic) backgroundMusic.play();
    setWordIndex(selectedWordIndex);
    setArrivedFromWord(null); // clear animation signal
    setTrophyJustCompleted(false);
    setRoute("game");
  }, []);

  // ---- Select a different quest (from Word Quest Box) ----
  const handleSelectQuest = useCallback(async (questId: string) => {
    await ensureQuestLoaded(questId);
    const selectedQuest = getQuestById(questId);
    if (!selectedQuest) return;
    setActiveQuest(selectedQuest);
    saveGlobalProgress({ activeQuestId: questId });
    setArrivedFromWord(null);
    setMapRevision((r) => r + 1);
  }, []);

  // ---- Game Screen → navigation ----
  const handleNavigate = useCallback(
    (target: "next-word" | "quest-map" | "quest-summary") => {
      if (!activeQuest) return;
      const progress = loadQuestProgress(activeQuest.id);
      const completedWordIndex = progress.currentWordIndex;

      if (target === "next-word") {
        // Mid-quest word done → advance + stay in game
        const updated = advanceWord(progress);
        setWordIndex(updated.currentWordIndex);
      } else if (target === "quest-map") {
        // Level done → advance, go back to map
        advanceWord(progress);
        setArrivedFromWord(completedWordIndex);
        setTimeout(checkChallengeUnlock, 300);

        // Check if image words for this quest are now complete → record + auto-advance
        setTimeout(() => {
          if (areImageWordsComplete(activeQuest.id)) {
            const next = getNextAutoAdvanceQuest(activeQuest.id);
            if (next) {
              ensureQuestLoaded(next.questId).then(() => {
                const nextQuest = getQuestById(next.questId);
                if (nextQuest) {
                  setActiveQuest(nextQuest);
                  saveGlobalProgress({ activeQuestId: next.questId });
                  setArrivedFromWord(null);
                  setWordIndex(0);
                  setMapRevision((r) => r + 1);
                }
              });
            }
          }
        }, 500);

        setRoute("map");
        setMapRevision((r) => r + 1);
      } else {
        // quest-summary: last word (node 16) → go to discovery room
        advanceWord(progress);
        setTimeout(checkChallengeUnlock, 300);
        recordVowelQuestCompletion(activeQuest.id);

        // Enter the matching discovery room
        const envId = QUEST_ENVIRONMENT_MAP[activeQuest.id];
        if (envId) {
          markEnvironmentVisited(envId);
          setExploreEnvId(envId);
          setRoute("discovery-room");
        } else {
          // No discovery room mapped → go to map
          setArrivedFromWord(completedWordIndex);
          setRoute("map");
          setMapRevision((r) => r + 1);
        }
      }
    },
    [activeQuest?.id]
  );

  // ---- Restart current quest ----
  const handleRestartQuest = useCallback(() => {
    if (!activeQuest) return;
    saveQuestProgress({
      questId: activeQuest.id,
      currentWordIndex: 0,
      questComplete: false,
    });
    resetTrophyProgress(activeQuest.id);
    resetDiscoveryProgress(activeQuest.id);
    clearTrophyUnlockSeen(activeQuest.id);
    clearNodeRatings(activeQuest.id);
    setArrivedFromWord(null);
    setTrophyJustCompleted(false);
    setWordIndex(0);
    setMapRevision((r) => r + 1);
    // Force a clean remount by briefly toggling route
    setRoute("home");
    setTimeout(() => setRoute("map"), 50);
  }, [activeQuest?.id]);

  // ---- DEV: Full game reset ----
  const handleDevResetAll = useCallback(() => {
    // Clear all game-related localStorage
    const keysToRemove = [
      "wigglewoo-cvc-progress",
      "wigglewoo-global-progress",
      "wigglewoo-trophy-progress",
      "wigglewoo-trophy-all",
      "wigglewoo-discovery-all",
      "wigglewoo-node-ratings",
      "wigglewoo-trophy-unlock-seen",
      "wigglewoo-skins",
      "wigglewoo-active-skin",
      "ww_env_visited",
      "ww_factProgress",
      "ww_learning_analytics",
      "ww_settings",
      "ww_dev_unlock",
      "ww_placement",
      "ww_placement_tiers",
    ];
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
    // Also clear placement data
    resetPlacement();
    // Reset to default quest
    const defaultQuest = CVC_QUESTS[0];
    setActiveQuest(defaultQuest);
    saveGlobalProgress({ activeQuestId: defaultQuest.id });
    setArrivedFromWord(null);
    setTrophyJustCompleted(false);
    setWordIndex(0);
    setWardrobeOpen(false);
    setMapRevision((r) => r + 1);
    setRoute("home");
    setTimeout(() => setRoute("map"), 50);
  }, []);

  // ---- Enter Trophy Room ----
  const handleEnterTrophyRoom = useCallback(() => {
    setRoute("trophy-room");
  }, []);

  // ---- Enter Trophy Room (view-only, from quest map showcase click) ----
  const handleViewTrophyRoom = useCallback(() => {
    setRoute("trophy-room-view");
  }, []);

  // ---- Trophy Room Complete — progression saved, animation handles in-screen ----
  const [trophyJustCompleted, setTrophyJustCompleted] = useState(false);

  const handleTrophyRoomComplete = useCallback(() => {
    if (!activeQuest) return;
    completeTrophyRoom(activeQuest.id);
    recordTrophyEarned(activeQuest.id, activeQuest.patternType);
    setTrophyJustCompleted(true);
    setMapRevision((r) => r + 1);
  }, [activeQuest?.id]);

  // ---- Trophy Room exit → back to map (player continues to node 9) ----
  const handleTrophyRoomExit = useCallback(() => {
    setTrophyJustCompleted(false);
    setArrivedFromWord(null);
    setMapRevision((r) => r + 1);
    setRoute("map");
  }, []);

  // ---- Open/close Learning Insights ----
  const handleOpenInsights = useCallback(() => setRoute("insights"), []);
  const handleCloseInsights = useCallback(() => setRoute("map"), []);

  // ---- Explore Mode ----
  const [exploreEnvId, setExploreEnvId] = useState<string | null>(null);

  const handleExplore = useCallback((envId: string) => {
    markEnvironmentVisited(envId);
    setExploreEnvId(envId);
    setTrophyJustCompleted(false);
    setRoute("explore");
  }, [activeQuest?.id]);

  const handleExploreBack = useCallback(() => {
    setExploreEnvId(null);
    setRoute("map");
  }, []);

  // ---- Challenge Mode unlock ----
  const [showChallengeUnlock, setShowChallengeUnlock] = useState(false);

  /** Check if Challenge Mode should unlock for the active quest */
  const checkChallengeUnlock = useCallback(() => {
    if (!activeQuest) return;
    if (isChallengeUnlocked(activeQuest.id)) return; // already unlocked
    const progress = loadQuestProgress(activeQuest.id);
    // Trigger 1: quest complete (all 16 words)
    const questDone = progress.questComplete;
    // Trigger 2: 75% accuracy over last 8 words
    const highAccuracy = hasHighAccuracy(activeQuest.id, 8);
    if (questDone || highAccuracy) {
      unlockChallengeMode(activeQuest.id);
      setShowChallengeUnlock(true);
    }
  }, [activeQuest?.id]);

  // ---- Discovery Room (post-node-16 reward) ----
  const [unlockedSkinId, setUnlockedSkinId] = useState<string | null>(null);
  const [hasNewSkin, setHasNewSkin] = useState(false); // drives wardrobe button pulse

  const handleDiscoveryRoomComplete = useCallback(() => {
    if (!activeQuest) return;
    completeDiscoveryRoom(activeQuest.id);
    const envId = QUEST_ENVIRONMENT_MAP[activeQuest.id];
    if (envId) {
      const skinId = unlockSkinForEnvironment(envId);
      if (skinId) {
        setUnlockedSkinId(skinId);
      }
    }
    setMapRevision((r) => r + 1);
  }, [activeQuest?.id]);

  const handleSkinUnlockTryItOn = useCallback(() => {
    setUnlockedSkinId(null);
    setHasNewSkin(false);
    setSkinRevision((r) => r + 1);
    // Stay in discovery room — player explores, then taps Back to return to map
  }, []);

  const handleSkinUnlockSaveLater = useCallback(() => {
    setUnlockedSkinId(null);
    setHasNewSkin(true); // pulse the wardrobe button
    // Stay in discovery room — player explores, then taps Back to return to map
  }, []);

  const handleDiscoveryRoomExit = useCallback(() => {
    setExploreEnvId(null);
    setArrivedFromWord(null);

    // After discovery room → auto-advance to next vowel quest
    if (activeQuest) {
      const next = getNextAutoAdvanceQuest(activeQuest.id);
      if (next) {
        ensureQuestLoaded(next.questId).then(() => {
          const nextQuest = getQuestById(next.questId);
          if (nextQuest) {
            setActiveQuest(nextQuest);
            saveGlobalProgress({ activeQuestId: next.questId });
            setWordIndex(0);
          }
          setMapRevision((r) => r + 1);
          setRoute("map");
        });
        return;
      }
    }

    setMapRevision((r) => r + 1);
    setRoute("map");
  }, [activeQuest?.id]);

  // ---- Enter Discovery Room from map node ----
  const handleEnterDiscoveryRoom = useCallback(() => {
    if (!activeQuest) return;
    const envId = QUEST_ENVIRONMENT_MAP[activeQuest.id];
    if (envId) {
      markEnvironmentVisited(envId);
      setExploreEnvId(envId);
      setRoute("discovery-room");
    }
  }, [activeQuest?.id]);

  // ---- Wardrobe ----
  const [wardrobeOpen, setWardrobeOpen] = useState(false);
  const [skinRevision, setSkinRevision] = useState(0);

  const handleOpenWardrobe = useCallback(() => {
    setWardrobeOpen(true);
    setHasNewSkin(false);
  }, []);

  const handleCloseWardrobe = useCallback(() => {
    setWardrobeOpen(false);
  }, []);

  const handleSkinChanged = useCallback(() => {
    setSkinRevision((r) => r + 1);
  }, []);

  // Brief loading state while lazy chunk loads (returning CVCC/CVVC user)
  if (!activeQuest) {
    return (
      <Stage>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%", height: "100%",
        }} />
      </Stage>
    );
  }

  return (
    <OrientationGuard>

      <Stage>

      {route === "placement" && (
        <PlacementTestScreen
          onComplete={handlePlacementComplete}
          onSkip={handlePlacementSkip}
        />
      )}

      {route === "home" && (
        <ScreenGate>
          <PlayNowScreen onPlay={handlePlay} />
        </ScreenGate>
      )}


      {route === "map" && (
        <ScreenGate>
          <QuestMapScreen
            key={`map-${mapRevision}-${skinRevision}`}
            quest={activeQuest}
            onStartLevel={handleStartLevel}
            onRestartQuest={handleRestartQuest}
            onDevResetAll={handleDevResetAll}
            onSelectQuest={handleSelectQuest}
            onGoHome={handleGoHome}
            onEnterTrophyRoom={handleEnterTrophyRoom}
            onViewTrophyRoom={handleViewTrophyRoom}
            onEnterDiscoveryRoom={handleEnterDiscoveryRoom}
            onOpenInsights={handleOpenInsights}
            onExplore={handleExplore}
            onOpenWardrobe={handleOpenWardrobe}
            hasNewSkin={hasNewSkin}
            trophyJustEarned={trophyJustCompleted}
            arrivedFromWord={arrivedFromWord}
          />
        </ScreenGate>
      )}

      {route === "game" && (
        <ScreenGate>
          <GameScreen
            key={`game-${activeQuest.id}-${wordIndex}`}
            quest={activeQuest}
            currentWordIndex={wordIndex}
            onNavigate={handleNavigate}
            onGoHome={handleGoHome}
          />
        </ScreenGate>
      )}

      {route === "trophy-room" && (
        <ScreenGate>
          <TrophyRoomScreen
            vowelId={questIdToVowelId(activeQuest.id) as VowelId}
            quest={activeQuest}
            onComplete={handleTrophyRoomComplete}
            onExit={handleTrophyRoomExit}
          />
        </ScreenGate>
      )}

      {route === "trophy-room-view" && (
        <ScreenGate>
          <TrophyRoomScreen
            vowelId={questIdToVowelId(activeQuest.id) as VowelId}
            quest={activeQuest}
            onComplete={() => {}}
            onExit={() => setRoute("map")}
            viewOnly
          />
        </ScreenGate>
      )}

      {route === "explore" && exploreEnvId && (
        <ScreenGate>
          <ExploreScreen
            environmentId={exploreEnvId}
            questId={activeQuest.id}
            onBack={handleExploreBack}
            onComplete={handleDiscoveryRoomComplete}
          />
        </ScreenGate>
      )}

      {route === "discovery-room" && exploreEnvId && (
        <ScreenGate>
          <ExploreScreen
            environmentId={exploreEnvId}
            questId={activeQuest.id}
            onBack={handleDiscoveryRoomExit}
            onComplete={handleDiscoveryRoomComplete}
          />
        </ScreenGate>
      )}

      {route === "trophy-transition" && (
        <div className="trophy-transition-overlay">
          <div className="trophy-transition__spinner">
            <img
              src={trophyTransitionImg}
              alt="Trophy"
              className="trophy-transition__trophy-img"
              draggable={false}
            />
          </div>
          <h2 className="trophy-transition__text">🌟 Invention Powered Up! 🌟</h2>
        </div>
      )}

      </Stage>

      {route === "insights" && (
        <ScreenGate>
          <LearningInsightsScreen onClose={handleCloseInsights} />
        </ScreenGate>
      )}

      <WardrobeModal
        isOpen={wardrobeOpen}
        onClose={handleCloseWardrobe}
        onSkinChanged={handleSkinChanged}
      />

      {showChallengeUnlock && activeQuest && (
        <ChallengeModeUnlock
          questTitle={activeQuest.title}
          onDismiss={() => setShowChallengeUnlock(false)}
        />
      )}

      {unlockedSkinId && (
        <SkinUnlockCelebration
          skinId={unlockedSkinId}
          onTryItOn={handleSkinUnlockTryItOn}
          onSaveLater={handleSkinUnlockSaveLater}
        />
      )}
    </OrientationGuard>
  );
}
