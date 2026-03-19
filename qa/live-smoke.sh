#!/usr/bin/env bash
set -euo pipefail

export LC_ALL=C

BASE_URL="${1:-https://www.pakrpp.com}"
BASE_URL="${BASE_URL%/}"
UA="Mozilla/5.0 (gg-live-smoke)"
TEMPLATE_DRIFT_MODE="${GG_TEMPLATE_DRIFT_MODE:-warn}"
TEMPLATE_CHANGED_IN_REV="${GG_TEMPLATE_CHANGED_IN_REV:-0}"
EXPECTED_WORKER_VERSION="$(printf '%s' "${GG_EXPECTED_WORKER_VERSION:-}" | tr '[:upper:]' '[:lower:]' | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
WORKER_VERSION_MODE="${GG_WORKER_VERSION_MODE:-off}"
WORKER_VERSION_CHECK_PATH="${GG_WORKER_VERSION_CHECK_PATH:-/__gg_worker_ping}"
WORKER_ROLLOUT_MAX_ATTEMPTS="${GG_WORKER_ROLLOUT_MAX_ATTEMPTS:-12}"
WORKER_ROLLOUT_BACKOFF_SECONDS="${GG_WORKER_ROLLOUT_BACKOFF_SECONDS:-5}"
COMMENTS_TARGET_PATH_0="${GG_COMMENTS_TARGET_PATH_0:-/2026/02/todo.html}"
COMMENTS_TARGET_PATH_2="${GG_COMMENTS_TARGET_PATH_2:-/2025/10/in-night-we-stand-in-day-we-fight.html}"
COMMENTS_TARGET_PATH_16="${GG_COMMENTS_TARGET_PATH_16:-/2025/10/tes-2.html}"
COMMENTS_OWNER_BROWSER_MODE="${GG_COMMENTS_OWNER_BROWSER_MODE:-warn}"
PLAYWRIGHT_EXECUTABLE_PATH="${GG_PLAYWRIGHT_EXECUTABLE_PATH:-}"

if [[ "$TEMPLATE_DRIFT_MODE" != "warn" && "$TEMPLATE_DRIFT_MODE" != "fail" ]]; then
  TEMPLATE_DRIFT_MODE="warn"
fi
if [[ "$WORKER_VERSION_MODE" != "off" && "$WORKER_VERSION_MODE" != "warn" && "$WORKER_VERSION_MODE" != "fail" ]]; then
  WORKER_VERSION_MODE="off"
fi
if [[ "$COMMENTS_OWNER_BROWSER_MODE" != "off" && "$COMMENTS_OWNER_BROWSER_MODE" != "warn" && "$COMMENTS_OWNER_BROWSER_MODE" != "fail" ]]; then
  COMMENTS_OWNER_BROWSER_MODE="warn"
fi
if ! [[ "$WORKER_ROLLOUT_MAX_ATTEMPTS" =~ ^[0-9]+$ ]] || (( WORKER_ROLLOUT_MAX_ATTEMPTS < 1 )); then
  WORKER_ROLLOUT_MAX_ATTEMPTS=12
fi
if ! [[ "$WORKER_ROLLOUT_BACKOFF_SECONDS" =~ ^[0-9]+$ ]] || (( WORKER_ROLLOUT_BACKOFF_SECONDS < 1 )); then
  WORKER_ROLLOUT_BACKOFF_SECONDS=5
fi

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

failures=0
warnings=0
worker_rollout_state="worker_assets_rollout_not_checked"
worker_rollout_note="Worker rollout check not requested."
worker_live_version="unknown"
worker_rollout_final_url=""
template_release_state="blogger_template_parity_unknown"
template_release_note="Template release state not evaluated."

printf 'SMOKE scope: public-domain contract check only.\n'
printf 'SMOKE scope: CI/CD deploy path updates Cloudflare Worker/assets, not Blogger template publish.\n'
printf 'SMOKE scope: template drift mode=%s changed_in_rev=%s.\n' "$TEMPLATE_DRIFT_MODE" "$TEMPLATE_CHANGED_IN_REV"
printf 'SMOKE scope: worker rollout mode=%s expected_version=%s check_path=%s attempts=%s backoff=%ss.\n' \
  "$WORKER_VERSION_MODE" "${EXPECTED_WORKER_VERSION:-unset}" "$WORKER_VERSION_CHECK_PATH" "$WORKER_ROLLOUT_MAX_ATTEMPTS" "$WORKER_ROLLOUT_BACKOFF_SECONDS"

log_fail() {
  failures=$((failures + 1))
  printf 'FAIL: %s\n' "$1" >&2
}

log_warn() {
  warnings=$((warnings + 1))
  printf 'WARN: %s\n' "$1" >&2
}

