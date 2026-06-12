#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

log() { printf '%s\n' "$*"; }
fail() { printf 'FAIL: %s\n' "$*" >&2; exit 1; }

json_ok() {
  node -e '
    let raw="";
    process.stdin.on("data", c => raw += c);
    process.stdin.on("end", () => {
      try {
        const data = JSON.parse(raw);
        if (data && data.ok === true) process.exit(0);
      } catch (e) {}
      process.exit(1);
    });
  '
}

json_has_key() {
  local key="$1"
  node -e '
    const key = process.argv[1];
    let raw="";
    process.stdin.on("data", c => raw += c);
    process.stdin.on("end", () => {
      try {
        const data = JSON.parse(raw);
        const keys = Array.isArray(data.keys) ? data.keys : [];
        const configs = Array.isArray(data.configs) ? data.configs.map(x => x.key || x.id).filter(Boolean) : [];
        if (keys.includes(key) || configs.includes(key)) process.exit(0);
      } catch (e) {}
      process.exit(1);
    });
  ' "$key"
}

assert_file_contains() {
  local file="$1"
  local needle="$2"
  [[ -f "$file" ]] || fail "missing file: $file"
  grep -q "$needle" "$file" || fail "expected '$needle' in $file"
}

log "[1/8] repo hygiene"
if find . \( -path './node_modules' -o -path './.git' -o -path './dist' -o -path './.cloudflare-build' \) -prune -o \( -name '.DS_Store' -o -name '._*' -o -name '__MACOSX' \) -print | grep -q .; then
  find . \( -path './node_modules' -o -path './.git' -o -path './dist' -o -path './.cloudflare-build' \) -prune -o \( -name '.DS_Store' -o -name '._*' -o -name '__MACOSX' \) -print
  fail "macOS junk found"
fi

log "[2/8] npm checks"
npm run doctor
npm run build
npm run check
npm run check:softcode
npm run console:check
npm run studio:check
npm run deploy:dry

log "[3/8] console UI files/content"
if ! grep -R "GG Console Config Editor" apps/console >/dev/null 2>&1; then
  fail "Console UI title not found in apps/console"
fi
if ! grep -R "Secrets are never stored" apps/console >/dev/null 2>&1; then
  fail "Secret safety note not found in apps/console"
fi
if ! grep -R "GOOGLE_BLOGGER_REFRESH_TOKEN" apps/console >/dev/null 2>&1; then
  fail "Shared Blogger refresh token note not found in apps/console"
fi

log "[4/8] start console server"
PORT="${CONSOLE_PORT:-8789}"
TMP_LOG="$(mktemp)"
cleanup() {
  if [[ -n "${SERVER_PID:-}" ]]; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
  rm -f "$TMP_LOG"
}
trap cleanup EXIT

CONSOLE_MODE=local CONSOLE_PORT="$PORT" node apps/console/server.mjs >"$TMP_LOG" 2>&1 &
SERVER_PID=$!

READY=0
for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:$PORT/api/config-list" >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 0.2
done
[[ "$READY" = "1" ]] || { cat "$TMP_LOG" >&2 || true; fail "console server did not start"; }

log "[5/8] GET / renders UI"
HOME_HTML="$(curl -fsS "http://127.0.0.1:$PORT/")"
printf '%s' "$HOME_HTML" | grep -q "GG Console Config Editor" || fail "home page missing title"
printf '%s' "$HOME_HTML" | grep -q "api/config-list" || fail "home page missing config API client wiring"

log "[6/8] config list contains required keys"
LIST_JSON="$(curl -fsS "http://127.0.0.1:$PORT/api/config-list")"
printf '%s' "$LIST_JSON" | json_ok || fail "config-list not ok"
for key in blogger-targets surfaces theme-tokens navigation seo cache-policy softcode-inventory; do
  printf '%s' "$LIST_JSON" | json_has_key "$key" || fail "config-list missing $key"
done

log "[7/8] config read works"
SURFACES_JSON="$(curl -fsS "http://127.0.0.1:$PORT/api/config/surfaces")"
printf '%s' "$SURFACES_JSON" | json_ok || fail "surfaces response not ok"
BLOGGER_JSON="$(curl -fsS "http://127.0.0.1:$PORT/api/config/blogger-targets")"
printf '%s' "$BLOGGER_JSON" | json_ok || fail "blogger-targets response not ok"
printf '%s' "$BLOGGER_JSON" | grep -q "mainBlog" || fail "blogger-targets missing mainBlog"
printf '%s' "$BLOGGER_JSON" | grep -q "storeBlog" || fail "blogger-targets missing storeBlog"

log "[8/8] invalid key rejected"
STATUS="$(curl -sS -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/api/config/../../package")"
[[ "$STATUS" != "200" ]] || fail "traversal config key returned 200"
STATUS="$(curl -sS -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/api/config/not-allowed")"
[[ "$STATUS" != "200" ]] || fail "invalid config key returned 200"

log "TASK-002E acceptance: ALL GREEN"
