#!/usr/bin/env bash
set -Eeuo pipefail
trap 'echo "FAIL: smoke crashed at line $LINENO: $BASH_COMMAND" >&2' ERR

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

die() {
  echo "FAIL: $*" >&2
  exit 1
}

BASE="${BASE:-https://www.pakrpp.com}"
ALLOW_OFFLINE_FALLBACK="${SMOKE_ALLOW_OFFLINE_FALLBACK:-0}"
SMOKE_LIVE_HTML="${SMOKE_LIVE_HTML:-0}"
POST_TARGET="${SMOKE_POST_URL:-${SMOKE_POST_DETAIL_URL:-${SMOKE_POST_DETAIL_PATH:-/2026/02/automatically-identify-key-words-and.html}}}"
PAGE_TARGET="${SMOKE_PAGE_URL:-}"

LIVE_TIMEOUT_MS="${SMOKE_LIVE_RETRY_TIMEOUT_MS:-10000}"
LIVE_RETRY_MAX="${SMOKE_LIVE_RETRY_MAX:-4}"
LIVE_RETRY_BASE_MS="${SMOKE_LIVE_RETRY_BASE_MS:-800}"
LIVE_RETRY_CAP_MS="${SMOKE_LIVE_RETRY_CAP_MS:-10000}"
LIVE_INTER_REQUEST_DELAY_MS="${SMOKE_LIVE_INTER_REQUEST_DELAY_MS:-250}"
LIVE_VERIFIER_ATTEMPTS="${SMOKE_LIVE_VERIFIER_ATTEMPTS:-2}"
LIVE_VERIFIER_RETRY_BASE_MS="${SMOKE_LIVE_VERIFIER_RETRY_BASE_MS:-1500}"
LIVE_VERIFIER_RETRY_CAP_MS="${SMOKE_LIVE_VERIFIER_RETRY_CAP_MS:-10000}"
LIVE_USER_AGENT="${SMOKE_LIVE_USER_AGENT:-gg-live-gate/1.0 (+https://www.pakrpp.com)}"

echo "SMOKE: base=${BASE}"

http_headers() {
  local url="$1"
  curl -sS -D - -o /dev/null --max-time 12 -H "Cache-Control: no-cache" -H "Pragma: no-cache" "${url}" | tr -d '\r'
}

header_value() {
  local headers="$1"
  local key="$2"
  echo "${headers}" | awk -F': *' -v k="${key}" 'tolower($1)==tolower(k){print $2; exit}' | tr -d '[:space:]'
}

require_status_200() {
  local headers="$1"
  local label="$2"
  local code
  code="$(echo "${headers}" | awk 'NR==1{print $2}')"
  if [[ "${code}" != "200" ]]; then
    echo "${headers}" | sed -n '1,20p'
    die "${label}: expected 200 (got ${code:-unknown})"
  fi
}

ping_headers="$(http_headers "${BASE}/__gg_worker_ping?x=1" || true)"
if [[ -z "${ping_headers}" ]]; then
  if [[ "${ALLOW_OFFLINE_FALLBACK}" == "1" ]]; then
    echo "INFO: __gg_worker_ping unavailable; running offline fallback"
    node "${ROOT}/tools/verify-palette-a11y.mjs" --mode=repo
    echo "PASS: smoke tests (offline fallback)"
    exit 0
  fi
  die "__gg_worker_ping request failed"
fi

require_status_200 "${ping_headers}" "__gg_worker_ping"

REL="$(header_value "${ping_headers}" "x-gg-worker-version")"
if [[ -z "${REL}" ]]; then
  echo "${ping_headers}" | sed -n '1,20p'
  die "missing x-gg-worker-version on __gg_worker_ping"
fi
echo "SMOKE: live release=${REL}"

check_template_headers() {
  local url="$1"
  local label="$2"
  local headers
  headers="$(http_headers "${url}?x=$(date +%s)")"
  require_status_200 "${headers}" "${label}"

  local assets worker mismatch drift
  assets="$(header_value "${headers}" "x-gg-assets")"
  worker="$(header_value "${headers}" "x-gg-worker-version")"
  mismatch="$(header_value "${headers}" "x-gg-template-mismatch")"
  drift="$(header_value "${headers}" "x-gg-template-release-drift")"

  if [[ -z "${assets}" || "${assets}" != "${REL}" ]]; then
    echo "${headers}" | sed -n '1,30p'
    die "${label}: x-gg-assets mismatch (got ${assets:-missing}, want ${REL})"
  fi
  if [[ -z "${worker}" || "${worker}" != "${REL}" ]]; then
    echo "${headers}" | sed -n '1,30p'
    die "${label}: x-gg-worker-version mismatch (got ${worker:-missing}, want ${REL})"
  fi
  if [[ -n "${mismatch}" && "${mismatch}" != "0" ]]; then
    echo "${headers}" | sed -n '1,30p'
    die "${label}: x-gg-template-mismatch must be 0 (got ${mismatch})"
  fi
  if [[ -n "${drift}" && "${drift}" != "0" ]]; then
    echo "${headers}" | sed -n '1,30p'
    die "${label}: x-gg-template-release-drift must be 0 (got ${drift})"
  fi
  echo "PASS: ${label} headers aligned (${REL})"
}

