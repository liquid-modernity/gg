#!/usr/bin/env bash
set -euo pipefail

export LC_ALL=C

BASE_URL="${1:-https://www.pakrpp.com}"
BASE_URL="${BASE_URL%/}"
UA="Mozilla/5.0 (gg-live-smoke-worker)"
PROOF_TOOL="tools/proof-store-static.mjs"
LIVE_TIMEOUT_SECONDS="${GG_LIVE_TIMEOUT_SECONDS:-20}"
CONNECT_TIMEOUT_SECONDS="${GG_LIVE_CONNECT_TIMEOUT_SECONDS:-$LIVE_TIMEOUT_SECONDS}"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

failures=0
warnings=0
root_contract="missing"
root_contract_reasons="missing"
current_mode="unknown"

log_fail() {
  failures=$((failures + 1))
  printf 'FAIL: %s\n' "$1" >&2
}

log_warn() {
  warnings=$((warnings + 1))
  printf 'WARN: %s\n' "$1" >&2
}

log_info() {
  printf 'INFO: %s\n' "$1"
}

if [[ ! -f "$PROOF_TOOL" ]]; then
  log_fail "tools/proof-store-static.mjs is missing"
fi

json_field() {
  local file="$1"
  local dotted_key="$2"

  node -e '
    const fs = require("node:fs");
    const file = process.argv[1];
    const dotted = process.argv[2];
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    const value = dotted.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), data);
    if (value == null) process.exit(3);
    if (typeof value === "string") process.stdout.write(value);
    else process.stdout.write(JSON.stringify(value));
  ' "$file" "$dotted_key" 2>/dev/null
}

meta_field() {
  local meta="$1"
  local index="$2"
  printf '%s' "$meta" | cut -d'|' -f"$index"
}

meta_status() {
  meta_field "$1" 2
}

meta_exit_code() {
  meta_field "$1" 10
}

meta_is_timeout() {
  [[ "$(meta_exit_code "$1")" == "28" ]]
}

meta_is_unreachable() {
  local status
  status="$(meta_status "$1")"
  [[ "$(meta_exit_code "$1")" != "0" || "$status" == "000" ]]
}

can_check_body() {
  local meta="$1"
  local body_file="$2"
  [[ "$(meta_exit_code "$meta")" == "0" && "$(meta_status "$meta")" == "200" && -s "$body_file" ]]
}

default_meta() {
  local target="$1"
  printf '%s|000|0|0|0|0|0|0|0' "$target"
}

meta_outcome() {
  local meta="$1"
  local status
  status="$(meta_status "$meta")"
  if meta_is_timeout "$meta"; then
    printf 'TIMEOUT'
    return
  fi
  if meta_is_unreachable "$meta"; then
    printf 'UNREACHABLE'
    return
  fi
  if [[ "$status" == "200" ]]; then
    printf 'PASS'
    return
  fi
  printf 'HTTP_%s' "${status:-000}"
}

extract_body_snippet() {
  local file="$1"
  local needle="$2"

  NEEDLE="$needle" perl -0ne '
    my $needle = $ENV{NEEDLE};
    my $text = $_;
    my $pos = index($text, $needle);
    exit 1 if $pos < 0;
    my $start = $pos - 80;
    $start = 0 if $start < 0;
    my $snippet = substr($text, $start, 200);
    $snippet =~ s/\s+/ /g;
    $snippet =~ s/^\s+|\s+$//g;
    print $snippet;
  ' "$file" 2>/dev/null || true
}

fetch_headers() {
  local path="$1"
  local out_headers="$2"
  local target="${BASE_URL}${path}"
  local meta=""
  local curl_exit=0

  meta="$(curl -sS -L \
    --http1.1 \
    --connect-timeout "$CONNECT_TIMEOUT_SECONDS" \
    --max-time "$LIVE_TIMEOUT_SECONDS" \
    --max-redirs 10 \
    -A "$UA" \
    -D "$out_headers" \
    -o /dev/null \
    -w '%{url_effective}|%{http_code}|%{num_redirects}|%{time_namelookup}|%{time_connect}|%{time_appconnect}|%{time_starttransfer}|%{time_total}|%{size_download}' \
    "$target" 2>/dev/null)" || curl_exit=$?

  if [[ ! -s "$out_headers" ]]; then
    : > "$out_headers"
  fi

  printf '%s|%s\n' "${meta:-$(default_meta "$target")}" "$curl_exit"
  return 0
}

fetch_body() {
  local path="$1"
  local out_file="$2"
  local out_headers="${3:-}"
  local target="${BASE_URL}${path}"
  local meta=""
  local curl_exit=0
  local curl_args=(
    curl -sS -L
    --http1.1
    --connect-timeout "$CONNECT_TIMEOUT_SECONDS"
    --max-time "$LIVE_TIMEOUT_SECONDS"
    --max-redirs 10
    -A "$UA"
  )

  if [[ -n "$out_headers" ]]; then
    curl_args+=(-D "$out_headers")
  fi

  curl_args+=(
    -o "$out_file"
    -w '%{url_effective}|%{http_code}|%{num_redirects}|%{time_namelookup}|%{time_connect}|%{time_appconnect}|%{time_starttransfer}|%{time_total}|%{size_download}'
    "$target"
  )

  meta="$("${curl_args[@]}" 2>/dev/null)" || curl_exit=$?

  if [[ ! -f "$out_file" ]]; then
    : > "$out_file"
  fi
  if [[ -n "$out_headers" && ! -s "$out_headers" ]]; then
    : > "$out_headers"
  fi

  printf '%s|%s\n' "${meta:-$(default_meta "$target")}" "$curl_exit"
  return 0
}

