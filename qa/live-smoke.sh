#!/usr/bin/env bash
set -euo pipefail

export LC_ALL=C

BASE_URL="${1:-https://www.pakrpp.com}"
BASE_URL="${BASE_URL%/}"
UA="Mozilla/5.0 (gg-live-smoke)"
TEMPLATE_DRIFT_MODE="${GG_TEMPLATE_DRIFT_MODE:-warn}"
TEMPLATE_CHANGED_IN_REV="${GG_TEMPLATE_CHANGED_IN_REV:-0}"

if [[ "$TEMPLATE_DRIFT_MODE" != "warn" && "$TEMPLATE_DRIFT_MODE" != "fail" ]]; then
  TEMPLATE_DRIFT_MODE="warn"
fi

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

failures=0
warnings=0
template_release_state="unknown"
template_release_note="Template release state not evaluated."

printf 'SMOKE scope: public-domain contract check only.\n'
printf 'SMOKE scope: CI/CD deploy path updates Cloudflare Worker/assets, not Blogger template publish.\n'
printf 'SMOKE scope: template drift mode=%s changed_in_rev=%s.\n' "$TEMPLATE_DRIFT_MODE" "$TEMPLATE_CHANGED_IN_REV"

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

extract_meta_content() {
  local file="$1"
  local name="$2"
  local tag
  tag="$(grep -Eoi "<meta[^>]+name=['\\\"]${name}['\\\"][^>]*>" "$file" | head -n 1 || true)"
  extract_attr_from_tag "$tag" "content"
}

extract_template_fingerprint() {
  local file="$1"
  local tag=""
  local value=""
  tag="$(grep -Eoi "<[^>]+id=['\\\"]gg-fingerprint['\\\"][^>]*>" "$file" | head -n 1 || true)"
  value="$(extract_attr_from_tag "$tag" "data-gg-template-fingerprint")"
  if [[ -n "$value" ]]; then
    printf '%s' "$value"
    return 0
  fi
  extract_meta_content "$file" "gg-template-fingerprint"
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

check_info_panel_contract() {
  local file="$1"
  local context="$2"
  if ! grep -Eq "id=['\\\"]gg-postinfo['\\\"]" "$file"; then
    log_fail "$context missing #gg-postinfo"
  fi
  if ! grep -Eq "data-gg-slot=['\\\"]contributors['\\\"]" "$file"; then
    log_fail "$context missing contributors slot"
  fi
  if ! grep -Eq "data-gg-slot=['\\\"]tags['\\\"]" "$file"; then
    log_fail "$context missing tags slot"
  fi
  if ! grep -Eq "data-s=['\\\"]snippet['\\\"]" "$file"; then
    log_fail "$context missing snippet slot"
  fi
  if ! grep -Eq "data-gg-slot=['\\\"]toc['\\\"]" "$file"; then
    log_fail "$context missing toc slot"
  fi
  assert_row_hidden "$file" "contributors" "$context"
  assert_row_hidden "$file" "tags" "$context"
  assert_row_hidden "$file" "snippet" "$context"
  assert_row_hidden "$file" "title" "$context"
  assert_row_hidden "$file" "author" "$context"
  assert_row_hidden "$file" "date" "$context"
  assert_row_hidden "$file" "comments" "$context"
  assert_row_hidden "$file" "readtime" "$context"
  assert_row_hidden "$file" "toc" "$context"
  assert_row_hidden "$file" "thumbnail" "$context"
  assert_row_hidden "$file" "head" "$context"
  assert_row_hidden "$file" "cta" "$context"
}

check_listing_card_metadata() {
  local file="$1"
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
    if grep -q "No headings available" "$file"; then
      log_fail "listing toc hint leaked placeholder"
    fi
  fi
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
  local meta final status redirects canonical og title desc surface page home_state edited_present
  local meta_rest
  meta="$(fetch_page "$path" "$file")"
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
  assert_no_placeholder_strings "$file" "$path"
  check_info_panel_contract "$file" "$path"

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

  assert_starts_with "$home_norm" "${BASE_URL}/landing#" "dock home href"
  assert_equal "$blog_norm" "${BASE_URL}/" "dock blog href"
  assert_starts_with "$contact_norm" "${BASE_URL}/landing#gg-landing-hero-5" "dock contact href"
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
  fi

  if [[ -z "$live_observed" ]]; then
    if is_truthy "$TEMPLATE_CHANGED_IN_REV"; then
      changed_prefix="index.prod.xml changed in this revision; "
    fi
    template_drift_signal "${changed_prefix}live marker 'data-gg-template-fingerprint' is missing. Worker/assets deployed does not publish Blogger template; manual Blogger template publish required."
    result_line="marker_missing"
    template_release_state="worker_assets_deployed_template_publish_required"
    template_release_note="Worker/assets deployed; Blogger template publish still required."
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
    template_release_state="template_fingerprint_match_pending_contract"
    template_release_note="Template fingerprint matches repo; full live contract still must pass."
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
  local final_state="$template_release_state"
  local final_note="$template_release_note"

  if [[ "$template_release_state" == "template_fingerprint_match_pending_contract" ]]; then
    if [[ "$failures" -eq 0 ]]; then
      final_state="blogger_template_parity_verified"
      final_note="Blogger template parity verified after manual publish."
    else
      final_state="template_fingerprint_match_but_contract_failed"
      final_note="Template fingerprint matches, but live contract checks failed."
    fi
  fi

  printf 'SMOKE release-state=%s note=%s\n' "$final_state" "$final_note"
  if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
    {
      echo "### Release State"
      echo "- State: \`${final_state}\`"
      echo "- Note: ${final_note}"
    } >> "$GITHUB_STEP_SUMMARY"
  fi
}

check_surface "/" "200" "${BASE_URL}/" "${BASE_URL}/" "${BASE_URL}/" "listing" "listing" "blog" "absent"
check_surface "/landing" "200" "${BASE_URL}/landing" "${BASE_URL}/landing" "${BASE_URL}/landing" "landing" "home" "landing" "present"
check_surface "/blog" "200" "${BASE_URL}/" "${BASE_URL}/" "${BASE_URL}/" "listing" "listing" "blog" "absent" "1"
check_surface "/landing/" "200" "${BASE_URL}/landing" "${BASE_URL}/landing" "${BASE_URL}/landing" "landing" "home" "landing" "present"
check_surface "/?view=blog" "200" "${BASE_URL}/" "${BASE_URL}/" "${BASE_URL}/" "listing" "listing" "blog" "absent"
check_surface "/?view=landing" "200" "${BASE_URL}/landing" "${BASE_URL}/landing" "${BASE_URL}/landing" "landing" "home" "landing" "present"
check_dock_truth
check_discovered_detail_paths
check_template_fingerprint_drift
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
