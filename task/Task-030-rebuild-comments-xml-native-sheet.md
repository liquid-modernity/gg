# Task 030 — Rebuild XML/SSR comments sheet while preserving Blogger native engine

## Objective

Rebuild the comments XML skeleton so Blogger native threaded comments live inside a GG bottom sheet, without replacing Blogger's comment engine.

## Target files

- `index.xml`
- any Blogger XML/theme partials that define `threadedComments`, `threadedCommentForm`, or post toolbar actions

## Required structure

Create or migrate to this conceptual structure:

```xml
<div id='gg-comments-sheet'
     class='gg-comments-sheet'
     data-gg-sheet='comments'
     data-gg-module='gg-comments-sheet'
     hidden='hidden'
     inert=''
     tabindex='-1'>

  <button class='gg-comments-sheet__scrim'
          data-gg-action='comments-close'
          type='button'>
    <span class='gg-visually-hidden'>Dismiss comments</span>
  </button>

  <section class='gg-comments-sheet__panel'
           aria-labelledby='gg-comments-title'
           aria-modal='true'
           role='dialog'
           tabindex='-1'>

    <header class='gg-comments-sheet__head'>
      <button class='gg-comments-sheet__handle'
              data-gg-action='comments-close'
              type='button'>
        <span class='gg-visually-hidden'>Dismiss comments</span>
      </button>
      <h2 id='gg-comments-title'>Comments</h2>
    </header>

    <section id='gg-comments-root'
             class='gg-comments comments2 threaded'
             data-gg-module='gg-comments'
             data-gg-comment-engine='blogger-native'
             expr:data-num-comments='data:post.numberOfComments'>

      <a id='comments' name='comments'></a>

      <div class='gg-comments__content'>
        <div id='gg-comments-list'
             class='gg-comments__list'
             data-gg-role='comments-list'>
          <data:post.commentHtml/>
        </div>
      </div>

      <footer id='gg-comments-footer'
              class='gg-comments__footer'
              data-gg-role='comments-footer'>
        <button type='button' data-gg-action='comments-open-composer'>Add comment</button>
        <div id='gg-comments-reply-slot' data-gg-slot='gg-comments-reply'></div>
        <div id='gg-comments-composer-slot' data-gg-slot='gg-comments-composer'>
          <div id='gg-comments-composer' class='gg-comments__composer'>
            <div id='top-ce' class='comment-form' data-gg-native-plumbing='composer'>
              <a id='comment-editor-src' expr:href='data:post.commentFormIframeSrc'></a>
              <iframe id='comment-editor' name='comment-editor'></iframe>
              <data:post.cmtfpIframe/>
              <script type='text/javascript'>BLOG_CMT_createIframe('<data:post.appRpcRelayPath/>');</script>
            </div>
          </div>
        </div>
      </footer>
    </section>
  </section>
</div>
```

## Important constraints

- Keep `data:post.commentHtml` as the only comment HTML source.
- Keep Blogger's threaded comment form and iframe plumbing native.
- Do not create a second iframe composer.
- Do not create custom submit logic.
- Do not remove native delete controls.

## Toolbar/action migration

Update comments open buttons to prefer:

```html
<button data-gg-action="comments-open" aria-controls="gg-comments-sheet">
```

Legacy `data-gg-postbar="comments"` may remain temporarily but should call the same opener.

## Acceptance criteria

- On post pages, comments render inside the GG bottom sheet.
- `#comment-editor-src`, `#comment-editor`, `#top-ce`, and `BLOG_CMT_createIframe(...)` still exist exactly once.
- `data:post.commentHtml` remains the rendered comment source.
- The sheet is hidden and inert by default.
- `#comments` hash opens the sheet and points to the native anchor.
