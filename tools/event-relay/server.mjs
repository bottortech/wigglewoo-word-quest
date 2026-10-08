// =============================================================
// server.mjs — Word-Tac-Toe event relay
// =============================================================
// Runs on the presenter laptop. Two tablets connect as players, the big-
// screen page connects as "screen", everything shares one authoritative
// game (game.mjs). No accounts, no internet, no venue Wi-Fi needed — only a
// private network the laptop and tablets are all on.
//
//   node server.mjs            (or double-click start-relay.bat)
//
// HTTP (same port as the WebSocket):
//   /                 the big-screen page (screen/)
//   /assets /fonts    the app's own files, so the page works offline
//   /img/<file>.png   art from src/assets (whitelisted to *.png)
//   /info             tiny JSON tablets can probe to find the relay
//   /state            current game state (debugging)
//   /ws               WebSocket (protocol documented in game.mjs)
// =============================================================

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { WebSocketServer } from "ws";
import { Game, CORRECT_MS, PROTOCOL_VERSION } from "./game.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO = path.resolve(__dirname, "..", "..");

export const DEFAULT_PORT = 8787;
const HEARTBEAT_MS = 1000;   // app-level hb to every client (their liveness watchdog)
const PING_MS = 3000;        // ws-level ping; two missed => socket is dead (~3-6 s)
const PERSIST_DEBOUNCE_MS = 250;
const STATE_MAX_AGE_MS = 8 * 60 * 60 * 1000;

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".m4a": "audio/mp4", ".mp3": "audio/mpeg", ".wav": "audio/wav",
};

export function lanAddresses() {
  const out = [];
  for (const [name, addrs] of Object.entries(os.networkInterfaces())) {
    for (const a of addrs ?? []) {
      if (a.family === "IPv4" && !a.internal) out.push({ name, address: a.address });
    }
  }
  return out;
}

/** Resolve a URL path to a file under one of a few fixed roots. Returns null
 *  for anything that escapes its root or isn't whitelisted. */
function resolveStatic(urlPath, repoRoot) {
  let p;
  try { p = decodeURIComponent(urlPath.split("?")[0]); } catch { return null; }
  const pick = (prefix, root, filter) => {
    if (!p.startsWith(prefix)) return undefined;
    const rel = p.slice(prefix.length);
    if (filter && !filter(rel)) return null;
    const full = path.resolve(root, rel);
    return full.startsWith(path.resolve(root) + path.sep) ? full : null;
  };
  const hit =
    pick("/assets/", path.join(repoRoot, "public", "assets")) ??
    pick("/fonts/", path.join(repoRoot, "public", "fonts")) ??
    pick("/img/", path.join(repoRoot, "src", "assets"), (r) => /^[\w .-]+\.png$/.test(r));
  if (hit !== undefined) return hit;
  const screenDir = path.join(__dirname, "screen");
  const rel = p === "/" ? "index.html" : p.replace(/^\/+/, "");
  const full = path.resolve(screenDir, rel);
  return full.startsWith(screenDir + path.sep) ? full : null;
}

function serveFile(req, res, file) {
  fs.stat(file, (e, st) => {
    if (e || !st.isFile()) { res.writeHead(404); res.end(); return; }
    const type = MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream";
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? "");
    if (range) {
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Math.min(Number(range[2]), st.size - 1) : st.size - 1;
      if (start > end || start >= st.size) { res.writeHead(416, { "Content-Range": `bytes */${st.size}` }); res.end(); return; }
      res.writeHead(206, {
        "Content-Type": type, "Accept-Ranges": "bytes",
        "Content-Range": `bytes ${start}-${end}/${st.size}`, "Content-Length": end - start + 1,
      });
      fs.createReadStream(file, { start, end }).pipe(res);
      return;
    }
    res.writeHead(200, { "Content-Type": type, "Content-Length": st.size, "Accept-Ranges": "bytes", "Cache-Control": "no-cache" });
    fs.createReadStream(file).pipe(res);
  });
}

