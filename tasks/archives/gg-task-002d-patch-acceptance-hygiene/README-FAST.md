# GG vNext TASK-002D-PATCH — Acceptance + Repo Hygiene Fix

Use this as a **sniper patch pack** for Cline / DeepSeek V4 Pro.

Goal: accept TASK-002D properly by fixing the false-negative acceptance script and cleaning repo hygiene issues.

Do **not** add features, OAuth, UI frameworks, Console UI, Studio editor, or legacy JS split.

## Install into repo

```bash
unzip gg-task-002d-patch-acceptance-hygiene.zip
cp -R gg-task-002d-patch-acceptance-hygiene/* /path/to/gg-vnext/
cd /path/to/gg-vnext
chmod +x scripts/task002d-patch-acceptance.sh
```

Then paste `CLINE-PASTE-ME.txt` into Cline.

## Final acceptance

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002d-acceptance.sh && bash scripts/task002d-patch-acceptance.sh
```
