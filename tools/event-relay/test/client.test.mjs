// Exercises the tablet-side TypeScript (src/versus) — imported directly, Node
// strips the types — against the real relay from server.mjs.
import test from "node:test";
import assert from "node:assert/strict";
import { startRelay, connect } from "./helpers.mjs";
import { RelayClient } from "../../../src/versus/relayClient.ts";
import { parseRelayAddress, probeRelay, findRelay, getDeviceId, loadRelayAddress, saveRelayAddress, relayWsUrl } from "../../../src/versus/relayAddress.ts";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (pred, ms = 4000, label = "condition") => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { if (pred()) return; await sleep(20); }
  throw new Error(`timed out waiting for ${label}`);
};
const challenge = (over = {}) => ({
  type: "missing-letter", word: "cat", letters: ["c", "a", "t"], blankIndex: 1, options: ["o", "a", "u"], correctIndex: 1, ...over,
});

/** A real RelayClient with everything it reports captured. */
function tablet(url, id) {
  const t = { id, states: [], statuses: [], welcomes: [], errors: [], state: null };
  t.client = new RelayClient({
    url, id, name: id,
    onState: (s) => { t.state = s; t.states.push(s); },
    onWelcome: (w) => t.welcomes.push(w),
    onStatus: (s, d) => t.statuses.push([s, d]),
    onError: (c) => t.errors.push(c),
  });
  t.client.start();
  return t;
}

test("client: seats itself, forwards a challenge and answer, receives every snapshot", async (t) => {
  const env = await startRelay();
  const screen = await connect(env.url, { type: "hello", role: "screen", id: "screen" });
  const a = tablet(env.url, "tab-a");
  const b = tablet(env.url, "tab-b");
  t.after(async () => { a.client.stop(); b.client.stop(); screen.close(); await env.relay.close(); });

  await until(() => a.welcomes.length && b.welcomes.length, 3000, "both seated");
  assert.equal(a.client.seat, "X");
  assert.equal(b.client.seat, "O");
  assert.equal(a.client.status, "open");
  await until(() => a.state?.phase === "playing" && b.state?.phase === "playing", 3000, "game started on both");

  a.client.sendChallenge(4, challenge());
  await until(() => b.state.challenge?.cell === 4, 3000, "opponent sees the challenge");
  assert.equal(b.state.challenge.seat, "X");
  a.client.sendAnswer(0);                                       // wrong
  await until(() => a.state.challenge.wrongN === 1, 3000, "wrong registered");
  a.client.sendAnswer(1);                                       // right
  await until(() => a.state.board[4] === "X" && a.state.turn === "O", 3000, "mark placed, turn passed");
});

test("client: a full game between two real clients ends with a winner and Play Again works", async (t) => {
  const env = await startRelay();
  const a = tablet(env.url, "tab-a");
  const b = tablet(env.url, "tab-b");
  t.after(async () => { a.client.stop(); b.client.stop(); await env.relay.close(); });
  await until(() => a.state?.phase === "playing" && b.state?.phase === "playing");
  const move = async (who, cell) => {
    const n = who.state.board.filter(Boolean).length;
    who.client.sendChallenge(cell, challenge());
    await until(() => who.state.challenge?.cell === cell, 3000, `challenge ${cell}`);
    who.client.sendAnswer(1);
    await until(() => who.state.board.filter(Boolean).length === n + 1, 3000, `mark ${cell}`);
  };
  await move(a, 0); await move(b, 3); await move(a, 1); await move(b, 4); await move(a, 2);
  await until(() => a.state.phase === "over" && b.state.phase === "over");
  assert.equal(a.state.result.winner, "X");
  b.client.sendRematch();                                       // the LOSER can tap Play Again
  await until(() => a.state.phase === "playing" && a.state.round === 2);
});