fetch_headers_nofollow() {
  local path="$1"
  local out_headers="$2"
  local target="${BASE_URL}${path}"
  local meta=""
  local curl_exit=0

  meta="$(curl -sS \
    --http1.1 \
    --connect-timeout "$CONNECT_TIMEOUT_SECONDS" \
    --max-time "$LIVE_TIMEOUT_SECONDS" \
    --max-redirs 0 \
    -A "$UA" \
    -D "$out_headers" \
    -o /dev/null \
    -w '%{url_effective}|%{http_code}|%{num_redirects}|%{time_namelookup}|%{time_connect}|%{time_appconnect}|%{time_starttransfer}|%{time_total}|%{size_download}' \
    "$target" 2>/dev/null)" || curl_exit=$?

  if [[ ! -s "$out_headers" ]]; then
    : > "$out_headers"
  fi

  printf '%s|%s\n' "${meta:-$(default_meta "$target")}" "$curl_exit"
  return 0
}

log_route_timing() {
  local label="$1"
  local meta="$2"
  local headers_file="$3"
  local status dns connect tls ttfb total size_download outcome edge_mode route_class cf_cache cache_control release store_source store_static store_cache extra

  [[ -f "$headers_file" ]] || : > "$headers_file"

  status="$(meta_status "$meta")"
  dns="$(meta_field "$meta" 4)"
  connect="$(meta_field "$meta" 5)"
  tls="$(meta_field "$meta" 6)"
  ttfb="$(meta_field "$meta" 7)"
  total="$(meta_field "$meta" 8)"
  size_download="$(meta_field "$meta" 9)"
  outcome="$(meta_outcome "$meta")"
  edge_mode="$(extract_header_value "$headers_file" "x-gg-edge-mode")"
  route_class="$(extract_header_value "$headers_file" "x-gg-route-class")"
  cf_cache="$(extract_header_value "$headers_file" "cf-cache-status")"
  cache_control="$(extract_header_value "$headers_file" "cache-control")"
  release="$(extract_header_value "$headers_file" "x-gg-release")"
  store_source="$(extract_header_value "$headers_file" "x-gg-store-source")"
  store_static="$(extract_header_value "$headers_file" "x-gg-store-static")"
  store_cache="$(extract_header_value "$headers_file" "x-gg-store-cache-policy")"
  extra=""

  [[ -n "$store_source" ]] && extra="${extra} store-source=${store_source}"
  [[ -n "$store_static" ]] && extra="${extra} store-static=${store_static}"
  [[ -n "$store_cache" ]] && extra="${extra} store-cache=${store_cache}"

  log_info "timing ${label} outcome=${outcome} status=${status:-000} dns=${dns:-0} connect=${connect:-0} tls=${tls:-0} ttfb=${ttfb:-0} total=${total:-0} bytes=${size_download:-0} edge=${edge_mode:-missing} route=${route_class:-missing} cf-cache-status=${cf_cache:-missing} cache-control=${cache_control:-missing} release=${release:-missing}${extra}"
}

report_unreachable() {
  local label="$1"
  local meta="$2"
  local reason="unreachable"
  if meta_is_timeout "$meta"; then
    reason="timeout"
  fi
  log_fail "${label} ${reason} (status=$(meta_status "$meta") curl_exit=$(meta_exit_code "$meta") ttfb=$(meta_field "$meta" 7) total=$(meta_field "$meta" 8) timeout=${LIVE_TIMEOUT_SECONDS}s)"
  return 0
}

extract_header_value() {
  local file="$1"
  local header_name="$2"
  awk -v wanted="$(printf '%s' "$header_name" | tr '[:upper:]' '[:lower:]')" '
    {
      line=$0
      gsub(/\r$/, "", line)
      key=line
      sub(/:.*/, "", key)
      if (tolower(key) == wanted) {
        sub(/^[^:]*:[[:space:]]*/, "", line)
        value=line
      }
    }
    END {
      if (value != "") print value
    }
  ' "$file" | tail -n 1
}

