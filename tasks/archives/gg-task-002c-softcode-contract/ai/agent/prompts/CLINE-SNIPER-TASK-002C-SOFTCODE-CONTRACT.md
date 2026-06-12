# CLINE SNIPER — TASK-002C Softcode Inventory + Config Surface Contract

You are working in GG vNext on macOS Catalina via VS Code/Cline. Work fast and narrowly.

## Mission
Create the next softcode contract layer so future Console tasks can edit HTML/CSS/JS-related settings safely.

This task is NOT about replacing all hardcoded HTML/CSS/JS yet. It is about defining stable config/registry files and a check that verifies them.

## Current accepted state
- Batch 1 green.
- Batch 2A green.
- TASK-002B green.
- Blogger targets are configured via `config/blogger.targets.json` and shared helper.
- Console local-file adapter is hardened.

## Allowed files
Edit or create only these unless absolutely necessary:

```txt
config/softcode.inventory.json
registry/surfaces.json
registry/theme-tokens.json
registry/navigation.json
registry/seo.json
checks/softcode.check.mjs
package.json
scripts/task002c-acceptance.sh
tasks/active/TASK-002C-SOFTCODE-CONTRACT.md
```

You may read:

```txt
AGENTS.md
README.md
package.json
registry/*.json
config/*.json
apps/console/server.mjs
apps/studio/server.mjs
checks/*.mjs
src/entries/**
src/modules/**
```

## Forbidden
Do NOT edit:

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

Do NOT install or add:

```txt
Tailwind
shadcn/ui
Tiptap
React/Vue/Svelte
Blogger OAuth
Google API SDK
new bundler
```

Do NOT implement full Console UI or Studio UI.
Do NOT split legacy JS bridge in this task.
Do NOT move folders.

## Required implementation

### 1. Expand `config/softcode.inventory.json`
It must be valid JSON and contain at minimum:

```json
{
  "version": 1,
  "status": "planned",
  "purpose": "Track hardcoded HTML/CSS/JS areas that should become Console-managed softcode over time.",
  "categories": { }
}
```

The `categories` object must include at least these keys:

```txt
microcopy
routesDomains
themeTokens
navigation
seo
storeCategories
featureFlags
icons
bloggerTargets
cachePolicy
```

Each category should include:

```txt
status: planned | partial | active
owner: console | studio | build | runtime
sourceOfTruth: file path or array of file paths
surfaces: array of blog/store/landing/console/studio/shared
notes: string
```

Do not overfill it with huge prose. Keep it concise and useful.

### 2. Create `registry/surfaces.json`
It must describe the five surfaces:

```txt
blog
landing
store
console
studio
```

For each surface include:

```txt
id
label
kind: public | private
hosts
routes
entry
configRefs
cacheProfile
status
```

Rules:
- Blog hosts include `pakrpp.com` and `pakrpp.blogspot.com`.
- Landing route includes `/landing`.
- Store hosts include `store.pakrpp.com` and `pakrppstore.blogspot.com`; route includes `/store`.
- Console host is `console.pakrpp.com`, private, no-store.
- Studio host is `studio.pakrpp.com`, private, no-store.

### 3. Create `registry/theme-tokens.json`
This is only a contract, not a CSS rewrite.

Must include:

```txt
version
status
tokens.color
tokens.radius
tokens.spacing
tokens.typography
tokens.motion
tokens.shadow
```

Values may be simple strings. Keep it Gaga Design System oriented.
Do not edit CSS modules in this task.

### 4. Create `registry/navigation.json`
Must include nav config for:

```txt
publicPrimary
storePrimary
adminPrimary
```

Use microcopy keys for labels when possible, for example:

```txt
nav.home
nav.store
nav.console
nav.studio
```

Do not require UI changes in this task.

### 5. Create `registry/seo.json`
Must include SEO config for:

```txt
blog
landing
store
```

Include:

```txt
titleKey
descriptionKey
canonicalRef
robots
jsonLdEnabled
```

Do not implement JSON-LD generation in this task.

### 6. Create `checks/softcode.check.mjs`
The check must:

- Read JSON files safely.
- Validate that required files exist:
  - `config/softcode.inventory.json`
  - `registry/surfaces.json`
  - `registry/theme-tokens.json`
  - `registry/navigation.json`
  - `registry/seo.json`
- Validate required surface ids: blog, landing, store, console, studio.
- Validate required softcode categories.
- Validate private surfaces have `cacheProfile` containing `no-store` or equal to `private-no-store`.
- Validate public surfaces have at least one host and route.
- Exit non-zero on failure.
- Print a concise success line on pass, e.g. `softcode ok: surfaces=5 categories=10`.

### 7. Add npm script
Add this script to root `package.json` if missing:

```json
"check:softcode": "node checks/softcode.check.mjs"
```

Do NOT break existing scripts.

If root `check` can safely include `check:softcode`, add it. If risky, leave root `check` unchanged and rely on `task002c-acceptance.sh`.

### 8. Create/keep task note
Create or update:

```txt
tasks/active/TASK-002C-SOFTCODE-CONTRACT.md
```

Keep it short: goal, files changed, acceptance, not implemented.

## Acceptance commands
Run:

```bash
npm run doctor
npm run build
npm run check
npm run console:check
npm run studio:check
npm run deploy:dry
npm run check:softcode
bash scripts/task002c-acceptance.sh
```

Final response must be a short sniper report with:

```txt
Status
Commands
Files changed
Implemented
Intentionally not implemented
Next recommended task
```