test("client: survives the relay restarting under it and gets its seat and game back", async (t) => {
  const first = await startRelay();
  const a = tablet(first.url, "tab-a");
  const b = tablet(first.url, "tab-b");
  t.after(() => { a.client.stop(); b.client.stop(); });
  await until(() => a.state?.phase === "playing" && b.state?.phase === "playing");
  a.client.sendChallenge(4, challenge());
  await until(() => a.state.challenge?.cell === 4);
  a.client.sendAnswer(1);
  await until(() => a.state.board[4] === "X");
  await sleep(400);                                             // let the debounced save land
  const port = first.relay.port;
  await first.relay.close();
  await until(() => a.client.status === "down" && b.client.status === "down", 3000, "both notice the outage");

  const t0 = Date.now();
  const second = await startRelay({ stateFile: first.stateFile, port });
  t.after(() => second.relay.close());
  await until(() => a.client.status === "open" && b.client.status === "open", 6000, "both reconnected");
  console.log(`      reconnected ${Date.now() - t0}ms after the relay came back`);
  assert.ok(Date.now() - t0 < 3500);
  assert.equal(a.client.seat, "X");
  assert.equal(b.client.seat, "O");
  assert.equal(a.state.board[4], "X");                          // the game came back too
});

test("client: a link that goes silent (half-open) is torn down and redone by the watchdog", async () => {
  const sockets = [];
  class SilentWS {
    constructor(url) {
      this.url = url; this.readyState = 0; sockets.push(this);
      setTimeout(() => {
        this.readyState = 1; this.onopen?.();
        setTimeout(() => this.onmessage?.({ data: JSON.stringify({ type: "welcome", role: "player", seat: "X", id: "t", takeover: false, state: { phase: "lobby", seats: { X: null, O: null } } }) }), 5);
      }, 5);
    }
    send() {}
    close() { this.readyState = 3; }
  }
  const statuses = [];
  const c = new RelayClient({ url: "ws://x", id: "t", onState() {}, onStatus: (s, d) => statuses.push([s, d]), WebSocketImpl: SilentWS, watchdogMs: 1200 });
  c.start();
  await until(() => sockets.length >= 2, 6000, "a second connection attempt after silence");
  c.stop();
  assert.ok(statuses.some(([s, d]) => s === "down" && d === "silent"), JSON.stringify(statuses));
});

test("client: a blocked socket (mixed content) is reported as blocked, not retried silently", async () => {
  class BlockedWS { constructor() { const e = new Error("insecure"); e.name = "SecurityError"; throw e; } }
  const statuses = [];
  const c = new RelayClient({ url: "ws://x", id: "t", onState() {}, onStatus: (s, d) => statuses.push([s, d]), WebSocketImpl: BlockedWS });
  c.start();
  await until(() => statuses.some(([s, d]) => s === "down" && d === "blocked"), 2000, "blocked status");
  c.stop();
});

test("client: stop() really stops — no further connection attempts", async (t) => {
  const env = await startRelay();
  t.after(() => env.relay.close());
  let attempts = 0;
  class CountingWS { constructor() { attempts++; throw new Error("nope"); } }
  const c = new RelayClient({ url: "ws://x", id: "t", onState() {}, WebSocketImpl: CountingWS });
  c.start();
  await sleep(700);
  c.stop();
  const after = attempts;
  await sleep(2600);
  assert.equal(attempts, after);
});

// ---------------- address helpers ----------------
test("address: parsing accepts host or host:port and rejects junk", () => {
  assert.deepEqual(parseRelayAddress("172.20.10.3"), { host: "172.20.10.3", port: 8787 });
  assert.deepEqual(parseRelayAddress("  192.168.8.10:9000 "), { host: "192.168.8.10", port: 9000 });
  for (const bad of ["", "abc", "1.2.3", "1.2.3.4.5", "300.1.1.1", "1.1.1.1:0", "1.1.1.1:99999", "http://1.1.1.1", "1.1.1.1/x"]) {
    assert.equal(parseRelayAddress(bad), null, bad);
  }
  assert.equal(relayWsUrl("1.2.3.4"), "ws://1.2.3.4:8787/ws");
});

