# TASK-002D — Console Config API MVP

## Status

Implemented, pending acceptance + repo hygiene patch.

## Goal

Create a whitelist-based Console config API so Console can read/write approved config and registry files without path traversal or broad filesystem access.

## Required endpoints

```txt
GET  /api/config-list
GET  /api/config/:key
PUT  /api/config/:key
```

## Required whitelist keys

```txt
blogger-targets      -> config/blogger.targets.json
cache-policy         -> config/cache-policy.json
softcode-inventory   -> config/softcode.inventory.json
surfaces             -> registry/surfaces.json
theme-tokens         -> registry/theme-tokens.json
navigation           -> registry/navigation.json
seo                  -> registry/seo.json
```

## Acceptance commands

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

## Explicitly out of scope

- Blogger OAuth
- real publish/sync
- full Console UI
- full Studio editor
- Tailwind/shadcn/Tiptap/React install
- legacy JS bridge split
- editing generated output
