# TASK 009 — Worker Clean Route Mapping for Store Category and Pagination Pages

## Context

Category and pagination artifacts now exist. Users and crawlers need clean URLs served through the Worker.

## Goal

Update Worker route handling so clean category and pagination URLs resolve to generated store static artifacts:

```text
/store/fashion
/store/skincare
/store/workspace
/store/tech
/store/everyday
/store/fashion/page/2
/store/skincare/page/2
```

## Hard Requirements

1. Do not break `/store`.
2. `/store/` redirects to `/store`.
3. `/store.html` redirects to `/store`.
4. `/store/etc` must not be public; redirect to `/store/everyday` or controlled 404.
5. `/store/lainnya` may redirect to `/store/everyday` if desired.
6. Category routes must be crawlable.
7. Page 2+ routes must self-canonicalize.
8. Do not canonicalize page 2+ to page 1.
9. Do not serve 200 for malformed pagination routes.
10. Preserve production/development robots policy.

## Files to Update

```text
worker.js
qa/live-smoke-worker.sh
tools/preflight.mjs, if needed
qa/store-artifact-smoke.sh, if needed
```

## Primary Routes

```text
/store
/store/fashion
/store/skincare
/store/workspace
/store/tech
/store/everyday
/store/fashion/page/2
/store/skincare/page/2
/store/workspace/page/2
/store/tech/page/2
/store/everyday/page/2
```

## Redirects

```text
/store/                  → /store
/store.html              → /store
/store/etc               → /store/everyday or 404
/store/lainnya           → /store/everyday
/store/fashion/          → /store/fashion
/store/fashion/page/1    → /store/fashion
/store/fashion/page/02   → /store/fashion/page/2
/store/fashion/page/0    → 404
```

Choose strict behavior and document it.

## Artifact Mapping

Nested artifacts:

```text
/store/fashion        → store/fashion/index.html
/store/fashion/page/2 → store/fashion/page/2/index.html
```

Flat artifact fallback if needed:

```text
/store/fashion        → store-fashion.html
/store/fashion/page/2 → store-fashion-page-2.html
```

Centralize the mapping logic. Do not scatter category routing across many branches.

## Headers

Store routes should emit useful diagnostics:

```text
x-gg-route-class: store
x-gg-store-route: root | category | category-page
x-gg-store-category: fashion | skincare | workspace | tech | everyday
x-gg-store-page: 1 | 2 | ...
x-gg-store-source: assets
x-gg-store-static: present
x-gg-store-cache-policy: ...
```

Preserve existing headers:

```text
x-gg-release
x-gg-edge-mode
x-robots-tag
cache-control
```

## Robots Policy

Development:

```text
noindex, nofollow, nosnippet, noimageindex, max-snippet:0, max-image-preview:none, max-video-preview:0
```

Production:

```text
index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1
```

Category and pagination routes must follow this same mode policy.

## Invalid Routes

Return 404 for invalid category:

```text
/store/unknown
```

Return 404 for non-existing pagination page:

```text
/store/fashion/page/999
```

Do not redirect invalid pages to `/store`.

## Live Smoke Updates

Update `qa/live-smoke-worker.sh` to check, if artifacts exist:

1. `/store/fashion` returns 200.
2. `/store/skincare` returns 200.
3. `/store/workspace` returns 200.
4. `/store/tech` returns 200.
5. `/store/everyday` returns 200.
6. `/store/etc` redirects to `/store/everyday` or returns controlled 404.
7. `/store/fashion/page/1` redirects to `/store/fashion`.
8. `/store/fashion/page/2` returns 200 if generated, otherwise skip with info.

## Diagnostics

If diagnostic endpoints exist, extend them:

```text
/__gg/headers?url=/store/fashion&mode=production
/__gg/headers?url=/store/fashion/page/2&mode=production
```

Production preview should be indexable and self-canonical.

## Commands That Must Pass

```bash
npm run store:build
npm run store:proof
npm run store:check:ci
bash qa/store-artifact-smoke.sh
npm run gaga:preflight
npm run gaga:verify-worker-live:local
```

If the live host is reachable:

```bash
npm run gaga:verify-worker-live:strict
```

## Acceptance Criteria

- `/store` still works.
- Category routes work.
- `/store.html` redirects to `/store`.
- `/store/` redirects to `/store`.
- Invalid categories do not silently serve `/store`.
- Page 2 routes work only when generated.
- Headers identify store category/page routes.
- Robots policy is correct by mode.
