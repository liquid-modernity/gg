#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

json_ok() {
  node --input-type=module -e "
    import { readFileSync } from 'node:fs';
    const data = JSON.parse(readFileSync(process.argv[1], 'utf8'));
    if (!(${1})) process.exit(1);
  " "$2"
}

fail() { echo "FAIL: $1" >&2; kill $PID 2>/dev/null || true; exit 1; }

echo "=== TASK-002E ACCEPTANCE ==="

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

echo "--- 1. Console HTML page loads ---"
HTTP_CODE=$(curl -s -o /tmp/accept_console.html -w "%{http_code}" "$BASE/")
test "$HTTP_CODE" = "200" || fail "Console page not 200 (got $HTTP_CODE)"
grep -q "GG Console Config Editor" /tmp/accept_console.html || fail "Console HTML missing title"
echo "   OK"

echo "--- 2. Static assets served ---"
HTTP_CSS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/styles.css")
test "$HTTP_CSS" = "200" || fail "styles.css not 200 (got $HTTP_CSS)"
HTTP_JS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/app.js")
test "$HTTP_JS" = "200" || fail "app.js not 200 (got $HTTP_JS)"
echo "   OK"

echo "--- 3. Config API /api/config-list still works ---"
curl -s "$BASE/api/config-list" > /tmp/accept_002e_list.json
json_ok "data.ok === true" /tmp/accept_002e_list.json || fail "config-list not ok"
json_ok "data.keys.length >= 7" /tmp/accept_002e_list.json || fail "config-list missing keys"
echo "   OK"

echo "--- 4. Config API /api/config/surfaces (GET) still works ---"
curl -s "$BASE/api/config/surfaces" > /tmp/accept_002e_surfaces.json
json_ok "data.ok === true" /tmp/accept_002e_surfaces.json || fail "surfaces GET not ok"
json_ok "typeof data.data === 'object'" /tmp/accept_002e_surfaces.json || fail "surfaces missing data"
echo "   OK"

echo "--- 5. Config API /api/config/blogger-targets (GET) still works ---"
curl -s "$BASE/api/config/blogger-targets" > /tmp/accept_002e_bt.json
json_ok "data.ok === true" /tmp/accept_002e_bt.json || fail "blogger-targets GET not ok"
echo "   OK"

echo "--- 6. Config API PUT still works (local mode) ---"
curl -s "$BASE/api/config/cache-policy" > /tmp/accept_002e_cp_get.json
ORIGINAL=$(node --input-type=module -e "
  import { readFileSync } from 'node:fs';
  const data = JSON.parse(readFileSync('/tmp/accept_002e_cp_get.json', 'utf8'));
  console.log(JSON.stringify(data.data));
")
curl -s -X PUT -H "Content-Type: application/json" -d "$ORIGINAL" "$BASE/api/config/cache-policy" > /tmp/accept_002e_put.json
json_ok "data.ok === true" /tmp/accept_002e_put.json || fail "PUT cache-policy not ok"
echo "   OK"

echo "--- 7. Blogger targets note visible in HTML ---"
grep -q "pakrpp.blogspot.com" /tmp/accept_console.html || fail "HTML missing mainBlog domain note"
grep -q "GOOGLE_BLOGGER_REFRESH_TOKEN" /tmp/accept_console.html || fail "HTML missing OAuth note"
echo "   OK"

echo "--- 8. Invalid key still rejected ---"
curl -s "$BASE/api/config/nonexistent-key" > /tmp/accept_002e_invalid.json
json_ok "data.ok === false" /tmp/accept_002e_invalid.json || fail "invalid key not rejected"
echo "   OK"

# Cleanup
echo "--- Cleanup ---"
kill $PID 2>/dev/null || true

echo "=== TASK-002E ACCEPTANCE: ALL GREEN ==="