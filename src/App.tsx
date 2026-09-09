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
import CrossMatchScreen from "./screens/CrossMatchScreen";
import SkillBadgeGalleryScreen from "./screens/SkillBadgeGalleryScreen";

import { loadSettings } from "./game/settings";
import LoadingGate from "./components/LoadingScreen";
import OrientationOverlay from "./components/OrientationOverlay";
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
import { QUEST_ENVIRONMENT_MAP, ENVIRONMENTS } from "./game/exploreData";
import { IS_KIOSK_BUILD, KIOSK_WORD_INDICES } from "./game/kioskMode";
import {
  loadQuestProgress,
  advanceWord,
  loadGlobalProgress,
  saveGlobalProgress,
  saveQuestProgress,
  loadTrophyProgress,
  awardTrophyTier,
  resetTrophyProgress,
  clearTrophyUnlockSeen,
  clearNodeRatings,
  markEnvironmentVisited,
  completeDiscoveryRoom,
  resetDiscoveryProgress,
  loadDiscoveryProgress,
  migrateOldCompletedQuests,
  isChallengeUnlocked,
  recordVowelQuestCompletion,
  unlockChallengeMode,
  hasHighAccuracy,
  areAllQuestsComplete,
  getPendingCrossMatch,
  markCrossMatchComplete,
  resetCrossMatchProgress,
} from "./game/progression";
import { FIRST_HALF_WORDS } from "./game/types";
import { unlockSkinForEnvironment, initDefaultSkinPaths, getActiveSkinEnvironmentId } from "./game/skins";
import { CVC_QUEST_IDS, CVCC_QUEST_IDS, CVVC_QUEST_IDS } from "./game/questIds";
import WardrobeModal from "./components/WardrobeModal";
import SkinUnlockCelebration from "./components/SkinUnlockCelebration";
import heroImgDefault from "./assets/wiggle_woo_hero_stance.png";
import helperImgDefault from "./assets/wigglewoo_helper_transparent.png";
import { backgroundMusic } from "./audio/BackgroundMusic";
import { playEvent } from "./audio/SoundEffects";
import { recordTrophyEarned } from "./game/analytics";
import trophyTransitionImg from "./assets/trophy.png";
import "./styles/trophy-transition.css";
import ChallengeModeUnlock from "./components/ChallengeModeUnlock";
// PARKED for v1 — Blending Power celebration is replaced by QuestCompleteCelebration.
// Re-import + re-fire when CVCC ships in 1.1.
// import BlendingPowerUnlock from "./components/BlendingPowerUnlock";
import QuestCompleteCelebration from "./components/QuestCompleteCelebration";
import DemoResetZone from "./components/DemoResetZone";
import OnboardingScreen from "./screens/OnboardingScreen";
import PotionGameScreen from "./screens/PotionGameScreen";
import WordTacToeScreen from "./screens/WordTacToeScreen";
import LetterGallery from "./components/handwriting/LetterGallery";
import { resetPlacement } from "./game/placementTest";
import type { Quest, VowelId } from "./game/types";

type Route = "home" | "onboarding" | "map" | "game" | "potion-game" | "trophy-room" | "trophy-room-view" | "trophy-transition" | "insights" | "explore" | "discovery-room" | "wardrobe" | "cross-match" | "badges" | "word-tac-toe";

