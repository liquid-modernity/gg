# Task 025 — Blogger Preview Top-Sheet Visual Parity with Store Preview

## Objective

Rebuild the Blogger article preview top sheet so it follows the same visual grammar as the Store product preview:

```txt
hero / media
shade / overlay
intro title + meta
raised surface body
section labels / contents
primary CTA
sticky bottom close handle
```

Do not copy product-specific content. The Blog preview remains an article preview. The goal is shared sheet grammar, not identical information.

## Current Problem

The existing Blogger preview is visually closer to an enlarged article card:

```txt
thumbnail
plain title
summary
metadata
toc
CTA
handle
```

The Store preview feels like a native top sheet because it has:

```txt
large hero
text overlay
body surface raised over the hero
clear hierarchy
sticky bottom affordance
```

The Blogger preview should adopt that structure.

## Scope

Likely files:

```txt
template/partials/17-preview-panel-and-templates.xml
index.xml
src/css/gg-app.source.css
__gg/assets/css/gg-app.dev.css
__gg/assets/css/gg-app.min.css
dist/assets/css/gg-app.dev.css
dist/assets/css/gg-app.min.css
```

Update `src/js/gg-app.source.js` only if markup IDs or hidden-state behavior require it. Preserve existing JS selectors where possible.

## Required Markup Direction

Restructure the preview panel while preserving important IDs:

```html
<section class='gg-content-sheet gg-preview__sheet gg-sheet__panel' ...>
  <div class='gg-preview__hero'>
    <div class='gg-preview__media' hidden='hidden' id='gg-preview-media'>
      <img alt='' id='gg-preview-image' loading='lazy' src=''/>
    </div>
    <div class='gg-preview__shade' aria-hidden='true'></div>
    <header class='gg-preview__intro'>
      <p class='gg-preview__eyebrow'>Article preview</p>
      <h2 class='gg-preview__title' id='gg-preview-title'>Article preview</h2>
      <div class='gg-preview__meta' id='gg-preview-meta'></div>
    </header>
  </div>

  <div class='gg-content-sheet__body gg-preview__body'>
    <div class='gg-preview__surface'>
      <p class='gg-preview__summary' id='gg-preview-summary'></p>
      <p class='gg-preview__taxonomy' hidden='hidden' id='gg-preview-taxonomy'>...</p>
      <section class='gg-preview__toc' id='gg-preview-toc'>...</section>
      <div class='gg-preview__footer'>
        <a class='gg-preview__cta' id='gg-preview-cta'>Open full article</a>
      </div>
    </div>
  </div>

  <footer class='gg-content-sheet__affordance gg-preview__affordance'>
    <button class='gg-sheet__handle' data-gg-close='preview' data-gg-drag-handle='preview' type='button'>...</button>
  </footer>
</section>
```

This is a direction, not a mandatory exact copy. The hard requirement is the hierarchy: hero + overlay + raised surface + sticky handle.

## CSS Requirements

Use the Store preview as the visual reference:

```txt
.store-preview-sheet
.store-preview__hero
.store-preview__shade
.store-preview__body
.store-preview__intro
.store-preview__surface
.store-preview__fact-label
.store-preview__footer
.store-preview__handle
```

Map it to Blogger classes:

```txt
.gg-preview__hero
.gg-preview__shade
.gg-preview__body
.gg-preview__intro
.gg-preview__surface
.gg-preview__section-title
.gg-preview__footer
.gg-preview__affordance
.gg-sheet__handle
```

Required styling characteristics:

1. Top sheet uses shared 600px width from Task 023.

2. Preview panel remains top-attached:

   ```css
   .gg-sheet[data-gg-edge='top'] {
     align-items: start;
     justify-items: center;
   }
   ```

3. Top radius and bottom radius follow top-sheet logic:

   ```txt
   top edge: flush to viewport
   bottom corners: rounded
   ```

4. Hero area supports images but does not break without images.

   If no image is available, use a quiet gradient / surface fallback. Do not show a broken blank frame.

5. Title and primary meta should overlay the hero, not sit as a plain body block.

6. Body surface should rise over the hero slightly, similar to Store preview.

7. Contents and taxonomy should use Store-like label grammar:

   ```txt
   small uppercase label
   controlled letter spacing
   calm muted color
   clear body copy
   ```

8. CTA stays in the surface and remains visually primary.

9. Sticky bottom handle remains visible after internal scrolling.

## Content Rules

Do not add product-only concepts to article preview:

```txt
No price
No marketplace buttons
No save product button
No product notes section unless the article already has equivalent content
```

Acceptable article equivalents:

```txt
category / label
published date
read time
author
summary
section map / contents
open full article CTA
```

## JS Preservation Rules

Preserve these IDs unless absolutely impossible:

```txt
gg-preview-media
gg-preview-image
gg-preview-title
gg-preview-meta
gg-preview-summary
gg-preview-taxonomy
gg-preview-taxonomy-items
gg-preview-status
gg-preview-toc-list
gg-preview-cta
```

If an ID moves, update `src/js/gg-app.source.js` selectors deliberately and verify fill/update behavior.

## Required Verification

Manual visual verification with the provided screenshots as reference:

```txt
/ Blogger listing preview now feels like the Store top sheet
/ Store preview remains unchanged except for shared width and handle contracts
/ Blogger preview still opens the correct article URL
/ Blogger preview still shows title, meta, summary, taxonomy, and section map
/ Missing thumbnail does not produce ugly blank/broken layout
```

Run:

```bash
npm run gaga:template:pack
npm run gaga:template:proof
npm run gaga:preflight
```

## Final Acceptance Standard

```txt
PASS: Blogger preview visually belongs to the same UI family as Store preview
PASS: hero/overlay/surface hierarchy exists
PASS: article-specific content remains semantically correct
PASS: CTA and contents remain functional
PASS: preview handle is sticky at the bottom and closeable
PASS: panel width remains max 600px
PASS: no product-only UI is copied into article preview
```

## Non-Goals

Do not:

- redesign article pages
- change Blogger post rendering
- change Store product preview content
- add carousel behavior to Blogger preview
- add new data dependencies to Blogger feed parsing
