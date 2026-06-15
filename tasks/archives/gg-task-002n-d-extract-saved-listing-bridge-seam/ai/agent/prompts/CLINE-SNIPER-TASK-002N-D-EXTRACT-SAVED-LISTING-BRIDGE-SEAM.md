# CLINE SNIPER — TASK-002N-D — Extract Saved Listing Bridge Seam

## Mission

Extract the first safe **Saved Listing Bridge Seam** out of `src/modules/legacy-app/legacy-app.js` into a new public runtime module without changing public behavior.

This follows:

- TASK-002M-B/G template-first public DOM cleanup
- TASK-002N legacy bridge inventory/no-growth guard
- TASK-002N-B template hydration seam
- TASK-002N-C comments/replies helper seam

The project goal is still:

```txt
template-first
editability-aware
scalability-aware
AI-agent-friendly
non-JS-human-friendly
```

But this task is not a UI template migration task. It is a bridge seam extraction task.

---

## Hard boundaries

Do **not**:

- Rewrite saved listing behavior.
- Rewrite localStorage flow broadly.
- Change saved article UX, copy, routing, icons, sheet/listing behavior, or storage keys.
- Touch comments/replies logic.
- Touch popular controls or related posts logic.
- Touch Store/Landing restructure.
- Touch OAuth/Blogger API.
- Delete `legacy-donor/`.
- Delete `src/modules/legacy-app/`.
- Edit `dist/**` or `.cloudflare-build/**` manually.
- Add dependencies.
- Create generic templates.
- Use static ESM `import` inside `legacy-app.js` if current public build is still classic concatenated browser runtime.

---

## Required new module

Create:

```txt
src/modules/saved-listing-bridge/saved-listing-bridge.js
src/modules/saved-listing-bridge/saved-listing-bridge.contract.json
```

Expose a global namespace:

```js
window.GG = window.GG || {};
window.GG.savedListingBridge = { ... };
```

If existing new modules also use `export`, follow the same transitional pattern used by `template-hydration` / `comments-bridge`. Ensure the classic bundle still works.

---

## What to extract

Inspect `src/modules/legacy-app/legacy-app.js` and identify the saved listing bucket. Extract only small, safe helpers that are stable and low-risk.

Good candidates:

```txt
saved article id/key normalization
saved item URL/title/date normalization
safe saved item shape normalizer
safe JSON parse/stringify helpers for saved listing data
saved storage availability helper if pure/simple
saved listing row model helper if it does not manipulate DOM
saved state label/surface/marker mapper if simple and non-stateful
```

Do **not** extract large orchestrators such as:

```txt
renderSavedListing full flow
createListingRow full DOM flow if it still depends heavily on legacy state/ui
save/unsave event lifecycle
preview sheet orchestration
root listing pagination orchestration
```

If a function is entangled with `state`, `ui`, event listeners, or DOM mutation, leave it in `legacy-app.js` for now. The seam module should be mostly pure helper utilities.

---

## Required legacy-app integration

`legacy-app.js` must use the new bridge through:

```js
GG.savedListingBridge.someHelper(...)
```

Keep `legacy-app.js` as the orchestrator.

This task should reduce or at least not increase the measured size of `legacy-app.js` from the TASK-002N-C baseline:

```txt
max bytes: 469827
max lines: 11119
```

If a safe extraction cannot reduce the file under this baseline, stop and report instead of adding noisy indirection.

---

## Build integration

Update build/runtime registry so `saved-listing-bridge` loads before `legacy-app`.

Likely files:

```txt
registry/modules.json
tools/build.mjs
```

Use the same strategy as `template-hydration` and `comments-bridge`.

Do not introduce a second independent bundling style.

---

## Documentation/policy updates

Update:

```txt
src/modules/legacy-app/bridge-map.json
src/modules/legacy-app/README.md
config/legacy-app-bridge-policy.json
config/public-dom-generation-policy.json
docs/legacy-app-bridge-inventory.md
docs/public-dom-generation-audit.md
```

Record:

```txt
new saved-listing-bridge module
helpers moved
legacy-app still owns orchestration
no UI behavior change intended
legacy-app bytes/lines before and after
public-dom counts remain clean
```

---

## Acceptance

Create/update:

```txt
scripts/task002n-d-acceptance.sh
```

The final command must pass:

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-d-acceptance.sh
```

Acceptance script must verify at least:

```txt
src/modules/saved-listing-bridge/saved-listing-bridge.js exists
src/modules/saved-listing-bridge/saved-listing-bridge.contract.json exists
registry/modules.json references saved-listing-bridge
tools/build.mjs references saved-listing-bridge
legacy-app.js references GG.savedListingBridge
legacy-app.js does not statically import saved-listing-bridge
legacy-app.js bytes <= 469827
legacy-app.js lines <= 11119
check:public-dom remains needsTemplate=0 and unclassified=0
check:legacy-bridge passes
legacy-donor still exists
src/modules/legacy-app still exists
```

---

## Report format

Return:

```txt
TASK-002N-D complete.
Files changed:
...
Helpers exposed in GG.savedListingBridge:
...
Counts:
legacy-app before: ... bytes, ... lines
legacy-app after: ... bytes, ... lines
check:public-dom: ...
check:legacy-bridge: ...
Validation passed.
No runtime UI behavior was intentionally changed.
```
