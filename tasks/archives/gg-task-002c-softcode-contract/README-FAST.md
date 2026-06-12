# GG vNext TASK-002C — Softcode Inventory + Config Surface Contract

Use this pack with Cline / DeepSeek V4 Pro in sniper mode.

Goal: create the next softcode contract layer so future Console work can edit HTML/CSS/JS-related settings safely, without broad UI/framework work.

Copy `CLINE-PASTE-ME.txt` into Cline.

Acceptance:

```bash
npm run doctor && npm run build && npm run check && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002c-acceptance.sh
```

Do not implement Tailwind, shadcn/ui, Tiptap, Blogger OAuth, full Console UI, full Studio UI, or legacy JS split in this task.
