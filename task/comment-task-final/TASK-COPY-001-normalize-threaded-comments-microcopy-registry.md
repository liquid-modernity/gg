# TASK-COPY-001 — Normalize Threaded Comments Microcopy Registry EN/ID and Remove Hardcoded Comment Strings

## Goal

Make threaded comment microcopy fully registry-driven for English and Indonesian, and eliminate the current risk of swapped root copy files and hardcoded comment strings.

This is a copy/internationalization task. It must not change threaded comment behavior.

## Problem

The current archive shows a dangerous split:

- root `gg-copy-en.json` appears to contain Indonesian copy and `script id='gg-copy-id'`;
- root `gg-copy-id.json` appears to contain English copy and `script id='gg-copy-en'`;
- `registry/copy/gg-copy-en.json` and `registry/copy/gg-copy-id.json` appear semantically correct;
- several comments strings are still hardcoded in JS/template output.

If the build/template path reads the root files, locale output can be reversed. If runtime reads registry files, it may be safe now, but the root files remain a future regression trap.

## Non-negotiable constraints

- Do not change reply logic.
- Do not change comment DOM architecture.
- Do not change native Blogger composer behavior.
- Do not reintroduce sort/newest/oldest UI.
- Do not perform CSS extraction here.

## Files to inspect

At minimum inspect:

- `gg-copy-en.json`
- `gg-copy-id.json`
- `registry/copy/gg-copy-en.json`
- `registry/copy/gg-copy-id.json`
- `gg-copy-manifest.json`
- `gg-copy-meta.json`
- `tools/template-pack.mjs`
- `scripts/build-critical-copy.py`
- `src/js/gg-app.source.js`
- `src/js/modules/controllers/panel-controller.fragment.js`
- `src/js/modules/controllers/listing-growth.fragment.js`
- `src/js/modules/core/state-dom.fragment.js`
- `template/index.original.xml`
- `template/partials/19-big-app-script-wrapper-original.xml`
- generated `__gg/assets/js/gg-app.dev.js`
- generated `__gg/assets/js/gg-app.min.js`

## Required copy keys

Ensure these keys exist in both EN and ID registries.

### English

```json
{
  "comments.title": "Comments",
  "comments.dismiss": "Dismiss comments panel",
  "comments.action.add": "Add comment",
  "comments.action.addReply": "Add a reply",
  "comments.action.reply": "Reply",
  "comments.action.replyToOriginal": "Reply to original comment",
  "comments.action.copyLink": "Copy link",
  "comments.action.delete": "Delete comment",
  "comments.action.more": "More comment actions",
  "comments.action.cancelReply": "Cancel reply",
  "comments.replyingTo": "Replying to",
  "comments.originalComment": "Original comment",
  "comments.replies.title": "Replies",
  "comments.replies.view.one": "View 1 reply",
  "comments.replies.view.many": "View {count} replies",
  "comments.replies.count.one": "1 reply",
  "comments.replies.count.many": "{count} replies",
  "comments.loadMore": "Load more comments",
  "comments.loadMoreReplies": "Load more replies",
  "comments.empty.title": "No comments yet",
  "comments.empty.body": "Be the first to add one.",
  "comments.toolbar.add": "Add comment",
  "comments.toolbar.disabled": "Comments disabled",
  "comments.toolbar.count.one": "1 comment",
  "comments.toolbar.count.many": "{count} comments",
  "comments.status.copying": "Copying comment link...",
  "comments.status.copied": "Comment link copied",
  "comments.status.failed": "Comment action failed"
}
```

### Indonesian

