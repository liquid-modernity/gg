# TASK-A11Y-001 — Accessibility, Keyboard, Mobile-First, and Gesture Hardening


Baseline assumption: Store Isolation, Store Isolation JS, Discovery 002/003, Theme 001, Shell 001/002, Preview 001, and CI/CD hardening are already stable.

Global rule for every task:
- Treat this as hardening/audit/contract work.
- Do not rewrite stable Store/Discovery/Shell/Preview controllers unless a guard proves a real defect.
- Preserve Blog1 detail, Blogger native comments, threaded comments, Store isolation, Discovery taxonomy, Theme Light/Dark, global sheet controller, preview contract, preview scroll reset, and current passing CI.
- Do not hardblock post titles, URLs, or slugs.
- Do not weaken QA guards.


## Strategic Purpose

Harden accessibility and native-app-like interactions across `/`, `/landing`, and `/store`.

## Scope

Surfaces:

```txt
/
 /landing
 /store
 post detail
 static pages
```

Components:

```txt
dock
More sheet
Search/Discovery sheet
Preview sheet
Store Preview
comments/replies sheets
theme controls
language controls
filter chips
Store product cards
article cards
```

## Checks

### Keyboard

```txt
Tab order logical
Shift+Tab works
Escape closes modal/sheet
Enter/Space activates buttons
focus returns to trigger
no focus trapped after close
```

### ARIA

```txt
dialogs use role="dialog"
aria-modal where appropriate
aria-expanded/aria-controls on triggers where appropriate
aria-hidden state consistent
labels for icon-only buttons
no duplicate IDs
```

### Mobile / Touch

```txt
44px-ish touch targets where practical
safe-area support
bottom controls reachable
drag handles usable
keyboard does not cover search input badly
```

### Reduced Motion

```txt
prefers-reduced-motion respected
drag/transition not excessive
no motion-only feedback
```

## Required Guard

Add or update:

```txt
qa/a11y-static-guard.mjs
```

Guard should check:

```txt
icon buttons have aria labels
sheets have dialog semantics
handles are buttons
data-gg-close controls are buttons
theme controls have labels
filter chips are buttons
reduced motion CSS exists
```

Add script if stable:

```json
{
  "gaga:verify-a11y-static": "node qa/a11y-static-guard.mjs"
}
```

## Manual QA

Keyboard-only test:

```txt
/ More
/ Search
/ Preview
/landing More/Search
/store Discovery/Preview
post comments/replies
```

Required:

```txt
open with keyboard
navigate inside
Escape close
focus restore
no stuck inert
no background focus leak
```

## Acceptance Criteria

```txt
keyboard flow improves or is verified
sheet focus remains stable
comments unaffected
touch/mobile sheet behavior remains stable
a11y guard passes
CI remains PASS
```


Minimum QA after every task:

```bash
git diff --check
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run gaga:verify-nav-more
npm run gaga:verify-discovery-contract
npm run gaga:verify-discovery-filters
npm run gaga:verify-store-isolation
npm run gaga:verify-theme
npm run gaga:verify-shell
npm run gaga:verify-preview-sheet
npm run store:build
npm run store:proof
npm run ci:cloudflare
```

Run live smoke after deploy or when the task changes Worker/static assets:

```bash
npm run gaga:verify-worker-live:strict
```

`PASS_WITH_WARNINGS` is acceptable only for known non-blocking warnings. `CONTRACT_FAILURE` is not acceptable.
