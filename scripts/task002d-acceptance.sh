#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Node JSON-predicate helper (reads a JSON file, checks expr, exits 0 on truthy)
json_ok() {
  node --input-type=module -e "
    import { readFileSync } from 'node:fs';
    const data = JSON.parse(readFileSync(process.argv[1], 'utf8'));
    if (!(${1})) process.exit(1);
  " "$2"
}

json_has_key() {
  node --input-type=module -e "
    import { readFileSync } from 'node:fs';
    const data = JSON.parse(readFileSync(process.argv[1], 'utf8'));
    const keys = data.keys.map(k => k.key);
    if (!keys.includes(process.argv[2])) process.exit(1);
  " "$1" "$2"
}

fail() { echo "FAIL: $1" >&2; kill $PID 2>/dev/null || true; exit 1; }

echo "=== TASK-002D ACCEPTANCE ==="

# Pre-flight checks
echo "--- Pre-flight checks ---"
npm run doctor
npm run build
npm run check
npm run check:softcode
npm run console:check
npm run studio:check
npm run deploy:dry

# Start local Console server
echo "--- Start local Console ---"
nohup node apps/console/server.mjs > /tmp/console-server.log 2>&1 &
PID=$!
sleep 3

BASE="http://127.0.0.1:8789"

# Verify server is up
for i in 1 2 3 4 5; do
  curl -s "$BASE/api/health" > /dev/null 2>&1 && break
  sleep 1
done

echo "--- 1. GET /api/config-list ---"
curl -s "$BASE/api/config-list" > /tmp/accept_config-list.json
json_ok "data.ok === true" /tmp/accept_config-list.json || fail "config-list not ok (ok !== true)"
json_has_key /tmp/accept_config-list.json "blogger-targets" || fail "config-list missing blogger-targets"
json_has_key /tmp/accept_config-list.json "surfaces" || fail "config-list missing surfaces"
json_has_key /tmp/accept_config-list.json "theme-tokens" || fail "config-list missing theme-tokens"
json_has_key /tmp/accept_config-list.json "navigation" || fail "config-list missing navigation"
json_has_key /tmp/accept_config-list.json "seo" || fail "config-list missing seo"
json_has_key /tmp/accept_config-list.json "softcode-inventory" || fail "config-list missing softcode-inventory"
json_has_key /tmp/accept_config-list.json "cache-policy" || fail "config-list missing cache-policy"
echo "   OK"

echo "--- 2. GET /api/config/surfaces ---"
curl -s "$BASE/api/config/surfaces" > /tmp/accept_surfaces.json
json_ok "data.ok === true" /tmp/accept_surfaces.json || fail "surfaces GET not ok (ok !== true)"
json_ok "typeof data.data === 'object'" /tmp/accept_surfaces.json || fail "surfaces missing data object"
echo "   OK"

echo "--- 3. GET /api/config/theme-tokens ---"
curl -s "$BASE/api/config/theme-tokens" > /tmp/accept_themetokens.json
json_ok "data.ok === true" /tmp/accept_themetokens.json || fail "theme-tokens GET not ok (ok !== true)"
json_ok "typeof data.data === 'object'" /tmp/accept_themetokens.json || fail "theme-tokens missing data object"
echo "   OK"

echo "--- 4. GET /api/config/blogger-targets ---"
curl -s "$BASE/api/config/blogger-targets" > /tmp/accept_bt.json
json_ok "data.ok === true" /tmp/accept_bt.json || fail "blogger-targets GET not ok (ok !== true)"
json_ok "typeof data.data === 'object'" /tmp/accept_bt.json || fail "blogger-targets missing data object"
echo "   OK"

echo "--- 5. Invalid key rejection ---"
curl -s "$BASE/api/config/nonexistent-key" > /tmp/accept_invalid.json
json_ok "data.ok === false" /tmp/accept_invalid.json || fail "invalid key not rejected (ok !== false)"
echo "   OK"

echo "--- 6. Path traversal rejection ---"
curl -s "$BASE/api/config/..%2F..%2Fetc%2Fpasswd" > /tmp/accept_traversal.json
json_ok "data.ok === false" /tmp/accept_traversal.json || fail "traversal not rejected (ok !== false)"
echo "   OK"

echo "--- 7. Malformed JSON rejection (PUT) ---"
curl -s -X PUT -H "Content-Type: application/json" -d "not-json" "$BASE/api/config/surfaces" > /tmp/accept_malformed.json
json_ok "data.ok === false" /tmp/accept_malformed.json || fail "malformed JSON not rejected (ok !== false)"
echo "   OK"

# Cleanup
echo "--- Cleanup ---"
kill $PID 2>/dev/null || true

echo "=== TASK-002D ACCEPTANCE: ALL GREEN ==="