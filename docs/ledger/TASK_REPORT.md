TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-PHASE5-REDUCE-MIXED-HTMLJS-20260221
TITLE: Remove HTML-in-JS injection in mixed module and tighten allowlist ratchet

SUMMARY
- Refactored `public/assets/latest/modules/ui.bucket.mixed.js` to DOM-based rendering (no `innerHTML` / `insertAdjacentHTML` / `outerHTML`).
- Removed mixed-specific legacy allowlist entries (`LEGACY-0065..LEGACY-0070`).
- Added mixed-specific guardrails and wired them into `gate:prod`.
- Tightened allowlist ratchet to exact baseline after refactor.

STEP 1 — MIXED LEGACY INVENTORY (BEFORE)
- LEGACY-0065 | pattern: `innerHTML\\s*=` | note: inject newsdeck skeleton columns/placeholders into grid
- LEGACY-0066 | pattern: `innerHTML\\s*=` | note: inject rail skeleton cards
- LEGACY-0067 | pattern: `innerHTML\\s*=` | note: inject grid skeleton cards
- LEGACY-0068 | pattern: `innerHTML\\s*=` | note: inject rendered newsdeck markup
- LEGACY-0069 | pattern: `innerHTML\\s*=` | note: inject rendered rail cards markup
- LEGACY-0070 | pattern: `innerHTML\\s*=` | note: inject rendered grid cards markup

ALLOWLIST COUNT
- Before: `28`
- After: `22`
- `max_allow`: `22`

IDS REMOVED
- LEGACY-0065
- LEGACY-0066
- LEGACY-0067
- LEGACY-0068
- LEGACY-0069
- LEGACY-0070

FILES CHANGED
- public/assets/latest/modules/ui.bucket.mixed.js
- docs/contracts/LEGACY_HTML_IN_JS_ALLOWLIST.json
- tools/verify-mixed-no-innerhtml.mjs
- tools/verify-mixed-no-trivial-htmljs.mjs
- tools/gate-prod.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-mixed-no-innerhtml.mjs`
```text
PASS: mixed.js has no innerHTML
```

- `node tools/verify-mixed-no-trivial-htmljs.mjs`
```text
PASS: mixed.js trivial htmljs blocked
```

- `node tools/verify-legacy-allowlist-ratchet.mjs`
```text
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
```

- `node tools/verify-no-new-html-in-js.mjs`
```text
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=22 allowlisted_matches=22 violations=0
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=22 allowlisted_matches=22 violations=0
PASS: mixed.js has no innerHTML
PASS: mixed.js trivial htmljs blocked
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
PASS: phase4 trivial htmljs blocked
VERIFY_TEMPLATE_CONTRACT: PASS
VERIFY_BUDGETS: PASS
VERIFY_INLINE_CSS: PASS
VERIFY_CRP: PASS
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

- `bash tools/gate-release.sh`
```text
INFO: live checks run only in CI or with GG_GATE_RELEASE_LIVE=1
PASS: mixed.js has no innerHTML
PASS: mixed.js trivial htmljs blocked
PASS: gate:prod
PASS: gate:release(local)
```

- `npm run zip:audit`
```text
FAIL: working tree must be clean before zip:audit (integrity guardrail)
```

NOTES
- Gate realigned release artifacts to the current `RELEASE_ID` during verification.
- Manual 5-minute browser sanity for mixed sections (home/listing) was not executable in this CLI-only environment.
- `zip:audit` is re-run after ship on clean tree to produce final artifact.
