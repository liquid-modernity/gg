# Task 05 — Controller Split: Core + Adapters

## Objective

Reduce the monolithic controller into a smaller global core plus surface adapters without changing public behavior or damaging Blog1.

This is the highest-risk task. Do not start it before Tasks 02–04 are complete.

## Hard Constraints

- Do not rewrite Blog1.
- Do not rewrite Blogger post loop.
- Do not rewrite native comments source.
- Do not change sheet contract behavior defined in Tasks 02–03.
- Do not change data contract defined in Task 04.
- Do not create multiple competing controllers.
- Do not chase file splitting for aesthetics only.

## Architectural Principle

```text
One global controller does not mean one giant file.
One global controller means one behavior contract.
```

Target direction:

```text
GG.core
GG.registry
GG.route
GG.sheet
GG.a11y
GG.adapters.preview
GG.adapters.discovery
GG.adapters.comments
GG.adapters.more
GG.adapters.store
GG.adapters.landing
```

## Suggested Module Responsibility

### GG.core

Responsible for:

```text
boot lifecycle
safe DOM ready
feature registration
global state
public GG namespace
event bus
```

### GG.registry

Responsible for:

```text
copy registry
icon registry
action registry
surface registry
route registry
configuration lookup
```

### GG.route

Responsible for:

```text
surface detection
route kind detection
root/listing/detail/landing/store/page classification
```

### GG.sheet

Responsible for:

```text
open
close
replace
stack/back
origin handling
focus restore
scroll lock
outside click
Escape close
gesture integration
```

### GG.a11y

Responsible for:

```text
focus management
aria-expanded
aria-hidden/inert where applicable
reduced motion helpers
keyboard interactions
```

### Adapters

Adapters are allowed to be surface-specific but must not own global lifecycle.

Examples:

```text
preview adapter: payload, fetch fallback, render preview body
comments adapter: native Blogger comments enhancement
discovery adapter: labels/search/listing discovery
more adapter: settings/language/theme links
store adapter: product grid, store preview, filters
landing adapter: landing-only enhancements
```

## Required Work

### 1. Inventory existing controller responsibilities

Before moving code, write an internal map:

```text
function/group → current file → future module → dependencies
```

Do not move code blindly.

### 2. Extract pure helpers first

Move low-risk utilities before moving behavior:

```text
DOM helper
string helper
dataset helper
registry lookup
safe event binding
```

### 3. Extract sheet lifecycle after Tasks 02–03

The sheet module must become the single owner of sheet open/close behavior.

### 4. Extract adapters gradually

One adapter at a time:

```text
preview
more
discovery
comments
store
landing
```

Do not extract all at once.

### 5. Preserve public API compatibility

If existing code calls:

```js
GG.someExistingMethod()
```

Do not remove it abruptly. Provide a compatibility path or update all callers in the same task.

## Acceptance Criteria

- `gg-app.source.js` is reduced in responsibility.
- There is a clear core/adapters structure.
- Sheet behavior still works for both origins.
- Preview data contract still works.
- Comments still work.
- Discovery and more sheet still work.
- Store preview still works.
- No Blog1 rewrite.
- No native comments source rewrite.

## Suggested Verification

```bash
npm run build
npm run qa:edit
npm run qa:contract
```

Manual smoke:

```text
/, open preview
/store, open store preview
/landing, open more/discovery if available
post detail, comments behavior
page detail, no template mismatch or broken shell
```

## Non-Goals

- Do not pursue perfect tree-shaking in this task.
- Do not split CSS here.
- Do not make budgets blocking.
- Do not rewrite UI markup beyond necessary module hooks.
