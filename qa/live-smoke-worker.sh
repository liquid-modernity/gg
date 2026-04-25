#!/usr/bin/env bash
set -euo pipefail

export LC_ALL=C

BASE_URL="${1:-https://www.pakrpp.com}"
BASE_URL="${BASE_URL%/}"
UA="Mozilla/5.0 (gg-live-smoke-worker)"
EXPECTED_WORKER_VERSION="$(printf '%s' "${GG_EXPECTED_WORKER_VERSION:-}" | tr '[:upper:]' '[:lower:]' | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"

if [[ -z "$EXPECTED_WORKER_VERSION" ]]; then
  EXPECTED_WORKER_VERSION="$(node -e "const fs=require('node:fs');const s=fs.readFileSync('worker.js','utf8');const m=s.match(/const\\s+WORKER_VERSION\\s*=\\s*(['\\\"])([^'\\\"]+)\\1/);if(m&&m[2])process.stdout.write(String(m[2]).trim().toLowerCase());")"
fi

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

failures=0
warnings=0
worker_ping_version="missing"
worker_root_version="missing"

log_fail() {
  failures=$((failures + 1))
  printf 'FAIL: %s\n' "$1" >&2
}

log_warn() {
  warnings=$((warnings + 1))
  printf 'WARN: %s\n' "$1" >&2
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

check_worker_ping() {
  local headers_file="$tmp_dir/ping_headers.txt"
  local meta status worker_header version_header
  meta="$(fetch_headers "/__gg_worker_ping" "$headers_file")"
  status="$(printf '%s' "$meta" | cut -d'|' -f2)"
  worker_header="$(extract_header_value "$headers_file" "x-gg-worker" | tr '[:upper:]' '[:lower:]')"
  version_header="$(extract_header_value "$headers_file" "x-gg-worker-version" | tr '[:upper:]' '[:lower:]')"

  if [[ "$status" != "200" ]]; then
    log_fail "/__gg_worker_ping expected status 200 (got ${status:-000})"
  fi
  if [[ "$worker_header" != "proxy" ]]; then
    log_fail "/__gg_worker_ping missing x-gg-worker=proxy"
  fi
  if [[ -z "$version_header" ]]; then
    log_fail "/__gg_worker_ping missing x-gg-worker-version"
  else
    worker_ping_version="$version_header"
  fi
  if [[ -n "$EXPECTED_WORKER_VERSION" && -n "$version_header" && "$version_header" != "$EXPECTED_WORKER_VERSION" ]]; then
    log_fail "/__gg_worker_ping version mismatch expected=${EXPECTED_WORKER_VERSION} observed=${version_header}"
  fi
}

check_root_headers() {
  local headers_file="$tmp_dir/root_headers.txt"
  local meta status version_header
  meta="$(fetch_headers "/" "$headers_file")"
  status="$(printf '%s' "$meta" | cut -d'|' -f2)"
  version_header="$(extract_header_value "$headers_file" "x-gg-worker-version" | tr '[:upper:]' '[:lower:]')"

  if [[ "$status" != "200" ]]; then
    log_fail "/ expected status 200 (got ${status:-000})"
  fi
  if [[ -z "$version_header" ]]; then
    log_fail "/ missing x-gg-worker-version"
  else
    worker_root_version="$version_header"
  fi
  if [[ "$worker_ping_version" != "missing" && -n "$version_header" && "$worker_ping_version" != "$version_header" ]]; then
    log_fail "worker version header mismatch between /__gg_worker_ping and /"
  fi
}

check_flags_endpoint() {
  local flags_file="$tmp_dir/flags.json"
  local meta status
  meta="$(fetch_body "/gg-flags.json" "$flags_file")"
  status="$(printf '%s' "$meta" | cut -d'|' -f2)"

  if [[ "$status" != "200" ]]; then
    log_fail "/gg-flags.json expected status 200 (got ${status:-000})"
  elif ! grep -q "\"release\"" "$flags_file"; then
    log_warn "/gg-flags.json missing release field"
  fi
}

check_sw_asset() {
  local headers_file="$tmp_dir/sw_headers.txt"
  local meta status
  meta="$(fetch_headers "/sw.js" "$headers_file")"
  status="$(printf '%s' "$meta" | cut -d'|' -f2)"

  if [[ "$status" != "200" ]]; then
    log_fail "/sw.js expected status 200 (got ${status:-000})"
  fi
}

printf 'SMOKE-WORKER lane=WORKER_SCOPE base=%s\n' "$BASE_URL"
printf 'SMOKE-WORKER expected-worker-version=%s\n' "${EXPECTED_WORKER_VERSION:-unset}"

check_worker_ping
check_root_headers
check_flags_endpoint
check_sw_asset

if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  {
    echo "### Worker-Scope Smoke"
    echo "- Base URL: \`${BASE_URL}\`"
    echo "- Expected worker version: \`${EXPECTED_WORKER_VERSION:-unset}\`"
    echo "- Observed ping version: \`${worker_ping_version}\`"
    echo "- Observed root version: \`${worker_root_version}\`"
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
