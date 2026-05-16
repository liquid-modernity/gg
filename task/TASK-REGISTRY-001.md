# TASK-REGISTRY-001 — Centralize Dock, More Sheet, and Discovery Route Contracts into a System Registry

## Status

Development task.

This task must be completed before `TASK-DISCOVERY-001`.

## Strategic Purpose

The current dock, More sheet, and Discovery behavior are spread across Blogger XML, landing HTML, store HTML, runtime JS, copy registries, QA guards, and Cloudflare/static artifacts. This makes every IA change too expensive and too fragile.

The goal is to create a registry-driven system where IA and route contracts are centralized, while sensitive behavior remains contract-coded and QA-guarded.

This task does **not** redesign the dock, More sheet, or Discovery UI. It centralizes their source of truth so the next Discovery task can be implemented safely.

## Non-Negotiables

- Do not modify threaded comment behavior.
- Do not modify Blogger native comment plumbing.
- Do not change `parentID`, native composer handling, replies sheet logic, or comment proof semantics.
- Do not change the public route truth:
  - `/landing` = Home / Beranda
  - `/` = Blog
  - `/store` = Store
  - `/landing#contact` = Contact / Kontak
- Do not expose the public label `Landing`.
- Do not introduce a dashboard, control plane, remote config, Google Sheet config, OAuth, Blogger API integration, or user-editable runtime config.
- Do not create free-form function execution from registry values.
- Do not weaken existing QA guards.
- Keep development robots/indexing policy unchanged.

## Core Architecture Decision

Use this model:

```txt
Registry-driven IA
Contract-coded behavior
Copy-driven language
QA-guarded output
```

Do **not** use this model:

```txt
Everything configurable
Everything dynamic
Everything editable
```

The registry may define route IDs, labels, item order, action IDs, href targets, section membership, visibility rules, discovery source IDs, and note placement.

The registry must not define executable functions.

## Required Registry Layers

### 1. Route Truth Registry

Create or centralize route truth.

Suggested file:

```txt
src/registry/gg-routes.registry.js
```

If the project prefers fewer files initially, this may be placed in:

```txt
src/js/gg-system-registry.js
```

Required route IDs:

```txt
home
blog
store
contact
search
more
sitemap
rss
about
privacy
terms
disclaimer
```

Required route truth:

```js
export const GG_ROUTES = {
  home: {
    id: "home",
    surface: "landing",
    href: "/landing",
    labelKey: "nav.home",
    publicName: "Home"
  },
  blog: {
    id: "blog",
    surface: "blog",
    href: "/",
    labelKey: "nav.blog",
    publicName: "Blog"
  },
  store: {
    id: "store",
    surface: "store",
    href: "/store",
    labelKey: "nav.store",
    publicName: "Store"
  },
  contact: {
    id: "contact",
    surface: "landing-section",
    href: "/landing#contact",
    labelKey: "nav.contact",
    publicName: "Contact"
  }
};
```

Add legal/info routes:

```txt
about       -> /p/about.html
privacy     -> /p/privacy-policy.html
terms       -> /p/terms-of-use.html
disclaimer  -> /p/disclaimer.html
```

Do not add Worker canonical rewrites in this task.

## 2. Dock Registry

Create or centralize dock order and surface-specific action IDs.

Suggested file:

```txt
src/registry/gg-dock.registry.js
```

Required global dock order:

```txt
Home | Contact | Search | Blog | More
```

Registry shape may follow this model:

```js
export const GG_DOCK = {
  order: ["home", "contact", "search", "blog", "more"],
  surfaces: {
    landing: {
      active: "home",
      actions: {
        home: "scrollTop",
        contact: "scrollToContact",
        search: "openGlobalDiscovery",
        blog: "navigateBlog",
        more: "openMore"
      }
    },
    blog: {
      active: "blog",
      actions: {
        home: "navigateHome",
        contact: "navigateContact",
        search: "openGlobalDiscovery",
        blog: "scrollTop",
        more: "openMore"
      }
    },
    detail: {
      active: "blog",
      actions: {
        home: "navigateHome",
        contact: "navigateContact",
        search: "openGlobalDiscovery",
        blog: "navigateBlog",
        more: "openMore"
      }
    },
    page: {
      active: null,
      actions: {
        home: "navigateHome",
        contact: "navigateContact",
        search: "openGlobalDiscovery",
        blog: "navigateBlog",
        more: "openMore"
      }
    },
    store: {
      active: null,
      actions: {
        home: "navigateHome",
        contact: "navigateContact",
        search: "openStoreDiscovery",
        blog: "navigateBlog",
        more: "openMore"
      }
    }
  }
};
```

