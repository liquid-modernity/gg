# GG 85 Percent Development Readiness Task Pack

This ZIP contains **13 task `.md` files** for moving the current BLOG GAGA-ish / PakRPP codebase from roughly 70% readiness toward **85% development-readiness**.

This pack intentionally does **not** ask the coder to open production crawler/indexing flags yet. Development may continue to block Googlebot/OAI/Search crawlers until the final release phase.

## Task order

| Order | Task | Priority | File |
|---:|---|---|---|
| 1 | TASK-085-001 — Define 85 Percent Scorecard and Development Gate | P0 | `TASK-085-001__define-85-percent-scorecard-and-development-gate.md` |
| 2 | TASK-085-002 — Semantic HTML and HTML Fallback Contract | P0 | `TASK-085-002__semantic-html-and-html-fallback-contract.md` |
| 3 | TASK-085-003 — Unified Registry Contract for Copy Icons Routes Sheets and Actions | P0 | `TASK-085-003__unified-registry-contract-for-copy-icons-routes-sheets-and-actions.md` |
| 4 | TASK-085-004 — Global Sheet Controller Public API | P0 | `TASK-085-004__global-sheet-controller-public-api.md` |
| 5 | TASK-085-005 — Context Aware Surface Adapters for Root Landing and Store | P0 | `TASK-085-005__context-aware-surface-adapters-for-root-landing-and-store.md` |
| 6 | TASK-085-006 — Rendered JSON LD and Schema Graph Contract | P1 | `TASK-085-006__rendered-json-ld-and-schema-graph-contract.md` |
| 7 | TASK-085-007 — Accessibility Keyboard Focus and Mobile Gesture Contract | P1 | `TASK-085-007__accessibility-keyboard-focus-and-mobile-gesture-contract.md` |
| 8 | TASK-085-008 — Global CSS Visual Rhythm and Token Contract | P1 | `TASK-085-008__global-css-visual-rhythm-and-token-contract.md` |
| 9 | TASK-085-009 — No Override Code and Dead CSS JS HTML Cleanup | P1 | `TASK-085-009__no-override-code-and-dead-css-js-html-cleanup.md` |
| 10 | TASK-085-010 — Performance Budget and Route Split Assets | P1 | `TASK-085-010__performance-budget-and-route-split-assets.md` |
| 11 | TASK-085-011 — Store Product Data Quality and Image Hygiene | P1 | `TASK-085-011__store-product-data-quality-and-image-hygiene.md` |
| 12 | TASK-085-012 — PWA Native App Feel Manifest Offline and Icons Contract | P1 | `TASK-085-012__pwa-native-app-feel-manifest-offline-and-icons-contract.md` |
| 13 | TASK-085-013 — AI Code Agent Readability and Final Development Gate | P0 | `TASK-085-013__ai-code-agent-readability-and-final-development-gate.md` |


## Recommended execution sequence

1. Finish **P0 controller/registry/adapter/readiness tasks** first.
2. Then do semantic HTML, JSON-LD, accessibility, CSS rhythm, and cleanup.
3. Then do performance split and Store data quality.
4. Last, run the final `ci:85` development gate.
5. Production crawler/indexing openness remains a later release-only gate.

## Non-negotiable boundaries

- Do not touch Blogger native comments plumbing.
- Do not replace Blog1 as the source of post/detail truth.
- Do not change Discovery taxonomy unless a task explicitly says so.
- Do not break Store isolation.
- Do not add override code to hide architectural drift.
- Do not weaken QA guards to make failures disappear.
- Do not open production crawler/indexing flags in this milestone.

## Why 13 tasks, not 3 or 30?

Three tasks would be too large and would invite sloppy edits. Thirty tasks would fragment context and slow the coder down. Thirteen is the practical middle: each task has a clear acceptance test, but all still point to one target architecture.
