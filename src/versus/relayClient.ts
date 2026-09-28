// =============================================
// relayClient.ts — tablet-side connection to the event relay
// =============================================
// A thin, self-healing WebSocket wrapper. It never decides anything about the
// game — it seats this tablet, forwards taps, and hands every state snapshot
// to the UI. Recovery rules (all exercised by tools/event-relay/test against
// the real relay):
//   - drops and failed attempts retry forever, 0.4 s growing to 1 s
//   - an attempt that hasn't completed (connect + hello + welcome) within
//     1.8 s is abandoned and redone: a network that silently drops packets to
//     a closed port would otherwise leave the tablet stuck on TCP retransmits
//     for many seconds after the relay is already back
//   - the relay sends a heartbeat every second; 4 s of silence means the link
//     is half-open (Wi-Fi yanked without a close), so it's torn down and redone
//   - a blocked connection (mixed content / cleartext — i.e. a build that
//     wasn't packaged for events) is reported as such instead of looping
//     silently
//   - on every reconnect the relay replies with a full snapshot, so there is
//     nothing to re-sync by hand

import type { Mark, ServerMessage, VersusState, WelcomeMessage, WireChallenge } from "./protocol.ts";

export type LinkStatus = "connecting" | "open" | "down";

export interface RelayClientOptions {
  url: string;
  /** Stable per-install id — the relay keys the seat on it. */
  id: string;
  name?: string;
  onState: (state: VersusState) => void;
  onWelcome?: (w: WelcomeMessage) => void;
  onStatus?: (status: LinkStatus, detail?: string) => void;
  onError?: (code: string) => void;
  /** Injectable for tests. */
  WebSocketImpl?: typeof WebSocket;
  watchdogMs?: number;
  connectTimeoutMs?: number;
}

const BACKOFF_START_MS = 400;
const BACKOFF_MAX_MS = 1000;
const CONNECT_TIMEOUT_MS = 1800;

export class RelayClient {
  private opts: RelayClientOptions;
  private ws: WebSocket | null = null;
  private stopped = true;
  private backoff = BACKOFF_START_MS;
  private lastMsgAt = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private watchdog: ReturnType<typeof setInterval> | null = null;
  private connectTimer: ReturnType<typeof setTimeout> | null = null;
  private _status: LinkStatus = "connecting";
  private _seat: Mark | null = null;

  constructor(opts: RelayClientOptions) {
    this.opts = opts;
  }

  get status(): LinkStatus { return this._status; }
  get seat(): Mark | null { return this._seat; }

  start(): void {
    if (!this.stopped) return;
    this.stopped = false;
    this.setStatus("connecting");
    this.watchdog = setInterval(() => {
      if (this._status === "open" && Date.now() - this.lastMsgAt > (this.opts.watchdogMs ?? 4000)) {
        this.dropSocket();
        this.setStatus("down", "silent");
        this.scheduleRetry();
      }
    }, 1000);
    this.connect();
  }

  stop(): void {
    this.stopped = true;
    if (this.retryTimer) clearTimeout(this.retryTimer);
    if (this.watchdog) clearInterval(this.watchdog);
    this.retryTimer = this.watchdog = null;
    this.dropSocket();
  }

  sendChallenge(cell: number, challenge: WireChallenge): void { this.send({ type: "challenge", cell, challenge }); }
  sendAnswer(index: number): void { this.send({ type: "answer", index }); }
  sendRematch(): void { this.send({ type: "rematch" }); }

  // ---- internals ----
  private send(obj: unknown): void {
    if (this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(obj));
  }

  private setStatus(status: LinkStatus, detail?: string): void {
    if (status === this._status && detail === undefined) return;
    this._status = status;
    this.opts.onStatus?.(status, detail);
  }

  private dropSocket(): void {
    if (this.connectTimer) { clearTimeout(this.connectTimer); this.connectTimer = null; }
    const ws = this.ws;
    this.ws = null;
    if (!ws) return;
    ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null;
    try { ws.close(); } catch { /* already closed */ }
  }

  private scheduleRetry(): void {
    if (this.stopped || this.retryTimer) return;
    const delay = this.backoff;
    this.backoff = Math.min(this.backoff * 2, BACKOFF_MAX_MS);
    this.retryTimer = setTimeout(() => { this.retryTimer = null; this.connect(); }, delay);
  }

  private connect(): void {
    if (this.stopped) return;
    const Impl = this.opts.WebSocketImpl ?? WebSocket;
    let ws: WebSocket;
    try {
      ws = new Impl(this.opts.url);
    } catch (e) {
      // Chromium throws synchronously for a blocked (mixed-content) socket.
      this.setStatus("down", e instanceof Error && e.name === "SecurityError" ? "blocked" : "failed");
      this.scheduleRetry();
      return;
    }
    this.ws = ws;
    this.connectTimer = setTimeout(() => {
      this.connectTimer = null;
      if (this.ws !== ws) return;
      this.dropSocket();
      this.setStatus("down", "timeout");
      this.scheduleRetry();
    }, this.opts.connectTimeoutMs ?? CONNECT_TIMEOUT_MS);
    ws.onopen = () => {
      this.lastMsgAt = Date.now();
      ws.send(JSON.stringify({ type: "hello", role: "player", id: this.opts.id, name: this.opts.name }));
    };
    ws.onmessage = (e) => {
      this.lastMsgAt = Date.now();
      let m: ServerMessage;
      try { m = JSON.parse(String(e.data)); } catch { return; }
      if (m.type === "welcome") {
        if (this.connectTimer) { clearTimeout(this.connectTimer); this.connectTimer = null; }
        this.backoff = BACKOFF_START_MS;
        this._seat = m.seat;
        this.setStatus("open");
        this.opts.onWelcome?.(m);
        this.opts.onState(m.state);
      } else if (m.type === "state") {
        this.opts.onState(m.state);
      } else if (m.type === "error") {
        this.opts.onError?.(m.code);
      }
    };
    ws.onclose = () => {
      if (this.ws !== ws) return;
      this.ws = null;
      this.setStatus("down", "closed");
      this.scheduleRetry();
    };
    ws.onerror = () => { /* onclose follows */ };
  }
}
