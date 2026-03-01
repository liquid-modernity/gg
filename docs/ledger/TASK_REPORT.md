TASK_REPORT
Last updated: 2026-03-01

TASK_ID: TASK-P1-HYGIENE-HARDENING
PARENT: TASK-P0-TAXONOMY-NORMALIZATION
TITLE: Template hygiene hardening (no stray style, no inline executable JS in prod, mixed config hard gate)

SYMPTOM
- Template still had a `<style>` block inside `tooltipCss` includable (outside `<b:skin>`), violating hygiene target.
- No dedicated verifier existed to enforce template hygiene rules (self-closing script, CDATA script, style outside skin, mixed config container/gate).
- `gg-mixed-config` gate used homepage-only condition but was not explicitly hardened against `/blog` alias leakage in SSR.

ROOT CAUSE
- Legacy Blogger tooltip includable still emitted inline `<style>`.
- Existing checks were split and did not provide one strict policy gate for template hygiene.
- Mixed config gate had no explicit `/blog` exclusion in condition.

PATCH
- `index.prod.xml`, `index.dev.xml`
  - Hardened `gg-mixed-config` gate:
    - from `data:view.isHomepage`
    - to `data:view.isHomepage and (not data:view.url or not (data:view.url contains "/blog"))`
  - Removed inline `<style>` from `tooltipCss` includable.
- `public/assets/latest/main.css`
  - Moved tooltip rules from template inline style into versioned external CSS asset.
- `tools/verify-template-hygiene.mjs` (new)
  - Fails on:
    - `<script .../>`
    - `<style>` outside `<b:skin>`
    - inline executable CDATA script in `index.prod.xml`
    - `gg-mixed-config` rendered as `<script>` instead of `<template>`
    - missing homepage gate and missing `/blog` exclusion for `gg-mixed-config`
  - Keeps strict allowlist for native Blogger comment bootstrap call `BLOG_CMT_createIframe(...)` (protected zone).
- `package.json`
  - Added scripts:
    - `verify:template-contract`
    - `verify:template-hygiene`
    - `verify-inline-css`
- `tools/gate-prod.sh`
  - Added `node tools/verify-template-hygiene.mjs` to mandatory gate sequence.

PROOF
- `npm run verify:template-contract` → PASS
- `npm run verify:template-fingerprint` → PASS
- `npm run verify-inline-css` → PASS (`style=0`, budget within limit)
- `npm run verify:template-hygiene` → PASS
- `SMOKE_EXPECT=live tools/smoke.sh` → PASS
- Route smoke headers:
  - `/`, `/blog`, post, `/p/privacy-policy.html`, `/p/tags.html`, `/p/authors.html` all `HTTP 200` + `x-robots-tag: index, follow`

NOTES
- No router semantics changed (`data-gg-page` / `data-gg-surface` retained).
- Prod template remains free of inline executable diagnostic script; JSON-LD script blocks are preserved as non-executable structured-data payload.
