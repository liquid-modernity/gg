# Critical CSS Asset Architecture

TASK-ASSET-001 splits Blogger CSS into a small inline critical layer and the full external app stylesheet.

## Sources

- Critical inline CSS: `src/css/gg-critical.source.css`
- Full app CSS: `src/css/gg-app.source.css`
- Publish artifact: `dist/blogger-template.publish.xml`
- Runtime full CSS: `/__gg/assets/css/gg-app.min.css`

`tools/template-pack.mjs` injects `src/css/gg-critical.source.css` into `<b:skin>` by default and rewrites Blogger app CSS links in the publish artifact to `/__gg/assets/css/gg-app.min.css`. It still synchronizes the full CSS into `__gg/assets/css/gg-app.dev.css`, `__gg/assets/css/gg-app.min.css`, and the matching `dist/assets/css/` files.

The live-parity source `index.xml` intentionally remains untouched by the pack step so `npm run gaga:template:proof` can keep comparing the repository carrier fingerprint against the currently published Blogger template.

## Buckets

- Critical inline: theme variables, page/body base, focus/hidden utilities, shell/main/listing/detail first-paint layout, dock positioning, and hidden sheet defaults.
- Early external-safe: toolbar chrome, sheet internals, comments/replies layout, panels, menus, and interaction states.
- Non-critical external: route-specific polish, store/discovery views, dense panel styling, animations, and post-hydration refinements.
- Dead or duplicate: left in the full stylesheet for later measured cleanup; TASK-ASSET-001 only removes the full CSS duplication from the publish artifact.

## Rollback

Use the full-inline mode only when Blogger publish safety requires reverting to the old asset shape:

```sh
GG_TEMPLATE_INLINE_CSS=full npm run gaga:template:pack
```

or:

```sh
npm run gaga:template:pack -- --full-inline-css
```

For the legacy builder:

```sh
python3 scripts/build-index.py --production --full-inline-css
```

## QA Surfaces

Check first paint and post-hydration on `/landing`, `/`, post detail, plain page detail, comments closed/open/replies open, store, and discovery. The critical layer should keep the shell, listing rows, article frame, dock position, and hidden sheets stable before `/__gg/assets/css/gg-app.min.css` finishes loading.
