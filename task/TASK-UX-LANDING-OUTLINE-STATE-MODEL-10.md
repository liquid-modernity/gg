# TASK-UX-LANDING-OUTLINE-STATE-MODEL-10 — Enforce Landing Outline State Model: `compact / expanded / quieted / hidden`

## Context

This task is intentionally narrow.

Its only purpose is to enforce the landing contextual outline state model.

Do **not** use this task to redesign the universal dock, rebuild the landing page, or refactor unrelated panels.

The landing outline must have exactly four UX-facing states:

```txt
compact
expanded
quieted
hidden
```

Previous or tempting state names such as `peek`, `micro-peek`, `open`, `closed`, or `active` must not be used as primary UX-facing states.

---

## Primary objective

Define and wire the landing outline state model so that:

```html
<aside
  id="gg-landing-outline"
  class="gg-landing-outline"
  data-gg-landing-outline-state="compact">
```

is the source of truth for the landing outline state.

The landing outline must react predictably to:

```txt
- user expand/collapse action
- section selection
- universal dock visibility state
- command/more panel open state
- invalid/no landing section structure
```

---

## Scope

Inspect and update:

```txt
landing.html
```

You may touch existing shared JS/CSS only if it directly supports this state model.

Do **not**:

```txt
- introduce a framework
- create a generic state machine library
- create a second dock
- create a second command/more panel
- change the meaning of gg-detail-outline
- reuse gg-detail-outline state names
- redesign the visual system
```

---

## Required state source of truth

The only UX-facing state attribute is:

```txt
data-gg-landing-outline-state
```

Allowed values:

```txt
compact
expanded
quieted
hidden
```

Forbidden as primary state values:

```txt
peek
micro-peek
open
closed
active
inactive
visible
collapsed
```

If Codex needs an internal visual variant, it may use a separate attribute:

```txt
data-gg-landing-outline-variant
```

But the UX-facing state must remain one of the four allowed values.

---

## State definitions

### 1. `compact`

Default valid reading-companion state.

Purpose:

```txt
- show current landing section
- stay small and readable
- remain calmly present near bottom viewport
- become the main contextual companion when dock hides by scroll
```

Expected behavior:

```txt
- visible
- interactive
- shows current section title
- shows a calm expand affordance
- does not look like a full sheet
- does not look like a second dock
```

Entry triggers:

```txt
- valid landing structure on initial load if dock is hidden or neutral
- dock enters hidden-by-scroll
- panel closes and dock is hidden-by-scroll
- user selects a section while dock is hidden-by-scroll
- user collapses expanded while dock is hidden-by-scroll
```

Exit triggers:

```txt
- user explicitly expands
- dock becomes visible and hierarchy requires quieting
- command/more panel opens
- landing section structure becomes invalid
```

### 2. `expanded`

Deliberate user-triggered section list state.

Purpose:

```txt
- show landing section list
- support section-to-section navigation
- mark current section
```

Expected behavior:

```txt
- visible
- interactive
- smaller and calmer than command/more panels
- not modal
- not a drawer clone
- not a second dock
```

Entry triggers:

```txt
- explicit click/tap/keyboard action on outline toggle only
```

Forbidden entry triggers:

```txt
- scroll
- dock hide
- dock show
- section visibility change
- near-bottom state
```

Exit triggers:

```txt
- user selects a section
- user toggles/collapses outline
- Escape key if implemented
- command/more panel opens
```

### 3. `quieted`

Visible but de-emphasized persistent state.

Purpose:

```txt
- preserve contextual awareness
- reduce competition when universal dock is visible/dominant
```

Expected behavior:

```txt
- visible
- anchored
- visually softer than compact
- not the same as hidden
- may reduce opacity, contrast, label emphasis, or density
```

Entry triggers:

```txt
- dock visible-default
- dock visible-on-upward-intent
- dock visible-near-end
- dock focus-locked
- panel closes and dock is visible
- user collapses expanded while dock is visible
- user selects a section while dock is visible
```

