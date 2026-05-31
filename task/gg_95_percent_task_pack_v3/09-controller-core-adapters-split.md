# Task 09 — Controller Core + Adapters Split

## Objective

Reduce the monolithic controller into a smaller global core plus surface adapters without changing the public behavior contract.

This is high risk. Do not start it before Tasks 00–08 are complete.

## Hard Constraints

- Do not create multiple competing controllers.
- Do not split for aesthetics only.
- Do not break sheet contract from Tasks 06–07.
- Do not break data contract from Task 08.
- Do not hardcode CMS source URLs in controller code.
- Do not rewrite working Blogger post loop logic.
- Do not add new override behavior modules.
- Do not move controller responsibilities into Worker HTMLRewriter.

## Principle

```txt
One global controller does not mean one giant file.
One global controller means one behavior contract.
```

Target direction:

```txt
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
GG.sources.root
GG.sources.store
```

## Required Work Sequence

### 1. Inventory Before Moving Code

Create a controller inventory documenting:

```txt
current modules/functions
owned surfaces
public API/hooks
event listeners
data dependencies
CSS/class dependencies
side effects
source/feed dependencies
```

### 2. Extract Pure Helpers First

Move pure helpers before moving stateful systems:

```txt
DOM helpers
safe query helpers
class/state helpers
URL normalization helpers
canonical mapping helpers
date/text helpers
```

### 3. Extract Registry/Config Access

Centralize access to:

```txt
copy registry
icon registry
action registry
route registry
source registry
surface registry
```

### 4. Extract Sheet Lifecycle

Only after sheet contract is stable, extract:

```txt
sheet registry
open/close lifecycle
focus restore
backdrop/escape/back handling
gesture adapter hook
```

### 5. Extract Surface Adapters

Adapters should attach behavior to declared surfaces, not invent new behavior contracts.

```txt
preview adapter
discovery adapter
comments adapter
more adapter
store adapter
landing adapter
```

## Public API Contract

Any existing public API must either remain compatible or be documented as intentionally changed in a migration note.

Do not silently rename global hooks used by template markup.

## Acceptance Criteria

- There remains one global behavior contract.
- Controller is smaller or better modularized without duplicate controllers.
- Source URLs come from config/registry.
- Sheet lifecycle uses the global contract.
- Store adapter uses Store source boundary from Task 04.
- Root adapter does not fetch Store data unless needed.
- Existing route behavior is preserved.
- No override/patch modules are introduced.


## Worker Boundary

Controller modularization must happen in source JavaScript/modules and declared adapters. Do not offload behavior, data repair, schema repair, or template cleanup into Cloudflare HTMLRewriter. Worker may expose static routes, diagnostics, flags, headers, and prepared artifacts; it must not become the UI behavior/controller layer.
