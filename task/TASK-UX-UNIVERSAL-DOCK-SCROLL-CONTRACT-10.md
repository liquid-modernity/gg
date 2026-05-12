# TASK-UX-UNIVERSAL-DOCK-SCROLL-CONTRACT-10 — Lock Universal GG Dock Package, Scroll Intent Controller, and Panel-State Contract

## Context

The current implementation already contains parts of the universal dock behavior, but it is not strict enough to be considered complete.

This task is a **contract cleanup and hardening task**, not a visual redesign.

The universal GG Dock must be treated as a single shared product package across:

- `index.xml`
- `landing.html`

The universal package includes:

1. `#gg-dock`
2. `#gg-command-panel`
3. `#gg-more-panel`
4. shared dock visibility behavior
5. shared command/more panel behavior
6. shared active-state mapping
7. shared keyboard/focus behavior
8. shared style and motion contract

Do **not** treat only the `<nav>` element as the dock.  
The command/discovery sheet and more sheet are part of the same universal package.

---

## Primary objective

Make the universal dock package deterministic, lightweight, and hard to regress.

Codex must ensure that:

1. the dock package is **1:1 in behavior and product identity** across `index.xml` and `landing.html`
2. the dock visibility state is owned by one scroll-aware controller or one aligned controller pattern
3. command/more panel open state always wins over scroll state
4. focus safety is guaranteed
5. no surface forks the dock into its own dialect
6. contextual outlines remain separate from the universal dock

---

## Scope

Inspect and update only what is needed in:

- `index.xml`
- `landing.html`
- any existing shared CSS/JS/controller source if already present in the repo

Do **not** use this task to:

- redesign the whole landing page
- redesign the whole Blogger template
- externalize all CSS/JS
- introduce a framework
- introduce Tailwind
- rebuild the store
- rebuild comments
- rewrite unrelated panels

This task is about the **universal dock contract**, not general refactoring.

---

## Non-negotiable product contract

### 1. Universal dock package ownership

The following elements belong to the universal dock package:

```txt
#gg-dock
#gg-command-panel
#gg-more-panel
```

The universal dock package owns:

```txt
- item order
- labels
- icons
- active/current treatment
- hover/focus treatment
- safe-area treatment
- panel opening/closing behavior
- keyboard behavior
- scroll-aware hide/show behavior
- shared motion
- shared surface/radius/shadow/tone
```

### 2. Contextual navigation remains separate

The universal dock must **not** own page section navigation.

Contextual navigation belongs to separate families:

```txt
post/page detail      -> gg-detail-outline
landing section nav   -> gg-landing-outline
```

Do not overload `#gg-dock` with landing section links.

### 3. Route-aware items are allowed

The dock package may contain contextual targets for specific items:

| Dock item | Contract |
|---|---|
| Home | route-aware; may point to `/landing` and be active on landing |
| Contact | context-aware; may target `#contact` on landing and `/landing#contact` elsewhere |
| Search / Discover | universal; must open the same `#gg-command-panel` behavior |
| Blog | universal; must route to `/` / blog listing |
| More | universal; must open the same `#gg-more-panel` behavior |

The **href/current-state may be contextual**, but the dock item identity, icon, label, panel behavior, focus behavior, and motion contract must remain universal.

---

## Required JavaScript contract

Codex must implement or align a small vanilla JS controller pattern.

Do **not** add a framework.

Allowed approach:

```txt
GGDockController
GGScrollIntent helper
panel-state bridge
```

If the repo already has an equivalent controller, align it instead of creating duplicate logic.

### 1. Required data attributes

The dock controller must write to `body` or the root app surface:

```html
<body
  data-gg-dock-state="visible-default"
  data-gg-panel-active="false">
```

Required `data-gg-dock-state` values:

```txt
visible-default
hidden-by-scroll
visible-on-upward-intent
visible-near-end
panel-locked
focus-locked
```

If an existing implementation uses fewer internal states, Codex must still expose an equivalent state contract through `data-gg-dock-state` or clearly map the equivalent states in the output.

Do not invent new UX-facing state names unless they are internal-only and documented.

### 2. Required events

The dock controller must dispatch these events when relevant:

```js
window.dispatchEvent(new CustomEvent("gg:dock-state-change", {
  detail: { state }
}));

window.dispatchEvent(new CustomEvent("gg:panel-state-change", {
  detail: { active, panel }
}));
```

These events are required so contextual layers such as `gg-landing-outline` can react without coupling themselves directly to dock internals.

### 3. Global namespace rule

Avoid random globals such as:

```txt
window.GGSetPanelActive
window.setDockVisible
window.openLandingPanel
```

If a bridge is needed, use one namespace only:

```js
window.GG = window.GG || {};
window.GG.dock = window.GG.dock || {};
```

Allowed public methods, if needed:

```txt
window.GG.dock.setDockState(state)
window.GG.dock.setPanelActive(active, panel)
window.GG.dock.getDockState()
window.GG.dock.getPanelState()
```

### 4. Scroll performance rule

Scroll handling must be lightweight:

```txt
- use passive scroll listeners
- throttle scroll work through requestAnimationFrame
- avoid repeated layout reads inside raw scroll handlers
- use intent thresholds to avoid micro-scroll jitter
- avoid nervous state loops
```

Minimum scroll intent model:

```txt
top zone              -> visible-default
meaningful downward   -> hidden-by-scroll
meaningful upward     -> visible-on-upward-intent
near bottom/end zone  -> visible-near-end
panel open            -> panel-locked
focus inside dock     -> focus-locked
```

