#!/usr/bin/env bash
set -euo pipefail

printf '\n=== TASK-002L ACCEPTANCE ===\n'

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

for file in \
  config/public-dom-generation-policy.json \
  docs/public-dom-generation-audit.md \
  checks/public-dom.check.mjs \
  tasks/active/TASK-002L-PUBLIC-DOM-HTML-GENERATION-AUDIT.md; do
  test -f "$file" || { echo "missing required file: $file" >&2; exit 1; }
done

grep -q 'largePublicUiMustLiveInHtmlOrTemplate' config/public-dom-generation-policy.json || {
  echo "policy missing largePublicUiMustLiveInHtmlOrTemplate" >&2
  exit 1
}

for term in innerHTML insertAdjacentHTML outerHTML createElement textContent; do
  grep -q "$term" docs/public-dom-generation-audit.md || {
    echo "audit doc missing term: $term" >&2
    exit 1
  }
done

printf '\n=== TASK-002L ACCEPTANCE PASSED ===\n'
