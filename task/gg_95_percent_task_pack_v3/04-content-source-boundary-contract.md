# Task 04 — Content Source Boundary Contract

## Objective

Split Root/Editorial CMS and Store/Product CMS at the source layer while preserving one global frontend behavior contract, one registry pattern, and one visual rhythm.

This task exists because Store is projected to have hundreds/thousands of products, much higher update frequency than articles, heavier feeds, and a different operating team.

## Public URL Contract

```txt
root    = https://www.pakrpp.com/
landing = https://www.pakrpp.com/landing or /landing/
store   = https://www.pakrpp.com/store or /store/
```

## CMS Source Contract

```txt
Editorial/root CMS:
  Blogger source: pakrpp.blogspot.com
  public canonical: https://www.pakrpp.com/

Store/product CMS:
  Blogger source: pakrppstore.blogspot.com
  optional source host: https://store.pakrpp.com/
  public canonical: https://www.pakrpp.com/store/
```

`store.pakrpp.com` is source-only/backend CMS host. It must not become the public SEO destination unless this architecture contract is explicitly changed.

## Hard Constraints

- Do not treat Store as a label-filtered subset of Root CMS after this task.
- Do not hardcode Blogger feed/sitemap URLs inside the controller.
- Do not split the frontend controller into separate root and store apps.
- Do not split visual rhythm.
- Do not let Product schema leak into the Root editorial CMS output.
- Do not let Article schema rules pollute Store product output.
- Do not create duplicate public canonical destinations for the same product.
- Do not use Worker HTMLRewriter to paper over source-boundary, schema, or semantic defects.
- Do not let `store.pakrpp.com` become an indexable public destination competing with `www.pakrpp.com/store/`.

## Required Source Config

Create or normalize a central source config/registry such as:

```txt
rootSource:
  provider: blogger
  sourceHost: pakrpp.blogspot.com
  publicCanonicalBase: https://www.pakrpp.com/
  feed: declared in config
  sitemap: declared in config
  schemaFamily: Article/WebPage

storeSource:
  provider: blogger
  sourceHost: pakrppstore.blogspot.com
  sourceCustomHost: https://store.pakrpp.com/
  publicCanonicalBase: https://www.pakrpp.com/store/
  feed: declared in config
  sitemap: declared in config
  schemaFamily: Product/ItemList
```

Exact file names may follow the existing project structure. The key requirement is centralization and no hidden hardcoded URLs.

## Routing Intent

```txt
/           → root/editorial surface
/landing    → static landing surface
/store      → store listing/catalog surface
/store/...  → store product/detail route if supported
```

Cloudflare Worker/source adapter may fetch or stage Store CMS data from `pakrppstore.blogspot.com` or `store.pakrpp.com`, but output canonical public links should point to `www.pakrpp.com/store/...`.

This does not authorize Worker to become an HTMLRewriter or CMS replacement. The Worker may route, serve static artifacts, normalize clean Store paths, enforce headers/cache/robots policy, and stage declared source data. It must not rewrite healthy Blogger HTML as the normal way to render root/post/page/store content.


## Required Existing-Doc Updates

Update the existing contract docs; do not create a new competing architecture truth unless unavoidable. Minimum expected updates:

```txt
AGENTS.md:
  add Store Blogger CMS as source-only/backend host; restate Worker is not HTMLRewriter/CMS.

ARCHITECTURE.md:
  clarify Store source may be separate Blogger CMS while /store remains the public Store surface.
  preserve Worker non-goals: no normal UI authoring, no all-post proxy/mutation strategy.

ASSET-ARCHITECTURE.md:
  clarify store.html + src/store/* remain build/render/static artifact owners, while product/feed input may come from Store Blogger CMS source.

SOURCE-OF-TRUTH.md:
  add rootSource/storeSource config and source/backend CMS host vs public canonical route distinction.

SURFACE-CONTRACT.md:
  keep public route truth: /landing = Home, / = Blog, /store = Store.
  add source truth: Store CMS source is separate from public canonical Store route.

QA-COMMANDS.md:
  document any new guard command only if it is actually added to package.json.
```

Do not leave two conflicting truths such as "Store = static src/store only" versus "Store = separate Blogger CMS source". The resolved truth is:

```txt
/store = public canonical Store surface.
store.html + src/store/* = Store build/render/static artifact owners.
pakrppstore.blogspot.com / store.pakrpp.com = Store product/content source.
Worker = router/stager/edge policy, not HTMLRewriter/CMS.
```

## SEO Boundary

- Root sitemap and Store sitemap must be declared separately.
- Root feed and Store feed must be declared separately.
- Store source host must not be promoted as canonical public destination.
- Public Store routes must use canonical URLs under `www.pakrpp.com/store/`.
- Internal public links should point to canonical public URLs, not backend Blogspot/source host URLs.

## Acceptance Criteria

- Root can render without fetching Store feed unless explicitly required.
- Store can render without fetching Root feed unless explicitly required.
- Root CMS output does not emit Product schema after Store split.
- Store output emits Product/ItemList schema where valid.
- Source URLs live in registry/config, not controller internals.
- Store label-based separation is no longer the primary boundary.
- `store.pakrpp.com` is documented as source-only/backend host.
- Public canonical Store route is documented as `https://www.pakrpp.com/store/`.
- Existing contract docs are updated so no old static-only Store source truth conflicts with the new Store CMS source boundary.
- Worker remains a router/stager/policy layer, not an HTMLRewriter/rendering fix.
