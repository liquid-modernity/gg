#!/usr/bin/env bash
set -euo pipefail

echo "=== TASK-002M-E ACCEPTANCE ==="

npm run doctor
npm run build
npm run check
npm run check:softcode
npm run check:public-softcode
npm run check:public-ui

PUBLIC_DOM_OUTPUT="$(npm run check:public-dom 2>&1)"
echo "$PUBLIC_DOM_OUTPUT"
if ! printf '%s\n' "$PUBLIC_DOM_OUTPUT" | grep -q 'unclassified=0'; then
  echo "ERROR: check:public-dom must report unclassified=0" >&2
  exit 1
fi

npm run console:check
npm run studio:check
npm run deploy:dry

test -f config/public-dom-generation-policy.json
test -f docs/public-dom-generation-audit.md
test -f checks/public-dom.check.mjs

grep -q 'unclassifiedElementAudit' config/public-dom-generation-policy.json
grep -q 'TASK-002M-E' docs/public-dom-generation-audit.md

node <<'NODE'
const fs = require('fs');
const policy = JSON.parse(fs.readFileSync('config/public-dom-generation-policy.json', 'utf8'));
const audit = policy.createElementAudit && policy.createElementAudit.unclassifiedElementAudit;
if (!audit) {
  throw new Error('Missing createElementAudit.unclassifiedElementAudit');
}
if (!Array.isArray(audit.reviewedOccurrences) || audit.reviewedOccurrences.length < 1) {
  throw new Error('reviewedOccurrences must be a non-empty array');
}
const invalid = audit.reviewedOccurrences.filter((item) => {
  return !item || !item.file || !item.tag || !item.classification || !item.reason;
});
if (invalid.length) {
  throw new Error('Each reviewed occurrence must include file, tag, classification, and reason');
}
console.log(`ok: reviewedOccurrences=${audit.reviewedOccurrences.length}`);
NODE

echo "=== TASK-002M-E ACCEPTANCE PASSED ==="
