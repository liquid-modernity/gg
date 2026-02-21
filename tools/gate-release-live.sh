#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

run() {
  echo
  echo "\$ $*"
  "$@"
}

# Keep output clean: realign release artifacts before entering gate:prod.
if ! node tools/verify-release-aligned.mjs >/dev/null 2>&1; then
  run env ALLOW_DIRTY_RELEASE=1 npm run build
fi

# Strict: no offline smoke fallback/skip and no template mismatch allowance.
run env GATE_ALLOW_OFFLINE_SMOKE_SKIP=0 GATE_SMOKE_ALLOW_OFFLINE_FALLBACK=0 SMOKE_ATTEMPTS=1 npm run gate:prod

run node tools/verify-headers.mjs --mode=live --release-source=live --base=https://www.pakrpp.com
run node tools/verify-palette-a11y.mjs --mode=live --base=https://www.pakrpp.com

echo "PASS: gate:release"
