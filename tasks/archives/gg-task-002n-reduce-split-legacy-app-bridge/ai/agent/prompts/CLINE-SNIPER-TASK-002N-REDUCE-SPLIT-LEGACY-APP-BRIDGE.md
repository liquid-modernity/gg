# CLINE SNIPER — TASK-002N — Reduce/Split legacy-app Bridge

You are working in the GG vNext / PakRPP repo.

## Current state
The public DOM/template-first cleanup has just landed:

- Blog `legacy-app` no longer creates visible `section`, `article`, `button`, structural `div`, or structural `a` UI with raw `document.createElement`.
- `check:public-dom` should show roughly:
  - `needsTemplate=0`
  - `unclassified=0`
  - remaining `createElement` only runtime/helper/infrastructure.
- Public UI structure should be template-first, editability-aware, scalability-aware, AI-agent-friendly, and friendly to humans who do not understand JavaScript.

## Mission
Begin reducing/splitting `src/modules/legacy-app/legacy-app.js` safely.

This task is a **bridge-reduction foundation**, not a full rewrite.

You must create:

1. A human-readable bridge inventory.
2. A bridge policy/config file.
3. A `check:legacy-bridge` guard.
4. A small extraction seam / module boundary for future splits.
5. Acceptance script.

You may extract one tiny, safe helper if and only if the build/runtime pattern supports it cleanly. Do not force imports that break the bundled public app.

## Read first, but narrowly
Inspect only these first:

- `package.json`
- `src/modules/legacy-app/legacy-app.js`
- `src/modules/legacy-app/legacy-app.css`
- `registry/modules.json` if present
- `config/public-dom-generation-policy.json`
- `docs/public-dom-generation-audit.md`
- `checks/public-dom.check.mjs`
- `apps/blog/index.xml`
- build tool files only if needed to understand module loading

Avoid broad repo browsing unless necessary.

## Required files to create/update

### 1. `docs/legacy-app-bridge-inventory.md`
Create a readable inventory of `legacy-app.js`.

Must include these headings:

- `# Legacy App Bridge Inventory`
- `## Purpose`
- `## Current Runtime Role`
- `## Domain Buckets`
- `## Extraction Order`
- `## Do Not Delete Yet`
- `## Done Criteria For Removing legacy-app`

Domain buckets must classify at least:

- boot/runtime wiring
- template cloning / DOM hydration glue
- comments sheet / replies
- saved listing / saved state
- popular controls
- related posts / prev-next / dots
- offline/error/fallback behavior
- parsing/extraction helpers
- store or landing cross-surface references if any

Extraction order should recommend small future tasks, for example:

1. Comments bridge module
2. Saved listing bridge module
3. Related posts bridge module
4. Popular controls bridge module
5. Parsing helpers module
6. Final legacy bridge deletion

### 2. `config/legacy-app-bridge-policy.json`
Create a policy file that makes the bridge explicit.

It must include:

```json
{
  "version": 1,
  "status": "active-bridge",
  "principle": "legacy-app is a temporary runtime bridge; visible public UI must be template-first",
  "legacyAppPath": "src/modules/legacy-app/legacy-app.js",
  "legacyDonorPath": "legacy-donor",
  "doNotDeleteYet": true,
  "noGrowthPolicy": {
    "enabled": true,
    "reason": "legacy-app should shrink or stay stable while behavior moves into purpose-specific modules"
  },
  "publicDomPolicy": {
    "requiresNeedsTemplateZero": true,
    "requiresUnclassifiedZero": true
  },
  "forbidden": {
    "newHiddenUiGeneration": true,
    "genericTemplates": [
      "gg-template-div",
      "gg-template-link",
      "gg-template-button",
      "gg-template-element",
      "gg-template-generic"
    ],
    "legacyDonorRuntimeImports": true
  },
  "extractionBuckets": []
}
```

You may add fields, but do not remove the intent.

Add real `extractionBuckets` with stable names, owner files, status, and next task recommendation.

### 3. `checks/legacy-bridge.check.mjs`
Create a Node check with no new dependencies.

It must:

- Read `config/legacy-app-bridge-policy.json`.
- Confirm `src/modules/legacy-app/legacy-app.js` exists.
- Confirm `legacy-donor/` is not imported/bundled directly from public runtime source files.
- Confirm no generic templates exist in `apps/blog/index.xml` or `apps/store/store.html`.
- Confirm `docs/legacy-app-bridge-inventory.md` exists and has required headings.
- Confirm `package.json` has script `check:legacy-bridge`.
- Prefer checking current `legacy-app.js` size/count and print a summary.
- Must fail if `legacy-app.js` contains new obvious hidden UI generation patterns:
  - `innerHTML = \`` creating UI
  - `insertAdjacentHTML`
  - `outerHTML`
  - `document.createElement('section')`
  - `document.createElement('article')`
  - `document.createElement('button')`
  - `document.createElement('nav')`
  - `document.createElement('header')`
  - `document.createElement('footer')`
  - `document.createElement('dialog')`
  - `document.createElement('form')`

Important: do not fail on existing allowlisted helper `innerHTML` reads that `check:public-dom` already allowlists, unless it is an obvious UI assignment.

Output example:

```txt
legacy-bridge ok: bytes=123456 createElement=6 needsTemplate=0 unclassified=0 buckets=8
```

### 4. `package.json`
Add:

```json
"check:legacy-bridge": "node checks/legacy-bridge.check.mjs"
```

Keep existing scripts.

### 5. Extraction seam / module boundary
Create a small future-facing module boundary without a broad behavior rewrite.

Preferred safe option:

- Create `src/modules/legacy-app/README.md` explaining the bridge is temporary and must shrink.
- Create `src/modules/legacy-app/bridge-map.json` or `src/modules/legacy-app/bridge-map.mjs` listing buckets and suggested future module targets.

Optional only if safe:

- Extract a tiny pure helper to a new module, for example template clone helper or text helper, and wire it only if existing module loading supports it.

Do not force this optional extraction if it risks changing runtime behavior.

### 6. `scripts/task002n-acceptance.sh`
Create acceptance script that runs:

- `npm run doctor`
- `npm run build`
- `npm run check`
- `npm run check:softcode`
- `npm run check:public-softcode`
- `npm run check:public-ui`
- `npm run check:public-dom`
- `npm run check:legacy-bridge`
- `npm run console:check`
- `npm run studio:check`
- `npm run deploy:dry`

Then perform artifact checks:

- policy file exists
- inventory doc exists
- legacy bridge check exists
- package script exists
- `legacy-donor/` still exists
- `src/modules/legacy-app/legacy-app.js` still exists
- no generic template IDs exist
- public DOM still reports/contains no `needsTemplate` or `unclassified` failures by command exit status

## Boundaries
Do not:

- Delete `legacy-donor/`.
- Delete `src/modules/legacy-app/`.
- Rewrite all comments/saved/related/popular logic.
- Move Store folders.
- Implement OAuth/Blogger API.
- Add dependencies.
- Edit generated `dist/**` or `.cloudflare-build/**` manually.
- Add Tailwind/shadcn/Tiptap to public Blog/Store/Landing.
- Create universal templates like `gg-template-button`, `gg-template-div`, `gg-template-link`, `gg-template-element`, or `gg-template-generic`.

## Required final response
Report:

- files changed
- bucket inventory summary
- `legacy-app.js` size/count summary if available
- whether any optional helper extraction was performed
- validation command output summary

End with the exact final validation command.
