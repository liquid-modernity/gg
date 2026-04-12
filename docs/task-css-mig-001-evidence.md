# TASK-CSS-MIG-001 Evidence

Status: accepted and deployed
Evidence owner: docs / QA / repo governance
Runtime owner: CSS with scoped JS lifecycle support

This file normalizes the durable repo-relative evidence for TASK-CSS-MIG-001.
Temporary execution paths are not evidence roots. The durable references are this
file, the commits listed below, the repo-relative changed files, and the GitHub
Actions workflow URLs listed here.

## Commit Set

TASK-CSS-MIG-001 is the combined effect of these commits:

| Commit | Message | Purpose |
| --- | --- | --- |
| `40439d8fc464b3601454429b36223cc1fc02ea99` | `feat(css): introduce gg-detail-toolbar runtime family` | Introduced the official `gg-detail-toolbar` runtime family, dual CSS selectors, JS selector fallback, and map/verifier updates. |
| `46392aef32e6fb80290a7baa00376eebf3284ec1` | `fix(css): preserve gg-detail-toolbar on route rehydrate` | Made `PostDetail.init(root)` root-aware for route rehydrate. Live proof still found a same-document gap after this commit, so it is necessary history but not sufficient alone. |
| `0f9474d50c86fa2a29f05af302c0574c4ed71ce9` | `fix(css): upgrade detail toolbar on route swap` | Added the final throttled route-swap toolbar observer so same-document navigation upgrades and binds the official family contract. |

## Files Changed Per Commit

`40439d8fc464b3601454429b36223cc1fc02ea99`:

```text
M docs/css-family-map.md
M public/assets/latest/main.css
M public/assets/latest/modules/ui.bucket.core.js
M public/assets/latest/modules/ui.bucket.post.js
M public/assets/v/ac33998/main.css
M public/assets/v/ac33998/modules/ui.bucket.core.js
M public/assets/v/ac33998/modules/ui.bucket.post.js
M qa/css-family-map.json
M qa/verify-css-map.mjs
```

`46392aef32e6fb80290a7baa00376eebf3284ec1`:

```text
M public/assets/latest/modules/ui.bucket.core.js
M public/assets/v/ac33998/modules/ui.bucket.core.js
```

`0f9474d50c86fa2a29f05af302c0574c4ed71ce9`:

```text
M public/assets/latest/modules/ui.bucket.core.js
M public/assets/v/ac33998/modules/ui.bucket.core.js
```

## Final Effective File Set

Compared with pre-task base `7fbb50551c493c266d55ceae046bfa43939658ab`, the final effective file set is:

```text
M docs/css-family-map.md
M public/assets/latest/main.css
M public/assets/latest/modules/ui.bucket.core.js
M public/assets/latest/modules/ui.bucket.post.js
M public/assets/v/ac33998/main.css
M public/assets/v/ac33998/modules/ui.bucket.core.js
M public/assets/v/ac33998/modules/ui.bucket.post.js
M qa/css-family-map.json
M qa/verify-css-map.mjs
```

No XML, Worker, package, or unrelated route files were part of the final
effective file set.

## Runtime Contract Changed

The official detail toolbar runtime family is now:

```text
.gg-detail-toolbar
.gg-detail-toolbar__group
.gg-detail-toolbar__button
.gg-detail-toolbar__badge
```

The temporary bridge remains:

```text
.gg-post__toolbar
.gg-post__toolbar-group
.gg-post__tool
.gg-post__tool-badge
```

CSS now targets the official family and bridge together. JS upgrades legacy
bridge markup into the official family on hard refresh and same-document route
swaps.

Durable repo proof commands:

```bash
git show HEAD:public/assets/v/ac33998/main.css | rg -n "gg-detail-toolbar|gg-post__toolbar|gg-detail-toolbar__button|gg-post__tool"
git show HEAD:public/assets/v/ac33998/modules/ui.bucket.core.js | rg -n "function init\\(root\\)|bindRouteUpgradeObserver|upgradeDetailToolbar:"
git show HEAD:qa/css-family-map.json | rg -n '"id": "gg-detail-toolbar"|"id": "detail-toolbar-legacy"|post-toolbar-to-detail-toolbar'
```

## Bridge Debt Retained

Bridge debt is intentional and temporary:

