# XML Naming Alignment Patch
**Target:** `gaga-rules-of-xml.md`  
**Status:** Proposed binding patch  
**Purpose:** Normalize XML-side family names, hook contracts, and internal machine-facing contract language so they comply with `GG-NAMING.md`.

---

## 1. Patch Objective

This patch updates `gaga-rules-of-xml.md` so that:
- XML-side official family names use GAGA-ish naming
- generic family names stop acting as final internal contract names
- toolbar, info-sheet, comments, editorial-preview, share, dock, and mixed-media contracts use one language across XML, CSS, JS, and docs
- legacy names remain migration bridges only, not silent active architecture

---

## 2. Replace authority line in header

Replace:

```md
**Authority:** Subordinate to `BLOG_GAGA_ISH_MASTER_CONTRACT.md`
```

With:

```md
**Authority:** Subordinate to `BLOG_GAGA_ISH_MASTER_CONTRACT.md` and governed by `GG-NAMING.md` for all naming-related matters
```

---

## 3. Add naming law to scope

Under XML-specific scope, add:

- XML-side family naming compliance with GG law
- selector and hook naming discipline across XML contracts
- deprecation and migration control for legacy XML family names

---

## 4. Add new section after Non-Negotiables

### 3.7 No naming drift in XML
XML may not preserve a generic family registry while hooks, selectors, and adjacent docs use GG naming. XML-side contract language must converge toward one GAGA-ish system.

### 3.8 No dishonest GG naming
A GG-prefixed name is still invalid if the meaning is dishonest or the ownership is unclear.

### 3.9 Legacy names are migration debt
Legacy XML family names may survive only as documented migration bridges. They may not remain the silent active law.

---

## 5. Add to Section 8 DOM Contract Rules

Add new clauses:

### 8.8 Naming law compliance
All machine-facing XML contract names must comply with `GG-NAMING.md`.

### 8.9 Generic vs official name rule
Human-readable prose may use short descriptive language, but official XML-side family contracts, selectors, hooks, and template identifiers must remain GG-scoped where applicable.

---

## 6. Rewrite Official Render-Context Registry family references

The render-context names themselves may remain conceptual:
- `listing`
- `landing`
- `post`
- `page`
- `special`
- `error`
- `offline`
- `global`

But internal machine-facing family references inside the registry should be normalized as follows.

### `listing` normalized family language
Replace generic references such as:
- post cards
- listing card toolbar
- editorial-preview
- listing preview TOC
- mixed-media primer
- mixed-media sekunder
- dock shell

With explicit GG-scoped internal family references such as:
- `gg-post-card`
- `gg-listing-card-toolbar`
- `gg-editorial-preview`
- listing preview TOC host under GG contract naming
- `gg-mixed-media` primer
- `gg-mixed-media` secondary rails
- `gg-dock` host / listing behavior variant

### `post` normalized family language
Replace generic references such as:
- detail toolbar
- detail info sheet
- post TOC
- comments panel host
- share trigger

With:
- `gg-detail-toolbar`
- `gg-detail-info-sheet`
- `gg-toc`
- `gg-comments-panel` host
- `gg-share-sheet` trigger contract

### `page` normalized family language
Replace generic references such as:
- detail toolbar
- page detail info sheet
- comments panel host
- share trigger
- page TOC

With:
- `gg-detail-toolbar`
- `gg-detail-info-sheet`
- `gg-comments-panel` host when enabled
- `gg-share-sheet` trigger contract when enabled
- `gg-toc` host when justified

### `global` normalized family language
Replace generic references such as:
- dock host
- toast host
- dialog host
- overlay host
- lightweight share-sheet host
- lightweight drawer/sheet host

With:
- `#gg-dock` / `gg-dock` host
- `#gg-toast` / `gg-toast` host
- `#gg-dialog` / `gg-dialog` host
- `#gg-overlay` / `gg-overlay` host
- `#gg-share-sheet` / `gg-share-sheet` lightweight host
- `gg-sheet` / `gg-drawer` lightweight hosts where justified

---

## 7. Rewrite Specific Contracts That Must Survive

### Replace Section 9.2 TOC contract with

