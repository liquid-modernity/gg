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

printf 'SMOKE-STORE-ARTIFACT lane=ARTIFACT source=%s\n' "$target_file"

check_pattern '<title>\s*Yellow Cart · PakRPP\s*</title>' "artifact missing canonical title"
check_pattern 'rel=["'"'"']canonical["'"'"'][^>]*href=["'"'"']https://www\.pakrpp\.com/store["'"'"']' "artifact missing canonical /store"
check_pattern '<h1[^>]*>\s*Yellow Cart\s*</h1>' "artifact missing H1 Yellow Cart"
check_pattern 'class=["'"'"'][^"'"'"']*store-grid[^"'"'"']*["'"'"']' "artifact store catalogue surface is missing"
check_absent 'store-topbar' "artifact still contains store-topbar"
check_absent 'store-card__quick' "artifact still contains store-card__quick"
check_absent 'store-preview__close' "artifact still exposes store-preview__close"
check_absent 'store-read-article' "artifact still contains store-read-article"
check_pattern '<a[^>]*data-store-dock=["'"'"']store["'"'"'][^>]*href=["'"'"']/store["'"'"']' "artifact dock Store href contract is missing"
check_pattern '<a[^>]*data-store-dock=["'"'"']contact["'"'"'][^>]*href=["'"'"']/store#contact["'"'"']' "artifact dock Contact href contract is missing"
check_pattern '<button[^>]*data-store-dock=["'"'"']discover["'"'"'][^>]*aria-controls=["'"'"']store-discovery-sheet["'"'"']' "artifact dock Discover contract is missing"
check_pattern '<button[^>]*data-store-dock=["'"'"']saved["'"'"'][^>]*aria-controls=["'"'"']store-saved-sheet["'"'"']' "artifact dock Saved contract is missing"
check_pattern '<button[^>]*data-store-dock=["'"'"']more["'"'"'][^>]*aria-controls=["'"'"']store-more-sheet["'"'"']' "artifact dock More contract is missing"
check_pattern '<a[^>]*data-store-more-link=["'"'"']blog["'"'"'][^>]*href=["'"'"']/["'"'"']' "artifact More sheet Blog href is not /"
check_pattern '<a[^>]*data-store-more-link=["'"'"']home["'"'"'][^>]*href=["'"'"']/landing["'"'"']' "artifact More sheet Home href is not /landing"
check_pattern 'id=["'"'"']store-discovery-sheet["'"'"']' "artifact Discovery sheet is missing"
check_pattern 'id=["'"'"']store-saved-sheet["'"'"']' "artifact Saved sheet is missing"
check_pattern 'class=["'"'"']store-preview__footer["'"'"']' "artifact preview footer handle container is missing"
check_pattern 'class=["'"'"']store-preview__handle["'"'"']' "artifact preview footer handle is missing"
check_pattern 'id=["'"'"']store-link-shopee["'"'"'][^>]*target=["'"'"']_blank["'"'"'][^>]*rel=["'"'"'][^"'"'"']*sponsored[^"'"'"']*nofollow[^"'"'"']*noopener[^"'"'"']*noreferrer[^"'"'"']*["'"'"']' "artifact Shopee CTA rel/target contract is missing"
check_pattern 'id=["'"'"']store-link-tiktok["'"'"'][^>]*target=["'"'"']_blank["'"'"'][^>]*rel=["'"'"'][^"'"'"']*sponsored[^"'"'"']*nofollow[^"'"'"']*noopener[^"'"'"']*noreferrer[^"'"'"']*["'"'"']' "artifact TikTok CTA rel/target contract is missing"
check_pattern 'id=["'"'"']store-link-tokopedia["'"'"'][^>]*target=["'"'"']_blank["'"'"'][^>]*rel=["'"'"'][^"'"'"']*sponsored[^"'"'"']*nofollow[^"'"'"']*noopener[^"'"'"']*noreferrer[^"'"'"']*["'"'"']' "artifact Tokopedia CTA rel/target contract is missing"
check_pattern '--store-card-aspect:\s*4 / 5;' "artifact 4:5 card aspect token is missing"
check_pattern 'aspect-ratio:\s*var\(--store-card-aspect\)' "artifact card aspect-ratio rule is missing"
check_pattern '/feeds/posts/default/-/Store' "artifact Store feed contract is missing"

if [[ "$failures" -gt 0 ]]; then
  printf 'STORE ARTIFACT SMOKE RESULT: FAILED (%s)\n' "$failures" >&2
  exit 1
fi

printf 'STORE ARTIFACT SMOKE RESULT: PASS\n'
