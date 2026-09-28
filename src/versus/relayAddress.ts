// =============================================
// relayAddress.ts — where the presenter laptop's relay lives
// =============================================
// The address is typed once per tablet in the presenter menu and remembered.
// If it stops answering (the laptop got a new DHCP address on the same
// network), findRelay() scans that network's /24 for the relay before giving
// up, so a changed address heals itself instead of needing a re-type.
// Nothing here runs unless the event build opens the versus screen.

import { RELAY_PORT } from "./protocol.ts";

const ADDRESS_KEY = "ww_relay_addr";
const DEVICE_ID_KEY = "ww_versus_id";

export interface RelayInfo {
  app: string;
  protocol: number;
  phase: string;
  seats: { X: boolean; O: boolean };
}

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function loadRelayAddress(storage: StorageLike = localStorage): string | null {
  try { return storage.getItem(ADDRESS_KEY); } catch { return null; }
}

export function saveRelayAddress(host: string, storage: StorageLike = localStorage): void {
  try { storage.setItem(ADDRESS_KEY, host); } catch { /* private mode etc. — non-fatal */ }
}

/** Stable per-install id, so a tablet that reconnects gets its seat back. */
export function getDeviceId(storage: StorageLike = localStorage): string {
  try {
    const existing = storage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const fresh = "tab-" + Math.random().toString(36).slice(2, 10);
    storage.setItem(DEVICE_ID_KEY, fresh);
    return fresh;
  } catch {
    return "tab-" + Math.random().toString(36).slice(2, 10);
  }
}

/** Accepts "172.20.10.3" or "172.20.10.3:8787". Returns null for anything else. */
export function parseRelayAddress(input: string): { host: string; port: number } | null {
  const m = /^\s*(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(?::(\d{1,5}))?\s*$/.exec(input);
  if (!m) return null;
  const octets = [m[1], m[2], m[3], m[4]].map(Number);
  if (octets.some((o) => o > 255)) return null;
  const port = m[5] ? Number(m[5]) : RELAY_PORT;
  if (port < 1 || port > 65535) return null;
  return { host: octets.join("."), port };
}

export const relayWsUrl = (host: string, port: number = RELAY_PORT): string => `ws://${host}:${port}/ws`;
const infoUrl = (host: string, port: number): string => `http://${host}:${port}/info`;

/**
 * Fire a presenter admin action (currently just "clearseats" — a fast,
 * low-stakes reset of the shared versus game between pairs of Expo-table
 * volunteers) directly from a tablet. Tablets connect to the relay as
 * "player" over the WebSocket and can't send presenter commands that way
 * (see server.mjs); this plain HTTP route is the tablet-reachable escape
 * hatch for the one or two admin actions a tablet's hidden EventMenu needs,
 * without granting every "player" socket presenter privileges.
 */
export async function callRelayAdmin(
  host: string,
  action: "clearseats",
  port: number = RELAY_PORT,
  timeoutMs = 2500,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(`http://${host}:${port}/${action}`, { method: "POST", signal: ctl.signal });
    if (!res.ok) return false;
    const body = await res.json();
    return body?.ok === true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** Ask one address whether a relay lives there. Null on timeout or anything else. */
export async function probeRelay(
  host: string,
  port: number = RELAY_PORT,
  timeoutMs = 900,
  fetchImpl: typeof fetch = fetch,
): Promise<RelayInfo | null> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(infoUrl(host, port), { signal: ctl.signal, cache: "no-store" });
    if (!res.ok) return null;
    const body = await res.json();
    return body && body.app === "wiggle-relay" ? (body as RelayInfo) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Find the relay: try the saved address first, then scan its /24. Resolves
 * with the host that answered, or null. `onScan` lets the UI say "looking…".
 */
export async function findRelay(
  savedHost: string,
  opts: { port?: number; fetchImpl?: typeof fetch; concurrency?: number; timeoutMs?: number; onScan?: () => void } = {},
): Promise<string | null> {
  const port = opts.port ?? RELAY_PORT;
  const timeoutMs = opts.timeoutMs ?? 900;
  if (await probeRelay(savedHost, port, timeoutMs, opts.fetchImpl)) return savedHost;

  opts.onScan?.();
  const parsed = parseRelayAddress(savedHost);
  if (!parsed) return null;
  const prefix = parsed.host.split(".").slice(0, 3).join(".");
  const candidates: string[] = [];
  for (let i = 1; i <= 254; i++) {
    const h = `${prefix}.${i}`;
    if (h !== parsed.host) candidates.push(h);
  }
  let found: string | null = null;
  let next = 0;
  const worker = async () => {
    while (found === null && next < candidates.length) {
      const host = candidates[next++];
      if (await probeRelay(host, port, timeoutMs, opts.fetchImpl)) { found = host; return; }
    }
  };
  await Promise.all(Array.from({ length: opts.concurrency ?? 32 }, worker));
  return found;
}
