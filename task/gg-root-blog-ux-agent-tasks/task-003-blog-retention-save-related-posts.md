# TASK 003 — Blog Retention Pack: Save Article + Related Posts

## Status

Development only. Start after Task 001 and Task 002 are stable or at least not changing the same sheet/listing contracts.

This task includes focused CI reconciliation. Do not run old `task-002-reconcile.md` separately unless there are unrelated CI failures outside this feature scope.

## Goal

Improve retention on blog/root surfaces by implementing:

1. Save article MVP for root/blog articles.
2. Related posts for post/page detail.
3. Guarded contracts so both features are stable, accessible, and easy to make registry-driven later.

## Product Intent

Post/page detail should not dead-end after the user finishes reading. It should guide users to relevant articles and allow saving content for later.

Save is local-first now. Related posts should be lightweight and not require a backend.

## Scope

### Include

- Save action in preview sheet and/or post detail.
- Saved article store using localStorage.
- Saved filter/listing behavior on root/listing surface.
- Related posts section on post/page detail.
- Related post algorithm using labels/taxonomy first, recent fallback second.
- A11y and semantic guards.
- Copy registry entries if copy registry exists.

### Exclude

- User account sync.
- Cloud database.
- Analytics-based personalization.
- Server-side recommendation engine.
- Full registry dashboard.

## Save Article MVP Contract

Use localStorage first.

Suggested key:

```txt
gg:saved:v1
```

Saved item shape:

```js
{
  title: "Article title",
  url: "https://www.pakrpp.com/...",
  summary: "Short summary",
  date: "2026-06-08T00:00:00.000Z",
  source: "rootSource",
  surface: "blog",
  savedAt: "2026-06-08T12:00:00.000Z"
}
```

Do not store sensitive data.
Do not require login.
Do not break when localStorage is unavailable.

## Save Button Contract

Preview sheet save action:

```html
<button
  class="gg-preview__save"
  data-gg-save-article="true"
  aria-pressed="false"
  type="button">
  Save
</button>
```

If the current implementation uses an `<a>` placeholder, convert to button unless there is a routing reason not to.

Post detail save action may be added near article tail or detail toolbar:

```html
<button
  class="gg-article-save"
  data-gg-save-article="true"
  aria-pressed="false"
  type="button">
  Save article
</button>
```

## Saved Listing Behavior

The root listing filter `Saved` should work as an MVP:

- If saved items exist, show saved article cards/rows.
- If empty, show an accessible empty state.
- If localStorage is unavailable, show fallback message.
- Do not navigate to a broken `/saved` route unless such route exists.

Allowed MVP behavior:

```txt
#saved
```

or a client-side state within root listing.

## Related Posts Contract

Add related posts to post/page detail after article body/tail and before comments or lower utility sheets where practical.

Suggested markup:

```html
<section
  class="gg-related-posts"
  data-gg-module="related-posts"
  data-gg-related-source="labels"
  aria-labelledby="gg-related-posts-title">
  <h2 id="gg-related-posts-title">Related posts</h2>
  <div class="gg-related-posts__list" role="list"></div>
</section>
```

Each item:

```html
<a class="gg-related-posts__item" role="listitem" href="...">
  <span class="gg-related-posts__type">Article</span>
  <strong class="gg-related-posts__title">...</strong>
  <span class="gg-related-posts__meta">...</span>
</a>
```

## Related Posts Algorithm

MVP algorithm:

1. Read current post/page title, URL, labels, summary, and date from SSR `data-gg-*` attributes.
2. Collect candidate posts from existing listing data, discovery index, Blogger feed, or global app data already available in the repo.
3. Exclude current URL.
4. Exclude Store/Yellow Cart posts from blog related posts.
5. Score by shared label first.
6. Score recent posts second.
7. Return 3 to 6 items.
8. If no related posts, show recent articles fallback.
9. If still no candidates, hide section or show an accessible empty state depending on product choice.

Scoring suggestion:

```txt
+10 for each shared label
+3 if same broad content family/topic
+1 recency boost
-100 if same URL
-100 if Store/Yellow Cart product content
```

## Page Detail Behavior

For static Blogger pages, labels may not exist.

Fallback order for pages:

1. Explicit related posts configured in page body via `data-gg-related` if present.
2. Discovery index route/topic match.
3. Recent non-store articles.
4. Hide section if no safe candidates.

## Schema/SEO Guidance

Related posts do not need aggressive JSON-LD in MVP.

Allowed if simple and valid:

- `ItemList` for related article links

Do not add invalid schema or duplicate `BlogPosting` schema.

## Copy Registry

If copy registry is active, add keys such as:

```txt
related.title = Related posts
related.empty = No related posts yet.
saved.action.save = Save
saved.action.saved = Saved
saved.empty.title = No saved articles yet.
saved.empty.body = Save articles from previews or article pages to find them here.
```

Respect existing `gg-copy-en.json`, `gg-copy-id.json`, and copy manifest conventions.

## Accessibility Requirements

- Save button must expose state through `aria-pressed`.
- Saved state must be announced where practical.
- Related section needs a heading.
- Related list items must be keyboard accessible.
- Empty states must be announced politely if dynamic.
- No duplicate IDs across preview, article, and related sections.

## QA/Guard Requirements

Likely touched guards:

- `qa/preview-sheet-contract-guard.mjs`
- `qa/a11y-static-guard.mjs`
- `qa/semantic-readable-content-guard.mjs`
- `qa/semantic-ssr-guard.mjs`
- `qa/copy-registry-guard.mjs`
- `qa/discovery-contract-guard.mjs`
- `qa/store-isolation-guard.mjs`
- `qa/schema-jsonld-guard.mjs` if adding JSON-LD

Add a focused guard if needed:

```txt
qa/blog-retention-contract-guard.mjs
```

This guard should check:

- save action exists where expected
- related posts container contract exists on post/page detail
- related posts section has heading
- localStorage code is guarded with try/catch
- Store content is excluded by contract

If adding this guard, wire it into `package.json` without making it hostile to early development. If it validates critical contracts, it may be part of `ci:qa`.

## Required Commands

Run after implementation:

```bash
node qa/template-fingerprint.mjs --write
node qa/template-fingerprint.mjs --check
npm run gaga:template:pack
npm run gaga:verify-preview-sheet
npm run gaga:verify-a11y-static
npm run gaga:verify-semantic-ssr
npm run gaga:verify-semantic-readable-content
npm run gaga:verify-discovery-contract
npm run gaga:verify-store-isolation
node qa/copy-registry-guard.mjs
npm run build
npm run ci:cloudflare
```

Before claiming done:

```bash
npm run ci:qa
```

## GitHub Actions Green Requirement

This feature must not require network calls during CI unless existing CI already allows them. Related posts must degrade gracefully when feeds are unavailable in CI mode.

Respect existing CI env:

```txt
STORE_REQUIRE_LIVE_FEED=0
STORE_STRICT_IMAGES=0
GG_STORE_MODE=ci
```

## Acceptance Criteria

- Save article MVP works from preview and/or detail surface.
- Saved state persists in localStorage.
- Saved filter/empty state works on root listing.
- Related posts appear on post/page detail or fail gracefully with a documented empty state.
- Related posts exclude the current article.
- Related posts exclude Store/Yellow Cart content from blog surface.
- A11y guard passes.
- Preview sheet guard passes.
- Store isolation guard passes.
- `npm run build` passes.
- `npm run ci:cloudflare` passes.
- `npm run ci:qa` passes or failures are clearly classified and reconciled.

## Stop Rule

If related posts require a backend or account system, stop. This task is local/feed/discovery-index only.
