// =============================================
// celebrationVariants.ts — data for MilestoneCelebration
// WiggleWoo's Word Quest
// =============================================
// Each tier has a pool of visual variants (mascot pose + headline text) so
// the same milestone never looks identical twice in a row. MilestoneCelebration
// picks one at random per mount (see pickVariantIndex there), avoiding an
// immediate repeat of the previous pick for that tier.
// =============================================

import wigglewooCelebration from "../assets/wigglewoo_celebration_transparent.png";
import wigglewooJumping from "../assets/jumping pose.png";
import wigglewooHero from "../assets/wiggle_woo_hero_stance.png";

export type CelebrationTier = "activity" | "room" | "unlock" | "trophy";

export interface CelebrationVariant {
  mascot: string;
  headline: string;
  subtext?: string;
}

export interface CelebrationTierConfig {
  /** How long the overlay stays up before auto-dismissing (tap always skips sooner). */
  durationMs: number;
  confettiCount: number;
  variants: CelebrationVariant[];
}

// Duration/intensity scale with how big the moment is:
//   activity (per-game win)      — quick, light touch, never blocks the pace of play
//   room (Discovery Room done)   — bigger beat, the room is genuinely finished
//   unlock (new Discovery Room)  — a major event, biggest non-trophy moment
//   trophy (trophy earned)       — the single biggest celebration in the game
export const CELEBRATION_TIERS: Record<CelebrationTier, CelebrationTierConfig> = {
  activity: {
    durationMs: 1500,
    confettiCount: 16,
    variants: [
      { mascot: wigglewooCelebration, headline: "Nice Job!" },
      { mascot: wigglewooJumping, headline: "Awesome!" },
      { mascot: wigglewooCelebration, headline: "Way to Go!" },
    ],
  },
  room: {
    durationMs: 3500,
    confettiCount: 40,
    variants: [
      { mascot: wigglewooJumping, headline: "Amazing Job!", subtext: "You explored the whole room!" },
      { mascot: wigglewooCelebration, headline: "You Did It!", subtext: "Room complete!" },
      { mascot: wigglewooHero, headline: "Great Work!", subtext: "Every fact discovered!" },
    ],
  },
  unlock: {
    durationMs: 4000,
    confettiCount: 60,
    variants: [
      { mascot: wigglewooHero, headline: "New Discovery Room!", subtext: "Get ready to explore!" },
      { mascot: wigglewooCelebration, headline: "Something New Awaits!", subtext: "A whole room to discover!" },
      { mascot: wigglewooJumping, headline: "Unlocked!", subtext: "A brand new room is ready for you!" },
    ],
  },
  trophy: {
    durationMs: 4000,
    confettiCount: 70,
    variants: [
      { mascot: wigglewooHero, headline: "Trophy Earned!", subtext: "You're a Word Quest champion!" },
      { mascot: wigglewooCelebration, headline: "You Earned It!", subtext: "A shiny new trophy!" },
      { mascot: wigglewooJumping, headline: "Incredible Work!", subtext: "Trophy unlocked!" },
    ],
  },
};