```md
### 9.2 TOC contract
- `#gg-toc` = `gg-toc` host for post TOC by default
- page TOC may use `gg-toc` only where ownership and behavior remain consistent
- listing preview TOC is a listing-only preview component under its own GG-scoped contract language
- do not merge post TOC, page TOC, and listing preview TOC into one vague ownership bucket
```

### Replace Section 9.3 Share contract with

```md
### 9.3 Share contract
- listing share must remain functional
- post share must remain functional
- page share must remain functional where page detail toolbar enables it
- `#gg-share-sheet` is the global host for `gg-share-sheet`
- share-sheet payload may be delayed, but host and trigger contract must stay stable
```

### Replace Section 9.4 Dock contract with

```md
### 9.4 Dock contract
- `#gg-dock` is the global host for `gg-dock`
- `gg-dock` behavior must remain context-aware
- global dock presence does not justify duplicate dock systems per surface
```

### Replace Section 9.5 Toolbar contract with

```md
### 9.5 Toolbar contract
- `gg-detail-toolbar` belongs to post and page non-system detail contexts
- `gg-listing-card-toolbar` belongs to listing cards only
- the two toolbar families may share design DNA but not ownership identity
```

### Replace Section 9.6 Editorial-preview contract with

```md
### 9.6 Editorial-preview contract
`gg-editorial-preview` is an official listing-owned component family.
It is not a synonym for post/page metadata infrastructure, and it may not be quietly renamed back to `info-panel`.
```

### Replace Section 9.7 Detail-info-sheet contract with

```md
### 9.7 Detail-info-sheet contract
Post/page detail metadata infrastructure must use `gg-detail-info-sheet` as its explicit detail family.
It may not hide under `gg-editorial-preview` naming.
Legacy names such as `gg-info-panel` or `gg-postinfo` may survive only as documented migration bridges.
```

### Replace Section 9.8 Comments contract with

```md
### 9.8 Comments contract
Comments remain a protected Blogger-controlled subsystem.
XML may integrate shells and wrappers around comments through `gg-comments` / `gg-comments-panel` contracts, but may not casually restructure comments internals into fragile assumptions.
```

### Replace Section 9.9 Support-action contract with

```md
### 9.9 Support-action contract
If listing card support exists, it must use semantically honest GG-scoped action naming.
It may not remain mislabeled as `like` or another unrelated action.
```

---

## 8. Add new section under Blogger Section and Widget Shell Law

### 11.5 Family naming honesty in widget shells
A Blogger section or widget shell may not preserve a legacy or generic family name as the active XML law if the official family name has already moved to a GG-scoped contract.

Examples:
- `gg-info-panel` may survive temporarily as legacy bridge, but not as the final active family name for detail metadata infrastructure
- `gg-editorial-preview` may not be reused for detail info sheet ownership

---

## 9. Add new section under Hook and Naming Discipline

### 13.5 Official XML-side family examples
The intended XML-side contract language includes:
- `gg-dock`
- `gg-detail-toolbar`
- `gg-listing-card-toolbar`
- `gg-editorial-preview`
- `gg-detail-info-sheet`
- `gg-comments-panel`
- `gg-share-sheet`
- `gg-labeltree`
- `gg-mixed-media`
- `gg-zone-*` for editable placement zones only

These names may appear in prose without the `gg-` prefix for readability, but internal contract naming must remain GG-scoped.

---

## 10. Add new section under Migration Policy

### 20.6 Naming migration order
When XML family names are migrated toward GG compliance, the preferred order is:
1. document the old and new family names
2. preserve legacy hooks only as bridge selectors if needed
3. update XML-side contract prose and owned hosts
4. verify JS and CSS parity
5. purge legacy names after parity passes

A naming cleanup that renames XML contracts without migration logic must be rejected.

---

## 11. Add to XML Rejection Triggers

Add these bullets:
- keeps generic family names as final XML-side internal contracts after GG naming law is adopted
- rebrands a dishonest or vague family name with `gg-` without fixing meaning
- preserves legacy XML family names as active architecture without a documented migration bridge
- lets XML, CSS, JS, and docs drift into separate family languages

---

## 12. Acceptance note

This patch is considered complete only if, after adoption:
- `gaga-rules-of-xml.md` no longer treats generic family names as final internal contract names
- XML-side family language is compatible with `GG-NAMING.md`
- `gg-detail-toolbar`, `gg-listing-card-toolbar`, `gg-editorial-preview`, `gg-detail-info-sheet`, `gg-comments-panel`, `gg-share-sheet`, and `gg-dock` become the stable XML-side contract language
- legacy names are explicitly downgraded to migration bridges only

