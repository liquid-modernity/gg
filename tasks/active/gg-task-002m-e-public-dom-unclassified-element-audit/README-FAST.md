# TASK-002M-E — Public DOM Unclassified Element Audit

Purpose: finish the public DOM audit pass by classifying all current `document.createElement(...)` calls that are still reported as `unclassified`, across `src/**/*.js` and `src/**/*.mjs`.

This is an **audit + guardrail** task, not a UI migration task.

## Use

```bash
unzip gg-task-002m-e-public-dom-unclassified-element-audit.zip
cp -R gg-task-002m-e-public-dom-unclassified-element-audit/* /path/to/gg/
cd /path/to/gg
chmod +x scripts/task002m-e-acceptance.sh
```

Paste `CLINE-PASTE-ME.txt` into Cline.

## Final validation

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002m-e-acceptance.sh
```

## Expected outcome

`npm run check:public-dom` should still pass and should report:

```txt
unclassified=0
```

If any element is clearly a real UI/chrome structure that should become a template, do **not** migrate it in this task. Classify it as `needsTemplate` with a clear follow-up recommendation.
