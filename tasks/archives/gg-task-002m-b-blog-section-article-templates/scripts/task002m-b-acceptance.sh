#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

ok() {
  echo "✓ $*"
}

[[ -f package.json ]] || fail "run from repo root"
[[ -f apps/blog/index.xml ]] || fail "missing apps/blog/index.xml"
[[ -f src/modules/legacy-app/legacy-app.js ]] || fail "missing legacy-app.js"

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

# This task specifically targets section/article structure generation in the active legacy bridge.
if grep -Eq "document\.createElement\([[:space:]]*['\"]section['\"]" src/modules/legacy-app/legacy-app.js; then
  fail "document.createElement('section') still exists in src/modules/legacy-app/legacy-app.js"
fi
ok "no createElement('section') in active legacy bridge"

if grep -Eq "document\.createElement\([[:space:]]*['\"]article['\"]" src/modules/legacy-app/legacy-app.js; then
  fail "document.createElement('article') still exists in src/modules/legacy-app/legacy-app.js"
fi
ok "no createElement('article') in active legacy bridge"

# Require at least one template marker for this migration. Agent may choose exact IDs based on actual structures.
if ! grep -Eq "<template[^>]+id=['\"](gg-template-|gg-empty-state-)" apps/blog/index.xml; then
  fail "no GG template/empty-state template found in apps/blog/index.xml"
fi
ok "Blog XML contains GG template/empty-state template contract"

# Ensure generated deploy output still has public runtime assets.
[[ -f .cloudflare-build/public/runtime/public-config.json ]] || fail "missing .cloudflare-build/public/runtime/public-config.json"
[[ -f .cloudflare-build/public/__gg/assets/js/gg-app.dev.js ]] || fail "missing .cloudflare-build/public/__gg/assets/js/gg-app.dev.js"
[[ -f .cloudflare-build/public/__gg/assets/css/gg-app.min.css ]] || fail "missing .cloudflare-build/public/__gg/assets/css/gg-app.min.css"
ok "runtime delivery assets still present"

echo "=== TASK-002M-B ACCEPTANCE PASSED ==="
