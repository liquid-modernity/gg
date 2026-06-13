# TASK-002L-B — Public DOM Audit CreateElement Pass (SRC Scope)

## Goal

Extend the Public DOM/HTML Generation Audit to detect and classify `document.createElement()` usage across **all `src/**`**, not only `src/modules/legacy-app/**`.

This is an audit + policy + guardrail pass. No UI migration performed.

## Scope

Modified files:

- `config/public-dom-generation-policy.json` — added `createElementAudit` section
- `docs/public-dom-generation-audit.md` — added `CreateElement SRC Audit` section
- `checks/public-dom.check.mjs` — added createElement scanning and classification
- `scripts/task002l-b-acceptance.sh` — created
- `tasks/active/TASK-002L-B-PUBLIC-DOM-CREATEELEMENT-SRC-AUDIT.md` — this file

## Classification Summary

| Classification | Count | Tags |
|----------------|-------|------|
| `allowedSmall` | 12 | span |
| `needsTemplate` | 15 | button (10), section (3), article (1), button in store-discovery (1) |
| `unclassified` | 23 | div, strong, textarea, img, p, h2, a, iframe, script |
| **Total** | **50** | |

## needsTemplate Candidates (Migration Priority)

| File | Tag | Count | Context |
|------|-----|-------|---------|
| `src/modules/legacy-app/legacy-app.js` | `button` | 8 | Sheet handles, reply buttons, more/like/copy/delete buttons |
| `src/modules/legacy-app/legacy-app.js` | `section` | 3 | Listing cards, saved/unavailable empty states, discovery sections |
| `src/modules/legacy-app/legacy-app.js` | `article` | 1 | Listing fallback card |
| `src/modules/store/store-discovery.js` | `button` | 2 | Store discovery result buttons + cart icon toggle |

## Non-Goals

- No UI template migration performed
- No `createElement`/`textContent` usages deleted
- No checks disabled
- No dependencies installed
- No generated output edited
- No OAuth implementation
- No legacy bridge splitting

## Acceptance Commands

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002l-b-acceptance.sh