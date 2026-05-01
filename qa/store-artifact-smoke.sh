#!/usr/bin/env bash
set -euo pipefail

export LC_ALL=C

artifact_file=".cloudflare-build/public/store.html"
source_file="store.html"
target_file="$source_file"
failures=0

if [[ -f "$artifact_file" && ! "$source_file" -nt "$artifact_file" ]]; then
  target_file="$artifact_file"
fi

log_fail() {
  failures=$((failures + 1))
  printf 'FAIL: %s\n' "$1" >&2
}

check_pattern() {
  local pattern="$1"
  local message="$2"

  grep -Eq -- "$pattern" "$target_file" || log_fail "$message"
}

check_absent() {
  local pattern="$1"
  local message="$2"

  if grep -Eq -- "$pattern" "$target_file"; then
    log_fail "$message"
  fi
}

check_count_eq() {
  local pattern="$1"
  local expected="$2"
  local message="$3"
  local actual

  actual=$( (grep -Eo -- "$pattern" "$target_file" || true) | wc -l )
  actual=$(printf '%s' "$actual" | tr -d '[:space:]')

  if [[ "$actual" != "$expected" ]]; then
    log_fail "$message (found $actual)"
  fi
}

check_count_gte() {
  local pattern="$1"
  local minimum="$2"
  local message="$3"
  local actual

  actual=$( (grep -Eo -- "$pattern" "$target_file" || true) | wc -l )
  actual=$(printf '%s' "$actual" | tr -d '[:space:]')

  if (( actual < minimum )); then
    log_fail "$message (found $actual)"
  fi
}

printf 'SMOKE-STORE-ARTIFACT lane=ARTIFACT source=%s\n' "$target_file"

