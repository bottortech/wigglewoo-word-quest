// =============================================
// inputModality.ts — Keyboard vs. pointer detection
// WiggleWoo's Word Quest
// =============================================
// Stamps `data-input-modality="keyboard" | "pointer"` on <html> so CSS
// can tell a true keyboard/switch focus apart from a tap/click focus.
// Needed because :focus-visible's own heuristic for "was this focus
// pointer-triggered" is inconsistent on older Android WebViews — some
// versions show the focus ring on a plain tap. This is a small,
// app-wide primitive; it does not itself hide or show any outline —
// individual stylesheets opt in by keying off the attribute.
// =============================================

let initialized = false;

export function initInputModalityTracking(): void {
  if (initialized || typeof document === "undefined") return;
  initialized = true;

  const root = document.documentElement;
  const setKeyboard = () => root.setAttribute("data-input-modality", "keyboard");
  const setPointer = () => root.setAttribute("data-input-modality", "pointer");

  window.addEventListener("keydown", (e) => {
    if (e.key === "Tab") setKeyboard();
  }, { capture: true });

  window.addEventListener("pointerdown", setPointer, { capture: true });
  window.addEventListener("touchstart", setPointer, { capture: true, passive: true });
}
