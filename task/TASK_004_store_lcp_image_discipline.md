# TASK 004 — Store LCP and image discipline

## Context

`/store` must be static-first, fast, and resilient. Product images are likely LCP candidates. Placeholder/remote redirect images such as Picsum are acceptable during crude prototyping only, not production/staging strict audit.

## Goal

```text
- Store first paint uses static prerendered product grid.
- Only first/LCP product image is eager/high-priority.
- Other images are lazy.
- Placeholder image domains are blocked outside development.
- LCP preload matches final rendered image URL.
```

## Files to inspect

```text
store.html
templates/store.html.tpl
src/store/**/*
assets/store/**/*
scripts/store*.js
scripts/build*.js
scripts/build*.mjs
config/store.config.json
```

Adjust paths to actual repo.

## Required changes

### 1. Production/staging strict image gate

Fail build or preflight if Store product images use any of these outside development:

```text
picsum.photos
fastly.picsum.photos
dummyimage.com
placehold.co
placeholder.com
data:image
blob:
localhost
127.0.0.1
```

Allowed in development only if explicitly configured:

```json
{
  "store": {
    "allowPlaceholderImagesInDevelopment": true
  }
}
```

Do not allow placeholders in staging/performanceAudit or production.

### 2. Self-hosted image policy

Preferred path:

```text
/assets/store/img/
```

Support responsive variants:

```text
/assets/store/img/product-slug-360.webp
/assets/store/img/product-slug-540.webp
/assets/store/img/product-slug-720.webp
/assets/store/img/product-slug-900.webp
```

### 3. Render responsive images

For LCP/first product image:

```html
<img
  src="/assets/store/img/product-slug-540.webp"
  srcset="/assets/store/img/product-slug-360.webp 360w, /assets/store/img/product-slug-540.webp 540w, /assets/store/img/product-slug-720.webp 720w, /assets/store/img/product-slug-900.webp 900w"
  sizes="(max-width: 680px) 86vw, 280px"
  width="540"
  height="675"
  loading="eager"
  fetchpriority="high"
  decoding="async"
  alt="..."
>
```

For all other product images:

```html
<img
  src="/assets/store/img/product-slug-540.webp"
  srcset="..."
  sizes="(max-width: 680px) 86vw, 280px"
  width="540"
  height="675"
  loading="lazy"
  decoding="async"
  alt="..."
>
```

### 4. Preload only one product image

If preloading product image, only preload the LCP candidate.

```html
<link
  rel="preload"
  as="image"
  href="/assets/store/img/product-slug-540.webp"
  imagesrcset="/assets/store/img/product-slug-360.webp 360w, /assets/store/img/product-slug-540.webp 540w, /assets/store/img/product-slug-720.webp 720w, /assets/store/img/product-slug-900.webp 900w"
  imagesizes="(max-width: 680px) 86vw, 280px"
  fetchpriority="high"
>
```

Do not preload below-the-fold images.

### 5. Static-first grid

Store product cards must be visible without JavaScript.

```text
- Static HTML product grid exists.
- ItemList JSON-LD exists.
- Runtime feed enhancement is optional and delayed.
- JS disabled still shows products.
```

### 6. Store runtime fetch defer

Do not block first render on Blogger feed fetch.

If feed refresh exists, run after first paint/idle:

```js
function deferStoreEnhancement(callback, timeout) {
  var wait = typeof timeout === "number" ? timeout : 1200;
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout: wait });
  } else {
    window.setTimeout(callback, Math.min(wait, 800));
  }
}

deferStoreEnhancement(function () {
  // optional feed refresh, filter enhancement, saved state
});
```

## Non-goals

- Do not redesign Store UI.
- Do not build affiliate integration.
- Do not implement dashboard Store editor.
- Do not rewrite Worker route mapping unless required by TASK 000.
- Do not remove Material Symbols; use subset from TASK 001.

## Acceptance criteria

```text
- Only first product image is eager/high priority.
- Other product images are lazy.
- No production/staging strict build contains Picsum/dummy/placeholder product images.
- LCP preload URL matches rendered first product image URL/srcset.
- Store grid visible with JS disabled.
- Store ItemList JSON-LD remains valid.
- /store mobile Lighthouse improves meaningfully; aim for >=75 and LCP <3.0s after full phase.
```

## QA commands

```bash
grep -R "picsum\|fastly.picsum\|dummyimage\|placehold\|data:image\|blob:" dist .cloudflare-build public assets/store || true
```

Fail if any are found in staging/performanceAudit/production output.

Manual:

```text
Chrome DevTools > Network > Img
Confirm only one high-priority/eager Store image.
Confirm no mass preload.
Confirm no redirect chain for LCP image.
```

## Suggested commit

```text
feat(perf): enforce store image and LCP discipline
```
