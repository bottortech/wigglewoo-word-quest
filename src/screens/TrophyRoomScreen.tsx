// =============================================
// TrophyRoomScreen.tsx — Invention Trophy Room Mini-Game
// Wigglewoo CVC Quest
// =============================================
// Flip & Match game with 3x2 grid (6 cards = 3 pairs)
// Words filtered by current quest vowel selection
// =============================================

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { CVC_WORD_BANK } from "../game/wordData";
import { loadQuestProgress, isQuestFullyComplete } from "../game/progression";
import type { VowelId, Quest, PatternType } from "../game/types";

import trophyRoomBg from "../assets/Invention_Trophy_Room.png";
import titleBar from "../assets/InventionRoom_Title.png";
import trophyImg from "../assets/trophy.png";
import continueQuestBtn from "../assets/cont_quest.png";
import wigglewooTrophyRoom from "../assets/wigglewoo_trophyroom.png";
import GlassDisplayCase from "../components/GlassDisplayCase";

import "../styles/trophyroom.css";

interface TrophyRoomScreenProps {
  vowelId: VowelId;
  quest: Quest;
  onComplete: () => void;
  onExit: () => void;
  /** View-only mode — no card game, trophy in display case */
  viewOnly?: boolean;
}

interface Card {
  id: string;
  word: string;
  isFlipped: boolean;
  isMatched: boolean;
  rotation: number; // -4 to +4 degrees
}

// Shuffle array using Fisher-Yates
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Get random rotation between -4 and +4 degrees
function getRandomRotation(): number {
  return Math.random() * 8 - 4;
}

// Select 3 random unique words from the word bank
function selectRandomWords(vowelId: VowelId): string[] {
  const wordPool = CVC_WORD_BANK[vowelId] || [];
  if (wordPool.length < 3) {
    // Fallback to shortA if not enough words
    return shuffleArray(CVC_WORD_BANK.shortA).slice(0, 3).map(w => w.word);
  }
  return shuffleArray(wordPool).slice(0, 3).map(w => w.word);
}

// Create card pairs from words
function createCardPairs(words: string[]): Card[] {
  const cards: Card[] = [];
  words.forEach((word, idx) => {
    cards.push({
      id: `${word}-a-${idx}`,
      word,
      isFlipped: false,
      isMatched: false,
      rotation: getRandomRotation(),
    });
    cards.push({
      id: `${word}-b-${idx}`,
      word,
      isFlipped: false,
      isMatched: false,
      rotation: getRandomRotation(),
    });
  });
  return shuffleArray(cards);
}

// Pattern type to display label
const PATTERN_LABELS: Record<PatternType, string> = {
  cvc: "CVC",
  cvcc: "CVCC",
  cvvc: "CVVC",
  ccvc: "CCVC",
};

// Vowel ID to display name
const VOWEL_LABELS: Record<VowelId, string> = {
  shortA: "Short A",
  shortE: "Short E",
  shortI: "Short I",
  shortO: "Short O",
  shortU: "Short U",
};

