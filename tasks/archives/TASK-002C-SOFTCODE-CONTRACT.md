# TASK-002C — Softcode Inventory + Config Surface Contract

## Goal
Create the next softcode contract layer so future Console tasks can edit HTML/CSS/JS-related settings safely.

## Status
✅ COMPLETE

## Files Changed (7 files)
1. `config/softcode.inventory.json` — Expanded with 10 categories (microcopy, routesDomains, themeTokens, navigation, seo, storeCategories, featureFlags, icons, bloggerTargets, cachePolicy). Each has status, owner, sourceOfTruth, surfaces, notes.
2. `registry/surfaces.json` — NEW. Describes 5 surfaces (blog, landing, store, console, studio) with hosts, routes, cache profiles, config refs.
3. `registry/theme-tokens.json` — NEW. Contract for color, radius, spacing, typography, motion, shadow tokens (Gaga Design System).
4. `registry/navigation.json` — NEW. Nav config for publicPrimary, storePrimary, adminPrimary using microcopy keys.
5. `registry/seo.json` — NEW. SEO config for blog, landing, store surfaces (titleKey, descriptionKey, canonicalRef, robots, jsonLdEnabled).
6. `checks/softcode.check.mjs` — NEW. Validates all 5 registry files, required surfaces, required categories, private cache profiles, public hosts/routes.
7. `package.json` — Added `check:softcode` npm script.

## Acceptance
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

## Not Implemented
- No CSS/HTML/JS replacement with softcode values yet
- No Console UI for editing these configs
- No JSON-LD generation
- No theme token actual CSS usage
- No split legacy JS bridge