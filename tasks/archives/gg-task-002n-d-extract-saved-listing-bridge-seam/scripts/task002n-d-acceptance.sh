#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "=== TASK-002N-D ACCEPTANCE ==="

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

require_file() {
  [ -f "$1" ] || fail "missing required file: $1"
  echo "ok: $1 exists"
}

require_dir() {
  [ -d "$1" ] || fail "missing required directory: $1"
  echo "ok: $1 exists"
}

require_file "src/modules/saved-listing-bridge/saved-listing-bridge.js"
require_file "src/modules/saved-listing-bridge/saved-listing-bridge.contract.json"
require_file "src/modules/legacy-app/legacy-app.js"
require_file "registry/modules.json"
require_file "tools/build.mjs"
require_file "config/legacy-app-bridge-policy.json"
require_file "config/public-dom-generation-policy.json"
require_file "docs/legacy-app-bridge-inventory.md"
require_file "docs/public-dom-generation-audit.md"
require_dir "legacy-donor"
require_dir "src/modules/legacy-app"

grep -q "saved-listing-bridge" registry/modules.json || fail "registry/modules.json must reference saved-listing-bridge"
grep -q "saved-listing-bridge" tools/build.mjs || fail "tools/build.mjs must reference saved-listing-bridge"
grep -q "GG\.savedListingBridge" src/modules/legacy-app/legacy-app.js || fail "legacy-app.js must use GG.savedListingBridge"

if grep -Eq "import .*saved-listing-bridge|from ['\"].*saved-listing-bridge" src/modules/legacy-app/legacy-app.js; then
  fail "legacy-app.js must not use static ESM import for saved-listing-bridge in classic bundle mode"
fi

echo "ok: no static ESM import in legacy-app.js"

node - <<'NODE'
const fs = require('fs');
const path = 'src/modules/legacy-app/legacy-app.js';
const src = fs.readFileSync(path, 'utf8');
const bytes = Buffer.byteLength(src, 'utf8');
const lines = src.split(/\r?\n/).length;
const maxBytes = 469827;
const maxLines = 11119;
if (bytes > maxBytes) {
  console.error(`ERROR: legacy-app.js grew past TASK-002N-C baseline: ${bytes} > ${maxBytes}`);
  process.exit(1);
}
if (lines > maxLines) {
  console.error(`ERROR: legacy-app.js line count grew past TASK-002N-C baseline: ${lines} > ${maxLines}`);
  process.exit(1);
}
console.log(`ok: legacy-app.js size within baseline bytes=${bytes}/${maxBytes} lines=${lines}/${maxLines}`);
NODE

node - <<'NODE'
const fs = require('fs');
const contractPath = 'src/modules/saved-listing-bridge/saved-listing-bridge.contract.json';
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const text = JSON.stringify(contract).toLowerCase();
if (!text.includes('saved')) {
  console.error('ERROR: saved-listing-bridge contract must describe saved listing responsibilities');
  process.exit(1);
}
console.log('ok: saved-listing-bridge contract parses and references saved responsibilities');
NODE

PUBLIC_DOM_OUTPUT="$(npm run -s check:public-dom)"
echo "$PUBLIC_DOM_OUTPUT"
echo "$PUBLIC_DOM_OUTPUT" | grep -q "needsTemplate=0" || fail "check:public-dom must report needsTemplate=0"
echo "$PUBLIC_DOM_OUTPUT" | grep -q "unclassified=0" || fail "check:public-dom must report unclassified=0"

echo "--- check:legacy-bridge ---"
npm run -s check:legacy-bridge

echo "=== TASK-002N-D ACCEPTANCE PASSED ==="