Exit triggers:

```txt
- dock enters hidden-by-scroll
- user explicitly expands
- command/more panel opens
- invalid section structure
```

### 4. `hidden`

Full retreat state.

Purpose:

```txt
- remove outline when it would conflict with stronger interaction layers
- avoid ghost hit-targets
- fail gracefully when section structure is invalid
```

Expected behavior:

```txt
- not visible
- not interactive
- not focusable
- no pointer capture
- no empty shell chrome
- no layout jump
```

Entry triggers:

```txt
- command panel opens
- more panel opens
- section structure is invalid/unavailable
- severe coexistence conflict that cannot be solved safely
```

Exit triggers:

```txt
- command/more panel closes
- valid landing structure exists
- outline can safely resume compact or quieted based on dock state
```

---

## Required transition model

Codex must implement these transitions:

```txt
compact  -> expanded  : explicit user action only
expanded -> compact   : user selects section while dock hidden-by-scroll
expanded -> quieted   : user selects section while dock visible
expanded -> hidden    : command/more panel opens

compact  -> quieted   : dock becomes visible/dominant
quieted  -> compact   : dock becomes hidden-by-scroll

compact  -> hidden    : command/more panel opens or invalid structure
quieted  -> hidden    : command/more panel opens or invalid structure
hidden   -> compact   : panel closes and dock is hidden-by-scroll
hidden   -> quieted   : panel closes and dock is visible
```

Forbidden transitions:

```txt
scroll -> expanded
section observer -> expanded
dock visible -> expanded
dock hidden -> expanded
quieted -> hidden merely because dock is visible
hidden -> expanded without explicit user action after resume
```

---

## Required JavaScript contract

### 1. Controller responsibility

The landing outline controller owns only:

```txt
- landing outline state
- current section tracking
- expanded/collapsed interaction
- section tap-to-scroll
- hidden non-interactive guard
```

It must not own:

```txt
- universal dock state
- command panel state
- more panel state
- dock active route state
```

### 2. Dock/panel event listeners

The landing outline controller must listen to:

```js
window.addEventListener("gg:dock-state-change", handler);
window.addEventListener("gg:panel-state-change", handler);
```

It may also read initial values from:

```txt
body[data-gg-dock-state]
body[data-gg-panel-active]
```

### 3. Recommended state mapping function

Codex should implement an equivalent of this logic:

```js
function resolvePassiveOutlineState({ dockState, panelActive, expandedByUser, hasValidSections }) {
  if (!hasValidSections) return "hidden";
  if (panelActive) return "hidden";
  if (expandedByUser) return "expanded";
  if (dockState === "hidden-by-scroll") return "compact";
  return "quieted";
}
```

This is the intended source of truth.

Do not scatter state decisions across many unrelated listeners.

### 4. Hidden state non-interactive guard

When state is `hidden`, apply:

```txt
aria-hidden="true"
inert if available or equivalent focus guard
pointer-events: none in CSS
```

When state leaves `hidden`:

```txt
aria-hidden="false"
remove inert or equivalent focus guard
restore pointer interaction
```

### 5. Current section tracking

Use `IntersectionObserver` unless impossible.

The observer must not set state to `expanded`.

It may update:

```txt
data-gg-current-section
current section label
aria-current on section item
```

### 6. Tap-to-scroll behavior

When the user selects a section:

```txt
- scroll to the actual section id
- collapse expanded state
- resolve next state based on current dock/panel state
```

Use native `scrollIntoView` or existing smooth-scroll utility.

Respect reduced motion if the repo already has a reduced-motion helper.

---

## Required CSS state hooks

CSS must target the state attribute:

```css
.gg-landing-outline[data-gg-landing-outline-state="compact"] {}
.gg-landing-outline[data-gg-landing-outline-state="expanded"] {}
.gg-landing-outline[data-gg-landing-outline-state="quieted"] {}
.gg-landing-outline[data-gg-landing-outline-state="hidden"] {}
```

Do not rely on primary state classes such as:

