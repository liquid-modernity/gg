# TASK-002B — Console/Studio Blogger Config Hardening

## Status
Ready for Cline / DeepSeek V4 Pro.

## Goal
Harden the already-green Batch 1 + Batch 2A implementation before larger softcode, Console, Studio, or legacy JS tasks.

## Scope

Implement only:

1. Zip/macOS hygiene via `.gitignore`.
2. Console local-file adapter path traversal hardening.
3. Dedicated Console Blogger targets API.
4. Blogger targets validation strengthening if needed.
5. Small `config/softcode.inventory.json` contract to track future HTML/CSS/JS softcoding.
6. Acceptance script green.

## Non-goals

Do not implement:

- Full Console UI.
- Full Studio editor.
- Tailwind/shadcn/Tiptap.
- Blogger OAuth.
- Blogger publish/sync.
- Legacy JS split.
- Full softcode migration.
- Production remote adapter.

## Acceptance

```bash
npm run doctor && npm run build && npm run check && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002b-acceptance.sh
```

## Notes

Softcoding HTML/CSS/JS will naturally add or update registry/config files over time. This task should not migrate everything; it should make future migrations safer and easier.
