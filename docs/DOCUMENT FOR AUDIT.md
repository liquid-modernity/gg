TASK: CREATE AUDIT REPORT FILE INSIDE REPO (Markdown)

ROLE:
You are a senior web systems auditor. Do NOT refactor, do NOT redesign, do NOT implement fixes. Only diagnose and report.

DELIVERABLE:
Create (or overwrite) this file in the repo:
- docs/audit/AUDIT_REPORT.md

GOAL:
Audit the repo as one integrated system and write a factual report answering:
1) What features/modules/logics do NOT work correctly?
2) Why they fail (root cause, not symptoms)
3) Under what conditions they fail (Worker active/inactive, www vs apex, first load vs soft nav, SW cache state, Blogger DOM lifecycle, etc.)

SCOPE (must cover):
A) Routing & Navigation: / vs /blog vs /?view=blog, canonical rules, history API, smart back, dependency on Worker rewrites
B) Client-side JS: dock, breadcrumb, event binding/delegation, state management, anchor interception
C) Service Worker: caching, fetch interception, offline divergence, update strategy, versioning
D) Blogger template XML: invalid href/src (missing protocol, #www, relative URL), canonical/schema only if broken
E) Integration assumptions: implicit couplings across Worker + JS + Blogger + SW

METHOD (for every issue you list):
- Evidence: exact file + line range
- Expected behavior
- Actual behavior
- Root cause
- Failure condition(s)
- Severity: 🔴 core break, 🟠 UX break, 🟡 fragile, ⚪ cosmetic

OUTPUT FORMAT (in docs/audit/AUDIT_REPORT.md):
1) Executive Summary (max 10 bullets)
2) Failure Matrix table:
| Area | File | Lines | What breaks | Why (root cause) | Failure condition(s) | Severity |
3) Hidden Couplings (Critical) — list implicit dependencies
4) False Positives — things that look buggy but are fine
5) Stop Rule — user actions that will ALWAYS fail if unchanged
6) Minimal Repro List — 10–20 specific repro steps (URLs + action + observed)

STRICT RULES:
- No fixes, no refactors, no architecture proposals.
- If uncertain: label as "Underspecified" and explain why it’s unreliable.

REPO TRAVERSAL (must inspect at least):
- src/worker.js
- public/sw.js
- public/offline.html
- index.prod.xml
- index.dev.xml
- public/assets/** entrypoints
- main.js (or wherever navigation logic lives)

FINISH:
Ensure the report includes file+line evidence for each claim and separates symptoms vs root causes.
Then save the file docs/audit/AUDIT_REPORT.md.
