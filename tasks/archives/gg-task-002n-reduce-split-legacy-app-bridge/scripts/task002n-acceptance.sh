#!/usr/bin/env bash
set -euo pipefail

printf '\n=== TASK-002N ACCEPTANCE ===\n'

npm run doctor
npm run build
npm run check
npm run check:softcode
npm run check:public-softcode
npm run check:public-ui
npm run check:public-dom
npm run check:legacy-bridge
npm run console:check
npm run studio:check
npm run deploy:dry

printf '\n--- Artifact checks ---\n'

test -f config/legacy-app-bridge-policy.json || { echo 'missing config/legacy-app-bridge-policy.json'; exit 1; }
test -f docs/legacy-app-bridge-inventory.md || { echo 'missing docs/legacy-app-bridge-inventory.md'; exit 1; }
test -f checks/legacy-bridge.check.mjs || { echo 'missing checks/legacy-bridge.check.mjs'; exit 1; }
test -f src/modules/legacy-app/legacy-app.js || { echo 'missing src/modules/legacy-app/legacy-app.js'; exit 1; }
test -d legacy-donor || { echo 'missing legacy-donor/; do not delete it yet'; exit 1; }

node -e "const p=require('./package.json'); if(!p.scripts || !p.scripts['check:legacy-bridge']) { throw new Error('missing package script check:legacy-bridge'); }"

node - <<'NODE'
const fs = require('fs');
const doc = fs.readFileSync('docs/legacy-app-bridge-inventory.md', 'utf8');
const required = [
  '# Legacy App Bridge Inventory',
  '## Purpose',
  '## Current Runtime Role',
  '## Domain Buckets',
  '## Extraction Order',
  '## Do Not Delete Yet',
  '## Done Criteria For Removing legacy-app'
];
const missing = required.filter((item) => !doc.includes(item));
if (missing.length) throw new Error('inventory doc missing headings: ' + missing.join(', '));
NODE

if grep -R --include='*.html' --include='*.xml' -E 'id="gg-template-(div|link|button|element|generic)"|id="store-template-(div|link|button|element|generic)"' apps >/tmp/task002n_generic_templates.txt; then
  cat /tmp/task002n_generic_templates.txt
  echo 'generic/universal template found'
  exit 1
fi

printf 'ok: TASK-002N artifacts present and guards pass\n'
printf '=== TASK-002N ACCEPTANCE PASSED ===\n'