check_pattern '<title>\s*Yellow Cart · PakRPP\s*</title>' "artifact missing canonical title"
check_pattern 'rel=["'"'"']canonical["'"'"'][^>]*href=["'"'"']https://www\.pakrpp\.com/store["'"'"']' "artifact missing canonical /store"
check_pattern '<h1[^>]*>\s*Yellow Cart\s*</h1>' "artifact missing H1 Yellow Cart"
check_pattern 'class=["'"'"'][^"'"'"']*store-grid[^"'"'"']*["'"'"']' "artifact store catalogue surface is missing"
check_pattern 'var COPY = \{' "artifact COPY registry is missing"
check_pattern 'id:[[:space:]]*\{' "artifact COPY.id registry is missing"
check_pattern 'en:[[:space:]]*\{' "artifact COPY.en registry is missing"
check_pattern 'var STORE_CATEGORY_CONFIG = \{' "artifact STORE_CATEGORY_CONFIG is missing"
check_pattern 'id=["'"'"']store-top["'"'"']' "artifact store-top anchor is missing"
check_pattern 'id=["'"'"']store-grid["'"'"']' "artifact store-grid anchor is missing"
check_pattern 'id=["'"'"']store-grid-skeleton["'"'"']' "artifact skeleton grid is missing"
check_pattern 'id=["'"'"']store-category-context["'"'"']' "artifact category semantic context is missing"
check_pattern 'id=["'"'"']store-semantic-products["'"'"']' "artifact semantic product section is missing"
check_pattern 'id=["'"'"']store-itemlist-jsonld["'"'"']' "artifact ItemList JSON-LD script is missing"
check_pattern 'rel=["'"'"']preload["'"'"'][^>]*as=["'"'"']style["'"'"'][^>]*Material\+Symbols' "artifact Material Symbols preload is missing"
check_pattern '<noscript><link[^>]*Material\+Symbols[^>]*rel=["'"'"']stylesheet["'"'"']' "artifact Material Symbols noscript fallback is missing"
check_pattern 'href=["'"'"']#store-grid["'"'"']' "artifact skip link to store-grid is missing"
check_pattern 'href=["'"'"']/store#store-top["'"'"']' "artifact back-to-top anchor is missing"
check_pattern 'href=["'"'"']https://wa\.me/[0-9]+\?text=' "artifact WhatsApp CTA href is missing full https://wa.me format"
check_pattern 'Affiliate links may be used[[:space:]]*·[[:space:]]*Harga dan ketersediaan mengikuti marketplace\.' "artifact disclosure separator copy is missing"
check_absent 'store-topbar' "artifact still contains store-topbar"
check_absent 'store-card__quick' "artifact still contains store-card__quick"
check_absent 'store-preview__close' "artifact still exposes store-preview__close"
check_absent 'store-read-article' "artifact still contains store-read-article"
check_absent 'id=["'"'"']home["'"'"']' "artifact still contains legacy home id"
check_absent 'href=["'"'"']#home["'"'"']' "artifact still contains legacy #home anchor"
check_absent 'href=["'"'"']/store#home["'"'"']' "artifact still contains legacy /store#home anchor"
check_absent 'getElementById\(["'"'"']home["'"'"']\)' "artifact still queries legacy home id from JS"
check_pattern '<a[^>]*data-store-dock=["'"'"']store["'"'"'][^>]*href=["'"'"']/store["'"'"']' "artifact dock Store href contract is missing"
check_pattern '<a[^>]*data-store-dock=["'"'"']contact["'"'"'][^>]*href=["'"'"']/store#contact["'"'"']' "artifact dock Contact href contract is missing"
check_pattern '<button[^>]*data-store-dock=["'"'"']discover["'"'"'][^>]*aria-controls=["'"'"']store-discovery-sheet["'"'"']' "artifact dock Discover contract is missing"
check_pattern '<button[^>]*data-store-dock=["'"'"']saved["'"'"'][^>]*aria-controls=["'"'"']store-saved-sheet["'"'"']' "artifact dock Saved contract is missing"
check_pattern '<button[^>]*data-store-dock=["'"'"']more["'"'"'][^>]*aria-controls=["'"'"']store-more-sheet["'"'"']' "artifact dock More contract is missing"
check_pattern 'data-copy=["'"'"']storeLabel["'"'"']' "artifact Store dock label localization hook is missing"
check_pattern 'data-copy=["'"'"']contactLabel["'"'"']' "artifact Contact dock label localization hook is missing"
check_pattern 'data-copy=["'"'"']discoverLabel["'"'"']' "artifact Discover dock label localization hook is missing"
check_pattern 'data-copy=["'"'"']savedDockLabel["'"'"']' "artifact Saved dock label localization hook is missing"
check_pattern 'data-copy=["'"'"']moreDockLabel["'"'"']' "artifact More dock label localization hook is missing"
check_pattern '<a[^>]*data-store-more-link=["'"'"']blog["'"'"'][^>]*href=["'"'"']/["'"'"']' "artifact More sheet Blog href is not /"
check_pattern '<a[^>]*data-store-more-link=["'"'"']home["'"'"'][^>]*href=["'"'"']/landing["'"'"']' "artifact More sheet Home href is not /landing"
check_pattern 'id=["'"'"']store-discovery-sheet["'"'"']' "artifact Discovery sheet is missing"
check_pattern 'id=["'"'"']store-saved-sheet["'"'"']' "artifact Saved sheet is missing"
check_pattern 'id=["'"'"']store-preview-sheet["'"'"'][^>]*aria-hidden=["'"'"']true["'"'"'][^>]*inert' "artifact preview sheet missing closed aria-hidden/inert contract"
check_pattern 'id=["'"'"']store-discovery-sheet["'"'"'][^>]*aria-hidden=["'"'"']true["'"'"'][^>]*inert' "artifact discovery sheet missing closed aria-hidden/inert contract"
check_pattern 'id=["'"'"']store-saved-sheet["'"'"'][^>]*aria-hidden=["'"'"']true["'"'"'][^>]*inert' "artifact saved sheet missing closed aria-hidden/inert contract"
check_pattern 'id=["'"'"']store-more-sheet["'"'"'][^>]*aria-hidden=["'"'"']true["'"'"'][^>]*inert' "artifact more sheet missing closed aria-hidden/inert contract"
check_pattern 'id=["'"'"']store-preview-dots["'"'"']' "artifact preview dots container is missing"
check_pattern 'class=["'"'"']store-preview__footer["'"'"']' "artifact preview footer handle container is missing"
check_pattern 'class=["'"'"']store-preview__handle["'"'"']' "artifact preview footer handle is missing"
check_pattern 'class=["'"'"']store-preview__secondary-actions["'"'"']' "artifact preview secondary actions are missing"
check_pattern 'data-copy-placeholder' "artifact localized placeholder hook is missing"
check_pattern 'data-copy-aria' "artifact localized aria hook is missing"
check_pattern 'data-copy-title' "artifact localized title hook is missing"
check_pattern 'querySelectorAll\(["'"'"']\[data-copy-placeholder\]["'"'"']\)' "artifact JS data-copy-placeholder handling is missing"
check_pattern 'querySelectorAll\(["'"'"']\[data-copy-aria\]["'"'"']\)' "artifact JS data-copy-aria handling is missing"
check_pattern 'querySelectorAll\(["'"'"']\[data-copy-title\]["'"'"']\)' "artifact JS data-copy-title handling is missing"
check_pattern 'querySelectorAll\(["'"'"']\[data-copy-value\]["'"'"']\)' "artifact JS data-copy-value handling is missing"
check_pattern 'function refreshLocaleUI\(' "artifact refreshLocaleUI is missing"
check_pattern 'function updateCategoryContext\(' "artifact category context updater is missing"
check_pattern 'function renderSemanticProducts\(' "artifact semantic product renderer is missing"
check_pattern 'function updateItemListJsonLd\(' "artifact ItemList JSON-LD generator is missing"
check_pattern 'function initialVisibleLimit\(' "artifact responsive initialVisibleLimit helper is missing"
check_pattern 'function visibleStepLimit\(' "artifact responsive visibleStepLimit helper is missing"
check_pattern 'function setCardImagePriority\(' "artifact card image priority helper is missing"
check_pattern 'refreshLocaleUI\(\)' "artifact locale switch does not refresh UI"
check_pattern 'document\.documentElement\.lang = normalizeLocale\(state\.locale\)' "artifact html lang update is missing"
check_pattern 'URLSearchParams\(window\.location\.search' "artifact /store\?item search deep-link logic is missing"
check_pattern '\^item-' "artifact #item-slug hash deep-link logic is missing"
check_pattern 'updateHistoryUrl\(storeRelativeUrl\(item\.slug\)\)' "artifact preview deep-link URL sync is missing"
check_pattern 'updateHistoryUrl\(STORE_CANONICAL_PATH\)' "artifact preview close URL reset is missing"
check_pattern 'id=["'"'"']store-card-template["'"'"']' "artifact product card template is missing"
check_pattern 'id=["'"'"']store-card-dot-template["'"'"']' "artifact card dot template is missing"
check_pattern 'id=["'"'"']store-preview-slide-template["'"'"']' "artifact preview slide template is missing"
check_pattern 'id=["'"'"']store-preview-dot-template["'"'"']' "artifact preview dot template is missing"
check_pattern 'id=["'"'"']store-result-row-template["'"'"']' "artifact result row template is missing"
check_pattern 'id=["'"'"']store-saved-row-template["'"'"']' "artifact saved row template is missing"
check_pattern 'id=["'"'"']store-empty-row-template["'"'"']' "artifact empty row template is missing"
check_pattern 'id=["'"'"']store-preview-note-template["'"'"']' "artifact preview note template is missing"
check_pattern 'id=["'"'"']store-semantic-product-template["'"'"']' "artifact semantic product template is missing"
check_pattern 'id=["'"'"']store-filter-toggle["'"'"'][^>]*aria-label=["'"'"']' "artifact filter toggle aria-label is missing"
check_pattern 'id=["'"'"']store-filter-current-icon["'"'"']' "artifact filter peek current icon is missing"
check_pattern 'id=["'"'"']store-filter-current["'"'"']' "artifact filter peek current label is missing"
check_pattern 'id=["'"'"']store-filter-count["'"'"']' "artifact filter peek count is missing"
check_pattern 'id=["'"'"']store-filter-toggle-icon["'"'"']' "artifact filter peek toggle icon is missing"
check_pattern 'data-copy=["'"'"']discoveryTitle["'"'"']' "artifact Discovery title localization hook is missing"
check_pattern 'data-copy=["'"'"']filtersLabel["'"'"']' "artifact filters label localization hook is missing"
check_pattern 'data-copy=["'"'"']quickIntentsLabel["'"'"']' "artifact quick intents localization hook is missing"
check_pattern 'data-copy=["'"'"']resultsLabel["'"'"']' "artifact results localization hook is missing"
check_pattern 'data-copy=["'"'"']navigateLabel["'"'"']' "artifact More navigate localization hook is missing"
check_pattern 'data-copy=["'"'"']languageLabel["'"'"']' "artifact More language localization hook is missing"
check_pattern 'data-copy=["'"'"']appearanceLabel["'"'"']' "artifact More appearance localization hook is missing"
check_pattern 'data-copy=["'"'"']savedOnDevice["'"'"']' "artifact Saved summary localization hook is missing"
check_pattern 'data-copy=["'"'"']featuredLabel["'"'"']' "artifact featured intent localization hook is missing"
check_pattern 'data-copy=["'"'"']latestLabel["'"'"']' "artifact latest intent localization hook is missing"
check_pattern 'data-copy=["'"'"']under500Label["'"'"']' "artifact under500 intent localization hook is missing"
check_pattern 'data-copy=["'"'"']systemLabel["'"'"']' "artifact system theme localization hook is missing"
check_pattern 'data-copy=["'"'"']lightLabel["'"'"']' "artifact light theme localization hook is missing"
check_pattern 'data-copy=["'"'"']darkLabel["'"'"']' "artifact dark theme localization hook is missing"
check_pattern 'data-copy=["'"'"']semanticProductsTitle["'"'"']' "artifact semantic products title localization hook is missing"
check_pattern 'data-copy=["'"'"']semanticEditorialDetailLabel["'"'"']' "artifact semantic editorial detail localization hook is missing"
check_pattern 'data-copy=["'"'"']semanticStoreLinkLabel["'"'"']' "artifact semantic store link localization hook is missing"
check_pattern 'data-copy-aria=["'"'"']affiliateDisclosureLabel["'"'"']' "artifact affiliate disclosure aria localization hook is missing"
check_pattern 'data-copy-aria=["'"'"']copyLinksLabel["'"'"']' "artifact copy button localized aria hook is missing"
check_pattern 'data-copy-title=["'"'"']copyLinksLabel["'"'"']' "artifact copy button localized title hook is missing"
check_pattern 'data-copy-aria=["'"'"']closePreview["'"'"']|data-copy=["'"'"']closePreview["'"'"']' "artifact preview close localization hook is missing"
check_pattern 'data-copy-aria=["'"'"']closeDiscovery["'"'"']|data-copy=["'"'"']closeDiscovery["'"'"']' "artifact discovery close localization hook is missing"
check_pattern 'data-copy-aria=["'"'"']closeSaved["'"'"']|data-copy=["'"'"']closeSaved["'"'"']' "artifact saved close localization hook is missing"
check_pattern 'data-copy-aria=["'"'"']closeMore["'"'"']|data-copy=["'"'"']closeMore["'"'"']' "artifact more close localization hook is missing"
check_pattern 'getElementById\(["'"'"']store-grid["'"'"']\)' "artifact JS store-grid lookup is missing"
check_pattern 'data-store-dock=["'"'"']store["'"'"']|querySelector\(\[data-store-dock=' "artifact same-page Store dock hook is missing"
check_count_eq 'id=["'"'"']store-filter-current["'"'"']' '1' "artifact still contains duplicate store-filter-current ids"
check_absent 'store-filter-outline__eyebrow' "artifact still contains old filter eyebrow markup or styles"
check_absent 'store-filter-outline__label-icon' "artifact still contains old nested filter label icon markup or styles"
check_pattern 'labelKey:[[:space:]]*["'"'"']filterAllLabel["'"'"']' "artifact category config missing all labelKey"
check_pattern 'labelKey:[[:space:]]*["'"'"']filterFashionLabel["'"'"']' "artifact category config missing fashion labelKey"
check_pattern 'labelKey:[[:space:]]*["'"'"']filterSkincareLabel["'"'"']' "artifact category config missing skincare labelKey"
check_pattern 'labelKey:[[:space:]]*["'"'"']filterWorkspaceLabel["'"'"']' "artifact category config missing workspace labelKey"
check_pattern 'labelKey:[[:space:]]*["'"'"']filterTechLabel["'"'"']' "artifact category config missing tech labelKey"
check_pattern 'labelKey:[[:space:]]*["'"'"']filterEtcLabel["'"'"']' "artifact category config missing etc labelKey"
check_pattern 'visibleLimit:[[:space:]]*initialVisibleLimit\(\)' "artifact state should initialize visibleLimit responsively"
check_pattern 'state\.visibleLimit = initialVisibleLimit\(\)' "artifact visibleLimit resets should use initialVisibleLimit"
check_pattern 'state\.visibleLimit \+= visibleStepLimit\(\)' "artifact load more should use responsive visibleStepLimit"
check_pattern 'loading = index < eagerCount \? ["'"'"']eager["'"'"'] : ["'"'"']lazy["'"'"']' "artifact card image loading priority is missing"
check_pattern 'fetchpriority' "artifact card image fetchpriority is missing"
check_pattern '\.store-card--skeleton \.store-card__media \{' "artifact skeleton card media rule is missing"
check_pattern '@media \(prefers-reduced-motion: no-preference\)' "artifact skeleton motion preference guard is missing"
check_count_gte 'store-card--skeleton' '8' "artifact must ship at least 8 skeleton cards"
check_pattern 'id=["'"'"']store-preview-save["'"'"'][^>]*aria-pressed=["'"'"']false["'"'"']' "artifact Save button missing aria-pressed contract"
check_pattern 'id=["'"'"']store-copy-links["'"'"']' "artifact Copy Links button is missing"
check_pattern 'id=["'"'"']store-preview-toast["'"'"']' "artifact preview inline toast is missing"
check_pattern 'id=["'"'"']store-saved-toast["'"'"']' "artifact saved inline toast is missing"
check_pattern 'bookmark_remove|data-store-saved-remove-index=' "artifact Saved remove hook is missing"
check_pattern 'content_copy' "artifact Copy Links idle icon support is missing"
check_pattern 'copyLinksCopied|setPreviewCopyState\(' "artifact Copy Links success support is missing"
check_pattern 'slug:' "artifact product parser slug support is missing"
check_pattern 'canonicalUrl:' "artifact product parser canonicalUrl support is missing"
check_pattern 'whyPicked:' "artifact product parser whyPicked support is missing"
check_pattern 'bestFor:' "artifact product parser bestFor support is missing"
check_pattern 'caveat:' "artifact product parser caveat support is missing"
check_pattern 'data-store-semantic-detail-link' "artifact semantic editorial detail link is missing"
check_pattern 'data-store-semantic-store-link' "artifact semantic store deep link is missing"
check_pattern "showToast\\(copy\\(nextSaved \\? 'savedToast' : 'removedToast'\\), 'preview'\\)" "artifact preview save toast context is missing"
check_pattern "showToast\\(copy\\('copyToast'\\), 'preview'\\)" "artifact preview copy success toast context is missing"
check_pattern "showToast\\(copy\\('copyFailToast'\\), 'preview'\\)" "artifact preview copy fail toast context is missing"
check_pattern "showToast\\(copy\\('removedToast'\\), 'saved'\\)" "artifact saved remove toast context is missing"
check_pattern 'data-store-remove-saved' "artifact saved remove dataset hook is missing"
check_pattern 'id=["'"'"']store-link-shopee["'"'"'][^>]*target=["'"'"']_blank["'"'"'][^>]*rel=["'"'"'][^"'"'"']*sponsored[^"'"'"']*nofollow[^"'"'"']*noopener[^"'"'"']*noreferrer[^"'"'"']*["'"'"']' "artifact Shopee CTA rel/target contract is missing"
check_pattern 'id=["'"'"']store-link-tiktok["'"'"'][^>]*target=["'"'"']_blank["'"'"'][^>]*rel=["'"'"'][^"'"'"']*sponsored[^"'"'"']*nofollow[^"'"'"']*noopener[^"'"'"']*noreferrer[^"'"'"']*["'"'"']' "artifact TikTok CTA rel/target contract is missing"
check_pattern 'id=["'"'"']store-link-tokopedia["'"'"'][^>]*target=["'"'"']_blank["'"'"'][^>]*rel=["'"'"'][^"'"'"']*sponsored[^"'"'"']*nofollow[^"'"'"']*noopener[^"'"'"']*noreferrer[^"'"'"']*["'"'"']' "artifact Tokopedia CTA rel/target contract is missing"
check_pattern '--store-card-aspect:\s*4 / 5;' "artifact 4:5 card aspect token is missing"
check_pattern 'aspect-ratio:\s*var\(--store-card-aspect\)' "artifact card aspect-ratio rule is missing"
check_pattern '/feeds/posts/default/-/Store' "artifact Store feed contract is missing"
check_absent 'aggregateRating' "artifact should not fabricate aggregateRating"
check_absent 'reviewCount' "artifact should not fabricate reviewCount"
check_absent 'VISIBLE_INITIAL[[:space:]]*=[[:space:]]*24' "artifact still hardcodes VISIBLE_INITIAL to 24"
check_absent 'grid\.innerHTML' "artifact still renders grid via innerHTML"
check_absent 'discoveryResults\.innerHTML' "artifact still renders discovery results via innerHTML"
check_absent 'savedResults\.innerHTML' "artifact still renders saved results via innerHTML"
check_absent 'preview\.carousel\.innerHTML' "artifact still renders preview carousel via innerHTML"
check_absent 'preview\.dots\.innerHTML' "artifact still renders preview dots via innerHTML"
check_absent 'notesList\.innerHTML|preview\.notesList\.innerHTML' "artifact still renders notes via innerHTML"
check_absent 'insertAdjacentHTML' "artifact still uses insertAdjacentHTML"
check_absent 'document\.createElement\(["'"'"']style["'"'"']\)' "artifact still creates style nodes from JS"
check_absent '\.style\.transform' "artifact still mutates transform inline from JS"
check_absent '\.style\.opacity' "artifact still mutates opacity inline from JS"
check_absent '\.style\.height' "artifact still mutates height inline from JS"
check_absent '\.style\.display' "artifact still mutates display inline from JS"
check_absent '\.style\.pointerEvents' "artifact still mutates pointerEvents inline from JS"
check_absent '<p class=["'"'"']store-summary["'"'"'] id=["'"'"']store-discovery-status["'"'"']>All products are visible\.</p>' "artifact discovery status is hardcoded without localization hook"
check_absent '<p class=["'"'"']store-summary["'"'"']>Saved on this device\.</p>' "artifact saved summary is hardcoded without localization hook"
check_absent '<p class=["'"'"']store-sheet-section__label["'"'"']>Quick intents</p>' "artifact quick intents label is hardcoded without localization hook"
check_absent '<p class=["'"'"']store-sheet-section__label["'"'"']>Results</p>' "artifact results label is hardcoded without localization hook"
check_absent '<p class=["'"'"']store-sheet-section__label["'"'"'] id=["'"'"']store-navigation-label["'"'"']>Navigate</p>' "artifact navigate label is hardcoded without localization hook"
check_absent '<p class=["'"'"']store-sheet-section__label["'"'"'] id=["'"'"']store-language-label["'"'"']>Language</p>' "artifact language label is hardcoded without localization hook"
check_absent '<p class=["'"'"']store-sheet-section__label["'"'"'] id=["'"'"']store-appearance-label["'"'"']>Appearance</p>' "artifact appearance label is hardcoded without localization hook"
check_absent '<a class=["'"'"']store-button["'"'"'] href=["'"'"']/store#store-top["'"'"']>Back to Top</a>' "artifact Back to Top is hardcoded without localization hook"
check_absent '<button class=["'"'"']gg-visually-hidden["'"'"'] type=["'"'"']button["'"'"'] data-store-close=["'"'"']discovery["'"'"']>Close discovery</button>' "artifact Close discovery is hardcoded without localization hook"
check_absent '<button class=["'"'"']gg-visually-hidden["'"'"'] type=["'"'"']button["'"'"'] data-store-close=["'"'"']saved["'"'"']>Close saved</button>' "artifact Close saved is hardcoded without localization hook"
check_absent '<button class=["'"'"']gg-visually-hidden["'"'"'] type=["'"'"']button["'"'"'] data-store-close=["'"'"']more["'"'"']>Close more panel</button>' "artifact Close more is hardcoded without localization hook"
check_absent 'id=["'"'"']store-app["'"'"'][^>]*[[:space:]]hidden([[:space:]=/>]|$)' "artifact store shell must not be hidden"
check_absent 'id=["'"'"']store-top["'"'"'][^>]*[[:space:]]hidden([[:space:]=/>]|$)' "artifact hero shell must not be hidden"
check_absent 'id=["'"'"']store-grid-skeleton["'"'"'][^>]*[[:space:]]hidden([[:space:]=/>]|$)' "artifact skeleton grid must paint immediately"
check_absent 'id=["'"'"']store-category-context["'"'"'][^>]*[[:space:]]hidden([[:space:]=/>]|$)' "artifact category context must stay visible"
check_absent 'id=["'"'"']store-semantic-products["'"'"'][^>]*[[:space:]]hidden([[:space:]=/>]|$)' "artifact semantic product section must stay visible"

if [[ "$failures" -gt 0 ]]; then
  printf 'STORE ARTIFACT SMOKE RESULT: FAILED (%s)\n' "$failures" >&2
  exit 1
fi

printf 'STORE ARTIFACT SMOKE RESULT: PASS\n'
