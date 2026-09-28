import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import WebSocket from "ws";
import { createRelay } from "../server.mjs";

export async function startRelay(opts = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "wtt-relay-"));
  const stateFile = opts.stateFile ?? path.join(dir, "state.json");
  const relay = await createRelay({ port: 0, host: "127.0.0.1", stateFile, ...opts });
  return { relay, stateFile, url: `ws://127.0.0.1:${relay.port}/ws`, http: `http://127.0.0.1:${relay.port}` };
}

/** Minimal fake tablet / big screen. Keeps every message and the latest state. */
export class Client {
  constructor(url, hello, wsOpts) {
    this.hello = hello;
    this.url = url;
    this.msgs = [];
    this.state = null;
    this.welcome = null;
    this.errors = [];
    this._waiters = [];
    this.ws = new WebSocket(url, wsOpts);
    this.ws.on("message", (raw) => {
      const m = JSON.parse(raw.toString());
      this.msgs.push(m);
      if (m.type === "welcome") { this.welcome = m; this.state = m.state; }
      if (m.type === "state") this.state = m.state;
      if (m.type === "error") this.errors.push(m);
      this._waiters = this._waiters.filter((w) => !w.check());
    });
    this.opened = new Promise((res, rej) => {
      this.ws.once("open", () => { this.send(hello); res(this); });
      this.ws.once("error", rej);
    });
  }
  send(o) { this.ws.send(JSON.stringify(o)); }
  /** Resolve when pred(this) is true (immediately if it already is). */
  waitFor(pred, ms = 3000, label = "condition") {
    return new Promise((resolve, reject) => {
      const check = () => { try { if (pred(this)) { clearTimeout(t); resolve(this); return true; } } catch { /* keep waiting */ } return false; };
      const t = setTimeout(() => {
        this._waiters = this._waiters.filter((w) => w !== waiter);
        reject(new Error(`timed out waiting for ${label}; last state: ${JSON.stringify(this.state)?.slice(0, 300)}`));
      }, ms);
      const waiter = { check };
      if (!check()) this._waiters.push(waiter);
    });
  }
  close() { try { this.ws.terminate(); } catch { /* */ } }
}

export async function connect(url, hello, wsOpts) {
  const c = new Client(url, hello, wsOpts);
  await c.opened;
  await c.waitFor((x) => x.welcome, 3000, "welcome");
  return c;
}

export const letterChallenge = (over = {}) => ({
  type: "missing-letter", word: "cat", blankIndex: 1, letters: ["c", "a", "t"],
  options: ["o", "a", "u"], correctIndex: 1, ...over,
});

/** `client` picks `cell`, answers correctly, and waits for the mark to land. */
export async function play(client, screen, cell) {
  const before = screen.state.board.filter(Boolean).length;
  client.send({ type: "challenge", cell, challenge: letterChallenge() });
  await screen.waitFor((s) => s.state.challenge?.cell === cell, 3000, `challenge on ${cell}`);
  client.send({ type: "answer", index: 1 });
  await screen.waitFor((s) => s.state.board.filter(Boolean).length === before + 1, 3000, `mark on ${cell}`);
}
