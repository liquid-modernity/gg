# TASK-002M-C — Blog Button Chrome Templates

Sniper task for Cline/DeepSeek.

Goal: migrate remaining Blog `document.createElement('button')` chrome generation in `src/modules/legacy-app/legacy-app.js` into purpose-specific `<template>` elements in `apps/blog/index.xml`.

This task is **not** Store discovery, not OAuth, not legacy split, and not a broad refactor.

## Use

```bash
unzip gg-task-002m-c-blog-button-chrome-templates.zip
cp -R gg-task-002m-c-blog-button-chrome-templates/* /path/to/gg/
cd /path/to/gg
chmod +x scripts/task002m-c-acceptance.sh
```

Paste `CLINE-PASTE-ME.txt` into Cline.

## Final command

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002m-c-acceptance.sh
```

## Hard rule

Do **not** create one universal button template for all buttons.

Correct rule:

```txt
1 template = 1 UI family / 1 semantic purpose
not 1 template = all buttons
not always 1 template = every occurrence
```

Purpose-specific examples:

```txt
gg-template-comments-sheet-handle
gg-template-comment-reply-button
gg-template-comment-more-button
gg-template-comment-like-button
gg-template-comment-copy-link-button
gg-template-comment-delete-button
```

