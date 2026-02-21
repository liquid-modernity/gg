TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-RELEASE-GATE-MODES-20260221
TITLE: Split local vs live release gates (CI is source of truth)

SUMMARY
- Refactored release gating into two modes:
  - `tools/gate-release.sh` is now a dispatcher.
  - `tools/gate-release-live.sh` is strict LIVE gate (copied from previous strict gate script).
- Local default no longer depends on external DNS/live reachability and runs deterministic repo-safe checks.
- CI deploy workflow now runs strict LIVE gate after deploy with retry wrapper to absorb transient network issues without lowering strictness.
- Distribution contract now states local vs CI gate responsibilities explicitly.

WHY SPLIT EXISTS
- Local development environment can have DNS/network limits; release gate should not block local progress for non-code infrastructure reachability.
- CI has stable network/runtime and is therefore the authoritative release proof for LIVE checks.

FILES CHANGED
- tools/gate-release-live.sh
- tools/gate-release.sh
- .github/workflows/deploy.yml
- docs/release/DISTRIBUTION.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md

WORKFLOW PROOF (DEPLOY RUNS STRICT LIVE GATE)
- File: `.github/workflows/deploy.yml`
- Added step:
```yaml
- name: Post-deploy strict live gate (retry)
  run: |
    ...
    if bash tools/gate-release-live.sh; then
      echo "PASS: gate-release-live"
      break
    fi
```

VERIFICATION OUTPUTS
- `bash tools/gate-release.sh`
```text
INFO: live checks run only in CI or with GG_GATE_RELEASE_LIVE=1
...
PASS: gate:prod
...
PASS: palette a11y contract (mode=repo, release=3b01c55)
PASS: gate:release(local)
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_AUTHORS_DIR_CONTRACT: PASS
VERIFY_ROUTE_A11Y_CONTRACT: PASS
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=28 allowlisted_matches=28 violations=0
VERIFY_SEARCH_NO_INNERHTML: PASS
VERIFY_SKIP_LINK_CONTRACT: PASS
VERIFY_ICON_CONTROLS_A11Y: PASS checkedCandidates=68 labeled=68 unlabeledSuspects=0
PASS: tap targets contract (44px)
VERIFY_PALETTE_NOT_MODAL: PASS
VERIFY_MODAL_OPEN_CLOSE_PARITY: PASS modalOpen=3 modalClose=6
VERIFY_OVERLAY_MODAL_CONTRACT: PASS
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
PASS: phase4 trivial htmljs blocked
VERIFY_NO_INNERHTML_CLEAR: PASS
PASS: verify-panels-inert-safety
PASS: verify-smooth-scroll-policy
VERIFY_SITEMAP_PAGE_CONTRACT: PASS
VERIFY_TAGS_DIR_CONTRACT: PASS
VERIFY_ROUTER_CONTRACT: PASS
VERIFY_UI_GUARDRAILS: PASS
VERIFY_TEMPLATE_NO_NESTED_INTERACTIVES: PASS
VERIFY_TEMPLATE_CONTRACT: PASS
VERIFY_TEMPLATE_FINGERPRINT: PASS
VERIFY_BUDGETS: PASS
VERIFY_INLINE_CSS: PASS
VERIFY_CRP: PASS
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

- `bash tools/gate-release-live.sh` (local sandbox evidence)
```text
...
curl: (6) Could not resolve host: www.pakrpp.com
FAIL: __gg_worker_ping request failed
FAIL: smoke failed after 1 attempt(s)
```

- `GG_GATE_RELEASE_LIVE=1 bash tools/gate-release.sh` (forced dispatcher to LIVE path)
```text
...
curl: (6) Could not resolve host: www.pakrpp.com
FAIL: __gg_worker_ping request failed
FAIL: smoke failed after 1 attempt(s)
```

NOTES
- Local dispatcher intentionally never claims LIVE PASS.
- LIVE proof is now mandatory in CI via `tools/gate-release-live.sh` post-deploy step.
