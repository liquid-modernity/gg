# CLINE SNIPER PROMPT — GG vNext TASK-002D Console Config API MVP

You are editing the GG vNext repo. Work fast, precise, and minimally.

## Objective

Implement Console Config API MVP so `console.pakrpp.com` / local Console can safely read and write softcode configuration files created in TASK-002C.

This is NOT a UI task. This is API + validation + acceptance only.

## Required API contract

Add or complete these endpoints in `apps/console/server.mjs` or a small helper under `apps/console/**`:

```txt
GET  /api/config-list
GET  /api/config/:key
PUT  /api/config/:key
```

Keep existing `/api/blogger-targets` from TASK-002B working.

## Config key whitelist

Only these keys are allowed:

```txt
blogger-targets     -> config/blogger.targets.json
cache-policy        -> config/cache-policy.json
softcode-inventory  -> config/softcode.inventory.json
surfaces            -> registry/surfaces.json
theme-tokens        -> registry/theme-tokens.json
navigation          -> registry/navigation.json
seo                 -> registry/seo.json
```

Reject every other key. Reject path traversal. Do not accept raw paths from clients for this API.

## Write behavior

Local mode:

```txt
CONSOLE_MODE=local
```

- `PUT /api/config/:key` may write to the mapped file.
- Validate JSON before saving.
- Validate known contracts before saving when validators exist.
- On invalid payload, return 400 and do not write.

Production mode:

```txt
CONSOLE_MODE=production
```

- `GET` may read if current architecture supports it.
- `PUT` must reject with 403 or 405 unless a remote adapter is explicitly implemented.
- Do NOT implement GitHub/KV/R2 adapter in this task.

## Validation expectations

Use existing helpers where available:

- `apps/_shared/blogger-targets.mjs` for blogger targets.
- `checks/softcode.check.mjs` contract as source of expected softcode files.

If needed, create a small shared helper such as:

```txt
apps/_shared/config-registry.mjs
```

It may export:

```txt
CONFIG_REGISTRY
listConfigKeys()
getConfigEntry(key)
readConfigByKey(key)
validateConfigByKey(key, json)
writeConfigByKey(key, json, { mode })
```

Keep it small.

## Must preserve

```bash
npm run doctor
npm run build
npm run check
npm run check:softcode
npm run console:check
npm run studio:check
npm run deploy:dry
```

## Acceptance script

Make sure this also passes:

```bash
bash scripts/task002d-acceptance.sh
```

The script will start local Console and test:

- `GET /api/config-list`
- `GET /api/config/surfaces`
- `GET /api/config/theme-tokens`
- `GET /api/config/blogger-targets`
- invalid key rejection
- traversal rejection
- malformed JSON rejection
- local PUT same-value smoke test
- production-mode PUT refusal

## Allowed files

Prefer editing only:

```txt
apps/console/server.mjs
apps/console/**
apps/_shared/**
checks/**
package.json only if a script is truly needed
scripts/task002d-acceptance.sh
```

You may read:

```txt
config/*.json
registry/*.json
```

## Do not touch

```txt
dist/**
.cloudflare-build/**
legacy-donor/**
src/modules/legacy-app/**
*.bundle.js
*.bundle.css
*.min.js
*.min.css
```

## Do not implement

- Full Console UI
- Tailwind/shadcn/Tiptap/React
- Blogger OAuth
- Blogger publish/sync
- Cloudflare remote adapter
- Legacy JS split

## Final response format

Return a short sniper report:

```md
## 🔫 GG vNext TASK-002D — CONSOLE CONFIG API MVP REPORT

Status: ✅ ALL GREEN / ⚠️ PARTIAL / ❌ BLOCKED

### Commands
...

### Files Changed
...

### Implemented
...

### Intentionally Not Implemented
...

### Next Recommended Task
...
```
