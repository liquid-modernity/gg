# TASK-THEME-001 — Collapse Theme System to Kindle-like Light/Dark

## Status

Development task.

Run after IA/domain tasks and before global shell polish if possible.

## Strategic Purpose

The current Appearance control exposes too much technical choice. The desired brand direction is simpler and more deliberate:

```txt
Light = paperwhite, Amazon Kindle-like
Dark  = paperblack, Amazon Kindle-like
```

Remove `System` from public UI and collapse the user-facing theme model to only Light/Dark.

## Non-Negotiables

- Do not change route truth.
- Do not change dock order.
- Do not change More sheet IA except the Appearance control item count.
- Do not change Discovery IA.
- Do not touch threaded comments.
- Do not break Blog1.
- Do not introduce heavy theme dependencies.
- Do not create a third visible theme mode.
- Do not use pure white/pure black if it harms readability.

## Public Theme Model

Visible Appearance options:

EN:

```txt
Light | Dark
```

ID:

```txt
Terang | Gelap
```

Remove from public UI:

```txt
System
Sistem
```

Internal fallback:

```txt
default = light
saved preference = light/dark
legacy system value migrates to light
```

If internal code still needs to read old `system` values, convert them safely.

## Token Direction

### Light / Paperwhite

Use a warm, paper-like light surface.

Guidance:

```txt
background: warm off-white, not pure white
surface: soft translucent paper
text: near-black, not pure black
muted text: warm gray
line/hairline: very soft warm gray
selection/active: calm ink-like contrast
```

### Dark / Paperblack

Use a soft black reading surface.

Guidance:

```txt
background: near-black, not pure #000
surface: dark translucent charcoal
text: soft white, not pure #fff
muted text: cool/warm gray
line/hairline: low-contrast charcoal
selection/active: soft paper/ink contrast
```

Do not use high-glare AMOLED black/white as the default visual language.

## Required UI Updates

Update Appearance section in:

```txt
More sheet
landing surface if separate
store surface if separate
any appearance segmented control
copy registry
QA guard
```

Before:

```txt
System | Light | Dark
```

After:

```txt
Light | Dark
```

or ID:

```txt
Terang | Gelap
```

## Storage / Migration

Existing users may have saved:

```txt
system
light
dark
```

Migration behavior:

```txt
system -> light
light -> light
dark -> dark
missing -> light
invalid -> light
```

Do not break older localStorage keys without fallback.

If the project currently uses `gg:theme`, preserve the key unless there is a strong reason to rename it.

## CSS / Attribute Contract

Preferred public DOM states:

```txt
html[data-gg-theme="light"]
html[data-gg-theme="dark"]
```

Do not expose:

```txt
html[data-gg-theme="system"]
```

If `system` appears temporarily during migration, normalize it before first paint to prevent flash.

## Copy Requirements

Required EN:

```txt
appearance.light = Light
appearance.dark = Dark
```

Required ID:

```txt
appearance.light = Terang
appearance.dark = Gelap
```

Remove/deprecate from visible UI:

```txt
appearance.system
theme.system
```

Compatibility aliases may remain internally if guards allow them, but they must not render as public buttons.

## QA Requirements

Add or strengthen:

```txt
qa/theme-contract-guard.mjs
```

Recommended alias:

```txt
npm run gaga:verify-theme
```

Guard must check:

- public Appearance UI exposes only Light/Dark;
- `System`/`Sistem` is not present as a visible appearance option;
- theme bootstrap supports only light/dark public states;
- legacy `system` is migrated or normalized;
- More sheet still has Appearance section;
- copy keys exist in EN/ID;
- no route-specific third theme control is introduced.

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
npm run gaga:verify-theme
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

Check:

- Appearance shows only Light/Dark.
- Light feels paperwhite, not sterile web white.
- Dark feels paperblack, not harsh pure black.
- Theme choice persists after reload.
- Legacy System preference does not break the page.
- More sheet still works.
- Discovery sheet still works.
- Store sheet still works.
- Comments still work.

## Acceptance Criteria

Task is accepted only if:

- public theme model is Light/Dark only;
- System is removed from visible UI;
- legacy system values are handled safely;
- paperwhite/paperblack tokens are applied globally;
- More/Discovery/Store/Comments surfaces remain readable;
- comments proof passes;
- CI/CD passes.

## Required Final Report

```txt
TASK-THEME-001 completed.

Changed:
- Public Appearance collapsed to Light/Dark: YES/NO
- System removed from visible UI: YES/NO
- Legacy system preference migrated/handled: YES/NO
- Paperwhite tokens added/applied: YES/NO
- Paperblack tokens added/applied: YES/NO
- Copy registry updated: YES/NO
- Theme QA guard added/updated: YES/NO
- More sheet IA changed beyond Appearance options: NO
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
- npm run gaga:verify-theme if added: PASS/FAIL
- git diff --check: PASS/FAIL
```

## Out of Scope

- Shell focus trap/drag-to-close.
- Discovery filter remap.
- Dock redesign.
- Store redesign.
- Comments changes.
- Worker changes.
- Lighthouse gate.
