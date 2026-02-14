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
import OrientationOverlay from "./components/OrientationOverlay";
import Stage from "./components/Stage";
import { ALL_QUESTS, getNextQuest, getQuestById, questIdToVowelId } from "./game/wordData";
import {
  loadQuestProgress,
  advanceWord,
  loadGlobalProgress,
  saveGlobalProgress,
  saveQuestProgress,
  completeTrophyRoom,
  resetTrophyProgress,
  getNextPlayableQuestInType,
  clearTrophyUnlockSeen,
  clearNodeRatings,
} from "./game/progression";
import { backgroundMusic } from "./audio/BackgroundMusic";
import { recordTrophyEarned } from "./game/analytics";
import trophyTransitionImg from "./assets/trophy.png";
import "./styles/trophy-transition.css";
import type { Quest, VowelId } from "./game/types";

type Route = "home" | "map" | "game" | "trophy-room" | "trophy-room-view" | "trophy-transition" | "insights";

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
  const globalProg = loadGlobalProgress(ALL_QUESTS[0].id);
  const initialQuest =
    ALL_QUESTS.find((q) => q.id === globalProg.activeQuestId) ?? ALL_QUESTS[0];

  const [route, setRoute] = useState<Route>("home");
  const [activeQuest, setActiveQuest] = useState<Quest>(initialQuest);
  const [wordIndex, setWordIndex] = useState<number>(0);

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
    setRoute("home");
  }, []);

  // ---- Quest Map → Game Screen ----
  const handleStartLevel = useCallback((selectedWordIndex: number) => {
    // Ensure music is playing when starting a level
    backgroundMusic.play();
    setWordIndex(selectedWordIndex);
    setArrivedFromWord(null); // clear animation signal
    setRoute("game");
  }, []);

  // ---- Select a different quest (from Word Quest Box) ----
  const handleSelectQuest = useCallback((questId: string) => {
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
    [activeQuest.id]
  );

  // ---- Restart current quest ----
  const handleRestartQuest = useCallback(() => {
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
  }, [activeQuest.id]);

  // ---- Enter Trophy Room ----
  const handleEnterTrophyRoom = useCallback(() => {
    setRoute("trophy-room");
  }, []);

  // ---- Enter Trophy Room (view-only, from quest map showcase click) ----
  const handleViewTrophyRoom = useCallback(() => {
    setRoute("trophy-room-view");
  }, []);

  // ---- Trophy Room Complete — progression saved, animation handles in-screen ----
  const handleTrophyRoomComplete = useCallback(() => {
    completeTrophyRoom(activeQuest.id);
    recordTrophyEarned(activeQuest.id, activeQuest.patternType);
    setMapRevision((r) => r + 1);
  }, [activeQuest.id]);

  // ---- Switch to next quest (within same type, then cross-type) ----
  const handleNextQuest = useCallback(() => {
    // First try next within same pattern type (A→E→I→O→U)
    const nextInType = getNextPlayableQuestInType(activeQuest.id, ALL_QUESTS);
    const next = nextInType || getNextQuest(activeQuest.id);
    if (!next) return;
    setActiveQuest(next);
    saveGlobalProgress({ activeQuestId: next.id });
    setArrivedFromWord(null);
    setMapRevision((r) => r + 1);
  }, [activeQuest.id]);

  // ---- Open/close Learning Insights ----
  const handleOpenInsights = useCallback(() => setRoute("insights"), []);
  const handleCloseInsights = useCallback(() => setRoute("map"), []);

  return (
    <>
      {/* Soft orientation hint for mobile portrait mode */}
      <OrientationOverlay />
      
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
          onNextQuest={handleNextQuest}
          onSelectQuest={handleSelectQuest}
          onGoHome={handleGoHome}
          onEnterTrophyRoom={handleEnterTrophyRoom}
          onViewTrophyRoom={handleViewTrophyRoom}
          onOpenInsights={handleOpenInsights}
          arrivedFromWord={arrivedFromWord}
          hasNextQuest={getNextQuest(activeQuest.id) !== null}
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
          onExit={() => setRoute("map")}
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

      {route === "insights" && (
        <LearningInsightsScreen onClose={handleCloseInsights} />
      )}
      </Stage>
    </>
  );
}