check_html_pin() {
  local url="$1"
  local label="$2"
  local html
  html="$(curl -fsSL -H "Cache-Control: no-cache" -H "Pragma: no-cache" "${url}?x=$(date +%s)" | tr -d '\r')"
  if ! grep -Fq "/assets/v/${REL}/boot.js" <<<"${html}"; then
    die "${label}: missing boot.js pin /assets/v/${REL}/boot.js"
  fi
  if ! grep -Fq "/assets/v/${REL}/main.css" <<<"${html}"; then
    die "${label}: missing main.css pin /assets/v/${REL}/main.css"
  fi
  if ! grep -Eqi "id=['\"]gg-dock['\"]" <<<"${html}"; then
    die "${label}: missing #gg-dock"
  fi
  echo "PASS: ${label} HTML pin + dock contract"
}

check_template_headers "${BASE}/" "home"
check_template_headers "${BASE}/blog" "blog"
check_html_pin "${BASE}/" "home"
check_html_pin "${BASE}/blog" "blog"

node "${ROOT}/tools/verify-js-chain.mjs" --base="${BASE}"

run_live_verifier() {
  local label="$1"
  shift
  bash "${ROOT}/tools/run-live-verifier-with-retry.sh" \
    --label "${label}" \
    --max-attempts "${LIVE_VERIFIER_ATTEMPTS}" \
    --base-delay-ms "${LIVE_VERIFIER_RETRY_BASE_MS}" \
    --cap-delay-ms "${LIVE_VERIFIER_RETRY_CAP_MS}" \
    -- \
    "$@"
}

if [[ "${SMOKE_LIVE_HTML}" == "1" ]]; then
  run_live_verifier \
    "VERIFY_LIVE_LISTING_EPANEL" \
    node "${ROOT}/tools/verify-live-listing-epanel.mjs" \
      --base="${BASE}" \
      --timeout-ms="${LIVE_TIMEOUT_MS}" \
      --retry-max="${LIVE_RETRY_MAX}" \
      --retry-base-ms="${LIVE_RETRY_BASE_MS}" \
      --retry-cap-ms="${LIVE_RETRY_CAP_MS}" \
      --user-agent="${LIVE_USER_AGENT}"

  run_live_verifier \
    "VERIFY_LIVE_PANEL_METADATA" \
    node "${ROOT}/tools/verify-live-panel-metadata.mjs" \
      --base="${BASE}" \
      --post="${POST_TARGET}" \
      --timeout-ms="${LIVE_TIMEOUT_MS}" \
      --retry-max="${LIVE_RETRY_MAX}" \
      --retry-base-ms="${LIVE_RETRY_BASE_MS}" \
      --retry-cap-ms="${LIVE_RETRY_CAP_MS}" \
      --inter-request-delay-ms="${LIVE_INTER_REQUEST_DELAY_MS}" \
      --user-agent="${LIVE_USER_AGENT}"

  toc_args=(
    --base="${BASE}"
    --post="${POST_TARGET}"
    --timeout-ms="${LIVE_TIMEOUT_MS}"
    --retry-max="${LIVE_RETRY_MAX}"
    --retry-base-ms="${LIVE_RETRY_BASE_MS}"
    --retry-cap-ms="${LIVE_RETRY_CAP_MS}"
    --inter-request-delay-ms="${LIVE_INTER_REQUEST_DELAY_MS}"
    --user-agent="${LIVE_USER_AGENT}"
  )
  if [[ -n "${PAGE_TARGET}" ]]; then
    toc_args+=(--page="${PAGE_TARGET}")
  fi
  run_live_verifier \
    "VERIFY_LIVE_TOC_FUNCTIONAL" \
    node "${ROOT}/tools/verify-live-toc-functional.mjs" "${toc_args[@]}"

  run_live_verifier \
    "VERIFY_LIVE_POST_LEFTPANEL" \
    node "${ROOT}/tools/verify-live-post-leftpanel.mjs" \
      --base="${BASE}" \
      --post="${POST_TARGET}" \
      --timeout-ms="${LIVE_TIMEOUT_MS}" \
      --retry-max="${LIVE_RETRY_MAX}" \
      --retry-base-ms="${LIVE_RETRY_BASE_MS}" \
      --retry-cap-ms="${LIVE_RETRY_CAP_MS}" \
      --user-agent="${LIVE_USER_AGENT}"
fi

echo "PASS: smoke tests"
