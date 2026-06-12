# TASK-002D — Console Config API MVP

## Goal

Expose a read/write Config API on the local Console server (`apps/console/server.mjs`) so Studio and other tools can query and update whitelisted configuration files through the Console control plane.

## Endpoints Added

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/config-list` | List whitelisted config keys with their filesystem paths |
| GET | `/api/config/:key` | Read a single config entry by whitelisted key |
| PUT | `/api/config/:key` | Write (validate + persist) a config entry (local mode only) |

## Config Whitelist

Defined in `apps/_shared/config-registry.mjs`:

- `blogger-targets` → `config/blogger.targets.json`
- `cache-policy` → `config/cache-policy.json`
- `softcode-inventory` → `config/softcode.inventory.json`
- `surfaces` → `registry/surfaces.json`
- `theme-tokens` → `registry/theme-tokens.json`
- `navigation` → `registry/navigation.json`
- `seo` → `registry/seo.json`

## Acceptance Commands

```bash
npm run doctor
npm run build
npm run check
npm run check:softcode
npm run console:check
npm run studio:check
npm run deploy:dry
bash scripts/task002d-acceptance.sh
bash scripts/task002d-patch-acceptance.sh
```

## Scope Boundary

This task does **not** include:
- Blogger OAuth
- Full Console UI
- Full Studio editor
- Legacy JS bridge split
- Tailwind / shadcn / Tiptap / React