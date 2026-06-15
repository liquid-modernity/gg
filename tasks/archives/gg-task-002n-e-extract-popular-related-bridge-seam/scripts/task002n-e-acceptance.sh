#!/usr/bin/env bash
set -euo pipefail

printf '\n=== TASK-002N-E ACCEPTANCE ===\n'

MODULE="src/modules/popular-related-bridge/popular-related-bridge.js"
CONTRACT="src/modules/popular-related-bridge/popular-related-bridge.contract.json"
LEGACY="src/modules/legacy-app/legacy-app.js"
REGISTRY="registry/modules.json"
BUILD="tools/build.mjs"

if [ ! -f "$MODULE" ]; then
  echo "FAIL: missing $MODULE" >&2
  exit 1
fi

echo "ok: module exists"

if [ ! -f "$CONTRACT" ]; then
  echo "FAIL: missing $CONTRACT" >&2
  exit 1
fi

echo "ok: contract exists"

if ! grep -q "popularRelatedBridge" "$MODULE"; then
  echo "FAIL: module does not expose/mention popularRelatedBridge" >&2
  exit 1
fi

echo "ok: module exposes popularRelatedBridge"

if ! grep -q "GG\.popularRelatedBridge" "$LEGACY"; then
  echo "FAIL: legacy-app.js does not use GG.popularRelatedBridge" >&2
  exit 1
fi

echo "ok: legacy-app uses popular related bridge"

if ! grep -q "popular-related-bridge" "$REGISTRY"; then
  echo "FAIL: registry/modules.json does not mention popular-related-bridge" >&2
  exit 1
fi

echo "ok: registry mentions popular-related-bridge"

if ! grep -q "popular-related-bridge" "$BUILD"; then
  echo "WARN: tools/build.mjs does not mention popular-related-bridge; this is okay only if registry-driven bundling includes it"
else
  echo "ok: build references popular-related-bridge"
fi

printf '\n--- public-dom guard ---\n'
PUBLIC_DOM_OUTPUT="$(npm run check:public-dom 2>&1)"
printf '%s\n' "$PUBLIC_DOM_OUTPUT"
if printf '%s\n' "$PUBLIC_DOM_OUTPUT" | grep -Eq 'needsTemplate=[1-9]|unclassified=[1-9]'; then
  echo "FAIL: public-dom regression detected" >&2
  exit 1
fi

echo "ok: no public-dom needsTemplate/unclassified regression"

printf '\n--- legacy-bridge guard ---\n'
LEGACY_OUTPUT="$(npm run check:legacy-bridge 2>&1)"
printf '%s\n' "$LEGACY_OUTPUT"
if printf '%s\n' "$LEGACY_OUTPUT" | grep -Eiq 'fail|error'; then
  echo "FAIL: legacy-bridge check failed" >&2
  exit 1
fi

echo "ok: legacy-bridge guard passed"

printf '\n=== TASK-002N-E ACCEPTANCE PASSED ===\n'
