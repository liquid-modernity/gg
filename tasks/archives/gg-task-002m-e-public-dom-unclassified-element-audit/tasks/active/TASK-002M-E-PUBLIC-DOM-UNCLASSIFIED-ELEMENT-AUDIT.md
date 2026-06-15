# TASK-002M-E — Public DOM Unclassified Element Audit

## Intent

Finish the public DOM generation audit by classifying all remaining unclassified `document.createElement(...)` usage in `src/**/*.js` and `src/**/*.mjs`.

This protects the project rule:

> Struktur UI besar jangan tersembunyi di JS. State/behavior kecil boleh dikelola JS.

## Scope

In scope:

- Update public DOM generation policy.
- Update `check:public-dom` classification logic.
- Add occurrence-level review for current unclassified createElement calls.
- Update audit documentation.
- Add acceptance script.

Out of scope:

- Template migration.
- Folder restructure.
- OAuth/Blogger implementation.
- Generated output edits.
- Deleting `legacy-donor/`.

## Required outcome

`npm run check:public-dom` must pass and report:

```txt
unclassified=0
```

Any real UI/chrome structures discovered must be classified as `needsTemplate` and documented as follow-up, not migrated in this task.

## Candidate tags to review

Review current unclassified tags such as:

```txt
div, strong, textarea, img, p, h2, a, iframe, script
```

Do not blanket-allow by tag. Classify by occurrence and reason.

## Acceptance command

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002m-e-acceptance.sh
```
