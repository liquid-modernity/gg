# CLINE SNIPER PROMPT — TASK-002F Public Apps Consume Softcode Config

You are working inside GG vNext. Execute one narrow task only.

## Goal

Make public apps consume the softcode config contracts:

- Blog
- Store
- Landing

Public apps must read generated/runtime config safely and apply a small first layer of softcode, while preserving static fallback HTML.

## Current assumptions

The repo already has:

- `registry/surfaces.json`
- `registry/theme-tokens.json`
- `registry/navigation.json`
- `registry/seo.json`
- `registry/microcopy.id.json`
- `registry/microcopy.en.json`
- `config/softcode.inventory.json`
- `npm run check:softcode`
- Console config API and minimal Console Config Editor UI

## Required implementation

### 1. Runtime public config artifact

Create or update build logic so a public runtime config JSON is emitted into both dev and prod output.

Preferred output path:

```txt
dist/dev/runtime/public-config.json
dist/prod/runtime/public-config.json
.cloudflare-build/public/runtime/public-config.json
```

The JSON should include only safe public config:

```txt
surfaces
navigation
seo
themeTokens
microcopy
icons optional if already safe
```

Do NOT include:

```txt
api provider secrets
refresh tokens
client secret
Cloudflare token
session secret
admin password
raw env values
```

If the existing build shape prefers another public runtime path, keep it minimal but document it in code/task note and make acceptance script match.

### 2. Public softcode loader

Add a small vanilla JS module, for example:

```txt
src/modules/public-softcode/public-softcode.js
src/modules/public-softcode/public-softcode.css optional
```

The loader should:

- fetch `/runtime/public-config.json` or equivalent generated path
- fail silently with fallback preserved
- apply microcopy to elements with `data-copy="key"`
- apply navigation labels to elements with `data-nav-label="key"` if present
- apply SEO metadata only if safe and target surface can be detected
- apply theme tokens by setting CSS custom properties on `document.documentElement` if safe
- never blank the page if config load fails

### 3. Wire Blog / Store / Landing entries only

Wire the loader into:

```txt
src/entries/blog.entry.js
src/entries/store.entry.js
src/entries/landing.entry.js
```

Do not wire it into Console/Studio entries unless already shared safely.

### 4. Minimal fallback markers

Add very small fallback-safe markers to public app HTML/templates if needed:

```html
<span data-copy="...">Existing fallback text</span>
```

Do not rewrite the whole UI. Add only enough markers to prove the contract works.

### 5. Check / acceptance support

Create/update a lightweight check if needed, preferably:

```txt
checks/public-softcode.check.mjs
npm script: check:public-softcode
```

This should validate:

- runtime public config output exists after build
- public config does not include secret-looking keys/values
- Blog/Store/Landing entries reference public-softcode loader
- fallback markers exist on at least one public surface if HTML exists

If adding npm script, do not break existing scripts.

### 6. Task note

Create/update:

```txt
tasks/active/TASK-002F-PUBLIC-APPS-CONSUME-SOFTCODE-CONFIG.md
```

Include:

- files changed
- runtime config path
- what is softcoded now
- what is intentionally still fallback/hardcoded
- acceptance commands

## Allowed files

You may edit:

```txt
tools/build.mjs
src/modules/public-softcode/**
src/entries/blog.entry.js
src/entries/blog.entry.css
src/entries/store.entry.js
src/entries/store.entry.css
src/entries/landing.entry.js
src/entries/landing.entry.css
apps/blog/**
apps/store/**
apps/landing/**
checks/**
package.json
tasks/active/**
scripts/task002f-acceptance.sh
```

You may read registry/config files, but do not redesign their schema unless absolutely necessary.

## Forbidden

Do NOT:

- edit `dist/**` or `.cloudflare-build/**` as source fixes
- add Tailwind/shadcn/Tiptap/React
- implement OAuth
- implement Blogger publish/sync
- split legacy JS bridge
- hardcode secret values
- move `apps/_shared` during this task
- refactor all public HTML/CSS/JS
- change domain/canonical decisions unless a check is broken

## Final acceptance

Run exactly:

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002f-acceptance.sh
```

Return a short report:

- Status
- Commands
- Files changed
- What was implemented
- What was intentionally not implemented
- Next recommended task
