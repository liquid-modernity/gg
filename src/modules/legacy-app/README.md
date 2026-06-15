# Legacy App Bridge

`legacy-app.js` is a temporary runtime bridge. It exists so the repo remains deployable while legacy behavior is split into purpose-specific modules.

Rules for this directory:

- Keep visible public UI structure in `apps/blog/index.xml` or purpose-specific templates.
- Use JavaScript for cloning templates, text, attributes, ARIA, state toggles, and behavior wiring.
- Do not import from `legacy-donor/`; that directory is reference-only.
- Prefer shrinking this bridge. New behavior should go into the smallest appropriate module.
- Keep `npm run check:public-dom` at `needsTemplate=0` and `unclassified=0`.
- Keep `npm run check:legacy-bridge` passing.

See `docs/legacy-app-bridge-inventory.md` and `src/modules/legacy-app/bridge-map.json` before extracting future modules.

Extracted seams:

- `src/modules/template-hydration/template-hydration.js` owns template lookup and `cloneTemplateElement()`.
- `src/modules/comments-bridge/comments-bridge.js` owns low-risk comments URL/hash/permalink/reply-handle helpers. Comments sheet orchestration stays in `legacy-app.js`.
- `src/modules/saved-listing-bridge/saved-listing-bridge.js` owns saved data normalization, storage parsing/writing, lookup, and toggle list calculation. Saved listing rendering and event orchestration stay in `legacy-app.js`.
