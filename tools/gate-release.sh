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

echo "INFO: live checks run only in CI or with GG_GATE_RELEASE_LIVE=1"
run npm run gate:prod
run node tools/verify-headers.mjs --mode=config
run node tools/verify-palette-a11y.mjs --mode=repo
echo "PASS: gate:release(local)"
