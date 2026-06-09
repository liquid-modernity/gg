# Surface Contract

Route truth is fixed for this hardening phase:

```txt
/landing = Home / identity surface
/        = Blog / editorial archive
/store   = Store / commerce surface

Breadcrumb/schema route truth:
Home(/landing) -> Blog(/) -> current page/post
```

## `/` Route Contract

`/` is the Blog and editorial archive surface rendered by Blogger through `index.xml`. It must remain semantic and useful without JavaScript. It may be enhanced by global Discovery, previews, dock actions, sheets, saved state, and theme behavior.

Do not redirect `/` to `/landing`, do not rebrand `/` as Home in schema/breadcrumbs, and do not let Worker replace healthy Blogger listing output.

Root listing uses the Gaga Design System only. The canonical visual header is `gg-site-head`; `gg-listing-toolbar` may exist only as a compatibility alias during migration. Listing label/menu icons come from the root listing icon registry in source, with `article` as the unknown-label fallback and `top_panel_open` for Details.

Saved listing mode is local-only and uses `#saved` plus `localStorage` key `gg:saved:v1`. Popular Posts listing mode uses `#popularpost` and native Blogger `PopularPosts` widgets as source data. Required source widgets and ranges are `PopularPosts1`/`ALL_TIME`, `PopularPosts3`/`LAST_YEAR`, `PopularPosts2`/`LAST_MONTH`, and `PopularPosts4`/`LAST_WEEK`. If Blogger does not render native popular data, the public Gaga listing shows a clear unavailable state instead of synthesizing fake popularity.

Root contact owns message intent, WhatsApp, email, and social fallback links. More sheet owns navigation, info, preferences, and search; it must not own social links.

## `/landing` Route Contract

`/landing` is the Home and identity surface. It is served as static HTML from `landing.html` through Cloudflare/static assets. It introduces PakRPP and links users into the Blog and Store surfaces.

`/landing` may use its own static copy and structured data, but it must preserve route truth: Home is `/landing`; Blog is `/`.

Static landing contact actions use the in-page `/landing#contact` fallback. They must not assume Blogger ContactForm plumbing is present.

## `/store` Route Contract

`/store` is the Yellow Cart commerce surface. It is static-prerendered from Store source and served through Cloudflare Worker/static assets. Canonical Store routes are:

- `/store`
- `/store/{category}`
- `/store/{category}/page/{n}`

Store category and pagination truth comes from `src/store/store-categories.config.mjs`, `src/store/lib/store-routes.mjs`, and `store/data/build-report.json`. Worker aliases may normalize legacy Store paths to canonical Store paths, but generated public category output must not be hand-authored.

The public canonical Store base is `https://www.pakrpp.com/store/`. Store product/content CMS input is separate from the root/editorial CMS: `pakrppstore.blogspot.com` is the Store Blogger source and `https://store.pakrpp.com/` is optional source-only/backend host. Neither source host is a competing public SEO destination. Source URLs belong in the source boundary registry/config, while Worker remains static route governance and must not become an HTMLRewriter/CMS/schema/readability repair path.

Static Store contact actions use a safe route fallback such as `/landing#contact` or `/p/contact.html` until a shared static contact adapter exists. Store must not fake Blogger ContactForm submission.

## Post Detail Contract

Post detail pages are Blogger-owned SSR pages. They must keep canonical Blogger post URLs, visible content parity with structured data, Blog1 detail behavior, native comments when comments are enabled, threaded replies, preview/share affordances, and the breadcrumb/schema truth `Home(/landing) -> Blog(/) -> current post`.

Do not block or special-case post titles, URLs, or slugs as a hardening shortcut.

## Page Detail Contract

Static Blogger page detail routes remain Blogger-owned SSR pages unless they are explicit static Cloudflare surfaces such as `/landing` and `/store`. Page detail schema and breadcrumbs must reflect visible content and current route truth.

Vanity routes may redirect to Blogger page routes when Worker policy defines them, but Worker must not author normal page detail UI.

## Label, Search, And Archive Treatment

Labels, search, archive, and older/newer pagination remain Blogger-owned listing surfaces. They may be enhanced by Discovery and shell behavior, but they must preserve useful SSR fallback and native Blogger route semantics.

Production robots policy may treat label/search/archive differently from primary indexable pages, but route classification must stay honest: these routes are not Store, not Home, and not post detail.