const ONBOARDING_SEEN_KEY = "ww_onboarding_seen";

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

    // Welcome VO on every startup — short delay so music has time to fade in
    const welcomeTimer = setTimeout(() => playEvent("welcome-intro"), 1500);

    // Kiosk mode: force the active quest's trophy tier to exactly "half"
    // on every launch, so the shortened 4-game sequence always routes to
    // the phase-2 trophy room (see handleNavigate's quest-summary branch,
    // which only fires trophy-room when tier === "half" exactly — "full"
    // or "none" both skip straight to discovery).
    //
    // Two bugs this guards against, both observed from stale localStorage
    // left over by non-kiosk testing/dev play on the same device:
    //   1. Must target whatever quest is ACTUALLY active (globalProg,
    //      read just below) — not a hardcoded CVC_QUESTS[0] — otherwise a
    //      drifted active quest never gets seeded at all.
    //   2. Must reset before awarding — awardTrophyTier only upgrades,
    //      never downgrades, so if the active quest was previously played
    //      to "full" tier, awarding "half" on top of it is a no-op and
    //      the trophy room still gets skipped.
    if (IS_KIOSK_BUILD) {
      resetTrophyProgress(globalProg.activeQuestId);
      awardTrophyTier(globalProg.activeQuestId, "half");
    }

    return () => {
      clearTimeout(welcomeTimer);
      backgroundMusic.destroy();
    };
  }, []);

  // Initialize default skin asset paths (bundled imports)
  useEffect(() => {
    initDefaultSkinPaths(heroImgDefault, helperImgDefault);
    const allQuestIds = [...CVC_QUEST_IDS, ...CVCC_QUEST_IDS, ...CVVC_QUEST_IDS];
    // Migrate old completed quests to include discovery room progress
    migrateOldCompletedQuests(allQuestIds);

    // Backfill skin unlocks. The standard unlock path runs from
    // handleDiscoveryRoomComplete, but if a quest was finished via dev
    // controls, an interrupted session, or before the skin-unlock branch was
    // wired, the corresponding skin can stay locked even though the room
    // shows complete. Walking saved progress on boot fixes those stuck saves
    // in one pass and prevents drift going forward.
    for (const questId of allQuestIds) {
      const dp = loadDiscoveryProgress(questId);
      if (!dp.discoveryRoomComplete) continue;
      const envId = QUEST_ENVIRONMENT_MAP[questId];
      if (envId) unlockSkinForEnvironment(envId);
    }
  }, []);

  // Global quest tracker — which vowel set we're on
  const globalProg = loadGlobalProgress(DEFAULT_QUEST_ID);

  // Resolve initial quest synchronously for CVC, null if chunk not loaded
  const resolvedInitial = getQuestById(globalProg.activeQuestId) ?? null;

  // V1 ships CVC only. Blending Power (CVCC) is parked for 1.1 — clamp
  // the placement tier list so stale localStorage from any prior build
  // can't expose CVCC / Magic E / Vowel Teams / Advanced. When CVCC is
  // re-enabled in 1.1, change this back to ["CVC", "CVCC"].
  useEffect(() => {
    const expected = JSON.stringify(["CVC"]);
    const tiers = localStorage.getItem("ww_placement_tiers");
    if (tiers !== expected) {
      localStorage.setItem("ww_placement_tiers", expected);
    }
  }, []);

  // Start on Play Now screen
  const [route, setRoute] = useState<Route>("home");
  const [activeQuest, setActiveQuest] = useState<Quest | null>(resolvedInitial);
  const [wordIndex, setWordIndex] = useState<number>(0);
  // All 16 words passed to screens — decode gating handled in QuestMapScreen
  void getImageWords; void getDecodeWords;

  // Kiosk mode: index into KIOSK_WORD_INDICES for the current child's session
  const [kioskStep, setKioskStep] = useState(0);
  // True while a Word-Tac-Toe interlude is showing as a forced kiosk beat
  // (as opposed to a voluntary main-build visit via the Quest Map pill).
  // Declared here (before handleNavigate) rather than near the other
  // Word-Tac-Toe handlers below, since handleNavigate's kiosk branch reads
  // it and needs it in scope already — same reasoning as kioskStep above.
  const [kioskWordTacToeActive, setKioskWordTacToeActive] = useState(false);
  // True while the wardrobe modal is open specifically as the mandatory
  // kiosk intro step (every child picks a character before the map) —
  // distinguishes that from the map's own "open wardrobe" button, which
  // should just close normally. See handleCloseWardrobe.
  const [kioskWardrobeIntro, setKioskWardrobeIntro] = useState(false);

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

  // ---- Home Screen → Onboarding (first launch) or Map ----
  const handlePlay = useCallback(() => {
    if (loadSettings().backgroundMusic) backgroundMusic.play();
    if (IS_KIOSK_BUILD && localStorage.getItem(ONBOARDING_SEEN_KEY) === "true") {
      // Kiosk mode: every child picks a character first (wardrobe intro),
      // then sees the map once — see handleCloseWardrobe for the
      // continuation into "map".
      setKioskWardrobeIntro(true);
      setWardrobeOpen(true);
    } else if (localStorage.getItem(ONBOARDING_SEEN_KEY) === "true") {
      setRoute("map");
    } else {
      setRoute("onboarding");
    }
  }, []);

  // ---- Go Home (from badge click) ----
  const handleGoHome = useCallback(() => {
    setTrophyJustCompleted(false);
    setRoute("home");
  }, []);

  // ---- Onboarding complete → Map (first word of first quest) ----
  const handleOnboardingComplete = useCallback(() => {
    localStorage.setItem(ONBOARDING_SEEN_KEY, "true");
    // V1 ships CVC only — see App.tsx clamp above for the 1.1 path.
    localStorage.setItem("ww_placement_tiers", JSON.stringify(["CVC"]));
    if (IS_KIOSK_BUILD) {
      // Wardrobe intro comes right after onboarding, before the map —
      // see handleCloseWardrobe for the continuation into "map".
      setKioskWardrobeIntro(true);
      setWardrobeOpen(true);
      return;
    }
    setRoute("map");
  }, []);

  // ---- Quest Map → Game Screen ----
  const handleStartLevel = useCallback((selectedWordIndex: number) => {
    // Ensure music is playing when starting a level
    if (loadSettings().backgroundMusic) backgroundMusic.play();
    setWordIndex(selectedWordIndex);
    setArrivedFromWord(null); // clear animation signal
    setTrophyJustCompleted(false);
    setRoute("potion-game");
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
        // Kiosk mode: chain straight into the next core game instead of
        // returning to the map. The final kiosk game plays the quest's real
        // last word, so it never reaches this branch — PotionGameScreen
        // routes it to "quest-summary" instead (handled below).
        if (IS_KIOSK_BUILD && kioskStep < KIOSK_WORD_INDICES.length - 1) {
          advanceWord(progress);
          const nextStep = kioskStep + 1;
          setKioskStep(nextStep);
          setWordIndex(KIOSK_WORD_INDICES[nextStep]);
          setArrivedFromWord(null);
          setTrophyJustCompleted(false);
          // Detour through Word-Tac-Toe right after kiosk's 2nd word —
          // shows off a genuinely different mechanic partway through the
          // run instead of just repeating potion games. wordIndex/kioskStep
          // are already advanced above, so completing it continues
          // straight into potion-game at the (already-set) next word.
          if (nextStep === 2) {
            setKioskWordTacToeActive(true);
            setRoute("word-tac-toe");
            return;
          }
          // Detour through a Cross-Match review of the 3 words just played
          // right before the transition into the final (4th) kiosk word —
          // the one spot in the short kiosk session with 3 already-played
          // words to review, so a kid gets to feel this game mode too.
          // wordIndex/kioskStep are already advanced above, so completing
          // the review just continues straight into potion-game.
          if (nextStep === KIOSK_WORD_INDICES.length - 1) {
            setKioskCrossMatchActive(true);
            setRoute("cross-match");
            return;
          }
          setRoute("potion-game");
          return;
        }

        // Level done → advance, route to trophy phase 1 if just finished node 8,
        // otherwise go back to map.
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

        // Cross-match review checkpoints (after word 4, 12). The helper
        // returns the earliest pending checkpoint that the player has reached
        // — handles both fresh completion and resume-after-skip.
        const pendingCp = getPendingCrossMatch(activeQuest.id, completedWordIndex + 1);
        if (pendingCp !== null) {
          setCrossMatchCheckpoint(pendingCp);
          setRoute("cross-match");
          return;
        }

        // Just completed node 8 (Lesson 2 mastery) → phase 1 trophy room.
        if (completedWordIndex === FIRST_HALF_WORDS - 1) {
          const tp = loadTrophyProgress(activeQuest.id);
          if (tp.tier === "none") {
            setTrophyPhase(1);
            backgroundMusic.playTrophyTheme();
            setRoute("trophy-room");
            return;
          }
        }

        setRoute("map");
        setMapRevision((r) => r + 1);
      } else {
        // quest-summary: last word (node 16) → trophy phase 2, then discovery
        advanceWord(progress);
        setTimeout(checkChallengeUnlock, 300);
        recordVowelQuestCompletion(activeQuest.id);

        const tp = loadTrophyProgress(activeQuest.id);
        if (tp.tier === "half") {
          // Phase 2 trophy room → exit will route to discovery
          setTrophyPhase(2);
          backgroundMusic.playTrophyTheme();
          setRoute("trophy-room");
          return;
        }

        // tier === "full" (migrated) or "none" (edge): go straight to discovery
        const envId = QUEST_ENVIRONMENT_MAP[activeQuest.id];
        if (envId) {
          markEnvironmentVisited(envId);
          backgroundMusic.playDiscoveryTheme(envId);
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
    [activeQuest?.id, kioskStep]
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
    resetCrossMatchProgress(activeQuest.id);
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
      "wigglewoo-crossmatch-all",
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
      ONBOARDING_SEEN_KEY,
      ...Object.keys(ENVIRONMENTS).map((envId) => `ww_room_complete_${envId}`),
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

  // ---- Demo Reset (volunteer hidden corner tap; also used by kiosk auto-reset) ----
  // Clears all per-session game progress but preserves ww_settings so
  // volunteer audio/display preferences survive between children.
  // keepOnboarding: kiosk mode passes true so the intro doesn't replay for
  // every child handoff — the staff-facing hidden 3-tap reset always clears it.
  const handleDemoReset = useCallback((keepOnboarding = false) => {
    const keysToRemove = [
      "wigglewoo-cvc-progress",
      "wigglewoo-global-progress",
      "wigglewoo-trophy-progress",
      "wigglewoo-trophy-all",
      "wigglewoo-discovery-all",
      "wigglewoo-crossmatch-all",
      "wigglewoo-node-ratings",
      "wigglewoo-trophy-unlock-seen",
      "wigglewoo-skins",
      "wigglewoo-active-skin",
      "ww_env_visited",
      "ww_factProgress",
      "ww_learning_analytics",
      "ww_dev_unlock",
      "ww_placement",
      "ww_placement_tiers",
      ...(keepOnboarding ? [] : [ONBOARDING_SEEN_KEY]),
      "ww_v1_quest_complete_seen",
      // Per-room "already complete" flags (ExploreScreen.tsx) — not cleared
      // here, a room's 2-fact auto-completion would never re-fire on a
      // later visit to that same room, which kiosk mode depends on every time.
      ...Object.keys(ENVIRONMENTS).map((envId) => `ww_room_complete_${envId}`),
    ];
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
    resetPlacement();

    const defaultQuest = CVC_QUESTS[0];
    setActiveQuest(defaultQuest);
    saveGlobalProgress({ activeQuestId: defaultQuest.id });
    setArrivedFromWord(null);
    setTrophyJustCompleted(false);
    setWordIndex(0);
    setWardrobeOpen(false);
    setKioskWardrobeIntro(false);
    setMapRevision((r) => r + 1);
    setSkinRevision((r) => r + 1);
    setShowQuestComplete(false);
    setShowChallengeUnlock(false);
    setUnlockedSkinId(null);
    setHasNewSkin(false);
    setExploreEnvId(null);
    setCrossMatchCheckpoint(null);
    setKioskCrossMatchActive(false);
    setKioskStep(0);
    if (IS_KIOSK_BUILD) {
      awardTrophyTier(defaultQuest.id, "half");
    }
    setRoute("home");
  }, []);

  // ---- Enter Trophy Room ----
  // Phase is chosen from current tier: none → phase 1, half → phase 2.
  // (Map's trophy node only goes "active" when tier === "none", so the
  // common entry from the map is phase 1; dev / replay paths use this too.)
  const handleEnterTrophyRoom = useCallback(() => {
    if (!activeQuest) return;
    const tp = loadTrophyProgress(activeQuest.id);
    setTrophyPhase(tp.tier === "none" ? 1 : 2);
    backgroundMusic.playTrophyTheme();
    setRoute("trophy-room");
  }, [activeQuest?.id]);

  // ---- Enter Trophy Room (view-only, from quest map showcase click) ----
  const handleViewTrophyRoom = useCallback(() => {
    setRoute("trophy-room-view");
  }, []);

  // ---- Trophy Room Complete — progression saved, animation handles in-screen ----
  const [trophyJustCompleted, setTrophyJustCompleted] = useState(false);
  // Which phase the active trophy room represents (1 = post-node-8, 2 = post-node-16)
  const [trophyPhase, setTrophyPhase] = useState<1 | 2>(1);

  // Active cross-match checkpoint (1-indexed word number, 4 or 12). null when
  // no cross-match is in progress.
  const [crossMatchCheckpoint, setCrossMatchCheckpoint] = useState<number | null>(null);
  // Kiosk-only: true while a Cross-Match review is inserted between the 3rd
  // kiosk word and the final word, so a kid gets to feel a different game
  // mode within their short session. Doesn't use crossMatchCheckpoint's
  // checkpoint-number scheme (kiosk isn't reviewing a real 4-word slice,
  // just the words it already played) or its localStorage bookkeeping
  // (kiosk progress is wiped every turn anyway) — see the kiosk branch in
  // handleNavigate and the render site below for the two spots this
  // branches from the normal cross-match path.
  const [kioskCrossMatchActive, setKioskCrossMatchActive] = useState(false);

  // ---- Cross-match completed → mark + return to map (or, in kiosk mode,
  // continue the chain into the final word — wordIndex/kioskStep were
  // already advanced before entering cross-match, so this just routes on). ----
  const handleCrossMatchComplete = useCallback(() => {
    if (kioskCrossMatchActive) {
      setKioskCrossMatchActive(false);
      setRoute("potion-game");
      return;
    }
    if (!activeQuest || crossMatchCheckpoint === null) return;
    markCrossMatchComplete(activeQuest.id, crossMatchCheckpoint);
    setCrossMatchCheckpoint(null);
    setMapRevision((r) => r + 1);
    setRoute("map");
  }, [activeQuest?.id, crossMatchCheckpoint, kioskCrossMatchActive]);

  // ---- Word-Tac-Toe ----
  // (kioskWordTacToeActive itself is declared earlier, alongside kioskStep —
  // handleNavigate's kiosk branch needs it in scope before this point.)
  const handleOpenWordTacToe = useCallback(() => setRoute("word-tac-toe"), []);

  const handleCloseWordTacToe = useCallback(() => setRoute("map"), []);

  // wordIndex/kioskStep are already advanced before entering Word-Tac-Toe
  // (same trick as Cross-Match above), so completing it just routes on.
  const handleWordTacToeComplete = useCallback(() => {
    setKioskWordTacToeActive(false);
    setRoute("potion-game");
  }, []);

  const handleTrophyRoomComplete = useCallback(() => {
    if (!activeQuest) return;
    const awarded = awardTrophyTier(activeQuest.id, trophyPhase === 2 ? "full" : "half");
    recordTrophyEarned(activeQuest.id, activeQuest.patternType);
    setTrophyJustCompleted(true);
    setMapRevision((r) => r + 1);
    void awarded;
  }, [activeQuest?.id, trophyPhase]);

  // ---- Trophy Room exit → phase 1 returns to map; phase 2 routes to discovery ----
  const handleTrophyRoomExit = useCallback(() => {
    setTrophyJustCompleted(false);
    setArrivedFromWord(null);

    if (trophyPhase === 2 && activeQuest) {
      // Phase 2 implies the player has completed all 16 words. Backstop the
      // skip path so tier reaches "full" even if they tapped Continue before
      // finishing the match — keeps tier and quest state consistent.
      awardTrophyTier(activeQuest.id, "full");
      // Kiosk mode: send the child to the discovery room matching the
      // WiggleWoo character they picked in the wardrobe intro, not the one
      // tied to whatever quest they played. Only falls back to a random
      // pick if they kept the default/unthemed "Classic WiggleWoo" (which
      // has no matching room).
      const envId = IS_KIOSK_BUILD
        ? getActiveSkinEnvironmentId() ?? Object.keys(ENVIRONMENTS)[Math.floor(Math.random() * Object.keys(ENVIRONMENTS).length)]
        : QUEST_ENVIRONMENT_MAP[activeQuest.id];
      if (envId) {
        markEnvironmentVisited(envId);
        backgroundMusic.playDiscoveryTheme(envId);
        setExploreEnvId(envId);
        setRoute("discovery-room");
        return;
      }
    }

    backgroundMusic.restoreMainTheme();
    setMapRevision((r) => r + 1);
    setRoute("map");
  }, [trophyPhase, activeQuest?.id]);

  // ---- Open/close Learning Insights ----
  const handleOpenInsights = useCallback(() => setRoute("insights"), []);
  const handleCloseInsights = useCallback(() => setRoute("map"), []);

  const handleOpenBadges = useCallback(() => setRoute("badges"), []);
  const handleCloseBadges = useCallback(() => setRoute("map"), []);

  // ---- Explore Mode ----
  const [exploreEnvId, setExploreEnvId] = useState<string | null>(null);

  const handleExplore = useCallback((envId: string) => {
    markEnvironmentVisited(envId);
    backgroundMusic.playDiscoveryTheme(envId);
    setExploreEnvId(envId);
    setTrophyJustCompleted(false);
    setRoute("explore");
  }, [activeQuest?.id]);

  const handleExploreBack = useCallback(() => {
    backgroundMusic.restoreMainTheme();
    setExploreEnvId(null);
    setRoute("map");
  }, []);

  // ---- Challenge Mode unlock ----
  const [showChallengeUnlock, setShowChallengeUnlock] = useState(false);

  // ---- V1 Quest Complete celebration ----
  // Replaces the parked BlendingPowerUnlock for v1. Fires once when the
  // player has fully finished all 5 CVC quests (nodes + trophy + discovery
  // for each). After dismissal the map shifts into "free explore" mode:
  // every Discovery Room is reachable directly from the map, vowel islands
  // are replayable, and the discovery cluster gets a beacon arrow + glow.
  //
  // Parked: BlendingPowerUnlock (CVCC tier celebration). When CVCC ships
  // in 1.1, swap this back to firing BlendingPowerUnlock instead.
  const [showQuestComplete, setShowQuestComplete] = useState(false);
  const V1_QUEST_COMPLETE_SEEN_KEY = "ww_v1_quest_complete_seen";
  useEffect(() => {
    if (route !== "map") return;
    if (localStorage.getItem(V1_QUEST_COMPLETE_SEEN_KEY) === "true") return;
    if (!areAllQuestsComplete([...CVC_QUEST_IDS])) return;
    setShowQuestComplete(true);
  }, [route, mapRevision]);

  const handleQuestCompleteDismiss = useCallback(() => {
    localStorage.setItem(V1_QUEST_COMPLETE_SEEN_KEY, "true");
    setShowQuestComplete(false);
  }, []);

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
    // Kiosk mode's room is randomly picked, not tied to activeQuest — the
    // per-quest skin-unlock mapping below wouldn't make sense here, and the
    // session resets right after anyway, so there's nothing to persist.
    if (IS_KIOSK_BUILD) return;
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
    backgroundMusic.restoreMainTheme();
    setExploreEnvId(null);
    setArrivedFromWord(null);

    // Kiosk mode: hand off to the next child instead of chaining quests.
    if (IS_KIOSK_BUILD) {
      handleDemoReset(true);
      return;
    }

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
  }, [activeQuest?.id, handleDemoReset]);

  // ---- Enter Discovery Room from map node ----
  const handleEnterDiscoveryRoom = useCallback(() => {
    if (!activeQuest) return;
    const envId = QUEST_ENVIRONMENT_MAP[activeQuest.id];
    if (envId) {
      markEnvironmentVisited(envId);
      backgroundMusic.playDiscoveryTheme(envId);
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
    if (kioskWardrobeIntro) {
      // Mandatory kiosk intro step just finished — continue into the map
      // (shown once per child) instead of just closing back to nothing.
      setKioskWardrobeIntro(false);
      setKioskStep(0);
      setWordIndex(KIOSK_WORD_INDICES[0]);
      setArrivedFromWord(null);
      setTrophyJustCompleted(false);
      setRoute("map");
    }
  }, [kioskWardrobeIntro]);

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
    <LoadingGate>
     <OrientationOverlay>

      <Stage>

      {new URLSearchParams(window.location.search).get("dev") === "letters" && (
        <LetterGallery />
      )}

      {route === "onboarding" && (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
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
            onOpenBadges={handleOpenBadges}
            onOpenWordTacToe={handleOpenWordTacToe}
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

      {route === "potion-game" && (
        <ScreenGate>
          <PotionGameScreen
            key={`potion-${activeQuest.id}-${wordIndex}`}
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
            phase={trophyPhase}
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

      {route === "cross-match" && (kioskCrossMatchActive || crossMatchCheckpoint !== null) && activeQuest && (
        <ScreenGate>
          <CrossMatchScreen
            key={`cm-${activeQuest.id}-${kioskCrossMatchActive ? "kiosk" : crossMatchCheckpoint}`}
            words={
              kioskCrossMatchActive
                ? KIOSK_WORD_INDICES.slice(0, 3).map((i) => activeQuest.words[i])
                : activeQuest.words.slice(crossMatchCheckpoint! - 4, crossMatchCheckpoint!)
            }
            onComplete={handleCrossMatchComplete}
          />
        </ScreenGate>
      )}

      {route === "word-tac-toe" && activeQuest && (
        <ScreenGate>
          <WordTacToeScreen
            key={`wtt-${activeQuest.id}`}
            words={activeQuest.words}
            onComplete={kioskWordTacToeActive ? handleWordTacToeComplete : handleCloseWordTacToe}
            onBack={kioskWordTacToeActive ? undefined : handleCloseWordTacToe}
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

      {route === "badges" && (
        <ScreenGate>
          <SkillBadgeGalleryScreen onBack={handleCloseBadges} />
        </ScreenGate>
      )}

      <WardrobeModal
        isOpen={wardrobeOpen}
        onClose={handleCloseWardrobe}
        onSkinChanged={handleSkinChanged}
        requireContinue={kioskWardrobeIntro}
      />

      {showChallengeUnlock && activeQuest && (
        <ChallengeModeUnlock
          questTitle={activeQuest.title}
          onDismiss={() => setShowChallengeUnlock(false)}
        />
      )}

      {showQuestComplete && (
        <QuestCompleteCelebration onDismiss={handleQuestCompleteDismiss} />
      )}

      {unlockedSkinId && (
        <SkinUnlockCelebration
          skinId={unlockedSkinId}
          onTryItOn={handleSkinUnlockTryItOn}
          onSaveLater={handleSkinUnlockSaveLater}
        />
      )}
      {/* ── Dev toggle: ?dev=1 in URL to access original GameScreen ── */}
      {(route === "game" || route === "potion-game") &&
        new URLSearchParams(window.location.search).get("dev") === "1" && (
        <button
          className="pg-dev-swap-btn"
          onClick={() => setRoute(route === "game" ? "potion-game" : "game")}
        >
          {route === "game" ? "🧪 Potion Lab" : "📦 Original"}
        </button>
      )}

      <DemoResetZone onReset={handleDemoReset} />

     </OrientationOverlay>
    </LoadingGate>
  );
}
