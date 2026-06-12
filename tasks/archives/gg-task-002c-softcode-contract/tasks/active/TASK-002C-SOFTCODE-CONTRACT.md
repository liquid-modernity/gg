# TASK-002C — Softcode Inventory + Config Surface Contract

## Goal
Create the softcode contract layer for future Console-managed HTML/CSS/JS configuration.

This task maps what should become softcoded over time. It must not refactor public app UI, install frameworks, or split legacy JS.

## Required files
- `config/softcode.inventory.json`
- `registry/surfaces.json`
- `registry/theme-tokens.json`
- `registry/navigation.json`
- `registry/seo.json`
- `checks/softcode.check.mjs`
- `package.json` script `check:softcode`

## Acceptance

```bash
npm run doctor && npm run build && npm run check && npm run console:check && npm run studio:check && npm run deploy:dry && npm run check:softcode && bash scripts/task002c-acceptance.sh
```

## Do not implement
- Full Console UI
- Full Studio UI
- Tailwind/shadcn/Tiptap
- Blogger OAuth
- Legacy JS split
- CSS/HTML rewrite
- Editing `dist/**` or `.cloudflare-build/**`
