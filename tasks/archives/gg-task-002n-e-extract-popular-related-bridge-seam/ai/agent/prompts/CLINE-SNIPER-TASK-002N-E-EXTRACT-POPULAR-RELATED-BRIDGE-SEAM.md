# CLINE SNIPER — TASK-002N-E — Extract Popular/Related Bridge Seam

## Mission

Extract a small, stable Popular/Related helper seam from `src/modules/legacy-app/legacy-app.js` into:

```txt
src/modules/popular-related-bridge/popular-related-bridge.js
src/modules/popular-related-bridge/popular-related-bridge.contract.json
```

Expose it as:

```js
GG.popularRelatedBridge
```

Keep `legacy-app.js` as the orchestrator.

## Why this task exists

The repo has already completed a template-first public DOM cleanup. `check:public-dom` is clean:

```txt
needsTemplate=0
unclassified=0
```

Bridge extraction has started:

```txt
template-hydration
comments-bridge
saved-listing-bridge
```

Now extract the low-risk Popular/Related helper seam.

## Read first

1. `AGENTS.md`
2. `src/modules/legacy-app/README.md`
3. `src/modules/legacy-app/bridge-map.json`
4. `config/legacy-app-bridge-policy.json`
5. `docs/legacy-app-bridge-inventory.md`
6. Existing bridge module patterns:
   - `src/modules/template-hydration/template-hydration.js`
   - `src/modules/comments-bridge/comments-bridge.js`
   - `src/modules/saved-listing-bridge/saved-listing-bridge.js`
7. `src/modules/legacy-app/legacy-app.js` only around popular controls / related posts / dots nav logic.

## What to extract

Extract only small helpers that are stable and easy to prove equivalent, such as:

- popular range normalization
- popular range key validation
- popular range label lookup/fallback helpers
- popular range href/state helpers
- related post normalization
- related post key/href/title fallback helpers
- related dots nav helper/data helpers
- count/slice helpers directly tied to related/popular UI

Use exact behavior-preserving code movement. Do not invent new behavior.

## What not to extract

Do not extract or rewrite:

- full Popular rendering orchestration
- full Related posts rendering orchestration
- template clone flows
- saved listing logic
- comments/replies logic
- Store/Landing code
- Blogger native behavior
- legacy-donor deletion

## Classic bundle rule

If the repo still concatenates classic browser modules, do not add static ESM imports into `legacy-app.js` unless the repo already supports that for legacy modules. Follow the existing bridge pattern:

```js
GG.popularRelatedBridge = { ... }
```

Update `tools/build.mjs` so the bridge is bundled before `legacy-app` if required.

## Contract file

Create `src/modules/popular-related-bridge/popular-related-bridge.contract.json` with at least:

```json
{
  "id": "popular-related-bridge",
  "kind": "legacy-bridge-seam",
  "namespace": "GG.popularRelatedBridge",
  "surface": "blog",
  "status": "bridge",
  "exports": [],
  "boundaries": {
    "allowed": [
      "popular range normalization helpers",
      "related post data helpers",
      "related dots navigation data helpers"
    ],
    "forbidden": [
      "full popular rendering rewrite",
      "full related rendering rewrite",
      "comments orchestration",
      "saved listing orchestration",
      "legacy donor deletion"
    ]
  }
}
```

Update the export list with actual exported helper names.

## Documentation updates

Update:

- `src/modules/legacy-app/bridge-map.json`
- `src/modules/legacy-app/README.md`
- `config/legacy-app-bridge-policy.json`
- `docs/legacy-app-bridge-inventory.md`
- `docs/public-dom-generation-audit.md`
- `config/public-dom-generation-policy.json` only if line/allowlist/count documentation needs updating

## Acceptance script

Create `scripts/task002n-e-acceptance.sh`.

It should:

- run or verify the full validation pipeline when invoked
- verify the new module and contract exist
- verify `GG.popularRelatedBridge` is present
- verify `legacy-app.js` references `GG.popularRelatedBridge`
- verify `registry/modules.json` mentions the module
- verify `check:public-dom` has no `needsTemplate` / `unclassified` regression
- verify `check:legacy-bridge` passes

## Final required command

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-e-acceptance.sh
```

## Final report

Report:

- files changed
- helpers exposed in `GG.popularRelatedBridge`
- before/after `legacy-app.js` bytes and lines
- `check:public-dom` summary
- `check:legacy-bridge` summary
- confirmation that Popular/Related runtime behavior was not intentionally changed
