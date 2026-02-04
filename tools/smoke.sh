#!/usr/bin/env bash
set -Eeuo pipefail
trap 'echo "FAIL: smoke crashed at line $LINENO: $BASH_COMMAND" >&2' ERR

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

die(){
  echo "FAIL: $*" >&2
  exit 1
}

BASE="${BASE:-https://www.pakrpp.com}"

echo "SMOKE: base=${BASE}"

if ! "${ROOT}/tools/check-links.sh"; then
  die "check-links failed"
fi

expected_release="${RELEASE_ID:-}"
if [[ -z "${expected_release}" ]]; then
  if [[ -x "${ROOT}/tools/release-id.sh" ]]; then
    expected_release="$("${ROOT}/tools/release-id.sh" | awk '/RELEASE_ID/{print $2; exit}')"
  fi
fi

ping_url="${BASE}/__gg_worker_ping?x=1"
if ! ping_headers="$(curl -sS -D - -o /dev/null --max-time 10 "${ping_url}" | tr -d '\r')"; then
  die "__gg_worker_ping request failed"
fi
ping_status="$(echo "${ping_headers}" | head -n 1)"
ping_code="$(echo "${ping_status}" | awk '{print $2}')"
if [[ -z "${ping_code}" ]]; then
  die "unable to read status from ${ping_url}"
fi
if [[ "${ping_code}" != "200" ]]; then
  die "__gg_worker_ping not 200 (got ${ping_code})"
fi

worker_version="$(echo "${ping_headers}" | awk -F': *' 'tolower($1)=="x-gg-worker-version"{print $2}' | head -n1 | tr -d '[:space:]')"
if [[ -z "${worker_version}" ]]; then
  die "missing x-gg-worker-version header from ${ping_url}"
fi

if [[ -z "${expected_release}" ]]; then
  expected_release="${worker_version}"
  echo "INFO: expected RELEASE_ID not found; using worker header ${expected_release}"
fi

echo "SMOKE: base=${BASE} expected=${expected_release} got=${worker_version}"

if [[ "${worker_version}" != "${expected_release}" ]]; then
  die "worker version mismatch (expected ${expected_release}, got ${worker_version})"
fi

REL="${worker_version}"

authoritative_header() {
  local url="$1"
  local pattern="$2"
  local label="$3"
  if ! curl -sSI "$url" | tr -d '\r' | grep -qi "$pattern"; then
    die "${label}"
  fi
  echo "PASS: ${label}"
}

status_of() {
  local url="$1"
  curl -sSI "$url" | awk 'NR==1 {print $2}'
}

assert_status() {
  local url="$1"
  local expected="$2"
  local label="$3"
  local status
  status="$(status_of "$url")"
  if [[ "${status}" != "${expected}" ]]; then
    die "${label} (got ${status}, want ${expected})"
  fi
  echo "PASS: ${label}"
}

authoritative_header "${BASE}/sw.js?x=1" '^cache-control:.*no-store' "sw.js is no-store"
authoritative_header "${BASE}/gg-flags.json?x=1" '^cache-control:.*no-store' "gg-flags.json is no-store"
authoritative_header "${BASE}/assets/v/${REL}/main.js?x=1" '^cache-control:.*immutable' "assets/v main.js is immutable"

assert_status "${BASE}/api/proxy" "400" "/api/proxy missing url"
assert_status "${BASE}/api/proxy?url=not-a-url" "400" "/api/proxy invalid url"
assert_status "${BASE}/api/proxy?url=https://example.com/" "403" "/api/proxy host not allowed"

sample_url="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjvwoyib0SbHdRWPvh0kkeSCu_rlWeb2bXM2XylpGu9Zl7Pmeg5csuPXuyDW0Tq1Q6Q3C3y0aOaxfGd6PCyQeus6XITellrxOutl2Y9c6jLv_KmvlfOCGCY8O2Zmud32hwghg_a0HfskdDAnCI108_vQ4U-DNilI_QF9r0gphOdThjtHLg/s1600/OGcircle.png"
status="$(curl -sSI -G --data-urlencode "url=${sample_url}" "${BASE}/api/proxy" | awk 'NR==1 {print $2}')"
if [[ "${status}" == "200" ]]; then
  echo "PASS: /api/proxy sample image"
elif [[ "${status}" == "403" ]]; then
  echo "INFO: /api/proxy sample image returned 403 (skipping)"
else
  die "/api/proxy sample image (got ${status})"
fi

headers_url="${BASE}/_headers?x=1"
if ! headers_status="$(curl -sS -D - -o /dev/null --max-time 10 "${headers_url}" | tr -d '\r' | head -n 1)"; then
  die "/_headers request failed"
fi
headers_code="$(echo "${headers_status}" | awk '{print $2}')"
if [[ -z "${headers_code}" ]]; then
  die "/_headers check failed to read status"
elif [[ "${headers_code}" == "200" ]]; then
  echo "PASS: /_headers present"
elif [[ "${headers_code}" == "404" ]]; then
  echo "INFO: /_headers not present (404) - skipping"
elif [[ "${headers_code}" == 5* ]]; then
  die "/_headers returned ${headers_code}"
else
  echo "INFO: /_headers status ${headers_code} - skipping"
fi

echo "PASS: smoke tests"
