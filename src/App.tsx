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
import StickerBookScreen from "./screens/StickerBookScreen";
import OrientationGuard from "./components/OrientationOverlay";
import Stage from "./components/Stage";
import {
  CVC_QUESTS,
  getQuestById,
  questIdToVowelId,
  loadCvccQuests,
  loadCvvcQuests,
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
} from "./game/progression";
import { backgroundMusic } from "./audio/BackgroundMusic";
import { recordTrophyEarned } from "./game/analytics";
import trophyTransitionImg from "./assets/trophy.png";
import "./styles/trophy-transition.css";
import type { Quest, VowelId } from "./game/types";

type Route = "home" | "map" | "game" | "trophy-room" | "trophy-room-view" | "trophy-transition" | "insights" | "explore" | "sticker-book";

/** Load the correct quest chunk for a given quest ID */
async function ensureQuestLoaded(questId: string): Promise<void> {
  if (questId.includes("cvcc")) await loadCvccQuests();
  else if (questId.includes("cvvc")) await loadCvvcQuests();
}

export default function App() {
  // Initialize background music on app mount
  useEffect(() => {
    backgroundMusic.init();
    // Attempt to play (will queue if user hasn't interacted yet)
    backgroundMusic.play();

    return () => {
      // Cleanup on unmount (rarely called in SPA)
      backgroundMusic.destroy();
    };
  }, []);

  // Global quest tracker — which vowel set we're on
  const globalProg = loadGlobalProgress(DEFAULT_QUEST_ID);

  // Resolve initial quest synchronously for CVC, null if chunk not loaded
  const resolvedInitial = getQuestById(globalProg.activeQuestId) ?? null;

  const [route, setRoute] = useState<Route>("home");
  const [activeQuest, setActiveQuest] = useState<Quest | null>(resolvedInitial);
  const [wordIndex, setWordIndex] = useState<number>(0);

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

  // ---- Home Screen → Node Screen ----
  const handlePlay = useCallback(() => {
    // Ensure music starts on user interaction (Play button)
    backgroundMusic.play();
    setRoute("map");
  }, []);

  // ---- Go Home (from badge click) ----
  const handleGoHome = useCallback(() => {
    setTrophyJustCompleted(false);
    setRoute("home");
  }, []);

  // ---- Quest Map → Game Screen ----
  const handleStartLevel = useCallback((selectedWordIndex: number) => {
    // Ensure music is playing when starting a level
    backgroundMusic.play();
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
        // Level done → advance, go back to map with animation signal
        advanceWord(progress);
        setArrivedFromWord(completedWordIndex);
        setRoute("map");
        setMapRevision((r) => r + 1);
      } else {
        // quest-summary: last word done → mark complete, back to map
        advanceWord(progress);
        setArrivedFromWord(completedWordIndex);
        setRoute("map");
        setMapRevision((r) => r + 1);
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
    clearTrophyUnlockSeen(activeQuest.id);
    clearNodeRatings(activeQuest.id);
    setArrivedFromWord(null);
    setMapRevision((r) => r + 1);
  }, [activeQuest?.id]);

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

  // ---- Trophy Room exit → Discovery Room (or map fallback) ----
  const handleTrophyRoomExit = useCallback(() => {
    if (!activeQuest) { setRoute("map"); return; }
    const envId = QUEST_ENVIRONMENT_MAP[activeQuest.id];
    if (envId) {
      markEnvironmentVisited(envId);
      setExploreEnvId(envId);
      setTrophyJustCompleted(false);
      setRoute("explore");
    } else {
      setRoute("map");
    }
  }, [activeQuest?.id]);

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
  }, []);

  const handleExploreBack = useCallback(() => {
    setExploreEnvId(null);
    setRoute("map");
  }, []);

  // ---- Sticker Book ----
  const handleOpenStickerBook = useCallback(() => {
    setRoute("sticker-book");
  }, []);

  const handleStickerBookBack = useCallback(() => {
    setRoute("map");
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

      {route === "home" && (
        <PlayNowScreen onPlay={handlePlay} />
      )}

      {route === "map" && (
        <QuestMapScreen
          key={`map-${mapRevision}`}
          quest={activeQuest}
          onStartLevel={handleStartLevel}
          onRestartQuest={handleRestartQuest}
          onSelectQuest={handleSelectQuest}
          onGoHome={handleGoHome}
          onEnterTrophyRoom={handleEnterTrophyRoom}
          onViewTrophyRoom={handleViewTrophyRoom}
          onOpenInsights={handleOpenInsights}
          onExplore={handleExplore}
          onOpenStickerBook={handleOpenStickerBook}
          trophyJustEarned={trophyJustCompleted}
          arrivedFromWord={arrivedFromWord}
        />
      )}

      {route === "game" && (
        <GameScreen
          key={`game-${activeQuest.id}-${wordIndex}`}
          quest={activeQuest}
          currentWordIndex={wordIndex}
          onNavigate={handleNavigate}
          onGoHome={handleGoHome}
        />
      )}

      {route === "trophy-room" && (
        <TrophyRoomScreen
          vowelId={questIdToVowelId(activeQuest.id) as VowelId}
          quest={activeQuest}
          onComplete={handleTrophyRoomComplete}
          onExit={handleTrophyRoomExit}
        />
      )}

      {route === "trophy-room-view" && (
        <TrophyRoomScreen
          vowelId={questIdToVowelId(activeQuest.id) as VowelId}
          quest={activeQuest}
          onComplete={() => {}}
          onExit={() => setRoute("map")}
          viewOnly
        />
      )}

      {route === "explore" && exploreEnvId && (
        <ExploreScreen
          environmentId={exploreEnvId}
          questId={activeQuest.id}
          onBack={handleExploreBack}
        />
      )}

      {route === "sticker-book" && (
        <StickerBookScreen onBack={handleStickerBookBack} />
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
        <LearningInsightsScreen onClose={handleCloseInsights} />
      )}
    </OrientationGuard>
  );
}
