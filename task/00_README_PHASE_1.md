# PakRPP Phase 1 — Performance Foundation Tasks

## Purpose

This package contains Codex-ready task files for Phase 1 performance repair of PakRPP/BLOG GAGA-ish.

The site may remain in development or staging mode during this phase. Do **not** switch the public site to production just to make Lighthouse look better.

Phase 1 goal:

```text
Make the architecture production-shaped while keeping development safety:
- robots locked down outside production
- cache policy audit-friendly for selected static surfaces
- frontend critical path lighter
- Blogger SSR preserved
- Cloudflare Worker remains route/cache authority
- future Control Plane prepared without implementing the full dashboard now
```

## Agreed task order

Run these tasks in order:

```text
TASK 000 — Performance audit mode
TASK 001 — Material Symbols subset registry
TASK 002 — Landing critical path diet
TASK 003 — Lazy native Blogger comments
TASK 004 — Store LCP and image discipline
TASK 005 — Route-aware app boot
TASK 006 — Real minify and versioned build
TASK 007 — Lighthouse regression gate
TASK 008 — Control Plane config boundary bridge
```

## Important boundary

`TASK 008` is only a **bridge** into Control Plane work. It should define config boundaries, schemas, presets, and generated manifests. It should **not** build the full dashboard frontend, OAuth flow, Blogger API client, or GitHub deployment UI.

Dashboard/control-plane frontend work belongs to the separate `GAGA_Control_Plane_v0_5.zip` package and later phases.

## Global non-negotiables

- Do not break Blogger SSR.
- Do not convert blog listing/post content into client-side rendering.
- Do not switch production mode unless explicitly instructed later.
- Do not remove development/staging `noindex,nofollow` protections.
- Do not move route governance into Cloudflare Dashboard rules as the primary source of truth.
- Keep Worker/repo as source of truth.
- Preserve canonical route truth:
  - `/landing` = Home/identity
  - `/` = Blog/listing
  - `/store` = Store
- Preserve accessibility.
- Do not expose raw CSP/cache-control/route logic to non-coder admin config.
- Material Symbols are allowed, but never as full unbounded font loads.

## Recommended branch naming

```bash
git checkout -b feat/perf-phase1-foundation
```

Or one branch per task:

```bash
feat/perf-audit-mode
feat/icon-subset-registry
feat/landing-critical-diet
feat/comments-lazy-native
feat/store-lcp-images
feat/route-aware-boot
feat/versioned-minify
feat/lighthouse-gate
feat/config-boundary
```

## Suggested local command baseline

Adjust these commands to the real repo scripts if names differ:

```bash
node --check worker.js
npm run gaga:preflight
npm run gaga:template:proof
npm run gaga:template:status
npm run gaga:verify-template
```

## Required evidence after each task

Each task should return:

1. Changed files.
2. Summary of exact behavior changes.
3. Local checks run.
4. Live/staging checks if deployed.
5. Remaining risks or known limitations.

Do not mix unrelated fixes. Small commits beat heroic rewrites.
