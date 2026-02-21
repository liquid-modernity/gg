TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-NATIVE-FEEL-ROUTE-FOCUS-ANNOUNCE-20260221
TITLE: Focus + announce on SPA route changes

SUMMARY
- Added one-time router a11y patch in `ui.bucket.core.js` that wraps `router.onNavigate` and `router.onPopState`.
- On SPA route callbacks, behavior now runs after double `requestAnimationFrame`:
  - focus moves to `#gg-main` using `preventScroll:true`
  - SR announcement uses `GG.services.a11y.announce('Dibuka: ' + document.title, { politeness:'polite' })` when title is non-empty.
- Patch is guarded with `router._a11yRoutePatched` to prevent double wrapping.
- Added verifier `tools/verify-route-a11y-contract.mjs` and wired it into `tools/gate-prod.sh`.
- Removed legacy in-render route announce path so route callbacks become the single source for focus+announce timing.

FILES CHANGED
- public/assets/latest/modules/ui.bucket.core.js
- tools/verify-route-a11y-contract.mjs
- tools/gate-prod.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/d790c38/*
- public/assets/v/1d3d036/*
- public/assets/v/c7d6ec6/* (removed)

VERIFICATION OUTPUTS
- `node tools/verify-route-a11y-contract.mjs`
```text
VERIFY_ROUTE_A11Y_CONTRACT: PASS
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_ROUTE_A11Y_CONTRACT: PASS
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=57 allowlisted_matches=57 violations=0
PASS: verify-panels-inert-safety
PASS: verify-smooth-scroll-policy
VERIFY_AUTHORS_DIR_CONTRACT: PASS
VERIFY_SITEMAP_PAGE_CONTRACT: PASS
VERIFY_TAGS_DIR_CONTRACT: PASS
VERIFY_ROUTER_CONTRACT: PASS
VERIFY_UI_GUARDRAILS: PASS
VERIFY_TEMPLATE_CONTRACT: PASS
VERIFY_TEMPLATE_FINGERPRINT: PASS
VERIFY_BUDGETS: PASS
VERIFY_INLINE_CSS: PASS
VERIFY_CRP: PASS
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

- `bash tools/gate-release.sh`
```text
VERIFY_ROUTE_A11Y_CONTRACT: PASS
curl: (6) Could not resolve host: www.pakrpp.com
FAIL: __gg_worker_ping request failed
FAIL: smoke failed after 1 attempt(s)
```

MANUAL SANITY
- Not executed in this sandbox (no interactive browser/screen-reader session).
- Required checks pending on real browser session:
  - Navigate via internal link: focus lands on `#gg-main`, polite announcement speaks `Dibuka: <title>`.
  - Back/Forward popstate repeats the same behavior.
  - No visible scroll jump regression.
