// =============================================
// SchoolconomyApp.tsx — Schoolconomy partnership entry
// =============================================
// ~8–10 min sampler for Schoolconomy students.
// Flow per session: welcome → CVC quest (first
// lesson chunk, 4 words) → trophy room (phase 1)
// → discovery room (1 fact + auto-complete) →
// completion.
//
// Across sessions: the active quest cycles through
// short-a → short-e → short-i → short-o → short-u
// → loop, so returning kids see new content every
// visit and can earn points again. Cycle index is
// stored in localStorage.
// =============================================

import { useState, useEffect, useCallback, useMemo } from "react";
import PotionGameScreen from "./screens/PotionGameScreen";
import TrophyRoomScreen from "./screens/TrophyRoomScreen";
import ExploreScreen from "./screens/ExploreScreen";
import SchoolconomyWelcome from "./schoolconomy/SchoolconomyWelcome";
import SchoolconomyCompletion from "./schoolconomy/SchoolconomyCompletion";

import LoadingGate from "./components/LoadingScreen";
import OrientationOverlay from "./components/OrientationOverlay";
import Stage from "./components/Stage";
import ScreenGate from "./components/ScreenGate";

import { loadSettings } from "./game/settings";
import { backgroundMusic } from "./audio/BackgroundMusic";
import { initDefaultSkinPaths } from "./game/skins";
import heroImgDefault from "./assets/wiggle_woo_hero_stance.png";
import helperImgDefault from "./assets/wigglewoo_helper_transparent.png";

import { getQuestById, questIdToVowelId } from "./game/wordData";
import { QUEST_ENVIRONMENT_MAP } from "./game/exploreData";
import {
  saveQuestProgress,
  resetTrophyProgress,
  resetDiscoveryProgress,
  resetCrossMatchProgress,
  clearTrophyUnlockSeen,
  clearNodeRatings,
  loadLessonMastery,
  awardTrophyTier,
  markEnvironmentVisited,
  completeDiscoveryRoom,
} from "./game/progression";
import { recordTrophyEarned } from "./game/analytics";
import type { VowelId } from "./game/types";

type Step = "welcome" | "quest" | "trophy" | "discovery" | "completion";

/** Quests rotate across replays so kids who return get fresh content
 *  and can earn points again. Loops back to short-a after short-u. */
const CYCLE_QUEST_IDS = [
  "quest-short-a",
  "quest-short-e",
  "quest-short-i",
  "quest-short-o",
  "quest-short-u",
] as const;

const CYCLE_IDX_KEY = "schoolconomy_cycle_idx";
const WORDS_IN_SEGMENT = 4; // one lesson chunk — mastery check fires on word 4
const BASE_POINTS = 10;
const BONUS_POINTS = 5;

