# TASK-DISCOVERY-002 — Consolidate Global Discovery Builder Across Blogger Root and Landing

## Status

Development task.

Run this after the Discovery first-render stabilization fix and after `TASK-STORE-ISOLATION-001` if possible.

## Strategic Purpose

`TASK-DISCOVERY-001` made Global Discovery functional on `/` and `/landing`, but functional parity is not enough.

Remaining architectural problem:

```txt
/ and /landing can still look aligned while relying on separate Global Discovery builders or duplicated arrays.
```

This task removes that drift risk.

The goal is source-of-truth consolidation, not visual redesign.

## Non-Negotiables

- Do not redesign Discovery UI.
- Do not move mobile search input to the top.
- Do not change bottom command behavior.
- Do not change dock order.
- Do not change More sheet IA.
- Do not change threaded comments.
- Do not modify Blogger native comment plumbing.
- Do not change `/store` into Global Discovery.
- Do not merge Store Discovery into Global Discovery.
- Do not expose `Landing` as a public label.
- Do not introduce a remote search backend.
- Do not add heavy dependencies.
- Do not edit `src/js/modules` unless the build actually consumes those files into `src/js/gg-app.source.js`.
- Do not leave duplicate Global Discovery arrays in both root app runtime and `landing.html`.
- Do not break Blog1.

## Current Build Reality

The current active JS source is:

```txt
src/js/gg-app.source.js
```

`tools/template-pack.mjs` emits:

```txt
__gg/assets/js/gg-app.dev.js
__gg/assets/js/gg-app.min.js
dist/assets/js/gg-app.dev.js
dist/assets/js/gg-app.min.js
```

Therefore, changes must affect `src/js/gg-app.source.js` and generated assets.

If `src/js/modules` contains similar code but is not bundled into `src/js/gg-app.source.js`, do not rely on it as source of truth in this task.

## Definition of 100% Shared Global Discovery Index

`/` and `/landing` can be called 100% shared only if these are true:

```txt
same route items
same landing section items
same action items
same article feed limit
same topic/label extraction rules
same normalized item model
same priority/order rules
same filter definitions
same resolver action IDs
same empty state rules
same copy keys
same Store-content exclusion rules
```

The two surfaces may resolve some actions differently by current route, but the underlying item index must be shared.

Example:

- `Contact` item exists once in the Global Discovery index.
- From `/landing`, it scrolls to `#contact`.
- From `/`, it navigates to `/landing#contact`.

That resolver difference is allowed.

Duplicated items or duplicated arrays that merely look similar are not allowed.

## Required Architecture

Implement a shared Global Discovery builder that both `/` and `/landing` consume.

Acceptable implementation patterns:

### Option A — Shared runtime builder

Create a centralized Global Discovery builder in the active runtime source.

Suggested shape:

```js
const GG_GLOBAL_DISCOVERY_CONFIG = {
  feedMax: 80,
  filters: ["all", "articles", "topics", "routes", "sections", "actions"],
  routeIds: ["home", "blog", "store", "contact"],
  sectionIds: ["hero", "structure", "routes", "interaction", "discoverability", "contact"],
  actionIds: ["contactPakrpp", "openMore", "openStore", "openBlog"]
};

function buildGlobalDiscoveryBaseItems(context) {}
function normalizeGlobalDiscoveryItem(raw, context) {}
function resolveGlobalDiscoveryItem(item, context) {}
```

Both `/` and `/landing` must use these shared functions or generated output from these functions.

### Option B — Shared generated manifest

Create a generated static manifest consumed by both root and landing.

Example:

```txt
__gg/data/global-discovery.json
```

or an embedded generated payload in the Blogger artifact and landing surface.

If using this approach, add a generator/proof so the manifest is deterministic and both surfaces consume the same IDs.

### Option C — Transitional shared constants + parity guard

If full runtime consolidation is too risky, extract all static Global Discovery constants into one shared registry/config and force both root and landing to read from it.

Minimum shared constants:

```txt
feedMax
routeIds
sectionIds
actionIds
filterIds
item priority/order
copy keys
Store exclusion rules
```

This option is acceptable only if QA proves no drift.

## Required Shared Global Discovery Config

Create or centralize:

