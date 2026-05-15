# Decision Record — After Gemini Audit

## What we accept from Gemini audit

The Gemini audit is directionally correct:

1. Threaded comment behavior is mature enough to freeze after final proof.
2. `index.xml` is heavy because full app CSS is embedded in `b:skin` while similar external CSS is also loaded.
3. Root copy files appear swapped: `gg-copy-en.json` contains Indonesian wrapper/content, and `gg-copy-id.json` contains English wrapper/content.
4. Some comments microcopy remains hardcoded in JS/template source.
5. The next work should be copy registry hardening and asset architecture, not more reply-logic tinkering.

## Corrections / refinements

- Do not treat CSS extraction as a comment task.
- Do not remove `b:skin` wholesale.
- Do not use text strings as fragile proof selectors when stable data attributes are available.
- Indonesian empty state should be tightened to: `Jadilah yang pertama berkomentar.`
- Use `Membalas @name`, not `Membalas ke @name`.
- Use lowercase count style in Indonesian where practical: `7 komentar`, not necessarily `7 Komentar`.

## Final operating rule

Threaded comments are closed after TASK-048. Subsequent work belongs to platform hygiene:

- TASK-COPY-001 for copy registry/microcopy.
- TASK-ASSET-001 for CSS asset architecture.

Any future change to reply behavior must require a failing proof, reproducible live bug, or explicit product decision.
