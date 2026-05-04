### TASK-UX-LANDING-OUTLINE-STATE-MODEL-01 — Define Only the Landing Outline State Model: compact / expanded / quieted / hidden

**Context**
This task is intentionally tiny.
It is **not** a full implementation task.

The only purpose of this task is to define and wire the **state model** for the landing contextual bottom outline.

This outline is the landing-specific contextual layer that lives above the universal dock hierarchy.

It must behave calmly and predictably across scroll, dock visibility, and panel-open conditions.

---

## Primary objective

Define a landing outline state model with exactly these UX-facing states:

1. `compact`
2. `expanded`
3. `quieted`
4. `hidden`

Codex must implement only the state contract and the minimum wiring needed to support it.

Do **not** use this task to redesign the dock, landing page, or panel system.

---

# State definitions

## 1. `compact`
This is the default persistent outline state.

Purpose:
- provide current-section awareness
- stay small
- stay readable
- remain quietly present at bottom viewport

Expected behavior:
- shows current landing section
- shows a calm affordance that the outline can expand
- stays visible while user reads/scans
- remains the contextual companion when dock hides on downward reading mode

Visual expectation:
- minimal footprint
- text-led
- low-noise
- no sheet-like dominance

## 2. `expanded`
This is the deliberate interaction state.

Purpose:
- let user see the section list
- support section-to-section jump navigation

Expected behavior:
- shows landing sections list
- current section clearly indicated
- tapping a section scrolls to that section
- remains smaller and calmer than a full sheet
- does not visually compete with command/more sheets

Visual expectation:
- expanded but still restrained
- not a modal
- not a drawer clone
- not a second dock

## 3. `quieted`
This is the de-emphasized persistent state.

Purpose:
- reduce competition when another stronger layer is active

Expected behavior:
- outline remains present but visually softened
- used when universal dock is visible and active enough to be the dominant bottom layer
- used when user context suggests the outline should remain available but less assertive
- may reduce label emphasis, opacity, border contrast, or density

Visual expectation:
- still visible
- still anchored
- clearly subordinate

## 4. `hidden`
This is the full retreat state.

Purpose:
- remove the outline when it would create interaction or visual conflict

Expected behavior:
- not visible
- not interactive
- not focusable
- no ghost hit-targets
- no empty shell chrome

Use only when justified, such as:
- panel open state
- invalid/no section structure
- extreme edge cases where coexistence breaks

Visual expectation:
- gone cleanly
- no layout jump

---

# Required state transitions

## A. Default entry
Landing outline should enter in:
- `compact`

unless the page structure is invalid, in which case:
- `hidden`

## B. Compact -> Expanded
Triggered by:
- explicit user action only
- tap/click on outline affordance

Must not trigger from scroll alone.

## C. Expanded -> Compact
Triggered by:
- user selects a section
- user dismisses/collapses outline
- user taps outside if that behavior is already part of the product language

## D. Compact -> Quieted
Triggered when:
- universal dock is visible and should visually dominate
- bottom-layer hierarchy needs calming without removing contextual awareness

## E. Quieted -> Compact
Triggered when:
- dock hides on downward reading mode
- landing outline becomes the main bottom contextual layer again

## F. Any visible state -> Hidden
Triggered when:
- command sheet opens
- more sheet opens
- section structure is invalid or unavailable
- implementation decides coexistence is broken and must retreat cleanly

## G. Hidden -> Compact
Triggered when:
- blocking panel closes
- valid landing structure exists again
- outline can safely resume contextual role

---

# Non-negotiable rules

## 1. Scroll must not directly trigger `expanded`
Expanded is deliberate, not automatic.

## 2. `quieted` is not `hidden`
Quieted must still be present and anchored.

## 3. `hidden` must be truly non-interactive
No pointer capture, no hidden focus trap, no ghost chrome.

## 4. `compact` must be the main reading companion state
Not `expanded`, not `quieted`.

## 5. Panel-open state must win
If command/more sheet is open, landing outline must not fight for attention.

---

# Required output from Codex

## A. State model summary
Codex must define:
- what each state means
- when each state is entered
- when each state is exited

## B. Transition summary
Codex must define:
- all transition triggers
- which transitions are allowed
- which transitions are forbidden

## C. Minimal implementation summary
Codex must state:
- what markup/state hooks were added
- what CSS state hooks were added
- what JS logic was added
- how visible vs hidden vs quieted are distinguished

## D. Residual risk
Codex must state:
- viewport tuning risk
- overlap risk with dock
- risk of quieted state being too subtle
- risk of hidden state causing discoverability loss

---

# Acceptance criteria

This task is complete only if:

- all four states exist conceptually and in implementation
- `compact` is the default valid state
- `expanded` is user-triggered only
- `quieted` is distinct from `hidden`
- `hidden` is truly non-interactive
- panel-open state forces outline away from competition
- no extra state names are introduced unless they remain internal-only and do not change the user-facing model

---

# Output format I want

1. state model
2. transition model
3. minimal implementation summary
4. residual risk