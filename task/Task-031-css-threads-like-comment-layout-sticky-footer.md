# Task 031 — Build Threads-like comment layout and sticky native composer footer

## Objective

Make Blogger native comments feel like a Threads-style conversation UI while keeping the DOM native and lightweight.

## Target files

- `gg-app.dev.css`
- extracted production CSS equivalent if present

## UX target

Comment row format:

```txt
Author A • More
Komentar utama
Reply
Lihat 7 balasan
```

Replies sheet format:

```txt
Author B • More
Balasan
Reply

│ Author C • More
│ Balasan level 2
│ Reply

│   Author D • More
│   Balasan level 3
│   Reply
```

## CSS requirements

1. Use row-based layout, not heavy cards.
2. Avatar on the left, content on the right.
3. Author and timestamp on the same top line where possible.
4. Action row minimal: prefer `Reply`; put `Copy link` and `Delete comment` in More menu.
5. Use visual thread guides only inside the replies sheet.
6. Main sheet should show top-level comments only and a compact `View/Lihat replies` affordance.
7. Composer footer must be sticky.

## Composer footer CSS pattern

```css
#gg-comments-footer,
.gg-comments__footer {
  position: sticky;
  bottom: 0;
  z-index: 8;
  padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--gg-divider);
  background: var(--gg-surface-panel);
}
```

## Comment row CSS pattern

```css
.gg-comments .comment {
  display: grid;
  grid-template-columns: var(--gg-comment-avatar-size, 36px) minmax(0, 1fr);
  gap: var(--gg-comment-gap, 12px);
  padding: var(--gg-comment-pad-y, 16px) 0;
  border-bottom: 1px solid var(--gg-comment-divider, var(--gg-divider));
}

.gg-comments .avatar-image-container {
  grid-column: 1;
  width: var(--gg-comment-avatar-size, 36px);
  height: var(--gg-comment-avatar-size, 36px);
  border-radius: 999px;
  overflow: hidden;
}

.gg-comments .comment-block,
.gg-comments .comment-header,
.gg-comments .comment-body,
.gg-comments .comment-content,
.gg-comments .comment-footer,
.gg-comments .comment-actions {
  grid-column: 2;
  min-width: 0;
}
```

## Performance constraints

- Animate only `transform` and `opacity`.
- Avoid large `backdrop-filter` on low-end paths.
- Do not introduce image/icon libraries.
- Do not increase initial CSS with duplicated legacy blocks.

## Acceptance criteria

- Main comments sheet remains readable on 360px width.
- Sticky footer does not cover the last comment; add bottom padding to scroll area.
- Comment body wraps long URLs/usernames safely.
- Native Blogger delete and reply elements remain in DOM.
- Reduced-motion mode disables or shortens motion.
