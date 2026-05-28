# Task 07 — Lazy Interaction & Advisory Budget

## Objective

Move non-critical interaction systems out of initial boot and turn budget checks into advisory notes rather than blockers.

This task improves PageSpeed readiness without killing UX.

## Hard Constraints

- Do not rewrite Blog1.
- Do not remove UX features.
- Do not make performance budget a `CONTRACT_FAILURE`.
- Do not lazy-load SSR-critical HTML.
- Do not lazy-load SEO-critical JSON-LD that must be present in HTML.
- Do not break sheet contract from Tasks 02–03.
- Do not break data contract from Task 04.

## Lazy-Load Candidates

Move these behind interaction or route need:

```text
preview fetch/parser
comments enhancement
discovery filter/search
store discovery
share poster
saved reading
PWA extras
non-critical analytics
heavy animation helpers
```

## Do Not Lazy-Load

Do not defer these if they are required for first meaningful render:

```text
critical theme bootstrap
basic route detection
essential shell layout
visible SSR content
canonical links
SEO meta tags
JSON-LD required for route
basic dock/safe navigation if visible immediately
```

## Route-Level Strategy

### Root Listing `/`

Initial load should prioritize:

```text
SSR listing
semantic HTML
basic dock/navigation
minimal preview trigger binding
```

Lazy after intent:

```text
preview fetch/render
discovery sheet
saved reading
share poster
```

### Post Detail

Initial load should prioritize:

```text
article content
semantic structure
JSON-LD
basic navigation
```

Lazy after intent:

```text
comments enhancement
reply sheet behavior
share poster
saved reading
```

### Page Detail

Initial load should prioritize:

```text
page content
semantic structure
basic navigation
```

Lazy after intent:

```text
sheet extras
share extras
```

### Landing

Initial load should prioritize:

```text
hero/primary sections
contact anchor
basic navigation
```

Lazy after intent:

```text
advanced sheet/discovery extras
decorative animation
```

### Store

Initial load should prioritize:

```text
static product grid
ItemList JSON-LD
canonical card links
basic product cards
```

Lazy after intent:

```text
store discovery
filters
store preview
advanced saved state
```

## Advisory Budget Contract

Budget checks should report:

```text
ADVISORY
```

not:

```text
CONTRACT_FAILURE
```

Example output:

```text
ADVISORY:
gg-app.source.js exceeds preferred budget.
Current: 420 KB.
Preferred: 250 KB.
This is not blocking.
```

Suggested script categories:

```json
{
  "qa:edit": "small non-blocking edit checks",
  "qa:contract": "semantic/sheet/data contract checks",
  "qa:build": "build and artifact parity",
  "qa:budget": "advisory budget report only",
  "qa:ship": "strict release candidate gate"
}
```

## Required Work

### 1. Convert budget blockers to warnings

Any size/performance budget guard should exit successfully unless explicitly called in strict release mode.

### 2. Add lazy boundaries

Use safe dynamic import or deferred initialization where compatible with the current build system.

Do not introduce bundler complexity unless the project already supports it.

### 3. Keep interaction reliable

Lazy modules must initialize when user intent occurs:

```text
click/tap preview trigger
open discovery
open comments
open store filter
open share
```

### 4. Avoid duplicate initialization

Lazy modules must be idempotent:

```js
if (moduleAlreadyInitialized) return;
```

### 5. Preserve no-JS/SSR fallback

Visible content should remain useful without the lazy module.

## Acceptance Criteria

- Initial boot is smaller in responsibility.
- Budget warnings are advisory only.
- No budget warning blocks Codex-style revisions.
- Preview still opens after lazy initialization.
- Comments enhancement still works after intent.
- Store discovery still works after intent.
- SSR content remains visible.
- SEO-critical HTML remains server-rendered/static.
- Blog1 remains stable.

## Suggested Verification

```bash
npm run build
npm run qa:contract
npm run qa:budget
```

Manual:

```text
1. Load root listing.
2. Open preview.
3. Open discovery.
4. Load post detail.
5. Open comments.
6. Load store.
7. Use store discovery/filter.
8. Confirm no duplicate event binding.
```

## Non-Goals

- Do not delete features just to reduce file size.
- Do not make Lighthouse 100 a blocker in development.
- Do not move SEO-critical content into client-only JS.
