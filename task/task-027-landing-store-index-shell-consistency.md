# Task 027 — Landing, Store, and Index Shell Consistency

## Objective

Make `/landing`, `/`, and `/store` feel like one product shell, not three separate UI systems.

This task is not about new features. It is visual and behavioral alignment after the width, handle, and preview changes.

## Required Consistency Contract

Across all three surfaces:

```txt
Dock max width         : shared 600px token
Bottom sheet max width : shared 600px token
Top sheet max width    : shared 600px token
Dock position          : fixed bottom, centered
Bottom sheet position  : attached bottom, centered
Top sheet position     : attached top, centered
Sheet radius grammar   : bottom sheets rounded top; top sheets rounded bottom
Scrim behavior         : consistent fade/blur grammar
Safe-area handling     : consistent env(safe-area-inset-bottom/top)
Panel active behavior  : dock hides or locks consistently while sheet is active
```

## Scope

Likely files:

```txt
landing.html
store.html
src/store/store.css
src/store/store.js
src/css/gg-app.source.css
src/js/gg-app.source.js
template/partials/15-dock.xml
template/partials/16-discovery-panel-and-templates.xml
template/partials/17-preview-panel-and-templates.xml
template/partials/18-more-panel.xml
index.xml
assets/store/store.css
assets/store/store.js
__gg/assets/css/gg-app.dev.css
__gg/assets/css/gg-app.min.css
__gg/assets/js/gg-app.dev.js
__gg/assets/js/gg-app.min.js
dist/assets/css/gg-app.dev.css
dist/assets/css/gg-app.min.css
dist/assets/js/gg-app.dev.js
dist/assets/js/gg-app.min.js
```

## Required Changes

1. Normalize shared shell tokens.

   Use the same names where possible:

   ```css
   --gg-panel-width
   --gg-dock-offset-bottom
   --gg-dock-track-height
   --gg-dock-clearance
   --gg-shell-bottom-clearance
   --gg-motion-sheet-open-top
   --gg-motion-sheet-close-top
   --gg-motion-sheet-open-bottom
   --gg-motion-sheet-close-bottom
   ```

2. Keep semantic route differences intact.

   Required public route truth:

   ```txt
   /landing = Home
   /        = Blog/listing
   /store   = Store
   ```

   Do not change dock href semantics while polishing shell consistency.

3. Normalize dock width and centering:

   ```css
   .gg-dock {
     left: 50%;
     bottom: var(--gg-dock-offset-bottom);
     width: var(--gg-panel-width);
     transform: translate3d(-50%, 0, 0);
   }
   ```

   Hidden-by-scroll or panel-active states may translate downward, but must return to the same centered position.

4. Normalize sheet edge grammar:

   ```txt
   bottom sheet: border-bottom 0; radius 28px 28px 0 0; transform from +Y
   top sheet:    border-top 0;    radius 0 0 28px 28px; transform from -Y
   ```

   Adjust exact radius only if the current token system requires it. The grammar matters more than the number.

5. Normalize sticky handles:

   ```txt
   bottom sheets: handle in sticky top header
   top sheets: handle in sticky bottom footer/affordance
   ```

6. Normalize panel active body states.

   Check and align:

   ```txt
   data-gg-panel-active
   data-gg-active-panel
   data-gg-dock-state
   data-gg-scroll-lock
   ```

   Store and Blogger do not need identical JS internals, but body state behavior should not visibly disagree.

7. Normalize desktop behavior.

   On wide desktop:

   ```txt
   dock remains 600px centered
   sheets remain 600px centered
   product/content grids may be wider
   no giant dock or giant sheet
   no left-biased sheet
   ```

## Visual QA Checklist

Use these surfaces:

```txt
/landing
/
/store
one Blogger post detail page
one Blogger label page
```

Check:

```txt
Dock width looks identical on all surfaces
Dock item rhythm looks consistent
Bottom sheets rise from the same visual system
Top preview sheets drop from the same visual system
Scrim opacity/blur does not feel like three products
Safe-area spacing does not produce floating gaps on mobile
Desktop centered layout looks intentional, not narrow by accident
```

## Required Verification

Run:

```bash
npm run gaga:template:pack
npm run gaga:template:proof
npm run store:build
npm run store:proof
npm run gaga:preflight
```

If live network is stable:

```bash
npm run gaga:verify-worker-live:local
```

## Final Acceptance Standard

```txt
PASS: /landing, /, and /store use the same 600px control surface contract
PASS: sheet edge/radius/transform grammar is consistent
PASS: dock behavior is consistent while panels open/close
PASS: top and bottom sticky handles are consistent by edge
PASS: content-grid width remains independent from shell-control width
PASS: route and breadcrumb semantics are untouched
```

## Non-Goals

Do not:

- redesign landing content
- redesign Store product cards
- redesign Blogger article layout
- change route mapping
- change SEO/schema output
- introduce a new design system library
