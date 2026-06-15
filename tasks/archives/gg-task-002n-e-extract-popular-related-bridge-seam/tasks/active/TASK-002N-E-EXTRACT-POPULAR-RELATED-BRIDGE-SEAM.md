# TASK-002N-E — Extract Popular/Related Bridge Seam

## Status

Ready for Cline.

## Objective

Reduce `src/modules/legacy-app/legacy-app.js` by extracting a small Popular/Related helper seam into a dedicated module while preserving runtime behavior.

## New module

```txt
src/modules/popular-related-bridge/popular-related-bridge.js
src/modules/popular-related-bridge/popular-related-bridge.contract.json
```

Namespace:

```js
GG.popularRelatedBridge
```

## Scope

Allowed:

- popular range normalization
- popular range key/label/href helpers
- related post normalization
- related post key/href/title fallback helpers
- related dots nav helper/data helpers
- direct list count/slice helpers tied to popular/related

Forbidden:

- full Popular render rewrite
- full Related render rewrite
- comments/replies changes
- saved listing changes
- Store/Landing changes
- OAuth
- legacy donor deletion
- generated output edits

## Acceptance

Full command must pass:

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-e-acceptance.sh
```

## Manual smoke after completion

- Latest listing still works.
- Popular mode still works across available ranges.
- Related posts on detail page still render.
- Related dots/next/previous behavior is unchanged.
- Saved mode remains exclusive and still works.
