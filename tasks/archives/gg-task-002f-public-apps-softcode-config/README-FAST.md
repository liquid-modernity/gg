# GG vNext TASK-002F — Public Apps Consume Softcode Config

Purpose: make Blog / Store / Landing consume the softcode contracts produced by Console without doing a broad UI rewrite.

Use with Cline / DeepSeek V4 Pro in sniper mode.

## Install into repo

```bash
cp -R gg-task-002f-public-apps-softcode-config/* /path/to/gg-vnext/
cd /path/to/gg-vnext
chmod +x scripts/task002f-acceptance.sh
```

Then paste `CLINE-PASTE-ME.txt` into Cline.

## Final acceptance

```bash
npm run doctor \
  && npm run build \
  && npm run check \
  && npm run check:softcode \
  && npm run console:check \
  && npm run studio:check \
  && npm run deploy:dry \
  && bash scripts/task002f-acceptance.sh
```

## Scope boundaries

Allowed: runtime config build/expose, small public-app softcode loader, fallback-safe HTML/JS wiring, tests/checks.

Not allowed: OAuth, Blogger publish, Tiptap, Tailwind, shadcn, legacy JS split, full UI redesign, editing dist/minified output as source.
