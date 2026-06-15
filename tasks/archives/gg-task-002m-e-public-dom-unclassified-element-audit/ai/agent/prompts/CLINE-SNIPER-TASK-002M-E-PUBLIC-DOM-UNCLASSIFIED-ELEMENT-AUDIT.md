# CLINE SNIPER — TASK-002M-E — Public DOM Unclassified Element Audit

You are working in the GG vNext repo.

## Mission

Complete the Public DOM audit by classifying all current `document.createElement(...)` calls that are still reported as `unclassified` by `npm run check:public-dom`.

This task is an **audit + policy + guardrail** pass only.

Do not migrate UI to templates in this task. If you find a UI/chrome structure that should be templated, record it as `needsTemplate` and document a follow-up task.

## Current expected context

Previous tasks completed:

- TASK-002L: restricted DOM API audit (`innerHTML`, `insertAdjacentHTML`, `outerHTML`, large HTML strings)
- TASK-002L-B: `createElement` SRC audit
- TASK-002M-B: Blog `section`/`article` migrated to templates
- TASK-002M-C: Blog button chrome migrated to purpose-specific templates
- TASK-002M-D: Store discovery buttons migrated to purpose-specific templates

At this point, `needsTemplate` for known major tags should be zero, but current `check:public-dom` may still have `unclassified` tags like:

- `div`
- `strong`
- `textarea`
- `img`
- `p`
- `h2`
- `a`
- `iframe`
- `script`

These are not automatically wrong. They must be classified by occurrence and context.

## Files you will likely edit

- `config/public-dom-generation-policy.json`
- `docs/public-dom-generation-audit.md`
- `checks/public-dom.check.mjs`
- `scripts/task002m-e-acceptance.sh`
- `tasks/active/TASK-002M-E-PUBLIC-DOM-UNCLASSIFIED-ELEMENT-AUDIT.md`

Do not edit generated files under:

- `dist/**`
- `.cloudflare-build/**`
- `.wrangler/**`

## Required policy shape

Extend `config/public-dom-generation-policy.json` with an occurrence-level audit section. Prefer this exact shape under the existing `createElementAudit` object:

```json
{
  "createElementAudit": {
    "unclassifiedElementAudit": {
      "scope": ["src/**/*.js", "src/**/*.mjs"],
      "principle": "Unclassified createElement usage must be reviewed by occurrence. Small behavior/runtime construction may stay in JS; public chrome/UI structure should move to HTML/XML or purpose-specific templates.",
      "classificationRequired": true,
      "reviewedTags": ["div", "strong", "textarea", "img", "p", "h2", "a", "iframe", "script"],
      "classifications": [
        "allowedSmallBehavior",
        "allowedRuntimeConstruct",
        "allowedLegacyParsing",
        "allowedNonChromeInfrastructure",
        "needsTemplate"
      ],
      "reviewedOccurrences": []
    }
  }
}
```

`reviewedOccurrences` must be non-empty and must classify current unclassified createElement occurrences by file/tag/context/reason. Example item:

```json
{
  "file": "src/modules/example/example.js",
  "tag": "img",
  "classification": "allowedRuntimeConstruct",
  "context": "dynamic media asset element",
  "reason": "The image source/alt are data-driven runtime values; it is not static public chrome structure.",
  "templateRequired": false
}
```

If an occurrence is UI/chrome and should eventually be templated, use:

```json
{
  "file": "src/modules/example/example.js",
  "tag": "div",
  "classification": "needsTemplate",
  "context": "panel/card/container shell",
  "reason": "This is structural public UI and should be represented in HTML/XML or a purpose-specific template.",
  "templateRequired": true,
  "followUpTask": "TASK-002M-F"
}
```

## Classification rules

Do not classify by tag alone. Classify by actual occurrence and use.

### Allowed small behavior

Allowed when the created element is tiny behavior/state support, such as:

- hidden label
- small inline text node wrapper
- icon-related span/strong only when non-structural
- temporary measurement node that is removed

### Allowed runtime construct

Allowed when element must exist at runtime because its essential attributes are data/runtime-driven:

- `img` for dynamic image asset
- `iframe` for embed target controlled by runtime data
- `script` for lazy loader / third-party loader, if safe and already expected
- `textarea` for editor/input runtime mechanics, if not public chrome structure

### Allowed legacy parsing

Allowed when element is used only for parsing/extraction, never inserted as public UI chrome.

### Allowed non-chrome infrastructure

Allowed when it supports behavior/infrastructure and is not visible/public chrome, for example staging container, temporary fragment helper, or measurement element.

### Needs template

Use `needsTemplate` when createElement builds public UI structure, especially:

- card
- panel
- command row
- listing row
- empty state
- drawer/sheet/chrome
- navigation item
- comment row
- substantial wrapper/container

Do not migrate it in this task; record it.

## Update `checks/public-dom.check.mjs`

Enhance the check so that current unclassified createElement calls are no longer silently reported as generic `unclassified` once reviewed.

Expected behavior:

1. Scan `src/**/*.js` and `src/**/*.mjs` as before.
2. Classify createElement calls in this order:
   - known allowed small tags/rules
   - known needsTemplate tags/rules
   - occurrence-level reviewed classifications from policy
   - otherwise `unclassified`
3. Print a summary including at least:
   - total createElement count
   - allowedSmall count
   - allowedRuntime/allowedReviewed count
   - needsTemplate count
   - unclassified count
4. Fail only when there are new/unreviewed `unclassified` findings or unallowlisted restricted API findings.

After this task, the current repo should produce:

```txt
unclassified=0
```

`needsTemplate` may be `0` or greater depending on your actual review, but any nonzero value must be documented as a follow-up candidate, not silently allowed.

## Update docs

Update `docs/public-dom-generation-audit.md` with a section named:

```md
## TASK-002M-E — Public DOM Unclassified Element Audit
```

Include:

- tags reviewed
- count summary
- occurrence classification table
- any `needsTemplate` follow-up candidates
- statement that no migration was performed

## Create acceptance script

Create `scripts/task002m-e-acceptance.sh`.

It must:

1. run the full validation pipeline
2. run `npm run check:public-dom` and verify output contains `unclassified=0`
3. verify `config/public-dom-generation-policy.json` contains `unclassifiedElementAudit`
4. verify `reviewedOccurrences` exists and is non-empty
5. verify docs contain `TASK-002M-E`

## Boundaries

Do not:

- migrate UI templates in this task
- remove createElement calls
- create universal generic templates
- edit `dist/**` or `.cloudflare-build/**`
- restructure app folders
- implement OAuth/Blogger API
- install dependencies
- delete `legacy-donor/`

## Final command

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002m-e-acceptance.sh
```

## Completion report

Report:

- files changed
- total createElement count
- reviewed occurrence count
- remaining unclassified count, expected `0`
- any `needsTemplate` follow-up candidates
- confirmation that no UI migration was performed
