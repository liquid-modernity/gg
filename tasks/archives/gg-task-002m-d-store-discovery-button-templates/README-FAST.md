# TASK-002M-D — Store Discovery Button Templates

Sniper task for Cline/DeepSeek.

Goal: migrate remaining Store discovery `document.createElement('button')` chrome generation in `src/modules/store/store-discovery.js` into purpose-specific `<template>` elements in `apps/store/store.html`.

This task is **not** Blog, not Store folder restructuring, not OAuth, not legacy split, and not a broad refactor.

## Use

```bash
unzip gg-task-002m-d-store-discovery-button-templates.zip
cp -R gg-task-002m-d-store-discovery-button-templates/* /path/to/gg/
cd /path/to/gg
chmod +x scripts/task002m-d-acceptance.sh
```

Paste `CLINE-PASTE-ME.txt` into Cline.

## Final command

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002m-d-acceptance.sh
```

## Hard rule

Do **not** create one universal button template for Store buttons.

Correct rule:

```txt
1 template = 1 UI family / 1 semantic purpose
not 1 template = all buttons
not always 1 template = every occurrence
```

Expected purpose-specific Store templates:

```txt
store-semantic-category-chip-template
store-semantic-more-button-template
```

Use exact current repo findings. If the current store-discovery code has a different button family, add another purpose-specific template instead of forcing a generic template.
