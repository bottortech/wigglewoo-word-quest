// =============================================
// kioskMode.ts — Event kiosk mode (Saturday 9/5/26 launch event)
// =============================================
// Gated behind VITE_KIOSK_MODE so the default build (App Store / main)
// is completely unaffected. Only the special build installed on the two
// Galaxy tablets for the event sets this to "true" (via .env.kiosk).
//
// Kiosk flow: 4 potion games -> one (phase 2) trophy room -> a randomly
// picked discovery room -> auto-reset for the next child.

export const IS_KIOSK_BUILD = import.meta.env.VITE_KIOSK_MODE === "true";

// Three approachable early words, then the quest's real final word (index 15)
// as the finish — reusing the existing "quest complete" celebration trigger
// (which fires off the word index actually played) without touching it.
export const KIOSK_WORD_INDICES = [0, 1, 2, 15];
