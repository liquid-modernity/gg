#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "== TASK-002D-PATCH acceptance =="

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

pass() {
  echo "PASS: $*"
}

# 1. Repo hygiene: no macOS/Windows metadata junk committed.
if find . \
  -path './node_modules' -prune -o \
  -path './.git' -prune -o \
  \( -name '__MACOSX' -o -name '.DS_Store' -o -name '._*' -o -name 'Thumbs.db' \) \
  -print | grep -q .; then
  find . \
    -path './node_modules' -prune -o \
    -path './.git' -prune -o \
    \( -name '__MACOSX' -o -name '.DS_Store' -o -name '._*' -o -name 'Thumbs.db' \) \
    -print
  fail "metadata junk exists"
fi
pass "repo hygiene has no metadata junk"

# 2. .gitignore exists and covers required patterns.
[[ -f .gitignore ]] || fail ".gitignore missing"
for pattern in '.DS_Store' '__MACOSX/' '._*' 'Thumbs.db' 'node_modules/' '.env' '.env.*' '!.env.example' 'dist/' '.cloudflare-build/' 'tmp/'; do
  grep -Fxq "$pattern" .gitignore || fail ".gitignore missing pattern: $pattern"
done
pass ".gitignore required patterns present"

# 3. Workflow hygiene.
if [[ -d github/workflows && -d .github/workflows ]]; then
  fail "duplicate workflow folders exist: keep .github/workflows and remove github/workflows"
fi
pass "workflow folder duplication not present"

# 4. Task note exists.
[[ -f tasks/active/TASK-002D-CONSOLE-CONFIG-API-MVP.md ]] || fail "TASK-002D task note missing"
pass "TASK-002D task note exists"

# 5. Acceptance script exists and should not contain the brittle compact-only ok grep.
[[ -f scripts/task002d-acceptance.sh ]] || fail "scripts/task002d-acceptance.sh missing"
if grep -q "grep -q '\"ok\":true'" scripts/task002d-acceptance.sh; then
  fail "scripts/task002d-acceptance.sh still uses brittle compact JSON grep"
fi
pass "task002d acceptance script does not use brittle compact JSON grep"

# 6. Config API shared registry helper exists.
[[ -f apps/_shared/config-registry.mjs ]] || fail "apps/_shared/config-registry.mjs missing"
for key in blogger-targets cache-policy softcode-inventory surfaces theme-tokens navigation seo; do
  grep -q "$key" apps/_shared/config-registry.mjs || fail "config registry missing key: $key"
done
pass "config registry whitelist contains expected keys"

# 7. Console server includes expected endpoints.
[[ -f apps/console/server.mjs ]] || fail "apps/console/server.mjs missing"
grep -q "/api/config-list" apps/console/server.mjs || fail "console server missing /api/config-list"
grep -q "/api/config/" apps/console/server.mjs || fail "console server missing /api/config/:key handling"
pass "console server exposes config API routes"

# 8. Run canonical npm checks.
npm run doctor
npm run build
npm run check
npm run check:softcode
npm run console:check
npm run studio:check
npm run deploy:dry
pass "canonical npm checks pass"

# 9. Run TASK-002D acceptance script.
bash scripts/task002d-acceptance.sh
pass "task002d acceptance script passes"

pass "TASK-002D-PATCH ALL GREEN"
