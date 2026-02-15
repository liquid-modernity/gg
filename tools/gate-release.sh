#!/usr/bin/env bash
set -Eeuo pipefail
trap 'echo "FAIL: gate:release crashed at line $LINENO: $BASH_COMMAND" >&2' ERR

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

run() {
  echo
  echo "\$ $*"
  "$@"
}

# Strict: no offline smoke fallback or skip
run env GATE_ALLOW_OFFLINE_SMOKE_SKIP=0 GATE_SMOKE_ALLOW_OFFLINE_FALLBACK=0 npm run gate:prod

run node tools/verify-headers.mjs --mode=live --release-source=live --base=https://www.pakrpp.com
run node tools/verify-palette-a11y.mjs --mode=live --base=https://www.pakrpp.com

echo "PASS: gate:release"
