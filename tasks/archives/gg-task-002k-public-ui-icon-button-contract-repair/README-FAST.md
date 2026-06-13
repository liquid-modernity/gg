# GG vNext TASK-002K — Public UI Icon/Button Contract Repair

Purpose: repair public UI icon/button rendering after runtime assets started loading.

This is a sniper task for Cline/DeepSeek. Do not restart repo discovery. Do not implement OAuth, Studio editor, Store restructure, or legacy JS split.

## Install

```bash
unzip gg-task-002k-public-ui-icon-button-contract-repair.zip
cp -R gg-task-002k-public-ui-icon-button-contract-repair/* /path/to/gg/
cd /path/to/gg
chmod +x scripts/task002k-acceptance.sh
```

Paste `CLINE-PASTE-ME.txt` into Cline.

## Final acceptance

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002k-acceptance.sh
```
