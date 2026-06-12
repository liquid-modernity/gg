# GG vNext TASK-002B — Hardening Sniper Pack

Use this pack with Cline + DeepSeek V4 Pro in VS Code.

Goal: harden the Batch 1 + Batch 2A foundation before any large Console/Studio/legacy-JS work.

This is a narrow patch. Do not implement full Console UI, Studio editor, OAuth, Tiptap, Tailwind, shadcn, or legacy JS split.

## Install into repo

```bash
unzip gg-task-002b-hardening.zip
cp -R gg-task-002b-hardening/* /path/to/gg-vnext/
cd /path/to/gg-vnext
chmod +x scripts/task002b-acceptance.sh
```

## Paste into Cline

Open `CLINE-PASTE-ME.txt` and paste it into Cline.

## Final acceptance

```bash
npm run doctor && npm run build && npm run check && npm run console:check && npm run studio:check && npm run deploy:dry
bash scripts/task002b-acceptance.sh
```
