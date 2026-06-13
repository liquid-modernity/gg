#!/usr/bin/env bash
set -euo pipefail

printf '\n=== TASK-002M-B ACCEPTANCE ===\n'

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

test -f apps/blog/index.xml
test -f src/modules/legacy-app/legacy-app.js
test -f checks/public-dom.check.mjs
test -f config/public-dom-generation-policy.json
test -f docs/public-dom-generation-audit.md

# Verify NO document.createElement('section') or ('article') in legacy-app.js
if grep -qE "document\.createElement\s*\(\s*['\"]section['\"]\s*\)" src/modules/legacy-app/legacy-app.js; then
  echo "FAIL: createElement('section') found in legacy-app.js"
  exit 1
fi

if grep -qE "document\.createElement\s*\(\s*['\"]article['\"]\s*\)" src/modules/legacy-app/legacy-app.js; then
  echo "FAIL: createElement('article') found in legacy-app.js"
  exit 1
fi

echo "ok: no createElement('section') or ('article') in legacy-app.js"

# Verify required template IDs exist in Blog XML
for TPL in "gg-template-listing-row" "gg-template-popular-range-selector" "gg-empty-state-saved-articles" "gg-empty-state-popular-unavailable"; do
  if ! grep -q "$TPL" apps/blog/index.xml; then
    echo "FAIL: template id '$TPL' not found in apps/blog/index.xml"
    exit 1
  fi
done

echo "ok: all required templates present in apps/blog/index.xml"

printf '\n=== TASK-002M-B ACCEPTANCE PASSED ===\n'