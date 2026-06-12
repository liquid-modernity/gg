#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

fail() { echo "FAIL: $1" >&2; exit 1; }
ok()   { echo "   OK"; }

echo "=== TASK-002D-PATCH ACCEPTANCE ==="

# 1. No macOS junk files
echo "--- 1. No .DS_Store / ._* junk ---"
JUNK=$(find . -name ".DS_Store" -not -path "./node_modules/*" 2>/dev/null || true)
test -z "$JUNK" || fail ".DS_Store found: $JUNK"
ok

# 2. No duplicate github/workflows
echo "--- 2. No duplicate workflows folder ---"
test -d github/workflows && fail "github/workflows/ still exists (duplicate of .github/workflows/)" || true
ok

# 3. .gitignore has required entries
echo "--- 3. .gitignore has dist/ and .cloudflare-build/ ---"
grep -qFx "dist/" .gitignore || fail "dist/ missing from .gitignore"
grep -qFx ".cloudflare-build/" .gitignore || fail ".cloudflare-build/ missing from .gitignore"
grep -qFx "tmp/" .gitignore || fail "tmp/ missing from .gitignore"
ok

# 4. Config registry module loads
echo "--- 4. Config registry module functional ---"
node --input-type=module -e "
  import { listConfigKeys, getConfigEntry } from './apps/_shared/config-registry.mjs';
  const keys = listConfigKeys();
  if (!Array.isArray(keys) || keys.length < 5) throw new Error('Too few config keys');
  if (!keys.includes('blogger-targets')) throw new Error('Missing blogger-targets');
  if (!keys.includes('surfaces')) throw new Error('Missing surfaces');
  const entry = getConfigEntry('surfaces');
  if (!entry || !entry.path) throw new Error('Invalid surfaces entry');
  console.log('Config keys:', keys.length);
" || fail "config-registry module broken"
ok

# 5. Task note exists
echo "--- 5. TASK-002D note present ---"
test -f tasks/active/TASK-002D-CONSOLE-CONFIG-API-MVP.md || fail "Task note missing"
ok

# 6. Server --check passes
echo "--- 6. Console server --check ---"
npm run console:check
ok

echo "=== TASK-002D-PATCH ACCEPTANCE: ALL GREEN ==="