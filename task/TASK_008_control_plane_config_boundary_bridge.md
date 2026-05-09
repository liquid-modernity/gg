# TASK 008 — Control Plane config boundary bridge

## Context

A full Control Plane/dashboard will be developed separately. This task is **not** the dashboard UI implementation.

This task creates the config boundary that future dashboard work can safely use.

The dashboard must become a cockpit, not the engine. The engine remains:

```text
repo + validated config + build scripts + QA gates + GitHub Actions + Cloudflare Worker
```

## Goal

Create an admin-safe configuration boundary:

```text
- config/*.json as source of truth for editable settings
- schema/*.schema.json validation
- derived generated config manifest
- dangerous settings exposed as presets only
- no raw route/cache/CSP/SW logic editable by non-coder admins
```

## Files/folders to inspect

```text
config/
schema/
registry/
scripts/
templates/
worker.js
sw.js
GAGA_Control_Plane_v0_5 package as reference only
```

## Required changes

### 1. Add/normalize config folder

Target config files:

```text
config/site.config.json
config/routes.config.json
config/navigation.config.json
config/ui.config.json
config/icons.config.json
config/seo.config.json
config/pwa.config.json
config/store.config.json
config/performance.config.json
config/worker.config.json
config/features.config.json
config/microcopy.config.json
config/dashboard.config.json
```

Do not force all files if existing repo already has a better layout. But create the missing ones required by Phase 1:

```text
icons.config.json
performance.config.json
features.config.json if missing
```

### 2. Add schemas

Target schema files:

```text
schema/site.schema.json
schema/routes.schema.json
schema/navigation.schema.json
schema/ui.schema.json
schema/icons.schema.json
schema/seo.schema.json
schema/pwa.schema.json
schema/store.schema.json
schema/performance.schema.json
schema/worker.schema.json
schema/features.schema.json
schema/dashboard.schema.json
```

At minimum in this task:

```text
schema/icons.schema.json
schema/performance.schema.json
schema/features.schema.json
```

### 3. Classify settings by editability

Create documentation:

```text
docs/control-plane/config-boundary.md
```

Include table:

```text
Setting
File
Editable by admin?
Build-time or runtime?
Allowed values
Risk level
Validation rule
```

### 4. Preset-only dangerous settings

Forbidden for admin raw editing:

```text
raw CSP
raw Cache-Control
raw Worker route rewrites
raw service worker strategy
raw Blogger XML structural includes
raw script execution order
raw HTML sanitizer rules
OAuth tokens
GitHub tokens
Cloudflare tokens
Google refresh tokens
```

Expose presets instead:

```json
{
  "cachePolicy": "staging-performance-audit",
  "robotsPolicy": "development-lockdown",
  "securityPreset": "blogger-compatible-strict",
  "serviceWorkerPreset": "pwa-safe-development"
}
```

### 5. Performance config

Create example:

```json
{
  "mode": "development",
  "audit": {
    "performanceAudit": false,
    "cacheStaticSurfacesInAudit": ["landing", "store"],
    "preserveNoindexInAudit": true
  },
  "thresholds": {
    "phase1MobilePerformance": 75,
    "phase1Accessibility": 95,
    "productionMobilePerformance": 85,
    "productionDesktopPerformance": 95
  },
  "images": {
    "allowPlaceholderImagesInDevelopment": true,
    "blockPlaceholderImagesInAudit": true,
    "blockPlaceholderImagesInProduction": true
  },
  "icons": {
    "requireMaterialSymbolsIconNames": true
  }
}
```

### 6. Derived config manifest

Add build output:

```text
generated/config-manifest.json
```

It should include:

```json
{
  "generatedAt": "...",
  "mode": "development",
  "configHash": "...",
  "schemas": {
    "icons": "...",
    "performance": "..."
  },
  "presets": {
    "cachePolicy": "development-safe",
    "robotsPolicy": "development-lockdown"
  }
}
```

Do not include secrets.

### 7. Dashboard future boundary

Document that future dashboard phases may:

```text
- read config
- validate config
- preview generated output
- export index.xml for manual Blogger upload
- prepare Blogger post/page drafts through API
- create PR/patch for GitHub Action deploy
```

Future dashboard must not:

```text
- store Cloudflare/GitHub/Google secrets in browser
- directly edit production Worker code
- bypass schema validation
- bypass Lighthouse/template proof gates
- expose raw CSP/cache-control strings to normal admins
```

## Non-goals

- Do not build full dashboard UI.
- Do not implement Blogger API client.
- Do not implement GitHub PR creation yet.
- Do not implement Cloudflare deploy UI.
- Do not move production secrets into frontend.
- Do not rewrite all config architecture if existing one already works.

## Acceptance criteria

```text
- icons/performance/features config files exist or are normalized.
- schemas validate key config files.
- dangerous settings are preset-based, not raw admin-editable strings.
- generated config manifest exists and contains no secrets.
- docs/control-plane/config-boundary.md explains admin-safe boundary.
- Existing build still works.
- Phase 1 performance tasks can use the config boundary.
```

## Suggested commit

```text
chore(config): define control plane configuration boundary
```
