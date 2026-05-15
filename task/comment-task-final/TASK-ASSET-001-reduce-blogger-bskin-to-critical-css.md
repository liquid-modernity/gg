# TASK-ASSET-001 — Reduce Blogger `b:skin` to Critical CSS and Remove Duplicate Full App CSS

## Goal

Move the project from hybrid duplicated CSS toward a disciplined asset architecture:

- Blogger `b:skin` contains only critical/minimal CSS.
- External CSS carries full non-critical app styling.
- The template remains publish-safe in Blogger.
- The UI does not flash broken layout before external CSS loads.
- Threaded comments do not regress.

This is not a threaded comments feature task.

## Current problem

The archive shows full app CSS duplicated:

- `index.xml` is large because it embeds a large `b:skin` block.
- `template/partials/05-bskin-wrapper-original.xml` is about the same size as full app CSS.
- `src/css/gg-app.source.css` and `__gg/assets/css/gg-app.dev.css` are also large and similar.
- `index.xml` also preloads/loads `/__gg/assets/css/gg-app.dev.css` externally.

This means the page can parse a large inline CSS block and then load a similar external stylesheet. That increases HTML weight, CSSOM work, style duplication risk, and debugging complexity.

## Non-negotiable constraints

- Do not remove `b:skin` entirely.
- Do not perform a one-shot aggressive purge.
- Do not change comment behavior.
- Do not change Blogger native comment plumbing.
- Do not change route semantics.
- Do not change copy registry in this task.
- Preserve Blogger publish validity.

## Target architecture

### `index.xml` / `b:skin`

Keep only:

- CSS variables/tokens required before external CSS loads;
- base document/body reset;
- no-JS safe baseline;
- above-the-fold shell/layout primitives;
- essential dock/sheet safety if needed to avoid broken initial paint;
- minimal accessibility utilities required at first paint.

### external app CSS

Move full styling to versioned/minified external CSS, including:

- full comments polish;
- panels/sheets polish;
- discovery;
- store UI;
- detail content polish;
- animations/transitions not required at first paint;
- non-critical responsive refinements.

Preferred final external route:

```text
/__gg/assets/css/gg-app.min.css
```

Development route may continue using:

```text
/__gg/assets/css/gg-app.dev.css
```

but production template should not unnecessarily load development CSS.

## Required audit phase

Before editing, produce a CSS inventory:

```bash
du -h index.xml template/partials/05-bskin* src/css/gg-app.source.css __gg/assets/css/gg-app.dev.css __gg/assets/css/gg-critical.css 2>/dev/null || true
grep -n "gg-app.dev.css\|gg-app.min.css\|<b:skin" index.xml template/index.original.xml dist/*.xml 2>/dev/null || true
```

Map CSS into four buckets:

1. **Critical inline** — must remain in `b:skin`.
2. **Early but external-safe** — can move external if no FOUC.
3. **Non-critical app styling** — must live external.
4. **Dead/duplicate CSS** — remove only after proof.

## Required implementation phase

Implement gradually:

1. Create or update a critical CSS source file, e.g. `src/css/gg-critical.source.css` or equivalent.
2. Make `template-pack.mjs` inject critical CSS into `b:skin` from the critical source, not from full `gg-app.source.css`.
3. Keep full CSS in external asset output.
4. Use production external CSS when building production template.
5. Keep a rollback path: one flag or command should rebuild the older full-inline behavior if Blogger publish breaks during testing.
6. Update documentation under `docs/architecture/` or `docs/performance/`.

## Required FOUC checks

Check these surfaces before and after external CSS loads:

- `/landing`
- `/`
- post detail page
- plain page detail
- comments sheet closed and open
- replies sheet closed and open
- store page if present
- discovery/search sheet if present

The page must not show unusable broken layout while external CSS loads.

## Required threaded-comments regression checks

Run after CSS extraction:

```bash
npm run gaga:verify-comments-proof
npm run gaga:verify-sheet-contract
npm run gaga:template:pack
npm run gaga:template:proof
```

Manual checks:

- Comments sheet still opens correctly.
- Replies sheet still layers correctly above main comments.
- Sticky footer remains attached to the active sheet.
- Composer remains usable.
- No clipped footer on mobile.
- No invisible `Reply`, `Add a reply`, or `Cancel reply` controls.

## Required output metrics

Before/after report must include:

```text
index.xml size before/after
b:skin size before/after
external CSS size before/after
number of external CSS files loaded by index.xml
production CSS path used
known remaining inline CSS debt, if any
```

## Acceptance criteria

This task is accepted when:

1. Full app CSS is no longer duplicated wholesale inside `b:skin` and external CSS.
2. `b:skin` is reduced to critical/minimal CSS.
3. Blogger template remains publish-safe.
4. No first-paint layout break is introduced.
5. Threaded comments proof still passes.
6. The change is documented and reversible.

## Output required from Codex

```text
TASK-ASSET-001 completed.

CSS size report:
- index.xml before: ___
- index.xml after: ___
- b:skin before: ___
- b:skin after: ___
- external CSS before: ___
- external CSS after: ___

Changed:
- b:skin now critical/minimal: YES/NO
- full app CSS externalized: YES/NO
- production CSS path used: ___
- rollback path documented: YES/NO

Verification:
- npm run gaga:verify-comments-proof: PASS/FAIL
- npm run gaga:verify-sheet-contract: PASS/FAIL
- npm run gaga:template:pack: PASS/FAIL
- npm run gaga:template:proof: PASS/FAIL

Regression:
- comment behavior changed: NO
- Blogger publish validity preserved: YES/NO
```
