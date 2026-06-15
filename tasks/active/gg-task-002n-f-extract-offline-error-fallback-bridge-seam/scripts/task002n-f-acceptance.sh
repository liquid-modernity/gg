#!/usr/bin/env bash
set -euo pipefail

echo "=== TASK-002N-F ACCEPTANCE ==="

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

[ -f "src/modules/offline-fallback-bridge/offline-fallback-bridge.js" ] || fail "missing offline-fallback-bridge.js"
[ -f "src/modules/offline-fallback-bridge/offline-fallback-bridge.contract.json" ] || fail "missing offline-fallback-bridge.contract.json"
[ -f "src/modules/legacy-app/legacy-app.js" ] || fail "missing legacy-app.js"
[ -f "src/modules/legacy-app/bridge-map.json" ] || fail "missing bridge-map.json"
[ -f "config/legacy-app-bridge-policy.json" ] || fail "missing legacy-app-bridge-policy.json"
[ -f "config/public-dom-generation-policy.json" ] || fail "missing public-dom-generation-policy.json"
[ -f "docs/legacy-app-bridge-inventory.md" ] || fail "missing legacy-app-bridge-inventory.md"
[ -f "docs/public-dom-generation-audit.md" ] || fail "missing public-dom-generation-audit.md"

grep -q "offlineFallbackBridge" "src/modules/offline-fallback-bridge/offline-fallback-bridge.js" || fail "offline-fallback bridge source does not expose offlineFallbackBridge"
grep -q "GG\.offlineFallbackBridge" "src/modules/legacy-app/legacy-app.js" || fail "legacy-app does not use GG.offlineFallbackBridge"
grep -q "offline-fallback-bridge" "registry/modules.json" || fail "registry/modules.json does not reference offline-fallback-bridge"
grep -q "offline-fallback-bridge" "src/modules/legacy-app/bridge-map.json" || fail "bridge-map does not reference offline-fallback-bridge"
grep -q "offline-fallback" "docs/legacy-app-bridge-inventory.md" || fail "legacy bridge inventory does not document offline fallback seam"

PUBLIC_DOM_OUTPUT="$(npm run -s check:public-dom)"
echo "$PUBLIC_DOM_OUTPUT"
echo "$PUBLIC_DOM_OUTPUT" | grep -q "needsTemplate=0" || fail "public-dom needsTemplate regression"
echo "$PUBLIC_DOM_OUTPUT" | grep -q "unclassified=0" || fail "public-dom unclassified regression"

LEGACY_OUTPUT="$(npm run -s check:legacy-bridge)"
echo "$LEGACY_OUTPUT"
echo "$LEGACY_OUTPUT" | grep -q "needsTemplate=0" || fail "legacy-bridge needsTemplate regression"
echo "$LEGACY_OUTPUT" | grep -q "unclassified=0" || fail "legacy-bridge unclassified regression"

echo "=== TASK-002N-F ACCEPTANCE PASSED ==="
