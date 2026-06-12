#!/usr/bin/env bash
set -euo pipefail

say() { printf '\n[task002f] %s\n' "$*"; }
fail() { printf '\n[task002f:FAIL] %s\n' "$*" >&2; exit 1; }

json_check() {
  local file="$1"
  node -e "JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8'));" "$file" >/dev/null || fail "invalid JSON: $file"
}

contains_no_secret_words() {
  local file="$1"
  node --input-type=module - "$file" <<'NODE'
import fs from 'node:fs';
const file = process.argv[2];
const text = fs.readFileSync(file, 'utf8');
const parsed = JSON.parse(text);
const raw = JSON.stringify(parsed).toLowerCase();
const forbidden = [
  'refresh_token',
  'refreshtoken',
  'client_secret',
  'clientsecret',
  'cloudflare_api_token',
  'github_token',
  'session_secret',
  'password',
  'private_key'
];
const hit = forbidden.find((word) => raw.includes(word));
if (hit) {
  console.error(`public runtime config contains forbidden secret-like word: ${hit}`);
  process.exit(1);
}
NODE
}

say "1/8 Run baseline checks"
npm run doctor >/dev/null
npm run build >/dev/null
npm run check >/dev/null
npm run check:softcode >/dev/null
npm run console:check >/dev/null
npm run studio:check >/dev/null
npm run deploy:dry >/dev/null

say "2/8 Runtime public config exists"
for file in \
  dist/dev/runtime/public-config.json \
  dist/prod/runtime/public-config.json \
  .cloudflare-build/public/runtime/public-config.json; do
  [ -f "$file" ] || fail "missing runtime public config: $file"
  json_check "$file"
  contains_no_secret_words "$file"
done

say "3/8 Runtime public config has required top-level keys"
node --input-type=module - <<'NODE'
import fs from 'node:fs';
const file = 'dist/prod/runtime/public-config.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const required = ['surfaces', 'navigation', 'seo', 'themeTokens', 'microcopy'];
const missing = required.filter((key) => !(key in data));
if (missing.length) {
  console.error(`missing keys in ${file}: ${missing.join(', ')}`);
  process.exit(1);
}
NODE

say "4/8 Public softcode module exists"
[ -f src/modules/public-softcode/public-softcode.js ] || fail "missing src/modules/public-softcode/public-softcode.js"
node --check src/modules/public-softcode/public-softcode.js >/dev/null

say "5/8 Blog/Store/Landing entries reference public-softcode"
for file in src/entries/blog.entry.js src/entries/store.entry.js src/entries/landing.entry.js; do
  [ -f "$file" ] || fail "missing entry: $file"
  grep -q "public-softcode" "$file" || fail "$file does not reference public-softcode"
done

say "6/8 No Console/Studio forced dependency"
if [ -f src/entries/console.entry.js ] && grep -q "public-softcode" src/entries/console.entry.js; then
  fail "console.entry.js should not be forced to use public-softcode in TASK-002F"
fi
if [ -f src/entries/studio.entry.js ] && grep -q "public-softcode" src/entries/studio.entry.js; then
  fail "studio.entry.js should not be forced to use public-softcode in TASK-002F"
fi

say "7/8 Optional public-softcode check script if declared"
if node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts['check:public-softcode'] ? 0 : 1)"; then
  npm run check:public-softcode >/dev/null
else
  echo "check:public-softcode not declared; allowed, script acceptance covers core contract"
fi

say "8/8 Task note exists"
[ -f tasks/active/TASK-002F-PUBLIC-APPS-CONSUME-SOFTCODE-CONFIG.md ] || fail "missing TASK-002F task note"

echo "\nTASK-002F acceptance: ALL GREEN"
