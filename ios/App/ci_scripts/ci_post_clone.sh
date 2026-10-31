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

cd "$CI_WORKSPACE"

echo "=== DEBUG: workspace ==="
echo "CI_WORKSPACE=$CI_WORKSPACE"
pwd
git log -1 --oneline
echo "--- ios/ before build ---"
ls -la ios || echo "ios MISSING before build"
ls -la ios/App || true

npm install
npm run build

echo "=== DEBUG: ios/ after build, before cap sync ==="
ls -la ios || echo "ios MISSING after build"
ls -la ios/App || true

# cap sync also runs pod install — no separate CocoaPods step needed.
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx cap sync ios
