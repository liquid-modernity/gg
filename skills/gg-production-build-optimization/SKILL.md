---
name: gg-production-build-optimization
description: Use for production dist, minification, compression, source maps, obfuscation policy, asset output, and deploy artifact optimization.
---

# GG Production Build Optimization Skill

Use this skill for production output and deploy artifact optimization.

## Prime Directive

Production output must be small, reproducible, CI-generated, and safe. Source must remain readable. Secrets must never be in frontend output.

## Source Vs Dist

Readable source lives in:

- `src/`;
- `templates/`;
- `public/`;
- `config/`;
- `registry/`;
- `content/`.

Generated production output lives in:

- `dist/`;
- `.cloudflare-build/`;
- release packages.

Do not edit generated production output as the primary fix.

## Minification Policy

Minify:

- JS bundles;
- CSS bundles;
- static HTML where safe;
- worker output where safe.

Be careful with Blogger XML. Do not minify in a way that breaks Blogger conditional tags, XML parsing, or Blogger data expressions.

## Compression Policy

Prefer compression at deploy/host layer when available.

If precompression is used, generate it from build scripts, not manual tools:

- `.br` when supported;
- `.gz` fallback when useful.

Document what the deploy target serves.

## Source Map Policy

Generate source maps for debugging when useful, but treat them as private by default.

Recommended:

- dev: source maps enabled;
- staging: source maps enabled but restricted;
- production public: source maps excluded;
- production private: maps stored as release artifact.

Do not deploy `dist/**/*.map` publicly unless the active release policy permits it.

## Obfuscation Policy

Obfuscation is optional and not a security boundary.

Use obfuscation only for selected runtime files when it does not harm performance, debugging, or buyer trust.

Never rely on obfuscation to hide secrets. Anything shipped to the browser must be considered public.

## Tooling Policy

Do not rely on editor extensions as official build pipeline.

Official pipeline must be scriptable:

```bash
npm run build
npm run doctor
npm run deploy
```

## Production Checks

Before packaging/deploy:

```bash
git diff --check
npm run doctor
npm run build
```

Current repo may use:

```bash
npm run ci:qa
npm run ci:cloudflare
```

## Handoff Format

Report:

- optimized outputs;
- minification strategy;
- compression strategy;
- source map handling;
- obfuscation decision;
- commands run;
- public files excluded intentionally.