check_root_headers() {
  local headers_file="$tmp_dir/root_headers.txt"
  local body_file="$tmp_dir/root_body.html"
  local meta status contract_header reasons_header robots_header content_type
  meta="$(fetch_headers "/" "$headers_file")"
  log_route_timing "/" "$meta" "$headers_file"
  status="$(meta_status "$meta")"

  if meta_is_unreachable "$meta"; then
    report_unreachable "/" "$meta"
    return
  fi

  contract_header="$(extract_header_value "$headers_file" "x-gg-template-contract" | tr '[:upper:]' '[:lower:]')"
  reasons_header="$(extract_header_value "$headers_file" "x-gg-template-contract-reasons" | tr '[:upper:]' '[:lower:]')"
  robots_header="$(extract_header_value "$headers_file" "x-robots-tag" | tr '[:upper:]' '[:lower:]')"
  content_type="$(extract_header_value "$headers_file" "content-type" | tr '[:upper:]' '[:lower:]')"

  if [[ "$status" != "200" ]]; then
    log_fail "/ expected status 200 (got ${status:-000})"
  fi

  if [[ -z "$contract_header" ]]; then
    log_fail "/ missing x-gg-template-contract"
  else
    root_contract="$contract_header"
  fi

  if [[ -n "$reasons_header" ]]; then
    root_contract_reasons="$reasons_header"
    log_info "/ x-gg-template-contract-reasons=${reasons_header}"
  fi

  if [[ "$contract_header" != "ok" ]]; then
    log_fail "/ expected x-gg-template-contract=ok (got ${contract_header:-missing}; reasons=${reasons_header:-missing})"
  fi

  if [[ -z "$robots_header" ]]; then
    log_warn "/ missing x-robots-tag"
  fi

  if [[ "$content_type" != *"text/html"* ]]; then
    log_warn "/ content-type does not look like HTML (${content_type:-missing})"
  fi

  # fetch body only for lightweight diagnostics if contract mismatches
  if [[ "$contract_header" != "ok" ]]; then
    local body_meta
    body_meta="$(fetch_body "/" "$body_file")"
    if can_check_body "$body_meta" "$body_file"; then
      grep -qi 'id=.gg-shell.' "$body_file" || log_warn "/ body diagnostic: gg-shell marker not found"
      grep -qi 'id=.main.' "$body_file" || log_warn "/ body diagnostic: main landmark marker not found"
      grep -qi 'id=.gg-dock.' "$body_file" || log_warn "/ body diagnostic: gg-dock marker not found"
      grep -qi 'id=.gg-command-panel.' "$body_file" || log_warn "/ body diagnostic: gg-command-panel marker not found"
      grep -qi 'id=.gg-preview-sheet.' "$body_file" || log_warn "/ body diagnostic: gg-preview-sheet marker not found"
      grep -qi 'id=.gg-more-panel.' "$body_file" || log_warn "/ body diagnostic: gg-more-panel marker not found"
    else
      log_warn "/ body diagnostic skipped because the route body was unavailable"
    fi
  fi
}

check_flags_endpoint() {
  local flags_file="$tmp_dir/flags.json"
  local headers_file="$tmp_dir/flags_headers.txt"
  local meta status
  meta="$(fetch_body "/flags.json" "$flags_file" "$headers_file")"
  log_route_timing "/flags.json" "$meta" "$headers_file"
  status="$(meta_status "$meta")"

  if meta_is_unreachable "$meta"; then
    report_unreachable "/flags.json" "$meta"
    return
  fi

  if [[ "$status" != "200" ]]; then
    log_fail "/flags.json expected status 200 (got ${status:-000})"
    return
  fi

  if ! grep -q '"sw"' "$flags_file"; then
    log_warn "/flags.json missing sw field"
  fi

  if ! grep -q '"mode"' "$flags_file"; then
    log_warn "/flags.json missing mode field"
  else
    current_mode="$(json_field "$flags_file" "mode" || true)"
    [[ -n "$current_mode" ]] || current_mode="unknown"
    log_info "/flags.json mode=${current_mode}"
  fi
}

check_sw_asset() {
  local headers_file="$tmp_dir/sw_headers.txt"
  local meta status content_type
  meta="$(fetch_headers "/sw.js" "$headers_file")"
  log_route_timing "/sw.js" "$meta" "$headers_file"
  status="$(meta_status "$meta")"

  if meta_is_unreachable "$meta"; then
    report_unreachable "/sw.js" "$meta"
    return
  fi

  content_type="$(extract_header_value "$headers_file" "content-type" | tr '[:upper:]' '[:lower:]')"

  if [[ "$status" != "200" ]]; then
    log_fail "/sw.js expected status 200 (got ${status:-000})"
  fi

  if [[ "$content_type" != *"javascript"* && "$content_type" != *"ecmascript"* && "$content_type" != *"text/plain"* ]]; then
    log_warn "/sw.js content-type is unusual (${content_type:-missing})"
  fi
}

check_landing_route() {
  local headers_file="$tmp_dir/landing_headers.txt"
  local meta status
  meta="$(fetch_headers "/landing" "$headers_file")"
  log_route_timing "/landing" "$meta" "$headers_file"
  status="$(meta_status "$meta")"

  if meta_is_unreachable "$meta"; then
    report_unreachable "/landing" "$meta"
    return
  fi

  if [[ "$status" != "200" ]]; then
    log_fail "/landing expected status 200 (got ${status:-000})"
  fi
}

check_landing_html_redirect() {
  local headers_file="$tmp_dir/landing_html_headers.txt"
  local meta status location

  meta="$(fetch_headers_nofollow "/landing.html" "$headers_file")"
  status="$(meta_status "$meta")"
  location="$(extract_header_value "$headers_file" "location")"

  if meta_is_unreachable "$meta"; then
    report_unreachable "/landing.html" "$meta"
    return
  fi

  if [[ "$status" != "301" && "$status" != "302" && "$status" != "308" ]]; then
    log_warn "/landing.html did not return redirect status (got ${status:-000})"
    return
  fi

  if [[ "$location" != "${BASE_URL}/landing" && "$location" != "/landing" ]]; then
    log_warn "/landing.html redirect location is unexpected (${location:-missing})"
  fi
}

