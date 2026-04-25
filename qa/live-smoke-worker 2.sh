#!/usr/bin/env bash
set -euo pipefail

export LC_ALL=C

BASE_URL="${1:-https://www.pakrpp.com}"
BASE_URL="${BASE_URL%/}"
UA="Mozilla/5.0 (gg-live-smoke-worker)"
EXPECTED_WORKER_VERSION="$(printf '%s' "${GG_EXPECTED_WORKER_VERSION:-}" | tr '[:upper:]' '[:lower:]' | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"

if [[ -z "$EXPECTED_WORKER_VERSION" ]]; then
  EXPECTED_WORKER_VERSION="$(node -e "const fs=require('node:fs');const s=fs.readFileSync('src/worker.js','utf8');const m=s.match(/const\\s+WORKER_VERSION\\s*=\\s*(['\\\"])([^'\\\"]+)\\1/);if(m&&m[2])process.stdout.write(String(m[2]).trim().toLowerCase());")"
fi

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

failures=0
warnings=0
worker_ping_version="missing"
worker_root_version="missing"
worker_scope_state="worker_scope_not_verified"
worker_scope_note="Worker-scope checks did not run."

printf 'SMOKE-WORKER lane=WORKER_SCOPE base=%s\n' "$BASE_URL"
printf 'SMOKE-WORKER expected-worker-version=%s\n' "${EXPECTED_WORKER_VERSION:-unset}"
printf 'SMOKE-WORKER classify=WORKER_SCOPE check=worker_ping\n'
printf 'SMOKE-WORKER classify=WORKER_SCOPE check=edge_headers_on_root\n'
printf 'SMOKE-WORKER classify=WORKER_SCOPE check=representative_html_routes\n'
printf 'SMOKE-WORKER classify=WORKER_SCOPE check=versioned_assets\n'
printf 'SMOKE-WORKER classify=WORKER_SCOPE check=worker_static_endpoints\n'

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

  printf 'SMOKE-WORKER ping status=%s worker=%s version=%s\n' "${status:-000}" "${worker_header:-missing}" "${version_header:-missing}"

  if [[ "$status" != "200" ]]; then
    log_fail "/__gg_worker_ping expected status 200 (got ${status:-000})"
  fi
  if [[ "$worker_header" != "proxy" ]]; then
    log_fail "/__gg_worker_ping missing worker stamp x-gg-worker=proxy"
  fi
  if [[ -z "$version_header" ]]; then
    log_fail "/__gg_worker_ping missing x-gg-worker-version header"
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

  printf 'SMOKE-WORKER root status=%s version=%s\n' "${status:-000}" "${version_header:-missing}"

  if [[ "$status" != "200" ]]; then
    log_fail "/ expected status 200 (got ${status:-000})"
  fi
  if [[ -z "$version_header" ]]; then
    log_fail "/ missing x-gg-worker-version header"
  else
    worker_root_version="$version_header"
  fi
  if [[ -n "$worker_ping_version" && "$worker_ping_version" != "missing" && -n "$version_header" && "$worker_ping_version" != "$version_header" ]]; then
    log_fail "worker version header mismatch between /__gg_worker_ping and /"
  fi
}

check_html_routes() {
  local routes=(
    "/landing"
    "/search"
    "/search/label/Store"
    "/2026/02/todo.html"
    "/p/library.html"
  )
  local route headers_file meta status version_header safe_name

  for route in "${routes[@]}"; do
    safe_name="$(printf '%s' "$route" | tr -c '[:alnum:]' '_')"
    headers_file="$tmp_dir/html_${safe_name}_headers.txt"
    meta="$(fetch_headers "$route" "$headers_file")"
    status="$(printf '%s' "$meta" | cut -d'|' -f2)"
    version_header="$(extract_header_value "$headers_file" "x-gg-worker-version" | tr '[:upper:]' '[:lower:]')"

    printf 'SMOKE-WORKER html path=%s status=%s version=%s\n' "$route" "${status:-000}" "${version_header:-missing}"

    if [[ "$status" != "200" ]]; then
      log_fail "${route} expected status 200 (got ${status:-000})"
    fi
    if [[ -z "$version_header" ]]; then
      log_fail "${route} missing x-gg-worker-version header"
    elif [[ -n "$worker_ping_version" && "$worker_ping_version" != "missing" && "$worker_ping_version" != "$version_header" ]]; then
      log_fail "worker version header mismatch between /__gg_worker_ping and ${route}"
    fi
  done
}

check_versioned_assets() {
  local release="${EXPECTED_WORKER_VERSION:-}"
  if [[ -z "$release" || "$release" == "missing" ]]; then
    if [[ "$worker_ping_version" != "missing" ]]; then
      release="$worker_ping_version"
    elif [[ "$worker_root_version" != "missing" ]]; then
      release="$worker_root_version"
    fi
  fi

  if [[ -z "$release" || "$release" == "missing" ]]; then
    log_fail "unable to resolve worker release for asset checks"
    return
  fi

  local headers_boot="$tmp_dir/assets_boot_headers.txt"
  local headers_app="$tmp_dir/assets_app_headers.txt"
  local meta_boot status_boot meta_app status_app
  meta_boot="$(fetch_headers "/assets/v/${release}/boot.js" "$headers_boot")"
  status_boot="$(printf '%s' "$meta_boot" | cut -d'|' -f2)"
  meta_app="$(fetch_headers "/assets/v/${release}/app.js" "$headers_app")"
  status_app="$(printf '%s' "$meta_app" | cut -d'|' -f2)"

  printf 'SMOKE-WORKER assets release=%s boot=%s app=%s\n' "$release" "${status_boot:-000}" "${status_app:-000}"

  if [[ "$status_boot" != "200" ]]; then
    log_fail "/assets/v/${release}/boot.js expected status 200 (got ${status_boot:-000})"
  fi
  if [[ "$status_app" != "200" ]]; then
    log_fail "/assets/v/${release}/app.js expected status 200 (got ${status_app:-000})"
  fi
}

check_worker_endpoints() {
  local route_file="$tmp_dir/route_test.txt"
  local flags_file="$tmp_dir/flags.json"
  local meta_route meta_flags status_route status_flags
  meta_route="$(fetch_body "/__gg_route_test" "$route_file")"
  status_route="$(printf '%s' "$meta_route" | cut -d'|' -f2)"
  meta_flags="$(fetch_body "/gg-flags.json" "$flags_file")"
  status_flags="$(printf '%s' "$meta_flags" | cut -d'|' -f2)"

  printf 'SMOKE-WORKER endpoints route_test=%s flags=%s\n' "${status_route:-000}" "${status_flags:-000}"

  if [[ "$status_route" != "200" ]]; then
    log_fail "/__gg_route_test expected status 200 (got ${status_route:-000})"
  elif ! grep -q "ROUTE_OK" "$route_file"; then
    log_fail "/__gg_route_test missing ROUTE_OK marker"
  fi

  if [[ "$status_flags" != "200" ]]; then
    log_fail "/gg-flags.json expected status 200 (got ${status_flags:-000})"
  elif ! grep -q "\"release\"" "$flags_file"; then
    log_warn "/gg-flags.json missing release field"
  fi
}

check_worker_ping
check_root_headers
check_html_routes
check_versioned_assets
check_worker_endpoints

if [[ "$failures" -gt 0 ]]; then
  worker_scope_state="worker_scope_failed"
  worker_scope_note="Worker-scope hard gate failed."
else
  worker_scope_state="worker_scope_passed"
  worker_scope_note="Worker-scope hard gate passed."
fi

printf 'SMOKE-WORKER state=%s note=%s failures=%s warnings=%s\n' "$worker_scope_state" "$worker_scope_note" "$failures" "$warnings"

if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  {
    echo "### Worker-Scope Smoke"
    echo "- State: \`${worker_scope_state}\`"
    echo "- Note: ${worker_scope_note}"
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
