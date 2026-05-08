# Task 024 — Tappable Sticky Sheet Handles Close Behavior

## Objective

Every visible sheet handle must support two behaviors:

```txt
Tap / click handle : close the active sheet
Drag handle        : dismiss sheet in the correct direction
```

This must work for:

```txt
Blogger top sheet    : preview
Blogger bottom sheets: command, more, comments
Store top sheet      : product preview
Store bottom sheets  : discovery, saved, more
```

The current Blogger implementation treats handles mainly as drag affordances. Several handles are `div` / `span` with `aria-hidden='true'`, which is wrong once the handle becomes interactive.

## Scope

Likely files:

```txt
src/js/gg-app.source.js
src/store/store.js
template/partials/12-post-detail-comments.xml
template/partials/16-discovery-panel-and-templates.xml
template/partials/17-preview-panel-and-templates.xml
template/partials/18-more-panel.xml
index.xml
store.html
src/css/gg-app.source.css
src/store/store.css
__gg/assets/js/gg-app.dev.js
__gg/assets/js/gg-app.min.js
dist/assets/js/gg-app.dev.js
dist/assets/js/gg-app.min.js
assets/store/store.js
```

## Required Blogger Changes

1. Replace passive handle elements with real buttons where the handle is meant to close a sheet.

   Current pattern to replace:

   ```html
   <div aria-hidden='true' class='gg-sheet__handle' data-gg-drag-handle='preview'/>
   ```

   Preferred pattern:

   ```html
   <button class='gg-sheet__handle'
           data-gg-close='preview'
           data-gg-drag-handle='preview'
           type='button'>
     <span class='gg-visually-hidden'>Close preview</span>
   </button>
   ```

   Apply equivalent labels for `command`, `more`, and `comments`.

2. Keep the visual handle line drawn with CSS, not text content.

   The button itself should be a hit target. The line can be `::before`.

3. Update `src/js/gg-app.source.js` drag handling.

   Current problem:

   ```js
   state.ignoreClickUntil = Date.now() + 180;
   event.preventDefault();
   ```

   A normal click listener can be suppressed after `pointerdown`. Do not rely only on `click` for handle close.

4. In `endDrag(event)`, classify pointer release:

   ```txt
   small movement   => tap-on-handle, close the sheet
   large movement   => drag-dismiss if direction and threshold match
   otherwise        => restore panel
   ```

5. Make drag dismissal edge-aware:

   ```txt
   top sheet    closes on upward drag
   bottom sheet closes on downward drag
   ```

   Suggested logic:

   ```js
   function getPanelEdge(panel) {
     return panel && panel.root && panel.root.getAttribute('data-gg-edge') === 'top' ? 'top' : 'bottom';
   }

   function shouldDismissByDrag(panel, offsetY, velocityY) {
     var threshold = getDismissThreshold(panel);
     var edge = getPanelEdge(panel);
     if (edge === 'top') return offsetY < -threshold || velocityY < -0.75;
     return offsetY > threshold || velocityY > 0.75;
   }
   ```

6. Ensure `applyPanelDrag()` does not visually move a top sheet in the wrong direction. If current logic only handles positive/downward offsets, clamp or invert by edge.

7. Keep scrim close behavior intact:

   ```html
   data-gg-close='preview'
   data-gg-close='command'
   data-gg-close='more'
   data-gg-close='comments'
   ```

## Required Store Changes

1. Store preview already has:

   ```html
   <button class="store-preview__handle" type="button" data-store-close="preview" ...></button>
   ```

   Keep this pattern.

2. Store bottom sheets currently use passive spans like:

   ```html
   <span class="gg-sheet__handle" data-store-drag-handle="discovery" aria-hidden="true"></span>
   ```

   Convert visible bottom handles to buttons:

   ```html
   <button class="gg-sheet__handle"
           type="button"
           data-store-close="discovery"
           data-store-drag-handle="discovery"
           aria-label="Close discovery"></button>
   ```

   Repeat for `saved` and `more`.

3. Update `src/store/store.js` drag handling so tap closes as well as drag.

   Current behavior only closes when drag distance crosses threshold:

   ```js
   if (session.name === 'preview' && deltaY <= -84) closePanel('preview');
   if (session.name !== 'preview' && deltaY >= 84) closePanel(session.name);
   ```

   Add tap classification, for example:

   ```txt
   abs(deltaY) < 8 and short pointer session => closePanel(session.name)
   ```

   Keep top preview upward drag and bottom downward drag.

## CSS Requirements

1. Interactive handles must keep the same visual affordance as before.

2. Hit target must be reasonable:

   ```txt
   minimum visual/hit area around 44px where practical
   line itself may remain 62px x 3px
   ```

3. Bottom sheet handles are sticky in the header area.

4. Top preview handle is sticky at the bottom footer area.

5. Focus states must be visible with keyboard navigation.

## Required Verification

Manual verification:

```txt
/         open command sheet -> tap handle -> closes
/         open more sheet -> tap handle -> closes
/post     open comments sheet -> tap handle -> closes
/         open preview top sheet -> tap bottom handle -> closes
/store    open product preview -> tap bottom handle -> closes
/store    open discovery/saved/more -> tap top handle -> closes
```

Gesture verification:

```txt
Top preview: drag up closes, drag down restores
Bottom sheet: drag down closes, drag up restores
Small tap on handle closes and does not bounce the sheet
```

Run:

```bash
npm run gaga:template:pack
npm run store:build
npm run store:proof
npm run gaga:preflight
```

## Final Acceptance Standard

```txt
PASS: all visible sheet handles are real interactive controls
PASS: tap/click on every visible handle closes its sheet
PASS: top-sheet drag direction is correct
PASS: bottom-sheet drag direction is correct
PASS: focus-visible state exists for handle buttons
PASS: no aria-hidden element is used as an interactive handle
PASS: scrim close behavior is not broken
```

## Non-Goals

Do not:

- add new sheet types
- change route behavior
- rewrite the entire panel manager
- remove drag gesture support
- make invisible close buttons the only way to close visible sheets
