#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

run() {
  echo
  echo "\$ $*"
  "$@"
}

if [[ "${CI:-0}" == "1" || "${GG_GATE_RELEASE_LIVE:-0}" == "1" ]]; then
  exec bash tools/gate-release-live.sh
fi

run npm run preflight:ship

if [[ "${GG_LOCAL_LIVE_SMOKE:-0}" == "1" ]]; then
  run env BASE="${BASE:-https://www.pakrpp.com}" SMOKE_ALLOW_OFFLINE_FALLBACK=1 SMOKE_LIVE_HTML=1 bash tools/smoke.sh
fi

echo "PASS: gate:release(local)"
