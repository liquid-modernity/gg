#!/usr/bin/env bash
set -euo pipefail

export LC_ALL=C

BASE_URL="${1:-https://www.pakrpp.com}"
BASE_URL="${BASE_URL%/}"
UA="Mozilla/5.0 (gg-live-smoke-worker)"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

failures=0
warnings=0
root_contract="missing"
root_contract_reasons="missing"

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

fetch_headers() {
  local path="$1"
  local out_headers="$2"
  local target="${BASE_URL}${path}"
  local meta=""

  if meta="$(curl -sS -L \
    --http1.1 \
    --connect-timeout 15 \
    --max-time 60 \
    --max-redirs 10 \
    -A "$UA" \
    -D "$out_headers" \
    -o /dev/null \
    -w '%{url_effective}|%{http_code}|%{num_redirects}' \
    "$target")"; then
    printf '%s\n' "$meta"
    return 0
  fi

  : > "$out_headers"
  printf '%s|000|0\n' "$target"
  return 0
}

fetch_body() {
  local path="$1"
  local out_file="$2"
  local target="${BASE_URL}${path}"
  local meta=""

  if meta="$(curl -sS -L \
    --http1.1 \
    --connect-timeout 15 \
    --max-time 60 \
    --max-redirs 10 \
    -A "$UA" \
    -o "$out_file" \
    -w '%{url_effective}|%{http_code}|%{num_redirects}' \
    "$target")"; then
    printf '%s\n' "$meta"
    return 0
  fi

  : > "$out_file"
  printf '%s|000|0\n' "$target"
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
  status="$(printf '%s' "$meta" | cut -d'|' -f2)"

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
    fetch_body "/" "$body_file" >/dev/null
    grep -qi 'id=.gg-shell.' "$body_file" || log_warn "/ body diagnostic: gg-shell marker not found"
    grep -qi 'id=.main.' "$body_file" || log_warn "/ body diagnostic: main landmark marker not found"
    grep -qi 'id=.gg-dock.' "$body_file" || log_warn "/ body diagnostic: gg-dock marker not found"
    grep -qi 'id=.gg-command-panel.' "$body_file" || log_warn "/ body diagnostic: gg-command-panel marker not found"
    grep -qi 'id=.gg-preview-sheet.' "$body_file" || log_warn "/ body diagnostic: gg-preview-sheet marker not found"
    grep -qi 'id=.gg-more-panel.' "$body_file" || log_warn "/ body diagnostic: gg-more-panel marker not found"
  fi
}

check_flags_endpoint() {
  local flags_file="$tmp_dir/flags.json"
  local meta status
  meta="$(fetch_body "/flags.json" "$flags_file")"
  status="$(printf '%s' "$meta" | cut -d'|' -f2)"

  if [[ "$status" != "200" ]]; then
    log_fail "/flags.json expected status 200 (got ${status:-000})"
    return
  fi

  if ! grep -q '"sw"' "$flags_file"; then
    log_warn "/flags.json missing sw field"
  fi

  if ! grep -q '"mode"' "$flags_file"; then
    log_warn "/flags.json missing mode field"
  fi
}

check_sw_asset() {
  local headers_file="$tmp_dir/sw_headers.txt"
  local meta status content_type
  meta="$(fetch_headers "/sw.js" "$headers_file")"
  status="$(printf '%s' "$meta" | cut -d'|' -f2)"
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
  status="$(printf '%s' "$meta" | cut -d'|' -f2)"

  if [[ "$status" != "200" ]]; then
    log_fail "/landing expected status 200 (got ${status:-000})"
  fi
}

check_landing_html_redirect() {
  local headers_file="$tmp_dir/landing_html_headers.txt"
  local target="${BASE_URL}/landing.html"
  local status location

  curl -sS \
    --http1.1 \
    --connect-timeout 15 \
    --max-time 60 \
    --max-redirs 0 \
    -A "$UA" \
    -D "$headers_file" \
    -o /dev/null \
    "$target" || true

  status="$(awk 'toupper($1) ~ /^HTTP\/[0-9.]+$/ { code=$2 } END { print code }' "$headers_file")"
  location="$(extract_header_value "$headers_file" "location")"

  if [[ "$status" != "301" && "$status" != "302" && "$status" != "308" ]]; then
    log_warn "/landing.html did not return redirect status (got ${status:-000})"
    return
  fi

  if [[ "$location" != "${BASE_URL}/landing" && "$location" != "/landing" ]]; then
    log_warn "/landing.html redirect location is unexpected (${location:-missing})"
  fi
}

