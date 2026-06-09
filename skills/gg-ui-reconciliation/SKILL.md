---
name: gg-ui-reconciliation
description: Use when reconciling mockups, screenshots, rough UI ideas, or ugly existing interfaces into polished GG product UI.
---

# GG UI Reconciliation Skill

Use this skill when converting mockups or UI direction into implementation.

## Prime Directive

Implement the design intent without breaking semantic HTML, accessibility, public route contracts, or existing guards.

## UI Decision Model

First decide what type of UI is being built:

- `public frontend`: root blog, article/page detail, landing, store.
- `GG Console`: Cloudflare-like control dashboard for setup/config/build/deploy/checks.
- `GG Studio`: editorial workspace for posts/pages/products/editor/preview/publish.

Do not use one UI pattern for all contexts.

## Pattern Rules

### Public Frontend

Use mobile-first, app-like, sheet/dock patterns where already established. Preserve crawlable content and semantic structure.

### GG Console

Use control-plane layout:

- left sidebar;
- topbar with project/profile/environment;
- overview cards;
- status badges;
- tables;
- forms;
- right drawer for edit/details;
- logs and checks panels.

Do not make Console editor-first.

### GG Studio

Use editorial layout:

- topbar with close/save/publish;
- central writing/editor canvas;
- right inspector for slug, excerpt, labels, date, cover, author, SEO, gate;
- preview and publish flow.

## Mockup Translation Steps

1. Identify the user job.
2. Identify the surface/module.
3. Extract layout primitives: topbar, sidebar, card, table, sheet, drawer, toolbar, inspector.
4. Map UI text to copy registry if reusable.
5. Map links/actions to route registry if navigational.
6. Map components to `gg-*` public hooks.
7. Preserve keyboard/focus behavior.
8. Add accessible names for icon-only controls.
9. Confirm responsive behavior.
10. Run focused a11y and route/nav guards.

## Anti-Patterns

Do not:

- blindly copy screenshot pixels;
- use unlabeled icon buttons;
- hide settings behind unclear icons;
- build Console as a dock-only mobile app;
- build Studio as a generic SaaS dashboard;
- create duplicate IDs;
- introduce duplicate `data-gg-nav` or route hooks in comments;
- put important content only inside JS-generated state.

## Validation

For public UI:

```bash
npm run gaga:verify-a11y-static
npm run gaga:verify-nav-more
npm run gaga:verify-preview-sheet
npm run ci:qa
```

For Console/Studio skeletons:

```bash
git diff --check
npm run ci:qa
```

If no check exists yet, add a minimal deterministic check instead of relying only on manual review.

## Handoff Format

Report:

- design intent implemented;
- components created/changed;
- accessibility decisions;
- responsive behavior;
- screenshots/mockups intentionally not fully matched;
- commands run.
