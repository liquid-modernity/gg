# GG-NAMING.md
**Status:** Active operational law  
**Authority:** Subordinate to `BLOG_GAGA_ISH_MASTER_CONTRACT.md`  
**Scope:** All naming, hook contracts, selector contracts, token naming, component family naming, registry naming, SSOT naming, ledger naming, event/storage naming, and naming-related migration decisions for BLOG GAGA-ish.

---

## 0. Purpose

This document exists to enforce one naming system for BLOG GAGA-ish so that the project remains:

- readable by humans
- predictable for AI-assisted work
- auditable across XML, CSS, JS, and docs
- honest in semantics
- strict enough to prevent naming drift, hook drift, and parallel dialects

This document is not a style preference. It is naming law.

---

## 1. Authority and Precedence

### 1.1 Precedence order
1. `BLOG_GAGA_ISH_MASTER_CONTRACT.md`
2. `GG-NAMING.md`
3. `gaga-rules-of-css.md`
4. `gaga-rules-of-xml.md`
5. wave prompts / patch prompts / task-specific AI instructions

### 1.2 Conflict rule
If a prompt, patch note, or local convenience naming conflicts with this document, the prompt or patch is invalid.

### 1.3 Naming law scope
This document governs:
- JS namespace naming
- CSS class naming
- ID naming
- `data-gg-*` hook naming
- CSS custom property naming
- component family naming
- primitive family naming
- render-context-facing contract names when machine-facing
- event names
- storage keys
- registry names
- ledger names
- SSOT/manifests/internal contract identifiers
- template IDs
- deprecation and migration naming rules

---

## 2. Core Principle

### 2.1 One internal language
All internal system contracts must use **GAGA-ish naming**.

That means all internal machine-facing contracts must use the GG/GAGA-ish namespace consistently across:
- hooks
- selectors
- family names
- templates
- tokens
- events
- storage
- registries
- ledgers
- manifests
- contract identifiers

### 2.2 Semantic honesty rule
A GG-prefixed name is still wrong if the meaning is dishonest.

Examples of dishonest naming:
- naming a support action as `like`
- using `editorial-preview` for detail metadata infrastructure
- keeping `info-panel` as an active family when the real family is different

### 2.3 No parallel dialects
It is forbidden to let the project evolve two parallel naming systems such as:
- generic registry names in docs
- GG-prefixed names in code
- legacy names in XML
- vague aliases in JS adapters

The goal is one language, not a translation layer that never ends.

---

## 3. What Must Be GAGA-ish

The following must use GG/GAGA-ish naming:

1. JS namespace
2. CSS classes
3. IDs
4. internal data attributes
5. CSS custom properties
6. component family names
7. primitive family names
8. template IDs
9. custom event names
10. storage keys
11. selector ledgers
12. hook ledgers
13. registries
14. manifests
15. SSOT-side internal contract identifiers
16. migration adapters that touch internal contracts

---

## 4. What Must NOT Be Renamed into GG

The following must remain standard web/platform language and must **not** be forced into GG-prefixed naming:

- HTML native attributes
- ARIA attributes
- standard DOM properties
- semantic HTML element names
- schema.org vocabulary
- canonical/meta conventions
- native Blogger comment internals inside protected zone
- third-party standards that are external by definition

GG naming governs **our internal system contracts**, not the whole internet.

---

## 5. Namespace Rules

### 5.1 JavaScript namespace
- Official global namespace: `window.GG`
- No other global product namespace is allowed.

Examples:
- `window.GG`
- `GG.boot`
- `GG.dock`
- `GG.share`

### 5.2 CSS classes
All classes must use `.gg-*` naming.

Primary form:
- Block: `.gg-[family]`
- Element: `.gg-[family]__[element]`
- Modifier: `.gg-[family]--[modifier]`

Examples:
- `.gg-post-card`
- `.gg-post-card__toolbar`
- `.gg-post-card--featured`
- `.gg-detail-toolbar`
- `.gg-detail-toolbar__button`

