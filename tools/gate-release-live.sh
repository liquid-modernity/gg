#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

run() {
  echo
  echo "\$ $*"
  "$@"
}

BASE_URL="${BASE_URL:-https://www.pakrpp.com}"

if ! node tools/verify-release-aligned.mjs >/dev/null 2>&1; then
  run env ALLOW_DIRTY_RELEASE=1 npm run build
fi

run env BASE="${BASE_URL}" SMOKE_ALLOW_OFFLINE_FALLBACK=0 SMOKE_LIVE_HTML=1 bash tools/smoke.sh
run node tools/verify-headers.mjs --mode=live --release-source=live --base="${BASE_URL}"
run node tools/verify-palette-a11y.mjs --mode=live --base="${BASE_URL}"

echo "PASS: gate:release-live"
