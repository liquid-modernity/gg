# GG vNext — Batch 2A Sniper Pack

Target: **TASK-002 — Console/Studio Blogger Config MVP**.

Use this with Cline + DeepSeek V4 Pro in sniper mode.

## Install into repo

```bash
unzip gg-batch-2a-console-studio-blogger-config-mvp.zip
cp -R gg-batch-2a-console-studio-blogger-config-mvp/* /path/to/gg-vnext/
cd /path/to/gg-vnext
chmod +x scripts/batch2a-acceptance.sh
```

## Paste to Cline

Paste the content of:

```txt
CLINE-PASTE-ME.txt
```

## Final acceptance

```bash
npm run doctor && npm run build && npm run check && npm run console:check && npm run studio:check && npm run deploy:dry
```

Or:

```bash
bash scripts/batch2a-acceptance.sh
```

## Scope

This task only wires Blogger target config between Console and Studio.

Do not implement full Console UI, Studio editor, Tailwind, shadcn, Tiptap, OAuth, or real publish.