export async function createRelay({
  port = DEFAULT_PORT,
  host = "0.0.0.0",
  stateFile = path.join(__dirname, "state.json"),
  repoRoot = DEFAULT_REPO,
  log = () => {},
  rng,
} = {}) {
  // ---- load persisted game (survives a relay crash/restart mid-demo) ----
  let game = new Game({ rng });
  if (stateFile && fs.existsSync(stateFile)) {
    try {
      const age = Date.now() - fs.statSync(stateFile).mtimeMs;
      if (age < STATE_MAX_AGE_MS) {
        game = Game.restore(JSON.parse(fs.readFileSync(stateFile, "utf8")), { rng });
        log("restored", { round: game.state.round, phase: game.state.phase, ageSec: Math.round(age / 1000) });
      }
    } catch (e) { log("restore-failed", { error: String(e) }); }
  }

  const clients = new Set();         // sockets that completed hello
  const playerSockets = new Map();   // player id -> current socket
  const timers = new Set();

  const send = (ws, obj) => { if (ws.readyState === 1) ws.send(JSON.stringify(obj)); };
  const sendError = (ws, code, message = code) => send(ws, { type: "error", code, message });

  let persistTimer = null;
  function schedulePersist() {
    if (!stateFile || persistTimer) return;
    persistTimer = setTimeout(() => { persistTimer = null; writeStateFile(); }, PERSIST_DEBOUNCE_MS);
  }
  // Atomic write (tmp + rename) so a crash mid-save can't leave a torn file.
  // On Windows the rename can fail with EPERM/EBUSY when antivirus or the
  // indexer briefly holds the old file, so retry, then fall back to a plain
  // overwrite — better a non-atomic save than losing the last move.
  function writeStateFile(attempt = 0) {
    const json = JSON.stringify(game.state);
    try {
      fs.writeFileSync(stateFile + ".tmp", json);
      fs.renameSync(stateFile + ".tmp", stateFile);
    } catch (e) {
      if (attempt < 3) {
        const t = setTimeout(() => { timers.delete(t); writeStateFile(attempt + 1); }, 40 * (attempt + 1));
        timers.add(t);
        return;
      }
      try { fs.writeFileSync(stateFile, json); log("persist-fallback", { error: String(e) }); }
      catch (e2) { log("persist-failed", { error: String(e2) }); }
    }
  }
  function broadcastState() {
    const msg = JSON.stringify({ type: "state", state: game.state });
    for (const ws of clients) if (ws.readyState === 1) ws.send(msg);
    schedulePersist();
  }
  function after(ms, fn) {
    const t = setTimeout(() => { timers.delete(t); fn(); }, ms);
    timers.add(t);
  }

  // ---- HTTP ----
  const server = http.createServer((req, res) => {
    const url = req.url ?? "/";
    const pathname = url.split("?")[0];
    if (pathname === "/health" || pathname === "/info" || pathname === "/state") {
      const body = pathname === "/health" ? { ok: true }
        : pathname === "/state" ? game.state
        : {
            app: "wiggle-relay", protocol: PROTOCOL_VERSION, phase: game.state.phase,
            seats: { X: !!game.state.seats.X?.connected, O: !!game.state.seats.O?.connected },
          };
      res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" });
      res.end(JSON.stringify(body));
      return;
    }
    // Admin action a tablet can fire directly (no WS "presenter" role needed
    // — see presenterOps above). Named to match the WS command exactly.
    if (req.method === "POST" && pathname.slice(1) in presenterOps) {
      const r = presenterOps[pathname.slice(1)]();
      if (r.ok) { log("admin-http", { cmd: pathname.slice(1) }); broadcastState(); }
      res.writeHead(r.ok ? 200 : 409, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" });
      res.end(JSON.stringify(r));
      return;
    }
    const file = resolveStatic(url, repoRoot);
    if (!file) { res.writeHead(404); res.end(); return; }
    serveFile(req, res, file);
  });

  // ---- WebSocket ----
  const wss = new WebSocketServer({ server, path: "/ws" });
  // ws re-emits the HTTP server's errors (e.g. port already in use) on itself;
  // without a listener that becomes an unhandled crash instead of the friendly
  // message the caller shows. The real handling is on `server` below.
  wss.on("error", (e) => log("wss-error", { error: String(e) }));

  function onHello(ws, m) {
    const role = ["player", "screen", "presenter", "spectator"].includes(m.role) ? m.role : null;
    const id = typeof m.id === "string" && m.id.length > 0 && m.id.length <= 64 ? m.id : null;
    if (!role || !id) { sendError(ws, "bad-hello"); return; }
    ws.ctx = { role, id, replaced: false };
    let seat = null;
    let takeover = false;
    if (role === "player") {
      const old = playerSockets.get(id);
      if (old && old !== ws) {
        // Same tablet reconnecting: its old socket may be half-open. Replace it.
        old.ctx.replaced = true;
        clients.delete(old);
        try { old.terminate(); } catch { /* already gone */ }
      }
      const r = game.join(id, { seat: m.seat, name: m.name });
      if (r.ok) {
        playerSockets.set(id, ws);
        seat = r.seat;
        takeover = r.takeover;
      } else {
        ws.ctx.role = "spectator";
        sendError(ws, r.error, "Both seats are taken");
      }
    }
    clients.add(ws);
    send(ws, {
      type: "welcome", role: ws.ctx.role, seat, id, takeover,
      protocol: PROTOCOL_VERSION, serverTime: Date.now(), state: game.state,
    });
    log("hello", { role: ws.ctx.role, id, seat, takeover });
    if (role === "player") broadcastState();
  }

  function onPlayerMessage(ws, m) {
    const { id } = ws.ctx;
    if (m.type === "challenge") {
      const r = game.submitChallenge(id, m);
      if (!r.ok) return sendError(ws, r.error);
      broadcastState();
    } else if (m.type === "answer") {
      const r = game.answer(id, m.index);
      if (!r.ok) return sendError(ws, r.error);
      broadcastState();
      if (r.correct) {
        after(CORRECT_MS, () => {
          if (game.resolveCorrect(r.challengeId).ok) broadcastState();
        });
      }
      // A wrong answer needs no follow-up timer — the challenge just stays
      // open on the broadcasted state above, ready for a retry.
    } else if (m.type === "rematch") {
      const r = game.newGame();
      if (!r.ok) return sendError(ws, r.error);
      broadcastState();
    }
  }

  // Shared by the WS presenter path (screen/presenter role) and the HTTP
  // admin route below (tablets — a "player" WS can't send these; see
  // onHello). Both are only reachable via the hidden presenter surfaces
  // (the spectator page's hotkeys, or a tablet's hidden EventMenu), so this
  // stays unauthenticated like the rest of the relay — the private LAN is
  // the trust boundary, same as everything else here.
  const presenterOps = {
    newgame: () => game.newGame({ force: true }),
    resetscores: () => game.resetScores(),
    // Unlike the other ops, a tablet that's still sitting on the versus
    // screen after clearSeats() won't spontaneously re-`hello` on its own —
    // its WebSocket never dropped, so it never has a reason to resend one,
    // and it would otherwise just sit there believing it's still X or O on
    // a game that no longer has anyone seated. Terminating both player
    // sockets forces each RelayClient through its own (already reliable,
    // already-tested) reconnect path, which DOES send a fresh hello — and
    // since seats are null by then, that hello seats it fresh, exactly like
    // a new pair of volunteers picking the tablets up for the first time.
    clearseats: () => {
      const r = game.clearSeats();
      if (r.ok) {
        for (const ws of playerSockets.values()) { try { ws.terminate(); } catch { /* already gone */ } }
        playerSockets.clear();
      }
      return r;
    },
    swap: () => game.swapSeats(),
  };

  function onPresenterMessage(ws, m) {
    const op = presenterOps[m.type];
    if (!op) return false;
    const r = op();
    if (!r.ok) sendError(ws, r.error);
    else { log("presenter", { cmd: m.type }); broadcastState(); }
    return true;
  }

  wss.on("connection", (ws) => {
    ws.isAlive = true;
    ws.on("pong", () => { ws.isAlive = true; });
    ws.on("message", (raw) => {
      let m;
      try { m = JSON.parse(raw.toString()); } catch { return; }
      if (!m || typeof m.type !== "string") return;
      ws.isAlive = true;
      if (!ws.ctx) {
        if (m.type === "hello") onHello(ws, m);
        else sendError(ws, "hello-first");
        return;
      }
      if (m.type === "ping") return send(ws, { type: "pong", t: m.t });
      if (m.type === "hello") return; // ignore duplicate hellos
      const { role } = ws.ctx;
      if (role === "player") onPlayerMessage(ws, m);
      if (role === "screen" || role === "presenter") onPresenterMessage(ws, m);
    });
    ws.on("close", () => {
      clients.delete(ws);
      const ctx = ws.ctx;
      if (ctx && ctx.role === "player" && !ctx.replaced && playerSockets.get(ctx.id) === ws) {
        playerSockets.delete(ctx.id);
        if (game.disconnect(ctx.id)) broadcastState();
        log("player-left", { id: ctx.id });
      }
    });
    ws.on("error", () => { /* surfaces as close */ });
  });

  const hb = setInterval(() => {
    const msg = JSON.stringify({ type: "hb", t: Date.now() });
    for (const ws of clients) if (ws.readyState === 1) ws.send(msg);
  }, HEARTBEAT_MS);
  const pinger = setInterval(() => {
    for (const ws of wss.clients) {
      if (!ws.isAlive) { log("heartbeat-timeout", { id: ws.ctx?.id ?? null }); ws.terminate(); continue; }
      ws.isAlive = false;
      try { ws.ping(); } catch { /* closing */ }
    }
  }, PING_MS);

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, resolve);
  });
  const boundPort = server.address().port;
  log("listening", { port: boundPort });

  return {
    port: boundPort,
    game: () => game,
    clientCount: () => clients.size,
    async close() {
      clearInterval(hb); clearInterval(pinger);
      for (const t of timers) clearTimeout(t);
      if (persistTimer) { clearTimeout(persistTimer); persistTimer = null; }
      for (const ws of wss.clients) ws.terminate();
      await new Promise((r) => wss.close(r));
      // A browser/fetch that hasn't finished reading a file keeps its
      // connection open, and close() would wait on it forever.
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
    },
  };
}