const TrophyRoomScreen: React.FC<TrophyRoomScreenProps> = ({
  vowelId,
  quest,
  onComplete,
  onExit,
  viewOnly = false,
}) => {
  // Initialize cards
  const initialCards = useMemo(() => {
    const words = selectRandomWords(vowelId);
    return createCardPairs(words);
  }, [vowelId]);

  const [cards, setCards] = useState<Card[]>(initialCards);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [trophyFlying, setTrophyFlying] = useState(false);
  const [trophyLanded, setTrophyLanded] = useState(viewOnly); // start landed if view-only
  const [showReturnBtn, setShowReturnBtn] = useState(false);

  // Get mastered words from quest progress
  const masteredWords = useMemo(() => {
    const progress = loadQuestProgress(quest.id);
    const completedCount = progress.currentWordIndex;
    return quest.words.slice(0, completedCount).map(w => w.word);
  }, [quest]);

  const patternLabel = PATTERN_LABELS[quest.patternType] || "CVC";
  const vowelLabel = VOWEL_LABELS[vowelId] || "Short A";
  const questEarned = isQuestFullyComplete(quest.id);

  // Check for win condition
  useEffect(() => {
    if (matchCount === 3 && !showCelebration) {
      // All pairs matched!
      setTimeout(() => {
        setShowCelebration(true);
      }, 400);
    }
  }, [matchCount, showCelebration]);

  // After celebration, start trophy fly animation (not in view-only)
  useEffect(() => {
    if (showCelebration && !viewOnly) {
      // Brief celebration, then fly trophy to case
      const flyTimer = setTimeout(() => {
        setTrophyFlying(true);
      }, 1500);
      // Trophy lands in case after flight animation
      const landTimer = setTimeout(() => {
        setTrophyFlying(false);
        setTrophyLanded(true);
        setShowReturnBtn(true);
        onComplete(); // mark trophy room complete in progression
      }, 3200); // 1.5s celebration + 1.7s flight
      return () => {
        clearTimeout(flyTimer);
        clearTimeout(landTimer);
      };
    }
  }, [showCelebration, viewOnly, onComplete]);

  // Auto-redirect 5 seconds after return button appears
  useEffect(() => {
    if (showReturnBtn) {
      const autoRedirect = setTimeout(() => {
        onExit();
      }, 5000);
      return () => clearTimeout(autoRedirect);
    }
  }, [showReturnBtn, onExit]);

  // Handle card flip
  const handleCardClick = useCallback((cardId: string) => {
    if (isChecking) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    
    // Flip the card
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));
    
    const newFlippedIds = [...flippedIds, cardId];
    setFlippedIds(newFlippedIds);
    
    // Check for match when 2 cards are flipped
    if (newFlippedIds.length === 2) {
      setIsChecking(true);
      
      const [firstId, secondId] = newFlippedIds;
      const firstCard = cards.find(c => c.id === firstId)!;
      const secondCard = cards.find(c => c.id === secondId)!;
      
      if (firstCard.word === secondCard.word) {
        // Match found!
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId
              ? { ...c, isMatched: true }
              : c
          ));
          setMatchCount(prev => prev + 1);
          setFlippedIds([]);
          setIsChecking(false);
        }, 600);
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedIds([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  }, [cards, flippedIds, isChecking]);

  return (
    <div 
      className="trophy-room"
      style={{ backgroundImage: `url(${trophyRoomBg})` }}
    >
      {/* Sparkle particles */}
      <div className="trophy-room__sparkles">
        {[...Array(12)].map((_, i) => (
          <span 
            key={i} 
            className="sparkle" 
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${5 + Math.random() * 40}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Title bar */}
      <div className="trophy-room__title-area">
        <img 
          src={titleBar} 
          alt="Invention Trophy Room" 
          className="trophy-room__title-img"
          draggable={false}
        />
      </div>

      {/* Word Archive Plaque — Left Wall */}
      <button
        className="word-archive-plaque"
        onClick={() => setShowArchive(true)}
        aria-label="Open Word Archive"
      >
        <span className="plaque__bolt plaque__bolt--tl" />
        <span className="plaque__bolt plaque__bolt--tr" />
        <span className="plaque__bolt plaque__bolt--bl" />
        <span className="plaque__bolt plaque__bolt--br" />
        <span className="plaque__title">{patternLabel} Word Archive</span>
        <span className="plaque__subtitle">Tap to View Learned Words</span>
      </button>

      {/* Trophy Showcase Display Case — Right Wall */}
      <div className="trophy-showcase-wall">
        <GlassDisplayCase earned={trophyLanded || questEarned} patternType={quest.patternType} size="medium" />
      </div>

      {/* Stage wrapper — trophy + cards move together */}
      <div className="trophy-room__stage">
        {/* Trophy with floating animation — hidden once landed in case */}
        {!trophyLanded && (
        <div className={`trophy-room__trophy-area ${showCelebration ? 'trophy-room__trophy-area--celebrating' : ''} ${trophyFlying ? 'trophy-room__trophy-area--flying' : ''}`}>
          <img 
            src={trophyImg} 
            alt="Trophy" 
            className="trophy-room__trophy-img"
            draggable={false}
          />
        </div>
        )}

        {/* Card grid (3x2) + WiggleWoo side by side — hidden in view-only */}
        {!viewOnly && (
        <div className="trophy-room__cards-row">
          <div className="trophy-room__card-grid">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`flip-card ${card.isFlipped ? 'flip-card--flipped' : ''} ${card.isMatched ? 'flip-card--matched' : ''}`}
              style={{ transform: `rotate(${card.rotation}deg)` }}
              onClick={() => handleCardClick(card.id)}
            >
              <div className="flip-card__inner">
                <div className="flip-card__front">
                  <span className="flip-card__icon">⚙️</span>
                </div>
                <div className="flip-card__back">
                  <span className="flip-card__word">{card.word.toUpperCase()}</span>
                </div>
              </div>
              {card.isMatched && (
                <div className="flip-card__sparkle-burst">
                  {[...Array(6)].map((_, i) => (
                    <span key={i} className="mini-sparkle" />
                  ))}
                </div>
              )}
            </div>
          ))}
          </div>

          {/* WiggleWoo standing next to cards */}
          <div className="trophy-room__wigglewoo">
            <img 
              src={wigglewooTrophyRoom} 
              alt="WiggleWoo" 
              className="trophy-room__wigglewoo-img"
              draggable={false}
            />
          </div>
        </div>
        )}

      {/* Continue / Return button */}
      <div className="trophy-room__continue-wrap">
        {viewOnly ? (
          <button 
            className="trophy-room__continue-btn"
            onClick={onExit}
            aria-label="Return to Map"
          >
            <img src={continueQuestBtn} alt="Return to Map" draggable={false} />
          </button>
        ) : showReturnBtn ? (
          <button 
            className="trophy-room__continue-btn trophy-room__continue-btn--fade-in"
            onClick={onExit}
            aria-label="Return to Map"
          >
            <img src={continueQuestBtn} alt="Return to Map" draggable={false} />
          </button>
        ) : !showCelebration ? (
          <button 
            className="trophy-room__continue-btn"
            onClick={onExit}
            aria-label="Continue Quest"
          >
            <img src={continueQuestBtn} alt="Continue Quest" draggable={false} />
          </button>
        ) : null}
      </div>
      </div>{/* End stage wrapper */}

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="trophy-room__celebration">
          <div className="trophy-room__celebration-content">
            <div className="trophy-room__starburst" />
            <h2 className="trophy-room__celebration-text">
              🌟 Invention Powered Up! 🌟
            </h2>
          </div>
        </div>
      )}

      {/* Word Archive Modal */}
      {showArchive && (
        <div className="archive-modal-backdrop" onClick={() => setShowArchive(false)}>
          <div className="archive-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="archive-modal__close"
              onClick={() => setShowArchive(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <h2 className="archive-modal__header">
              {vowelLabel} Word Collection
            </h2>
            <div className="archive-modal__count">
              ⭐ {masteredWords.length} Words Mastered
            </div>
            <div className="archive-modal__grid">
              {masteredWords.length > 0 ? (
                masteredWords.map((word) => (
                  <div key={word} className="archive-modal__word">
                    <span className="archive-modal__star">⭐</span>
                    <span className="archive-modal__word-text">{word.toUpperCase()}</span>
                  </div>
                ))
              ) : (
                <div className="archive-modal__empty">
                  Complete word challenges to fill your archive!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrophyRoomScreen;
