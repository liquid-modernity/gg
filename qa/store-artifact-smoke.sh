#!/usr/bin/env bash
set -euo pipefail

export LC_ALL=C

artifact_file=".cloudflare-build/public/store.html"
source_file="store.html"
build_tool="tools/build-store-static.mjs"
proof_tool="tools/proof-store-static.mjs"
target_file="$source_file"
failures=0

if [[ -f "$artifact_file" && ! "$source_file" -nt "$artifact_file" ]]; then
  target_file="$artifact_file"
fi

log_fail() {
  failures=$((failures + 1))
  printf 'FAIL: %s\n' "$1" >&2
}

check_file_exists() {
  local file_path="$1"
  local message="$2"
  [[ -f "$file_path" ]] || log_fail "$message"
}

check_pattern() {
  local pattern="$1"
  local message="$2"
  grep -Eq -- "$pattern" "$target_file" || log_fail "$message"
}

check_literal() {
  local needle="$1"
  local message="$2"
  grep -Fq -- "$needle" "$target_file" || log_fail "$message"
}

check_absent() {
  local pattern="$1"
  local message="$2"
  if grep -Eq -- "$pattern" "$target_file"; then
    log_fail "$message"
  fi
}

check_repo_pattern() {
  local pattern="$1"
  local file_path="$2"
  local message="$3"
  grep -Eq -- "$pattern" "$file_path" || log_fail "$message"
}

check_file_exists "$build_tool" "tools/build-store-static.mjs is missing"
check_file_exists "$proof_tool" "tools/proof-store-static.mjs is missing"

printf 'SMOKE-STORE-ARTIFACT lane=ARTIFACT source=%s\n' "$target_file"

check_repo_pattern '"store:build"[[:space:]]*:[[:space:]]*"node tools/build-store-static\.mjs"' "package.json" "package.json missing store:build script"
check_repo_pattern '"store:proof"[[:space:]]*:[[:space:]]*"node tools/proof-store-static\.mjs"' "package.json" "package.json missing store:proof script"
check_repo_pattern 'function developmentRobotsTag\(\)' "worker.js" "worker.js missing development robots helper"
check_repo_pattern 'function productionIndexableHtmlRobotsTag\(\)' "worker.js" "worker.js missing production indexable robots helper"
check_repo_pattern 'flags\.mode !== "production"\) return developmentRobotsTag\(\);' "worker.js" "worker.js missing dev/staging robots lockdown guard"
check_repo_pattern 'mode=production' "qa/live-smoke-worker.sh" "live smoke missing production mode diagnostics coverage"

