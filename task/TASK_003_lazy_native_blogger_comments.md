# TASK 003 — Lazy-load native Blogger comments when Comments sheet opens

## Context

Post detail pages must keep Blogger SSR for article content, metadata, schema, author/date/taxonomy, and native comment capability.

The problem: native Blogger comments, comment iframe, threaded comment scripts, and reCAPTCHA must not load during initial post first paint.

Hidden UI is not enough. If scripts/iframes load while hidden, the task failed.

## Goal

```text
Initial post load:
- article readable
- comment count/button visible
- comments sheet shell present
- no native comment iframe/form/script/recaptcha active

After user opens Comments sheet:
- native Blogger comments activate
- reply/comment behavior works
```

## Files to inspect

```text
template/partials/*comments*.xml
template/partials/12-post-detail-comments.xml
template/index.xml
src/js/**/*comments*.js
src/js/gg-app.source.js
src/css/**/*comments*.css
```

Adjust paths to actual repo.

## Required changes

### 1. Preserve visible comment affordance

Allowed on first paint:

```text
- Comments button
- Comment count
- Empty comments panel shell
- Loading placeholder text
```

Not allowed on first paint:

```text
- comment-editor iframe
- recaptcha script
- threaded_comments script
- native Blogger comment form activation
```

### 2. Move native commentPicker into inert template

Replace direct comment rendering inside sheet with an inert template or equivalent lazy island.

Example target pattern:

```xml
<div
  class='gg-comments gg-comments--sheet'
  id='gg-comments-mount'
  data-gg-comments-state='idle'
>
  <div class='gg-comments__placeholder'>
    <p>Komentar akan dimuat saat panel dibuka.</p>
  </div>
</div>

<template id='gg-comments-native-template'>
  <b:include cond='data:view.isSingleItem' data='post' name='commentPicker'/>
</template>
```

If Blogger XML parser rejects this exact structure, use the closest safe inert strategy and document it.

### 3. Add activation logic

Add a dedicated comments adapter/controller if possible:

```text
src/js/adapters/blogger-comments-adapter.js
src/js/controllers/comments-controller.js
```

If the current app is still monolithic, add clearly isolated functions with TODO for later extraction.

Required functions:

```js
function replayScripts(root) {
  var scripts = Array.prototype.slice.call(root.querySelectorAll("script"));

  return scripts.reduce(function (chain, oldScript) {
    return chain.then(function () {
      return new Promise(function (resolve) {
        var script = document.createElement("script");
        var attrs = Array.prototype.slice.call(oldScript.attributes);

        attrs.forEach(function (attr) {
          if (attr.name !== "async") {
            script.setAttribute(attr.name, attr.value);
          }
        });

        script.async = false;

        if (oldScript.src) {
          script.onload = resolve;
          script.onerror = resolve;
          script.src = oldScript.src;
        } else {
          script.text = oldScript.textContent || "";
          resolve();
        }

        oldScript.parentNode.replaceChild(script, oldScript);
      });
    });
  }, Promise.resolve());
}

function ensureNativeCommentsLoaded() {
  var mount = document.getElementById("gg-comments-mount");
  var template = document.getElementById("gg-comments-native-template");

  if (!mount || !template) return Promise.resolve(false);

  if (mount.getAttribute("data-gg-comments-state") === "ready") {
    return Promise.resolve(true);
  }

  if (mount.getAttribute("data-gg-comments-state") === "loading") {
    return Promise.resolve(false);
  }

  mount.setAttribute("data-gg-comments-state", "loading");
  mount.innerHTML = "";

  var fragment = template.content.cloneNode(true);
  mount.appendChild(fragment);

  return replayScripts(mount).then(function () {
    mount.setAttribute("data-gg-comments-state", "ready");
    return true;
  }).catch(function () {
    mount.setAttribute("data-gg-comments-state", "error");
    mount.innerHTML = "<p>Comments failed to load. Please refresh this page.</p>";
    return false;
  });
}
```

### 4. Bind to Comments sheet open event

When Comments sheet opens:

```js
openPanel("comments", {
  trigger: commentsTrigger,
  reason: "comments-trigger"
});
ensureNativeCommentsLoaded();
```

If `openPanel` is async, run after open resolves.

Do not load comments on post page init.

### 5. Accessibility and fallback

```text
- Comments button must remain keyboard-accessible.
- Loading/error states must be readable.
- Escape close behavior must remain intact.
- Article must remain readable without JS.
```

## Non-goals

- Do not redesign comment UI.
- Do not replace Blogger native comments with a custom comment system.
- Do not remove comments.
- Do not move article SSR into JS.
- Do not solve comment SEO in this task.

## Acceptance criteria

### Initial post load network must not include

```text
recaptcha
comment-editor
threaded_comments
comment-iframe
```

### After opening Comments sheet

```text
- native comments render
- comment/reply behavior works as before
- scripts/iframes may load only after user intent
```

### Performance target

```text
Post detail mobile performance should improve meaningfully.
Aim for >=75 after this and related boot tasks.
TBT should drop compared with baseline.
```

## Manual test protocol

1. Open a post detail page in Chrome DevTools.
2. Network tab: disable cache.
3. Reload page.
4. Filter network by:

```text
recaptcha|comment|threaded|iframe
```

5. Confirm no native comment resources load initially.
6. Click/open Comments sheet.
7. Confirm comment resources load after click.
8. Confirm native Blogger comments still function.

## Suggested commit

```text
feat(perf): lazy-load native Blogger comments on intent
```
