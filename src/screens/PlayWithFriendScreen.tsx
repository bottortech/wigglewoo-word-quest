// =============================================
// PlayWithFriendScreen.tsx — main-build entry point for Word-Tac-Toe versus
// =============================================
// A real, visible way to reach the two-tablet versus game in the standard
// (App Store) build — unlike the event/kiosk builds, which reuse the hidden
// presenter corner-tap menu (EventMenu) instead. Still needs the exact same
// thing EventMenu needs: a laptop (or another computer) on the same Wi-Fi
// running the relay (tools/event-relay) — this screen doesn't remove that
// requirement, it just gives a real family a real, findable way to enter
// the address and connect, instead of a hidden developer/presenter menu.
//
// Reuses useRelayFinder (the exact same find/probe/save logic EventMenu
// uses) so both stay in sync automatically.

import { useCallback } from "react";
import { useRelayFinder } from "../versus/useRelayFinder";
import "./PlayWithFriendScreen.css";

interface PlayWithFriendScreenProps {
  onBack: () => void;
  onJoin: () => void;
}

const seatWord = (ready: boolean) => (ready ? "ready" : "waiting");

const PlayWithFriendScreen: React.FC<PlayWithFriendScreenProps> = ({ onBack, onJoin }) => {
  const { addr, setAddr, probe, findGame } = useRelayFinder();

  const handleFindKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") findGame();
  }, [findGame]);

  let status: React.ReactNode = null;
  if (probe.kind === "checking") status = <span className="pwf__status">Looking for the game…</span>;
  else if (probe.kind === "invalid") status = <span className="pwf__status pwf__status--bad">Type it like 172.20.10.3</span>;
  else if (probe.kind === "none") {
    status = (
      <span className="pwf__status pwf__status--bad">
        Couldn't find a game there. Make sure the computer's helper program is running and this tablet is on the same Wi-Fi.
      </span>
    );
  } else if (probe.kind === "ok") {
    status = (
      <span className="pwf__status pwf__status--ok">
        ✓ Found it! Player X {seatWord(probe.info.seats.X)}, Player O {seatWord(probe.info.seats.O)}
      </span>
    );
  }

  return (
    <div className="pwf">
      <button className="pwf__back-btn" onClick={onBack} aria-label="Back to map">✕</button>
      <div className="pwf__card">
        <h1 className="pwf__title">Play with a Friend!</h1>
        <p className="pwf__intro">
          Play Word-Tac-Toe together on two tablets. Ask a grown-up to start
          the WiggleWoo Connect helper on a nearby computer, then type its
          address below.
        </p>

        <label className="pwf__label" htmlFor="pwf-addr">Computer's address</label>
        <div className="pwf__row">
          <input
            id="pwf-addr"
            className="pwf__input"
            value={addr}
            inputMode="decimal"
            placeholder="172.20.10.3"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            onChange={(e) => setAddr(e.target.value)}
            onKeyDown={handleFindKeyDown}
          />
          <button className="pwf__btn pwf__btn--small" onClick={findGame}>Find</button>
        </div>
        <div className="pwf__statusline">{status}</div>

        <button
          className="pwf__btn pwf__btn--go"
          onClick={onJoin}
          disabled={probe.kind !== "ok"}
        >
          🎮 Join the Game!
        </button>
      </div>
    </div>
  );
};

export default PlayWithFriendScreen;
