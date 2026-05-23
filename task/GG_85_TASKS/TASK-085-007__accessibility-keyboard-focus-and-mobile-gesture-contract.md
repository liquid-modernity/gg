# TASK-085-007 — Accessibility Keyboard Focus and Mobile Gesture Contract

Priority: **P1**  
Target milestone: **GG 85% development-readiness**  
Status: **Ready for coder / AI code agent**

## Objective
Lock accessibility behavior across sheets, dock, command/discovery, comments, and store preview. This matters for users, screen readers, keyboard navigation, and browser/AI agents inspecting the accessibility tree.

## Current evidence from audit ZIP
Existing audit signs are good: labels, buttons, focus trap, and inert handling exist. But the behavior must be proven across all three main surfaces and all sheet types, not assumed from static checks.

## Scope
Create a unified a11y interaction contract: focus entry, focus return, escape close, inert background, aria state, reduced motion, touch handle semantics, 44px interactive targets, and keyboard-visible states.

## Likely files / areas
- `src/css/gg-app.source.css`
- `src/js/gg-app.source.js`
- `src/store/store.css`
- `src/store/store-discovery.js`
- `landing.html` source/generator
- `qa/shell-interaction-guard.mjs`
- New: `qa/a11y-contract-guard.mjs`

## Hard constraints
- Do **not** touch native Blogger comments plumbing.
- Do **not** replace Blog1 as the source of post/detail truth.
- Do **not** change Discovery taxonomy unless this task explicitly says so.
- Do **not** break Store isolation: Store-labelled products must not leak into `/`, `/landing`, or general Blog Discover.
- Do **not** remove development crawler blocking / noindex flags in this milestone. Production flags are deferred to final release.
- Do **not** create parallel override code. Fix the source contract instead.
- Do **not** hide failures by weakening guards.

## Implementation steps
1. Document `docs/architecture/a11y-interaction-contract.md`.
2. Ensure all sheet open actions set focus intentionally.
3. Ensure all sheet close actions return focus or choose safe fallback.
4. Normalize `aria-expanded`, `aria-controls`, `aria-hidden`, `inert`, and `hidden` handling.
5. Add guard for missing labels, mismatched controls, focus trap markers, and reduced-motion support.
6. Verify mobile handle/drag does not bypass close/open state machine.

## Acceptance criteria
- All primary interactive controls have accessible names.
- Sheet open/close does not strand focus.
- Escape and backdrop behavior are consistent across root, landing, and store.
- Touch target sizing is normalized without making the UI visually heavy.

## Required QA / proof
```bash
node qa/a11y-contract-guard.mjs
npm run gaga:verify-shell
npm run gaga:verify-theme
npm run ci:qa
```

## Notes
- Keep the implementation boring, explicit, and reversible. Do not add clever abstractions unless they reduce duplicated behavior across `/`, `/landing`, and `/store`.
