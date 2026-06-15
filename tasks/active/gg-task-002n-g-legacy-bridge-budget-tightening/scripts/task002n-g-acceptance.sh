#!/usr/bin/env bash
set -euo pipefail

echo "=== TASK-002N-G ACCEPTANCE ==="

required_files=(
  "config/legacy-app-bridge-policy.json"
  "checks/legacy-bridge.check.mjs"
  "docs/legacy-app-bridge-inventory.md"
  "src/modules/legacy-app/README.md"
  "src/modules/legacy-app/bridge-map.json"
  "src/modules/template-hydration/template-hydration.contract.json"
  "src/modules/comments-bridge/comments-bridge.contract.json"
  "src/modules/saved-listing-bridge/saved-listing-bridge.contract.json"
  "src/modules/popular-related-bridge/popular-related-bridge.contract.json"
  "src/modules/offline-fallback-bridge/offline-fallback-bridge.contract.json"
)

for f in "${required_files[@]}"; do
  if [ ! -f "$f" ]; then
    echo "error: missing required file: $f" >&2
    exit 1
  fi
  echo "ok: found $f"
done

node <<'NODE'
const fs = require('fs');
const policy = JSON.parse(fs.readFileSync('config/legacy-app-bridge-policy.json', 'utf8'));
const text = JSON.stringify(policy);
const requiredTerms = [
  'budget',
  'maxBytes',
  'maxLines',
  'template-hydration',
  'comments-bridge',
  'saved-listing-bridge',
  'popular-related-bridge',
  'offline-fallback-bridge',
  'needsTemplate',
  'unclassified'
];
for (const term of requiredTerms) {
  if (!text.includes(term)) {
    console.error(`error: policy missing term ${term}`);
    process.exit(1);
  }
}
console.log('ok: policy contains budget/public-dom/bridge module terms');
NODE

node <<'NODE'
const fs = require('fs');
const registry = JSON.parse(fs.readFileSync('registry/modules.json', 'utf8'));
const serialized = JSON.stringify(registry);
const required = [
  'template-hydration',
  'comments-bridge',
  'saved-listing-bridge',
  'popular-related-bridge',
  'offline-fallback-bridge',
  'legacy-app'
];
for (const name of required) {
  if (!serialized.includes(name)) {
    console.error(`error: registry/modules.json missing ${name}`);
    process.exit(1);
  }
}
console.log('ok: registry includes required bridge modules');
NODE

legacy_output="$(npm run check:legacy-bridge 2>&1)"
echo "$legacy_output"

for expected in "legacy-bridge ok" "needsTemplate=0" "unclassified=0"; do
  if ! printf '%s\n' "$legacy_output" | grep -q "$expected"; then
    echo "error: check:legacy-bridge output missing $expected" >&2
    exit 1
  fi
  echo "ok: check:legacy-bridge output includes $expected"
done

if grep -R "gg-template-generic\|gg-template-element\|gg-template-button\|gg-template-div\|gg-template-link" apps src config docs 2>/dev/null; then
  echo "error: generic/universal template name found" >&2
  exit 1
fi

echo "ok: no generic/universal template names found"

echo "=== TASK-002N-G ACCEPTANCE PASSED ==="
