# Task 032 — Implement minimal comments sheet controller

## Objective

Implement a small, predictable JS controller for opening/closing the native Blogger comments bottom sheet.

This task must not rebuild `GG.modules.Comments` as a large custom comment engine.

## Target files

- `gg-app.dev.js`
- comment-specific JS module if present
- production JS equivalent if present

## Required behavior

Implement:

```txt
openCommentsSheet()
closeCommentsSheet()
toggleCommentsSheet()
openComposer()
syncCommentsHash()
trapFocusWhileOpen()
returnFocusOnClose()
lockBodyScrollWhileOpen()
```

## Event contracts

Preferred:

```txt
[data-gg-action="comments-open"]
[data-gg-action="comments-close"]
[data-gg-action="comments-open-composer"]
```

Temporary legacy bridge:

```txt
[data-gg-postbar="comments"]
[data-gg-open="comments"]
[data-gg-close="comments"]
```

## State contract

When open:

```txt
hidden = false
inert removed
aria-hidden = false
data-gg-state = open
body[data-gg-scroll-lock="true"]
```

When closed:

```txt
hidden = true
inert present
aria-hidden = true
data-gg-state = closed
body scroll lock removed unless another sheet is open
```

## Hash behavior

- `#comments` opens the comments sheet.
- `#comment-form` opens the comments sheet and composer.
- `#c123456789` opens the comments sheet and attempts to scroll that native comment into view.

## Do not include in this task

- comments sorting
- panel width toggle
- fallback feed
- fake submit
- custom delete API
- real-time polling
- infinite nested sheets

## Acceptance criteria

- Sheet opens from toolbar/dock/action button.
- Scrim, close button, Escape key, and handle close the sheet.
- Focus moves into the sheet on open and returns to the opener on close.
- Body scroll is locked only while needed.
- Native Blogger comments are not re-rendered or duplicated.
- Console has no uncaught errors when comments are unavailable on non-post pages.
