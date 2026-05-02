#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FEED_URL="https://www.pakrpp.com/feeds/posts/default/-/Store?alt=json&max-results=50"
TMP_FEED_JSON=""

cleanup() {
  if [[ -n "${TMP_FEED_JSON}" && -f "${TMP_FEED_JSON}" ]]; then
    rm -f "${TMP_FEED_JSON}"
  fi
}

trap cleanup EXIT

TMP_FEED_JSON="$(mktemp)"

if curl -sS --max-time 20 "${FEED_URL}" > "${TMP_FEED_JSON}"; then
  GG_STORE_FEED_JSON_PATH="${TMP_FEED_JSON}" node "${ROOT}/tools/build-store-static.mjs"
else
  node "${ROOT}/tools/build-store-static.mjs"
fi
