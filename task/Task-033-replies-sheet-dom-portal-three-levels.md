# Task 033 — Add replies sheet with DOM portal and 3 visual reply levels

## Objective

Add a secondary replies sheet so the main comments sheet stays spacious. The main sheet should show top-level comments only plus a `View/Lihat X replies` control. Replies open in a child sheet above the main comments sheet.

## Target files

- `index.xml`
- `gg-app.dev.css`
- `gg-app.dev.js`
- production equivalents if present

## UX target

Main sheet:

```txt
Author A • More
Komentar utama
Reply
Lihat 7 balasan
```

Replies sheet:

```txt
← Replies
Author A
Komentar utama
7 balasan

Author B • More
Balasan level 1
Reply

│ Author C • More
│ Balasan level 2
│ Reply

│   Author D • More
│   Balasan level 3
│   Reply
```

## Required structure

Add one child sheet:

```html
<div id="gg-comment-replies-sheet"
     class="gg-comments-sheet gg-comments-sheet--replies"
     data-gg-sheet="comment-replies"
     hidden
     inert>
</div>
```

## Implementation strategy

Use DOM portal, not cloning, for native reply nodes:

```txt
original .comment-replies
↓
move temporarily into replies sheet
↓
when replies sheet closes, restore to original placeholder
```

## Why DOM portal

- preserves native Blogger reply/delete behavior
- avoids duplicated IDs
- avoids building a second comment data model
- avoids feed fetching

## Rules

1. Only one replies sheet may be active at a time.
2. Store the original parent node and next sibling before moving nodes.
3. Restore exactly on close.
4. Do not clone nodes that contain native reply/delete controls.
5. Do not create another `#comment-editor`.
6. Limit visual indentation to 3 levels.
7. Level 4+ should display as compressed level 3, not deeper.

## Main sheet top-level filtering

The main sheet should visually collapse nested `.comment-replies` under each top-level comment and replace them with a button:

```html
<button type="button"
        data-gg-action="comments-open-replies"
        data-gg-reply-count="7">
  Lihat 7 balasan
</button>
```

## Acceptance criteria

- Main sheet shows top-level comments without becoming narrow.
- Replies sheet opens for a selected parent comment.
- Replies sheet displays up to 3 visual nested levels.
- Closing replies sheet restores native DOM exactly.
- Native reply/delete still works after opening and closing replies sheet.
- No duplicate IDs are created.
