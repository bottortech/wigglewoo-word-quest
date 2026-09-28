// =============================================
// EventMenu.tsx — presenter menu for the event build
// =============================================
// Opened by a hidden triple-tap in the bottom-left corner (EventMenuZone), so
// the volunteers holding the tablets never see it. Everything the presenter
// needs to launch and recover a live demo lives here: join the versus game,
// start the guided demo, set/test the laptop's address, mute the tablet, and
// reset for the next visitor.

import { useCallback, useEffect, useRef, useState } from "react";
import { callRelayAdmin, findRelay, loadRelayAddress, parseRelayAddress, probeRelay, saveRelayAddress } from "../versus/relayAddress";
import type { RelayInfo } from "../versus/relayAddress";
import "./EventMenu.css";

interface EventMenuProps {
  inVersus: boolean;
  tabletSound: boolean;
  onTabletSoundChange: (on: boolean) => void;
  onPlayVersus: () => void;
  onLeaveVersus: () => void;
  onStartGuidedDemo: () => void;
  /** Short ~1–1.5 min on-stage preset — one word, no scaffolding beyond that. */
  onStartStageDemo: () => void;
  onResetTablet: () => void;
  onClose: () => void;
}

type Probe =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "ok"; host: string; info: RelayInfo }
  | { kind: "none" }
  | { kind: "invalid" };

const seatWord = (ready: boolean) => (ready ? "ready" : "waiting");

export default function EventMenu(props: EventMenuProps) {
  const [addr, setAddr] = useState(() => loadRelayAddress() ?? "");
  const [probe, setProbe] = useState<Probe>(() => (loadRelayAddress() ? { kind: "checking" } : { kind: "idle" }));
  const [confirmReset, setConfirmReset] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [nextPair, setNextPair] = useState<"idle" | "sending" | "done" | "failed">("idle");

  // Check the saved address as soon as the menu opens.
  useEffect(() => {
    const saved = loadRelayAddress();
    if (!saved) return;
    let dead = false;
    probeRelay(saved).then((info) => {
      if (!dead) setProbe(info ? { kind: "ok", host: saved, info } : { kind: "none" });
    });
    return () => { dead = true; };
  }, []);

  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);

  const findGame = useCallback(async () => {
    const parsed = parseRelayAddress(addr);
    if (!parsed) { setProbe({ kind: "invalid" }); return; }
    setProbe({ kind: "checking" });
    const host = await findRelay(parsed.host, { port: parsed.port });
    if (!host) { setProbe({ kind: "none" }); return; }
    saveRelayAddress(host);
    setAddr(host);
    const info = await probeRelay(host, parsed.port);
    setProbe(info ? { kind: "ok", host, info } : { kind: "none" });
  }, [addr]);

  // Low-stakes on purpose: this only zeroes the shared versus game (both
  // tablets return to the lobby, ready for a new pair of volunteers) — it
  // never touches a tablet's own progress, so it doesn't need the same
  // deliberate two-tap-with-a-timeout guard as the destructive full reset
  // below. Single tap, findable from either tablet mid-booth-rush.
  const handleNextPair = useCallback(async () => {
    const host = probe.kind === "ok" ? probe.host : parseRelayAddress(addr)?.host;
    if (!host) return;
    setNextPair("sending");
    const ok = await callRelayAdmin(host, "clearseats");
    setNextPair(ok ? "done" : "failed");
    setTimeout(() => setNextPair("idle"), 2000);
  }, [probe, addr]);

  const handleReset = useCallback(() => {
    if (!confirmReset) {
      setConfirmReset(true);
      resetTimer.current = setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    props.onResetTablet();
  }, [confirmReset, props]);

  let status: React.ReactNode = null;
  if (probe.kind === "checking") status = <span className="evm__status">Looking for the game…</span>;
  else if (probe.kind === "invalid") status = <span className="evm__status evm__status--bad">Type it like 172.20.10.3</span>;
  else if (probe.kind === "none") status = <span className="evm__status evm__status--bad">✗ Can't reach a game there. Is the relay running and this tablet on the same Wi-Fi?</span>;
  else if (probe.kind === "ok") {
    status = (
      <span className="evm__status evm__status--ok">
        ✓ Found the game at {probe.host} — Player X {seatWord(probe.info.seats.X)}, Player O {seatWord(probe.info.seats.O)}
      </span>
    );
  }

  return (
    <div className="evm" role="dialog" aria-modal="true" aria-label="Event menu">
      <div className="evm__card">
        <h2 className="evm__title">Event menu</h2>

        {props.inVersus ? (
          <button className="evm__btn evm__btn--go" onClick={props.onLeaveVersus}>⬅ Leave the game (back to the map)</button>
        ) : (
          <button className="evm__btn evm__btn--go" onClick={props.onPlayVersus}>🎮 Play Word-Tac-Toe (versus)</button>
        )}
        <button className="evm__btn" onClick={props.onStartStageDemo}>⚡ Quick stage demo (1 word)</button>
        <button className="evm__btn" onClick={props.onStartGuidedDemo}>🧭 Start the full guided tour</button>
        {props.inVersus && (
          <button className="evm__btn evm__btn--go" onClick={handleNextPair} disabled={nextPair === "sending"}>
            {nextPair === "done" ? "✓ Cleared — waiting for two tablets"
              : nextPair === "failed" ? "✗ Couldn't reach the game — try again"
                : nextPair === "sending" ? "Clearing…"
                  : "🔁 New pair (reset Word-Tac-Toe)"}
          </button>
        )}

        <div className="evm__section">
          <label className="evm__label" htmlFor="evm-addr">Game address (the laptop)</label>
          <div className="evm__row">
            <input
              id="evm-addr"
              className="evm__input"
              value={addr}
              inputMode="decimal"
              placeholder="172.20.10.3"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              onChange={(e) => setAddr(e.target.value)}
            />
            <button className="evm__btn evm__btn--small" onClick={findGame}>Find the game</button>
          </div>
          <div className="evm__statusline">{status}</div>
        </div>

        <label className="evm__check">
          <input type="checkbox" checked={props.tabletSound} onChange={(e) => props.onTabletSoundChange(e.target.checked)} />
          Play sounds on this tablet (the laptop already plays them for the room)
        </label>

        <button className={`evm__btn evm__btn--reset${confirmReset ? " evm__btn--confirm" : ""}`} onClick={handleReset}>
          {confirmReset ? "Tap again to reset this tablet" : "↺ Reset this tablet for the next visitor"}
        </button>
        <button className="evm__btn evm__btn--close" onClick={props.onClose}>Close</button>
      </div>
    </div>
  );
}
