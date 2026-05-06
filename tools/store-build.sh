#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FEED_URL="https://www.pakrpp.com/feeds/posts/default/-/Store?alt=json&max-results=50"
STORE_CI="${STORE_CI:-0}"
STORE_REQUIRE_LIVE_FEED="${STORE_REQUIRE_LIVE_FEED:-0}"
STORE_STRICT_IMAGES="${STORE_STRICT_IMAGES:-0}"
STORE_PRODUCTION="${STORE_PRODUCTION:-0}"
GG_STORE_MODE="${GG_STORE_MODE:-}"
GG_STORE_PRODUCTION_READINESS="${GG_STORE_PRODUCTION_READINESS:-0}"
STORE_FEED_TIMEOUT_SECONDS="${STORE_FEED_TIMEOUT_SECONDS:-20}"
TMP_FEED_JSON=""
TMP_CURL_ERR=""

store_mode() {
  case "${GG_STORE_MODE}" in
    development|ci|strict|production)
      printf '%s\n' "${GG_STORE_MODE}"
      return
      ;;
  esac

  if [[ "${GG_STORE_PRODUCTION_READINESS}" == "1" || "${STORE_PRODUCTION}" == "1" || "${GG_EDGE_MODE:-}" == "production" ]]; then
    printf 'production\n'
  elif [[ "${STORE_REQUIRE_LIVE_FEED}" == "1" || "${STORE_STRICT_IMAGES}" == "1" ]]; then
    printf 'strict\n'
  elif [[ "${STORE_CI}" == "1" ]]; then
    printf 'ci\n'
  else
    printf 'development\n'
  fi
}

STORE_MODE="$(store_mode)"
STORE_FEED_PROBE_LABEL="WARN"
if [[ "${STORE_MODE}" == "development" || "${STORE_MODE}" == "ci" ]]; then
  STORE_FEED_PROBE_LABEL="NOTE"
fi

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
  GG_STORE_MODE="${STORE_MODE}" \
  GG_STORE_PRODUCTION_READINESS="${GG_STORE_PRODUCTION_READINESS}" \
  STORE_CI="${STORE_CI}" \
  STORE_PRODUCTION="${STORE_PRODUCTION}" \
  STORE_REQUIRE_LIVE_FEED="${STORE_REQUIRE_LIVE_FEED}" \
  STORE_STRICT_IMAGES="${STORE_STRICT_IMAGES}" \
  STORE_FEED_TIMEOUT_SECONDS="${STORE_FEED_TIMEOUT_SECONDS}" \
  node "${ROOT}/tools/build-store-static.mjs"
else
  probe_warning="$(head -n 1 "${TMP_CURL_ERR}" | tr -d '\r')"
  if [[ -z "${probe_warning}" ]]; then
    probe_warning="store feed probe failed"
  fi
  printf 'STORE FEED PROBE %s %s\n' "${STORE_FEED_PROBE_LABEL}" "${probe_warning}" >&2
  rm -f "${TMP_FEED_JSON}"
  TMP_FEED_JSON=""
  GG_STORE_SKIP_NETWORK_FEED=1 \
  GG_STORE_FEED_PROBE_WARNING="${probe_warning}" \
  GG_STORE_MODE="${STORE_MODE}" \
  GG_STORE_PRODUCTION_READINESS="${GG_STORE_PRODUCTION_READINESS}" \
  STORE_CI="${STORE_CI}" \
  STORE_PRODUCTION="${STORE_PRODUCTION}" \
  STORE_REQUIRE_LIVE_FEED="${STORE_REQUIRE_LIVE_FEED}" \
  STORE_STRICT_IMAGES="${STORE_STRICT_IMAGES}" \
  STORE_FEED_TIMEOUT_SECONDS="${STORE_FEED_TIMEOUT_SECONDS}" \
  node "${ROOT}/tools/build-store-static.mjs"
fi
