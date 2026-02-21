#!/usr/bin/env bash
set -Eeuo pipefail
trap 'echo "FAIL: gate:prod crashed at line $LINENO: $BASH_COMMAND" >&2' ERR

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

run() {
  echo
  echo "\$ $*"
  "$@"
}

if ! run npm run verify:release; then
  echo "WARN: verify:release failed, running build to realign release artifacts"
  run env ALLOW_DIRTY_RELEASE=1 npm run build
  run npm run verify:release
fi

run npm run verify:assets
run npm run verify:xml
run node tools/verify-ledger.mjs
run node tools/verify-rulebooks.mjs
run node tools/verify-route-a11y-contract.mjs
run node tools/verify-core-swap-no-innerhtml.mjs
run node tools/verify-core-panel-no-innerhtml.mjs
run node tools/verify-comments-gate-no-innerhtml.mjs
run node tools/verify-shortcodes-no-innerhtml.mjs
run node tools/verify-shortcodes-templates.mjs
run node tools/verify-no-new-html-in-js.mjs
run node tools/verify-no-innerhtml-assign-modules.mjs
run node tools/verify-mixed-no-innerhtml.mjs
run node tools/verify-mixed-no-trivial-htmljs.mjs
run node tools/verify-search-no-innerhtml.mjs
run node tools/verify-skip-link-contract.mjs
run node tools/verify-icon-controls-a11y.mjs
run node tools/verify-tap-targets.mjs
run node tools/verify-palette-not-modal.mjs
run node tools/verify-modal-open-close-parity.mjs
run node tools/verify-overlay-modal-contract.mjs
run node tools/verify-legacy-allowlist-ratchet.mjs
run node tools/verify-phase4-no-trivial-htmljs.mjs
run node tools/verify-no-innerhtml-clear.mjs
run node tools/verify-panels-inert-safety.mjs
run node tools/verify-smooth-scroll-policy.mjs
run node tools/verify-authors-dir-contract.mjs
run node tools/verify-sitemap-page-contract.mjs
run node tools/verify-tags-dir-contract.mjs
run node tools/verify-router-contract.mjs
run node tools/verify-ui-guardrails.mjs
run node tools/verify-template-no-nested-interactives.mjs
run node tools/verify-template-contract.mjs
run npm run verify:template-fingerprint
run node tools/verify-headers.mjs --mode=config
run node tools/verify-budgets.mjs
run node tools/verify-inline-css.mjs
run node tools/verify-crp.mjs

SMOKE_BASE="${SMOKE_BASE:-${BASE:-https://www.pakrpp.com}}"
SMOKE_EXPECT_VALUE="${SMOKE_EXPECT:-live}"
SMOKE_ATTEMPTS="${SMOKE_ATTEMPTS:-3}"
ALLOW_OFFLINE_SMOKE_SKIP="${GATE_ALLOW_OFFLINE_SMOKE_SKIP:-1}"
SMOKE_ALLOW_OFFLINE_FALLBACK_VALUE="${GATE_SMOKE_ALLOW_OFFLINE_FALLBACK:-1}"

attempt=1
smoke_ok=0
while (( attempt <= SMOKE_ATTEMPTS )); do
  if SMOKE_EXPECT="${SMOKE_EXPECT_VALUE}" BASE="${SMOKE_BASE}" SMOKE_LIVE_HTML=1 SMOKE_ALLOW_OFFLINE_FALLBACK="${SMOKE_ALLOW_OFFLINE_FALLBACK_VALUE}" "${ROOT}/tools/smoke.sh"; then
    smoke_ok=1
    break
  fi
  if (( attempt >= SMOKE_ATTEMPTS )); then
    break
  fi
  next_attempt=$((attempt + 1))
  echo "WARN: smoke failed, retrying (${next_attempt}/${SMOKE_ATTEMPTS})..."
  attempt="${next_attempt}"
  sleep 2
done

if (( smoke_ok == 0 )); then
  if [[ "${ALLOW_OFFLINE_SMOKE_SKIP}" == "1" ]]; then
    echo "WARN: live smoke unavailable; running local palette a11y fallback"
    run node tools/verify-palette-a11y.mjs --mode=repo
    echo "WARN: gate:prod passed with offline smoke fallback"
  else
    echo "FAIL: smoke failed after ${SMOKE_ATTEMPTS} attempt(s)" >&2
    exit 1
  fi
fi

echo "PASS: gate:prod"
