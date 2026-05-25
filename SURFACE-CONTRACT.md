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

## `/landing` Route Contract

`/landing` is the Home and identity surface. It is served as static HTML from `landing.html` through Cloudflare/static assets. It introduces PakRPP and links users into the Blog and Store surfaces.

`/landing` may use its own static copy and structured data, but it must preserve route truth: Home is `/landing`; Blog is `/`.

## `/store` Route Contract

`/store` is the Yellow Cart commerce surface. It is static-prerendered from Store source and served through Cloudflare Worker/static assets. Canonical Store routes are:

- `/store`
- `/store/{category}`
- `/store/{category}/page/{n}`

Store category and pagination truth comes from `src/store/store-categories.config.mjs`, `src/store/lib/store-routes.mjs`, and `store/data/build-report.json`. Worker aliases may normalize legacy Store paths to canonical Store paths, but generated public category output must not be hand-authored.

## Post Detail Contract

Post detail pages are Blogger-owned SSR pages. They must keep canonical Blogger post URLs, visible content parity with structured data, Blog1 detail behavior, native comments when comments are enabled, threaded replies, preview/share affordances, and the breadcrumb/schema truth `Home(/landing) -> Blog(/) -> current post`.

Do not block or special-case post titles, URLs, or slugs as a hardening shortcut.

## Page Detail Contract

Static Blogger page detail routes remain Blogger-owned SSR pages unless they are explicit static Cloudflare surfaces such as `/landing` and `/store`. Page detail schema and breadcrumbs must reflect visible content and current route truth.

Vanity routes may redirect to Blogger page routes when Worker policy defines them, but Worker must not author normal page detail UI.

## Label, Search, And Archive Treatment

Labels, search, archive, and older/newer pagination remain Blogger-owned listing surfaces. They may be enhanced by Discovery and shell behavior, but they must preserve useful SSR fallback and native Blogger route semantics.

Production robots policy may treat label/search/archive differently from primary indexable pages, but route classification must stay honest: these routes are not Store, not Home, and not post detail.
