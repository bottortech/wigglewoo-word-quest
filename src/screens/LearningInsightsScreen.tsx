// =============================================
// LearningInsightsScreen.tsx — Parent/Teacher dashboard
// COPPA-safe: no PII, no child accounts
// =============================================

import React, { useMemo, useState } from "react";
import { getInsights, resetAnalytics } from "../game/analytics";
import type { VowelInsight, OverallInsight } from "../game/analytics";
import "../styles/insights.css";

interface LearningInsightsScreenProps {
  onClose: () => void;
}

const LearningInsightsScreen: React.FC<LearningInsightsScreenProps> = ({ onClose }) => {
  const [resetKey, setResetKey] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const insights: OverallInsight = useMemo(() => getInsights(), [resetKey]);

  const handleReset = () => {
    resetAnalytics();
    setResetKey((k) => k + 1);
    setShowResetConfirm(false);
  };

  // Group vowels by pattern type
  const grouped = useMemo(() => {
    const groups: Record<string, VowelInsight[]> = {};
    for (const v of insights.vowels) {
      const key = v.patternType.toUpperCase();
      if (!groups[key]) groups[key] = [];
      groups[key].push(v);
    }
    return groups;
  }, [insights.vowels]);

  const hasData = insights.vowels.length > 0;

  return (
    <div className="insights-screen">
      {/* Header */}
      <div className="insights-header">
        <button className="insights-header__back" onClick={onClose}>← Back</button>
        <h1 className="insights-header__title">📊 Learning Insights</h1>
        <span className="insights-header__subtitle">For Parents & Teachers</span>
      </div>

      <div className="insights-body">
        {!hasData ? (
          <div className="insights-empty">
            <span className="insights-empty__icon">📚</span>
            <p>No learning data yet! Start playing quests to see progress here.</p>
            <button className="insights-btn insights-btn--primary" onClick={onClose}>
              Start Playing →
            </button>
          </div>
        ) : (
          <div className="insights-layout">
            {/* LEFT — Stats + Actions */}
            <div className="insights-sidebar">
              <div className="insights-stat">
                <span className="insights-stat__icon">🗺️</span>
                <span className="insights-stat__value">
                  {insights.completedQuests}/{insights.totalQuests}
                </span>
                <span className="insights-stat__label">Quests</span>
              </div>
              <div className="insights-stat">
                <span className="insights-stat__icon">🎯</span>
                <span className="insights-stat__value">{insights.overallAccuracy}%</span>
                <span className="insights-stat__label">Accuracy</span>
              </div>

              {/* Needs Practice */}
              {insights.needsPractice.length > 0 && (
                <div className="insights-practice">
                  <span className="insights-practice__title">💡 Practice</span>
                  {insights.needsPractice.map((tip, i) => (
                    <span key={i} className="insights-practice__tip">{tip}</span>
                  ))}
                </div>
              )}

              {/* Reset */}
              <div className="insights-reset">
                {!showResetConfirm ? (
                  <button
                    className="insights-btn insights-btn--danger"
                    onClick={() => setShowResetConfirm(true)}
                  >
                    🗑️ Reset
                  </button>
                ) : (
                  <div className="insights-reset-confirm">
                    <p>Erase all data?</p>
                    <button className="insights-btn insights-btn--danger" onClick={handleReset}>
                      Yes
                    </button>
                    <button
                      className="insights-btn insights-btn--secondary"
                      onClick={() => setShowResetConfirm(false)}
                    >
                      No
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — Vowel progress rows */}
            <div className="insights-main">
              {Object.entries(grouped).map(([patternType, vowels]) => (
                <div key={patternType} className="insights-section">
                  <h2 className="insights-section__title">{patternType} Progress</h2>
                  <div className="insights-vowel-list">
                    {vowels.map((v) => (
                      <div key={v.questId} className="insights-vowel-row">
                        <div className="insights-vowel-row__label">
                          <span className="insights-vowel-row__name">{v.vowelLabel}</span>
                          <span className="insights-vowel-row__trophy">
                            {v.trophyEarned ? "🏆" : v.nodesCompleted > 0 ? "⏳" : ""}
                          </span>
                        </div>
                        <div className="insights-vowel-row__bar-track">
                          <div
                            className="insights-vowel-row__bar-fill"
                            style={{ width: `${(v.nodesCompleted / v.totalNodes) * 100}%` }}
                          />
                          <span className="insights-vowel-row__bar-text">
                            {v.nodesCompleted}/{v.totalNodes}
                          </span>
                        </div>
                        <span className={`insights-vowel-row__accuracy ${
                          v.accuracy < 70 ? "insights-vowel-row__accuracy--low" : ""
                        }`}>
                          {v.totalAttempts > 0 ? `${v.accuracy}%` : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningInsightsScreen;
