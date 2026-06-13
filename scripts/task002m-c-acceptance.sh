#!/usr/bin/env bash
set -euo pipefail

printf '\n=== TASK-002M-C ACCEPTANCE ===\n'

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

# Verify NO createElement('button') in legacy-app.js
if grep -qE "document\.createElement\s*\(\s*['\"]button['\"]\s*\)" src/modules/legacy-app/legacy-app.js; then
  echo "FAIL: createElement('button') found in legacy-app.js"
  exit 1
fi

echo "ok: no createElement('button') in legacy-app.js"

# Verify required blog button templates exist in Blog XML
for TPL in \
  "gg-template-comments-sheet-handle" \
  "gg-template-comment-replies-toggle" \
  "gg-template-comment-reply-clear" \
  "gg-template-comment-copy-link-button" \
  "gg-template-comment-delete-button" \
  "gg-template-comment-more-button" \
  "gg-template-comment-reply-button" \
  "gg-template-comment-add-reply-button"; do
  if ! grep -q "$TPL" apps/blog/index.xml; then
    echo "FAIL: template id '$TPL' not found in apps/blog/index.xml"
    exit 1
  fi
done

echo "ok: all required button templates present in apps/blog/index.xml"

# Verify no universal button template was introduced
if grep -qE 'id="gg-template-button"' apps/blog/index.xml; then
  echo "FAIL: universal gg-template-button found in apps/blog/index.xml (forbidden)"
  exit 1
fi

if grep -qE 'id="gg-template-generic-button"' apps/blog/index.xml; then
  echo "FAIL: generic button template found in apps/blog/index.xml (forbidden)"
  exit 1
fi

echo "ok: no universal/generic button template introduced"

printf '\n=== TASK-002M-C ACCEPTANCE PASSED ===\n'