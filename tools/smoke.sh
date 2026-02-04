#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"${ROOT}/tools/verify-worker.sh"

base="https://www.pakrpp.com"
sw_url="${base}/sw.js?x=1"

REL="$(curl -sL "${sw_url}" | sed -n 's/.*const VERSION = "\([^"]\+\)";.*/\1/p' | head -n1)"
if [[ -z "${REL}" ]]; then
  echo "FAIL: failed to extract VERSION from ${sw_url}"
  exit 1
fi

authoritative_header() {
  local url="$1"
  local pattern="$2"
  local label="$3"
  if ! curl -sSI "$url" | tr -d '\r' | grep -qi "$pattern"; then
    echo "FAIL: ${label}"
    exit 1
  fi
  echo "OK: ${label}"
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
    echo "FAIL: ${label} (got ${status}, want ${expected})"
    exit 1
  fi
  echo "OK: ${label}"
}

authoritative_header "${base}/sw.js?x=1" '^cache-control:.*no-store' "sw.js is no-store"
authoritative_header "${base}/gg-flags.json?x=1" '^cache-control:.*no-store' "gg-flags.json is no-store"
authoritative_header "${base}/assets/v/${REL}/main.js?x=1" '^cache-control:.*immutable' "assets/v main.js is immutable"

assert_status "${base}/api/proxy" "400" "/api/proxy missing url"
assert_status "${base}/api/proxy?url=not-a-url" "400" "/api/proxy invalid url"
assert_status "${base}/api/proxy?url=https://example.com/" "403" "/api/proxy host not allowed"

sample_url="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjvwoyib0SbHdRWPvh0kkeSCu_rlWeb2bXM2XylpGu9Zl7Pmeg5csuPXuyDW0Tq1Q6Q3C3y0aOaxfGd6PCyQeus6XITellrxOutl2Y9c6jLv_KmvlfOCGCY8O2Zmud32hwghg_a0HfskdDAnCI108_vQ4U-DNilI_QF9r0gphOdThjtHLg/s1600/OGcircle.png"
status="$(curl -sSI -G --data-urlencode "url=${sample_url}" "${base}/api/proxy" | awk 'NR==1 {print $2}')"
if [[ "${status}" == "200" ]]; then
  echo "OK: /api/proxy sample image"
elif [[ "${status}" == "403" ]]; then
  echo "SKIP: /api/proxy sample image returned 403"
else
  echo "FAIL: /api/proxy sample image (got ${status})"
  exit 1
fi

echo "PASS: smoke tests"