// ---- run directly ----
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || DEFAULT_PORT);
  const logFile = path.join(__dirname, "relay.log");
  const log = (type, detail = {}) => {
    const line = { ts: new Date().toISOString(), type, ...detail };
    try { fs.appendFileSync(logFile, JSON.stringify(line) + "\n"); } catch { /* non-fatal */ }
    const rest = Object.entries(detail).map(([k, v]) => `${k}=${typeof v === "object" ? JSON.stringify(v) : v}`).join(" ");
    console.log(`[${new Date().toLocaleTimeString()}] ${type} ${rest}`);
  };
  try {
    await createRelay({ port, log });
  } catch (e) {
    console.error(e.code === "EADDRINUSE"
      ? `\nPort ${port} is already in use — is another relay already running? Close it and try again.\n`
      : e);
    process.exit(1);
  }
  const ips = lanAddresses();
  console.log("\n  WiggleWoo Word-Tac-Toe relay is running.\n");
  console.log(`  Big screen (open on this laptop):  http://localhost:${port}/`);
  for (const { name, address } of ips) console.log(`  Tablets connect to:                ws://${address}:${port}/ws   (${name})`);
  if (!ips.length) console.log("  ! No network address found — connect the laptop to the event Wi-Fi.");
  console.log("\n  Press Ctrl+C to stop.\n");
}
