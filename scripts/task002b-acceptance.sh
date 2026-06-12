#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== TASK-002B ACCEPTANCE ==="

# 1. Zip/macos hygiene
echo "--- Zip/macos hygiene ---"
FAIL=0
if [ -d "$ROOT/__MACOSX" ]; then echo "FAIL: __MACOSX exists"; FAIL=1; fi
if find "$ROOT" -maxdepth 5 -name '.DS_Store' -print -quit | grep -q .; then echo "FAIL: .DS_Store found"; FAIL=1; fi
if find "$ROOT" -maxdepth 5 -name '._*' -print -quit | grep -q .; then echo "FAIL: ._* found"; FAIL=1; fi
if [ "$FAIL" -eq 1 ]; then
  echo "FAIL: Zip/macos hygiene check failed."
  exit 1
fi
echo "OK: No macos junk files."

# 2. npm checks
echo "--- npm run doctor ---"
npm run doctor

echo "--- npm run build ---"
npm run build

echo "--- npm run check ---"
npm run check

echo "--- npm run console:check ---"
npm run console:check

echo "--- npm run studio:check ---"
npm run studio:check

echo "--- npm run deploy:dry ---"
npm run deploy:dry

# 3. Smoke: local-file adapter traversal rejection
echo "--- Smoke: local-file adapter traversal rejection ---"
node --input-type=module -e '
import { readJson, writeJson } from "./apps/console/adapters/local-file.adapter.mjs";

const tests = [
  // Traversal
  { path: "registry/../package.json", expect: "reject" },
  { path: "config/../../package.json", expect: "reject" },
  { path: "public/icons/../../config/blogger.targets.json", expect: "reject" },
  // Empty / absolute
  { path: "", expect: "reject" },
  { path: "/etc/passwd", expect: "reject" },
  // Backslash
  { path: "registry\\..\\package.json", expect: "reject" },
  // Non-.json
  { path: "config/blogger.targets.txt", expect: "reject" },
  // Non-allowed prefix
  { path: "src/modules.json", expect: "reject" },
  // Valid
  { path: "config/softcode.inventory.json", expect: "pass" },
];

let ok = true;
for (const t of tests) {
  let result = "reject";
  try {
    await readJson(t.path);
    result = "pass";
  } catch {}
  if (result !== t.expect) {
    console.error(`FAIL: ${t.path} got=${result} want=${t.expect}`);
    ok = false;
  }
}
if (!ok) process.exit(1);
console.log("OK: Path traversal hardened.");
'

echo "=== TASK-002B ACCEPTANCE: ALL GREEN ==="