// Dev helper: open the big-screen page in headless Edge, wait, save a PNG.
//   node shot.mjs <url> <out.png> [waitMs=4000] [width=1920] [height=1080]
import { spawn } from "node:child_process";
import fs from "node:fs";

const [url, out, waitMs = "4000", w = "1920", h = "1080"] = process.argv.slice(2);
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const port = 9444 + Math.floor(Math.random() * 300);
const dir = fs.mkdtempSync((process.env.TEMP ?? ".") + "/shot-");
const proc = spawn(EDGE, [`--headless=new`, `--disable-gpu`, `--hide-scrollbars`, `--remote-debugging-port=${port}`,
  `--user-data-dir=${dir}`, `--window-size=${w},${h}`, "about:blank"], { stdio: "ignore" });

async function targets() {
  for (let i = 0; i < 40; i++) {
    try { return await (await fetch(`http://127.0.0.1:${port}/json`)).json(); } catch { await new Promise((r) => setTimeout(r, 250)); }
  }
  throw new Error("browser did not start");
}
try {
  const page = (await targets()).find((t) => t.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r));
  let id = 0;
  const call = (method, params = {}) => new Promise((res) => {
    const my = ++id;
    const on = (e) => { const m = JSON.parse(e.data); if (m.id === my) { ws.removeEventListener("message", on); res(m.result); } };
    ws.addEventListener("message", on);
    ws.send(JSON.stringify({ id: my, method, params }));
  });
  await call("Emulation.setDeviceMetricsOverride", { width: +w, height: +h, deviceScaleFactor: 1, mobile: false });
  await call("Page.navigate", { url });
  await new Promise((r) => setTimeout(r, Number(waitMs)));
  const shot = await call("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(out, Buffer.from(shot.data, "base64"));
  console.log("saved", out);
  ws.close();
} finally {
  proc.kill();
  setTimeout(() => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* */ } process.exit(0); }, 500);
}
