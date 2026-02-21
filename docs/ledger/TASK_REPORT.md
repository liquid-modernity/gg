TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-PHASE8-SHORTCODES-STRATEGY-20260221
TITLE: Shortcodes V2 DOM transformer + XML templates (no innerHTML) + tighten ratchet

SUMMARY
- Replaced shortcode engines that used `innerHTML` writes with one unified DOM transformer: `GG.modules.ShortcodesV2`.
- Removed legacy shortcode writes tied to `LEGACY-0032` and `LEGACY-0036` in `ui.bucket.core.js`.
- Added XML template hooks for shortcode rendering in both templates:
  - `#gg-tpl-sc-yt-lite`
  - `#gg-tpl-sc-accordion`
- Implemented DOM-only shortcode handling for:
  - `[youtube]...[/youtube]`
  - `[youtube id="..."]`
  - standalone accordion markers `[accordion title="..."] ... [/accordion]`
- Added shortcode authoring contract document: `docs/content/SHORTCODES.md`.
- Added verifiers and gate wiring:
  - `tools/verify-shortcodes-no-innerhtml.mjs`
  - `tools/verify-shortcodes-templates.mjs`

ALLOWLIST COUNT
- Before: `7`
- After: `5`
- max_allow: `5`

IDS REMOVED
- LEGACY-0032
- LEGACY-0036

FILES CHANGED
- index.prod.xml
- index.dev.xml
- public/assets/latest/modules/ui.bucket.core.js
- docs/content/SHORTCODES.md
- tools/verify-shortcodes-no-innerhtml.mjs
- tools/verify-shortcodes-templates.mjs
- tools/gate-prod.sh
- docs/contracts/LEGACY_HTML_IN_JS_ALLOWLIST.json
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-shortcodes-no-innerhtml.mjs`
```text
PASS: shortcodes has no innerHTML writes
```

- `node tools/verify-shortcodes-templates.mjs`
```text
VERIFY_SHORTCODES_TEMPLATES: PASS
```

- `node tools/verify-legacy-allowlist-ratchet.mjs`
```text
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
PASS: core swap has no innerHTML
PASS: panels skeleton has no innerHTML
PASS: comments gate has no innerHTML
PASS: shortcodes has no innerHTML writes
VERIFY_SHORTCODES_TEMPLATES: PASS
VERIFY_NO_NEW_HTML_IN_JS: PASS total_matches=5 allowlisted_matches=5 violations=0
VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS
VERIFY_BUDGETS: PASS
PASS: palette a11y contract (mode=repo, release=af5bc9d)
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

MANUAL SANITY
- Pending manual browser check:
  - `[youtube]...[/youtube]` and `[youtube id="..."]` render to lite embed.
  - Accordion open/close markers preserve inner body DOM and toggle `aria-expanded`.
  - Invalid shortcode formatting remains readable as plain text.
