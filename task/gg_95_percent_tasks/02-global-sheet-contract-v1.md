# Task 02 — Global Sheet Contract v1

## Objective

Create one global sheet contract that supports two official sheet origins:

1. bottom sheets: comments, discovery, more;
2. top preview sheets: root preview and store preview.

This task defines the contract. Gesture refinement happens in Task 03.

## Hard Constraints

- Blog1 must not be rewritten.
- Native Blogger comments source must not be rewritten.
- Do not turn preview into a bottom sheet.
- Do not force bottom sheets to use preview behavior.
- Do not add override-on-override.
- Replace duplicated sheet logic with a shared contract.
- Keep body/content scrollable.

## Required Contract

Every GG-owned sheet surface should expose a normalized origin:

```html
data-gg-sheet-origin="bottom"
```

or:

```html
data-gg-sheet-origin="top"
```

### Bottom Sheet Surfaces

Use:

```html
data-gg-sheet-origin="bottom"
```

For:

```text
comments
discovery
more
```

Expected animation grammar:

```text
closed: translateY(100%)
open: translateY(0)
dismiss direction: downward
```

### Top Preview Surfaces

Use:

```html
data-gg-sheet-origin="top"
```

For:

```text
root preview
store preview
```

Expected animation grammar:

```text
closed: translateY(-100%)
open: translateY(0)
dismiss direction: upward
```

## Required API Direction

Global sheet behavior should move toward a single API shape:

```js
GG.sheet.open({
  id: "comments",
  origin: "bottom",
  surface: "comments"
});
```

```js
GG.sheet.open({
  id: "preview",
  origin: "top",
  surface: "root-preview"
});
```

The controller may infer origin from DOM attributes, but the contract must be explicit and readable.

## Required Work

### 1. Normalize sheet DOM markers

Add or normalize GG-owned attributes only:

```html
data-gg-sheet
data-gg-sheet-origin
data-gg-sheet-surface
```

Do not rewrite Blogger-owned markup beyond safe GG wrapper attributes.

### 2. Normalize sheet state classes/attributes

Use a consistent state model, such as:

```html
data-gg-sheet-state="closed|opening|open|closing"
```

or a project-existing equivalent if already established.

Do not create parallel state systems.

### 3. Centralize origin detection

Sheet code should not infer origin from random class names.

Preferred order:

```text
1. explicit option passed to GG.sheet.open()
2. data-gg-sheet-origin attribute
3. safe default: bottom
```

### 4. Preserve surface-specific adapters

Adapters may remain surface-specific, but they must use the same sheet lifecycle.

Allowed:

```text
preview adapter
comments adapter
discovery adapter
store adapter
more adapter
```

Not allowed:

```text
separate unrelated sheet lifecycle per surface
```

## Acceptance Criteria

- Comments, discovery, and more are recognized as bottom sheets.
- Root preview and store preview are recognized as top sheets.
- Top preview still opens from top.
- Bottom sheets still open from bottom.
- No Blog1 rewrite.
- No native comments source rewrite.
- No new override CSS patch.
- One shared sheet lifecycle path exists or is clearly introduced.

## Suggested Verification

```bash
npm run build
npm run qa:contract
```

If existing guard names differ, use the closest non-live, source-level contract verification.

## Non-Goals

- Do not implement advanced drag threshold here; that is Task 03.
- Do not split the full JS monolith here; that is Task 05.
- Do not split CSS here; that is Task 06.