| Bridge | Target | Reason retained |
| --- | --- | --- |
| `.gg-post__toolbar` | `gg-detail-toolbar` | Existing template/runtime bridge class remains needed for parity until the template and fallback markup are migrated in a scoped follow-up. |
| `.gg-post__tool` | `gg-detail-toolbar__button` | Existing button class remains needed for dual selector and JS compatibility during migration. |
| `.gg-post__toolbar-group` | `gg-detail-toolbar__group` | Existing group class remains needed for dual selector compatibility. |
| `.gg-post__tool-badge` | `gg-detail-toolbar__badge` | Existing badge class remains needed for dual selector compatibility. |

## Deploy Evidence

Final accepted deploy:

```text
Commit: 0f9474d50c86fa2a29f05af302c0574c4ed71ce9
CI run: https://github.com/liquid-modernity/gg/actions/runs/24292893846
CI conclusion: success
Deploy run: https://github.com/liquid-modernity/gg/actions/runs/24292899771
Deploy workflow: Deploy Worker/Assets to Cloudflare
Deploy conclusion: success
Deploy job: deploy
Deploy job conclusion: success
Deploy job completed: 2026-04-11T22:21:24Z
```

The earlier deploy for commit `46392aef32e6fb80290a7baa00376eebf3284ec1`
was not accepted as final because live same-document navigation proof retained
the same document but left the toolbar bridge-only. That failure drove the final
route-swap observer patch in `0f9474d50c86fa2a29f05af302c0574c4ed71ce9`.

## Final Live Proof

The final post-deploy asset hashes matched across versioned and latest assets:

```text
sha256=b05fa7518579e28a7ea25d6617bbfef6fd894884a9eb227f235d4d17bd16adc6 path=/assets/v/ac33998/main.css
sha256=b05fa7518579e28a7ea25d6617bbfef6fd894884a9eb227f235d4d17bd16adc6 path=/assets/latest/main.css
sha256=14a4dc313775b95ed06903e73c54de5ced936f4b14abbcb39af1e30bf1477bc6 path=/assets/v/ac33998/modules/ui.bucket.core.js
sha256=14a4dc313775b95ed06903e73c54de5ced936f4b14abbcb39af1e30bf1477bc6 path=/assets/latest/modules/ui.bucket.core.js
sha256=bbb725b5eb1570caa6c7a89d5e8c946fcf1f3e9d9d75c0d45d758e570cc26758 path=/assets/v/ac33998/modules/ui.bucket.post.js
sha256=bbb725b5eb1570caa6c7a89d5e8c946fcf1f3e9d9d75c0d45d758e570cc26758 path=/assets/latest/modules/ui.bucket.post.js
```

Hard-refresh proof passed for post and page:

```text
post /2026/02/todo.html:
toolbarClass="gg-post__toolbar gg-detail-toolbar"
hasOfficialToolbarClass=true
hasBridgeToolbarClass=true
buttonCount=7
officialButtonCount=7
bridgeButtonCount=7
shareButtonExists=true
shareSheet.open=true

page /p/about.html:
toolbarClass="gg-post__toolbar gg-detail-toolbar"
hasOfficialToolbarClass=true
hasBridgeToolbarClass=true
buttonCount=7
officialButtonCount=7
bridgeButtonCount=7
shareButtonExists=true
shareSheet.open=true
```

Same-document navigation proof passed from home card title link to post:

```text
clicked.href=https://www.pakrpp.com/2026/02/todo.html
sameDocumentTokenRetained=true
surface=post
toolbarClass="gg-post__toolbar gg-detail-toolbar"
hasOfficialToolbarClass=true
hasBridgeToolbarClass=true
buttonCount=7
officialButtonCount=7
bridgeButtonCount=7
shareButtonExists=true
failures=[]
```

## Verification Commands

Local verification used during the task:

```bash
npm run gaga:verify-css-map
npm run gaga:verify-css-sot
npm run gaga:verify-copy
node --check public/assets/v/ac33998/modules/ui.bucket.core.js
node --check public/assets/latest/modules/ui.bucket.core.js
git diff --check
npm run gaga:preflight
npm run gaga:dry
npm run gaga -- --message "fix(css): upgrade detail toolbar on route swap"
```

The final local release dry run selected only:

```text
M public/assets/latest/modules/ui.bucket.core.js
M public/assets/v/ac33998/modules/ui.bucket.core.js
```

## Remaining Debt

The official runtime family is active, but bridge markup remains in existing
template and fallback contexts. Remove bridge selectors only in a future scoped
template/runtime migration after parity is proven again.
