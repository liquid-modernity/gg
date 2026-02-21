TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-HTML-IN-JS-MIGRATION-PHASE4-20260221
TITLE: Phase4 reduce HTML-in-JS debt (channel/mixed/authors) + tighten ratchet

SUMMARY
- Migrated low-hanging HTML-in-JS in `ui.bucket.channel.js` and `ui.bucket.authors.js` to DOM API rendering (`createElement`, `textContent`, `appendChild`) and removed corresponding legacy annotations.
- Kept complex `ui.bucket.mixed.js` rendering callsites for next phase (still allowlisted) to avoid broad behavior risk in this task.
- Added phase4 guardrail verifier `tools/verify-phase4-no-trivial-htmljs.mjs` and wired it into `tools/gate-prod.sh`.
- Tightened allowlist ratchet to `max_allow=28`.

TARGET IDS (BEFORE CHANGES)
- `public/assets/latest/modules/ui.bucket.authors.js`
  - LEGACY-0001, LEGACY-0002, LEGACY-0003, LEGACY-0004
- `public/assets/latest/modules/ui.bucket.channel.js`
  - LEGACY-0005, LEGACY-0006, LEGACY-0007, LEGACY-0008, LEGACY-0009, LEGACY-0010, LEGACY-0011
- `public/assets/latest/modules/ui.bucket.mixed.js`
  - LEGACY-0065, LEGACY-0066, LEGACY-0067, LEGACY-0068, LEGACY-0069, LEGACY-0070

ALLOWLIST COUNT
- Before: `37`
- After: `28`
- `max_allow`: `28`

IDS REMOVED
- LEGACY-0003
- LEGACY-0004
- LEGACY-0005
- LEGACY-0006
- LEGACY-0007
- LEGACY-0008
- LEGACY-0009
- LEGACY-0010
- LEGACY-0011

FILES CHANGED
- public/assets/latest/modules/ui.bucket.channel.js
- public/assets/latest/modules/ui.bucket.authors.js
- docs/contracts/LEGACY_HTML_IN_JS_ALLOWLIST.json
- tools/verify-phase4-no-trivial-htmljs.mjs
- tools/gate-prod.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-phase4-no-trivial-htmljs.mjs`
```text
PASS: phase4 trivial htmljs blocked
```

- `node tools/verify-no-new-html-in-js.mjs`
```text
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=28 allowlisted_matches=28 violations=0
```

- `node tools/verify-legacy-allowlist-ratchet.mjs`
```text
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_ROUTE_A11Y_CONTRACT: PASS
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=28 allowlisted_matches=28 violations=0
PASS: phase4 trivial htmljs blocked
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
VERIFY_TEMPLATE_NO_NESTED_INTERACTIVES: PASS
VERIFY_TEMPLATE_CONTRACT: PASS
VERIFY_TEMPLATE_FINGERPRINT: PASS
VERIFY_BUDGETS: PASS
VERIFY_INLINE_CSS: PASS
VERIFY_CRP: PASS
PASS: palette a11y contract (mode=repo, release=3b01c55)
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

ADDITIONAL VERIFY
- `bash tools/gate-release.sh`
```text
PASS: phase4 trivial htmljs blocked
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=28 allowlisted_matches=28 violations=0
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
curl: (6) Could not resolve host: www.pakrpp.com
FAIL: __gg_worker_ping request failed
FAIL: smoke failed after 1 attempt(s)
```

NOTES
- `gate:prod` realigned release artifacts to `RELEASE_ID=3b01c55` after task changes.
- `gate-release` strict live smoke fails in this sandbox due DNS/network resolution, while local contract verifiers pass.
