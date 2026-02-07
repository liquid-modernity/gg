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

read_release_id_from_capsule() {
  local file="${ROOT}/docs/ledger/GG_CAPSULE.md"
  if [[ ! -f "${file}" ]]; then
    return 0
  fi

  local id
  id="$(grep -E 'RELEASE_ID' "${file}" | head -n 1 | sed -E 's/.*RELEASE_ID[^0-9a-f]*([0-9a-f]{7,40}).*/\1/' | tr -d '[:space:]')"
  if [[ "${id}" =~ ^[0-9a-f]{7,40}$ ]]; then
    echo "${id}"
    return 0
  fi

  id="$(grep -Eo '/assets/v/[0-9a-f]{7,40}/' "${file}" | head -n 1 | sed -E 's#/assets/v/([0-9a-f]{7,40})/#\1#')"
  if [[ "${id}" =~ ^[0-9a-f]{7,40}$ ]]; then
    echo "${id}"
    return 0
  fi

  return 0
}

capsule_file="${ROOT}/docs/ledger/GG_CAPSULE.md"
if [[ -f "${capsule_file}" ]]; then
  echo "DEBUG: GG_CAPSULE present: yes (${capsule_file})"
else
  echo "DEBUG: GG_CAPSULE present: no (${capsule_file})"
fi

expected_release=""
expected_source=""
fallback_reason=""

if [[ -n "${SMOKE_EXPECT:-}" ]]; then
  expected_release="${SMOKE_EXPECT}"
  expected_source="SMOKE_EXPECT"
else
  expected_release="$(read_release_id_from_capsule)"
  if [[ -n "${expected_release}" ]]; then
    expected_source="GG_CAPSULE"
  else
    fallback_reason="capsule"
    echo "WARN: GG_CAPSULE missing/unparseable; using worker header for expected release"
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
  expected_source="WORKER_HEADER"
fi

if [[ -n "${expected_release}" && -n "${expected_source}" ]]; then
  echo "INFO: expected RELEASE_ID (${expected_source}): ${expected_release}"
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

if [[ "${SMOKE_LIVE_HTML:-}" == "1" ]]; then
  live_rel="${expected_release}"
  if [[ -z "${live_rel}" ]]; then
    die "SMOKE_LIVE_HTML=1 requires a resolved expected release id"
  fi

  live_fetch_stream() {
    local url="$1"
    curl -sS -H "Cache-Control: no-cache" -H "Pragma: no-cache" "$url" | tr -d '\r'
  }

  live_has_token() {
    local url="$1"
    local token="$2"
    live_fetch_stream "$url" | grep -F "$token" > /dev/null
  }

  live_debug_detect() {
    local url="$1"
    echo "LIVE_HTML detected pins (assets/v):"
    live_fetch_stream "$url" | grep -Eo "/assets/v/[0-9a-f]+/(main\\.css|boot\\.js)" | sed -n '1,10p' || true
    echo "LIVE_HTML detected latest (assets/latest):"
    live_fetch_stream "$url" | grep -Eo "/assets/latest/(main\\.css|boot\\.js)" | sed -n '1,10p' || true
  }

  live_check() {
    local url="$1"
    local label="$2"
    local ts
    ts="$(date +%s)"
    local fetch_url="${url}?x=${ts}"
    if ! live_has_token "${fetch_url}" "/assets/v/${live_rel}/main.css"; then
      live_debug_detect "${fetch_url}"
      die "LIVE_HTML missing main.css pin (${label})"
    fi
    if ! live_has_token "${fetch_url}" "/assets/v/${live_rel}/boot.js"; then
      live_debug_detect "${fetch_url}"
      die "LIVE_HTML missing boot.js pin (${label})"
    fi
    echo "PASS: LIVE_HTML ${label} pinned to ${live_rel}"
  }

  live_check "${BASE}/" "home"
  live_check "${BASE}/blog" "blog"
fi

echo "PASS: smoke tests"