### 5.3 State classes
Project-wide state class system:
- `.gg-is-[state]`

Examples:
- `.gg-is-open`
- `.gg-is-active`
- `.gg-is-loading`
- `.gg-is-stale`

Generic states like `.active`, `.selected`, `.open` are legacy only and forbidden for new work.

### 5.4 IDs
IDs are allowed only when justified.

Required form:
- `#gg-[kebab-case]`

Examples:
- `#gg-dock`
- `#gg-share-sheet`
- `#gg-panel-comments`
- `#gg-detail-info-sheet`

### 5.5 Data attributes
All internal data hooks must use:
- `data-gg-*`

Recommended patterns:
- `data-gg-action="kebab-case"`
- `data-gg-state="kebab-case"`
- `data-gg-slot="kebab-case"`
- `data-gg-variant="kebab-case"`
- `data-gg-module="kebab-case"`
- `data-gg-surface="kebab-case"`
- `data-gg-context="kebab-case"`
- `data-gg-role="kebab-case"`

Examples:
- `data-gg-action="support"`
- `data-gg-module="gg-detail-toolbar"`
- `data-gg-context="listing"`

### 5.6 CSS custom properties
All tokens must use:
- `--gg-*`

Examples:
- `--gg-color-surface`
- `--gg-space-4`
- `--gg-radius-md`
- `--gg-shadow-card`
- `--gg-dur-fast`

### 5.7 Template IDs
All internal template IDs must use:
- `gg-tpl-*`

Examples:
- `#gg-tpl-post-card`
- `#gg-tpl-share-item`

### 5.8 Events
All custom internal events must use:
- `gg:[kebab-case]`

Examples:
- `gg:boot`
- `gg:dock-open`
- `gg:share-open`
- `gg:support-route`

### 5.9 Storage keys
All storage keys must use:
- `gg:[kebab-case]`
- version suffix allowed: `:vN`

Examples:
- `gg:prefs`
- `gg:library:v1`
- `gg:cache:v2`

---

## 6. Family Naming Law

### 6.1 All family names must be GG-ish
Primitive families, component families, and structural owned families must use `gg-*` naming when machine-facing or contract-facing.

Examples:
- `gg-dock`
- `gg-drawer-more`
- `gg-share-sheet`
- `gg-editorial-preview`
- `gg-detail-toolbar`
- `gg-listing-card-toolbar`
- `gg-comments-panel`
- `gg-detail-info-sheet`
- `gg-labeltree`
- `gg-mixed-media`

### 6.2 Generic family names are insufficient
Generic family names like these are not acceptable as final internal contract names:
- `dock`
- `post-toolbar`
- `comments-panel`
- `share-sheet`
- `mixed-media`
- `labeltree`

These may appear in prose as human shorthand, but the official internal family contract must be GG-prefixed.

### 6.3 Semantic honesty in family naming
A family name must describe what it truly is.

Examples:
- listing-only info family = `gg-editorial-preview`
- post/page detail metadata family = `gg-detail-info-sheet`

Forbidden:
- using `gg-editorial-preview` for detail metadata
- keeping `gg-info-panel` as the active family if its true role is detail info sheet

### 6.4 Toolbar naming rule
Toolbar families must describe scope honestly.

Examples:
- `gg-detail-toolbar` = toolbar for post/page detail contexts
- `gg-listing-card-toolbar` = toolbar for listing cards

Forbidden:
- `gg-post-toolbar` as final family name if the same toolbar is also owned by page detail

---

## 7. Zone Naming Law

### 7.1 Editable placement zones
Backend-editable placement zones must use:
- `gg-zone-*`

Examples:
- `gg-zone-ads-top`
- `gg-zone-content-primary`
- `gg-zone-right-list-support`

### 7.2 Zone vs family distinction
Zones are not component families.

Examples:
- `gg-zone-right-list-support` = placement zone
- `gg-editorial-preview` = component family

