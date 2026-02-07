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

redirect_check() {
  local url="$1"
  local label="$2"
  local headers status loc
  headers="$(curl -sSI -H "Cache-Control: no-cache" -H "Pragma: no-cache" "$url" | tr -d '\r')"
  status="$(echo "${headers}" | awk 'NR==1 {print $2}')"
  loc="$(printf '%s\n' "${headers}" \
    | sed -n 's/^[Ll][Oo][Cc][Aa][Tt][Ii][Oo][Nn]:[[:space:]]*//p' \
    | head -n 1)"

  redirect_fail() {
    local msg="$1"
    echo "DEBUG: Location=${loc}"
    echo "${headers}" | sed -n '1,30p'
    die "${label} ${msg}"
  }

  if [[ "${status}" != "301" ]]; then
    redirect_fail "(got ${status}, want 301)"
  fi
  if [[ -z "${loc}" ]]; then
    redirect_fail "missing Location header"
  fi
  if ! echo "${loc}" | grep -qi "/blog"; then
    redirect_fail "Location missing /blog"
  fi
  if echo "${loc}" | grep -qi "view=blog"; then
    redirect_fail "Location still contains view=blog"
  fi
  echo "PASS: ${label}"
}

listing_canonical_check() {
  local url="$1"
  local canon="${BASE}/blog"
  local ts html
  ts="$(date +%s)"
  if ! html="$(curl -fsSL -H "Cache-Control: no-cache" -H "Pragma: no-cache" "${url}?x=${ts}" | tr -d '\r')"; then
    die "listing fetch failed"
  fi

  local canon_line og_line tw_line
  canon_line="$(printf '%s\n' "${html}" | grep -Eoi "<link[^>]+rel=['\"]canonical['\"][^>]*>" | head -n 1 || true)"
  og_line="$(printf '%s\n' "${html}" | grep -Eoi "<meta[^>]+property=['\"]og:url['\"][^>]*>" | head -n 1 || true)"
  tw_line="$(printf '%s\n' "${html}" | grep -Eoi "<meta[^>]+name=['\"]twitter:url['\"][^>]*>" | head -n 1 || true)"

  listing_debug_tags() {
    echo "DEBUG: listing canonical/og/twitter tags (first 20)"
    printf '%s\n' "${html}" | grep -Eoi "<(link|meta)[^>]+(canonical|og:url|twitter:url)[^>]*>" | head -n 20 || true
  }

  if [[ -z "${canon_line}" ]]; then
    listing_debug_tags
    die "listing canonical missing"
  fi
  if ! echo "${canon_line}" | grep -Fqi "${canon}"; then
    listing_debug_tags
    die "listing canonical not ${canon}"
  fi
  if echo "${canon_line}" | grep -Eqi '\?x=|[?&]view=|utm_|fbclid|gclid|msclkid'; then
    listing_debug_tags
    die "listing canonical contains tracking params"
  fi

  if [[ -z "${og_line}" ]]; then
    listing_debug_tags
    die "listing og:url missing"
  fi
  if ! echo "${og_line}" | grep -Fqi "${canon}"; then
    listing_debug_tags
    die "listing og:url not ${canon}"
  fi
  if echo "${og_line}" | grep -Eqi '\?x=|[?&]view=|utm_|fbclid|gclid|msclkid'; then
    listing_debug_tags
    die "listing og:url contains tracking params"
  fi

  if [[ -z "${tw_line}" ]]; then
    listing_debug_tags
    die "listing twitter:url missing"
  fi
  if ! echo "${tw_line}" | grep -Fqi "${canon}"; then
    listing_debug_tags
    die "listing twitter:url not ${canon}"
  fi
  if echo "${tw_line}" | grep -Eqi '\?x=|[?&]view=|utm_|fbclid|gclid|msclkid'; then
    listing_debug_tags
    die "listing twitter:url contains tracking params"
  fi

  echo "PASS: listing canonical/og/twitter clean ${canon}"
}

extract_schema_json() {
  node -e '
    const html = require("fs").readFileSync(0,"utf8");
    const m = html.match(/<script[^>]*id=["'"'"']gg-schema["'"'"'][^>]*>([\s\S]*?)<\/script>/i);
    if (!m) { process.exit(2); }
    const obj = JSON.parse(m[1]);
    process.stdout.write(JSON.stringify(obj));
  '
}

schema_debug_snippet() {
  local label="$1"
  local html="$2"
  echo "DEBUG: ${label} gg-schema snippet"
  printf '%s\n' "${html}" | grep -in -C 2 "gg-schema" | head -n 20 || true
}

schema_debug_types() {
  local schema="$1"
  printf '%s\n' "${schema}" | node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));const graph=d["@graph"]||[];const types=graph.flatMap(n=>Array.isArray(n["@type"])?n["@type"]:[n["@type"]]).filter(Boolean);console.log("DEBUG: schema types:", types.join(", "));'
}

schema_check_home() {
  local url="${BASE}/"
  local html schema
  if ! html="$(curl -fsSL -H "Cache-Control: no-cache" -H "Pragma: no-cache" "${url}" | tr -d '\r')"; then
    die "schema home fetch failed"
  fi
  if ! schema="$(printf '%s\n' "${html}" | extract_schema_json)"; then
    schema_debug_snippet "home" "${html}"
    die "schema missing/invalid on home"
  fi
  if ! node -e 'const o=JSON.parse(process.argv[1]); if(!o["@context"]||!o["@graph"]) process.exit(1);' "${schema}"; then
    schema_debug_snippet "home" "${html}"
    die "schema missing @context/@graph on home"
  fi
  echo "PASS: schema home"
}

