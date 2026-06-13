#!/usr/bin/env bash
set -euo pipefail

printf '\n=== TASK-002M-D ACCEPTANCE ===\n'

npm run doctor
npm run build
npm run check
npm run check:softcode
npm run check:public-softcode
npm run check:public-ui
npm run check:public-dom
npm run console:check
npm run studio:check
npm run deploy:dry

printf '\n--- Artifact checks ---\n'

test -f apps/store/store.html
test -f src/modules/store/store-discovery.js
test -f checks/public-dom.check.mjs
test -f config/public-dom-generation-policy.json
test -f docs/public-dom-generation-audit.md

# Verify NO createElement('button') in store-discovery.js
if grep -qE "document\.createElement\s*\(\s*['\"]button['\"]\s*\)" src/modules/store/store-discovery.js; then
  echo "FAIL: createElement('button') found in store-discovery.js"
  exit 1
fi

echo "ok: no createElement('button') in store-discovery.js"

# Verify required store button templates exist in Store HTML
for TPL in \
  "store-semantic-category-chip-template" \
  "store-semantic-more-button-template"; do
  if ! grep -q "$TPL" apps/store/store.html; then
    echo "FAIL: template id '$TPL' not found in apps/store/store.html"
    exit 1
  fi
done

echo "ok: all required store button templates present in apps/store/store.html"

# Verify no universal button template was introduced
if grep -qE 'id="store-button-template"' apps/store/store.html; then
  echo "FAIL: universal store-button-template found in apps/store/store.html (forbidden)"
  exit 1
fi

if grep -qE 'id="store-generic-button-template"' apps/store/store.html; then
  echo "FAIL: generic store button template found in apps/store/store.html (forbidden)"
  exit 1
fi

if grep -qE 'id="gg-template-button"' apps/store/store.html; then
  echo "FAIL: universal gg-template-button found in apps/store/store.html (forbidden)"
  exit 1
fi

if grep -qE 'id="gg-template-store-button"' apps/store/store.html; then
  echo "FAIL: universal gg-template-store-button found in apps/store/store.html (forbidden)"
  exit 1
fi

echo "ok: no universal/generic store button template introduced"

printf '\n=== TASK-002M-D ACCEPTANCE PASSED ===\n'