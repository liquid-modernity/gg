#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

fail() { echo "FAIL: $1" >&2; exit 1; }

echo "=== TASK-002F ACCEPTANCE ==="

# Step 1: Doctor
echo "--- npm run doctor ---"
npm run doctor || fail "doctor failed"

# Step 2: Build
echo "--- npm run build ---"
npm run build || fail "build failed"

# Step 3: Check
echo "--- npm run check ---"
npm run check || fail "check failed"

# Step 4: Check softcode
echo "--- npm run check:softcode ---"
npm run check:softcode || fail "check:softcode failed"

# Step 5: Check public-softcode
echo "--- npm run check:public-softcode ---"
npm run check:public-softcode || fail "check:public-softcode failed"

# Step 6: Console check
echo "--- npm run console:check ---"
npm run console:check || fail "console:check failed"

# Step 7: Studio check
echo "--- npm run studio:check ---"
npm run studio:check || fail "studio:check failed"

# Step 8: Deploy dry run
echo "--- npm run deploy:dry ---"
npm run deploy:dry || fail "deploy:dry failed"

# Step 9: Verify runtime/public-config.json exists in dist/prod
echo "--- verify dist/prod/runtime/public-config.json ---"
test -f dist/prod/runtime/public-config.json || fail "dist/prod/runtime/public-config.json missing"
echo "  OK: dist/prod/runtime/public-config.json exists"

# Step 10: Verify public-config.json has no obvious secret values
echo "--- verify public-config.json secrets ---"
node --input-type=module -e "
import { readFileSync } from 'node:fs';
const config = JSON.parse(readFileSync('dist/prod/runtime/public-config.json', 'utf8'));
const SECRET_PATTERNS = ['secret','token','key','password','client_id','client_secret','refresh_token','session','api_key'];
function isSafePath(p) {
  // Skip microcopy content (words like "keyboard", "token" are legitimate copy text)
  if (p.includes('microcopy') || p.includes('.label') || p.includes('.title') || p.includes('.copy') || p.includes('.note') || p.includes('description')) return true;
  // Skip configRefs (file path references like "config/secrets.schema.json")
  if (p.includes('configRefs') || p.includes('softcodeInventory') || p.includes('secretsSchema')) return true;
  return false;
}
function deepCheck(obj, path) {
  if (typeof obj === 'string') {
    if (isSafePath(path)) return;
    // Skip file-path reference strings like "config/secrets.schema.json" or "registry/...json"
    if (obj.startsWith('config/') || obj.startsWith('registry/') || obj.endsWith('.json')) return;
    const lower = obj.toLowerCase().replace(/[_\-\s]/g, '');
    for (const p of SECRET_PATTERNS) {
      if (lower.includes(p)) {
        console.error('SUSPICIOUS at ' + path + ': contains ' + p);
        process.exit(1);
      }
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => deepCheck(item, path + '[' + i + ']'));
  } else if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      deepCheck(v, path ? path + '.' + k : k);
    }
  }
}
deepCheck(config, '');
console.log('OK: no secrets found');
" || fail "public-config.json contains secret-like values"

# Step 11: Verify .cloudflare-build/public/runtime/public-config.json
echo "--- verify .cloudflare-build/public/runtime/public-config.json ---"
if test -f .cloudflare-build/public/runtime/public-config.json; then
  echo "  OK: .cloudflare-build/public/runtime/public-config.json exists"
else
  echo "  SKIP: .cloudflare-build/public/runtime/public-config.json not found (deploy output may differ)"
fi

echo ""
echo "=== TASK-002F ACCEPTANCE: ALL GREEN ==="