// =============================================
// LearningInsightsScreen.tsx — Parent Dashboard
// COPPA-safe: no PII, no child accounts
// =============================================
// Tabs: Reading Skills | Learning Progress | Accessibility
// All data from local analytics + progression.
// =============================================

import React, { useMemo, useState, useCallback } from "react";
import { getOverallSummary, resetAnalytics } from "../game/learningAnalytics";
import type { OverallSummary, VowelSummary, MasteryLevel } from "../game/learningAnalytics";
import { loadSettings, updateSetting, applySettingsToDOM } from "../game/settings";
import type { AppSettings } from "../game/settings";
import "../styles/insights.css";

interface LearningInsightsScreenProps {
  onClose: () => void;
}

type Tab = "reading" | "progress" | "accessibility";

const MASTERY_LABELS: Record<MasteryLevel, { label: string; color: string }> = {
  "not-seen": { label: "Not Started", color: "#999" },
  "mastered": { label: "Mastered", color: "#38b764" },
  "learning": { label: "Learning", color: "#4FC3F7" },
  "practicing": { label: "Practicing", color: "#FFA726" },
  "needs-support": { label: "Needs Support", color: "#EF5350" },
};

const LearningInsightsScreen: React.FC<LearningInsightsScreenProps> = ({ onClose }) => {
  const [tab, setTab] = useState<Tab>("reading");
  const [resetKey, setResetKey] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  const summary: OverallSummary = useMemo(() => getOverallSummary(), [resetKey]);

  const handleReset = () => {
    resetAnalytics();
    setResetKey((k) => k + 1);
    setShowResetConfirm(false);
  };

  const handleToggle = useCallback((key: keyof AppSettings) => {
    const updated = updateSetting(key, !settings[key]);
    setSettings(updated);
    applySettingsToDOM(updated);
  }, [settings]);

  const renderMasteryBar = (vs: VowelSummary) => {
    const pctMastered = vs.totalWords > 0 ? (vs.wordsMastered / vs.totalWords) * 100 : 0;
    const pctLearning = vs.totalWords > 0 ? (vs.wordsLearning / vs.totalWords) * 100 : 0;
    const pctPracticing = vs.totalWords > 0 ? (vs.wordsPracticing / vs.totalWords) * 100 : 0;
    const pctSupport = vs.totalWords > 0 ? (vs.wordsNeedSupport / vs.totalWords) * 100 : 0;

    return (
      <div className="insights-mastery-bar">
        {pctMastered > 0 && <div className="insights-mastery-bar__seg insights-mastery-bar__seg--mastered" style={{ width: `${pctMastered}%` }} />}
        {pctLearning > 0 && <div className="insights-mastery-bar__seg insights-mastery-bar__seg--learning" style={{ width: `${pctLearning}%` }} />}
        {pctPracticing > 0 && <div className="insights-mastery-bar__seg insights-mastery-bar__seg--practicing" style={{ width: `${pctPracticing}%` }} />}
        {pctSupport > 0 && <div className="insights-mastery-bar__seg insights-mastery-bar__seg--support" style={{ width: `${pctSupport}%` }} />}
      </div>
    );
  };

  return (
    <div className="insights-screen">
      {/* Header */}
      <div className="insights-header">
        <button className="insights-header__back" onClick={onClose}>← Back</button>
        <h1 className="insights-header__title">Parent Dashboard</h1>
      </div>

      {/* Tabs */}
      <div className="insights-tabs">
        <button
          className={`insights-tab ${tab === "reading" ? "insights-tab--active" : ""}`}
          onClick={() => setTab("reading")}
        >
          Reading Skills
        </button>
        <button
          className={`insights-tab ${tab === "progress" ? "insights-tab--active" : ""}`}
          onClick={() => setTab("progress")}
        >
          Learning Progress
        </button>
        <button
          className={`insights-tab ${tab === "accessibility" ? "insights-tab--active" : ""}`}
          onClick={() => setTab("accessibility")}
        >
          Accessibility
        </button>
      </div>

      <div className="insights-body">
        {/* ---- READING SKILLS TAB ---- */}
        {tab === "reading" && (
          <div className="insights-reading">
            {/* Top stats row */}
            <div className="insights-stats-row">
              <div className="insights-stat-card">
                <span className="insights-stat-card__value">{summary.totalMastered}</span>
                <span className="insights-stat-card__label">Words Mastered</span>
              </div>
              <div className="insights-stat-card">
                <span className="insights-stat-card__value">{summary.accuracy}%</span>
                <span className="insights-stat-card__label">Accuracy Rate</span>
              </div>
              <div className="insights-stat-card">
                <span className="insights-stat-card__value">{summary.avgAttempts}</span>
                <span className="insights-stat-card__label">Avg Attempts</span>
              </div>
            </div>

            {/* Mastery legend */}
            <div className="insights-legend">
              {(["mastered", "learning", "practicing", "needs-support"] as MasteryLevel[]).map(level => (
                <span key={level} className="insights-legend__item">
                  <span className="insights-legend__dot" style={{ background: MASTERY_LABELS[level].color }} />
                  {MASTERY_LABELS[level].label}
                </span>
              ))}
            </div>

            {/* Per-vowel breakdown */}
            <div className="insights-vowel-list">
              {summary.vowelSummaries.map((vs) => (
                <div key={vs.vowelGroup} className="insights-vowel-card">
                  <div className="insights-vowel-card__header">
                    <span className="insights-vowel-card__label">{vs.label}</span>
                    <span className="insights-vowel-card__count">
                      {vs.wordsMastered}/{vs.totalWords} mastered
                    </span>
                  </div>
                  {renderMasteryBar(vs)}
                  <div className="insights-vowel-card__details">
                    <span>Accuracy: {vs.accuracy > 0 ? `${vs.accuracy}%` : "—"}</span>
                    <span>Avg attempts: {vs.avgAttempts > 0 ? vs.avgAttempts : "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- LEARNING PROGRESS TAB ---- */}
        {tab === "progress" && (
          <div className="insights-progress">
            <div className="insights-stats-row">
              <div className="insights-stat-card">
                <span className="insights-stat-card__value">{summary.questsCompleted}</span>
                <span className="insights-stat-card__label">Quests Completed</span>
              </div>
              <div className="insights-stat-card">
                <span className="insights-stat-card__value">{summary.nodesCompleted}/80</span>
                <span className="insights-stat-card__label">Words Completed</span>
              </div>
              <div className="insights-stat-card">
                <span className="insights-stat-card__value">{summary.stickersCollected}</span>
                <span className="insights-stat-card__label">Stickers Collected</span>
              </div>
            </div>

            <div className="insights-stats-row">
              <div className="insights-stat-card">
                <span className="insights-stat-card__value">{summary.longestStreak}</span>
                <span className="insights-stat-card__label">Longest Streak</span>
              </div>
              <div className="insights-stat-card">
                <span className="insights-stat-card__value">{summary.currentStreak}</span>
                <span className="insights-stat-card__label">Current Streak</span>
              </div>
            </div>

            {/* Practice tips */}
            {summary.vowelSummaries.some(vs => vs.wordsNeedSupport > 0) && (
              <div className="insights-tips">
                <h3 className="insights-tips__title">Practice Suggestions</h3>
                {summary.vowelSummaries
                  .filter(vs => vs.wordsNeedSupport > 0)
                  .map(vs => (
                    <p key={vs.vowelGroup} className="insights-tips__item">
                      {vs.label}: {vs.wordsNeedSupport} word{vs.wordsNeedSupport > 1 ? "s" : ""} need{vs.wordsNeedSupport === 1 ? "s" : ""} more practice
                    </p>
                  ))}
              </div>
            )}

            {/* Reset */}
            <div className="insights-reset">
              {!showResetConfirm ? (
                <button className="insights-btn insights-btn--danger" onClick={() => setShowResetConfirm(true)}>
                  Reset All Data
                </button>
              ) : (
                <div className="insights-reset-confirm">
                  <p>This will erase all learning data. Are you sure?</p>
                  <button className="insights-btn insights-btn--danger" onClick={handleReset}>Yes, Reset</button>
                  <button className="insights-btn insights-btn--secondary" onClick={() => setShowResetConfirm(false)}>Cancel</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---- ACCESSIBILITY TAB ---- */}
        {tab === "accessibility" && (
          <div className="insights-accessibility">
            <div className="insights-toggle-list">
              <div className="insights-toggle">
                <div className="insights-toggle__info">
                  <span className="insights-toggle__label">Dyslexia-Friendly Font</span>
                  <span className="insights-toggle__desc">Use OpenDyslexic for reading text</span>
                </div>
                <button
                  className={`insights-toggle__switch ${settings.dyslexiaFont ? "insights-toggle__switch--on" : ""}`}
                  onClick={() => handleToggle("dyslexiaFont")}
                  role="switch"
                  aria-checked={settings.dyslexiaFont}
                >
                  <span className="insights-toggle__knob" />
                </button>
              </div>

              <div className="insights-toggle">
                <div className="insights-toggle__info">
                  <span className="insights-toggle__label">Slower Phoneme Playback</span>
                  <span className="insights-toggle__desc">Play letter sounds at a slower speed</span>
                </div>
                <button
                  className={`insights-toggle__switch ${settings.slowPhoneme ? "insights-toggle__switch--on" : ""}`}
                  onClick={() => handleToggle("slowPhoneme")}
                  role="switch"
                  aria-checked={settings.slowPhoneme}
                >
                  <span className="insights-toggle__knob" />
                </button>
              </div>

              <div className="insights-toggle">
                <div className="insights-toggle__info">
                  <span className="insights-toggle__label">Color-Blind Safe Mode</span>
                  <span className="insights-toggle__desc">Adjust colors for better visibility</span>
                </div>
                <button
                  className={`insights-toggle__switch ${settings.colorBlindMode ? "insights-toggle__switch--on" : ""}`}
                  onClick={() => handleToggle("colorBlindMode")}
                  role="switch"
                  aria-checked={settings.colorBlindMode}
                >
                  <span className="insights-toggle__knob" />
                </button>
              </div>

              <div className="insights-toggle">
                <div className="insights-toggle__info">
                  <span className="insights-toggle__label">Fact Narration</span>
                  <span className="insights-toggle__desc">Read discovery facts aloud</span>
                </div>
                <button
                  className={`insights-toggle__switch ${settings.factNarration ? "insights-toggle__switch--on" : ""}`}
                  onClick={() => handleToggle("factNarration")}
                  role="switch"
                  aria-checked={settings.factNarration}
                >
                  <span className="insights-toggle__knob" />
                </button>
              </div>

              <div className="insights-toggle">
                <div className="insights-toggle__info">
                  <span className="insights-toggle__label">Auto-Play Narration</span>
                  <span className="insights-toggle__desc">Automatically read facts when opened</span>
                </div>
                <button
                  className={`insights-toggle__switch ${settings.factNarrationAutoPlay ? "insights-toggle__switch--on" : ""}`}
                  onClick={() => handleToggle("factNarrationAutoPlay")}
                  role="switch"
                  aria-checked={settings.factNarrationAutoPlay}
                >
                  <span className="insights-toggle__knob" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningInsightsScreen;
