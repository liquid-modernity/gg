# TASK-SHELL-001 — Standardize Global Dock, Outline, Sheet Surface, Focus Trap, and Drag-to-Close

## Status

Development task.

Run after Discovery domain/index tasks and preferably after `TASK-THEME-001`, because shell surface styling should use final Light/Dark tokens.

## Strategic Purpose

The site should feel like one native-app-like system across `/`, `/landing`, `/store`, post detail, and static pages.

Current risk:

- Dock, outline, and sheets can still feel visually different per surface.
- Some sheets may have inconsistent focus handling.
- Some sheets may have drag handling while others do not.
- Some surfaces still use visible borders/border colors instead of the calmer flat-glass rhythm used by `/`.

This task standardizes the global shell system without changing IA, content domain, or threaded comments behavior.

## Non-Negotiables

- Do not change dock order.
- Do not change route truth.
- Do not change More sheet IA.
- Do not change Discovery taxonomy/content rules.
- Do not change Store Discovery domain.
- Do not change threaded comment behavior.
- Do not alter Blogger native comment plumbing.
- Do not change `parentID`, native composer movement, replies sheet targeting, or comment proof semantics.
- Do not break Blog1.
- Do not redesign the whole site.
- Do not use heavy gesture/focus dependencies.
- Do not introduce route-specific shell implementations unless absolutely necessary and QA-guarded.

## Visual Direction

Use `/` as the canonical rhythm for global dock and outline:

```txt
flat
glass-like
mobile-app-like
no loud border
no obvious border color as the main structure
soft depth
minimal hairlines only where needed
```

Do not make dock/outline look like bordered web cards.

Preferred direction:

```css
border: 0;
background: translucent surface token;
backdrop-filter: blur(...);
box-shadow: soft elevation token;
hairline dividers only inside content rows where necessary;
```

## Global Shell Components In Scope

Standardize these surfaces:

```txt
global dock
global More sheet
global Discovery sheet
Store Discovery sheet
Store preview/detail sheet
landing sheet(s)
outline / dock-attached outline
comments/replies sheets only at shell-controller level, without changing comment behavior
```

For comments/replies sheets:

- focus trap and drag controller may wrap the sheet;
- do not alter reply targeting, composer ownership, parentID, or Blogger native plumbing;
- comments proof must remain PASS.

## Required Surface Contract

All bottom sheets should share:

```txt
same handle style
same head/title rhythm
same width target
same safe-area bottom spacing
same focus trap behavior
same Escape/back behavior
same restore-focus behavior
same drag-to-close behavior
same reduced-motion handling
same scroll body vs drag handle separation
```

Preferred width target remains:

```css
--gg-panel-width: 600px;
```

## Focus Trap Requirements

Every modal/bottom sheet must have consistent focus behavior.

Required:

- focus moves into sheet when opened;
- focus is trapped inside while open;
- focus returns to trigger after close where possible;
- Escape closes sheet if closeable;
- background is inert or effectively non-interactive while modal sheet is active;
- `aria-modal`, `role`, and labels are correct where applicable;
- nested/stacked sheets do not create competing traps;
- comments/replies sheets remain semantically correct;
- keyboard users can reach close/handle/action controls.

If native `inert` is used, include a safe fallback where needed.

## Drag-to-Close Requirements

Every bottom sheet with a handle should support drag-to-close from its handle.

Required:

- drag handle exists and is discoverable;
- drag down beyond threshold closes the sheet;
- small drag snaps back;
- drag interaction does not conflict with scrollable content;
- content scroll does not accidentally close sheet;
- pointer, touch, and mouse events are handled consistently;
- reduced motion is respected;
- focus restoration still works after drag close;
- drag state is cleaned up after close.

Use one global controller or shared helper:

```txt
ggSheetGestureController
```

or equivalent.

Do not duplicate drag logic separately in More, Discovery, Store Preview, Comments, Replies, and Landing sheets.

## Outline Requirements

Global outline should follow `/` rhythm.

Required:

- flat glass style;
- no loud border;
- no heavy border color;
- stable width/position relative to dock;
- no conflict with dock hidden-by-scroll behavior;
- no premature collapse after manual open;
- reduced motion respected;
- accessible labels and focus states preserved.

If outline is not available on a route, do not invent a new outline just for this task.

