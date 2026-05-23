# TASK-085-012 — PWA Native App Feel Manifest Offline and Icons Contract

Priority: **P1**  
Target milestone: **GG 85% development-readiness**  
Status: **Ready for coder / AI code agent**

## Objective
Make the PWA layer feel intentional: correct manifest, complete icons, safe offline fallback, standalone behavior, and mobile-first touch experience. This should support native app-feel without pretending the site is a full native app.

## Current evidence from audit ZIP
`manifest.webmanifest` references `/gg-pwa-icon/maskable-512.png`, but the uploaded ZIP shows `icon-512.png` and `android-icon-512x512.png`, not an obvious `maskable-512.png`. This is a small but real polish gap.

## Scope
Validate manifest, icon existence, offline page, service worker behavior, and shortcuts. Keep release indexing flags separate.

## Likely files / areas
- `manifest.webmanifest`
- `gg-pwa-icon/*`
- `offline.html`
- `pwa/*`
- `worker.js` if relevant to asset routing
- New: `qa/pwa-contract-guard.mjs`

## Hard constraints
- Do **not** touch native Blogger comments plumbing.
- Do **not** replace Blog1 as the source of post/detail truth.
- Do **not** change Discovery taxonomy unless this task explicitly says so.
- Do **not** break Store isolation: Store-labelled products must not leak into `/`, `/landing`, or general Blog Discover.
- Do **not** remove development crawler blocking / noindex flags in this milestone. Production flags are deferred to final release.
- Do **not** create parallel override code. Fix the source contract instead.
- Do **not** hide failures by weakening guards.

## Implementation steps
1. Add or generate the missing maskable icon, or update manifest to a real existing maskable asset.
2. Ensure all manifest icon paths resolve in built/deployed assets.
3. Ensure offline fallback is minimal, branded, and does not compete with real content.
4. Validate shortcuts: Home should align with `/landing`; Blog should align with `/` if included.
5. Add PWA guard for manifest JSON, icon existence, scope, start URL, and offline file.

## Acceptance criteria
- Manifest parses cleanly.
- Every icon path exists.
- Offline page exists and is lightweight.
- PWA shortcuts do not conflict with route truth.
- No production crawler flags are changed.

## Required QA / proof
```bash
node qa/pwa-contract-guard.mjs
npm run build
npm run ci:qa
```

## Notes
- Keep the implementation boring, explicit, and reversible. Do not add clever abstractions unless they reduce duplicated behavior across `/`, `/landing`, and `/store`.