### 5. Panel-open override

When `#gg-command-panel` or `#gg-more-panel` is open:

```txt
body[data-gg-panel-active="true"]
body[data-gg-dock-state="panel-locked"]
```

Required behavior:

```txt
- scroll-driven dock hide/show pauses
- panel state wins over scroll state
- no hide/show fighting while panel is open
- contextual outlines may hide or quiet themselves based on panel state
```

### 6. Focus safety

If keyboard focus is inside `#gg-dock`:

```txt
body[data-gg-dock-state="focus-locked"]
```

Required behavior:

```txt
- dock stays visible
- scroll logic must not hide the dock mid-focus
- when focus leaves dock, scroll state may be re-evaluated
```

---

## Required CSS and motion contract

### 1. Transform-only motion

Dock visibility motion must use only:

```txt
transform
opacity
```

Forbidden for dock hide/show animation:

```txt
bottom
top
height
max-height
margin
padding
display
left/right positional animation
layout-affecting animation
```

Do not animate `display`.

Do not use bounce or overshoot.

### 2. Reduced motion

If `prefers-reduced-motion: reduce` is active:

```txt
- keep the same state logic
- reduce transition duration
- remove any decorative motion
- do not disable core accessibility behavior
```

### 3. No layout jump

Dock retreat/return must not shift document layout.

Use fixed/sticky positioning and transform-based visual movement.

---

## Required active-state contract

Codex must audit and align active/current state logic across `index.xml` and `landing.html`.

Required behavior:

```txt
Landing route:
- Home can be active
- Blog must not be active
- Contact may become active when contact section is current if implemented

Blog listing route:
- Blog can be active
- Home must not be active

Post/detail route:
- Blog can remain the parent active section unless a better current route exists
```

Search/Discover and More are panel actions, not page routes. They should not become permanently active after closing unless the product already uses a deliberate pressed/open state.

---

## Required no-fork rules

Codex must not:

```txt
- create a second landing-only dock
- create a second command panel for landing
- create a second more panel for landing
- create separate Search/Discover behavior for landing
- create separate More behavior for landing
- attach landing section navigation to the dock as a replacement for landing outline
- make dock return only at the literal top
- make dock return only at the literal last page pixel
- hide contextual outline together with dock during downward reading mode
```

---

## File expectations

Codex must inspect and update as needed:

```txt
index.xml
landing.html
```

Codex may touch existing shared CSS/JS files only if the repo already uses them and the edit remains surgical.

Do not force full CSS/JS externalization in this task.

---

## Acceptance proof required

Codex must include a proof section with commands or equivalent search output.

Minimum proof commands:

```bash
grep -n "id=\"gg-dock\"" index.xml landing.html
grep -n "id=\"gg-command-panel\"" index.xml landing.html
grep -n "id=\"gg-more-panel\"" index.xml landing.html
grep -n "data-gg-dock-state" index.xml landing.html
grep -n "data-gg-panel-active" index.xml landing.html
grep -n "hidden-by-scroll" index.xml landing.html
grep -n "visible-on-upward-intent" index.xml landing.html
grep -n "visible-near-end" index.xml landing.html
grep -n "panel-locked" index.xml landing.html
grep -n "focus-locked" index.xml landing.html
grep -n "gg:dock-state-change" index.xml landing.html
grep -n "gg:panel-state-change" index.xml landing.html
```

If implementation is split into external files, include those files in the grep commands.

Codex must also prove that landing does not create duplicate dock panels:

```bash
grep -n "gg-command-panel" landing.html
grep -n "gg-more-panel" landing.html
```

The result must show one shared command panel and one shared more panel on landing, not duplicate systems.

---

## Manual QA checklist

Codex must describe how to manually verify:

```txt
1. open landing
2. scroll down meaningfully
3. dock hides
4. landing outline remains available
5. scroll upward meaningfully
6. dock returns
7. scroll near page end
8. dock returns before the literal last pixel
9. open command panel
10. dock stops reacting to scroll
11. close command panel
12. dock resumes scroll behavior
13. tab into dock
14. dock remains visible while focused
```

Repeat equivalent checks on:

```txt
- root/blog listing
- post/detail page if available
- landing page
```

---

## Deliverables required from Codex

Codex output must use this structure:

```txt
1. audit
2. universal dock contract
3. JavaScript contract implemented
4. exact files/sections touched
5. implementation summary
6. scroll-visibility summary
7. panel/focus safety summary
8. motion/performance summary
9. acceptance proof
10. residual risk
```

---

## Residual risk that must be stated honestly

Codex must state any remaining risk related to:

```txt
- live mobile/touch-device tuning
- very short pages
- extremely long landing pages
- iOS Safari safe-area behavior
- reduced-motion verification
- active-state edge cases
```

---

## Completion definition

This task is complete only if:

```txt
- dock package is treated as one universal contract
- Search/Discover, Blog, and More behavior are shared
- Home and Contact may be route/context-aware without forking the package
- dock state is exposed through data-gg-dock-state
- panel state is exposed through data-gg-panel-active
- dock/panel state events are dispatched
- scroll uses passive listener + requestAnimationFrame
- meaningful scroll thresholds prevent jitter
- panel-open state overrides scroll state
- focus inside dock keeps dock visible
- motion uses transform/opacity only
- no landing-only dock/panel fork exists
```