to_path() {
  local value="$1"
  value="${value%%#*}"
  if [[ "$value" =~ ^https?:// ]]; then
    value="$(printf '%s' "$value" | sed -E 's#^https?://[^/]+##')"
  fi
  if [[ -z "$value" ]]; then
    value="/"
  fi
  if [[ "${value:0:1}" != "/" ]]; then
    value="/${value}"
  fi
  printf '%s' "$value"
}

absolute_for_path() {
  local path
  path="$(to_path "$1")"
  printf '%s%s' "$BASE_URL" "$path"
}

safe_file_name() {
  local value="$1"
  value="$(printf '%s' "$value" | sed -E 's#[^A-Za-z0-9._-]#_#g')"
  if [[ -z "$value" ]]; then
    value="root"
  fi
  printf '%s' "$value"
}

fetch_page() {
  local path_or_url="$1"
  local out_file="$2"
  local target
  local meta
  local attempt=1
  local max_attempts=3
  if [[ "$path_or_url" =~ ^https?:// ]]; then
    target="$path_or_url"
  else
    target="${BASE_URL}${path_or_url}"
  fi

  while (( attempt <= max_attempts )); do
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
    if (( attempt < max_attempts )); then
      sleep $((attempt * 2))
    fi
    attempt=$((attempt + 1))
  done

  printf 'FAIL: fetch error for %s\n' "$target" >&2
  : > "$out_file"
  printf '%s|000|0\n' "$target"
  return 0
}

fetch_headers() {
  local path_or_url="$1"
  local out_headers="$2"
  local target
  local meta
  local attempt=1
  local max_attempts=3
  if [[ "$path_or_url" =~ ^https?:// ]]; then
    target="$path_or_url"
  else
    target="${BASE_URL}${path_or_url}"
  fi

  while (( attempt <= max_attempts )); do
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
    if (( attempt < max_attempts )); then
      sleep $((attempt * 2))
    fi
    attempt=$((attempt + 1))
  done

  : > "$out_headers"
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

worker_rollout_signal() {
  local message="$1"
  if [[ "$WORKER_VERSION_MODE" == "fail" ]]; then
    log_fail "$message"
  else
    log_warn "$message"
  fi
  if [[ "${GITHUB_ACTIONS:-}" == "true" ]]; then
    printf '::warning title=Worker rollout pending::%s\n' "$message"
  fi
}

comments_owner_signal() {
  local message="$1"
  if template_publish_pending; then
    log_warn "$message"
    return
  fi
  if [[ "$COMMENTS_OWNER_BROWSER_MODE" == "fail" ]]; then
    log_fail "$message"
  else
    log_warn "$message"
  fi
}

template_publish_pending() {
  if ! is_truthy "$TEMPLATE_CHANGED_IN_REV"; then
    return 1
  fi
  [[ "$template_release_state" != "blogger_template_parity_verified" && "$template_release_state" != "blogger_template_parity_unknown" ]]
}

detail_contract_signal() {
  local message="$1"
  if template_publish_pending; then
    log_warn "$message"
  else
    log_fail "$message"
  fi
}

check_worker_rollout() {
  local headers_file="$tmp_dir/$(safe_file_name "worker_rollout_headers").txt"
  local root_headers_file="$tmp_dir/$(safe_file_name "worker_rollout_root_headers").txt"
  local attempt=1
  local meta=""
  local meta_root=""
  local status=""
  local status_root=""
  local final_url=""
  local final_url_root=""
  local observed=""
  local observed_root=""
  local expected=""
  expected="$(printf '%s' "$EXPECTED_WORKER_VERSION" | tr '[:upper:]' '[:lower:]' | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"

  if [[ "$WORKER_VERSION_MODE" == "off" || -z "$expected" ]]; then
    worker_rollout_state="worker_assets_deployed_and_verified"
    worker_rollout_note="Worker rollout check skipped (mode=${WORKER_VERSION_MODE}, expected=${expected:-unset})."
    printf 'SMOKE rollout-check skipped mode=%s expected=%s\n' "$WORKER_VERSION_MODE" "${expected:-unset}"
    return 0
  fi

  while (( attempt <= WORKER_ROLLOUT_MAX_ATTEMPTS )); do
    meta="$(fetch_headers "$WORKER_VERSION_CHECK_PATH" "$headers_file")"
    meta_root="$(fetch_headers "/" "$root_headers_file")"
    final_url="${meta%%|*}"
    status="${meta#*|}"
    status="${status%%|*}"
    final_url_root="${meta_root%%|*}"
    status_root="${meta_root#*|}"
    status_root="${status_root%%|*}"
    observed="$(extract_header_value "$headers_file" "X-GG-Worker-Version")"
    observed_root="$(extract_header_value "$root_headers_file" "X-GG-Worker-Version")"
    observed="$(printf '%s' "$observed" | tr '[:upper:]' '[:lower:]' | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
    observed_root="$(printf '%s' "$observed_root" | tr '[:upper:]' '[:lower:]' | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
    worker_live_version="${observed:-missing}"
    worker_rollout_final_url="${final_url}"

    printf 'SMOKE rollout-check attempt=%s/%s path=%s status=%s observed=%s expected=%s root_status=%s root_observed=%s root_url=%s\n' \
      "$attempt" "$WORKER_ROLLOUT_MAX_ATTEMPTS" "$WORKER_VERSION_CHECK_PATH" "$status" "${observed:-missing}" "$expected" "$status_root" "${observed_root:-missing}" "$final_url_root"

    if [[ "$status" == "200" && -n "$observed" && "$observed" == "$expected" ]]; then
      worker_rollout_state="worker_assets_deployed_and_verified"
      worker_rollout_note="Expected worker version is live on public domain."
      return 0
    fi

    if (( attempt < WORKER_ROLLOUT_MAX_ATTEMPTS )); then
      sleep "$WORKER_ROLLOUT_BACKOFF_SECONDS"
    fi
    attempt=$((attempt + 1))
  done

  worker_rollout_state="worker_assets_rollout_pending"
  worker_rollout_note="Expected worker version not observed on public domain within rollout window."
  worker_rollout_signal "expected='${expected}' observed='${worker_live_version}' path='${WORKER_VERSION_CHECK_PATH}' final='${worker_rollout_final_url:-unknown}'"
}

strip_inert_markup() {
  local src_file="$1"
  local out_file="$2"
  node - "$src_file" "$out_file" <<'NODE'
const fs = require('node:fs');
const srcFile = process.argv[2];
const outFile = process.argv[3];
let html = '';
try {
  html = fs.readFileSync(srcFile, 'utf8');
} catch {
  html = '';
}
html = html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ');
fs.writeFileSync(outFile, html, 'utf8');
NODE
}

extract_attr_from_tag() {
  local tag="$1"
  local attr="$2"
  printf '%s' "$tag" | sed -nE "s/.*[[:space:]]${attr}=['\\\"]([^'\\\"]+)['\\\"].*/\\1/p" | head -n 1
}

extract_title() {
  local file="$1"
  local tag
  tag="$(grep -Eoi '<title>[^<]*</title>' "$file" | head -n 1 || true)"
  printf '%s' "$tag" | sed -E 's#</?[Tt][Ii][Tt][Ll][Ee]>##g'
}

extract_canonical() {
  local file="$1"
  local tag
  tag="$(grep -Eoi "<link[^>]+rel=['\\\"]canonical['\\\"][^>]*>" "$file" | head -n 1 || true)"
  extract_attr_from_tag "$tag" "href"
}

extract_og_url() {
  local file="$1"
  local tag
  tag="$(grep -Eoi "<meta[^>]+property=['\\\"]og:url['\\\"][^>]*>" "$file" | head -n 1 || true)"
  extract_attr_from_tag "$tag" "content"
}

extract_template_fingerprint() {
  local file="$1"
  local value=""
  value="$(node qa/template-fingerprint.mjs --extract-live --file "$file" 2>/dev/null || true)"
  printf '%s' "$value"
}

extract_body_attr() {
  local file="$1"
  local attr="$2"
  local tag
  tag="$(grep -Eoi '<body[^>]*>' "$file" | head -n 1 || true)"
  extract_attr_from_tag "$tag" "$attr"
}

extract_main_attr() {
  local file="$1"
  local attr="$2"
  local tag
  tag="$(grep -Eoi "<main[^>]+class=['\\\"][^'\\\"]*gg-main[^'\\\"]*['\\\"][^>]*>" "$file" | head -n 1 || true)"
  extract_attr_from_tag "$tag" "$attr"
}

extract_dock_href() {
  local file="$1"
  local action="$2"
  local tag
  tag="$(grep -Eoi "<a[^>]+data-gg-action=['\\\"]${action}['\\\"][^>]*>" "$file" | head -n 1 || true)"
  extract_attr_from_tag "$tag" "href"
}

normalize_href() {
  local href="$1"
  if [[ -z "$href" ]]; then
    printf ''
    return 0
  fi
  if [[ "$href" =~ ^https?:// ]]; then
    printf '%s' "$href"
    return 0
  fi
  printf '%s/%s' "$BASE_URL" "${href#/}"
}

assert_equal() {
  local got="$1"
  local expected="$2"
  local context="$3"
  if [[ "$got" != "$expected" ]]; then
    log_fail "$context (got='$got' expected='$expected')"
  fi
}

assert_starts_with() {
  local got="$1"
  local prefix="$2"
  local context="$3"
  if [[ "${got#"$prefix"}" == "$got" ]]; then
    log_fail "$context (got='$got' expected-prefix='$prefix')"
  fi
}

assert_no_placeholder_strings() {
  local file="$1"
  local context="$2"
  local leaks
  leaks="$(grep -nE 'Stories will appear shortly|Content temporarily unavailable|No headings available' "$file" || true)"
  if [[ -n "$leaks" ]]; then
    log_fail "$context placeholder leakage detected"
    printf '%s\n' "$leaks" >&2
  fi
}

assert_no_empty_editorial_shell() {
  local file="$1"
  local context="$2"
  local leaks_file="$tmp_dir/$(safe_file_name "epanel_${context}").leaks"
  : > "$leaks_file"
  node - "$file" >"$leaks_file" <<'NODE'
const fs = require('node:fs');
const file = process.argv[2];
let html = '';
try {
  html = fs.readFileSync(file, 'utf8');
} catch {
  process.exit(0);
}
const stripped = html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ');
const visible = stripped
  .replace(/<([a-z0-9]+)\b[^>]*class=['"][^'"]*\b(?:gg-visually-hidden|visually-hidden)\b[^'"]*['"][^>]*>[\s\S]*?<\/\1>/gi, ' ');
const leaks = [];
const rowNames = ['title', 'author', 'contributors', 'labels', 'tags', 'date', 'updated', 'comments', 'readtime', 'snippet'];
const hasHiddenAttr = (tag) => /\bhidden\b/i.test(tag);
const isPanelRowTag = (tag) => /\bclass=['"][^'"]*\bgg-epanel__row\b[^'"]*['"]/i.test(tag);

const panelTag = (visible.match(/<div[^>]*class=['"][^'"]*\bgg-editorial-preview\b[^'"]*['"][^>]*>/i) || [])[0] || '';
if (panelTag && !hasHiddenAttr(panelTag)) {
  leaks.push('editorial-preview-visible');
}

for (const rowName of rowNames) {
  const re = new RegExp('<div[^>]*data-row=([\'"])' + rowName + '\\1[^>]*>', 'ig');
  let m;
  while ((m = re.exec(visible))) {
    if (!isPanelRowTag(m[0])) continue;
    if (!hasHiddenAttr(m[0])) leaks.push('row-' + rowName + '-visible');
  }
}

const tocRe = /<div[^>]*data-row=(['"])toc\1[^>]*>/ig;
let t;
while ((t = tocRe.exec(visible))) {
  if (!isPanelRowTag(t[0])) continue;
  if (hasHiddenAttr(t[0])) continue;
  const scope = visible.slice(t.index, Math.min(visible.length, t.index + 5000));
  const tocHasItems = /<ol[^>]*data-gg-slot=(['"])toc\1[^>]*>[\s\S]*?<li\b/i.test(scope);
  if (!tocHasItems) leaks.push('row-toc-visible-without-headings');
}

if (leaks.length) {
  process.stdout.write(leaks.join('\n'));
}
NODE
  if [[ -s "$leaks_file" ]]; then
    while IFS= read -r leak; do
      [[ -n "$leak" ]] || continue
      log_fail "$context empty editorial shell leakage detected (${leak})"
    done < "$leaks_file"
  fi
}

assert_listing_idle_chrome_not_readable() {
  local file="$1"
  local context="$2"
  local leaks_file="$tmp_dir/$(safe_file_name "idle_chrome_${context}").leaks"
  : > "$leaks_file"
  node - "$file" >"$leaks_file" <<'NODE'
const fs = require('node:fs');
const file = process.argv[2];
let html = '';
try {
  html = fs.readFileSync(file, 'utf8');
} catch {
  process.exit(0);
}
const src = html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ');
let scope = src;
const panelStart = src.search(/<div[^>]*class=['"][^'"]*\bgg-info-panel__card\b[^'"]*\bgg-editorial-preview\b[^'"]*['"][^>]*>/i);
if (panelStart >= 0) {
  const tail = src.slice(panelStart);
  const storeEnd = tail.match(/<a[^>]*data-gg-marker=['"]panel-listing-cta['"][^>]*>[\s\S]*?<\/a>/i);
  if (storeEnd && typeof storeEnd.index === 'number') {
    scope = tail.slice(0, storeEnd.index + storeEnd[0].length + 256);
  } else {
    scope = tail.slice(0, 12000);
  }
}
const leaks = [];

const labelChecks = [
  ['Title', /<dt[^>]*class=['"][^'"]*\bgg-epanel__label\b[^'"]*['"][^>]*>\s*Title\s*<\/dt>/i],
  ['Written by', /<dt[^>]*class=['"][^'"]*\bgg-epanel__label\b[^'"]*['"][^>]*>\s*Written by\s*<\/dt>/i],
  ['Contributors', /<dt[^>]*class=['"][^'"]*\bgg-epanel__label\b[^'"]*['"][^>]*>\s*Contributors\s*<\/dt>/i],
  ['Label', /<dt[^>]*class=['"][^'"]*\bgg-epanel__label\b[^'"]*['"][^>]*>\s*Label\s*<\/dt>/i],
  ['Tags', /<dt[^>]*class=['"][^'"]*\bgg-epanel__label\b[^'"]*['"][^>]*>\s*Tags\s*<\/dt>/i],
  ['Date', /<dt[^>]*class=['"][^'"]*\bgg-epanel__label\b[^'"]*['"][^>]*>\s*Date\s*<\/dt>/i],
  ['Updated', /<dt[^>]*class=['"][^'"]*\bgg-epanel__label\b[^'"]*['"][^>]*>\s*Updated\s*<\/dt>/i],
  ['Comments', /<dt[^>]*class=['"][^'"]*\bgg-epanel__label\b[^'"]*['"][^>]*>\s*Comments\s*<\/dt>/i],
  ['Read time', /<dt[^>]*class=['"][^'"]*\bgg-epanel__label\b[^'"]*['"][^>]*>\s*Read time\s*<\/dt>/i],
  ['Snippet', /<dt[^>]*class=['"][^'"]*\bgg-epanel__label\b[^'"]*['"][^>]*>\s*Snippet\s*<\/dt>/i],
  ['Table of Contents', /<dt[^>]*class=['"][^'"]*\bgg-epanel__label\b[^'"]*['"][^>]*>\s*Table of Contents\s*<\/dt>/i]
];
const iconTokenChecks = [
  ['article', /<span[^>]*class=['"][^'"]*\bgg-epanel__icon\b[^'"]*['"][^>]*>\s*article\s*<\/span>/i],
  ['person', /<span[^>]*class=['"][^'"]*\bgg-epanel__icon\b[^'"]*['"][^>]*>\s*person\s*<\/span>/i],
  ['groups', /<span[^>]*class=['"][^'"]*\bgg-epanel__icon\b[^'"]*['"][^>]*>\s*groups\s*<\/span>/i],
  ['label', /<span[^>]*class=['"][^'"]*\bgg-epanel__icon\b[^'"]*['"][^>]*>\s*label\s*<\/span>/i],
  ['sell', /<span[^>]*class=['"][^'"]*\bgg-epanel__icon\b[^'"]*['"][^>]*>\s*sell\s*<\/span>/i],
  ['calendar_today', /<span[^>]*class=['"][^'"]*\bgg-epanel__icon\b[^'"]*['"][^>]*>\s*calendar_today\s*<\/span>/i],
  ['event_repeat', /<span[^>]*class=['"][^'"]*\bgg-epanel__icon\b[^'"]*['"][^>]*>\s*event_repeat\s*<\/span>/i],
  ['comment', /<span[^>]*class=['"][^'"]*\bgg-epanel__icon\b[^'"]*['"][^>]*>\s*comment\s*<\/span>/i],
  ['schedule', /<span[^>]*class=['"][^'"]*\bgg-epanel__icon\b[^'"]*['"][^>]*>\s*schedule\s*<\/span>/i],
  ['text_snippet', /<span[^>]*class=['"][^'"]*\bgg-epanel__icon\b[^'"]*['"][^>]*>\s*text_snippet\s*<\/span>/i],
  ['toc', /<span[^>]*class=['"][^'"]*\bgg-epanel__icon\b[^'"]*['"][^>]*>\s*toc\s*<\/span>/i],
  ['visibility', /<span[^>]*class=['"][^'"]*\bmaterial-symbols-rounded\b[^'"]*['"][^>]*>\s*visibility\s*<\/span>/i]
];

for (const [name, re] of labelChecks) {
  if (re.test(scope)) leaks.push(`label:${name}`);
}
for (const [name, re] of iconTokenChecks) {
  if (re.test(scope)) leaks.push(`icon-token:${name}`);
}
if (/<a[^>]*class=['"][^'"]*\bgg-epanel__cta\b[^'"]*['"][^>]*>[\s\S]*?Read this post[\s\S]*?<\/a>/i.test(scope)) {
  leaks.push('cta:Read this post');
}
if (/<a[^>]*data-gg-marker=['"]panel-listing-cta['"][^>]*>\s*Read this post\s*<\/a>/i.test(scope)) {
  leaks.push('store-cta:Read this post');
}
if (leaks.length) process.stdout.write(leaks.join('\n'));
NODE
  if [[ -s "$leaks_file" ]]; then
    while IFS= read -r leak; do
      [[ -n "$leak" ]] || continue
      log_fail "$context idle listing info chrome still publicly readable (${leak})"
    done < "$leaks_file"
  fi
}

assert_row_hidden() {
  local file="$1"
  local row="$2"
  local context="$3"
  if ! grep -Eq "<div[^>]+data-row=['\\\"]${row}['\\\"][^>]*hidden=['\\\"]hidden['\\\"]" "$file"; then
    log_fail "$context row '${row}' expected hidden"
  fi
}

discover_first_post_path() {
  local file="$1"
  local tag=""
  local url=""
  tag="$(grep -Eoi "<article[^>]+class=['\\\"][^'\\\"]*gg-post-card[^'\\\"]*['\\\"][^>]*>" "$file" | head -n 1 || true)"
  url="$(extract_attr_from_tag "$tag" "data-url")"
  if [[ -z "$url" ]]; then
    url="$(grep -Eoi "https?://[^\"'[:space:]]+/[0-9]{4}/[0-9]{2}/[^\"'#[:space:]]+\\.html" "$file" | head -n 1 || true)"
  fi
  if [[ -z "$url" ]]; then
    url="$(grep -Eoi "/[0-9]{4}/[0-9]{2}/[^\"'#[:space:]]+\\.html" "$file" | head -n 1 || true)"
  fi
  if [[ -z "$url" ]]; then
    return 1
  fi
  to_path "$url"
}

discover_page_candidates() {
  local file="$1"
  local line=""
  local url=""
  local path=""
  while IFS= read -r line; do
    [[ -n "$line" ]] || continue
    url="$(printf '%s' "$line" | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
    [[ -n "$url" ]] || continue
    path="$(to_path "$url")"
    if [[ "$path" =~ ^/p/(tags|author|sitemap|pay|support|privacy-policy)\.html$ ]]; then
      continue
    fi
    printf '%s\n' "$path"
  done < <(
    grep -Eoi "https?://[^\"'[:space:]]+/p/[^\"'#[:space:]]+\\.html|/p/[^\"'#[:space:]]+\\.html" "$file" \
      | awk '!seen[$0]++'
  )
}

discover_first_live_page_path() {
  local file="$1"
  local candidate=""
  local probe_file=""
  local meta=""
  local status=""
  while IFS= read -r candidate; do
    [[ -n "$candidate" ]] || continue
    probe_file="$tmp_dir/$(safe_file_name "probe_${candidate}").html"
    meta="$(fetch_page "$candidate" "$probe_file")"
    status="${meta#*|}"
    status="${status%%|*}"
    if [[ "$status" == "200" ]]; then
      printf '%s' "$candidate"
      return 0
    fi
  done < <(discover_page_candidates "$file")
  return 1
}

discover_first_page_path() {
  local file="$1"
  local page=""
  page="$(discover_first_live_page_path "$file" || true)"
  if [[ -z "$page" ]]; then
    return 1
  fi
  printf '%s' "$page"
}

assert_absent_marker() {
  local file="$1"
  local context="$2"
  local pattern="$3"
  local label="$4"
  local hit=""
  hit="$(grep -Eoin "$pattern" "$file" | head -n 1 || true)"
  if [[ -n "$hit" ]]; then
    log_fail "$context forbidden marker detected (${label}) -> ${hit}"
  fi
}

check_detail_panel_contract() {
  local file="$1"
  local context="$2"
  if ! grep -Eq "id=['\\\"]gg-postinfo['\\\"]" "$file"; then
    detail_contract_signal "$context missing #gg-postinfo (detail panel)"
  fi
  if ! grep -Eq "data-gg-marker=['\\\"]panel-post-author['\\\"]" "$file"; then
    detail_contract_signal "$context missing panel-post-author slot"
  fi
  if ! grep -Eq "data-gg-marker=['\\\"]panel-post-tags['\\\"]" "$file"; then
    detail_contract_signal "$context missing panel-post-tags slot"
  fi
  if ! grep -Eq "id=['\\\"]ggPanelComments['\\\"]" "$file"; then
    detail_contract_signal "$context missing #ggPanelComments (detail comments panel)"
  fi
  assert_absent_marker "$file" "$context" "class=['\\\"][^'\\\"]*gg-editorial-preview" "listing editorial panel on detail surface"
  assert_absent_marker "$file" "$context" "data-gg-panelmeta=['\\\"]listing['\\\"]" "listing panel contract on detail surface"
}

check_detail_postmeta_contract() {
  local file="$1"
  local context="$2"
  local report_file="$tmp_dir/$(safe_file_name "detail_postmeta_${context}").report"
  node - "$file" >"$report_file" <<'NODE'
const fs = require('node:fs');
const file = process.argv[2];
let html = '';
try {
  html = fs.readFileSync(file, 'utf8');
} catch {
  process.exit(0);
}
const src = String(html || '')
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ');
const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim();
const splitList = (raw, re) => clean(raw).split(re).map((x) => clean(x)).filter(Boolean);
const toKey = (v) => clean(v).toLowerCase().replace(/^#/, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]+/g, '').replace(/^-+|-+$/g, '');
const attr = (tag, name) => {
  const re = new RegExp(name + '\\s*=\\s*(?:(["\'])(.*?)\\1|([^\\s"\'>]+))', 'i');
  const m = String(tag || '').match(re);
  return clean(m ? (m[2] || m[3] || '') : '');
};

const metaTags = src.match(/<(?:div|span)[^>]*(?:class=['"][^'"]*\bgg-postmeta\b[^'"]*['"]|data-gg-postmeta(?:=['"][^'"]*['"])?)[^>]*>/gi) || [];
let best = { score: -1, author: '', contributors: [], tags: [], readMin: '', updated: '' };
for (const tag of metaTags) {
  const author = clean(attr(tag, 'data-author') || attr(tag, 'data-gg-author') || attr(tag, 'author'));
  const updated = clean(attr(tag, 'data-updated') || attr(tag, 'data-gg-updated'));
  const readMin = clean(attr(tag, 'data-read-min') || attr(tag, 'data-readtime') || attr(tag, 'data-gg-read-min') || attr(tag, 'data-gg-readtime'));
  const contributors = splitList(attr(tag, 'data-contributors') || attr(tag, 'data-gg-contributors'), /\s*;\s*/);
  const tags = splitList(attr(tag, 'data-tags') || attr(tag, 'data-gg-tags'), /\s*,\s*/);
  const score = (author ? 2 : 0) + (updated ? 2 : 0) + (readMin ? 1 : 0) + (contributors.length * 3) + (tags.length * 4);
  if (score > best.score) best = { score, author, contributors, tags, readMin, updated };
}

const labelTexts = [];
const labelRe = /<a[^>]*rel=['"]tag['"][^>]*>([\s\S]*?)<\/a>/gi;
let lm;
while ((lm = labelRe.exec(src))) {
  const txt = clean(String(lm[1] || '').replace(/<[^>]+>/g, ' '));
  if (txt) labelTexts.push(txt);
}

const contributors = best.contributors.map((x) => clean(x)).filter(Boolean);
const tags = best.tags.map((x) => clean(x)).filter(Boolean);
const labels = labelTexts.map((x) => clean(x)).filter(Boolean);
const authorLc = clean(best.author).toLowerCase();
const contribLc = contributors.map((x) => x.toLowerCase());
const tagKey = tags.map(toKey).filter(Boolean).sort().join(',');
const labelKey = labels.map(toKey).filter(Boolean).sort().join(',');
const hasCustomPayload = contributors.length > 0 || tags.length > 0 || !!clean(best.readMin);

const fails = [];
if (!metaTags.length) fails.push('missing-gg-postmeta-node');
if (authorLc && contribLc.length && contribLc.every((x) => x === authorLc)) fails.push('contributors-fallback-to-main-author');
if (authorLc && contribLc.some((x) => x === authorLc)) fails.push('contributors-include-main-author');
if (tagKey && labelKey && tagKey === labelKey) fails.push('tags-fallback-to-native-labels');

console.log(
  'META|' +
  `nodes=${metaTags.length};author=${clean(best.author)};contributors=${contributors.join(',') || 'none'};tags=${tags.join(',') || 'none'};labels=${labels.join(',') || 'none'};read_min=${clean(best.readMin) || 'none'};has_custom=${hasCustomPayload ? '1' : '0'}`
);
for (const f of fails) console.log(`FAIL|${f}`);
NODE

  while IFS= read -r line; do
    [[ -n "$line" ]] || continue
    if [[ "$line" == META\|* ]]; then
      printf 'SMOKE %s postmeta %s\n' "$context" "${line#META|}"
      continue
    fi
    if [[ "$line" == FAIL\|* ]]; then
      log_fail "$context custom postmeta contract violation (${line#FAIL|})"
    fi
  done < "$report_file"
}

check_surface_ownership_contract() {
  local file="$1"
  local context="$2"
  local expected_surface="$3"
  if [[ "$expected_surface" == "landing" ]]; then
    assert_absent_marker "$file" "$context" "data-gg-home-layer=['\\\"]blog['\\\"]|id=['\\\"]gg-home-blog['\\\"]" "blog/listing layer on landing"
    assert_absent_marker "$file" "$context" "class=['\\\"][^'\\\"]*gg-blog-layout" "blog layout chrome on landing"
    assert_absent_marker "$file" "$context" "data-gg-module=['\\\"]mixed-media['\\\"]" "mixed/listing module host on landing"
    assert_absent_marker "$file" "$context" "class=['\\\"][^'\\\"]*gg-editorial-preview" "listing editorial shell on landing"
    assert_absent_marker "$file" "$context" "id=['\\\"]gg-postinfo['\\\"]" "detail information panel on landing"
    assert_absent_marker "$file" "$context" "id=['\\\"]ggPanelComments['\\\"]" "detail comments panel on landing"
    return
  fi
  if [[ "$expected_surface" == "listing" ]]; then
    assert_absent_marker "$file" "$context" "data-gg-home-layer=['\\\"]landing['\\\"]|id=['\\\"]gg-landing['\\\"]|id=['\\\"]gg-landing-hero['\\\"]" "landing hero blocks on listing surface"
    assert_absent_marker "$file" "$context" "id=['\\\"]gg-postinfo['\\\"]" "detail information panel on listing surface"
    assert_absent_marker "$file" "$context" "id=['\\\"]ggPanelComments['\\\"]" "detail comments panel on listing surface"
    return
  fi
  if [[ "$expected_surface" == "post" || "$expected_surface" == "page" ]]; then
    assert_absent_marker "$file" "$context" "data-gg-home-layer=['\\\"]landing['\\\"]|id=['\\\"]gg-landing['\\\"]|id=['\\\"]gg-landing-hero['\\\"]" "landing blocks on detail surface"
    check_detail_panel_contract "$file" "$context"
    check_detail_postmeta_contract "$file" "$context"
  fi
}

check_listing_card_metadata() {
  local file="$1"
  local scan_file="$tmp_dir/$(safe_file_name "listing_meta_scan").html"
  local card=""
  local author=""
  local contributors=""
  local tags=""
  local labels=""
  local snippet=""
  local toc_json=""
  local author_lc=""
  local contributors_lc=""
  local token=""
  strip_inert_markup "$file" "$scan_file"
  card="$(grep -Eoi "<article[^>]+class=['\\\"][^'\\\"]*gg-post-card[^'\\\"]*['\\\"][^>]*>" "$file" | head -n 1 || true)"
  if [[ -z "$card" ]]; then
    log_fail "listing missing gg-post-card"
    return
  fi

  author="$(extract_attr_from_tag "$card" "data-author")"
  if [[ -z "$author" ]]; then
    author="$(extract_attr_from_tag "$card" "data-author-name")"
  fi
  contributors="$(extract_attr_from_tag "$card" "data-contributors")"
  if [[ -z "$contributors" ]]; then
    contributors="$(extract_attr_from_tag "$card" "data-gg-contributors")"
  fi
  tags="$(extract_attr_from_tag "$card" "data-tags")"
  if [[ -z "$tags" ]]; then
    tags="$(extract_attr_from_tag "$card" "data-gg-tags")"
  fi
  labels="$(extract_attr_from_tag "$card" "data-gg-labels")"
  snippet="$(extract_attr_from_tag "$card" "data-snippet")"
  if [[ -z "$snippet" ]]; then
    snippet="$(extract_attr_from_tag "$card" "data-gg-snippet")"
  fi
  toc_json="$(extract_attr_from_tag "$card" "data-gg-toc-json")"

  printf 'SMOKE listing-card author=%s contributors=%s tags=%s labels=%s snippet_len=%s toc_len=%s\n' \
    "$author" "$contributors" "$tags" "$labels" "${#snippet}" "${#toc_json}"

  if [[ -n "$author" && -n "$contributors" ]]; then
    author_lc="$(printf '%s' "$author" | tr '[:upper:]' '[:lower:]' | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
    contributors_lc="$(printf '%s' "$contributors" | tr '[:upper:]' '[:lower:]' | tr ';' ',' | sed -E 's/[[:space:]]*,[[:space:]]*/,/g; s/^[[:space:]]+|[[:space:]]+$//g')"
    if [[ "$contributors_lc" == "$author_lc" ]]; then
      log_fail "listing contributors fallback to main author"
    fi
    IFS=',' read -r -a _contrib_parts <<< "$contributors_lc"
    for token in "${_contrib_parts[@]}"; do
      token="$(printf '%s' "$token" | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
      if [[ -n "$token" && "$token" == "$author_lc" ]]; then
        log_fail "listing contributors include main author token"
        break
      fi
    done
  fi

  if [[ -n "$tags" && -n "$labels" ]]; then
    if [[ "$(printf '%s' "$tags" | tr '[:upper:]' '[:lower:]' | sed -E 's/[[:space:]]+//g')" == "$(printf '%s' "$labels" | tr '[:upper:]' '[:lower:]' | sed -E 's/[[:space:]]+//g')" ]]; then
      log_fail "listing tags fallback to label values"
    fi
  fi

  if [[ -z "$snippet" ]]; then
    assert_row_hidden "$file" "snippet" "listing editorial panel"
  fi
  if [[ -z "$toc_json" ]]; then
    if grep -q "No headings available" "$scan_file"; then
      log_fail "listing toc hint leaked placeholder"
    fi
  fi
}

check_listing_preview_runtime_contract() {
  local root_file="$tmp_dir/$(safe_file_name "preview_contract_root").html"
  local core_file="$tmp_dir/$(safe_file_name "preview_contract_core").js"
  local report_file="$tmp_dir/$(safe_file_name "preview_contract_report").txt"
  local meta=""
  local status=""
  local assets_version=""
  fetch_page "/" "$root_file" >/dev/null

  assets_version="$(node - "$root_file" <<'NODE'
const fs = require('node:fs');
const file = process.argv[2];
let src = '';
try { src = fs.readFileSync(file, 'utf8'); } catch (_) { src = ''; }
const m = src.match(/\/assets\/v\/([a-z0-9]+)\/boot\.js\b/i);
if (m && m[1]) process.stdout.write(String(m[1]).trim());
NODE
)"
  if [[ -z "$assets_version" ]]; then
    log_fail "listing preview runtime contract unable to resolve versioned core asset path"
    return
  fi

  meta="$(fetch_page "/assets/v/${assets_version}/modules/ui.bucket.core.js" "$core_file")"
  status="${meta#*|}"
  status="${status%%|*}"
  if [[ "$status" != "200" ]]; then
    log_fail "listing preview runtime contract failed to fetch core asset (status=${status})"
    return
  fi

  node - "$core_file" >"$report_file" <<'NODE'
const fs = require('node:fs');
const file = process.argv[2];
let src = '';
try { src = fs.readFileSync(file, 'utf8'); } catch (_) { src = ''; }
const fails = [];
const hasSeedDisabled = /function\s+seedInitialPreview\s*\(\)\s*\{\s*return\s+false;\s*\}/.test(src);
const hoverOpens = /function\s+handlePreviewHover[\s\S]*?openWithCard\(\s*card\s*,\s*null\s*,\s*\{\s*focusPanel:\s*false\s*\}\s*\)/.test(src);
const focusOpens = /function\s+handlePreviewFocus[\s\S]*?openWithCard\(\s*card\s*,\s*null\s*,\s*\{\s*focusPanel:\s*false\s*\}\s*\)/.test(src);
const clickOpens = /function\s+handleClick[\s\S]*?openWithCard\(\s*card\s*,\s*infoBtn\s*,\s*\{\s*focusPanel:\s*true(?:\s*,[\s\S]*?)?\}\s*\)/.test(src);
const hasIconSync = /function\s+syncPanelIconTokens\s*\(/.test(src);
const openSetsIcons = /function\s+openWithCard[\s\S]*?syncPanelIconTokens\(\s*true\s*\)/.test(src);
const resetClearsIcons = /function\s+resetPanelState[\s\S]*?syncPanelIconTokens\(\s*false\s*\)/.test(src);
const hasSnippetExtractor = /function\s+extractPreviewSnippet\s*\(/.test(src);
const headingReadsPostmeta = /function\s+parseHeadingItems[\s\S]*?getFromContext\(doc\)/.test(src);
const headingSnippetFallback = /function\s+parseHeadingItems[\s\S]*?snippet=(?:cleanText|curateSnippet)\(pm&&pm\.snippet\|\|''(?:,\s*\d+)?\);\s*if\(!snippet\)\s*snippet=extractPreviewSnippet\(root\);/.test(src);
const headingWritesMetaPayload = /function\s+parseHeadingItems[\s\S]*?out\._m=\{t:tags,a:author,c:contributors,u:updated,r:readTime,s:snippet\}/.test(src);
const cardMetaFlexibleSplit = /function\s+parsePostMetaFromCard[\s\S]*?data-contributors[\s\S]*?\/\\s\*\[;,\]\\s\*\/[\s\S]*?data-tags[\s\S]*?\/\\s\*\[;,\]\\s\*\//.test(src);
const payloadGuard = /if\(!hasPreviewPayload\)\{[\s\S]*?resetPanelState\(\);[\s\S]*?return false;/.test(src);
const fetchPipeline = /function\s+resolveTocItems[\s\S]*?fetchPostHtml\([\s\S]*?parseHeadingItems\([\s\S]*?applyPostMeta\(key\)/.test(src);
const metaCacheSet = /postMetaCache\.set\(\s*key\s*,\s*meta\s*\)/.test(src);
const applySnippetFromHydratedMeta = /function\s+applyPostMeta[\s\S]*?m\.s\|\|m\.snippet/.test(src);
const applyHydratedTags = /function\s+applyPostMeta[\s\S]*?fillChipsToSlot\(\s*'tags'\s*,\s*t\s*,\s*14\s*\)/.test(src);
const applyHydratedContributors = /function\s+applyPostMeta[\s\S]*?fillChipsToSlot\(\s*'contributors'\s*,\s*contrib\s*,\s*12\s*\)/.test(src);
const contributorNoAuthorFallback = /instContributors[\s\S]*?!authorText\|\|x\.toLowerCase\(\)!==authorText\.toLowerCase\(\)/.test(src);
const tocHydrationGate = /function\s+hydrateToc[\s\S]*?resolveTocItems\(\s*abs\s*,\s*\{\s*abortOthers:true\s*\}\s*\)/.test(src);
if (!hasSeedDisabled) fails.push('idle-seed-not-disabled');
if (!hoverOpens) fails.push('hover-preview-open-missing');
if (!focusOpens) fails.push('focus-preview-open-missing');
if (!clickOpens) fails.push('info-action-open-missing');
if (!hasIconSync) fails.push('icon-sync-helper-missing');
if (!openSetsIcons) fails.push('open-does-not-set-icons');
if (!resetClearsIcons) fails.push('reset-does-not-clear-icons');
if (!hasSnippetExtractor) fails.push('snippet-extractor-missing');
if (!headingReadsPostmeta) fails.push('heading-parser-postmeta-read-missing');
if (!headingSnippetFallback) fails.push('heading-snippet-fallback-missing');
if (!headingWritesMetaPayload) fails.push('heading-meta-payload-missing');
if (!cardMetaFlexibleSplit) fails.push('card-meta-split-semicolon-comma-missing');
if (!payloadGuard) fails.push('open-guard-without-payload-missing');
if (!fetchPipeline) fails.push('hydration-fetch-pipeline-missing');
if (!metaCacheSet) fails.push('hydrated-meta-cache-missing');
if (!applySnippetFromHydratedMeta) fails.push('hydrated-snippet-apply-missing');
if (!applyHydratedTags) fails.push('hydrated-tags-apply-missing');
if (!applyHydratedContributors) fails.push('hydrated-contributors-apply-missing');
if (!contributorNoAuthorFallback) fails.push('contributors-author-fallback-filter-missing');
if (!tocHydrationGate) fails.push('toc-hydration-gate-missing');
console.log(`META|seed_disabled=${hasSeedDisabled ? '1' : '0'};hover_open=${hoverOpens ? '1' : '0'};focus_open=${focusOpens ? '1' : '0'};click_open=${clickOpens ? '1' : '0'};icon_sync=${hasIconSync ? '1' : '0'};open_sets_icons=${openSetsIcons ? '1' : '0'};reset_clears_icons=${resetClearsIcons ? '1' : '0'};snippet_extractor=${hasSnippetExtractor ? '1' : '0'};heading_postmeta=${headingReadsPostmeta ? '1' : '0'};heading_snippet_fallback=${headingSnippetFallback ? '1' : '0'};heading_meta_payload=${headingWritesMetaPayload ? '1' : '0'};card_meta_split=${cardMetaFlexibleSplit ? '1' : '0'};payload_guard=${payloadGuard ? '1' : '0'};hydration_fetch=${fetchPipeline ? '1' : '0'};meta_cache=${metaCacheSet ? '1' : '0'};apply_snippet=${applySnippetFromHydratedMeta ? '1' : '0'};apply_tags=${applyHydratedTags ? '1' : '0'};apply_contributors=${applyHydratedContributors ? '1' : '0'};contributors_filter=${contributorNoAuthorFallback ? '1' : '0'};toc_hydration_gate=${tocHydrationGate ? '1' : '0'}`);
for (const f of fails) console.log(`FAIL|${f}`);
NODE

  while IFS= read -r line; do
    [[ -n "$line" ]] || continue
    if [[ "$line" == META\|* ]]; then
      printf 'SMOKE listing-preview-contract %s asset=v/%s/modules/ui.bucket.core.js\n' "${line#META|}" "$assets_version"
      continue
    fi
    if [[ "$line" == FAIL\|* ]]; then
      log_fail "listing preview runtime contract violation (${line#FAIL|})"
    fi
  done < "$report_file"
}

check_comments_owner_contract() {
  check_comments_owner_case "zero" "0" "$COMMENTS_TARGET_PATH_0"
  check_comments_owner_case "two" "2" "$COMMENTS_TARGET_PATH_2"
  check_comments_owner_case "sixteen" "16" "$COMMENTS_TARGET_PATH_16"
}

check_comments_owner_case() {
  local case_name="$1"
  local expected_count="$2"
  local path="$3"
  local url
  local report_file="$tmp_dir/$(safe_file_name "comments_owner_${case_name}").txt"
  local status=0
  url="$(absolute_for_path "$path")"

  if [[ "$COMMENTS_OWNER_BROWSER_MODE" == "off" ]]; then
    printf 'SMOKE comments-owner skipped mode=off case=%s target=%s\n' "$case_name" "$url"
    return 0
  fi

  GG_COMMENTS_URL="$url" \
  GG_COMMENTS_CASE_NAME="$case_name" \
  GG_COMMENTS_EXPECTED_COUNT="$expected_count" \
  GG_PLAYWRIGHT_EXECUTABLE_PATH="$PLAYWRIGHT_EXECUTABLE_PATH" \
  node >"$report_file" <<'NODE'
let chromium = null;
let firefox = null;
try {
  ({ chromium, firefox } = require('playwright'));
} catch (error) {
  const detail = String(error && error.message ? error.message : error || '').replace(/\s+/g, ' ').trim();
  console.log(`BROWSER|infra|playwright-module-unavailable:${detail || 'missing-module'}`);
  process.exit(0);
}

const url = process.env.GG_COMMENTS_URL || '';
const caseName = process.env.GG_COMMENTS_CASE_NAME || 'case';
const expectedCount = Number(process.env.GG_COMMENTS_EXPECTED_COUNT || '0');
const executablePath = (process.env.GG_PLAYWRIGHT_EXECUTABLE_PATH || '').trim();

function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function isCommentRuntimeMessage(value) {
  const hay = clean(value).toLowerCase();
  return /comment|comments|reply|composer|ggpanelcomments|ui\.bucket\.(core|post|authors)|#comments|gg-comments/.test(hay);
}

function state(pass, detail) {
  return { pass: !!pass, detail: detail || 'ok' };
}

function notApplicable(detail) {
  return { skip: true, detail: detail || 'n/a' };
}

async function captureState(page) {
  return page.evaluate(() => {
    function cleanValue(value) {
      return String(value || '').replace(/\s+/g, ' ').trim();
    }
    function visible(node) {
      if (!node || node.hidden) return false;
      if (node.getAttribute && (node.getAttribute('aria-hidden') === 'true' || node.getAttribute('data-gg-state') === 'hidden')) return false;
      const style = window.getComputedStyle(node);
      if (!style || style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') return false;
      const rect = node.getBoundingClientRect();
      return !!(rect.width || rect.height || node.getClientRects().length);
    }
    function visibleAll(selector, scope) {
      return Array.from((scope || document).querySelectorAll(selector)).filter(visible);
    }
    function commentKey(comment) {
      return cleanValue((comment && (comment.getAttribute('data-gg-comment-id') || comment.id || '') || '').replace(/^c/, ''));
    }
    function commentState(comment) {
      return cleanValue(comment && comment.getAttribute ? comment.getAttribute('data-gg-comment-state') || 'active' : 'active');
    }
    function interactiveComments(root) {
      return visibleAll('#cmt2-holder li.comment', root).filter((comment) => commentState(comment) === 'active');
    }
    function directReplyCount(comment) {
      const replies = comment && comment.querySelector ? comment.querySelector(':scope > .comment-replies') : null;
      const container = replies && replies.querySelector ? (replies.querySelector(':scope > .comments-content') || replies) : null;
      return container ? Array.from(container.children || []).filter((node) => node.matches && node.matches('li.comment')).length : 0;
    }
    function hasComposerField(node) {
      if (!node) return false;
      if (node.matches && node.matches('iframe, textarea, input:not([type="hidden"]), [contenteditable="true"]')) return true;
      if (!node.querySelector) return false;
      return !!node.querySelector('iframe, textarea, input:not([type="hidden"]), [contenteditable="true"]');
    }
    function composerNodeKind(node, rootComposerKind) {
      if (!node) return 'missing';
      if (node.id === 'comment-editor') return 'native';
      if (node.getAttribute && node.getAttribute('data-gg-fallback') === '1') return 'fallback';
      if (node.getAttribute && node.getAttribute('data-gg-native-plumbing') === 'composer') return 'native';
      if (node.closest && node.closest('#top-ce[data-gg-fallback="1"]')) return 'fallback';
      if (node.matches && node.matches('[data-gg-fallback-field="1"]')) return 'fallback';
      if (node.querySelector) {
        if (node.querySelector('[data-gg-fallback-field="1"], #top-ce[data-gg-fallback="1"]')) return 'fallback';
        if (node.querySelector('#comment-editor, #comment-editor-src, iframe#comment-editor')) return 'native';
      }
      if (node.matches && node.matches('textarea, input:not([type="hidden"]), [contenteditable="true"]')) {
        return rootComposerKind === 'native' ? 'native' : 'fallback';
      }
      return rootComposerKind || 'missing';
    }
    function composerKinds(nodes, rootComposerKind) {
      return nodes.map((node) => composerNodeKind(node, rootComposerKind)).join(',');
    }
    function composerCountByKind(nodes, expectedKind, rootComposerKind) {
      return nodes.filter((node) => composerNodeKind(node, rootComposerKind) === expectedKind).length;
    }
    function describeNode(node) {
      if (!node) return 'none';
      if (node.nodeType !== 1) return cleanValue(node.nodeName || 'node').toLowerCase();
      const bits = [cleanValue(node.tagName || node.nodeName || 'node').toLowerCase()];
      if (node.id) bits.push(`#${node.id}`);
      if (node.getAttribute && node.getAttribute('data-gg-composer-focus-shell') === '1') bits.push('[composer-shell]');
      if (node.closest && node.closest('#gg-composer-slot')) bits.push('[composer-slot]');
      return cleanValue(bits.join(''));
    }
    function focusKind(node, rootComposerKind) {
      if (!node || !node.matches) return 'none';
      if (node.id === 'comment-editor') return 'native';
      if (node.matches('textarea, input:not([type="hidden"]), [contenteditable="true"]') && node.closest('#gg-composer-slot')) {
        return composerNodeKind(node, rootComposerKind);
      }
      if (node.getAttribute && node.getAttribute('data-gg-composer-focus-shell') === '1') {
        if (rootComposerKind === 'native') return 'native-shell';
        if (rootComposerKind === 'fallback') return 'fallback-shell';
        return 'missing-shell';
      }
      return 'other';
    }
    function footerInView(root) {
      const footer = root && root.querySelector ? root.querySelector('.gg-comments__footer') : null;
      const panel = document.querySelector('#ggPanelComments');
      const body = panel && panel.querySelector ? panel.querySelector('.gg-comments-panel__body') : null;
      if (!footer || !body) return false;
      const rect = footer.getBoundingClientRect();
      const bodyRect = body.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight || 0;
      if (rect.bottom <= 0 || rect.top >= viewportH) return false;
      return rect.top >= (bodyRect.top - 1) && rect.bottom <= (bodyRect.bottom + 1);
    }
    function composerSignature(nodes) {
      return nodes.map((node) => node.id || cleanValue(node.className) || node.nodeName.toLowerCase()).join(',');
    }

    const main = document.querySelector('main.gg-main');
    const panel = document.querySelector('#ggPanelComments');
    const root = panel && panel.querySelector ? panel.querySelector('#comments') : null;
    const footer = root && root.querySelector ? root.querySelector('.gg-comments__footer') : null;
    const composerKind = cleanValue(root && root.getAttribute ? root.getAttribute('data-gg-composer-kind') : '') || 'missing';
    const composerReason = cleanValue(root && root.getAttribute ? root.getAttribute('data-gg-composer-reason') : '') || 'missing';
    const comments = root ? visibleAll('#cmt2-holder li.comment', root) : [];
    const interactive = root ? interactiveComments(root) : [];
    const footerAddOwners = root ? visibleAll('.gg-comments__footer #gg-top-continue .comment-reply', root) : [];
    const footerComposerOwners = root ? visibleAll('.gg-comments__composerslot > #top-ce, .gg-comments__composerslot > .comment-replybox-single, .gg-comments__composerslot > .comment-replybox-thread', root).filter(hasComposerField) : [];
    const inlineComposerOwners = root ? visibleAll('#cmt2-holder > #top-ce, #cmt2-holder > .comment-replybox-thread, #cmt2-holder li.comment > .comment-replybox-single, #cmt2-holder li.comment > .comment-replybox-thread', root).filter(hasComposerField) : [];
    const nativePeers = root ? visibleAll('#cmt2-holder #top-continue, #cmt2-holder .continue, #cmt2-holder .item-control, #cmt2-holder .thread-toggle, #cmt2-holder .thread-count, #cmt2-holder a.comment-reply:not(.cmt2-reply-action), #cmt2-holder > #top-ce, #cmt2-holder > .comment-replybox-thread, #cmt2-holder li.comment > .comment-replybox-single, #cmt2-holder li.comment > .comment-replybox-thread', root) : [];
    const deletePeers = [];
    const replyOwnerFailures = [];
    const moreOwnerFailures = [];
    const toggleOwnerFailures = [];
    let firstReplyId = '';

    interactive.forEach((comment) => {
      const key = commentKey(comment);
      const replyOwners = visibleAll('.comment-actions .cmt2-reply-action', comment);
      const moreOwners = visibleAll('.comment-actions .cmt2-ctx', comment);
      const toggleOwners = visibleAll('.comment-actions .cmt2-thread-toggle', comment);
      const deleteOwnerPeers = visibleAll('.comment-footer .comment-delete, .comment-actions .comment-delete, .comment-footer .cmt2-del, .comment-actions .cmt2-del, .gg-cmt2__del, .item-control', comment);
      const childCount = directReplyCount(comment);
      if (replyOwners.length !== 1) replyOwnerFailures.push(`${key}:${replyOwners.length}`);
      if (moreOwners.length !== 1) moreOwnerFailures.push(`${key}:${moreOwners.length}`);
      if (childCount > 0 && toggleOwners.length !== 1) toggleOwnerFailures.push(`${key}:expected1:${toggleOwners.length}`);
      if (childCount === 0 && toggleOwners.length !== 0) toggleOwnerFailures.push(`${key}:expected0:${toggleOwners.length}`);
      if (moreOwners.length > 0 && deleteOwnerPeers.length > 0) deletePeers.push(key);
      if (!firstReplyId && replyOwners.length === 1) firstReplyId = key;
    });

    return {
      url: location.href,
      mainRightMode: cleanValue(main && main.getAttribute ? main.getAttribute('data-gg-right-mode') : ''),
      panelVisible: visible(panel),
      rootVisible: visible(root),
      commentCount: comments.length,
      interactiveCount: interactive.length,
      hasFooterCta: !!(footer && footer.getAttribute && footer.getAttribute('data-gg-has-cta') !== '0'),
      footerAddOwnerCount: footerAddOwners.length,
      composerKind,
      composerReason,
      footerComposerCount: footerComposerOwners.length,
      footerComposerSignature: composerSignature(footerComposerOwners),
      footerComposerKinds: composerKinds(footerComposerOwners, composerKind),
      footerNativeComposerCount: composerCountByKind(footerComposerOwners, 'native', composerKind),
      footerFallbackComposerCount: composerCountByKind(footerComposerOwners, 'fallback', composerKind),
      inlineComposerCount: inlineComposerOwners.length,
      inlineComposerSignature: composerSignature(inlineComposerOwners),
      inlineComposerKinds: composerKinds(inlineComposerOwners, composerKind),
      inlineNativeComposerCount: composerCountByKind(inlineComposerOwners, 'native', composerKind),
      inlineFallbackComposerCount: composerCountByKind(inlineComposerOwners, 'fallback', composerKind),
      replyMode: cleanValue(root && root.getAttribute ? root.getAttribute('data-gg-reply-mode') : 'default') || 'default',
      footerOpen: cleanValue(root && root.getAttribute ? root.getAttribute('data-gg-footer-open') : '0') || '0',
      replyBannerCount: root ? visibleAll('.cmt2-replying', root).length : 0,
      activeElement: describeNode(document.activeElement),
      focusKind: focusKind(document.activeElement, composerKind),
      footerInView: root ? footerInView(root) : false,
      focusScrolled: cleanValue(root && root.getAttribute ? root.getAttribute('data-gg-composer-focus-scrolled') : '0') || '0',
      focusFallbackUsed: cleanValue(root && root.getAttribute ? root.getAttribute('data-gg-composer-focus-fallback') : '0') || '0',
      nativeEditorReady: cleanValue(root && root.getAttribute ? root.getAttribute('data-gg-composer-focus-native-ready') : '0') || '0',
      focusState: cleanValue(root && root.getAttribute ? root.getAttribute('data-gg-composer-focus') : '') || 'missing',
      focusTarget: cleanValue(root && root.getAttribute ? root.getAttribute('data-gg-composer-focus-target') : '') || 'missing',
      nativePeerCount: nativePeers.length,
      deletePeerFailures: deletePeers,
      replyOwnerFailures,
      moreOwnerFailures,
      toggleOwnerFailures,
      firstReplyId,
      proofState: cleanValue(root && root.getAttribute ? root.getAttribute('data-gg-comment-proof') : ''),
      proofCount: cleanValue(root && root.getAttribute ? root.getAttribute('data-gg-comment-proof-count') : ''),
      visibleCommentsSurfaces: visibleAll('#comments', document).length,
      visibleOffPanelSurfaces: visibleAll('#comments', document).filter((node) => !node.closest('#ggPanelComments')).length
    };
  });
}

async function main() {
  const launchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  };
  if (executablePath) launchOptions.executablePath = executablePath;
  let browser = null;
  let browserName = 'chromium';
  try {
    browser = await chromium.launch(launchOptions);
  } catch (error) {
    const detail = clean(error && error.message ? error.message : error);
    if (/executable doesn't exist|please run the following command|playwright install|browserType\.launch|failed to launch/i.test(detail)) {
      try {
        browser = await firefox.launch({ headless: true });
        browserName = 'firefox';
      } catch (fallbackError) {
        const fallbackDetail = clean(fallbackError && fallbackError.message ? fallbackError.message : fallbackError);
        console.log(`BROWSER|infra|${detail || 'browser-launch-unavailable'} || fallback=${fallbackDetail || 'firefox-launch-unavailable'}`);
        return;
      }
    } else {
      throw error;
    }
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });
  const runtimeErrors = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const loc = msg.location ? msg.location() : {};
    const payload = `${msg.text ? msg.text() : ''} ${(loc && loc.url) || ''}`;
    if (isCommentRuntimeMessage(payload)) runtimeErrors.push(clean(payload));
  });
  page.on('pageerror', (error) => {
    const payload = `${error && error.message ? error.message : error} ${error && error.stack ? error.stack : ''}`;
    if (isCommentRuntimeMessage(payload)) runtimeErrors.push(clean(payload));
  });
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    try { await page.waitForLoadState('networkidle', { timeout: 45000 }); } catch (_) {}
    await page.waitForTimeout(1200);

    const commentsToggle = page.locator('[data-gg-postbar="comments"]');
    if (await commentsToggle.count()) {
      await commentsToggle.first().click();
    }
    await page.waitForFunction(() => {
      const panel = document.querySelector('#ggPanelComments');
      const root = panel && panel.querySelector ? panel.querySelector('#comments') : null;
      const main = document.querySelector('main.gg-main');
      if (!panel || !root || !main) return false;
      const style = window.getComputedStyle(root);
      return !panel.hidden &&
        main.getAttribute('data-gg-right-mode') === 'comments' &&
        style &&
        style.display !== 'none' &&
        style.visibility !== 'hidden';
    }, { timeout: 20000 });
    await page.waitForTimeout(1400);

    const before = await captureState(page);
    let afterAdd = before;
    let afterReply = before;

    if (before.hasFooterCta) {
      const addBtn = page.locator('#ggPanelComments .gg-comments__footer #gg-top-continue .comment-reply').first();
      if (await addBtn.count()) {
        await addBtn.click();
        await page.waitForTimeout(1800);
        afterAdd = await captureState(page);
      }
    }

    if (before.firstReplyId) {
      const replyBtn = page.locator(`#ggPanelComments #c${before.firstReplyId} .comment-actions .cmt2-reply-action`).first();
      if (await replyBtn.count()) {
        await replyBtn.click();
        await page.waitForTimeout(2000);
        afterReply = await captureState(page);
      }
    }

    let focusState = notApplicable('composer-not-available');
    if (before.hasFooterCta) {
      const addFocusOk = afterAdd.footerOpen === '1' &&
        afterAdd.composerKind === 'native' &&
        (afterAdd.focusKind === 'native' || afterAdd.focusKind === 'native-shell');
      const replyFocusOk = before.firstReplyId
        ? afterReply.replyMode === 'reply' &&
          afterReply.composerKind === 'native' &&
          (afterReply.focusKind === 'native' || afterReply.focusKind === 'native-shell')
        : true;
      focusState = state(
        addFocusOk && replyFocusOk,
        [
          `before=${before.activeElement}`,
          `afterOpen=${afterAdd.activeElement}:${afterAdd.focusKind}`,
          `afterReply=${afterReply.activeElement}:${afterReply.focusKind}`,
          `kind=${afterAdd.composerKind}/${afterReply.composerKind}`,
          `reason=${afterAdd.composerReason}/${afterReply.composerReason}`,
          `composer=${afterAdd.footerOpen}`,
          `replyMode=${afterReply.replyMode}`,
          `footerInView=${afterAdd.footerInView ? 1 : 0}/${afterReply.footerInView ? 1 : 0}`,
          `scrolled=${afterAdd.focusScrolled}/${afterReply.focusScrolled}`,
          `fallback=${afterAdd.focusFallbackUsed}/${afterReply.focusFallbackUsed}`,
          `nativeReady=${afterAdd.nativeEditorReady}/${afterReply.nativeEditorReady}`,
          `focusState=${afterAdd.focusState}/${afterReply.focusState}`,
          `focusTarget=${afterAdd.focusTarget}/${afterReply.focusTarget}`
        ].join(';')
      );
    }

    const results = [];
    results.push({
      id: 'panel-open',
      ...state(
        before.panelVisible && before.rootVisible && before.mainRightMode === 'comments',
        `panel=${before.panelVisible ? 1 : 0};root=${before.rootVisible ? 1 : 0};mode=${before.mainRightMode || 'missing'}`
      )
    });
    results.push({
      id: 'comment-count',
      ...state(before.commentCount === expectedCount, `expected=${expectedCount};actual=${before.commentCount}`)
    });
    results.push({
      id: 'single-surface',
      ...state(
        before.visibleCommentsSurfaces === 1 && before.visibleOffPanelSurfaces === 0,
        `visible=${before.visibleCommentsSurfaces};offPanel=${before.visibleOffPanelSurfaces}`
      )
    });
    results.push({
      id: 'footer-add-owner',
      ...(before.hasFooterCta
        ? state(before.footerAddOwnerCount === 1, `visibleAddOwners=${before.footerAddOwnerCount};kind=${before.composerKind};reason=${before.composerReason}`)
        : state(before.footerAddOwnerCount === 0, `visibleAddOwners=${before.footerAddOwnerCount};cta=disabled;kind=${before.composerKind};reason=${before.composerReason}`))
    });
    results.push({
      id: 'composer-kind',
      ...(before.hasFooterCta
        ? state(
            afterAdd.composerKind === 'native',
            `kind=${afterAdd.composerKind};reason=${afterAdd.composerReason};footer=${afterAdd.footerComposerKinds || 'none'};inline=${afterAdd.inlineComposerKinds || 'none'}`
          )
        : notApplicable(`kind=${before.composerKind};reason=${before.composerReason};cta=disabled`))
    });
    results.push({
      id: 'footer-composer',
      ...(before.hasFooterCta
        ? state(
            afterAdd.composerKind === 'native' &&
            afterAdd.footerComposerCount === 1 &&
            afterAdd.footerNativeComposerCount === 1 &&
            afterAdd.footerFallbackComposerCount === 0 &&
            afterAdd.inlineComposerCount === 0 &&
            afterAdd.inlineNativeComposerCount === 0 &&
            afterAdd.inlineFallbackComposerCount === 0,
            `kind=${afterAdd.composerKind};reason=${afterAdd.composerReason};footer=${afterAdd.footerComposerCount}:${afterAdd.footerComposerSignature || 'missing'}:${afterAdd.footerComposerKinds || 'none'};inline=${afterAdd.inlineComposerCount}:${afterAdd.inlineComposerSignature || 'none'}:${afterAdd.inlineComposerKinds || 'none'};open=${afterAdd.footerOpen}`
          )
        : notApplicable('new-comments-disabled'))
    });
    results.push({
      id: 'reply-footer',
      ...(before.firstReplyId
        ? state(
            afterReply.composerKind === 'native' &&
            afterReply.footerComposerCount === 1 &&
            afterReply.footerNativeComposerCount === 1 &&
            afterReply.footerFallbackComposerCount === 0 &&
            afterReply.inlineComposerCount === 0 &&
            afterReply.inlineNativeComposerCount === 0 &&
            afterReply.inlineFallbackComposerCount === 0 &&
            afterReply.replyMode === 'reply' &&
            afterReply.replyBannerCount === 1,
            `kind=${afterReply.composerKind};reason=${afterReply.composerReason};footer=${afterReply.footerComposerCount}:${afterReply.footerComposerSignature || 'missing'}:${afterReply.footerComposerKinds || 'none'};inline=${afterReply.inlineComposerCount}:${afterReply.inlineComposerSignature || 'none'}:${afterReply.inlineComposerKinds || 'none'};replyMode=${afterReply.replyMode};banner=${afterReply.replyBannerCount}`
          )
        : notApplicable('no-eligible-reply'))
    });
    results.push({
      id: 'native-hidden',
      ...state(
        before.nativePeerCount === 0 && before.deletePeerFailures.length === 0,
        `nativePeers=${before.nativePeerCount};deletePeers=${before.deletePeerFailures.join(',') || 'ok'}`
      )
    });
    results.push({
      id: 'unique-owners',
      ...state(
        before.replyOwnerFailures.length === 0 &&
        before.moreOwnerFailures.length === 0 &&
        before.toggleOwnerFailures.length === 0,
        `reply=${before.replyOwnerFailures.join(',') || 'ok'};more=${before.moreOwnerFailures.join(',') || 'ok'};toggle=${before.toggleOwnerFailures.join(',') || 'ok'}`
      )
    });
    results.push({
      id: 'runtime-proof',
      ...state(before.proofState === 'ok', `proof=${before.proofState || 'missing'}:${before.proofCount || 'missing'}`)
    });
    results.push({
      id: 'runtime-errors',
      ...state(runtimeErrors.length === 0, runtimeErrors.length ? runtimeErrors.join(' || ') : 'ok')
    });
    results.push({
      id: 'focus-footer',
      ...focusState
    });

    console.log(`META|case=${caseName};browser=${browserName};url=${before.url};expected=${expectedCount};actual=${before.commentCount};composerKind=${before.composerKind};composerReason=${before.composerReason};proof=${clean(before.proofState) || 'missing'};proofCount=${clean(before.proofCount) || 'missing'}`);
    console.log(`DEBUG|case=${caseName};browser=${browserName};panel=${before.panelVisible ? 1 : 0};composerOpen=${afterAdd.footerOpen};replyMode=${afterReply.replyMode};composerKind=${before.composerKind}/${afterAdd.composerKind}/${afterReply.composerKind};composerReason=${before.composerReason}/${afterAdd.composerReason}/${afterReply.composerReason};before=${before.activeElement};afterOpen=${afterAdd.activeElement}:${afterAdd.focusKind};afterReply=${afterReply.activeElement}:${afterReply.focusKind};footerInView=${afterAdd.footerInView ? 1 : 0}/${afterReply.footerInView ? 1 : 0};scrolled=${afterAdd.focusScrolled}/${afterReply.focusScrolled};fallback=${afterAdd.focusFallbackUsed}/${afterReply.focusFallbackUsed};nativeReady=${afterAdd.nativeEditorReady}/${afterReply.nativeEditorReady}`);
    for (const row of results) {
      const rowState = row.skip ? 'na' : (row.pass ? 'pass' : 'fail');
      console.log(`CRITERION|${row.id}|${rowState}|${row.detail}`);
    }
  } finally {
    await page.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

main().catch((error) => {
  console.log(`BROWSER|fail|${clean(error && error.message ? error.message : error)}`);
  process.exit(0);
});
NODE
  status=$?

  if [[ "$status" -ne 0 ]]; then
    comments_owner_signal "comments owner contract runner exited unexpectedly (status=${status})"
    return 0
  fi

  while IFS= read -r line; do
    [[ -n "$line" ]] || continue
    if [[ "$line" == META\|* ]]; then
      printf 'SMOKE comments-owner %s target=%s\n' "${line#META|}" "$path"
      continue
    fi
    if [[ "$line" == DEBUG\|* ]]; then
      printf 'SMOKE comments-owner-debug %s target=%s\n' "${line#DEBUG|}" "$path"
      continue
    fi
    if [[ "$line" == BROWSER\|infra\|* ]]; then
      log_warn "comments owner browser dependency unavailable case=${case_name} (${line#BROWSER|infra|})"
      continue
    fi
    if [[ "$line" == BROWSER\|fail\|* ]]; then
      comments_owner_signal "comments owner browser proof unavailable case=${case_name} (${line#BROWSER|fail|})"
      continue
    fi
    if [[ "$line" == CRITERION\|* ]]; then
      local rest="${line#CRITERION|}"
      local id="${rest%%|*}"
      rest="${rest#*|}"
      local state="${rest%%|*}"
      local detail="${rest#*|}"
      printf 'SMOKE comments-owner case=%s criterion=%s state=%s detail=%s\n' "$case_name" "$id" "$state" "$detail"
      if [[ "$state" == "fail" ]]; then
        comments_owner_signal "comments owner case=${case_name} criterion=${id} failed (${detail})"
      fi
    fi
  done < "$report_file"
}

check_surface() {
  local path="$1"
  local expected_status="$2"
  local expected_final="$3"
  local expected_canonical="$4"
  local expected_og="$5"
  local expected_surface="$6"
  local expected_page="$7"
  local expected_home_state="${8:-}"
  local expected_edited="${9:-ignore}"
  local expected_redirect_min="${10:-0}"

  local file="$tmp_dir/$(safe_file_name "$path").html"
  local scan_file="$tmp_dir/$(safe_file_name "${path}_scan").html"
  local meta final status redirects canonical og title desc surface page home_state edited_present
  local meta_rest
  meta="$(fetch_page "$path" "$file")"
  strip_inert_markup "$file" "$scan_file"
  final="${meta%%|*}"
  meta_rest="${meta#*|}"
  status="${meta_rest%%|*}"
  redirects="${meta_rest##*|}"
  canonical="$(extract_canonical "$file")"
  og="$(extract_og_url "$file")"
  title="$(extract_title "$file")"
  desc="$(grep -Eoi "<meta[^>]+name=['\\\"]description['\\\"][^>]*>" "$file" | head -n 1 || true)"
  desc="$(extract_attr_from_tag "$desc" "content")"
  surface="$(extract_body_attr "$file" "data-gg-surface")"
  page="$(extract_body_attr "$file" "data-gg-page")"
  home_state="$(extract_main_attr "$file" "data-gg-home-state")"
  if grep -q "Edited by pakrpp\\." "$file"; then
    edited_present="yes"
  else
    edited_present="no"
  fi

  printf 'SMOKE path=%s final=%s status=%s redirects=%s canonical=%s og=%s surface=%s page=%s home_state=%s edited_by_pakrpp=%s title=%s desc=%s\n' \
    "$path" "$final" "$status" "$redirects" "$canonical" "$og" "$surface" "$page" "$home_state" "$edited_present" "$title" "$desc"

  assert_equal "$status" "$expected_status" "$path status"
  assert_equal "$final" "$expected_final" "$path final URL"
  assert_equal "$canonical" "$expected_canonical" "$path canonical"
  assert_equal "$og" "$expected_og" "$path og:url"
  assert_equal "$surface" "$expected_surface" "$path data-gg-surface"
  assert_equal "$page" "$expected_page" "$path data-gg-page"
  if [[ -n "$expected_home_state" ]]; then
    assert_equal "$home_state" "$expected_home_state" "$path data-gg-home-state"
  fi
  if [[ "$expected_edited" == "present" ]]; then
    assert_equal "$edited_present" "yes" "$path Edited by pakrpp marker"
  elif [[ "$expected_edited" == "absent" ]]; then
    assert_equal "$edited_present" "no" "$path Edited by pakrpp marker"
  fi
  assert_no_placeholder_strings "$scan_file" "$path"
  if [[ "$path" == "/" || "$path" == "/landing" || "$path" == "/landing/" ]]; then
    assert_no_empty_editorial_shell "$scan_file" "$path"
  fi
  if [[ "$path" == "/" ]]; then
    assert_listing_idle_chrome_not_readable "$scan_file" "$path"
  fi
  check_surface_ownership_contract "$scan_file" "$path" "$expected_surface"

  if [[ "$canonical" == *"/blog"* || "$og" == *"/blog"* ]]; then
    log_fail "$path canonical/og contains forbidden /blog leakage"
  fi
  if [[ "$expected_redirect_min" =~ ^[0-9]+$ ]] && [[ "$redirects" =~ ^[0-9]+$ ]] && (( redirects < expected_redirect_min )); then
    log_fail "$path redirect count below required minimum ($redirects < $expected_redirect_min)"
  fi
  if [[ -n "$redirects" ]] && [[ "$redirects" =~ ^[0-9]+$ ]] && (( redirects > 8 )); then
    log_fail "$path unexpected redirect depth ($redirects)"
  fi
}

check_dock_truth() {
  local file="$tmp_dir/$(safe_file_name "dock_root").html"
  fetch_page "/" "$file" >/dev/null

  local home_href blog_href contact_href home_norm blog_norm contact_norm
  home_href="$(extract_dock_href "$file" "home")"
  blog_href="$(extract_dock_href "$file" "blog")"
  contact_href="$(extract_dock_href "$file" "contact")"
  home_norm="$(normalize_href "$home_href")"
  blog_norm="$(normalize_href "$blog_href")"
  contact_norm="$(normalize_href "$contact_href")"

  printf 'SMOKE dock home=%s blog=%s contact=%s\n' "$home_norm" "$blog_norm" "$contact_norm"

  assert_starts_with "$home_norm" "${BASE_URL}/landing" "dock home href"
  assert_equal "$blog_norm" "${BASE_URL}/" "dock blog href"
  assert_starts_with "$contact_norm" "${BASE_URL}/landing" "dock contact href"
}

check_discovered_detail_paths() {
  local listing_file="$tmp_dir/$(safe_file_name "discovery_root").html"
  local post_path=""
  local page_path=""
  fetch_page "/" "$listing_file" >/dev/null

  post_path="$(discover_first_post_path "$listing_file" || true)"
  if [[ -z "$post_path" ]]; then
    log_fail "unable to discover a real post URL from /"
  else
    printf 'SMOKE discovered post=%s\n' "$post_path"
    check_surface "$post_path" "200" "$(absolute_for_path "$post_path")" "$(absolute_for_path "$post_path")" "$(absolute_for_path "$post_path")" "post" "post" "blog" "ignore"
  fi

  page_path="$(discover_first_page_path "$listing_file" || true)"
  if [[ -z "$page_path" ]]; then
    log_warn "no real page URL discovered from /; skipped page check"
  else
    printf 'SMOKE discovered page=%s\n' "$page_path"
    check_surface "$page_path" "200" "$(absolute_for_path "$page_path")" "$(absolute_for_path "$page_path")" "$(absolute_for_path "$page_path")" "page" "page" "blog" "ignore"
  fi

  check_listing_card_metadata "$listing_file"
}

is_truthy() {
  local value
  value="$(printf '%s' "${1:-}" | tr '[:upper:]' '[:lower:]')"
  [[ "$value" == "1" || "$value" == "true" || "$value" == "yes" || "$value" == "on" ]]
}

template_drift_signal() {
  local message="$1"
  if [[ "$TEMPLATE_DRIFT_MODE" == "fail" ]]; then
    log_fail "$message"
  else
    log_warn "$message"
  fi
  if [[ "${GITHUB_ACTIONS:-}" == "true" ]]; then
    printf '::warning title=Template fingerprint drift::%s\n' "$message"
  fi
}

check_template_fingerprint_drift() {
  local file="$tmp_dir/$(safe_file_name "template_fp_root").html"
  local repo_expected=""
  local repo_embedded=""
  local live_observed=""
  local changed_prefix=""
  local result_line=""

  fetch_page "/" "$file" >/dev/null

  if ! repo_expected="$(node qa/template-fingerprint.mjs --value 2>/dev/null)"; then
    log_fail "unable to compute repo template fingerprint from index.prod.xml"
    return
  fi
  if ! repo_embedded="$(node qa/template-fingerprint.mjs --embedded 2>/dev/null)"; then
    log_fail "unable to read embedded template fingerprint marker from index.prod.xml"
    return
  fi
  live_observed="$(extract_template_fingerprint "$file")"

  printf 'SMOKE template-fingerprint repo_expected=%s repo_embedded=%s live_observed=%s mode=%s changed_in_rev=%s\n' \
    "$repo_expected" "$repo_embedded" "${live_observed:-missing}" "$TEMPLATE_DRIFT_MODE" "$TEMPLATE_CHANGED_IN_REV"

  if [[ "$repo_expected" != "$repo_embedded" ]]; then
    log_fail "repo template fingerprint marker stale (embedded='$repo_embedded' expected='$repo_expected'). Run: node qa/template-fingerprint.mjs --write"
    template_release_state="blogger_template_drift_detected"
    template_release_note="Repo template fingerprint marker stale."
  fi

  if [[ -z "$live_observed" ]]; then
    if is_truthy "$TEMPLATE_CHANGED_IN_REV"; then
      changed_prefix="index.prod.xml changed in this revision; "
    fi
    template_drift_signal "${changed_prefix}live marker 'data-gg-template-fingerprint' is missing. Worker/assets deployed does not publish Blogger template; manual Blogger template publish required."
    result_line="marker_missing"
    template_release_state="blogger_template_publish_required"
    template_release_note="Manual Blogger template publish still required."
  elif [[ "$live_observed" != "$repo_expected" ]]; then
    if is_truthy "$TEMPLATE_CHANGED_IN_REV"; then
      changed_prefix="index.prod.xml changed in this revision; "
    fi
    template_drift_signal "${changed_prefix}live template fingerprint drift (repo='${repo_expected}', live='${live_observed}'). Worker/assets deployed does not publish Blogger template; manual Blogger template publish required."
    result_line="drift"
    template_release_state="blogger_template_drift_detected"
    template_release_note="Blogger template drift detected."
  else
    printf 'SMOKE template-fingerprint parity=match (%s)\n' "$repo_expected"
    result_line="match"
    template_release_state="blogger_template_parity_verified"
    template_release_note="Blogger template parity verified."
  fi

  if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
    {
      echo "### Template Fingerprint Check"
      echo "- Repo expected: \`${repo_expected}\`"
      echo "- Repo embedded: \`${repo_embedded}\`"
      echo "- Live observed: \`${live_observed:-missing}\`"
      echo "- Result: \`${result_line}\`"
      echo "- State candidate: \`${template_release_state}\`"
      if [[ "$result_line" != "match" ]]; then
        echo "- Manual Blogger template publish is required for full parity."
      fi
    } >> "$GITHUB_STEP_SUMMARY"
  fi
}

emit_release_state() {
  local final_state="worker_assets_deployed_and_verified"
  local final_note="Worker/assets public contract verified."
  local contract_state="worker_assets_contract_passed"

  if [[ "$worker_rollout_state" == "worker_assets_rollout_pending" ]]; then
    final_state="worker_assets_rollout_pending"
    final_note="$worker_rollout_note"
    contract_state="contract_failed"
  elif [[ "$failures" -gt 0 ]]; then
    final_state="contract_failed"
    final_note="Public contract checks failed."
    contract_state="contract_failed"
  elif [[ "$template_release_state" != "blogger_template_parity_verified" && "$template_release_state" != "blogger_template_parity_unknown" ]]; then
    final_state="worker_assets_deployed_only__blogger_template_publish_required"
    final_note="$template_release_note"
  fi

  printf 'SMOKE worker-state=%s note=%s expected=%s observed=%s final=%s\n' \
    "$worker_rollout_state" "$worker_rollout_note" "${EXPECTED_WORKER_VERSION:-unset}" "${worker_live_version:-missing}" "${worker_rollout_final_url:-unknown}"
  printf 'SMOKE template-state=%s note=%s\n' "$template_release_state" "$template_release_note"
  printf 'SMOKE contract-state=%s failures=%s warnings=%s\n' "$contract_state" "$failures" "$warnings"
  printf 'SMOKE release-state=%s note=%s\n' "$final_state" "$final_note"
  if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
    {
      echo "### Release State"
      echo "- Worker state: \`${worker_rollout_state}\`"
      echo "- Worker note: ${worker_rollout_note}"
      echo "- Expected worker version: \`${EXPECTED_WORKER_VERSION:-unset}\`"
      echo "- Observed worker version: \`${worker_live_version:-missing}\`"
      echo "- Template state: \`${template_release_state}\`"
      echo "- Template note: ${template_release_note}"
      echo "- Contract state: \`${contract_state}\`"
      echo "- Final state: \`${final_state}\`"
      echo "- Final note: ${final_note}"
    } >> "$GITHUB_STEP_SUMMARY"
  fi
}

check_worker_rollout
check_template_fingerprint_drift

if [[ "$worker_rollout_state" == "worker_assets_rollout_pending" && "$WORKER_VERSION_MODE" == "fail" ]]; then
  emit_release_state
  printf 'LIVE SMOKE RESULT: FAILED (worker rollout pending)\n' >&2
  exit 1
fi

check_surface "/" "200" "${BASE_URL}/" "${BASE_URL}/" "${BASE_URL}/" "listing" "listing" "blog" "ignore"
check_surface "/landing" "200" "${BASE_URL}/landing" "${BASE_URL}/landing" "${BASE_URL}/landing" "landing" "home" "landing" "ignore"
check_surface "/blog" "200" "${BASE_URL}/" "${BASE_URL}/" "${BASE_URL}/" "listing" "listing" "blog" "ignore" "1"
check_surface "/landing/" "200" "${BASE_URL}/landing" "${BASE_URL}/landing" "${BASE_URL}/landing" "landing" "home" "landing" "ignore"
check_surface "/?view=blog" "200" "${BASE_URL}/" "${BASE_URL}/" "${BASE_URL}/" "listing" "listing" "blog" "ignore"
check_surface "/?view=landing" "200" "${BASE_URL}/landing" "${BASE_URL}/landing" "${BASE_URL}/landing" "landing" "home" "landing" "ignore"
check_dock_truth
check_discovered_detail_paths
check_listing_preview_runtime_contract
check_comments_owner_contract
emit_release_state

if [[ "$failures" -gt 0 ]]; then
  printf 'LIVE SMOKE RESULT: FAILED (%s)\n' "$failures" >&2
  exit 1
fi

if [[ "$warnings" -gt 0 ]]; then
  printf 'LIVE SMOKE RESULT: PASS_WITH_WARNINGS (%s)\n' "$warnings"
  exit 0
fi

printf 'LIVE SMOKE RESULT: PASS\n'