```txt
.is-open
.is-peek
.is-micro-peek
.is-active
```

Modifier classes may exist for internal styling, but the source of truth is the data attribute.

---

## Required CSS behavior per state

### compact

```txt
visible
interactive
small footprint
current section readable
```

### expanded

```txt
visible
interactive
shows section list
not modal
not full sheet
```

### quieted

```txt
visible
anchored
subordinate to dock
lower emphasis than compact
```

### hidden

```txt
opacity: 0 or transform retreat allowed
pointer-events: none
not focusable via JS guard
no layout jump
```

---

## Motion and performance rules

State transition motion must use only:

```txt
transform
opacity
```

Forbidden for animated state transitions:

```txt
bottom
top
height
max-height
margin
padding
display
```

Do not animate layout.

Do not use bounce.

Do not use a heavy state library.

---

## Required accessibility contract

Codex must ensure:

```txt
- root outline has aria-label
- toggle has aria-expanded
- section items use aria-current or equivalent
- hidden state uses aria-hidden
- hidden state is non-interactive and not tabbable
- expanded state can collapse through clear user action
```

Do not create a focus trap.

The landing outline is contextual navigation, not a modal.

---

## Required acceptance proof

Codex must include proof commands or equivalent search output.

### Required state proof

```bash
grep -n "data-gg-landing-outline-state" landing.html
grep -n "compact" landing.html
grep -n "expanded" landing.html
grep -n "quieted" landing.html
grep -n "hidden" landing.html
```

### Forbidden state proof

```bash
grep -n "micro-peek\|peek\|is-open\|is-active" landing.html
```

If any forbidden term appears, Codex must explain why it is unrelated to landing outline state.  
If it is used as landing outline state, the task is not complete.

### Required event proof

```bash
grep -n "gg:dock-state-change" landing.html
grep -n "gg:panel-state-change" landing.html
```

### Required CSS proof

```bash
grep -n "data-gg-landing-outline-state=\"compact\"" landing.html
grep -n "data-gg-landing-outline-state=\"expanded\"" landing.html
grep -n "data-gg-landing-outline-state=\"quieted\"" landing.html
grep -n "data-gg-landing-outline-state=\"hidden\"" landing.html
```

If CSS uses single quotes or escaped XML-compatible syntax, equivalent proof is acceptable.

---

## Manual QA checklist

Codex must describe how to verify:

```txt
1. load /landing
2. valid outline starts compact or quieted based on dock state
3. click outline toggle
4. state becomes expanded
5. scroll without clicking
6. state does not become expanded from scroll alone
7. select a section
8. outline collapses to compact or quieted
9. scroll down until dock hides
10. outline becomes compact
11. scroll up until dock returns
12. outline becomes quieted
13. open command panel
14. outline becomes hidden and cannot receive pointer/focus
15. close command panel
16. outline resumes compact or quieted
17. remove/disable section markers in test
18. outline fails gracefully as hidden
```

---

## Deliverables required from Codex

Codex output must use this structure:

```txt
1. state model
2. transition model
3. JavaScript state resolver summary
4. exact files/sections touched
5. CSS state hook summary
6. accessibility summary
7. acceptance proof
8. residual risk
```

---

## Residual risk that must be stated honestly

Codex must state any remaining risk related to:

```txt
- quieted state being too subtle
- compact state competing with dock
- hidden state reducing discoverability
- small-screen overlap
- section observer thresholds
- reduced-motion verification
```

---

## Completion definition

This task is complete only if:

```txt
- data-gg-landing-outline-state exists
- the only UX-facing states are compact, expanded, quieted, hidden
- compact is the default valid reading companion
- expanded is user-triggered only
- quieted is visible and distinct from hidden
- hidden is truly non-interactive
- panel open forces hidden
- dock hidden-by-scroll maps to compact
- dock visible maps to quieted unless expanded by user
- scroll never directly triggers expanded
- IntersectionObserver does not trigger expanded
- CSS targets the data-state attribute
- transform/opacity-only state motion is used
```