Important behavior:

- On `/landing`, Home scrolls to top and does not reload.
- On `/`, Blog scrolls to top and does not reload.
- On `/store`, Search opens Store Discovery, not Global Discovery.
- On `/landing`, `/`, post detail, and page detail, Search opens Global Discovery.

## 3. Action Resolver Registry

Create a fixed action resolver.

Suggested file:

```txt
src/registry/gg-actions.registry.js
```

Allowed action IDs:

```txt
scrollTop
scrollToContact
navigateHome
navigateBlog
navigateStore
navigateContact
openMore
openGlobalDiscovery
openStoreDiscovery
openSitemap
openRss
```

Registry entries may reference only action IDs. They must not include inline functions.

Bad:

```js
{ onClick: () => window.location.href = "/landing" }
```

Good:

```js
{ action: "navigateHome" }
```

The resolver executes the action.

## 4. More Sheet Registry

Create or centralize More sheet IA.

Suggested file:

```txt
src/registry/gg-more.registry.js
```

Required More sheet structure:

```txt
Navigation
Discover
Info
Language
Appearance
Share site
Optional route note
Copyright
```

Registry model:

```js
export const GG_MORE_SHEET = {
  sections: [
    {
      id: "navigation",
      titleKey: "more.section.navigation",
      layout: "grid",
      items: ["home", "blog", "store", "contact"]
    },
    {
      id: "discover",
      titleKey: "more.section.discover",
      layout: "list",
      items: ["search", "sitemap", "rss"]
    },
    {
      id: "info",
      titleKey: "more.section.info",
      layout: "list",
      items: ["about", "privacy", "terms", "disclaimer"]
    },
    {
      id: "language",
      titleKey: "more.section.language",
      layout: "segmented",
      items: ["english", "indonesia"]
    },
    {
      id: "appearance",
      titleKey: "more.section.appearance",
      layout: "segmented",
      items: ["system", "light", "dark"]
    }
  ],
  routeNotes: {
    store: {
      key: "more.commerceNote",
      placement: "beforeCopyright"
    }
  }
};
```

Required route-specific note:

- Store route only shows `more.commerceNote`.
- Non-store routes must not show the commerce note unless the route explicitly contains commerce/affiliate content.

## 5. Discovery Registry Skeleton

Create the Discovery registry skeleton now, but do not fully rewrite Discovery in this task.

Suggested file:

```txt
src/registry/gg-discovery.registry.js
```

Required strategic split:

```txt
/landing + / + detail/page = Global Discovery
/store = Store Discovery
```

Registry model:

```js
export const GG_DISCOVERY = {
  global: {
    id: "global",
    surfaces: ["landing", "blog", "detail", "page"],
    titleKey: "discovery.title",
    placeholderKey: "discovery.global.placeholder",
    filters: ["all", "articles", "topics", "routes", "sections", "actions"],
    sources: ["articles", "topics", "routes", "landingSections", "actions"],
    commandPlacement: "bottom"
  },
  store: {
    id: "store",
    surfaces: ["store"],
    titleKey: "discovery.store.title",
    placeholderKey: "discovery.store.placeholder",
    filters: ["all", "products", "categories", "routes"],
    sources: ["products", "categories", "storeRoutes"],
    commandPlacement: "bottom"
  }
};
```

This task may only introduce the contract and references. The full Discovery behavior rewrite belongs to `TASK-DISCOVERY-001`.

## 6. Copy Registry Requirements

Ensure required keys exist in both:

```txt
registry/copy/gg-copy-en.json
registry/copy/gg-copy-id.json
```

Also keep root copy files synchronized if the build still uses them:

```txt
gg-copy-en.json
gg-copy-id.json
```

Required keys:

### Navigation

```txt
nav.home
nav.blog
nav.store
nav.contact
nav.search
nav.more
```

### More Sheet

```txt
more.title
more.section.navigation
more.section.discover
more.section.info
more.section.language
more.section.appearance
more.search
more.sitemap
more.rss
more.about
more.privacy
more.terms
more.disclaimer
more.shareSite
more.commerceNote
```

### Appearance

```txt
appearance.system
appearance.light
appearance.dark
```

