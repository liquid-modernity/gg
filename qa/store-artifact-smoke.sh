#!/usr/bin/env bash
set -euo pipefail

export LC_ALL=C

artifact_file=".cloudflare-build/public/store.html"
artifact_root=".cloudflare-build/public"
build_tool="tools/build-store-static.mjs"
proof_tool="tools/proof-store-static.mjs"
target_file="$artifact_file"
target_root="$artifact_root"
failures=0

target_store_js="${target_root}/assets/store/store.js"
target_store_css="${target_root}/assets/store/store.css"
target_store_manifest="${target_root}/store/data/manifest.json"

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

check_file_pattern() {
  local pattern="$1"
  local file_path="$2"
  local message="$3"
  grep -Eq -- "$pattern" "$file_path" || log_fail "$message"
}

check_not_stale() {
  local source_path="$1"
  local artifact_path="$2"
  local label="$3"

  [[ -f "$source_path" && -f "$artifact_path" ]] || return 0
  if [[ "$source_path" -nt "$artifact_path" ]]; then
    log_fail "${label} is stale in ${artifact_root}; run node tools/cloudflare-prepare.mjs before qa/store-artifact-smoke.sh"
  fi
}

if [[ ! -d "$artifact_root" ]]; then
  log_fail "Cloudflare public bundle is missing at ${artifact_root}; run node tools/cloudflare-prepare.mjs before qa/store-artifact-smoke.sh"
fi

check_file_exists "$build_tool" "tools/build-store-static.mjs is missing"
check_file_exists "$proof_tool" "tools/proof-store-static.mjs is missing"
check_file_exists "$target_file" "Cloudflare store artifact is missing: ${target_file}; run node tools/cloudflare-prepare.mjs before qa/store-artifact-smoke.sh"
check_file_exists "$target_store_js" "store runtime asset is missing: ${target_store_js}"
check_file_exists "$target_store_css" "store stylesheet asset is missing: ${target_store_css}"
check_file_exists "$target_store_manifest" "store manifest is missing: ${target_store_manifest}"

check_not_stale "store.html" "$target_file" "store.html"
check_not_stale "assets/store/store.js" "$target_store_js" "store runtime asset"
check_not_stale "assets/store/store.css" "$target_store_css" "store stylesheet asset"
check_not_stale "store/data/manifest.json" "$target_store_manifest" "store manifest"

for source_category_artifact in store-*.html; do
  [[ -f "$source_category_artifact" ]] || continue
  check_not_stale "$source_category_artifact" "${artifact_root}/${source_category_artifact}" "$source_category_artifact"
done

