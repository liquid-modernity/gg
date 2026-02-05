TASK: CREATE AUDIT REPORT FILE INSIDE REPO (Markdown)

ROLE:
You are a senior web systems auditor for a Blogger-based PWA fronted by Cloudflare Workers and deployed via GitHub Actions.
Do NOT refactor, do NOT redesign, do NOT implement fixes. Only diagnose, verify, and report with evidence.

PRIMARY OUTCOME:
Produce a report that can be used to (1) stabilize CI so GitHub Actions stays green, and (2) stabilize deploy so changes are reliably visible on pakrpp.com.

DELIVERABLE:
Create (or overwrite) this file in the repo:
- docs/audit/AUDIT_REPORT.md

NON-NEGOTIABLE METHOD:
1) Inspect code + config. If the repo includes runnable scripts, attempt to run them.
2) If a command fails, capture the exact command and the first ~60 lines of error output in the report (no secrets).
3) Every claim must include Evidence: file path + line range (or exact config key path).
4) Separate: symptom vs root cause vs failure condition.

GOAL QUESTIONS (must answer explicitly):
1) What components/features/modules/logics do NOT work correctly or are fragile?
2) Why they fail (root cause, not symptoms)
3) Under what conditions they fail (Worker active/inactive, www vs apex, first load vs soft-nav, SW cache state, Blogger DOM lifecycle, etc.)
4) What will break CI (GitHub Actions) and/or break deploy visibility to pakrpp.com?

SCOPE (must cover):
A) Routing & Navigation:
   - / vs /blog vs /?view=blog, canonical rules, history API, smart back, dependency on Worker rewrites
B) Client-side JS:
   - anchor interception, soft navigation, event binding/delegation, state management, DOM lifecycle assumptions (Blogger), dock/breadcrumb rendering
C) Service Worker:
   - caching strategy, fetch interception, offline behavior, update strategy, versioning, cache invalidation risks
D) Blogger template XML:
   - invalid href/src, mixed content, broken canonical/schema, relative URL edge cases, DOM structure assumptions that JS relies on
E) Integration assumptions & hidden couplings:
   - implicit contracts across Worker + JS + Blogger + SW (paths, headers, cache keys, HTML shape, query params)
F) CI/CD & Deploy (MANDATORY):
   - .github/workflows/** (all workflows): triggers, jobs, caching, artifacts, environment variables, required secrets
   - Cloudflare deployment mechanism: wrangler config files, worker build/publish steps, Pages deploy steps (if any)
   - versioning strategy: assets hashing, cache headers, SW update flow, how “new build becomes visible”
G) Security & Performance hygiene (MANDATORY baseline checks):
   - Security headers expectations (CSP/HSTS/XFO/etc) as inferred from Worker/config
   - Risk of leaking secrets in repo/workflows
   - SW cache poisoning / overly-broad caching
   - Bundle size / duplicated assets / runtime regressions risks (as detectable from repo artifacts)

REPO TRAVERSAL (must inspect at least):
- src/worker.js (or equivalent Worker entry)
- wrangler.toml / wrangler.json / deploy scripts (if present)
- .github/workflows/*
- public/sw.js (or service worker entry)
- public/offline.html
- index.prod.xml
- index.dev.xml
- public/assets/** entrypoints
- main.js (or wherever navigation logic lives)
- package.json (scripts) and build tooling configs

OUTPUT FORMAT (docs/audit/AUDIT_REPORT.md):
1) Executive Summary (max 10 bullets; include CI/deploy risks)
2) System Map (short): Worker → Blogger → Client JS → SW → Assets → CI/CD (how requests flow)
3) Failure Matrix table:
| Area | File | Lines | What breaks | Why (root cause) | Failure condition(s) | CI/Deploy impact | Severity |
Severity legend: 🔴 core break, 🟠 UX break, 🟡 fragile, ⚪ cosmetic
4) CI/CD Risk Matrix:
| Workflow | Trigger | Required secrets/env | Likely fail points | Evidence | Severity |
5) Hidden Couplings (Critical): list implicit contracts + why they are dangerous
6) False Positives: things that look buggy but are OK (with evidence)
7) Stop Rules: user actions or deploy states that will ALWAYS fail if unchanged
8) Minimal Repro List (10–20):
   - each item: URL + action + expected vs observed + likely root cause + conditions
9) Underspecified / Unverifiable:
   - list what cannot be proven from repo alone (e.g., Cloudflare dashboard settings), and what evidence would be needed.

STRICT RULES:
- No fixes, no refactors, no architecture proposals.
- No guessing: if not provable from repo or runnable logs, mark as Underspecified.
- Do not include secrets in logs.
- Keep it factual and testable.

FINISH:
Save the report to docs/audit/AUDIT_REPORT.md.