test("address: remembered address and device id persist; device id is stable", () => {
  const mem = new Map();
  const storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  assert.equal(loadRelayAddress(storage), null);
  saveRelayAddress("172.20.10.3", storage);
  assert.equal(loadRelayAddress(storage), "172.20.10.3");
  const id = getDeviceId(storage);
  assert.match(id, /^tab-[a-z0-9]+$/);
  assert.equal(getDeviceId(storage), id);
  const broken = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); } };
  assert.equal(loadRelayAddress(broken), null);
  assert.match(getDeviceId(broken), /^tab-/);
});

test("address: probe recognises the real relay and nothing else", async (t) => {
  const env = await startRelay();
  t.after(() => env.relay.close());
  const info = await probeRelay("127.0.0.1", env.relay.port);
  assert.equal(info.app, "wiggle-relay");
  assert.deepEqual(info.seats, { X: false, O: false });
  assert.equal(await probeRelay("127.0.0.1", 1, 300), null);                                   // nothing listening
  const notRelay = async () => ({ ok: true, json: async () => ({ hello: "world" }) });
  assert.equal(await probeRelay("1.2.3.4", 8787, 300, notRelay), null);                        // some other web server
});

test("address: findRelay tries the saved address first, then scans that network when it moved", async () => {
  const asked = [];
  const relayAt = "10.1.2.77";
  const fakeFetch = async (url) => {
    const host = new URL(url).hostname;
    asked.push(host);
    if (host !== relayAt) throw new Error("unreachable");
    return { ok: true, json: async () => ({ app: "wiggle-relay", protocol: 1, phase: "lobby", seats: { X: false, O: false } }) };
  };
  assert.equal(await findRelay(relayAt, { fetchImpl: fakeFetch, timeoutMs: 50 }), relayAt);     // saved address still right
  assert.equal(asked.length, 1);
  asked.length = 0;
  let scanned = false;
  assert.equal(await findRelay("10.1.2.5", { fetchImpl: fakeFetch, timeoutMs: 50, onScan: () => { scanned = true; } }), relayAt);
  assert.ok(scanned);
  assert.ok(asked.every((h) => h.startsWith("10.1.2.")), "never leaves the saved network");
  asked.length = 0;
  assert.equal(await findRelay("10.9.9.9", { fetchImpl: fakeFetch, timeoutMs: 50 }), null);      // different network: give up cleanly
  assert.ok(asked.length <= 254);
});

test("client: an attempt that never completes is abandoned and redone (networks that silently drop packets)", async () => {
  let made = 0;
  class HungWS { constructor() { made++; this.readyState = 0; } send() {} close() { this.readyState = 3; } }
  const statuses = [];
  const c = new RelayClient({ url: "ws://x", id: "t", onState() {}, onStatus: (s, d) => statuses.push([s, d]), WebSocketImpl: HungWS, connectTimeoutMs: 250 });
  c.start();
  await sleep(3000);
  c.stop();
  assert.ok(made >= 3, `only ${made} attempts`);
  assert.ok(statuses.some(([s, d]) => s === "down" && d === "timeout"));
});

test("client: a socket that opens but never gets a welcome is also abandoned and redone", async () => {
  let made = 0;
  class MuteWS {
    constructor() { made++; this.readyState = 0; setTimeout(() => { this.readyState = 1; this.onopen?.(); }, 5); }
    send() {} close() { this.readyState = 3; }
  }
  const c = new RelayClient({ url: "ws://x", id: "t", onState() {}, WebSocketImpl: MuteWS, connectTimeoutMs: 250 });
  c.start();
  await sleep(3000);
  c.stop();
  assert.ok(made >= 3, `only ${made} attempts`);
});