for source_category_artifact in store/*/index.html store/*/page/*/index.html; do
  [[ -f "$source_category_artifact" ]] || continue
  check_not_stale "$source_category_artifact" "${artifact_root}/${source_category_artifact}" "$source_category_artifact"
done

if [[ "$failures" -gt 0 ]]; then
  printf 'STORE ARTIFACT SMOKE RESULT: FAILED (%s)\n' "$failures" >&2
  exit 1
fi

printf 'SMOKE-STORE-ARTIFACT lane=ARTIFACT source=%s\n' "$target_file"

check_repo_pattern '"store:build"[[:space:]]*:[[:space:]]*"bash tools/store-build\.sh"' "package.json" "package.json missing store:build split-asset wrapper script"
check_repo_pattern '"store:proof"[[:space:]]*:[[:space:]]*"node tools/proof-store-static\.mjs"' "package.json" "package.json missing store:proof script"
check_repo_pattern '"store:check:ci"[[:space:]]*:[[:space:]]*"STORE_CI=1 STORE_REQUIRE_LIVE_FEED=0 STORE_STRICT_IMAGES=0 npm run store:check"' "package.json" "package.json missing store:check:ci script"
check_repo_pattern '"store:check:production"[[:space:]]*:[[:space:]]*"STORE_CI=1 STORE_PRODUCTION=1 STORE_REQUIRE_LIVE_FEED=1 STORE_STRICT_IMAGES=1 npm run store:check"' "package.json" "package.json missing store:check:production script"
check_repo_pattern '"gaga:verify-store-artifact"[[:space:]]*:[[:space:]]*"npm run store:check && node tools/cloudflare-prepare\.mjs && bash qa/store-artifact-smoke\.sh"' "package.json" "package.json missing deterministic Cloudflare artifact verification chain"
check_repo_pattern 'function developmentRobotsTag\(\)' "worker.js" "worker.js missing development robots helper"
check_repo_pattern 'function productionIndexableHtmlRobotsTag\(\)' "worker.js" "worker.js missing production indexable robots helper"
check_repo_pattern 'flags\.mode !== "production"\) return developmentRobotsTag\(\);' "worker.js" "worker.js missing dev/staging robots lockdown guard"
check_repo_pattern 'mode=production' "qa/live-smoke-worker.sh" "live smoke missing production mode diagnostics coverage"
check_repo_pattern 'GG_LIVE_TIMEOUT_SECONDS' "qa/live-smoke-worker.sh" "live smoke missing configurable timeout contract"
check_repo_pattern 'X-GG-Store-Source' "worker.js" "worker.js missing /store source debug header"
check_repo_pattern 'X-GG-Store-Route' "worker.js" "worker.js missing clean Store route debug header"
check_repo_pattern 'X-GG-Store-Category' "worker.js" "worker.js missing clean Store category debug header"
check_repo_pattern 'X-GG-Store-Page' "worker.js" "worker.js missing clean Store pagination debug header"
check_repo_pattern 'X-GG-Store-Cache-Policy' "worker.js" "worker.js missing clean Store cache debug header"
check_repo_pattern 'public, max-age=300, stale-while-revalidate=86400' "worker.js" "worker.js missing production Store SWR cache policy"
check_repo_pattern 'resolveStoreCleanRoutePath' "worker.js" "worker.js missing centralized clean Store route resolver"
check_repo_pattern 'STORE_DATA_PREFIX' "worker.js" "worker.js missing /store/data manifest route guard"
check_repo_pattern 'storeCategoryAssetPaths' "worker.js" "worker.js missing centralized Store category artifact mapping"
check_repo_pattern 'User-agent: Googlebot' "worker.js" "worker.js missing explicit Googlebot robots allowance"
check_repo_pattern 'User-agent: OAI-SearchBot' "worker.js" "worker.js missing explicit OAI-SearchBot robots allowance"

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
check_pattern 'href=["'"'"']/assets/store/store\.css["'"'"']' "artifact store stylesheet reference is missing"
check_pattern 'src=["'"'"']/assets/store/store\.js["'"'"'][^>]*defer' "artifact store runtime asset reference is missing"
check_pattern 'data-store-feed-url=["'"'"']/feeds/posts/default/-/Store\?alt=json&amp;max-results=50["'"'"']|data-store-feed-url=["'"'"']/feeds/posts/default/-/Store\?alt=json&max-results=50["'"'"']' "artifact Store feed contract is missing"
check_pattern 'data-copy=["'"'"']marketplaceCtaLabel["'"'"']' "artifact preview marketplace CTA label hook is missing"
check_pattern 'data-copy=["'"'"']marketplaceFootnote["'"'"']' "artifact preview marketplace footnote hook is missing"
check_pattern 'id=["'"'"']store-preview-why-picked["'"'"']' "artifact preview why-picked block is missing"
check_pattern 'id=["'"'"']store-preview-caveat["'"'"']' "artifact preview caveat block is missing"
check_pattern 'id=["'"'"']store-discovery-search["'"'"'][^>]*aria-label=' "artifact Discovery search accessible label is missing"
check_pattern 'id=["'"'"']store-discovery-status["'"'"'][^>]*aria-live=' "artifact Discovery aria-live status is missing"
check_pattern 'data-store-price-band=["'"'"']under-50k["'"'"']' "artifact Discovery price-band hooks are missing"
check_pattern 'data-store-sort=["'"'"']recommended["'"'"']' "artifact Discovery sort hooks are missing"
check_pattern '<a[^>]*data-store-dock=["'"'"']store["'"'"'][^>]*href=["'"'"']/store["'"'"']' "artifact dock Store href contract is missing"
check_pattern '<a[^>]*data-store-dock=["'"'"']contact["'"'"'][^>]*href=["'"'"']/store#contact["'"'"']' "artifact dock Contact href contract is missing"
check_pattern 'id=["'"'"']store-link-shopee["'"'"'][^>]*target=["'"'"']_blank["'"'"'][^>]*rel=["'"'"'][^"'"'"']*sponsored[^"'"'"']*nofollow[^"'"'"']*noopener[^"'"'"']*noreferrer[^"'"'"']*["'"'"']' "artifact Shopee CTA rel/target contract is missing"
check_pattern 'id=["'"'"']store-link-tiktok["'"'"'][^>]*target=["'"'"']_blank["'"'"'][^>]*rel=["'"'"'][^"'"'"']*sponsored[^"'"'"']*nofollow[^"'"'"']*noopener[^"'"'"']*noreferrer[^"'"'"']*["'"'"']' "artifact TikTok CTA rel/target contract is missing"
check_pattern 'id=["'"'"']store-link-tokopedia["'"'"'][^>]*target=["'"'"']_blank["'"'"'][^>]*rel=["'"'"'][^"'"'"']*sponsored[^"'"'"']*nofollow[^"'"'"']*noopener[^"'"'"']*noreferrer[^"'"'"']*["'"'"']' "artifact Tokopedia CTA rel/target contract is missing"
check_pattern 'id=["'"'"']store-link-shopee["'"'"'][^>]*aria-label=["'"'"']' "artifact Shopee CTA aria-label is missing"
check_pattern 'id=["'"'"']store-link-tokopedia["'"'"'][^>]*aria-label=["'"'"']' "artifact Tokopedia CTA aria-label is missing"
check_pattern 'id=["'"'"']store-link-tiktok["'"'"'][^>]*aria-label=["'"'"']' "artifact TikTok CTA aria-label is missing"
check_pattern 'max-width:[[:space:]]*100%;' "artifact html/body max-width guard is missing"
check_pattern 'overflow-x:[[:space:]]*clip;' "artifact html/body overflow-x clip guard is missing"
check_pattern '@supports not \(overflow-x: clip\)' "artifact overflow fallback guard is missing"

check_file_pattern 'STORE_LCP_PRODUCT_START' "$target_store_js" "store runtime asset is missing STORE_LCP_PRODUCT_START marker"
check_file_pattern 'function readStaticProducts\(' "$target_store_js" "store runtime asset is missing readStaticProducts helper"
check_file_pattern 'function hydrateStaticProducts\(' "$target_store_js" "store runtime asset is missing hydrateStaticProducts helper"
check_file_pattern 'function loadProducts\(' "$target_store_js" "store runtime asset is missing loadProducts helper"
check_file_pattern '/store/data/manifest\.json' "$target_store_js" "store runtime asset is missing discovery manifest fetch path"
check_file_pattern 'function loadStoreManifest\(' "$target_store_js" "store runtime asset is missing loadStoreManifest helper"
check_file_pattern 'function validateStoreManifest\(' "$target_store_js" "store runtime asset is missing manifest validator"
check_file_pattern 'function applyDiscoveryFilters\(' "$target_store_js" "store runtime asset is missing manifest-backed Discovery filters"
check_file_pattern 'function fallbackDiscoveryItems\(' "$target_store_js" "store runtime asset is missing Discovery static fallback"
check_file_pattern 'storeManifestCache' "$target_store_js" "store runtime asset is missing in-memory manifest cache"
check_file_pattern 'state\.feedSource = ["'"'"']static["'"'"']' "$target_store_js" "store runtime asset is missing static feedSource boot path"
check_file_pattern 'syncRequestedPreview\(\);' "$target_store_js" "store runtime asset is missing static deep-link sync"
check_file_pattern 'function updateItemListJsonLd\(' "$target_store_js" "store runtime asset is missing ItemList JSON-LD updater"
check_file_pattern 'function setCardImagePriority\(' "$target_store_js" "store runtime asset is missing image priority helper"
check_file_pattern 'var loading = index === 0 \? ["'"'"']eager["'"'"'] : ["'"'"']lazy["'"'"']' "$target_store_js" "store runtime asset is missing card loading priority contract"
check_file_pattern 'var fetchPriority = index === 0 \? ["'"'"']high["'"'"'] : ["'"'"']auto["'"'"']' "$target_store_js" "store runtime asset is missing card fetchpriority contract"
check_file_pattern 'button\.href = canonicalProductUrl\(item\) \|\| productStoreAbsoluteUrl\(item\)' "$target_store_js" "store runtime asset is missing card href canonical fallback binding"
check_file_pattern 'event\.preventDefault\(\);' "$target_store_js" "store runtime asset is missing preview interception preventDefault calls"
check_file_pattern 'marketplaceAriaLabel\(' "$target_store_js" "store runtime asset is missing marketplace aria-label helper"
check_file_pattern 'data-store-remove-saved' "$target_store_js" "store runtime asset is missing saved remove hook"

check_file_pattern '\.store-app' "$target_store_css" "store stylesheet asset is missing .store-app"
check_file_pattern '\.store-card' "$target_store_css" "store stylesheet asset is missing .store-card"
check_file_pattern '\.store-preview-sheet' "$target_store_css" "store stylesheet asset is missing .store-preview-sheet"
check_file_pattern '\.store-semantic-category-rail' "$target_store_css" "store stylesheet asset is missing .store-semantic-category-rail"
check_file_pattern '\.gg-dock' "$target_store_css" "store stylesheet asset is missing .gg-dock"

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
check_absent 'store-manifest-v1' "artifact still inlines the discovery manifest into store.html"

if ! node -e '
  const fs = require("node:fs");
  const file = process.argv[1];
  const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(manifest.items) || manifest.items.length < 1) process.exit(2);
  if (JSON.stringify(manifest).match(/\bdummy\b/i)) process.exit(3);
  if (manifest.categories.some((entry) => String(entry?.label || "") === "Etc" || String(entry?.key || "") === "etc" || /\/store\/etc(?:$|[/?#])/.test(String(entry?.path || "")))) process.exit(4);
  if (manifest.items.some((entry) => String(entry?.categoryLabel || "") === "Etc" || String(entry?.categoryKey || "") === "etc" || /\/store\/etc(?:$|[/?#])/.test(String(entry?.storeUrl || "")))) process.exit(5);
' "$target_store_manifest" >/dev/null 2>&1; then
  log_fail "store manifest is invalid: ${target_store_manifest}"
fi

if ! node -e '
  const fs = require("node:fs");
  const path = require("node:path");
  const root = process.argv[1];
  const pageSize = 48;
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "store/data/manifest.json"), "utf8"));
  const categories = [
    ["fashion", "Fashion", "Fashion Picks · Yellow Cart"],
    ["skincare", "Skincare", "Skincare Picks · Yellow Cart"],
    ["workspace", "Workspace", "Workspace Picks · Yellow Cart"],
    ["tech", "Tech", "Tech Picks · Yellow Cart"],
    ["everyday", "Lainnya", "Everyday Picks · Yellow Cart"],
  ];
  const counts = Object.fromEntries(categories.map(([key]) => [key, 0]));
  for (const item of Array.isArray(manifest.items) ? manifest.items : []) {
    const key = String(item && item.categoryKey || "");
    if (Object.prototype.hasOwnProperty.call(counts, key)) counts[key] += 1;
  }
  const parseProducts = (html) => {
    const match = html.match(/<script\b[^>]*id="store-static-products"[^>]*>([\s\S]*?)<\/script>/i);
    if (!match) process.exit(17);
    const products = JSON.parse(match[1]);
    if (!Array.isArray(products)) process.exit(18);
    return products;
  };
  const parseItemList = (html) => {
    const match = html.match(/<script\b[^>]*id="store-itemlist-jsonld"[^>]*>([\s\S]*?)<\/script>/i);
    if (!match) process.exit(27);
    const schema = JSON.parse(match[1]);
    const graph = Array.isArray(schema["@graph"]) ? schema["@graph"] : [schema];
    return graph.find((node) => node && node["@type"] === "ItemList") || graph.find((node) => Array.isArray(node && node["@type"]) && node["@type"].includes("ItemList"));
  };
  const checkPage = (key, label, title, pageNumber, totalPages, totalProducts) => {
    const nested = pageNumber === 1 ? path.join(root, "store", key, "index.html") : path.join(root, "store", key, "page", String(pageNumber), "index.html");
    const flat = pageNumber === 1 ? path.join(root, `store-${key}.html`) : path.join(root, `store-${key}-page-${pageNumber}.html`);
    const publicPath = pageNumber === 1 ? `/store/${key}` : `/store/${key}/page/${pageNumber}`;
    const canonicalUrl = `https://www.pakrpp.com${publicPath}`;
    const expectedTitle = pageNumber === 1 ? title : `${title.replace(" · Yellow Cart", "")} · Page ${pageNumber} · Yellow Cart`;
    const expectedCount = Math.min(Math.max(totalProducts - ((pageNumber - 1) * pageSize), 0), pageSize);
    if (!fs.existsSync(nested) || !fs.existsSync(flat)) process.exit(10);
    const html = fs.readFileSync(nested, "utf8");
    if (!html.includes(`<title>${expectedTitle}</title>`)) process.exit(11);
    if (!html.includes(`href="${canonicalUrl}"`)) process.exit(12);
    if (!html.includes(`data-store-category-key="${key}"`)) process.exit(13);
    if (!html.includes("store-category-page-rail")) process.exit(14);
    if (!html.includes("href=\"/assets/store/store.css\"") || !/src="\/assets\/store\/store\.js"[^>]*defer/.test(html)) process.exit(15);
    if (/\bEtc\b|\bdummy\b/i.test(html)) process.exit(16);
    if (/\/store\/etc(?:$|[/?#" ])/.test(html)) process.exit(26);
    const products = parseProducts(html);
    if (products.length !== expectedCount || products.length < 1 || products.length > pageSize) process.exit(18);
    if (products.some((product) => String(product.categoryKey || "") !== key || String(product.category || "") !== label)) process.exit(19);
    const prevHref = pageNumber === 2 ? `/store/${key}` : `/store/${key}/page/${pageNumber - 1}`;
    const nextHref = `/store/${key}/page/${pageNumber + 1}`;
    if (pageNumber > 1 && !html.includes(`rel="prev" href="${prevHref}"`)) process.exit(20);
    if (pageNumber < totalPages && !html.includes(`rel="next" href="${nextHref}"`)) process.exit(21);
    const itemList = parseItemList(html);
    if (!itemList || Number(itemList.numberOfItems || 0) !== products.length) process.exit(22);
    const entries = Array.isArray(itemList.itemListElement) ? itemList.itemListElement : [];
    if (entries.length !== products.length) process.exit(23);
    if (String(itemList.url || "") !== canonicalUrl) process.exit(24);
    const expectedFirstPosition = (pageNumber - 1) * pageSize + 1;
    if (entries.length && Number(entries[0].position || 0) !== expectedFirstPosition) process.exit(25);
  };
  for (const [key, label, title] of categories) {
    const totalProducts = counts[key] || 0;
    const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      checkPage(key, label, title, pageNumber, totalPages, totalProducts);
    }
  }
' "$target_root" >/dev/null 2>&1; then
  log_fail "store category artifacts are invalid or missing"
fi

if ! node "$proof_tool" "$target_file"; then
  log_fail "tools/proof-store-static.mjs failed for $target_file"
fi

if [[ "$failures" -gt 0 ]]; then
  printf 'STORE ARTIFACT SMOKE RESULT: FAILED (%s)\n' "$failures" >&2
  exit 1
fi

printf 'STORE ARTIFACT SMOKE RESULT: PASS\n'
