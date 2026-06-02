# Lazy Interaction Budget Report

This report documents Task 11 lazy-interaction ownership. It verifies source architecture only; it does not turn performance scores into release blockers during normal development.

Guard command:

```bash
npm run gaga:verify-lazy-interaction-budget
```

## Eager Contracts

- Blogger SSR content, canonical links, SEO metadata, route-critical JSON-LD, basic route detection, theme bootstrap, shell layout, and visible navigation remain eager.
- Post detail article content and Reader Mode eligibility remain Blogger/source-owned.
- Store static product cards, semantic browse content, canonical public Store URLs, and valid Store schema remain available in HTML before JavaScript enhancement.

## Lazy Or Intent-Gated Interactions

- Root preview detail fetch/parser runs from preview intent through `openPreview()` and `loadPreviewDetail()`.
- Blogger comments enhancement is scheduled through idle hydration and forced synchronously only when the comments sheet/composer is opened.
- Root Discovery feed enhancement is built from listing/static rows first and fetches the feed from `ensureDiscoveryIndex()` after command/search intent.
- Landing Discovery keeps static route/section/action results immediately and moves the Blogger feed enhancement to idle.
- Store uses static products first, then schedules live feed refresh through idle; Store discovery manifest loading remains behind discovery intent.
- Store preview rendering remains item-intent driven.
- PWA service worker registration is scheduled through idle after the critical shell is ready.

## Advisory Budget Policy

- Development and CI budget warnings are advisory unless a strict release mode is explicitly configured.
- Strict promotion is explicit through existing Store modes such as `store:check:strict`, `store:check:production`, `STORE_REQUIRE_LIVE_FEED=1`, `STORE_STRICT_IMAGES=1`, or production readiness flags.
- Warnings must report route/surface, asset type, current size or cost, recommended action, and blocking status as advisory unless strict mode is active.

## Intentional Non-Changes

- No UX feature was removed to satisfy a metric.
- No generated artifact is the primary fix.
- Worker remains an edge policy layer and does not repair HTML, schema, CMS content, readability, or interaction boot paths.