```txt
GLOBAL_DISCOVERY_FEED_MAX = 80
GLOBAL_DISCOVERY_FILTERS = all, articles, topics, routes, sections, actions
GLOBAL_DISCOVERY_ROUTES = home, blog, store, contact
GLOBAL_DISCOVERY_SECTIONS = hero/intro, structure, routes, interaction, discoverability, contact
GLOBAL_DISCOVERY_ACTIONS = contactPakrpp, openMore, openStore, openBlog
```

Use actual section IDs from the current landing surface. If a section ID differs, keep the actual ID but ensure both `/` and `/landing` use the same list.

Do not leave `/landing` at `max-results=24` if `/` uses `max-results=80`.

## Content Domain Clustering Dependency

Global Discovery must use the Store classifier from `TASK-STORE-ISOLATION-001` or an equivalent centralized classifier.

Global Discovery must exclude Store-domain articles/topics.

Store may still appear in Global Discovery as:

```txt
route
action
```

Store must not appear in Global Discovery as:

```txt
article
topic
```

## Required Normalized Item Model

Both `/` and `/landing` must consume normalized items equivalent to:

```js
{
  id: "string",
  domain: "global",
  type: "article" | "topic" | "route" | "section" | "action",
  title: "string",
  meta: "string",
  href: "string optional",
  action: "actionId optional",
  target: "string optional",
  keywords: ["string"],
  priority: 0
}
```

The renderer must not need separate landing-specific and blog-specific item formats.

## Required Resolver Contract

Same Global Discovery item, context-aware behavior.

### Home

- From `/landing`: scroll to top.
- From `/`: navigate to `/landing`.
- From detail/page: navigate to `/landing`.

### Blog

- From `/`: scroll to top.
- From `/landing`: navigate to `/`.
- From detail/page: navigate to `/`.

### Contact

- From `/landing`: scroll to `#contact`.
- From `/`: navigate to `/landing#contact`.
- From detail/page: navigate to `/landing#contact`.

### Store

- From all Global Discovery surfaces: navigate to `/store`.

Resolver logic must be centralized or parity-guarded.

Do not duplicate route-specific click behavior in separate root and landing discovery renderers.

## Required First Render Behavior

The Global Discovery result area must never be blank on first open.

Required synchronous base items:

```txt
Home
Blog
Store
Contact
Landing sections
Actions
```

Article/topic feed may enhance asynchronously, but routes/sections/actions must render immediately.

If feed fails, Global Discovery must still show base items.

## Store Discovery Boundary

Do not refactor Store Discovery beyond compatibility with shared shell contracts.

Store remains independent:

```txt
/store = Store Discovery
content = products, categories, store routes, store actions
```

Do not inject landing sections into Store Discovery as primary results.
Do not make Store consume Global Discovery index.

## Guard Requirements

Strengthen `qa/discovery-contract-guard.mjs`.

The guard must fail if:

- `/` and `/landing` use different Global Discovery feed max values;
- `/landing` has a separate `max-results=24` while root uses `80`;
- root and landing route IDs differ;
- root and landing section IDs differ;
- root and landing action IDs differ;
- root and landing filter IDs differ;
- `landing.html` contains a separate hardcoded Global Discovery route/section/action array not derived from shared config;
- first-render static base item IDs are missing;
- `createGlobalDiscoveryItem` or equivalent can throw on missing optional fields;
- `searchText(` undefined-helper bug returns;
- Global Discovery includes Store-domain articles/topics;
- `/landing` keeps a top-search default shell;
- public `Landing` appears as nav/discovery label.

The guard should check source/static parity, not only marker presence.

## Optional Runtime Debug Helper

Add a safe read-only helper if useful:

```js
window.GG.discoveryProof()
```

Suggested output:

```js
{
  domain: "global",
  resultCount: number,
  baseCount: number,
  articleCount: number,
  routeIds: [...],
  sectionIds: [...],
  actionIds: [...],
  activeFilter: "all",
  hasBlankFirstRender: false
}
```

## Required QA Commands

Run:

```bash
npm run gaga:verify-discovery-contract
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run gaga:verify-nav-more
npm run store:build
npm run store:proof
npm run ci:cloudflare
git diff --check
```

If added:

```bash
npm run gaga:verify-store-isolation
```

## Manual Browser Proof

Test after hard refresh / cache clear.

Routes:

```txt
/
/landing
/store
one post detail
one static page detail
```

### `/`

Open Search.

Required:

