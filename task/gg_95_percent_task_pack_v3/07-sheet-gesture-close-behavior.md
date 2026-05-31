# Task 07 — Sheet Gesture & Close Behavior

## Objective

Make close behavior consistent, native-feeling, keyboard-safe, and origin-aware for bottom sheets and top preview sheets.

## Hard Constraints

- Do not make sheet body/content a drag zone.
- Do not break body/content scrolling.
- Do not add per-surface gesture hacks.
- Do not rewrite Blogger comments source.
- Do not change the sheet origin grammar from Task 06.

## Bottom Sheet Behavior

Surfaces:

```txt
comments
discovery
more
```

Expected behavior:

```txt
open direction: bottom → up
close gesture: drag down
drag zones: sheet head and handle
tap handle: close
outside/backdrop click: close
Escape: close
Back button: close active sheet first
body/content: scroll, not drag close
```

## Top Preview Behavior

Surfaces:

```txt
root preview
store preview
```

Expected behavior:

```txt
open direction: top → down
close gesture: drag up
drag zones: preview footer and footer handle
tap footer handle: close
outside/backdrop click: close
Escape: close
Back button: close active sheet first
body/content: scroll, not drag close
```

## Drag Zone Contract

Use explicit drag zone attributes where possible:

```html
data-gg-sheet-drag-zone="head"
data-gg-sheet-drag-zone="handle"
data-gg-sheet-drag-zone="footer"
```

Recommended mapping:

```txt
bottom sheet head = drag zone
bottom sheet handle = drag zone + tap close
preview footer = drag zone
preview footer handle = drag zone + tap close
backdrop/outside = click close
sheet body/content = not drag zone
```

## Gesture Safety

- Use pointer/touch events in a way that does not block vertical content scroll.
- Use thresholds to avoid accidental close.
- Respect reduced motion preferences.
- Do not trap scroll in long content unless modal behavior requires it.
- Restore focus to trigger after close.
- Avoid global event leaks.

## Acceptance Criteria

- Bottom sheets close downward only.
- Top previews close upward only.
- Body/content remains scrollable.
- Drag zones are explicit and limited.
- Escape and backdrop close work consistently.
- Browser back closes active sheet before navigating when applicable.
- Focus restoration works.