check_store_route() {
  local body_file="$tmp_dir/store_body.html"
  local meta final status
  meta="$(fetch_body "/store" "$body_file")"
  final="$(printf '%s' "$meta" | cut -d'|' -f1)"
  status="$(printf '%s' "$meta" | cut -d'|' -f2)"

  if [[ "$status" != "200" ]]; then
    log_fail "/store expected status 200 (got ${status:-000})"
    return
  fi

  if [[ "$final" != "${BASE_URL}/store" ]]; then
    log_fail "/store final URL is unexpected (${final:-missing})"
  fi

  grep -Eq '<title>\s*Yellow Cart · PakRPP\s*</title>' "$body_file" || log_fail "/store missing canonical title"
  grep -Eq 'rel=["'"'"']canonical["'"'"'][^>]*href=["'"'"']https://www\.pakrpp\.com/store["'"'"']' "$body_file" || log_fail "/store missing canonical /store"
  grep -Eq '<h1[^>]*>\s*Yellow Cart\s*</h1>' "$body_file" || log_fail "/store missing H1 Yellow Cart"
  grep -Eq 'href=["'"'"']/store["'"'"'][^>]*aria-current=["'"'"']page["'"'"']|aria-current=["'"'"']page["'"'"'][^>]*href=["'"'"']/store["'"'"']' "$body_file" || log_fail "/store dock current item is not Store"
  grep -Eq 'id=["'"'"']store-contact-link["'"'"'][^>]*href=["'"'"']/store#contact["'"'"']' "$body_file" || log_fail "/store contact dock href is not /store#contact"
  grep -Eq '<a[^>]*class=["'"'"'][^"'"'"']*gg-dock__item[^"'"'"']*["'"'"'][^>]*href=["'"'"']/["'"'"']' "$body_file" || log_fail "/store blog dock href is not /"
  grep -Eq 'id=["'"'"']store-dock-search["'"'"']' "$body_file" || log_fail "/store search trigger is missing"
  grep -Eq 'id=["'"'"']store-more-open["'"'"']' "$body_file" || log_fail "/store more trigger is missing"
  grep -Eq 'data-store-lang=["'"'"']en["'"'"']' "$body_file" || log_fail "/store EN switch is missing"
  grep -Eq 'data-store-lang=["'"'"']id["'"'"']' "$body_file" || log_fail "/store ID switch is missing"
  grep -Eq 'data-store-theme=["'"'"']system["'"'"']' "$body_file" || log_fail "/store System theme switch is missing"
  grep -Eq 'data-store-theme=["'"'"']light["'"'"']' "$body_file" || log_fail "/store Light theme switch is missing"
  grep -Eq 'data-store-theme=["'"'"']dark["'"'"']' "$body_file" || log_fail "/store Dark theme switch is missing"
  grep -Eq -- '--store-card-aspect:\s*4 / 5;' "$body_file" || log_fail "/store 4:5 card aspect token is missing"
  grep -Eq 'aspect-ratio:\s*var\(--store-card-aspect\)' "$body_file" || log_fail "/store card aspect-ratio rule is missing"
}

check_store_redirect() {
  local path="$1"
  local headers_file="$tmp_dir$(printf '%s' "$path" | tr '/.' '__').headers.txt"
  local target="${BASE_URL}${path}"
  local status location

  curl -sS \
    --http1.1 \
    --connect-timeout 15 \
    --max-time 60 \
    --max-redirs 0 \
    -A "$UA" \
    -D "$headers_file" \
    -o /dev/null \
    "$target" || true

  status="$(awk 'toupper($1) ~ /^HTTP\/[0-9.]+$/ { code=$2 } END { print code }' "$headers_file")"
  location="$(extract_header_value "$headers_file" "location")"

  if [[ "$status" != "301" && "$status" != "302" && "$status" != "308" ]]; then
    log_fail "${path} did not return redirect status (got ${status:-000})"
    return
  fi

  if [[ "$location" != "${BASE_URL}/store" && "$location" != "/store" ]]; then
    log_fail "${path} redirect location is unexpected (${location:-missing})"
  fi
}

printf 'SMOKE-WORKER lane=WORKER_SCOPE base=%s\n' "$BASE_URL"

check_root_headers
check_flags_endpoint
check_sw_asset
check_landing_route
check_landing_html_redirect
check_store_route
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
