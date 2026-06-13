# TASK-002L-B — Public DOM Audit CreateElement Pass (SRC Scope)

Purpose: extend the existing Public DOM/HTML Generation Audit so it also inventories `document.createElement(...)` usage across **all `src/**`**, not only `legacy-app`.

This is an audit + guardrail task, not a migration task.

## Run

Paste `CLINE-PASTE-ME.txt` into Cline.

Final acceptance:

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002l-b-acceptance.sh
```

## Non-goals

- Do not migrate UI to templates yet.
- Do not remove createElement globally.
- Do not delete textContent/createElement behavior patterns.
- Do not split legacy bridge.
- Do not implement OAuth.
- Do not install dependencies.
- Do not edit `dist/**` or `.cloudflare-build/**`.
