// Build the EVENT app and install it on a connected tablet.
//
//   npm run event:install                     (the only device connected)
//   npm run event:install -- --serial 172.20.10.11:5555
//   npm run event:install -- --launch         (also start it afterwards)
//   npm run event:install -- --skip-build     (reuse the last event bundle — for the 2nd tablet)
//
// The event app has its own id (com.bottortech.wigglewoo.event) and installs
// ALONGSIDE the main and kiosk apps — it does not replace them. The steps
// must run in this order: an event web bundle, a Capacitor sync that opts in
// to mixed content, then the `event` Gradle build type (cleartext allowed).
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const serial = opt("serial");
const launch = args.includes("--launch");
const skipBuild = args.includes("--skip-build");
const isWin = process.platform === "win32";

const env = { ...process.env, WW_EVENT_MODE: "true" };
// This machine's usual locations, used only when the environment doesn't say.
const firstExisting = (...c) => c.find((p) => p && fs.existsSync(p));
env.JAVA_HOME ||= firstExisting("C:\\Program Files\\Android\\Android Studio\\jbr") ?? "";
env.ANDROID_HOME ||= firstExisting(path.join(process.env.LOCALAPPDATA ?? "", "Android", "Sdk")) ?? "";
if (serial) env.ANDROID_SERIAL = serial;

function run(label, cmd, cmdArgs, cwd = root) {
  console.log(`\n=== ${label} ===`);
  const r = spawnSync(cmd, cmdArgs, { cwd, env, stdio: "inherit", shell: true });
  if (r.status !== 0) { console.error(`\nFAILED: ${label}`); process.exit(r.status ?? 1); }
}

if (!skipBuild) {
  run("1/4  Build event web bundle", "npm", ["run", "build:event"]);
  run("2/4  Sync into the Android project (mixed content allowed)", "npx", ["cap", "sync", "android"]);
}

// Safety net: refuse to install if the sync didn't produce the event config.
const cfgPath = path.join(root, "android/app/src/main/assets/capacitor.config.json");
const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
if (cfg.android?.allowMixedContent !== true) {
  console.error("\nThe synced Capacitor config does not allow mixed content — the event app could not reach the relay. Aborting.");
  process.exit(1);
}

const androidDir = path.join(root, "android");
const gradlew = path.join(androidDir, isWin ? "gradlew.bat" : "gradlew");
run("3/4  Install the event app", `"${gradlew}"`, ["installEvent"], androidDir);

if (launch) {
  const adb = path.join(env.ANDROID_HOME || "", "platform-tools", isWin ? "adb.exe" : "adb");
  const target = serial ? ["-s", serial] : [];
  run("4/4  Launch", `"${adb}"`, [...target, "shell", "am", "start", "-n", "com.bottortech.wigglewoo.event/com.bottortech.wigglewoo.MainActivity"]);
}
console.log("\nEvent app installed (com.bottortech.wigglewoo.event) — main and kiosk apps are untouched.");
