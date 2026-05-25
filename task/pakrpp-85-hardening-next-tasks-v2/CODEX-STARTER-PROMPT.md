# CODEX-STARTER-PROMPT

Use this before each individual task. Replace `<TASK FILE>` with the exact task file name.

```txt
Use PAKRPP 85 Architecture North Star as the governing contract.

Work on one task only: <TASK FILE>.
Do not start the next task.

Primary goal:
move the codebase toward semantic SSR, HTML fallback, registry-driven configuration, structured data integrity, accessibility, mobile-first native-feeling UX, global sheet contracts, centralized behavior, global visual rhythm, and reduced duplication.

Hard interpretation:
"Rewrite" means consolidate duplicated sources of behavior into one documented contract.
It does not mean rebuilding stable systems from scratch.

Do not add override-only CSS/JS.
Do not patch over old patches.
Do not remove code without usage proof.
Do not edit generated outputs as the only fix.
Do not replace Blogger-native comments.
Do not let Worker author normal healthy UI.
Do not change route truth:
- /landing = Home
- / = Blog
- breadcrumb = Home(/landing) -> Blog(/) -> current

Every new major guard must be wired into package.json, documented in QA-COMMANDS.md, and included in ci:qa or an appropriate aggregate script.

After completion, report:
- task completed
- files changed
- source files changed
- generated files changed only by build
- contracts added/updated
- guards added/updated
- package.json scripts added/updated
- CI/GitHub Actions changed: yes/no + why
- exact QA commands run
- PASS/FAIL
- warnings
- what was intentionally not changed
```