- result area is not blank;
- Home exists;
- Blog exists;
- Store exists;
- Contact exists;
- section/action results exist;
- filters work;
- input stays bottom-positioned;
- no console error from `createGlobalDiscoveryItem`;
- no console error from `searchText`;
- no Store product appears as Global Article/Topic.

### `/landing`

Open Search.

Required:

- same Global Discovery domain as `/`;
- same required base item IDs as `/`;
- result area is not blank;
- Contact resolves by scrolling to `#contact`;
- Home resolves by scrolling to top;
- Blog resolves to `/`;
- Store resolves to `/store`.

### `/store`

Open Search.

Required:

- Store Discovery opens;
- product/category/store routes appear;
- landing section results do not dominate;
- shell rhythm matches Global Discovery.

## Console Proof

On `/`, after opening Search:

```js
setTimeout(() => {
  const text = document.body.innerText;
  console.log({
    hasHome: text.includes('Home') || text.includes('Beranda'),
    hasBlog: text.includes('Blog'),
    hasStore: text.includes('Store'),
    hasContact: text.includes('Contact') || text.includes('Kontak')
  });
}, 800);
```

Required:

```js
{
  hasHome: true,
  hasBlog: true,
  hasStore: true,
  hasContact: true
}
```

Also fetch current app JS:

```js
(async () => {
  const script = [...document.scripts].map(s => s.src).find(src => src.includes('gg-app'));
  console.log('app script:', script);
  const text = await fetch(script, { cache: 'no-store' }).then(r => r.text());
  console.log({
    hasSearchTextBug: /\bsearchText\s*\(/.test(text),
    hasCreateGlobalDiscoveryItem: text.includes('function createGlobalDiscoveryItem'),
    length: text.length
  });
})();
```

Expected:

```js
hasSearchTextBug: false
hasCreateGlobalDiscoveryItem: true
```

## Acceptance Criteria

Task is accepted only if:

- `/` and `/landing` use the same Global Discovery source/config/builder or generated manifest;
- `/` and `/landing` share feed max, route IDs, section IDs, action IDs, filters, item model, priority rules, and Store exclusion rules;
- `/` Global Discovery is never blank on first open;
- `/landing` no longer has an independent Global Discovery implementation that can drift;
- Global Discovery excludes Store-domain articles/topics;
- Store Discovery remains independent;
- bottom command behavior remains unchanged;
- no console error occurs on Search open;
- discovery contract guard detects drift risks;
- comments proof remains passing;
- CI/CD passes.

## Required Final Report

```txt
TASK-DISCOVERY-002 completed.

Changed:
- Shared Global Discovery builder/config added: YES/NO
- `/` and `/landing` consume same Global Discovery source: YES/NO
- Feed max unified: YES/NO
- Route IDs unified: YES/NO
- Section IDs unified: YES/NO
- Action IDs unified: YES/NO
- Filter IDs unified: YES/NO
- Store-domain article/topic exclusion integrated: YES/NO
- Landing-only discovery arrays removed/neutralized: YES/NO
- First-render blank root Discovery fixed/guarded: YES/NO
- Store Discovery kept independent: YES/NO
- Bottom command behavior changed: NO
- Threaded comments behavior changed: NO
- Blog1 detail branch changed: NO

Verification:
- npm run gaga:verify-discovery-contract: PASS/FAIL
- npm run gaga:template:pack: PASS/FAIL
- npm run gaga:verify-comments-proof: PASS/FAIL
- node qa/copy-registry-guard.mjs: PASS/FAIL
- npm run gaga:verify-nav-more: PASS/FAIL
- npm run store:build: PASS/FAIL
- npm run store:proof: PASS/FAIL
- npm run ci:cloudflare: PASS/FAIL
- git diff --check: PASS/FAIL

Manual proof:
- `/` Search not blank: PASS/FAIL
- `/landing` Search uses same required base items: PASS/FAIL
- `/store` remains Store Discovery: PASS/FAIL
- Console has no createGlobalDiscoveryItem/searchText error: PASS/FAIL
```

## Out of Scope

- Discovery visual redesign.
- Visitor-friendly filter remapping.
- New search ranking.
- Remote/full-text search backend.
- AI search.
- Store checkout.
- More sheet redesign.
- Dock redesign.
- Threaded comments.
- Worker canonical rewrites.
- Lighthouse gate.
