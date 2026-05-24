# TASK-SEMANTIC-SSR-001 — Meaningful HTML Fallback and Semantic Route Structure


Baseline assumption: Store Isolation, Store Isolation JS, Discovery 002/003, Theme 001, Shell 001/002, Preview 001, and CI/CD hardening are already stable.

Global rule for every task:
- Treat this as hardening/audit/contract work.
- Do not rewrite stable Store/Discovery/Shell/Preview controllers unless a guard proves a real defect.
- Preserve Blog1 detail, Blogger native comments, threaded comments, Store isolation, Discovery taxonomy, Theme Light/Dark, global sheet controller, preview contract, preview scroll reset, and current passing CI.
- Do not hardblock post titles, URLs, or slugs.
- Do not weaken QA guards.


## Strategic Purpose

Ensure `/`, `/landing`, `/store`, post detail, and static pages remain meaningful, crawlable, and understandable without relying on JavaScript.

## Required Fallback Contract

```txt
/        = editorial Blog listing with non-Store posts
/landing = Home/identity content
/store   = Store/product grid
post     = article or product detail content
page     = static page content
```

## Semantic Requirements

Use and preserve appropriate structure:

```html
<header>
<nav>
<main>
<article>
<section>
<aside>
<footer>
```

Required:

```txt
one main landmark per page
meaningful h1
logical h2/h3 hierarchy
nav labels
article/listing semantics
footer semantics
real links, not JS-only pseudo links
```

## Root `/` Requirements

Root must be semantically an editorial Blog archive.

Required:

```txt
clear page title for Blog/editorial listing
non-Store article list
article cards/rows use article semantics
each card has real href
Store content excluded from rendered root listing
Store may appear only as route/navigation
```

## Landing `/landing` Requirements

Required:

```txt
clear identity h1
sections with semantic headings
contact section addressable by #contact
Search/More UI does not replace content semantics
no public "Landing" label
```

## Store `/store` Requirements

Required:

```txt
product grid present in HTML
product cards have names, summaries, prices or priceText if available
category navigation links
real hrefs
marketplace/affiliate copy remains clear
Store products not mixed into root Blog listing
```

## Post Detail Requirements

Do not rewrite Blog1 detail. Only verify:

```txt
post detail remains readable
article/product body remains accessible
canonical link remains correct
comments remain native
```

## Required Guard

Add or update:

```txt
qa/semantic-ssr-guard.mjs
```

Guard should check:

```txt
main landmark
h1 presence per surface where feasible
root listing article semantics
store product grid semantics
landing contact anchor
no Store card marker in root rendered listing path
no public Landing nav label
basic href presence
```

Add script if stable:

```json
{
  "gaga:verify-semantic-ssr": "node qa/semantic-ssr-guard.mjs"
}
```

## Manual QA

Test with JS disabled where possible:

```txt
/ shows readable editorial listing
/landing shows readable identity content
/store shows readable product grid
post detail remains readable
static page remains readable
```

## Acceptance Criteria

```txt
HTML fallback is meaningful on /, /landing, /store
root is editorial non-Store listing
store is product collection
landing is Home/identity
post/detail comments not broken
semantic guard passes
CI remains PASS
```


Minimum QA after every task:

```bash
git diff --check
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run gaga:verify-nav-more
npm run gaga:verify-discovery-contract
npm run gaga:verify-discovery-filters
npm run gaga:verify-store-isolation
npm run gaga:verify-theme
npm run gaga:verify-shell
npm run gaga:verify-preview-sheet
npm run store:build
npm run store:proof
npm run ci:cloudflare
```

Run live smoke after deploy or when the task changes Worker/static assets:

```bash
npm run gaga:verify-worker-live:strict
```

`PASS_WITH_WARNINGS` is acceptable only for known non-blocking warnings. `CONTRACT_FAILURE` is not acceptable.