schema_check_listing() {
  local ts url html schema
  ts="$(date +%s)"
  url="${BASE}/blog?x=${ts}"
  if ! html="$(curl -fsSL -H "Cache-Control: no-cache" -H "Pragma: no-cache" "${url}" | tr -d '\r')"; then
    die "schema listing fetch failed"
  fi
  if ! schema="$(printf '%s\n' "${html}" | extract_schema_json)"; then
    schema_debug_snippet "listing" "${html}"
    die "schema missing/invalid on listing"
  fi
  if ! node -e 'const o=JSON.parse(process.argv[1]); if(!o["@context"]||!o["@graph"]) process.exit(1);' "${schema}"; then
    schema_debug_snippet "listing" "${html}"
    die "schema missing @context/@graph on listing"
  fi
  if ! printf '%s\n' "${schema}" | EXPECTED_URL="${BASE}/blog" node -e 'const fs=require("fs");const d=JSON.parse(fs.readFileSync(0,"utf8"));const graph=d["@graph"]||[];const hasCollection=graph.some(n=>n["@type"]==="CollectionPage");if(!hasCollection)process.exit(2);const page=graph.find(n=>n["@type"]==="CollectionPage")||graph.find(n=>n["@type"]==="WebPage");if(!page||page.url!==process.env.EXPECTED_URL)process.exit(3);'; then
    schema_debug_snippet "listing" "${html}"
    die "schema listing url/type invalid"
  fi
  echo "PASS: schema listing"
}

schema_check_post() {
  local url="$1"
  local html schema
  if ! html="$(curl -fsSL -H "Cache-Control: no-cache" -H "Pragma: no-cache" "${url}" | tr -d '\r')"; then
    die "schema post fetch failed (${url})"
  fi
  if ! schema="$(printf '%s\n' "${html}" | extract_schema_json)"; then
    schema_debug_snippet "post" "${html}"
    die "schema missing/invalid on post"
  fi
  if ! node -e 'const o=JSON.parse(process.argv[1]); if(!o["@context"]||!o["@graph"]) process.exit(1);' "${schema}"; then
    schema_debug_types "${schema}"
    schema_debug_snippet "post" "${html}"
    die "schema missing @context/@graph on post"
  fi
  if ! cond_out="$(printf '%s\n' "${schema}" | node -e '
    const fs=require("fs");
    const d=JSON.parse(fs.readFileSync(0,"utf8"));
    const graph=d["@graph"]||[];
    const hasType=(node,t)=>{
      const v=node["@type"];
      if(Array.isArray(v)) return v.includes(t);
      return v===t;
    };
    const post=graph.find(n=>hasType(n,"BlogPosting"));
    if(!post) { console.error("FAIL_COND: missing BlogPosting"); process.exit(2); }
    if(typeof post.url!=="string"||post.url.includes("?")) { console.error("FAIL_COND: BlogPosting url has query"); process.exit(3); }
    const page=graph.find(n=>hasType(n,"WebPage"));
    if(!page) { console.error("FAIL_COND: missing WebPage"); process.exit(4); }
    if(typeof page.url!=="string"||page.url.includes("?")) { console.error("FAIL_COND: WebPage url has query"); process.exit(5); }
  ' 2>&1)"; then
    schema_debug_types "${schema}"
    if [[ -n "${cond_out:-}" ]]; then
      echo "DEBUG: ${cond_out}"
    fi
    schema_debug_snippet "post" "${html}"
    die "schema BlogPosting/WebPage invalid on post"
  fi
  echo "PASS: schema post"
}

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

redirect_check "${BASE}/?view=blog" "redirect /?view=blog -> /blog"
redirect_check "${BASE}/blog?view=blog" "redirect /blog?view=blog -> /blog"
redirect_check "${BASE}/blog/" "redirect /blog/ -> /blog"
listing_canonical_check "${BASE}/blog"
schema_check_home
schema_check_listing
if [[ -n "${SMOKE_POST_URL:-}" ]]; then
  schema_check_post "${SMOKE_POST_URL}"
fi

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

  live_h1_check() {
    local url="$1"
    local label="$2"
    local expect_text="${3:-}"
    local ts html count
    ts="$(date +%s)"
    html="$(live_fetch_stream "${url}?x=${ts}")"
    count="$(printf '%s\n' "${html}" | grep -i -c "<h1" || true)"
    if [[ "${count}" != "1" ]]; then
      echo "DEBUG: ${label} h1 lines"
      printf '%s\n' "${html}" | grep -in -C 1 "<h1" | head -n 20 || true
      die "LIVE_HTML ${label} h1 count (got ${count}, want 1)"
    fi
    if [[ -n "${expect_text}" ]]; then
      if ! printf '%s\n' "${html}" | grep -Ei "<h1[^>]*>[[:space:]]*${expect_text}[[:space:]]*<" > /dev/null; then
        echo "DEBUG: ${label} h1 lines"
        printf '%s\n' "${html}" | grep -in -C 1 "<h1" | head -n 20 || true
        die "LIVE_HTML ${label} h1 missing ${expect_text}"
      fi
    fi
    echo "PASS: LIVE_HTML ${label} h1 count"
  }

  live_check "${BASE}/" "home"
  live_check "${BASE}/blog" "blog"
  live_h1_check "${BASE}/" "home"
  live_h1_check "${BASE}/blog" "blog" "Blog"
fi

echo "PASS: smoke tests"
