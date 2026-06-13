# TASK-002M — Move Remaining Legacy UI Generation to HTML/template

Purpose: continue after TASK-002L. Move remaining public chrome UI generation away from JS string/innerHTML and into HTML/XML `<template>` or static fallback markup, without doing a broad legacy split.

Use this with Cline/DeepSeek in sniper mode.

## How to run

```bash
cp -R gg-task-002m-move-legacy-ui-generation-to-template/* /path/to/gg/
cd /path/to/gg
chmod +x scripts/task002m-acceptance.sh
```

Paste `CLINE-PASTE-ME.txt` into Cline.

## Final command

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002m-acceptance.sh
```

## Non-goals

- No Blogger OAuth.
- No Tailwind/shadcn/Tiptap.
- No full legacy JS split.
- No store folder restructure.
- No generated `dist/**` or `.cloudflare-build/**` edits.
- Do not remove parsing helpers unless replacement is tiny and safe.
