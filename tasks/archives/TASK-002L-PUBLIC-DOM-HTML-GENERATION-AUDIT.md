# TASK-002L — Public DOM/HTML Generation Audit

## Status
COMPLETE (pending full validation)

## Scope
Create an auditable public DOM/HTML generation policy and automated check.

Rule: **largePublicUiMustLiveInHtmlOrTemplate** — blog/store/landing public chrome must live in HTML/XML or `<template>`. JS may still manage small state/behavior via `createElement`, `textContent`, `setAttribute`, `appendChild`, `classList`, `dataset`.

## Files Changed/Created

1. **`config/public-dom-generation-policy.json`** — Policy definition with:
   - `largePublicUiMustLiveInHtmlOrTemplate` phrase
   - Allowed small-behavior APIs: `createElement`, `textContent`, `setAttribute`, `appendChild`, `classList`, `dataset`
   - Restricted APIs: `innerHTML`, `insertAdjacentHTML`, `outerHTML`
   - Allowlist entries for all existing restricted API usage (5 entries)

2. **`docs/public-dom-generation-audit.md`** — Human-friendly policy summary with:
   - Rule section
   - Allowed small behavior
   - Restricted patterns
   - Current findings (5 restricted, 5 allowlisted, 0 large-UI-in-JS findings)
   - Recommended next migration task (TASK-002M)

3. **`checks/public-dom.check.mjs`** — Automated check that:
   - Validates `config/public-dom-generation-policy.json` exists with required keys
   - Scans all public source files (`apps/blog/**/*.xml`, `apps/blog/**/*.html`, `apps/store/**/*.html`, `apps/landing/**/*.html`, `src/modules/**/*.js`, `src/entries/**/*.js`)
   - Detects restricted API occurrences (`innerHTML`, `insertAdjacentHTML`, `outerHTML`)
   - Requires every restricted occurrence to be covered by allowlist or fails
   - Detects large UI HTML strings in public JS (patterns like `<section`, `<article`, `<button`, `<template` with `gg-` class names)
   - Prints concise summary: `public-dom ok: restricted=5 allowlisted=5 findings=0`

4. **`package.json`** — Added `"check:public-dom": "node checks/public-dom.check.mjs"`

5. **`scripts/task002l-acceptance.sh`** — Full acceptance pipeline

## Allowlisted Cases

| File | Line | API | Reason |
|------|------|-----|--------|
| `src/modules/legacy-app/legacy-app.js` | 1787 | `innerHTML` | Legacy HTML strip helper (div innerHTML → textContent) |
| `src/modules/legacy-app/legacy-app.js` | 6289 | `innerHTML` | Legacy HTML parsing fallback for Blogger post body |
| `src/modules/legacy-app/legacy-app.js` | 7644 | `innerHTML` | Legacy outline preview text extraction (read-only) |
| `apps/landing/landing.html` | 3302 | `innerHTML` | Legacy HTML strip helper in landing inline script |
| `apps/landing/landing.html` | 3362 | `innerHTML` | Landing discovery command panel render (clear + template) |

All 5 are legacy bridge cases. None are large-UI-in-JS violations.

## Commands

```bash
# Individual check
npm run check:public-dom

# Full acceptance
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002l-acceptance.sh
```

## Non-Goals

- No broad migration of legacy code
- No rewriting Blog XML or Store HTML
- No deletion of `createElement`/`textContent` usage
- No moving store folders
- No OAuth implementation
- No new dependencies