check_store_split_assets() {
  local js_headers_file="$tmp_dir/store_asset_js_headers.txt"
  local js_body_file="$tmp_dir/store_asset_js.js"
  local css_headers_file="$tmp_dir/store_asset_css_headers.txt"
  local css_body_file="$tmp_dir/store_asset_css.css"
  local js_meta css_meta js_status css_status js_content_type css_content_type marker

  js_meta="$(fetch_body "/assets/store/store.js" "$js_body_file" "$js_headers_file")"
  log_route_timing "/assets/store/store.js" "$js_meta" "$js_headers_file"
  css_meta="$(fetch_body "/assets/store/store.css" "$css_body_file" "$css_headers_file")"
  log_route_timing "/assets/store/store.css" "$css_meta" "$css_headers_file"

  if meta_is_unreachable "$js_meta"; then
    report_unreachable "/assets/store/store.js" "$js_meta"
  else
    js_status="$(meta_status "$js_meta")"
    js_content_type="$(extract_header_value "$js_headers_file" "content-type" | tr '[:upper:]' '[:lower:]')"

    if [[ "$js_status" != "200" ]]; then
      log_fail "/assets/store/store.js expected status 200 (got ${js_status:-000})"
    fi

    if [[ ! -s "$js_body_file" ]]; then
      log_fail "/assets/store/store.js is empty"
    fi

    if [[ -s "$js_body_file" ]]; then
      if [[ "$js_content_type" != *"javascript"* && "$js_content_type" != *"ecmascript"* && "$js_content_type" != *"text/plain"* ]]; then
        log_warn "/assets/store/store.js content-type is unusual (${js_content_type:-missing})"
      fi

      for marker in \
        'STORE_LCP_PRODUCT_START' \
        'function readStaticProducts(' \
        'function hydrateStaticProducts(' \
        'function loadProducts(' \
        'data-store-open-preview' \
        'store-static-products'; do
        grep -Fq "$marker" "$js_body_file" || log_fail "/assets/store/store.js missing runtime marker: ${marker}"
      done
    fi
  fi

  if meta_is_unreachable "$css_meta"; then
    report_unreachable "/assets/store/store.css" "$css_meta"
  else
    css_status="$(meta_status "$css_meta")"
    css_content_type="$(extract_header_value "$css_headers_file" "content-type" | tr '[:upper:]' '[:lower:]')"

    if [[ "$css_status" != "200" ]]; then
      log_fail "/assets/store/store.css expected status 200 (got ${css_status:-000})"
    fi

    if [[ ! -s "$css_body_file" ]]; then
      log_fail "/assets/store/store.css is empty"
    fi

    if [[ -s "$css_body_file" ]]; then
      if [[ "$css_content_type" != *"text/css"* && "$css_content_type" != *"text/plain"* ]]; then
        log_warn "/assets/store/store.css content-type is unusual (${css_content_type:-missing})"
      fi

      for marker in \
        '.store-app' \
        '.store-card' \
        '.store-preview-sheet' \
        'align-items: start;' \
        '.store-semantic-category-rail' \
        '.gg-dock' \
        'aspect-ratio: var(--store-card-aspect)' \
        'border-radius: 10px;'; do
        grep -Fq "$marker" "$css_body_file" || log_fail "/assets/store/store.css missing style marker: ${marker}"
      done
    fi
  fi
}

