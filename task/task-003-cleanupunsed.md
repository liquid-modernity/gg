# TASK — Safe Unused Cleanup After Audit

Use this file as the cleanup source:

`docs/audits/UNUSED_CLEANUP_CANDIDATES.md`

Also respect:

- `SYSTEM_ARCHITECTURE_AND_CODING_STANDARDS.md`
- `docs/audits/SYSTEM_ARCHITECTURE_COMPLIANCE_REPORT.md`
- `docs/audits/system-architecture-compliance-score.json`

This is a SAFE cleanup task.

Do not perform broad cleanup.
Do not delete high-risk files.
Do not remove generated files unless their source/build relationship is documented.
Do not remove CSS/JS only from static grep evidence if selectors or functions may be used dynamically.
Do not change production flags.
Do not refactor architecture.
Do not move folders.
Do not rewrite features.

The goal is to remove confirmed junk and low-risk unused files only.

---

## Allowed Cleanup

You may remove only:

1. `.DS_Store`
2. `__MACOSX`
3. confirmed duplicate junk files
4. empty folders
5. obsolete local artifacts clearly not used by build, QA, deploy, runtime, docs, or generated output
6. low-risk unused assets with no references in:
   - source
   - generated output
   - docs
   - QA
   - tools
   - tests
   - workflows
   - package scripts
   - Worker
   - Blogger template output
   - store output

---

## Not Allowed Without Explicit Human Approval

Do not remove:

- controller core
- route registry
- schema builders
- Blogger template fragments
- store generator
- Worker routing
- QA guard scripts
- GitHub workflow scripts
- `index.xml`
- `dist` publish output
- service worker/cache manifest
- generated sitemap/feed output
- registry keys
- CSS hooks
- data attributes
- accessibility hooks
- files used only through dynamic string references
- anything marked medium-risk or high-risk in the audit report

---

## Required Evidence Before Deleting

For every removed path, provide evidence:

1. search evidence
2. import/reference evidence
3. whether it is source or generated
4. whether it affects build
5. whether it affects QA
6. whether it affects deploy
7. whether it affects public routes
8. why removal is safe

Use grep/search before deletion.

At minimum, check references in:

```bash
grep -R "filename-or-path" .
grep -R "basename" .

Also inspect:

package.json
/src
/registry
/qa
/tools
/tests
.github/workflows
worker.js
wrangler.toml
index.xml
landing.html
store.html
/dist
/store
/assets
Required Output

Create:

docs/audits/UNUSED_CLEANUP_REPORT.md

Use this structure:

# UNUSED CLEANUP REPORT

## 1. Summary

## 2. Removed Files/Folders

| Removed Path | Type | Evidence | Risk | Validation |
|---|---|---|---|---|

## 3. Kept Candidates

| Path | Reason Kept | Risk |
|---|---|---|

## 4. Not Touched Without Approval

| Path | Reason |
|---|---|

## 5. Commands Run

## 6. Failed Commands

## 7. Remaining Cleanup Recommendations
Required Validation

After cleanup, run:

npm ci
npm run build
npm run ci:qa
npm run ci:85
npm run ci:95

If any command fails, stop and report the failure.

Do not continue deleting more files after a validation failure.

Cleanup Priority

Use this order:

remove .DS_Store
remove __MACOSX
remove obvious junk/temporary files
remove empty folders
remove confirmed low-risk unused assets
stop before medium-risk or high-risk cleanup

Do not attempt “deep cleanup” in this task.

Final Response

When done, summarize only:

files removed
files kept because risky
commands run
commands failed
remaining cleanup candidates