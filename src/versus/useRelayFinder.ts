// =============================================
// useRelayFinder.ts — shared "find and remember the relay" flow
// =============================================
// Extracted from EventMenu so the exact same address-entry/probe/save logic
// can be reused by a real player-facing UI (PlayWithFriendScreen, main
// build) without duplicating it. Behavior is unchanged from what EventMenu
// already had.

import { useCallback, useEffect, useState } from "react";
import { findRelay, loadRelayAddress, parseRelayAddress, probeRelay, saveRelayAddress } from "./relayAddress";
import type { RelayInfo } from "./relayAddress";

export type RelayProbe =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "ok"; host: string; info: RelayInfo }
  | { kind: "none" }
  | { kind: "invalid" };

export function useRelayFinder() {
  const [addr, setAddr] = useState(() => loadRelayAddress() ?? "");
  const [probe, setProbe] = useState<RelayProbe>(() => (loadRelayAddress() ? { kind: "checking" } : { kind: "idle" }));

  // Check the saved address as soon as this mounts.
  useEffect(() => {
    const saved = loadRelayAddress();
    if (!saved) return;
    let dead = false;
    probeRelay(saved).then((info) => {
      if (!dead) setProbe(info ? { kind: "ok", host: saved, info } : { kind: "none" });
    });
    return () => { dead = true; };
  }, []);

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

  return { addr, setAddr, probe, findGame };
}
