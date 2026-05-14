# Comments Proof QA Checklist

Run on a post with Blogger comments enabled:

1. Open the comments sheet from the toolbar or dock.
2. Close via handle, scrim, close action, and Escape.
3. Open via the `#comments` hash.
4. Open a top-level comment's replies sheet.
5. Reply to level 1, level 2, and level 3 comments.
6. Confirm the banner says `Replying to @DirectParent`.
7. Submit a reply using the Blogger iframe.
8. Confirm the visual `@` prefix appears after render.
9. Copy a comment link from the More menu.
10. Confirm Delete appears only when Blogger native delete exists.
11. Close the replies sheet and confirm the DOM is restored.
12. Reopen comments and confirm no duplicate iframe exists.

Browser diagnostic:

```js
GG.commentsProof()
```

Expected on a valid post page:

```js
GG.commentsProof().ok === true
```
