#!/bin/sh
# Xcode Cloud runs this right after cloning the repo, before the native build.
# This is a Capacitor app: the native Xcode project only has real content once
# the web bundle is built and copied in, so that has to happen here first.
set -e

if ! command -v node >/dev/null 2>&1; then
  brew install node
fi
node --version
npm --version

# $CI_WORKSPACE was observed empty in this environment — `cd "$CI_WORKSPACE"`
# silently no-ops instead of erroring, leaving the shell in this script's own
# directory (ios/App/ci_scripts). npm/npx ascend to find the nearest
# package.json so `npm run build` still worked from there, but Capacitor's
# own CLI resolves its project root from the plain cwd (no ascending search),
# so `cap sync ios` was looking for `ios/` inside ios/App/ci_scripts instead
# of the real one at the repo root. Resolve the repo root from this script's
# own path instead, which can't be wrong regardless of env var quirks.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"
echo "Repo root: $(pwd)"
ls -la ios

npm install
npm run build

# cap sync also runs pod install — no separate CocoaPods step needed.
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx cap sync ios
