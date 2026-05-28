# Task 03 — Sheet Gesture & Close Behavior

## Objective

Make sheet close behavior consistent, native-feeling, and origin-aware.

Bottom sheets and top preview sheets should share one gesture module but use different dismissal directions.

## Hard Constraints

- Blog1 must not be rewritten.
- Do not change Blogger native comments source.
- Do not make sheet body/content a drag zone.
- Do not break body/content scrolling.
- Do not introduce surface-specific gesture hacks.
- Do not add override-on-override.

## Required Behavior

### Bottom Sheets

Surfaces:

```text
comments
discovery
more
```

Behavior:

```text
open direction: bottom → up
close gesture: drag down
drag zones: sheet head and handle
tap handle: close
outside/backdrop click: close
Escape: close
Back button: close active sheet first
```

### Top Preview Sheets

Surfaces:

```text
root preview
store preview
```

Behavior:

```text
open direction: top → down
close gesture: drag up
drag zones: preview footer and footer handle
tap footer handle: close
outside/backdrop click: close
Escape: close
Back button: close active sheet first
```

## Drag Zone Contract

Use explicit drag zone attributes where possible:

```html
data-gg-sheet-drag-zone="head"
data-gg-sheet-drag-zone="handle"
data-gg-sheet-drag-zone="footer"
```

Recommended mapping:

```text
bottom sheet head = drag zone
bottom sheet handle = drag zone + tap close
preview footer = drag zone
preview footer handle = drag zone + tap close
backdrop/outside = click close
```

## Not Allowed

Do not use the entire `.gg-sheet__body`, `.gg-preview__body`, `.gg-preview__surface`, or content area as a drag zone.

Reason: it conflicts with scroll, selection, links, and native content interaction.

## Suggested Gesture Logic

Pseudo-contract:

```js
const origin = sheet.dataset.ggSheetOrigin || "bottom";

const dismissDirection = origin === "top" ? "up" : "down";

const threshold = 64;

if (origin === "bottom" && dragDeltaY > threshold) {
  close();
}

if (origin === "top" && dragDeltaY < -threshold) {
  close();
}
```

Keep threshold forgiving:

```text
minimum distance: 56–72px
velocity close: optional
tap close: yes, for handle
```

## Accessibility Requirements

- Focus returns to the trigger after close.
- Escape closes active sheet.
- Outside click closes active sheet.
- Active sheet should expose appropriate ARIA role/label.
- Inert/aria-hidden behavior should not trap users incorrectly.
- Reduced motion should be respected if the project already supports it.

## Acceptance Criteria

- Bottom sheet can close by dragging down from head/handle.
- Preview top sheet can close by dragging up from footer/handle.
- Handle tap closes active sheet.
- Backdrop/outside click closes active sheet.
- Sheet body remains scrollable.
- Links/buttons inside body remain usable.
- No Blog1 rewrite.
- No native comments source rewrite.

## Suggested Verification

Manual source-level smoke:

```text
1. Open comments sheet.
2. Drag head down → closes.
3. Open discovery sheet.
4. Tap handle → closes.
5. Open root preview.
6. Drag preview footer up → closes.
7. Open store preview.
8. Tap footer handle → closes.
9. Click outside active sheet → closes.
10. Scroll sheet body → scroll works, does not trigger close.
```

Automated verification should check the contract, not pixel-perfect physics.
