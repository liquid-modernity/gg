# Task 06 — Global Sheet Contract v1

## Objective

Define one global sheet contract for all GG-owned sheet surfaces while preserving different origin grammars for bottom sheets and top preview sheets.

This task defines the contract. Gesture implementation/refinement happens in Task 07.

## Hard Constraints

- Do not rewrite Blogger native comments source.
- Do not turn preview into a bottom sheet.
- Do not force bottom sheets to use preview behavior.
- Do not add surface-specific hacks.
- Do not create multiple sheet controllers.
- Do not add override-on-override CSS/JS.

## Required Contract

Every GG-owned sheet surface should expose a normalized origin:

```html
data-gg-sheet-origin="bottom"
```

or:

```html
data-gg-sheet-origin="top"
```

Use additional identifiers as needed:

```html
data-gg-sheet-surface="comments|discovery|more|preview|store-preview"
data-gg-sheet-state="open|closed"
aria-hidden="true|false"
```

## Bottom Sheet Surfaces

Surfaces:

```txt
comments
discovery
more
```

Animation grammar:

```txt
closed: translateY(100%)
open: translateY(0)
dismiss direction: downward
```

## Top Preview Surfaces

Surfaces:

```txt
root preview
store preview
```

Animation grammar:

```txt
closed: translateY(-100%)
open: translateY(0)
dismiss direction: upward
```

## Shared Lifecycle

All sheets should share one lifecycle:

```txt
register
open
close
toggle
trap/restore focus when appropriate
lock/unlock background when appropriate
close on Escape
close on backdrop/outside
close active sheet before browser back navigation when appropriate
restore trigger focus
```

## Accessibility Contract

Use route-appropriate roles:

```txt
role="dialog" or appropriate equivalent
aria-modal when modal
aria-labelledby where title exists
aria-describedby where summary exists
focusable close control
keyboard access
```

Do not make hidden sheets visible to screen readers.

## Acceptance Criteria

- Comments, discovery, more, root preview, and store preview use one declared sheet contract.
- Top and bottom sheet origins remain distinct.
- No duplicate sheet controller is created.
- Sheet state attributes are deterministic.
- Accessibility state is updated when sheets open/close.
- Existing visual behavior is preserved unless explicitly corrected by contract.
