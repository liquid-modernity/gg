#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-${GG_LIVE_BASE_URL:-https://www.pakrpp.com}}"
BASE_URL="${BASE_URL%/}"
UA="Mozilla/5.0 (gg-template-proof)"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

contract_failures=0

log_fail() {
  contract_failures=$((contract_failures + 1))
  printf 'FAIL: %s\n' "$1" >&2
}

fetch_page() {
  local path="$1"
  local out_file="$2"
  local meta=""
  local attempt=1
  local max_attempts=3
  local target="${BASE_URL}${path}"

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

  : > "$out_file"
  printf '%s|000|0\n' "$target"
}

extract_attr_from_tag() {
  local tag="$1"
  local attr="$2"
  printf '%s' "$tag" | sed -nE "s/.*[[:space:]]${attr}=['\\\"]([^'\\\"]+)['\\\"].*/\\1/p" | head -n 1
}

extract_canonical() {
  local file="$1"
  local tag=""
  tag="$(grep -Eoi "<link[^>]+rel=['\\\"]canonical['\\\"][^>]*>" "$file" 2>/dev/null | head -n 1 || true)"
  extract_attr_from_tag "$tag" "href"
}

extract_og_url() {
  local file="$1"
  local tag=""
  tag="$(grep -Eoi "<meta[^>]+property=['\\\"]og:url['\\\"][^>]*>" "$file" 2>/dev/null | head -n 1 || true)"
  extract_attr_from_tag "$tag" "content"
}

extract_body_attr() {
  local file="$1"
  local attr="$2"
  local tag=""
  tag="$(grep -Eoi '<body[^>]*>' "$file" 2>/dev/null | head -n 1 || true)"
  extract_attr_from_tag "$tag" "$attr"
}

extract_main_attr() {
  local file="$1"
  local attr="$2"
  local tag=""
  tag="$(grep -Eoi "<main[^>]+class=['\\\"][^'\\\"]*gg-main[^'\\\"]*['\\\"][^>]*>" "$file" 2>/dev/null | head -n 1 || true)"
  extract_attr_from_tag "$tag" "$attr"
}

extract_template_fingerprint() {
  local file="$1"
  node qa/template-fingerprint.mjs --extract-live --file "$file" 2>/dev/null || true
}

