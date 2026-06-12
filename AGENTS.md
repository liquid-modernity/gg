# AGENTS.md — GG vNext handoff contract

You are working in a unified dev + product repo. The repo must stay deployable after every task.

## Non-negotiable source boundary

Allowed source edits:

```txt
src/modules/**
apps/**
registry/**
config/**
public/**
tools/**
checks/**
tasks/**
ai/agent/skills/**
```

Forbidden as source edits:

```txt
dist/**
.cloudflare-build/**
*.bundle.js
*.bundle.css
*.min.js
*.min.css
```

If an output is wrong, fix the source and rebuild.

## Vocabulary

Use **module**, not component, as the main source unit.

A module may include:

```txt
CSS
JS
UI component behavior
controller logic
service logic
registry contract
microcopy keys
```

A component is only the visual/UI part inside a module.

## Console and Studio

- `apps/console` is the control plane for registry, microcopy, icon, route, API provider, Blogger target, and secret availability configuration.
- `apps/studio` is the editor/publishing workspace. It reads Blogger target config from Console-owned files.
- Do not hardcode Blogger Blog ID, Store Blog ID, API key, or secret in Studio JS/HTML.
- Console may write env key names. It must not expose secret values.

## Local vs hosted Console

One Console codebase supports two modes:

```txt
CONSOLE_MODE=local       -> writes local files
CONSOLE_MODE=production  -> remote adapter placeholder / GitHub / Cloudflare storage integration
```

Local adapter may write `registry/*.json`, `config/*.json`, and `public/icons/*`.
Hosted adapter must use GitHub/Cloudflare backends and must never assume local filesystem writes.

## Required validation after code changes

Run:

```bash
npm run doctor
npm run build
npm run check
npm run console:check
npm run studio:check
```

For deploy wiring changes also run:

```bash
npm run deploy:dry
```

## Current migration status

The legacy CSS modules have been moved into `src/modules/<module>/<module>.css`.
The legacy app JS is preserved as a temporary `legacy-app` bridge because the old fragments are not standalone syntax-valid.
Split the bridge gradually; do not delete it until equivalent module JS passes checks and runtime smoke.
