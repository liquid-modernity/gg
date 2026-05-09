# Task 035 — Add comment More menu with copy link and native delete delegation

## Objective

Add a Threads-like `More` button to each comment row. The menu should expose `Copy link` and `Delete comment`, but delete must delegate to Blogger's native delete affordance.

## Target files

- `gg-app.dev.js`
- `gg-app.dev.css`
- `index.xml` only if markup hooks are needed

## UI target

```txt
Author A • More
Komentar utama
Reply
```

More menu:

```txt
Copy link
Delete comment   only when native Blogger delete exists
```

## Copy link behavior

1. Resolve the comment ID from native comment element:

```txt
#c123456789
```

2. Build permalink:

```txt
currentPostUrl + '#c123456789'
```

3. Copy via Clipboard API, with textarea fallback.
4. Show small toast/status text.

## Delete behavior

Never invent delete permission.

Only show `Delete comment` if one of these exists inside the native comment node:

```txt
.item-control
.comment-delete
.goog-toggle-button
```

When clicked:

```txt
1. Prefer clicking native `.comment-delete` link if present.
2. Else click Blogger native more/delete control if present.
3. Do not remove comment from DOM manually before Blogger confirms.
4. Do not fake success.
```

## Accessibility

- More button must have `aria-haspopup="menu"`.
- Menu must close on Escape, outside click, and after action.
- Keyboard navigation must work with Tab/Shift+Tab.

## Performance

Use event delegation from the comments root. Do not bind individual listeners to every comment unless unavoidable.

## Acceptance criteria

- Every visible comment row can show a More menu.
- Copy link copies the correct comment hash URL.
- Delete appears only for comments with native delete affordance.
- Native `.item-control` and `.comment-delete` are not removed from DOM.
- Menu works in main sheet and replies sheet.
