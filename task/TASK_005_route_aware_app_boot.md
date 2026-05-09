# TASK 005 — Route-aware app boot

## Context

The site must not initialize every controller on every route. A premium app-like layer is fine after first paint or user intent. It is not fine as a universal first-paint tax.

## Goal

Make frontend boot route-aware and intent-aware.

```text
Initial load should run only what the current route needs.
Heavy controllers/fetches must wait for route need, idle, or user action.
```

## Files to inspect

```text
src/js/gg-app.source.js
src/js/**/*
template/index.xml
template/partials/*.xml
store.html
landing.html
```

Adjust paths to actual repo.

## Required changes

### 1. Add route/surface detection

Use existing body attributes if present:

```js
var body = document.body;
var surface = body && body.dataset && body.dataset.ggSurface;
var page = body && body.dataset && body.dataset.ggPage;
var routeClass = body && body.dataset && body.dataset.ggRoute;
```

If not available, derive conservatively from DOM markers:

```text
[data-gg-surface]
[data-gg-page]
#store-static-products
article/post markers
listing markers
```

Do not make brittle URL-only logic the only route detector.

### 2. Create minimal boot dispatcher

Pseudo-structure:

```js
function initApp() {
  var route = resolveRouteContext();

  initThemePrebootSafe();
  initBasicPanelController();
  initBasicDockController();

  if (route.page === "landing") {
    initLandingMinimal(route);
    deferNonCritical(function () {
      initLandingEnhancements(route);
    });
    return;
  }

  if (route.surface === "store") {
    initStoreMinimal(route);
    deferNonCritical(function () {
      initStoreEnhancements(route);
    });
    return;
  }

  if (route.surface === "post") {
    initPostMinimal(route);
    deferNonCritical(function () {
      initPostEnhancements(route);
    });
    return;
  }

  if (route.surface === "listing") {
    initListingMinimal(route);
    deferNonCritical(function () {
      initListingEnhancements(route);
    });
    return;
  }

  initGenericMinimal(route);
}
```

### 3. Defer discovery/search feed work

Do not fetch or build large discovery index until:

```text
- user opens Search/Command sheet
- user focuses search input
- user types a query
- current route explicitly requires search results
```

Forbidden on homepage first load unless required:

```text
/feeds/posts/default?alt=json
/search?...max-results=999
large recent/discovery/fallback fetches
```

### 4. Defer preview enrichment

Preview sheet shell may exist in DOM. Preview data fetch/enrichment must wait until preview/open click.

### 5. Defer share enhancement

Static share links are allowed. Heavy copy/link/platform enhancement should wait until share click/open.

### 6. Defer comments via TASK 003

Do not regress lazy comments. Comments native load only after Comments sheet opens.

### 7. Defer Store enhancement

Static grid is first source of truth.

Defer:

```text
- live feed refresh
- filters beyond initial grid
- saved/bookmark state
- preview/sheet enrichment
```

### 8. Keep 404/search no-result light

No heavy discovery/fallback fetch before user input.

## Non-goals

- Do not fully modularize source in this task unless already easy.
- Do not redesign UI.
- Do not remove features.
- Do not change Worker cache policy.
- Do not change Material Symbols policy.

## Acceptance criteria

```text
- Homepage first load has no early unnecessary feed/discovery fetch.
- Post first load does not initialize comments.
- Store first load does not block on feed refresh.
- Landing first load defers non-critical animation/panel/outline work.
- Search/Command fetches only after user intent or explicit search route.
- No visible regression in dock/sheet basic behavior.
- No accessibility regression.
```

## Manual Network checks

Homepage:

```text
Open / with DevTools Network.
Before any interaction, no heavy /feeds or /search?max-results=999 fetch should appear.
```

Post:

```text
Open post detail.
Before comments click, no recaptcha/comment-editor/threaded_comments.
```

Store:

```text
Open /store.
Products visible from static HTML.
Feed refresh, if any, happens after first paint/idle.
```

Search:

```text
Open /search?q=zzzzzznotfound.
Empty state is visible and light.
No huge fallback/discovery fetch before user input unless route explicitly requires it.
```

## Suggested commit

```text
feat(perf): make app boot route-aware and intent-driven
```
