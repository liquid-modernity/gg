TASK_REPORT
Last updated: 2026-02-22

TASK_ID: TASK-PERF-BASELINE-BUDGET-RATCHET-20260222
TITLE: Add baseline + budgets with ratchet verifier

SUMMARY
- Added baseline document `docs/perf/BASELINE.md` for 3 required surfaces:
  - HOME: `https://www.pakrpp.com/`
  - LISTING: `https://www.pakrpp.com/blog`
  - POST: `https://www.pakrpp.com/2024/11/seo-onpage-checklist.html`
- Baseline includes required numeric metrics per surface:
  - Lighthouse Performance score (mobile)
  - LCP (ms)
  - CLS
  - INP (ms)
  - TBT (ms)
  - Transfer (KB)
  - JS execution time (ms)
- Added budget contract files:
  - `docs/perf/BUDGETS.json` (active targets + hard ratchet ceilings)
  - `docs/perf/BUDGETS.lock.json` (approved lock for non-loosening checks)
- Added deterministic verifier `tools/verify-perf-budgets.mjs`:
  - fails if baseline missing required sections/surfaces/metric fields
  - fails if budgets/lock missing required keys
  - fails if any `ratchet.max_*` value in `BUDGETS.json` is increased above lock
- Wired verifier into `tools/gate-prod.sh`.
- Updated `docs/release/DISTRIBUTION.md` with baseline discipline + ratchet non-loosening rule.

BUDGETS SET
- targets:
  - `lcp_ms`: 2500
  - `cls`: 0.05
  - `inp_ms`: 200
  - `tbt_ms`: 75
  - `transfer_kb`: 650
- ratchet ceilings:
  - `max_lcp_ms`: 2800
  - `max_cls`: 0.10
  - `max_inp_ms`: 300
  - `max_tbt_ms`: 150
  - `max_transfer_kb`: 850

FILES CHANGED
- docs/perf/BASELINE.md
- docs/perf/BUDGETS.json
- docs/perf/BUDGETS.lock.json
- tools/verify-perf-budgets.mjs
- tools/gate-prod.sh
- docs/release/DISTRIBUTION.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md

VERIFICATION OUTPUTS
- `node tools/verify-perf-budgets.mjs`
```text
VERIFY_PERF_BUDGETS: PASS
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_RELEASE_ALIGNED: PASS
VERIFY_PERF_BUDGETS: PASS
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=1 allowlisted_matches=1 violations=0
VERIFY_BUDGETS: PASS
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

MANUAL SANITY
- Baseline measurement remains a trend snapshot; refresh only via intentional perf task.
