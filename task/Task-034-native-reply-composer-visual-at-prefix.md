# Task 034 — Native reply composer with visual @Author prefix

## Objective

Keep Blogger's native reply behavior, but enhance the UI so replies feel like Threads. When replying to Author C, the composer shows `Replying to @AuthorC`, and after the reply renders, GG visually displays `@AuthorC` before the comment text.

## Target files

- `gg-app.dev.js`
- `gg-app.dev.css`
- `index.xml` only if slots are missing

## Required behavior

When user clicks Reply on Author C:

```txt
1. GG records reply context: parent comment ID + parent author name.
2. GG triggers/clicks native Blogger reply affordance.
3. GG moves or reveals the single native composer in the active sheet footer.
4. GG shows banner: Replying to @AuthorC.
5. User types only the actual message in Blogger iframe.
6. GG does not inject @AuthorC into the iframe.
```

After Blogger re-renders or inserts the reply:

```txt
stored Blogger text:
halo author c

GG visual display:
@AuthorC halo author c
```

## Hard rule

Do not manipulate text inside `#comment-editor` iframe. The iframe is Blogger-owned and may be cross-domain.

## Visual prefix strategy

Add a non-destructive prefix outside the original comment text:

```html
<span class="gg-comment-reply-prefix" data-gg-reply-prefix="@AuthorC">@AuthorC</span>
```

Do not alter the actual native Blogger comment body text.

## Reply context source

Parent direct author should be used:

```txt
Author B replying to Author A => @AuthorA
Author C replying to Author B => @AuthorB
Author D replying to Author C => @AuthorC
```

Do not always point to the top-level author.

## Composer portal rule

There must be only one native composer:

```txt
#top-ce
#comment-editor-src
#comment-editor
```

If replies sheet is active, visually portal the composer slot to the replies sheet footer. When replies sheet closes, return it to the main comments footer.

## Acceptance criteria

- Reply banner appears with the direct parent author.
- User can submit without `@Author` being injected into the iframe text.
- Newly rendered reply visually shows the correct `@Author` prefix.
- Prefix disappears/recalculates correctly if DOM is rehydrated.
- Composer returns to main sheet footer after replies sheet closes.
- No second composer iframe is created.