It is forbidden to blur the difference.

---

## 8. Registry, SSOT, Manifest, and Ledger Naming

### 8.1 Registry naming
Internal registries must use GG naming.

Examples:
- `GG Component Registry`
- `GG XML Render Registry`
- `GG Copy Registry`
- `GG Selector Ledger`

### 8.2 Machine-facing IDs / keys
If a registry, manifest, or ledger has machine-facing identifiers, they must use GG naming.

Examples:
- `gg-registry:components:v1`
- `gg-ledger:selectors:v1`
- `gg-ledger:hooks:v1`
- `gg-ssot:copy-manifest:v1`

### 8.3 SSOT naming rule
If a file is declared as SSOT or binding registry, its naming and internal identifiers must remain consistent with GG law.

### 8.4 No generic ledger IDs
Names like these are forbidden as final machine-facing identifiers:
- `selector-ledger`
- `hook-ledger`
- `copy-manifest`

They must become GG-scoped identifiers.

---

## 9. XML Naming Rules

### 9.1 Blogger XML is thin shell
XML may define markup skeleton, hooks, wrappers, and templates, but it must not invent parallel naming dialects.

### 9.2 XML hook rule
All internal XML-facing hooks must use GG law:
- `#gg-*`
- `.gg-*`
- `data-gg-*`
- `#gg-tpl-*`

### 9.3 Legacy XML names
Legacy names may exist only as migration bridges and must be labeled/documented as legacy.

Examples of legacy to migrate:
- `gg-info-panel`
- `gg-postinfo`
- `data-gg-action="like"` when the real action is support

---

## 10. CSS Naming Rules

### 10.1 CSS family ownership
Each official family owner in CSS must use GG family naming.

Examples:
- `gg-dock`
- `gg-detail-toolbar`
- `gg-listing-card-toolbar`
- `gg-editorial-preview`
- `gg-detail-info-sheet`
- `gg-comments-panel`

### 10.2 No split dialect in CSS registry
CSS registry may not list generic family names while source selectors and hooks use GG naming.

### 10.3 Layer files may be human-readable
File/folder names in source CSS may remain practical, but official family contracts must still be GG-scoped.

Example:
A file may be named `detail-toolbar.css`, but the family it owns is `gg-detail-toolbar`.

---

## 11. JS Naming Rules

### 11.1 JS module naming
JS modules and controller names should track the official GG family naming closely.

Examples:
- `GG.dock`
- `GG.detailToolbar`
- `GG.listingCardToolbar`
- `GG.editorialPreview`
- `GG.detailInfoSheet`

### 11.2 Hook semantics rule
JS must consume semantically honest hooks.

Forbidden:
- keeping `data-gg-action="like"` while behavior routes to support

Required:
- `data-gg-action="support"`
- `gg:support-route`

### 11.3 Adapter rule
If a legacy hook must be preserved temporarily, JS adapter logic must:
- document the legacy alias
- prefer the new GG-honest hook
- define a removal target

---

## 12. Official Family Examples

The following illustrate the intended direction for official family naming:

### Primitive families
- `gg-dialog`
- `gg-sheet`
- `gg-drawer`
- `gg-toast`
- `gg-banner`
- `gg-inline-alert`
- `gg-tooltip`
- `gg-skeleton`
- `gg-empty-state`
- `gg-loading-state`

### Component families
- `gg-dock`
- `gg-drawer-more`
- `gg-search-surface`
- `gg-command-palette`
- `gg-detail-toolbar`
- `gg-listing-card-toolbar`
- `gg-editorial-preview`
- `gg-detail-info-sheet`
- `gg-comments`
- `gg-comments-panel`
- `gg-share-sheet`
- `gg-labeltree`
- `gg-library`
- `gg-mixed-media`
- `gg-install-prompt`
- `gg-update-flow`
- `gg-offline-recovery`
- `gg-notfound`

