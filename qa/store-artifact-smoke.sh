#!/usr/bin/env bash
set -euo pipefail

export LC_ALL=C

artifact_file=".cloudflare-build/public/store.html"
source_file="store.html"
target_file="$source_file"
failures=0

if [[ -f "$artifact_file" ]]; then
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

printf 'SMOKE-STORE-ARTIFACT lane=ARTIFACT source=%s\n' "$target_file"

check_pattern '<title>\s*Yellow Cart · PakRPP\s*</title>' "artifact missing canonical title"
check_pattern 'rel=["'"'"']canonical["'"'"'][^>]*href=["'"'"']https://www\.pakrpp\.com/store["'"'"']' "artifact missing canonical /store"
check_pattern '<h1[^>]*>\s*Yellow Cart\s*</h1>' "artifact missing H1 Yellow Cart"
check_pattern 'class=["'"'"'][^"'"'"']*store-grid[^"'"'"']*["'"'"']' "artifact store catalogue surface is missing"
check_pattern 'id=["'"'"']store-top["'"'"']' "artifact store-top anchor is missing"
check_pattern 'id=["'"'"']store-grid["'"'"']' "artifact store-grid anchor is missing"
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
check_pattern 'id=["'"'"']store-card-template["'"'"']' "artifact product card template is missing"
check_pattern 'id=["'"'"']store-card-dot-template["'"'"']' "artifact card dot template is missing"
check_pattern 'id=["'"'"']store-preview-slide-template["'"'"']' "artifact preview slide template is missing"
check_pattern 'id=["'"'"']store-preview-dot-template["'"'"']' "artifact preview dot template is missing"
check_pattern 'id=["'"'"']store-result-row-template["'"'"']' "artifact result row template is missing"
check_pattern 'id=["'"'"']store-saved-row-template["'"'"']' "artifact saved row template is missing"
check_pattern 'id=["'"'"']store-empty-row-template["'"'"']' "artifact empty row template is missing"
check_pattern 'id=["'"'"']store-preview-note-template["'"'"']' "artifact preview note template is missing"
check_pattern 'id=["'"'"']store-filter-toggle["'"'"'][^>]*aria-label=["'"'"']' "artifact filter toggle aria-label is missing"
check_pattern 'id=["'"'"']store-filter-current-icon["'"'"']' "artifact filter peek current icon is missing"
check_pattern 'id=["'"'"']store-filter-current["'"'"']' "artifact filter peek current label is missing"
check_pattern 'id=["'"'"']store-filter-count["'"'"']' "artifact filter peek count is missing"
check_pattern 'id=["'"'"']store-filter-toggle-icon["'"'"']' "artifact filter peek toggle icon is missing"
check_pattern 'getElementById\(["'"'"']store-grid["'"'"']\)' "artifact JS store-grid lookup is missing"
check_pattern 'data-store-dock=["'"'"']store["'"'"']|querySelector\(\[data-store-dock=' "artifact same-page Store dock hook is missing"
check_count_eq 'id=["'"'"']store-filter-current["'"'"']' '1' "artifact still contains duplicate store-filter-current ids"
check_absent 'store-filter-outline__eyebrow' "artifact still contains old filter eyebrow markup or styles"
check_absent 'store-filter-outline__label-icon' "artifact still contains old nested filter label icon markup or styles"
check_pattern "all:[[:space:]]*'filter_list'" "artifact filter icon map missing all -> filter_list"
check_pattern "fashion:[[:space:]]*'checkroom'" "artifact filter icon map missing fashion -> checkroom"
check_pattern "skincare:[[:space:]]*'spa'" "artifact filter icon map missing skincare -> spa"
check_pattern "workspace:[[:space:]]*'desktop_windows'" "artifact filter icon map missing workspace -> desktop_windows"
check_pattern "tech:[[:space:]]*'devices'" "artifact filter icon map missing tech -> devices"
check_pattern "etc:[[:space:]]*'category'" "artifact filter icon map missing etc -> category"
check_pattern 'id=["'"'"']store-preview-save["'"'"'][^>]*aria-pressed=["'"'"']false["'"'"']' "artifact Save button missing aria-pressed contract"
check_pattern 'id=["'"'"']store-copy-links["'"'"']' "artifact Copy Links button is missing"
check_pattern 'id=["'"'"']store-preview-toast["'"'"']' "artifact preview inline toast is missing"
check_pattern 'id=["'"'"']store-saved-toast["'"'"']' "artifact saved inline toast is missing"
check_pattern 'bookmark_remove|data-store-saved-remove-index=' "artifact Saved remove hook is missing"
check_pattern 'content_copy' "artifact Copy Links idle icon support is missing"
check_pattern 'copyLinksCopied|setPreviewCopyState\(' "artifact Copy Links success support is missing"
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

if [[ "$failures" -gt 0 ]]; then
  printf 'STORE ARTIFACT SMOKE RESULT: FAILED (%s)\n' "$failures" >&2
  exit 1
fi

printf 'STORE ARTIFACT SMOKE RESULT: PASS\n'