check_store_route() {
  local headers_file="$tmp_dir/store_headers.txt"
  local body_file="$tmp_dir/store_body.html"
  local meta final status release_header fingerprint_header robots_header store_source_header store_static_header store_cache_header dock_snippet preload_snippet grid_snippet saved_marker proof_output
  meta="$(fetch_body "/store" "$body_file" "$headers_file")"
  log_route_timing "/store" "$meta" "$headers_file"
  final="$(meta_field "$meta" 1)"
  status="$(meta_status "$meta")"
  release_header="$(extract_header_value "$headers_file" "x-gg-release")"
  fingerprint_header="$(extract_header_value "$headers_file" "x-gg-template-fingerprint")"
  robots_header="$(extract_header_value "$headers_file" "x-robots-tag" | tr '[:upper:]' '[:lower:]')"
  store_source_header="$(extract_header_value "$headers_file" "x-gg-store-source")"
  store_static_header="$(extract_header_value "$headers_file" "x-gg-store-static")"
  store_cache_header="$(extract_header_value "$headers_file" "x-gg-store-cache-policy")"
  saved_marker="absent"

  if meta_is_unreachable "$meta"; then
    report_unreachable "/store" "$meta"
    return
  fi

  if [[ "$status" != "200" ]]; then
    log_fail "/store expected status 200 (got ${status:-000})"
    return
  fi

  if ! can_check_body "$meta" "$body_file"; then
    log_fail "/store body unavailable for validation despite status 200"
    return
  fi

  dock_snippet="$(extract_body_snippet "$body_file" 'data-store-dock')"
  preload_snippet="$(extract_body_snippet "$body_file" 'STORE_LCP_PRELOAD_START')"
  grid_snippet="$(extract_body_snippet "$body_file" 'STORE_STATIC_GRID_START')"

  if grep -Eq 'data-store-dock=["'"'"']saved["'"'"']' "$body_file"; then
    saved_marker="present"
  fi

  log_info "/store freshness x-gg-release=${release_header:-missing} x-gg-template-fingerprint=${fingerprint_header:-missing}"
  log_info "/store source x-gg-store-source=${store_source_header:-missing} x-gg-store-static=${store_static_header:-missing} x-gg-store-cache-policy=${store_cache_header:-missing}"
  log_info "/store freshness data-store-dock-saved=${saved_marker}"
  if [[ -n "$dock_snippet" ]]; then
    log_info "/store freshness data-store-dock-snippet=${dock_snippet}"
  else
    log_info "/store freshness data-store-dock-snippet=missing"
  fi
  if [[ -n "$preload_snippet" ]]; then
    log_info "/store freshness lcp-preload-snippet=${preload_snippet}"
  else
    log_info "/store freshness lcp-preload-snippet=missing"
  fi
  if [[ -n "$grid_snippet" ]]; then
    log_info "/store freshness static-grid-snippet=${grid_snippet}"
  else
    log_info "/store freshness static-grid-snippet=missing"
  fi

  if [[ "$final" != "${BASE_URL}/store" ]]; then
    log_fail "/store final URL is unexpected (${final:-missing})"
  fi

  grep -Eq '<title>\s*Yellow Cart · PakRPP\s*</title>' "$body_file" || log_fail "/store missing canonical title"
  grep -Eq 'rel=["'"'"']canonical["'"'"'][^>]*href=["'"'"']https://www\.pakrpp\.com/store["'"'"']' "$body_file" || log_fail "/store missing canonical /store"
  grep -Eq 'name=["'"'"']gg-store-contract["'"'"'][^>]*content=["'"'"']store-static-prerender-v1["'"'"']' "$body_file" || log_fail "/store static prerender marker is missing"
  grep -Eq '<h1[^>]*>\s*Yellow Cart\s*</h1>' "$body_file" || log_fail "/store missing H1 Yellow Cart"
  grep -Eq 'href=["'"'"']https://wa\.me/[0-9]+\?text=' "$body_file" || log_fail "/store WhatsApp CTA href is missing full https://wa.me format"
  grep -Eq 'Affiliate links may be used[[:space:]]*·[[:space:]]*(Harga dan ketersediaan mengikuti marketplace\.|Prices and availability follow the marketplace\.)' "$body_file" || log_fail "/store disclosure separator copy is missing"
  grep -Fq 'STORE_LCP_PRELOAD_START' "$body_file" || log_fail "/store LCP preload start marker is missing"
  grep -Fq 'STORE_LCP_PRELOAD_END' "$body_file" || log_fail "/store LCP preload end marker is missing"
  grep -Fq 'STORE_STATIC_GRID_START' "$body_file" || log_fail "/store static grid start marker is missing"
  grep -Fq 'STORE_STATIC_GRID_END' "$body_file" || log_fail "/store static grid end marker is missing"
  grep -Fq 'STORE_STATIC_PRODUCTS_JSON_START' "$body_file" || log_fail "/store static products JSON start marker is missing"
  grep -Fq 'STORE_ITEMLIST_JSONLD_START' "$body_file" || log_fail "/store ItemList JSON-LD start marker is missing"
  grep -Fq 'STORE_STATIC_SEMANTIC_PRODUCTS_START' "$body_file" || log_fail "/store semantic products marker is missing"
  grep -Eq 'rel=["'"'"']preload["'"'"'][^>]*as=["'"'"']image["'"'"'][^>]*fetchpriority=["'"'"']high["'"'"']' "$body_file" || log_fail "/store LCP image preload contract is missing"
  grep -Eq 'fetchpriority=["'"'"']high["'"'"']' "$body_file" || log_fail "/store high fetchpriority marker is missing"
  grep -Eq 'href=["'"'"']/assets/store/store\.css["'"'"']' "$body_file" || log_fail "/store missing /assets/store/store.css reference"
  grep -Eq '<script[^>]*src=["'"'"']/assets/store/store\.js["'"'"'][^>]*defer[^>]*>|<script[^>]*defer[^>]*src=["'"'"']/assets/store/store\.js["'"'"'][^>]*>' "$body_file" || log_fail "/store missing deferred /assets/store/store.js reference"
  grep -Eq 'id=["'"'"']store-grid-skeleton["'"'"']' "$body_file" || log_fail "/store skeleton grid is missing"
  grep -Eq 'id=["'"'"']store-grid["'"'"']' "$body_file" || log_fail "/store main grid is missing"
  grep -Eq 'id=["'"'"']store-category-context["'"'"']' "$body_file" || log_fail "/store category context is missing"
  grep -Eq 'id=["'"'"']store-semantic-products["'"'"']' "$body_file" || log_fail "/store semantic products section is missing"
  grep -Eq 'id=["'"'"']store-static-products["'"'"']' "$body_file" || log_fail "/store static products payload is missing"
  grep -Eq 'id=["'"'"']store-itemlist-jsonld["'"'"']' "$body_file" || log_fail "/store ItemList JSON-LD target is missing"
  grep -Eq '<a[^>]*data-store-dock=["'"'"']store["'"'"'][^>]*href=["'"'"']/store["'"'"'][^>]*aria-current=["'"'"']page["'"'"']|<a[^>]*aria-current=["'"'"']page["'"'"'][^>]*data-store-dock=["'"'"']store["'"'"'][^>]*href=["'"'"']/store["'"'"']' "$body_file" || log_fail "/store dock Store href/current contract is missing"
  grep -Eq '<a[^>]*data-store-dock=["'"'"']contact["'"'"'][^>]*href=["'"'"']/store#contact["'"'"']' "$body_file" || log_fail "/store dock Contact href is not /store#contact"
  grep -Eq '<button[^>]*data-store-dock=["'"'"']discover["'"'"'][^>]*aria-controls=["'"'"']store-discovery-sheet["'"'"']' "$body_file" || log_fail "/store dock Discover button contract is missing"
  grep -Eq '<button[^>]*data-store-dock=["'"'"']saved["'"'"'][^>]*aria-controls=["'"'"']store-saved-sheet["'"'"']' "$body_file" || log_fail "/store dock Saved button contract is missing"
  grep -Eq '<button[^>]*data-store-dock=["'"'"']more["'"'"'][^>]*aria-controls=["'"'"']store-more-sheet["'"'"']' "$body_file" || log_fail "/store dock More button contract is missing"
  grep -Eq 'id=["'"'"']store-discovery-sheet["'"'"']' "$body_file" || log_fail "/store Discovery sheet is missing"
  grep -Eq 'id=["'"'"']store-saved-sheet["'"'"']' "$body_file" || log_fail "/store Saved sheet is missing"
  grep -Eq 'id=["'"'"']store-preview-sheet["'"'"'][^>]*aria-hidden=["'"'"']true["'"'"'][^>]*inert' "$body_file" || log_fail "/store preview sheet missing closed aria-hidden/inert contract"
  grep -Eq 'id=["'"'"']store-discovery-sheet["'"'"'][^>]*aria-hidden=["'"'"']true["'"'"'][^>]*inert' "$body_file" || log_fail "/store discovery sheet missing closed aria-hidden/inert contract"
  grep -Eq 'id=["'"'"']store-saved-sheet["'"'"'][^>]*aria-hidden=["'"'"']true["'"'"'][^>]*inert' "$body_file" || log_fail "/store saved sheet missing closed aria-hidden/inert contract"
  grep -Eq 'id=["'"'"']store-more-sheet["'"'"'][^>]*aria-hidden=["'"'"']true["'"'"'][^>]*inert' "$body_file" || log_fail "/store more sheet missing closed aria-hidden/inert contract"
  grep -Eq '<a[^>]*data-store-more-link=["'"'"']blog["'"'"'][^>]*href=["'"'"']/["'"'"']' "$body_file" || log_fail "/store More sheet Blog href is not /"
  grep -Eq '<a[^>]*data-store-more-link=["'"'"']home["'"'"'][^>]*href=["'"'"']/landing["'"'"']' "$body_file" || log_fail "/store More sheet Home href is not /landing"
  grep -Eq 'data-store-lang=["'"'"']en["'"'"']' "$body_file" || log_fail "/store EN switch is missing"
  grep -Eq 'data-store-lang=["'"'"']id["'"'"']' "$body_file" || log_fail "/store ID switch is missing"
  grep -Eq 'data-store-theme=["'"'"']system["'"'"']' "$body_file" || log_fail "/store System theme switch is missing"
  grep -Eq 'data-store-theme=["'"'"']light["'"'"']' "$body_file" || log_fail "/store Light theme switch is missing"
  grep -Eq 'data-store-theme=["'"'"']dark["'"'"']' "$body_file" || log_fail "/store Dark theme switch is missing"
  grep -Eq 'class=["'"'"'][^"'"'"']*store-grid[^"'"'"']*["'"'"']' "$body_file" || log_fail "/store catalogue surface is missing"
  grep -Eq 'class=["'"'"']gg-sheet store-preview-sheet["'"'"']' "$body_file" || log_fail "/store preview sheet is missing"
  grep -Eq 'id=["'"'"']store-preview-dots["'"'"']' "$body_file" || log_fail "/store preview dots container is missing"
  grep -Eq 'class=["'"'"']store-preview__footer["'"'"']' "$body_file" || log_fail "/store preview footer handle container is missing"
  grep -Eq 'class=["'"'"']store-preview__handle["'"'"']' "$body_file" || log_fail "/store preview footer handle is missing"
  grep -Eq 'class=["'"'"']store-preview__secondary-actions["'"'"']' "$body_file" || log_fail "/store preview secondary actions are missing"
  grep -Eq 'id=["'"'"']store-preview-save["'"'"'][^>]*aria-pressed=["'"'"']false["'"'"']' "$body_file" || log_fail "/store Save button missing aria-pressed contract"
  grep -Eq 'id=["'"'"']store-copy-links["'"'"']' "$body_file" || log_fail "/store Copy Links button is missing"
  grep -Eq 'bookmark_remove|data-store-saved-remove-index=' "$body_file" || log_fail "/store Saved remove hook is missing"
  if grep -Eq 'store-preview__close' "$body_file"; then
    log_fail "/store preview still exposes a visible close button class"
  fi
  grep -Eq 'id=["'"'"']store-link-shopee["'"'"'][^>]*target=["'"'"']_blank["'"'"'][^>]*rel=["'"'"'][^"'"'"']*sponsored[^"'"'"']*nofollow[^"'"'"']*noopener[^"'"'"']*noreferrer[^"'"'"']*["'"'"']' "$body_file" || log_fail "/store Shopee CTA rel/target contract is missing"
  grep -Eq 'id=["'"'"']store-link-tiktok["'"'"'][^>]*target=["'"'"']_blank["'"'"'][^>]*rel=["'"'"'][^"'"'"']*sponsored[^"'"'"']*nofollow[^"'"'"']*noopener[^"'"'"']*noreferrer[^"'"'"']*["'"'"']' "$body_file" || log_fail "/store TikTok CTA rel/target contract is missing"
  grep -Eq 'id=["'"'"']store-link-tokopedia["'"'"'][^>]*target=["'"'"']_blank["'"'"'][^>]*rel=["'"'"'][^"'"'"']*sponsored[^"'"'"']*nofollow[^"'"'"']*noopener[^"'"'"']*noreferrer[^"'"'"']*["'"'"']' "$body_file" || log_fail "/store Tokopedia CTA rel/target contract is missing"
  if grep -Fq 'function readStaticProducts(' "$body_file"; then
    log_fail "/store must not inline runtime function: readStaticProducts"
  fi
  if grep -Fq 'function hydrateStaticProducts(' "$body_file"; then
    log_fail "/store must not inline runtime function: hydrateStaticProducts"
  fi
  if grep -Fq 'function loadProducts(' "$body_file"; then
    log_fail "/store must not inline runtime function: loadProducts"
  fi
  if grep -Fq 'Coba refresh katalog' "$body_file"; then
    log_fail "/store still serves stale string: Coba refresh katalog"
  fi
  if grep -Fq 'calendar_add_on' "$body_file"; then
    log_fail "/store still serves stale string: calendar_add_on"
  fi
  if grep -Fq 'Affiliate links may be used Harga' "$body_file"; then
    log_fail "/store still serves stale disclosure separator string"
  fi
  if grep -Fq 'href="wa.me/' "$body_file"; then
    log_fail "/store still serves stale non-https wa.me href"
  fi

  if [[ "$current_mode" == "production" ]]; then
    if [[ "$robots_header" == *"noindex"* || "$robots_header" == *"nofollow"* || "$robots_header" == *"nosnippet"* || "$robots_header" == *"noimageindex"* ]]; then
      log_fail "/store production header must not contain development noindex lockdown (${robots_header:-missing})"
    fi
  elif [[ "$robots_header" == *"noindex"* ]]; then
    log_info "/store non-production header still carries lockdown robots as expected (${robots_header})"
  fi

  if ! proof_output="$(node "$PROOF_TOOL" "$body_file" 2>&1)"; then
    log_fail "/store static proof failed"
    printf '%s\n' "$proof_output"
  else
    log_info "$proof_output"
  fi
}

