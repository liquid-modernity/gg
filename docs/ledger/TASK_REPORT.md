TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-LEGACY-HTML-IN-JS-REALITY-CHECK-20260221
TITLE: Block new HTML-in-JS with allowlisted legacy exceptions

SUMMARY
- Added explicit legacy policy to `docs/AGENTS.md` section 2.2: legacy HTML-in-JS is only allowed when annotated and allowlisted.
- Bootstrapped baseline allowlist `docs/contracts/LEGACY_HTML_IN_JS_ALLOWLIST.json` (v1, updated 2026-02-21) from current HEAD.
- Added annotations on existing legacy callsites across module files using `// @gg-allow-html-in-js LEGACY:<ID>`.
- Added generator helper `tools/gen-legacy-htmljs-allowlist.mjs` for baseline/bootstrap workflow.
- Added hard gate verifier `tools/verify-no-new-html-in-js.mjs` and wired it into `tools/gate-prod.sh` immediately after rulebook verification.

FILES CHANGED
- docs/AGENTS.md
- docs/contracts/LEGACY_HTML_IN_JS_ALLOWLIST.json
- tools/gen-legacy-htmljs-allowlist.mjs
- tools/verify-no-new-html-in-js.mjs
- tools/gate-prod.sh
- public/assets/latest/modules/ui.bucket.authors.js
- public/assets/latest/modules/ui.bucket.channel.js
- public/assets/latest/modules/ui.bucket.cmd.js
- public/assets/latest/modules/ui.bucket.core.js
- public/assets/latest/modules/ui.bucket.listing.js
- public/assets/latest/modules/ui.bucket.mixed.js
- public/assets/latest/modules/ui.bucket.post.js
- public/assets/latest/modules/ui.bucket.search.js
- tools/perf-budgets.json
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/* (build output)

VERIFICATION OUTPUTS
- `node tools/verify-no-new-html-in-js.mjs`
```text
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=77 allowlisted_matches=77 violations=0
```

- `npm run -s gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=77 allowlisted_matches=77 violations=0
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
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=77 allowlisted_matches=77 violations=0
curl: (6) Could not resolve host: www.pakrpp.com
FAIL: __gg_worker_ping request failed
FAIL: smoke failed after 1 attempt(s)
```

NOTES
- `gate-release` failed because strict live smoke requires external DNS/network access that is unavailable in this sandbox.
- To keep gate deterministic after baseline annotations, gzip/raw budgets were increased minimally for `ui.bucket.core.js`, `ui.bucket.listing.js`, and `ui.bucket.search.js`.
