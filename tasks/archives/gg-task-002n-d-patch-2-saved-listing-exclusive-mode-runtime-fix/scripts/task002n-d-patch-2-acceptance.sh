#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== TASK-002N-D-PATCH-2 ACCEPTANCE ==="

npm run doctor
npm run build
npm run check
npm run check:softcode
npm run check:public-softcode
npm run check:public-ui
DOM_OUTPUT="$(npm run check:public-dom 2>&1)"
printf '%s\n' "$DOM_OUTPUT"
printf '%s\n' "$DOM_OUTPUT" | grep -q 'needsTemplate=0'
printf '%s\n' "$DOM_OUTPUT" | grep -q 'unclassified=0'
npm run check:legacy-bridge
npm run console:check
npm run studio:check
npm run deploy:dry

echo "--- Artifact/source contract checks ---"

test -f config/saved-listing-presentation-contract.json

test -f src/modules/legacy-app/legacy-app.js
LEGACY="src/modules/legacy-app/legacy-app.js"

grep -q 'data-gg-listing-mode' "$LEGACY"
echo "ok: listing mode marker present"

grep -q 'data-gg-native-row' "$LEGACY"
echo "ok: native row marker present"

grep -q 'data-gg-saved-row' "$LEGACY"
echo "ok: saved row marker present"

if ! grep -Eq 'markNativeListingRows|ensureNativeListingRowsMarked|data-gg-native-row' "$LEGACY"; then
  echo "missing robust native-row marking helper/path" >&2
  exit 1
fi
echo "ok: native-row marking path present"

if ! grep -Eq 'setNativeListingRowsHidden|hideNativeListingRows|nativeRows.*hidden|hidden = true' "$LEGACY"; then
  echo "missing native-row hide path" >&2
  exit 1
fi
echo "ok: native-row hide path present"

if grep -Eq 'labelKey:[[:space:]]*["'"']details["'"']|textContent[[:space:]]*=[[:space:]]*["'"']Details["'"']' "$LEGACY"; then
  echo "raw visible Details pattern still present in saved/detail action path" >&2
  exit 1
fi
echo "ok: no obvious raw Details regression pattern"

if grep -R "gg-template-\(button\|div\|link\|element\|generic\)" apps src config docs 2>/dev/null; then
  echo "generic/universal template detected" >&2
  exit 1
fi
echo "ok: no generic/universal template names"

echo "=== TASK-002N-D-PATCH-2 ACCEPTANCE PASSED ==="