check_diagnostic_mode_contracts() {
  local prod_headers_http="$tmp_dir/store_prod_headers.http"
  local dev_headers_http="$tmp_dir/store_dev_headers.http"
  local prod_headers_file="$tmp_dir/store_prod_headers.json"
  local dev_headers_file="$tmp_dir/store_dev_headers.json"
  local prod_slash_file="$tmp_dir/store_prod_slash_headers.json"
  local dev_slash_file="$tmp_dir/store_dev_slash_headers.json"
  local prod_robots_file="$tmp_dir/store_prod_robots.json"
  local prod_headers_meta dev_headers_meta prod_slash_meta dev_slash_meta prod_robots_meta
  local prod_mode prod_robots dev_robots prod_slash_to prod_slash_status dev_slash_status prod_robots_txt

  prod_headers_meta="$(fetch_body "/__gg/headers?url=/store&mode=production" "$prod_headers_file" "$prod_headers_http")"
  dev_headers_meta="$(fetch_body "/__gg/headers?url=/store&mode=development" "$dev_headers_file" "$dev_headers_http")"
  prod_slash_meta="$(fetch_body "/__gg/headers?url=/store/&mode=production" "$prod_slash_file")"
  dev_slash_meta="$(fetch_body "/__gg/headers?url=/store/&mode=development" "$dev_slash_file")"
  prod_robots_meta="$(fetch_body "/__gg/robots?mode=production" "$prod_robots_file")"
  log_route_timing "/__gg/headers?url=/store&mode=production" "$prod_headers_meta" "$prod_headers_http"

  if meta_is_unreachable "$prod_headers_meta"; then
    report_unreachable "/__gg/headers?url=/store&mode=production" "$prod_headers_meta"
    return
  fi

  if ! can_check_body "$prod_headers_meta" "$prod_headers_file"; then
    log_fail "/__gg/headers?url=/store&mode=production body unavailable for diagnostics"
    return
  fi

  if [[ "$(meta_status "$prod_headers_meta")" != "200" ]]; then
    log_fail "/__gg/headers?url=/store&mode=production expected status 200"
    return
  fi

  if meta_is_unreachable "$dev_headers_meta"; then
    report_unreachable "/__gg/headers?url=/store&mode=development" "$dev_headers_meta"
    return
  fi

  if meta_is_unreachable "$prod_slash_meta"; then
    report_unreachable "/__gg/headers?url=/store/&mode=production" "$prod_slash_meta"
    return
  fi

  if meta_is_unreachable "$dev_slash_meta"; then
    report_unreachable "/__gg/headers?url=/store/&mode=development" "$dev_slash_meta"
    return
  fi

  if meta_is_unreachable "$prod_robots_meta"; then
    report_unreachable "/__gg/robots?mode=production" "$prod_robots_meta"
    return
  fi

  prod_mode="$(json_field "$prod_headers_file" "mode" || true)"
  prod_robots="$(json_field "$prod_headers_file" "robots" || true)"
  dev_robots="$(json_field "$dev_headers_file" "robots" || true)"
  prod_slash_to="$(json_field "$prod_slash_file" "redirects.to" || true)"
  prod_slash_status="$(json_field "$prod_slash_file" "redirects.status" || true)"
  dev_slash_status="$(json_field "$dev_slash_file" "redirects.status" || true)"
  prod_robots_txt="$(json_field "$prod_robots_file" "robotsTxt" || true)"

  [[ "$prod_mode" == "production" ]] || log_fail "production diagnostics preview did not report mode=production"

  if [[ "$prod_robots" == *"noindex"* || "$prod_robots" == *"nofollow"* || "$prod_robots" == *"nosnippet"* || "$prod_robots" == *"noimageindex"* || "$prod_robots" == *"max-snippet:0"* || "$prod_robots" == *"max-image-preview:none"* ]]; then
    log_fail "production diagnostics preview for /store is not indexable (${prod_robots:-missing})"
  else
    log_info "PASS: production diagnostics preview for /store is indexable (${prod_robots:-missing})"
  fi

  if [[ "$dev_robots" == *"noindex"* ]]; then
    log_info "PASS: development diagnostics preview for /store keeps lockdown robots (${dev_robots})"
  else
    log_warn "development diagnostics preview for /store no longer shows the expected noindex guard (${dev_robots:-missing})"
  fi

  if [[ "$current_mode" != "production" ]]; then
    log_warn "current deployment mode is ${current_mode:-unknown}; production /store indexability result is simulated via diagnostics"
  fi

  if [[ "$prod_slash_status" != "301" && "$prod_slash_status" != "308" ]]; then
    log_fail "production diagnostics preview for /store/ must redirect with 301 or 308 (got ${prod_slash_status:-missing})"
  fi

  if [[ "$prod_slash_to" != "https://www.pakrpp.com/store" && "$prod_slash_to" != "/store" ]]; then
    log_fail "production diagnostics preview for /store/ redirects to unexpected target (${prod_slash_to:-missing})"
  fi

  if [[ -n "$dev_slash_status" && "$dev_slash_status" != "301" && "$dev_slash_status" != "302" && "$dev_slash_status" != "308" ]]; then
    log_warn "development diagnostics preview for /store/ is not redirecting to /store yet (status=${dev_slash_status})"
  fi

  if [[ "$prod_robots_txt" != *"User-agent: OAI-SearchBot"$'\n'"Allow: /"* ]]; then
    log_fail "production robots preview must explicitly allow OAI-SearchBot"
  fi
  if [[ "$prod_robots_txt" != *"User-agent: Googlebot"$'\n'"Allow: /"* ]]; then
    log_fail "production robots preview must explicitly allow Googlebot"
  fi

  log_info "diagnostic preview production /store robots=${prod_robots:-missing}"
  log_info "diagnostic preview production /store/ redirect=${prod_slash_status:-missing} -> ${prod_slash_to:-missing}"
}

