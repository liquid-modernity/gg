# GG vNext TASK-002E — Console Config Editor Minimal UI

Sniper task pack for Cline + DeepSeek V4 Pro.

Goal: add a minimal local Console UI that can read/edit whitelisted config JSON through the existing Console Config API from TASK-002D.

This task must stay small:
- No Tailwind
- No shadcn/ui
- No Tiptap
- No React/Vite
- No Blogger OAuth
- No real publish/sync
- No legacy JS split
- No edits to dist/ or .cloudflare-build/

## Install into repo

```bash
unzip gg-task-002e-console-config-editor-ui.zip
cp -R gg-task-002e-console-config-editor-ui/* /path/to/gg-vnext/
cd /path/to/gg-vnext
chmod +x scripts/task002e-acceptance.sh
```

## Paste to Cline

Paste `CLINE-PASTE-ME.txt` into Cline.

## Acceptance

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002e-acceptance.sh
```