function readCycleIdx(): number {
  try {
    const raw = localStorage.getItem(CYCLE_IDX_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    if (!isFinite(n) || n < 0) return 0;
    return n % CYCLE_QUEST_IDS.length;
  } catch {
    return 0;
  }
}

function writeCycleIdx(n: number): void {
  try {
    localStorage.setItem(CYCLE_IDX_KEY, String(n % CYCLE_QUEST_IDS.length));
  } catch {
    /* storage disabled — ok */
  }
}

export default function SchoolconomyApp() {
  useEffect(() => {
    backgroundMusic.init();
    const settings = loadSettings();
    if (settings.backgroundMusic) {
      backgroundMusic.play();
    } else {
      backgroundMusic.mute();
    }
    initDefaultSkinPaths(heroImgDefault, helperImgDefault);
    return () => backgroundMusic.destroy();
  }, []);

  const [step, setStep] = useState<Step>("welcome");
  const [cycleIdx, setCycleIdx] = useState<number>(() => readCycleIdx());
  const [wordIndex, setWordIndex] = useState(0);
  // Tracked for the future Schoolconomy callback even though not shown
  // on the completion screen yet.
  const [masteryBadgeEarned, setMasteryBadgeEarned] = useState(false);

  // Current quest + discovery environment are derived from the cycle
  // index, so advancing the cycle on Play Again automatically swaps
  // the quest, the trophy-room word pool, and the discovery room.
  const questId = CYCLE_QUEST_IDS[cycleIdx];
  const discoveryEnv = QUEST_ENVIRONMENT_MAP[questId] ?? "valcano";
  const quest = useMemo(() => getQuestById(questId) ?? null, [questId]);

  /** Wipe per-quest progression for a specific quest id so a fresh run
   *  starts cleanly (mastery badge, trophy state, discovery flag, etc.). */
  const resetSessionFor = useCallback((qid: string) => {
    const env = QUEST_ENVIRONMENT_MAP[qid] ?? "valcano";
    saveQuestProgress({ questId: qid, currentWordIndex: 0, questComplete: false });
    resetTrophyProgress(qid);
    resetDiscoveryProgress(qid);
    resetCrossMatchProgress(qid);
    clearTrophyUnlockSeen(qid);
    clearNodeRatings(qid);
    try {
      const all = JSON.parse(localStorage.getItem("ww_lessonMastery") || "{}");
      delete all[qid];
      localStorage.setItem("ww_lessonMastery", JSON.stringify(all));
    } catch { /* storage disabled — ok */ }
    try {
      localStorage.removeItem(`ww_room_complete_${env}`);
    } catch { /* storage disabled — ok */ }
    setMasteryBadgeEarned(false);
    setWordIndex(0);
  }, []);

  const handleBegin = useCallback(() => {
    if (loadSettings().backgroundMusic) backgroundMusic.play();
    resetSessionFor(questId);
    setStep("quest");
  }, [questId, resetSessionFor]);

  const handleQuestNavigate = useCallback(
    (_target: "next-word" | "quest-map" | "quest-summary") => {
      const nextIndex = wordIndex + 1;
      if (nextIndex >= WORDS_IN_SEGMENT) {
        const mastery = loadLessonMastery(questId);
        setMasteryBadgeEarned(!!mastery[0]);
        backgroundMusic.playTrophyTheme();
        setStep("trophy");
      } else {
        setWordIndex(nextIndex);
      }
    },
    [wordIndex, questId]
  );

  const handleTrophyRoomComplete = useCallback(() => {
    if (!quest) return;
    awardTrophyTier(quest.id, "half");
    recordTrophyEarned(quest.id, quest.patternType);
  }, [quest]);

  const handleTrophyRoomExit = useCallback(() => {
    if (!quest) return;
    awardTrophyTier(quest.id, "half");
    backgroundMusic.playDiscoveryTheme(discoveryEnv);
    markEnvironmentVisited(discoveryEnv);
    setStep("discovery");
  }, [quest, discoveryEnv]);

  const handleDiscoveryComplete = useCallback(() => {
    if (quest) completeDiscoveryRoom(quest.id);
  }, [quest]);

  const handleDiscoveryBack = useCallback(() => {
    if (quest) completeDiscoveryRoom(quest.id);
    backgroundMusic.restoreMainTheme();
    // Advance the quest cycle the moment the kid reaches completion.
    // Persisted immediately so a kid who closes the tab from the
    // completion screen (the common partner flow — they head back to
    // Schoolconomy to claim points) still sees the next quest on
    // their next visit.
    const nextIdx = (cycleIdx + 1) % CYCLE_QUEST_IDS.length;
    setCycleIdx(nextIdx);
    writeCycleIdx(nextIdx);
    setStep("completion");
  }, [quest, cycleIdx]);

  /** Play Again — cycle has already advanced on completion entry, so
   *  just route back to the welcome screen. handleBegin will reset
   *  progression for the now-current (next) quest. */
  const handlePlayAgain = useCallback(() => {
    setStep("welcome");
  }, []);

  if (!quest) {
    return (
      <Stage>
        <div style={{ width: "100%", height: "100%" }} />
      </Stage>
    );
  }

  return (
    <LoadingGate>
      <OrientationOverlay>
        <Stage>
          {step === "welcome" && (
            <ScreenGate>
              <SchoolconomyWelcome onBegin={handleBegin} />
            </ScreenGate>
          )}

          {step === "quest" && (
            <ScreenGate>
              <PotionGameScreen
                key={`sc-game-${quest.id}-${wordIndex}`}
                quest={quest}
                currentWordIndex={wordIndex}
                onNavigate={handleQuestNavigate}
              />
            </ScreenGate>
          )}

          {step === "trophy" && (
            <ScreenGate>
              <TrophyRoomScreen
                key={`sc-trophy-${quest.id}`}
                vowelId={questIdToVowelId(quest.id) as VowelId}
                quest={quest}
                phase={1}
                onComplete={handleTrophyRoomComplete}
                onExit={handleTrophyRoomExit}
                hideEarlyExit
              />
            </ScreenGate>
          )}

          {step === "discovery" && (
            <ScreenGate>
              <ExploreScreen
                key={`sc-discovery-${discoveryEnv}`}
                environmentId={discoveryEnv}
                questId={quest.id}
                onBack={handleDiscoveryBack}
                onComplete={handleDiscoveryComplete}
                factsToComplete={1}
                skipFirstVisitTrace
              />
            </ScreenGate>
          )}

          {step === "completion" && (
            <ScreenGate>
              <SchoolconomyCompletion
                basePoints={BASE_POINTS}
                bonusPoints={BONUS_POINTS}
                masteryBadgeEarned={masteryBadgeEarned}
                onPlayAgain={handlePlayAgain}
              />
            </ScreenGate>
          )}
        </Stage>
      </OrientationOverlay>
    </LoadingGate>
  );
}
