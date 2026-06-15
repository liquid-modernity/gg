# TASK-002N-G — Legacy Bridge Budget Tightening

Purpose: close the 002N bridge-splitting phase by tightening the legacy bridge guard so future feature work cannot silently grow `src/modules/legacy-app/legacy-app.js` or reintroduce hidden public DOM generation.

This is a **guard/baseline task**, not a feature task and not a major refactor.

## Copy into repo

```bash
unzip gg-task-002n-g-legacy-bridge-budget-tightening.zip
cp -R gg-task-002n-g-legacy-bridge-budget-tightening/* /path/to/gg/
cd /path/to/gg
chmod +x scripts/task002n-g-acceptance.sh
```

Then paste `CLINE-PASTE-ME.txt` to Cline.

## Expected final command

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-g-acceptance.sh
```

## Non-goals

- Do not add feature work.
- Do not split a new runtime bridge.
- Do not rewrite comments/saved/popular/offline orchestration.
- Do not delete `legacy-app` or `legacy-donor`.
- Do not manually edit generated `dist/**` or `.cloudflare-build/**`.
- Do not loosen `public-dom` policy.
