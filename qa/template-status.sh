#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-${GG_LIVE_BASE_URL:-https://www.pakrpp.com}}"
BASE_URL="${BASE_URL%/}"
UA="Mozilla/5.0 (gg-template-status)"

tmp_file="$(mktemp)"
trap 'rm -f "$tmp_file"' EXIT

extract_template_fingerprint() {
  local file="$1"
  local value=""
  value="$(node qa/template-fingerprint.mjs --extract-live --file "$file" 2>/dev/null || true)"
  if [[ -n "$value" ]]; then
    printf '%s|%s' "$value" "#gg-fingerprint[data-gg-template-fingerprint]"
    return 0
  fi
  printf '%s|%s' "" "missing"
}

repo_expected="$(node qa/template-fingerprint.mjs --value 2>/dev/null || true)"
repo_embedded="$(node qa/template-fingerprint.mjs --embedded 2>/dev/null || true)"

if [[ -z "$repo_expected" || -z "$repo_embedded" ]]; then
  printf 'TEMPLATE STATUS: ERROR (unable to read repo fingerprint)\n' >&2
  exit 2
fi

meta=""
attempt=1
max_attempts=3
while (( attempt <= max_attempts )); do
  if meta="$(curl -sS -L \
    --http1.1 \
    --connect-timeout 15 \
    --max-time 60 \
    -A "$UA" \
    -o "$tmp_file" \
    -w '%{url_effective}|%{http_code}' \
    "${BASE_URL}/")"; then
    break
  fi
  if (( attempt < max_attempts )); then
    sleep $((attempt * 2))
  fi
  attempt=$((attempt + 1))
done

final_url="${meta%%|*}"
status="${meta##*|}"

if [[ "$status" != "200" ]]; then
  printf 'TEMPLATE STATUS: ERROR (fetch failed final=%s status=%s)\n' "$final_url" "$status" >&2
  exit 3
fi

live_pair="$(extract_template_fingerprint "$tmp_file")"
live_observed="${live_pair%%|*}"
live_carrier="${live_pair##*|}"

state="UNKNOWN"
note="Template state unavailable."
exit_code=2

if [[ "$repo_expected" != "$repo_embedded" ]]; then
  state="REPO_STALE"
  note="Repo marker stale. Run: node qa/template-fingerprint.mjs --write"
  exit_code=2
elif [[ -z "$live_observed" ]]; then
  state="MISSING"
  note="Live template marker missing. Manual Blogger template publish required."
  exit_code=2
elif [[ "$live_observed" == "$repo_expected" ]]; then
  state="MATCH"
  note="Blogger template fingerprint parity verified."
  exit_code=0
else
  state="DRIFT"
  note="Live template drift detected. Manual Blogger template publish required."
  exit_code=2
fi

printf 'TEMPLATE STATUS\n'
printf 'base_url=%s\n' "$BASE_URL"
printf 'final_url=%s\n' "$final_url"
printf 'repo_expected=%s\n' "$repo_expected"
printf 'repo_embedded=%s\n' "$repo_embedded"
printf 'live_observed=%s\n' "${live_observed:-missing}"
printf 'live_carrier=%s\n' "$live_carrier"
printf 'state=%s\n' "$state"
printf 'note=%s\n' "$note"

exit "$exit_code"
