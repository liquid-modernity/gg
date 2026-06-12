# CLINE SNIPER TASK — GG vNext TASK-002B Hardening

You are working in the existing GG vNext repo.

The repo has already passed Batch 1 and Batch 2A:
- `config/cache-policy.json` exists.
- `config/blogger.targets.json` is the single source of truth for `mainBlog` and `storeBlog`.
- `apps/_shared/blogger-targets.mjs` exists.
- Console and Studio can validate/read Blogger targets.

Your task is a small hardening patch only.

## Objective

Harden the repo before larger softcode/Console/Studio work:

1. Add zip/macos hygiene protection.
2. Harden Console local file adapter against path traversal.
3. Add dedicated Console Blogger targets API if missing.
4. Add/strengthen Blogger targets validation check if missing.
5. Add a tiny softcode inventory contract for remaining hardcoded HTML/CSS/JS, without migrating all hardcoded code yet.
6. Keep all existing npm commands green.

## Important reasoning

The product direction is:
- Human/AI edit source modules.
- Console edits registry/config/microcopy/icons/Blogger targets.
- HTML/CSS/JS will gradually become softcoded.
- More softcoding means more registry/config files will exist over time.
- But do not softcode everything in this task. Create a safe tracking contract only.

## Files allowed

You may edit/create only if needed:

- `.gitignore`
- `apps/console/**`
- `apps/studio/**` only if a small compatibility read is needed
- `apps/_shared/**`
- `config/blogger.targets.json`
- `config/secrets.schema.json`
- `config/softcode.inventory.json`
- `registry/api-providers.json`
- `checks/**`
- `tools/**`
- `package.json` only if absolutely required for an npm script, but prefer not to change it
- `scripts/task002b-acceptance.sh`

## Files forbidden

Do not edit:

- `dist/**`
- `.cloudflare-build/**`
- `*.bundle.js`
- `*.bundle.css`
- `*.min.js`
- `*.min.css`
- `legacy-donor/**`
- `src/modules/legacy-app/**`
- `node_modules/**`

## Required implementation details

### 1. Zip/macos hygiene

Ensure `.gitignore` exists and includes at least:

```gitignore
.DS_Store
__MACOSX/
._*
node_modules/
.env
.env.local
dist/
.cloudflare-build/
tmp/
```

If `.gitignore` exists, merge without deleting useful existing entries.

### 2. Harden local file adapter

Find the Console local file adapter, likely:

```txt
apps/console/adapters/local-file.adapter.mjs
```

If the adapter allows reading/writing JSON through a path, it must normalize/resolve the path before allowlist checking.

The adapter must reject traversal such as:

```txt
registry/../package.json
config/../../package.json
public/icons/../../config/blogger.targets.json
```

Allowed logical roots should remain narrow:

```txt
registry/
config/
public/icons/
```

Implementation rule:
- Normalize the request path.
- Convert backslash to slash for cross-platform safety.
- Reject absolute paths.
- Reject empty path.
- Reject paths containing `..` after normalization.
- Only allow paths whose normalized relative path starts with one of the allowed roots.
- For JSON read/write APIs, only allow `.json` unless the existing icon workflow clearly needs binary paths.

Do not break existing Console checks.

### 3. Dedicated Blogger targets API

In `apps/console/server.mjs`, add dedicated endpoints if missing:

```txt
GET /api/blogger-targets
PUT /api/blogger-targets
```

Minimum behavior:
- `GET` returns sanitized Blogger target config or report.
- `PUT` works only in local mode.
- `PUT` validates via `apps/_shared/blogger-targets.mjs` before writing.
- Do not expose secrets.
- Do not implement OAuth.

If the Console server is intentionally tiny and adding PUT is too invasive, at least add `GET /api/blogger-targets` and leave a clear TODO in code for local-mode PUT. Prefer implementing both if low-risk.

### 4. Blogger target validation check

If no dedicated check exists, add or extend a small check so this command catches broken Blogger targets:

```bash
npm run console:check
npm run studio:check
```

Do not add heavy guard names. Keep minimalist.

Validation should catch:
- missing `targets.mainBlog`
- missing `targets.storeBlog`
- invalid `sourceUrl`, `canonicalUrl`, optional `aliasUrl`
- invalid `contentType` outside `article`/`product`
- invalid `defaultStatus` outside `draft`/`publish`
- suspicious real secret values in fields that should be env names

### 5. Softcode inventory contract

Create `config/softcode.inventory.json` if missing.

This is only a tracking contract, not a full migration.

Suggested shape:

```json
{
  "version": 1,
  "purpose": "Track hardcoded HTML/CSS/JS surfaces that should become registry/config/microcopy driven over time.",
  "policy": {
    "fallbackHtmlRequired": true,
    "bundleIsNotSource": true,
    "consoleManagedChanges": ["microcopy", "icons", "routes", "bloggerTargets", "cachePolicy", "apiProviderReferences", "themeTokens", "storeMetadata"]
  },
  "items": [
    {
      "id": "microcopy-hardcoded-text",
      "surface": "blog-store-landing",
      "sourceArea": "html-js",
      "targetConfig": "registry/microcopy.id.json + registry/microcopy.en.json",
      "status": "planned"
    },
    {
      "id": "route-domain-hardcoded-values",
      "surface": "all",
      "sourceArea": "html-js-worker",
      "targetConfig": "registry/routes.json + config/domains.config.json",
      "status": "planned"
    },
    {
      "id": "theme-token-hardcoded-css",
      "surface": "blog-store-landing",
      "sourceArea": "css",
      "targetConfig": "registry/theme-tokens.json or src/modules/tokens contract",
      "status": "planned"
    }
  ]
}
```

Keep it small and valid JSON. Do not create a huge audit.

### 6. Acceptance script

Ensure `scripts/task002b-acceptance.sh` exists and runs a fast acceptance check. It should:

- Fail if `__MACOSX`, `.DS_Store`, or `._*` exist in the repo.
- Run final npm checks.
- Optionally smoke test `local-file.adapter.mjs` traversal rejection if simple to do.

## Required final commands

Run:

```bash
npm run doctor
npm run build
npm run check
npm run console:check
npm run studio:check
npm run deploy:dry
bash scripts/task002b-acceptance.sh
```

## Final report format

Return a short report:

```md
## 🔫 GG vNext TASK-002B — HARDENING REPORT

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
