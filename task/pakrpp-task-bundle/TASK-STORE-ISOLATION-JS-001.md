# TASK-STORE-ISOLATION-JS-001
## Harden root listing append pipeline against Store content leakage

### Context

The XML/SSR layer has already been updated so root listing no longer renders posts with Store / Store* labels or embedded store payloads.

A new SSR row marker has also been added:

```html
data-gg-content-domain="store"

or

data-gg-content-domain="blog"

However, the JS listing-growth / append pipeline may still fetch and append rows from Blogger pagination/search pages. This means Store rows can leak back into the root listing after initial SSR render, especially through /search?updated-max=...&max-results=... or similar Blogger pagination routes.

Do not change the already-working XML isolation logic unless absolutely necessary.

Objective

Prevent appendListingRows() or equivalent listing-growth logic from appending Store-domain rows into the root Blog listing.

Root Blog listing must contain only non-Store content.

Store content must still be allowed in:

/store
/store/*
/search/label/Store
/search/label/Store%20*
native label routes when intentionally opened
product/detail pages
Required behavior

When current surface is root Blog listing:

state.surfaceContext?.isRootListing === true

or equivalent route/surface detection indicates the current page is /, then any imported row with:

data-gg-content-domain="store"

must be skipped before append.

Expected guard:

const domain = imported.getAttribute('data-gg-content-domain');

if (
  state.surfaceContext?.isRootListing &&
  domain === 'store'
) {
  continue;
}

Adapt variable names to the existing codebase.

Important constraints
Do not hardblock Store globally.
Do not block Store rows on /store.
Do not block Store rows on /search/label/Store or Store label archives.
Do not rely on post title matching such as "Minimal Barrier Serum".
Do not rely on URL substring guesses unless used only as a fallback.
Prefer the SSR marker data-gg-content-domain.
Keep the patch minimal.
Do not introduce Playwright.
Do not add heavy runtime logic.
Do not rewrite listing architecture.
Implementation target

Search for functions or modules related to:

appendListingRows
listing-growth
postcards
gg-entry-row
fetch pagination
load more
imported rows

Patch the append loop so Store rows are skipped before DOM insertion when the current surface is root listing.

Pseudo-structure:

function appendListingRows(rows) {
  for (const imported of rows) {
    const domain = imported.getAttribute('data-gg-content-domain');

    if (
      state.surfaceContext?.isRootListing &&
      domain === 'store'
    ) {
      // Optional: increment proof counter
      state.proof.storeRowsSkippedFromRoot =
        (state.proof.storeRowsSkippedFromRoot || 0) + 1;

      continue;
    }

    // existing duplicate/url checks
    // existing append logic
  }
}

If state.surfaceContext?.isRootListing does not exist in the actual code path, create a small helper:

function isRootListingSurface() {
  return (
    location.pathname === '/' ||
    document.documentElement?.dataset?.ggSurfaceKind === 'root-listing' ||
    document.body?.dataset?.ggSurfaceKind === 'root-listing'
  );
}

Use existing project route/surface conventions if available.

Proof / diagnostics

Expose proof field if the project already has a proof object.

Suggested fields:

storeRowsSkippedFromRoot
storeAppendGuardEnabled
rootListingAppendGuardActive

Example:

GG.listingGrowthProof?.()

or existing equivalent should report:

{
  "storeAppendGuardEnabled": true,
  "rootListingAppendGuardActive": true,
  "storeRowsSkippedFromRoot": 0
}

storeRowsSkippedFromRoot may be 0 on clean SSR pages. That is okay. The important part is that the guard exists and activates on root listing.

QA guard update

Update qa/store-isolation-guard.mjs or equivalent so it no longer only checks keyword presence.

The guard must verify:

data-gg-content-domain exists in SSR row markup.
JS contains a root listing append guard.
JS checks for data-gg-content-domain.
JS skips or continues when domain equals "store" and root listing is active.
The old fragile pattern is not the only protection:
data:view.isHomepage and

should not be accepted as the sole Store isolation mechanism.

The guard should fail if the XML has SSR filtering but JS append guard is missing.

Acceptance criteria
Must pass
Root / initial SSR listing contains no Store posts.
Root / after listing-growth / pagination append contains no Store posts.
Minimal Barrier Serum does not appear on /.
Store posts still appear on /store.
Store posts still appear on /search/label/Store.
No visual regression on Blog listing.
No JS error in console.
No Playwright required.
Must not happen
Do not hide normal Blog posts.
Do not break product detail pages.
Do not break /store.
Do not redirect label routes.
Do not remove Store labels from posts.
Do not hardcode product titles.
Do not make Worker responsible for filtering this.
Final response required from Codex

Report:

Files changed.
Exact function patched.
Guard condition added.
Proof fields added or existing proof updated.
QA command/result.
Confirmation that Store is filtered only from root listing append, not globally.