# Task 023 — Shared 600px Panel Width Contract

## Objective

Establish one strict panel-width contract across the Blogger shell, Landing shell, and Store shell:

```txt
Dock width        : max 600px
Bottom sheet      : max 600px
Top sheet         : max 600px
All devices       : mobile, tablet, desktop, wide desktop
Horizontal safety : never overflow small screens
```

This is a control-surface contract, not a content-width contract. Article bodies, product grids, and wide editorial sections may stay wider. Dock, bottom sheets, and top preview sheets must not.

## Design Decision

Use this as the canonical panel token:

```css
--gg-panel-width: min(calc(100dvw - 12px), 600px);
```

Fallback acceptable only where `dvw` is risky:

```css
--gg-panel-width: min(calc(100vw - 12px), 600px);
```

Do not use literal `width: 600px` because it will overflow narrow mobile screens.

## Scope

Likely files:

```txt
src/css/gg-app.source.css
template/partials/05-bskin-wrapper-original.xml
index.xml
landing.html
store.html
src/store/store.css
assets/store/store.css
__gg/assets/css/gg-app.dev.css
__gg/assets/css/gg-app.min.css
dist/assets/css/gg-app.dev.css
dist/assets/css/gg-app.min.css
```

Generated/staged CSS files may be updated manually only if the repo still mirrors source files directly. Prefer the repo's build/sync flow if it exists.

## Required Changes

1. In the Blogger CSS source, replace the current wide panel token:

   ```css
   --gg-panel-width: min(100%, 920px);
   ```

   with:

   ```css
   --gg-panel-width: min(calc(100dvw - 12px), 600px);
   ```

2. Ensure Blogger dock and sheets consume the same token:

   ```css
   .gg-dock {
     width: var(--gg-panel-width);
     max-width: none;
   }

   .gg-sheet__panel {
     width: var(--gg-panel-width);
     max-width: none;
   }
   ```

   Keep edge-specific sheet behavior separate. Width should be shared; transform, radius, height, and placement can remain edge-specific.

3. In `landing.html`, replace the current 720px control width contract:

   ```css
   --gg-panel-width: min(calc(100% - 12px), 720px);
   .gg-dock { width: min(calc(100% - 12px), 720px); }
   ```

   with the shared 600px token:

   ```css
   --gg-panel-width: min(calc(100dvw - 12px), 600px);
   .gg-dock { width: var(--gg-panel-width); }
   ```

4. In `store.html` / `src/store/store.css`, add or normalize the shared token:

   ```css
   --gg-panel-width: min(calc(100dvw - 12px), 600px);
   --store-sheet-width: var(--gg-panel-width);
   --store-bottom-sheet-width: var(--gg-panel-width);
   ```

   Then make the Store dock use it:

   ```css
   .gg-dock {
     width: var(--gg-panel-width);
   }
   ```

5. Keep Store content-grid widths separate:

   ```css
   --store-max
   --store-max-wide
   ```

   These may remain 720px / 920px / 1040px for product grids. Do not make the product grid 600px just because the dock is 600px.

6. Remove or override media-query escalations that make control surfaces wider than 600px. Examples to audit:

   ```css
   @media (min-width: 720px) { ... 720px / 760px / 920px ... }
   @media (min-width: 1180px) { ... 1040px ... }
   ```

   Wide content may scale up. Dock/sheet controls must not.

## Hard Rules

Do not:

- use `--store-max` for the Store dock
- let top preview remain 760px or 920px
- let bottom sheets remain 720px
- use `max-width: calc(100% - 24px)` as the only width guard while the actual width differs by page
- collapse content-grid width into panel width

## Required Verification

Run these checks after changes:

```bash
grep -RIn -- "--gg-panel-width" src/css/gg-app.source.css landing.html store.html src/store/store.css template/partials index.xml
grep -RInE -- "(--store-sheet-width|--store-bottom-sheet-width|width: min\(calc\(100% - 12px\), 720px\)|920px|760px)" src/css/gg-app.source.css landing.html store.html src/store/store.css
npm run gaga:template:pack
npm run store:build
npm run store:proof
npm run gaga:preflight
```

Then verify in the browser or device emulator:

```txt
/landing  dock max 600px, centered on desktop
/         dock max 600px, command/more/comments max 600px, preview max 600px
/store    dock max 600px, discovery/saved/more max 600px, preview max 600px
```

## Final Acceptance Standard

```txt
PASS: mobile has no horizontal overflow
PASS: tablet keeps dock/sheets at max 600px
PASS: desktop wide keeps dock/sheets centered at max 600px
PASS: Store product grid can remain wider than 600px
PASS: Blogger article/content surfaces are not accidentally narrowed
PASS: no remaining panel-control width of 720px, 760px, 920px, or 1040px
```

## Non-Goals

Do not:

- redesign Store product cards
- redesign article body width
- change routes, canonical URLs, or schema
- change dock item count or labels
- optimize unrelated CSS