check_pattern '<title>\s*Yellow Cart · PakRPP\s*</title>' "artifact missing canonical title"
check_pattern 'rel=["'"'"']canonical["'"'"'][^>]*href=["'"'"']https://www\.pakrpp\.com/store["'"'"']' "artifact missing canonical /store"
check_pattern 'name=["'"'"']gg-store-contract["'"'"'][^>]*content=["'"'"']store-static-prerender-v1["'"'"']' "artifact missing static prerender contract marker"
check_pattern '<h1[^>]*>\s*Yellow Cart\s*</h1>' "artifact missing H1 Yellow Cart"
check_pattern 'id=["'"'"']store-top["'"'"']' "artifact store-top anchor is missing"
check_pattern 'id=["'"'"']store-grid["'"'"']' "artifact store-grid anchor is missing"
check_pattern 'id=["'"'"']store-grid-skeleton["'"'"']' "artifact skeleton grid is missing"
check_pattern 'id=["'"'"']store-category-context["'"'"']' "artifact category context is missing"
check_pattern 'id=["'"'"']store-semantic-products["'"'"']' "artifact semantic product section is missing"
check_pattern 'id=["'"'"']store-static-products["'"'"']' "artifact static products script is missing"
check_pattern 'id=["'"'"']store-itemlist-jsonld["'"'"']' "artifact ItemList JSON-LD script is missing"
check_pattern 'STORE_LCP_PRELOAD_START' "artifact STORE_LCP_PRELOAD_START marker is missing"
check_pattern 'STORE_STATIC_GRID_START' "artifact STORE_STATIC_GRID_START marker is missing"
check_pattern 'STORE_STATIC_PRODUCTS_JSON_START' "artifact STORE_STATIC_PRODUCTS_JSON_START marker is missing"
check_pattern 'STORE_ITEMLIST_JSONLD_START' "artifact STORE_ITEMLIST_JSONLD_START marker is missing"
check_pattern 'STORE_STATIC_SEMANTIC_PRODUCTS_START' "artifact STORE_STATIC_SEMANTIC_PRODUCTS_START marker is missing"
check_pattern 'STORE_LCP_PRODUCT_START' "artifact STORE_LCP_PRODUCT_START marker is missing"
check_pattern 'data-store-feed-url=["'"'"']/feeds/posts/default/-/Store\?alt=json&amp;max-results=50["'"'"']|data-store-feed-url=["'"'"']/feeds/posts/default/-/Store\?alt=json&max-results=50["'"'"']' "artifact Store feed contract is missing"
check_pattern 'function readStaticProducts\(' "artifact readStaticProducts helper is missing"
check_pattern 'function hydrateStaticProducts\(' "artifact hydrateStaticProducts helper is missing"
check_pattern 'state\.feedSource = ["'"'"']static["'"'"']' "artifact static feedSource boot path is missing"
check_pattern 'syncRequestedPreview\(\);' "artifact static deep-link sync is missing"
check_pattern 'function updateItemListJsonLd\(' "artifact ItemList JSON-LD updater is missing"
check_pattern 'function setCardImagePriority\(' "artifact image priority helper is missing"
check_pattern 'var loading = index === 0 \? ["'"'"']eager["'"'"'] : ["'"'"']lazy["'"'"']' "artifact card loading priority contract is missing"
check_pattern 'var fetchPriority = index === 0 \? ["'"'"']high["'"'"'] : ["'"'"']auto["'"'"']' "artifact card fetchpriority contract is missing"
check_pattern 'button\.href = canonicalProductUrl\(item\) \|\| productStoreAbsoluteUrl\(item\)' "artifact card href canonical fallback binding is missing"
check_pattern 'event\.preventDefault\(\);' "artifact preview interception preventDefault is missing"
check_pattern 'data-copy=["'"'"']marketplaceCtaLabel["'"'"']' "artifact preview marketplace CTA label hook is missing"
check_pattern 'data-copy=["'"'"']marketplaceFootnote["'"'"']' "artifact preview marketplace footnote hook is missing"
check_pattern 'id=["'"'"']store-preview-why-picked["'"'"']' "artifact preview why-picked block is missing"
check_pattern 'id=["'"'"']store-preview-caveat["'"'"']' "artifact preview caveat block is missing"
check_pattern '<a[^>]*data-store-dock=["'"'"']store["'"'"'][^>]*href=["'"'"']/store["'"'"']' "artifact dock Store href contract is missing"
check_pattern '<a[^>]*data-store-dock=["'"'"']contact["'"'"'][^>]*href=["'"'"']/store#contact["'"'"']' "artifact dock Contact href contract is missing"
check_pattern 'id=["'"'"']store-link-shopee["'"'"'][^>]*target=["'"'"']_blank["'"'"'][^>]*rel=["'"'"'][^"'"'"']*sponsored[^"'"'"']*nofollow[^"'"'"']*noopener[^"'"'"']*noreferrer[^"'"'"']*["'"'"']' "artifact Shopee CTA rel/target contract is missing"
check_pattern 'id=["'"'"']store-link-tiktok["'"'"'][^>]*target=["'"'"']_blank["'"'"'][^>]*rel=["'"'"'][^"'"'"']*sponsored[^"'"'"']*nofollow[^"'"'"']*noopener[^"'"'"']*noreferrer[^"'"'"']*["'"'"']' "artifact TikTok CTA rel/target contract is missing"
check_pattern 'id=["'"'"']store-link-tokopedia["'"'"'][^>]*target=["'"'"']_blank["'"'"'][^>]*rel=["'"'"'][^"'"'"']*sponsored[^"'"'"']*nofollow[^"'"'"']*noopener[^"'"'"']*noreferrer[^"'"'"']*["'"'"']' "artifact Tokopedia CTA rel/target contract is missing"
check_pattern 'id=["'"'"']store-link-shopee["'"'"'][^>]*aria-label=["'"'"']' "artifact Shopee CTA aria-label is missing"
check_pattern 'id=["'"'"']store-link-tokopedia["'"'"'][^>]*aria-label=["'"'"']' "artifact Tokopedia CTA aria-label is missing"
check_pattern 'id=["'"'"']store-link-tiktok["'"'"'][^>]*aria-label=["'"'"']' "artifact TikTok CTA aria-label is missing"
check_pattern 'marketplaceAriaLabel\(' "artifact runtime marketplace aria-label helper is missing"
check_pattern 'data-store-remove-saved' "artifact saved remove hook is missing"
check_pattern 'max-width:[[:space:]]*100%;' "artifact html/body max-width guard is missing"
check_pattern 'overflow-x:[[:space:]]*clip;' "artifact html/body overflow-x clip guard is missing"
check_pattern '@supports not \(overflow-x: clip\)' "artifact overflow fallback guard is missing"

check_absent 'store-lcp-single-source-v1' "artifact still exposes stale LCP single-source contract"
check_absent 'data-store-initial-lcp-card' "artifact still contains legacy initial LCP card markup"
check_absent 'aggregateRating' "artifact should not fabricate aggregateRating"
check_absent 'reviewCount' "artifact should not fabricate reviewCount"
check_absent 'fetchpriority=["'"'"']low["'"'"']' "artifact should not ship low fetchpriority values"
check_absent 'fetchPriority = ["'"'"']low["'"'"']' "artifact should not assign low fetchPriority in JS"
check_absent 'grid\.innerHTML' "artifact still renders grid via innerHTML"
check_absent 'discoveryResults\.innerHTML' "artifact still renders discovery results via innerHTML"
check_absent 'savedResults\.innerHTML' "artifact still renders saved results via innerHTML"
check_absent 'preview\.carousel\.innerHTML' "artifact still renders preview carousel via innerHTML"
check_absent 'preview\.dots\.innerHTML' "artifact still renders preview dots via innerHTML"
check_absent 'insertAdjacentHTML' "artifact still uses insertAdjacentHTML"
check_absent 'id=["'"'"']home["'"'"']' "artifact still contains legacy home id"
check_absent 'href=["'"'"']#home["'"'"']' "artifact still contains legacy #home anchor"

if ! node "$proof_tool" "$target_file"; then
  log_fail "tools/proof-store-static.mjs failed for $target_file"
fi

if [[ "$failures" -gt 0 ]]; then
  printf 'STORE ARTIFACT SMOKE RESULT: FAILED (%s)\n' "$failures" >&2
  exit 1
fi

printf 'STORE ARTIFACT SMOKE RESULT: PASS\n'