If the code currently uses `theme.system`, `theme.light`, and `theme.dark`, either normalize to `appearance.*` or create a compatibility bridge. Do not silently break existing UI.

### Language

```txt
language.english
language.indonesia
```

### Discovery Skeleton

```txt
discovery.title
discovery.store.title
discovery.global.placeholder
discovery.store.placeholder
discovery.filter.all
discovery.filter.articles
discovery.filter.topics
discovery.filter.routes
discovery.filter.sections
discovery.filter.actions
discovery.filter.products
discovery.filter.categories
discovery.empty.title
discovery.empty.body
```

## 7. Build Integration

The registry must be available to:

- Blogger template build / publish artifact where needed;
- landing static surface;
- store static surface;
- runtime JS;
- QA guards.

Do not duplicate route/order definitions separately in root, landing, and store if a central registry can emit or expose them.

Acceptable transitional implementation:

- registry is introduced as source of truth;
- existing HTML still contains rendered output;
- QA verifies rendered output matches registry;
- full renderer consolidation can be deferred.

Unacceptable implementation:

- registry exists but is not used by anything;
- old hardcoded dock/sheet definitions remain authoritative;
- QA checks continue to assert stale contracts.

## 8. QA Requirements

Update or add:

```txt
qa/nav-more-contract-guard.mjs
qa/discovery-contract-guard.mjs
```

The guard must validate:

- public UI does not expose `Landing` as a nav label;
- dock order is `home, contact, search, blog, more`;
- `/landing` Home action is `scrollTop`;
- `/` Blog action is `scrollTop`;
- `/store` Search action is `openStoreDiscovery`;
- `/landing` and `/` Search action is `openGlobalDiscovery`;
- More sheet sections are `navigation`, `discover`, `info`, `language`, `appearance`;
- More sheet Navigation items include `home`, `blog`, `store`, `contact`;
- More sheet Info items include `about`, `privacy`, `terms`, `disclaimer`;
- store-only commerce note is configured only for store;
- Global Discovery surfaces include landing and blog;
- Store Discovery surface includes store only.

## Required Commands

Run:

```bash
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run gaga:verify-nav-more
npm run store:build
npm run store:proof
npm run ci:cloudflare
```

If added:

```bash
npm run gaga:verify-discovery-contract
```

## Manual Proof

Routes:

```txt
/
/landing
/store
one post detail
one static page detail
```

Check:

- dock order unchanged;
- More sheet unchanged visually from accepted TASK-NAV-001 state;
- Store note still appears only in `/store`;
- Search still opens the current existing discovery implementations;
- no threaded comments regression.

## Acceptance Criteria

Task is accepted only if:

- route truth is centralized;
- dock contract is registry-driven;
- More sheet IA is registry-driven;
- Discovery split contract exists:
  - `/` + `/landing` + detail/page = Global Discovery;
  - `/store` = Store Discovery;
- registry values are QA-guarded;
- output remains visually equivalent to accepted TASK-NAV-001;
- CI/CD still passes;
- no threaded comment behavior changes.

## Required Final Report

```txt
TASK-REGISTRY-001 completed.

Changed:
- Route truth registry added/centralized: YES/NO
- Dock registry added/centralized: YES/NO
- More sheet registry added/centralized: YES/NO
- Discovery registry skeleton added: YES/NO
- Action resolver added/centralized: YES/NO
- Copy registry updated: YES/NO
- QA guard updated/added: YES/NO
- Visual dock/More behavior changed intentionally: NO
- Threaded comments behavior changed: NO

Verification:
- npm run gaga:template:pack: PASS/FAIL
- npm run gaga:verify-comments-proof: PASS/FAIL
- node qa/copy-registry-guard.mjs: PASS/FAIL
- npm run gaga:verify-nav-more: PASS/FAIL
- npm run store:build: PASS/FAIL
- npm run store:proof: PASS/FAIL
- npm run ci:cloudflare: PASS/FAIL
- discovery contract guard if added: PASS/FAIL

Notes:
- Any intentionally deferred renderer consolidation.
- Any compatibility aliases retained, e.g. theme.* vs appearance.*.
```

## Out of Scope

- Discovery UI rewrite.
- Search algorithm rewrite.
- Store product search redesign.
- More sheet redesign.
- Dock redesign.
- Threaded comments.
- Worker canonical rewrites.
- Control plane / dashboard.
- Lighthouse thresholds.

---