check_store_redirect() {
  local path="$1"
  local headers_file="$tmp_dir$(printf '%s' "$path" | tr '/.' '__').headers.txt"
  local meta status location

  meta="$(fetch_headers_nofollow "$path" "$headers_file")"
  status="$(meta_status "$meta")"
  location="$(extract_header_value "$headers_file" "location")"

  if meta_is_unreachable "$meta"; then
    report_unreachable "$path" "$meta"
    return
  fi

  if [[ "$status" != "301" && "$status" != "302" && "$status" != "308" ]]; then
    log_fail "${path} did not return redirect status (got ${status:-000})"
    return
  fi

  if [[ "$location" != "${BASE_URL}/store" && "$location" != "/store" ]]; then
    log_fail "${path} redirect location is unexpected (${location:-missing})"
  fi
}

check_store_slash_redirect_live() {
  local headers_file="$tmp_dir/store_slash_live.headers.txt"
  local meta status location

  meta="$(fetch_headers_nofollow "/store/" "$headers_file")"
  status="$(meta_status "$meta")"
  location="$(extract_header_value "$headers_file" "location")"

  if meta_is_unreachable "$meta"; then
    report_unreachable "/store/" "$meta"
    return
  fi

  if [[ "$status" == "301" || "$status" == "302" || "$status" == "308" ]]; then
    if [[ "$location" != "${BASE_URL}/store" && "$location" != "/store" ]]; then
      log_fail "/store/ redirect location is unexpected (${location:-missing})"
    fi
    return
  fi

  if [[ "$current_mode" == "production" ]]; then
    log_fail "/store/ must redirect to /store in production mode (got ${status:-000})"
  else
    log_warn "/store/ is not redirecting in ${current_mode:-non-production} mode yet (got ${status:-000})"
  fi
}