evaluate_empty_editorial_shell() {
  local file="$1"
  node - "$file" <<'NODE'
const fs = require('node:fs');
const file = process.argv[2];
let html = '';
try {
  html = fs.readFileSync(file, 'utf8');
} catch {
  process.stdout.write('FAIL|unable-to-read-html');
  process.exit(0);
}
if (!html.trim()) {
  process.stdout.write('FAIL|empty-html');
  process.exit(0);
}

const leaks = new Set();
const visibleText = html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&#8212;|&mdash;|&#x2014;/gi, ' — ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

[
  'Editorial Preview',
  'Title —',
  'Written by —',
  'Date —',
  'Updated —',
  'Comments —',
  'Read time —',
  'Snippet —'
].forEach((phrase) => {
  if (visibleText.includes(phrase)) {
    leaks.add(`visible-text:${phrase}`);
  }
});

const panelMatch = html.match(/<div[^>]*class=(['"])[^'"]*\bgg-editorial-preview\b[^'"]*\1[^>]*>/i);
if (panelMatch && !/\bhidden=(['"])hidden\1/i.test(panelMatch[0])) {
  leaks.add('panel:gg-editorial-preview-visible');
}

const panelLabelChecks = [
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
const panelIconTokenChecks = [
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
[
  'head',
  'thumbnail',
  'title',
  'author',
  'contributors',
  'labels',
  'tags',
  'date',
  'updated',
  'comments',
  'readtime',
  'snippet',
  'toc',
  'cta'
].forEach((row) => {
  const re = new RegExp(`<div[^>]*data-row=(['"])${row}\\1[^>]*>`, 'i');
  const rowTag = html.match(re);
  if (rowTag && !/\bhidden=(['"])hidden\1/i.test(rowTag[0])) {
    leaks.add(`row:${row}:visible`);
  }
});

const stripped = html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ');
let scope = stripped;
const panelStart = stripped.search(/<div[^>]*class=['"][^'"]*\bgg-info-panel__card\b[^'"]*\bgg-editorial-preview\b[^'"]*['"][^>]*>/i);
if (panelStart >= 0) {
  const tail = stripped.slice(panelStart);
  const storeEnd = tail.match(/<a[^>]*data-gg-marker=['"]panel-listing-cta['"][^>]*>[\s\S]*?<\/a>/i);
  if (storeEnd && typeof storeEnd.index === 'number') {
    scope = tail.slice(0, storeEnd.index + storeEnd[0].length + 256);
  } else {
    scope = tail.slice(0, 12000);
  }
}
for (const [name, re] of panelLabelChecks) {
  if (re.test(scope)) leaks.add(`idle-chrome-label:${name}`);
}
for (const [name, re] of panelIconTokenChecks) {
  if (re.test(scope)) leaks.add(`idle-chrome-icon-token:${name}`);
}
if (/<a[^>]*class=['"][^'"]*\bgg-epanel__cta\b[^'"]*['"][^>]*>[\s\S]*?Read this post[\s\S]*?<\/a>/i.test(scope)) {
  leaks.add('idle-chrome-cta:Read this post');
}
if (/<a[^>]*data-gg-marker=['"]panel-listing-cta['"][^>]*>\s*Read this post\s*<\/a>/i.test(scope)) {
  leaks.add('idle-chrome-store-cta:Read this post');
}
const tocRowVisible = /<div[^>]*data-row=(['"])toc\1(?![^>]*\bhidden=(['"])hidden\2)[^>]*>/i.test(stripped);
const tocHasItems = /<ol[^>]*data-gg-slot=(['"])toc\1[^>]*>[\s\S]*?<li\b/i.test(stripped);
if (tocRowVisible && !tocHasItems) {
  leaks.add('toc:visible-without-headings');
}

if (leaks.size > 0) {
  process.stdout.write(`FAIL|${Array.from(leaks).join('; ')}`);
} else {
  process.stdout.write('PASS|none');
}
NODE
}

evaluate_surface_route() {
  local name="$1"
  local status="$2"
  local final="$3"
  local canonical="$4"
  local og="$5"
  local surface="$6"
  local page="$7"
  local expected_final="$8"
  local expected_canonical="$9"
  local expected_og="${10}"
  local expected_surface="${11}"
  local expected_page="${12}"

  local result="PASS"
  if [[ "$status" != "200" || "$final" != "$expected_final" || "$canonical" != "$expected_canonical" || "$og" != "$expected_og" || "$surface" != "$expected_surface" || "$page" != "$expected_page" ]]; then
    result="FAIL"
    log_fail "${name} surface truth mismatch"
  fi

  printf '%s=%s status=%s final=%s canonical=%s og=%s surface=%s page=%s expected_surface=%s expected_page=%s\n' \
    "$name" "$result" "$status" "$final" "$canonical" "$og" "$surface" "$page" "$expected_surface" "$expected_page"
}

root_file="${tmp_dir}/root.html"
landing_file="${tmp_dir}/landing.html"
blog_file="${tmp_dir}/blog.html"

root_meta="$(fetch_page "/" "$root_file")"
landing_meta="$(fetch_page "/landing" "$landing_file")"
blog_meta="$(fetch_page "/blog" "$blog_file")"

root_final="${root_meta%%|*}"
root_rest="${root_meta#*|}"
root_status="${root_rest%%|*}"
root_redirects="${root_rest##*|}"
root_canonical="$(extract_canonical "$root_file")"
root_og="$(extract_og_url "$root_file")"
root_surface="$(extract_body_attr "$root_file" "data-gg-surface")"
root_page="$(extract_body_attr "$root_file" "data-gg-page")"
root_home_state="$(extract_main_attr "$root_file" "data-gg-home-state")"

landing_final="${landing_meta%%|*}"
landing_rest="${landing_meta#*|}"
landing_status="${landing_rest%%|*}"
landing_redirects="${landing_rest##*|}"
landing_canonical="$(extract_canonical "$landing_file")"
landing_og="$(extract_og_url "$landing_file")"
landing_surface="$(extract_body_attr "$landing_file" "data-gg-surface")"
landing_page="$(extract_body_attr "$landing_file" "data-gg-page")"
landing_home_state="$(extract_main_attr "$landing_file" "data-gg-home-state")"

blog_final="${blog_meta%%|*}"
blog_rest="${blog_meta#*|}"
blog_status="${blog_rest%%|*}"
blog_redirects="${blog_rest##*|}"
blog_canonical="$(extract_canonical "$blog_file")"
blog_og="$(extract_og_url "$blog_file")"
blog_surface="$(extract_body_attr "$blog_file" "data-gg-surface")"
blog_page="$(extract_body_attr "$blog_file" "data-gg-page")"

repo_expected="$(node qa/template-fingerprint.mjs --value 2>/dev/null || true)"
repo_embedded="$(node qa/template-fingerprint.mjs --embedded 2>/dev/null || true)"
live_observed="$(extract_template_fingerprint "$root_file")"

fingerprint_state="UNKNOWN"
if [[ -z "$repo_expected" || -z "$repo_embedded" ]]; then
  fingerprint_state="REPO_FINGERPRINT_READ_ERROR"
  log_fail "unable to read repo fingerprint from index.xml"
elif [[ "$repo_expected" != "$repo_embedded" ]]; then
  fingerprint_state="REPO_STALE"
  log_fail "repo fingerprint marker stale (embedded=${repo_embedded} expected=${repo_expected})"
elif [[ -z "$live_observed" ]]; then
  fingerprint_state="MISSING"
elif [[ "$live_observed" == "$repo_expected" ]]; then
  fingerprint_state="MATCH"
else
  fingerprint_state="DRIFT"
fi

if [[ "$root_status" == "200" ]]; then
  root_shell_pair="$(evaluate_empty_editorial_shell "$root_file")"
  root_shell_state="${root_shell_pair%%|*}"
  root_shell_reason="${root_shell_pair#*|}"
else
  root_shell_state="FAIL"
  root_shell_reason="fetch-failed"
fi

if [[ "$landing_status" == "200" ]]; then
  landing_shell_pair="$(evaluate_empty_editorial_shell "$landing_file")"
  landing_shell_state="${landing_shell_pair%%|*}"
  landing_shell_reason="${landing_shell_pair#*|}"
else
  landing_shell_state="FAIL"
  landing_shell_reason="fetch-failed"
fi

if [[ "$root_shell_state" != "PASS" ]]; then
  log_fail "/ empty editorial shell leakage (${root_shell_reason})"
fi
if [[ "$landing_shell_state" != "PASS" ]]; then
  log_fail "/landing empty editorial shell leakage (${landing_shell_reason})"
fi

evaluate_surface_route "/" \
  "$root_status" "$root_final" "$root_canonical" "$root_og" "$root_surface" "$root_page" \
  "${BASE_URL}/" "${BASE_URL}/" "${BASE_URL}/" "listing" "listing"

evaluate_surface_route "/landing" \
  "$landing_status" "$landing_final" "$landing_canonical" "$landing_og" "$landing_surface" "$landing_page" \
  "${BASE_URL}/landing" "${BASE_URL}/landing" "${BASE_URL}/landing" "landing" "landing"

blog_redirect_truth="PASS"
if [[ "$blog_status" != "200" || "$blog_final" != "${BASE_URL}/" || ! "$blog_redirects" =~ ^[0-9]+$ || "$blog_redirects" -lt 1 ]]; then
  blog_redirect_truth="FAIL"
  log_fail "/blog redirect truth mismatch"
fi

release_state="unknown"
release_note="Template release state not determined."
if [[ "$fingerprint_state" == "MISSING" ]]; then
  release_state="blogger_template_publish_required"
  release_note="Worker/assets deployed only; Blogger template publish required."
elif [[ "$fingerprint_state" == "DRIFT" ]]; then
  release_state="blogger_template_drift_detected"
  release_note="Blogger template drift detected."
elif [[ "$fingerprint_state" == "MATCH" && "$contract_failures" -eq 0 ]]; then
  release_state="blogger_template_parity_verified"
  release_note="Blogger template parity verified."
elif [[ "$fingerprint_state" == "MATCH" ]]; then
  release_state="contract_failed"
  release_note="Blogger template fingerprint matches, but public contract checks still fail."
elif [[ "$fingerprint_state" == "REPO_STALE" ]]; then
  release_state="contract_failed"
  release_note="Repo template marker stale; regenerate fingerprint before publish."
else
  release_state="contract_failed"
  release_note="Template release state check failed."
fi

printf 'TEMPLATE PROOF\n'
printf 'base_url=%s\n' "$BASE_URL"
printf 'repo_expected=%s\n' "${repo_expected:-missing}"
printf 'repo_embedded=%s\n' "${repo_embedded:-missing}"
printf 'live_observed=%s\n' "${live_observed:-missing}"
printf 'fingerprint_state=%s\n' "$fingerprint_state"
printf 'release_state=%s\n' "$release_state"
printf 'release_note=%s\n' "$release_note"
printf 'route_root_redirects=%s home_state=%s\n' "$root_redirects" "$root_home_state"
printf 'route_landing_redirects=%s home_state=%s\n' "$landing_redirects" "$landing_home_state"
printf 'route_blog_redirect_only=%s status=%s final=%s redirects=%s canonical=%s og=%s surface=%s page=%s\n' \
  "$blog_redirect_truth" "$blog_status" "$blog_final" "$blog_redirects" "$blog_canonical" "$blog_og" "$blog_surface" "$blog_page"
printf 'empty_shell_root=%s reasons=%s\n' "$root_shell_state" "$root_shell_reason"
printf 'empty_shell_landing=%s reasons=%s\n' "$landing_shell_state" "$landing_shell_reason"

if [[ "$contract_failures" -gt 0 ]]; then
  printf 'TEMPLATE PROOF RESULT=FAIL contract_failures=%s\n' "$contract_failures" >&2
  exit 1
fi

if [[ "$fingerprint_state" != "MATCH" ]]; then
  printf 'TEMPLATE PROOF RESULT=DRIFT_OR_MISSING fingerprint_state=%s\n' "$fingerprint_state" >&2
  exit 2
fi

printf 'TEMPLATE PROOF RESULT=PASS\n'
