# TASK-002N — Reduce/Split legacy-app Bridge

## Status
Planned.

## Intent
Start reducing `src/modules/legacy-app/legacy-app.js` safely after the public DOM template-first cleanup.

This task creates the bridge-reduction foundation: inventory, policy, guard, and extraction seams. It does not delete the bridge.

## Principles

- Template-first for visible public UI.
- Humans should be able to edit visible UI in HTML/XML/templates, not hunt through JS.
- AI agents should have explicit module boundaries.
- `legacy-app` is a temporary bridge and should shrink over time.
- `legacy-donor/` is reference-only and must not be bundled/imported into runtime.

## Scope

- Create `docs/legacy-app-bridge-inventory.md`.
- Create `config/legacy-app-bridge-policy.json`.
- Create `checks/legacy-bridge.check.mjs`.
- Add `npm run check:legacy-bridge`.
- Create `src/modules/legacy-app/README.md` and bridge map/seam.
- Create `scripts/task002n-acceptance.sh`.

## Out of Scope

- Full rewrite of comments, saved listing, related posts, or popular controls.
- Removing `legacy-app`.
- Removing `legacy-donor`.
- Store folder restructure.
- OAuth/Blogger API.
- New dependencies.
- Generated output edits.

## Acceptance

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-acceptance.sh
```