printf 'SMOKE-WORKER lane=LIVE base=%s\n' "$BASE_URL"

check_root_headers
check_flags_endpoint
check_sw_asset
check_landing_route
check_landing_html_redirect
check_store_route
check_store_split_assets
check_diagnostic_mode_contracts
check_store_slash_redirect_live
check_store_redirect "/store.html"
check_store_redirect "/yellowcart"
check_store_redirect "/yellowcart.html"
check_store_redirect "/yellowcard"
check_store_redirect "/yellowcard.html"

if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  {
    echo "### Worker-Scope Smoke"
    echo "- Base URL: \`${BASE_URL}\`"
    echo "- Root template contract: \`${root_contract}\`"
    echo "- Root template contract reasons: \`${root_contract_reasons}\`"
    echo "- Failures: \`${failures}\`"
    echo "- Warnings: \`${warnings}\`"
  } >> "$GITHUB_STEP_SUMMARY"
fi

if [[ "$failures" -gt 0 ]]; then
  printf 'LIVE SMOKE WORKER RESULT: FAILED (%s)\n' "$failures" >&2
  exit 1
fi

if [[ "$warnings" -gt 0 ]]; then
  printf 'LIVE SMOKE WORKER RESULT: PASS_WITH_WARNINGS (%s)\n' "$warnings"
  exit 0
fi

printf 'LIVE SMOKE WORKER RESULT: PASS\n'