## Dock Requirements

Global dock style should follow `/` rhythm.

Required:

- same visual rhythm across `/`, `/landing`, `/store`, detail pages;
- flat glass surface;
- no heavy border;
- consistent icon/label layout;
- consistent active state;
- consistent safe-area behavior;
- no route-specific dock visual system.

Dock order remains:

```txt
Home | Contact | Search | Blog | More
```

## Store Sheet Inspiration

Store Discovery / Store Preview may include richer rows with thumbnails/snippets where appropriate.

This task may align the shell style, but must not redesign product cards or Store data model.

Allowed:

```txt
align handle/head/body/footer rhythm
align focus trap
author shared drag behavior
align surface tokens
```

Not allowed:

```txt
redesign product layout
change store categories
change product data extraction
change Store canonical behavior
```

## QA Requirements

Add or strengthen:

```txt
qa/shell-interaction-guard.mjs
```

Recommended alias:

```txt
npm run gaga:verify-shell
```

Guard should check source/static contracts:

- global sheet handles exist;
- handle buttons are interactive where required;
- sheets have labels/roles;
- focus trap helper is present;
- drag controller/helper is present;
- route-specific duplicate sheet gesture implementations are not introduced;
- comments proof remains separate and passing;
- dock order unchanged;
- More sheet IA unchanged;
- Discovery contract unchanged.

Do not make guard brittle against exact sheet counts if counts change often. Check contracts and helpers.

## Required Commands

Run:

```bash
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run gaga:verify-nav-more
npm run gaga:verify-discovery-contract
npm run store:build
npm run store:proof
npm run ci:cloudflare
git diff --check
```

If added:

```bash
npm run gaga:verify-shell
```

## Manual Proof

Routes:

```txt
/
/landing
/store
one post detail
one static page detail
```

Viewports:

```txt
mobile 390
tablet 768
desktop 1280
```

Manual checks:

- dock rhythm looks global;
- outline rhythm follows `/` style;
- More sheet opens, traps focus, closes via Escape/back/drag;
- Discovery sheet opens, traps focus, closes via Escape/back/drag;
- Store Discovery/Preview sheet follows shared shell rhythm;
- comments sheet still works;
- replies sheet still works;
- drag close does not break native comment composer;
- keyboard navigation works;
- reduced motion does not produce jarring animation.

## Acceptance Criteria

Task is accepted only if:

- global dock style is unified;
- global outline style is unified where applicable;
- bottom sheets share focus trap behavior;
- bottom sheets share drag-to-close behavior;
- More/Discovery/Store sheets keep their IA/content contracts;
- threaded comments proof remains PASS;
- Blog1 remains safe;
- CI/CD passes.

## Required Final Report

```txt
TASK-SHELL-001 completed.

Changed:
- Global dock visual rhythm standardized: YES/NO
- Global outline visual rhythm standardized: YES/NO
- Sheet surface tokens standardized: YES/NO
- Focus trap standardized: YES/NO
- Drag-to-close standardized: YES/NO
- Shared gesture controller added/used: YES/NO
- More sheet IA changed intentionally: NO
- Discovery IA changed intentionally: NO
- Threaded comments behavior changed: NO
- Blog1 detail branch changed: NO

Verification:
- npm run gaga:template:pack: PASS/FAIL
- npm run gaga:verify-comments-proof: PASS/FAIL
- node qa/copy-registry-guard.mjs: PASS/FAIL
- npm run gaga:verify-nav-more: PASS/FAIL
- npm run gaga:verify-discovery-contract: PASS/FAIL
- npm run store:build: PASS/FAIL
- npm run store:proof: PASS/FAIL
- npm run ci:cloudflare: PASS/FAIL
- npm run gaga:verify-shell if added: PASS/FAIL
- git diff --check: PASS/FAIL

Manual proof:
- / mobile/tablet/desktop: PASS/FAIL
- /landing mobile/tablet/desktop: PASS/FAIL
- /store mobile/tablet/desktop: PASS/FAIL
- comments/replies no regression: PASS/FAIL
```

## Out of Scope

- New IA.
- Discovery filter remap.
- Theme system collapse unless already completed.
- Store data redesign.
- Comment behavior changes.
- Worker canonical changes.
- Lighthouse gate.
