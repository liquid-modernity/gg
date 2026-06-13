#!/usr/bin/env bash
set -euo pipefail

printf '\n=== TASK-002L-B ACCEPTANCE ===\n'

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

test -f config/public-dom-generation-policy.json
test -f docs/public-dom-generation-audit.md
test -f checks/public-dom.check.mjs
test -f tasks/active/TASK-002L-B-PUBLIC-DOM-CREATEELEMENT-SRC-AUDIT.md

grep -q "createElementAudit" config/public-dom-generation-policy.json
grep -q "CreateElement SRC Audit" docs/public-dom-generation-audit.md
grep -q "createElement" checks/public-dom.check.mjs

printf '\n=== TASK-002L-B ACCEPTANCE PASSED ===\n'