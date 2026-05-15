# Threaded Comments Final Closure — Read Me First

## Decision

Threaded comment behavior is now treated as **feature-complete**. Do not continue polishing reply logic unless a regression is proven by guard output or live DOM proof.

The final work is split into three bounded tracks:

1. **TASK-048** — Final live proof and freeze of threaded comment behavior.
2. **TASK-COPY-001** — Normalize EN/ID copy registry and remove hardcoded comment strings.
3. **TASK-ASSET-001** — Reduce duplicated full CSS in Blogger `b:skin` and move non-critical app styling to external assets.

## Non-negotiable rule

Do **not** mix these tasks.

- Do not change reply targeting while doing copy registry work.
- Do not change comment behavior while doing CSS extraction.
- Do not remove `b:skin` aggressively in one pass.
- Do not reintroduce sort/newest/oldest toolbar UI unless explicitly requested later.

## Recommended execution order

1. Run `TASK-048-threaded-comments-final-live-freeze.md`.
2. Run `TASK-COPY-001-normalize-threaded-comments-microcopy-registry.md`.
3. Run `TASK-ASSET-001-reduce-blogger-bskin-to-critical-css.md`.

After TASK-048 passes, threaded comments are closed as a feature. TASK-COPY-001 and TASK-ASSET-001 are platform hygiene, not new comment feature development.