### Card families
- `gg-post-card`
- `gg-featured-card`
- `gg-mixed-card`
- `gg-panel-card`
- `gg-landing-card`

### Layout / structural families
- `gg-page-shell`
- `gg-header`
- `gg-home-switcher`
- `gg-blog-grid`
- `gg-sidebars`

These examples are directional law. New work must align with them unless the naming law itself is revised.

---

## 13. Deprecation and Legacy Policy

### 13.1 Legacy names are debt
A legacy name may survive only if it is:
- documented
- adapter-backed where necessary
- time-boxed
- scheduled for removal

### 13.2 Deprecated family names
Deprecated names must not be used for new work.

Examples:
- `info-panel` as active family name
- `post-toolbar` as final family name when page detail also owns it
- `like` as the action name for support

### 13.3 Required migration note
Every naming migration must state:
- old name
- new name
- why the old name is wrong
- where adapters exist
- when legacy will be removed

---

## 14. Regex Quick Reference

- CSS class (BEM): `^gg-[a-z0-9]+(?:-[a-z0-9]+)*(?:__(?:[a-z0-9]+(?:-[a-z0-9]+)*))?(?:--(?:[a-z0-9]+(?:-[a-z0-9]+)*))?$`
- State class: `^gg-is-[a-z0-9]+(?:-[a-z0-9]+)*$`
- ID: `^gg-[a-z0-9]+(?:-[a-z0-9]+)*$`
- data attr: `^data-gg-[a-z0-9]+(?:-[a-z0-9]+)*$`
- token: `^--gg-[a-z0-9]+(?:-[a-z0-9]+)*$`
- event: `^gg:[a-z0-9]+(?:-[a-z0-9]+)*$`
- storage: `^gg:[a-z0-9]+(?:-[a-z0-9]+)*(?::v[0-9]+)?$`
- zone name: `^gg-zone-[a-z0-9]+(?:-[a-z0-9]+)*$`
- template ID: `^gg-tpl-[a-z0-9]+(?:-[a-z0-9]+)*$`
- registry/ledger key: `^gg-(?:registry|ledger|ssot):[a-z0-9]+(?:-[a-z0-9]+)*(?::v[0-9]+)?$`

---

## 15. Audit Minimum Contract for Naming

Any serious naming audit must check, at minimum:
1. no parallel naming dialect exists
2. all internal hooks use GG law
3. family names are semantically honest
4. deprecated names are not used for new work
5. adapter-backed legacy names are documented
6. XML, CSS, JS, and docs refer to the same family language
7. registries, ledgers, and manifests use GG-scoped naming

### 15.1 Rule
A naming audit that checks only classes and ignores family contracts, ledgers, and docs is incomplete.

---

## 16. Acceptance and Rejection Rules

### 16.1 Accept only if
A naming-related patch is acceptable only if it:
- moves the system toward one GG language
- increases semantic honesty
- reduces ambiguity for AI and humans
- keeps migration risk controlled
- documents legacy bridges if needed

### 16.2 Reject if
A naming-related patch must be rejected if it:
- invents a second dialect
- keeps dishonest semantics under a GG prefix
- renames core hooks casually without migration notes
- lets docs and code diverge further
- preserves deprecated family names as active architecture

---

## 17. AI Behavior Limits

AI may not:
- invent new naming dialects
- keep generic names in docs while GG names live in code
- preserve dishonest semantics for convenience
- rename hooks purely for aesthetics
- treat legacy aliases as permanent architecture

AI must:
- follow this naming law
- keep names auditable
- prefer semantic honesty over shallow compatibility theater
- document migration bridges clearly

---

## 18. Closing Rule

GAGA-ish naming is not a cosmetic prefix exercise.

A name is compliant only if it is:
- GG-scoped where it should be
- semantically honest
- ownership-clear
- stable across XML, CSS, JS, and docs
- easier for humans and AI to reason about

If a name still confuses scope, hides ownership, or lies about behavior, adding `gg-` does not save it.

One language. One contract. No parallel dialect.

