#!/usr/bin/env bash
set -euo pipefail

printf '\n=== TASK-002M-E ACCEPTANCE ===\n'

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

test -f config/public-dom-generation-policy.json
test -f checks/public-dom.check.mjs
test -f docs/public-dom-generation-audit.md
test -f scripts/task002m-e-acceptance.sh

# Verify unclassifiedElementAudit exists in policy
if ! grep -q '"unclassifiedElementAudit"' config/public-dom-generation-policy.json; then
  echo "FAIL: unclassifiedElementAudit section not found in config/public-dom-generation-policy.json"
  exit 1
fi
echo "ok: unclassifiedElementAudit section present in policy"

# Verify reviewedOccurrences exists and is non-empty
if ! grep -q '"reviewedOccurrences"' config/public-dom-generation-policy.json; then
  echo "FAIL: reviewedOccurrences not found in config/public-dom-generation-policy.json"
  exit 1
fi

# Verify reviewedOccurrences has actual entries (not empty array)
REVIEWED_COUNT=$(node -e "const p=require('./config/public-dom-generation-policy.json'); console.log((p.createElementAudit.unclassifiedElementAudit.reviewedOccurrences||[]).length);")
if [ "$REVIEWED_COUNT" -eq 0 ]; then
  echo "FAIL: reviewedOccurrences is empty — must contain classified occurrence entries"
  exit 1
fi
echo "ok: reviewedOccurrences contains $REVIEWED_COUNT entries"

# Verify check:public-dom reports unclassified=0
CHECKDOM=$(npm run check:public-dom 2>&1) || true
if ! echo "$CHECKDOM" | grep -q 'unclassified=0'; then
  echo "FAIL: check:public-dom does not report unclassified=0"
  echo "$CHECKDOM"
  exit 1
fi
echo "ok: check:public-dom reports unclassified=0"

# Verify docs contain TASK-002M-E section
if ! grep -q 'TASK-002M-E' docs/public-dom-generation-audit.md; then
  echo "FAIL: TASK-002M-E section not found in docs/public-dom-generation-audit.md"
  exit 1
fi
echo "ok: docs contain TASK-002M-E section"

# Verify allowedReviewed counter is present in check output
if ! echo "$CHECKDOM" | grep -q 'allowedReviewed='; then
  echo "FAIL: allowedReviewed counter not found in check:public-dom output"
  exit 1
fi
echo "ok: allowedReviewed counter present in check:public-dom output"

# Verify NO unclassified warnings (just needsTemplate warnings if any)
if echo "$CHECKDOM" | grep -q 'unclassified createElement:'; then
  echo "FAIL: unclassified createElement warnings found in check:public-dom output"
  echo "$CHECKDOM"
  exit 1
fi
echo "ok: no unclassified createElement warnings"

# Verify no createElement usage was actually deleted/modified
# (Occurrences should still exist in source; only classifications changed)
OCC_COUNT=$(grep -rE "document\.createElement\s*\(\s*['\"]" src/modules/legacy-app/legacy-app.js src/modules/store/store-core.js src/modules/store/store.js 2>/dev/null | wc -l | tr -d ' ')
if [ "$OCC_COUNT" -lt 31 ]; then
  echo "FAIL: expected >=31 createElement calls in source, found $OCC_COUNT"
  exit 1
fi
echo "ok: all original createElement calls preserved ($OCC_COUNT occurrences)"

printf '\n=== TASK-002M-E ACCEPTANCE PASSED ===\n'