```json
{
  "comments.title": "Komentar",
  "comments.dismiss": "Tutup panel komentar",
  "comments.action.add": "Tambah komentar",
  "comments.action.addReply": "Tambah balasan",
  "comments.action.reply": "Balas",
  "comments.action.replyToOriginal": "Balas komentar awal",
  "comments.action.copyLink": "Salin tautan",
  "comments.action.delete": "Hapus komentar",
  "comments.action.more": "Aksi komentar lainnya",
  "comments.action.cancelReply": "Batalkan balasan",
  "comments.replyingTo": "Membalas",
  "comments.originalComment": "Komentar awal",
  "comments.replies.title": "Balasan",
  "comments.replies.view.one": "Lihat 1 balasan",
  "comments.replies.view.many": "Lihat {count} balasan",
  "comments.replies.count.one": "1 balasan",
  "comments.replies.count.many": "{count} balasan",
  "comments.loadMore": "Muat komentar lainnya",
  "comments.loadMoreReplies": "Muat balasan lainnya",
  "comments.empty.title": "Belum ada komentar",
  "comments.empty.body": "Jadilah yang pertama berkomentar.",
  "comments.toolbar.add": "Tambah komentar",
  "comments.toolbar.disabled": "Komentar dinonaktifkan",
  "comments.toolbar.count.one": "1 komentar",
  "comments.toolbar.count.many": "{count} komentar",
  "comments.status.copying": "Menyalin tautan komentar...",
  "comments.status.copied": "Tautan komentar disalin",
  "comments.status.failed": "Aksi komentar gagal"
}
```

## Required hardcoded-string cleanup

Replace hardcoded strings in source JS/template fragments with registry lookup helpers. Search at minimum:

```bash
grep -RIn "Original comment\|Add a reply\|Add a reply to original comment\|Cancel reply\|Comments disabled\|Add comment\| comments" \
  src template qa __gg dist index.xml template/index.original.xml
```

Expected final state:

- `src/` and `template/partials/` should use copy lookup or data attributes, not literal UI copy, except in tests that intentionally assert copy keys.
- generated `dist/` and `__gg/` may contain rendered output after build, but they must be generated from source/registry, not manually patched.
- QA assertions should prefer stable selectors/data attributes over English text where possible.

## Root copy file normalization

Ensure root files are not reversed:

- `gg-copy-en.json` must contain English copy and, if wrapped, use `script id='gg-copy-en'`.
- `gg-copy-id.json` must contain Indonesian copy and, if wrapped, use `script id='gg-copy-id'`.
- `registry/copy/gg-copy-en.json` must remain English.
- `registry/copy/gg-copy-id.json` must remain Indonesian.

If root files are generated artifacts, fix the generator, not only the output.

## Deprecated copy keys

The following legacy copy keys should be marked deprecated or removed only after confirming no active UI/proof still depends on them:

```text
comments.toolbar.width.sidebar
comments.toolbar.width.wide
comments.toolbar.sort.newest
comments.toolbar.sort.oldest
comments.toolbar.sort.toggleToNewest
comments.toolbar.sort.toggleToOldest
```

Do not reintroduce the sort UI just because old copy keys exist.

## Required QA

Run:

```bash
npm run gaga:verify-comments-proof
npm run gaga:template:pack
npm run gaga:template:proof
```

Also add or run a copy-specific check that confirms:

- root EN is English;
- root ID is Indonesian;
- registry EN is English;
- registry ID is Indonesian;
- required comments keys exist in both locales;
- no forbidden hardcoded comment UI strings remain in source controller modules.

A small script is acceptable, e.g.:

```bash
node qa/copy-registry-guard.mjs
```

## Acceptance criteria

This task is accepted when:

1. EN/ID root files are no longer reversed.
2. EN/ID registry files contain the required comment keys.
3. Threaded comment UI strings are registry-driven.
4. Legacy sort/width copy is removed or explicitly deprecated.
5. Existing comment behavior remains unchanged.
6. Local proof passes.

## Output required from Codex

```text
TASK-COPY-001 completed.

Changed:
- EN/ID root copy normalized: YES/NO
- Registry comments keys completed: YES/NO
- Hardcoded comments strings removed from source: YES/NO
- Deprecated sort/width copy handled: YES/NO

Verification:
- copy registry guard: PASS/FAIL
- npm run gaga:verify-comments-proof: PASS/FAIL
- npm run gaga:template:pack: PASS/FAIL
- npm run gaga:template:proof: PASS/FAIL

Behavior changed:
- threaded comment reply logic changed: NO
```
