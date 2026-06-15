# TASK-002M-G — Public DOM Template Completeness Pass

Goal: enforce the project rule that public UI is **template-first, editability-aware, scalability-aware, and AI-agent-friendly**.

This task comes after TASK-002M-F, where `check:public-dom` reports:

```txt
restricted=5 allowlisted=5 createElement=16 allowedSmall=6 allowedReviewed=10 needsTemplate=0 unclassified=0
```

TASK-002M-G is a completeness pass over the remaining `allowedSmall` and `allowedReviewed` occurrences.

## What to do

Review every remaining `allowedSmall` and `allowedReviewed` `document.createElement(...)` occurrence in public code.

If a remaining element is user-visible and naturally belongs inside an existing or new purpose-specific template, migrate it into the template.

If it is truly runtime-only, parsing-only, infrastructure-only, or data-driven small behavior, keep it in JS but document the reason in policy and audit docs.

## Strong rule

Do not treat `allowedSmall` or `allowedReviewed` as “never template”. They mean “not currently a violation”. For this repo, prefer template when it improves human editability and AI agent maintainability.

## Do not do

- Do not create universal templates such as `gg-template-div`, `gg-template-link`, `gg-template-button`, `gg-template-element`, or `gg-template-generic`.
- Do not migrate parsing helpers, script loaders, iframe loaders, select options, or temporary DOM just to make a number smaller.
- Do not edit `dist/**` or `.cloudflare-build/**` manually.
- Do not install dependencies.
- Do not implement OAuth, Blogger API, auth, Console redesign, Studio redesign, or Store folder restructure.
- Do not delete `legacy-donor/`.

## Run

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002m-g-acceptance.sh
```
