# TASK-002D — Console Config API MVP

## Goal

Create a safe Console API for reading/writing softcode config contracts produced in TASK-002C.

## Scope

Implement whitelist-based endpoints:

```txt
GET  /api/config-list
GET  /api/config/:key
PUT  /api/config/:key
```

Required keys:

```txt
blogger-targets     -> config/blogger.targets.json
cache-policy        -> config/cache-policy.json
softcode-inventory  -> config/softcode.inventory.json
surfaces            -> registry/surfaces.json
theme-tokens        -> registry/theme-tokens.json
navigation          -> registry/navigation.json
seo                 -> registry/seo.json
```

## Rules

- Do not accept arbitrary file paths from users.
- Reject invalid keys.
- Reject traversal attempts.
- Validate JSON before saving.
- Validate contracts before saving when possible.
- Local mode may write.
- Production mode must reject writes unless remote adapter exists.
- Do not add UI/framework/OAuth.

## Acceptance

```bash
npm run doctor
npm run build
npm run check
npm run check:softcode
npm run console:check
npm run studio:check
npm run deploy:dry
bash scripts/task002d-acceptance.sh
```

## Done means

- Config API endpoints work.
- Existing Blogger target endpoint still works.
- Invalid writes do not corrupt files.
- Production-mode writes are refused.
- All checks remain green.
