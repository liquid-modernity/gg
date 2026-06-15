#!/usr/bin/env bash
set -euo pipefail

printf '%s\n' '=== TASK-002N-C ACCEPTANCE ==='

MODULE='src/modules/comments-bridge/comments-bridge.js'
CONTRACT='src/modules/comments-bridge/comments-bridge.contract.json'
LEGACY='src/modules/legacy-app/legacy-app.js'

if [ ! -f "$MODULE" ]; then
  echo "fail: missing $MODULE"
  exit 1
fi
echo 'ok: comments bridge module exists'

if [ ! -f "$CONTRACT" ]; then
  echo "fail: missing $CONTRACT"
  exit 1
fi
echo 'ok: comments bridge contract exists'

if ! grep -Eq 'commentsBridge|GG\.commentsBridge' "$MODULE"; then
  echo "fail: $MODULE must expose or define commentsBridge"
  exit 1
fi
echo 'ok: commentsBridge namespace found'

if ! grep -q 'GG\.commentsBridge\.' "$LEGACY"; then
  echo 'fail: legacy-app.js must use GG.commentsBridge.* helpers'
  exit 1
fi

HELPER_COUNT="$(grep -o 'GG\.commentsBridge\.[A-Za-z0-9_$]*' "$LEGACY" | sort -u | wc -l | tr -d ' ')"
if [ "${HELPER_COUNT:-0}" -lt 2 ]; then
  echo "fail: expected legacy-app.js to call at least two distinct GG.commentsBridge helpers, found ${HELPER_COUNT:-0}"
  exit 1
fi
echo "ok: legacy-app uses ${HELPER_COUNT} distinct comments bridge helper(s)"

if ! grep -R "comments-bridge" registry tools src/modules/legacy-app config docs package.json 2>/dev/null | grep -q .; then
  echo 'fail: comments-bridge is not referenced in build/registry/docs/policy metadata'
  exit 1
fi
echo 'ok: comments-bridge metadata/build reference found'

if grep -Eq 'innerHTML|insertAdjacentHTML|outerHTML' "$MODULE"; then
  echo 'fail: comments bridge module must not use restricted DOM APIs'
  exit 1
fi
echo 'ok: no restricted DOM APIs in comments bridge'

if grep -Eq 'document\.createElement\s*\(' "$MODULE"; then
  echo 'fail: comments bridge module must not create user-visible DOM in this seam task'
  exit 1
fi
echo 'ok: no document.createElement in comments bridge'

if grep -R "gg-template-button\|gg-template-div\|gg-template-link\|gg-template-element\|gg-template-generic" apps src 2>/dev/null; then
  echo 'fail: generic/universal template found'
  exit 1
fi
echo 'ok: no generic/universal templates'

DOM_OUTPUT="$(npm run check:public-dom 2>&1)"
echo "$DOM_OUTPUT"
if ! printf '%s' "$DOM_OUTPUT" | grep -q 'needsTemplate=0'; then
  echo 'fail: check:public-dom must report needsTemplate=0'
  exit 1
fi
if ! printf '%s' "$DOM_OUTPUT" | grep -q 'unclassified=0'; then
  echo 'fail: check:public-dom must report unclassified=0'
  exit 1
fi
echo 'ok: public DOM remains template-clean'

npm run check:legacy-bridge
echo 'ok: legacy bridge check passed'

if git diff --name-only | grep -Eq '^(dist|\.cloudflare-build)/'; then
  echo 'fail: generated output was edited manually'
  exit 1
fi
echo 'ok: no generated output edits detected'

printf '%s\n' '=== TASK-002N-C ACCEPTANCE PASSED ==='
