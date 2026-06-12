#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PORT="${CONSOLE_PORT:-8789}"
BASE_URL="http://127.0.0.1:${PORT}"
LOG_FILE="${TMPDIR:-/tmp}/gg-task002d-console-${PORT}.log"
PID=""

cleanup() {
  if [ -n "${PID}" ] && kill -0 "${PID}" 2>/dev/null; then
    kill "${PID}" >/dev/null 2>&1 || true
    wait "${PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT

fail() {
  echo "❌ $*" >&2
  if [ -f "$LOG_FILE" ]; then
    echo "--- console log ---" >&2
    tail -80 "$LOG_FILE" >&2 || true
  fi
  exit 1
}

need_file() {
  [ -f "$1" ] || fail "missing file: $1"
}

need_file apps/console/server.mjs
need_file config/blogger.targets.json
need_file config/cache-policy.json
need_file config/softcode.inventory.json
need_file registry/surfaces.json
need_file registry/theme-tokens.json
need_file registry/navigation.json
need_file registry/seo.json

# Static source checks: require no arbitrary raw path API as the new primary config route.
grep -R "config-list" apps/console >/dev/null || fail "missing config-list implementation"
grep -R "blogger-targets" apps/console apps/_shared >/dev/null || fail "missing blogger-targets wiring"

npm run doctor
npm run build
npm run check
npm run check:softcode
npm run console:check
npm run studio:check
npm run deploy:dry

# Start local Console. Prefer CONSOLE_PORT, but also pass PORT for compatibility.
CONSOLE_MODE=local CONSOLE_PORT="$PORT" PORT="$PORT" node apps/console/server.mjs >"$LOG_FILE" 2>&1 &
PID="$!"

# Wait until server responds.
for _ in $(seq 1 40); do
  if curl -fsS "${BASE_URL}/api/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done
curl -fsS "${BASE_URL}/api/health" >/dev/null 2>&1 || fail "console server did not start on ${BASE_URL}"

node <<'NODE' "$BASE_URL"
const base = process.argv[1];
async function req(path, options = {}) {
  const res = await fetch(base + path, options);
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch {}
  return { status: res.status, text, body };
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
const configKeys = [
  'blogger-targets',
  'cache-policy',
  'softcode-inventory',
  'surfaces',
  'theme-tokens',
  'navigation',
  'seo'
];

const list = await req('/api/config-list');
assert(list.status === 200, `config-list status ${list.status}`);
assert(list.body, 'config-list returned no JSON');
const keys = Array.isArray(list.body.keys)
  ? list.body.keys
  : Array.isArray(list.body.configs)
    ? list.body.configs.map((item) => typeof item === 'string' ? item : item.key)
    : [];
for (const key of configKeys) {
  assert(keys.includes(key), `config-list missing ${key}`);
}

for (const key of ['surfaces', 'theme-tokens', 'blogger-targets', 'navigation', 'seo']) {
  const get = await req(`/api/config/${encodeURIComponent(key)}`);
  assert(get.status === 200, `GET ${key} status ${get.status}`);
  assert(get.body && typeof get.body === 'object', `GET ${key} non-json`);
}

for (const bad of ['package', '../package.json', '..%2Fpackage.json', 'registry/../package', 'surfaces/../../package']) {
  const get = await req(`/api/config/${encodeURIComponent(bad)}`);
  assert([400, 403, 404].includes(get.status), `bad key ${bad} unexpectedly status ${get.status}`);
}

const malformed = await fetch(base + '/api/config/surfaces', {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: '{bad json'
});
assert([400, 422].includes(malformed.status), `malformed JSON status ${malformed.status}`);

const currentSurfaces = await req('/api/config/surfaces');
const putSame = await req('/api/config/surfaces', {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(currentSurfaces.body)
});
assert([200, 204].includes(putSame.status), `PUT same surfaces status ${putSame.status}`);

console.log('local config API smoke ok');
NODE

cleanup
PID=""

# Production-mode write should be refused. Start production console on another port to avoid race.
PROD_PORT=$((PORT + 1))
PROD_BASE="http://127.0.0.1:${PROD_PORT}"
PROD_LOG="${TMPDIR:-/tmp}/gg-task002d-console-prod-${PROD_PORT}.log"
CONSOLE_MODE=production CONSOLE_PORT="$PROD_PORT" PORT="$PROD_PORT" node apps/console/server.mjs >"$PROD_LOG" 2>&1 &
PID="$!"
for _ in $(seq 1 40); do
  if curl -fsS "${PROD_BASE}/api/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done
curl -fsS "${PROD_BASE}/api/health" >/dev/null 2>&1 || fail "production console server did not start on ${PROD_BASE}"

node <<'NODE' "$PROD_BASE"
const base = process.argv[1];
const get = await fetch(base + '/api/config/surfaces');
if (get.status !== 200) throw new Error(`production GET surfaces status ${get.status}`);
const json = await get.json();
const put = await fetch(base + '/api/config/surfaces', {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(json)
});
if (![403, 405, 501].includes(put.status)) {
  throw new Error(`production PUT should be refused, got ${put.status}`);
}
console.log('production write refusal ok');
NODE

cleanup
PID=""

echo "✅ TASK-002D acceptance ALL GREEN"
