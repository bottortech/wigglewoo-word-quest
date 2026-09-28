// =============================================
// eventMode.ts — Event build (two-tablet Word-Tac-Toe demo)
// =============================================
// True only in the build made with `vite --mode event` (npm run build:event /
// event:install). Vite sets MODE to the --mode value, so no .env file is
// needed — and, unlike .env.kiosk, nothing here can go missing when the repo
// moves between machines. Everything event-only (the LAN relay client, the
// versus screen, the presenter menu) is gated on this so the standard and
// kiosk builds contain no network code paths for it.

export const IS_EVENT_BUILD = import.meta.env.MODE === "event";
