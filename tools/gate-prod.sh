#!/usr/bin/env bash
set -Eeuo pipefail
trap 'echo "FAIL: gate:prod crashed at line $LINENO: $BASH_COMMAND" >&2' ERR

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

run() {
  echo
  echo "\$ $*"
  "$@"
}

run npm run verify:p0
run npm run verify:p1

echo "PASS: gate:prod"
