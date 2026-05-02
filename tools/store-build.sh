#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FEED_URL="https://www.pakrpp.com/feeds/posts/default/-/Store?alt=json&max-results=50"
STORE_CI="${STORE_CI:-0}"
STORE_REQUIRE_LIVE_FEED="${STORE_REQUIRE_LIVE_FEED:-0}"
STORE_STRICT_IMAGES="${STORE_STRICT_IMAGES:-0}"
STORE_FEED_TIMEOUT_SECONDS="${STORE_FEED_TIMEOUT_SECONDS:-20}"
TMP_FEED_JSON=""
TMP_CURL_ERR=""

cleanup() {
  if [[ -n "${TMP_FEED_JSON}" && -f "${TMP_FEED_JSON}" ]]; then
    rm -f "${TMP_FEED_JSON}"
  fi
  if [[ -n "${TMP_CURL_ERR}" && -f "${TMP_CURL_ERR}" ]]; then
    rm -f "${TMP_CURL_ERR}"
  fi
}

trap cleanup EXIT

TMP_FEED_JSON="$(mktemp)"
TMP_CURL_ERR="$(mktemp)"

if curl -fsSL --max-time "${STORE_FEED_TIMEOUT_SECONDS}" "${FEED_URL}" > "${TMP_FEED_JSON}" 2>"${TMP_CURL_ERR}"; then
  GG_STORE_FEED_JSON_PATH="${TMP_FEED_JSON}" \
  STORE_CI="${STORE_CI}" \
  STORE_REQUIRE_LIVE_FEED="${STORE_REQUIRE_LIVE_FEED}" \
  STORE_STRICT_IMAGES="${STORE_STRICT_IMAGES}" \
  STORE_FEED_TIMEOUT_SECONDS="${STORE_FEED_TIMEOUT_SECONDS}" \
  node "${ROOT}/tools/build-store-static.mjs"
else
  probe_warning="$(head -n 1 "${TMP_CURL_ERR}" | tr -d '\r')"
  if [[ -z "${probe_warning}" ]]; then
    probe_warning="store feed probe failed"
  fi
  printf 'STORE FEED PROBE WARN %s\n' "${probe_warning}" >&2
  rm -f "${TMP_FEED_JSON}"
  TMP_FEED_JSON=""
  GG_STORE_SKIP_NETWORK_FEED=1 \
  GG_STORE_FEED_PROBE_WARNING="${probe_warning}" \
  STORE_CI="${STORE_CI}" \
  STORE_REQUIRE_LIVE_FEED="${STORE_REQUIRE_LIVE_FEED}" \
  STORE_STRICT_IMAGES="${STORE_STRICT_IMAGES}" \
  STORE_FEED_TIMEOUT_SECONDS="${STORE_FEED_TIMEOUT_SECONDS}" \
  node "${ROOT}/tools/build-store-static.mjs"
fi
