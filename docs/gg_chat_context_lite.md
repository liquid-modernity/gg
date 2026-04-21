GG CHAT CONTEXT — LITE

Status: Support context only. Not binding law.
Use: Default context for ChatGPT when writing TASKs for CODEX.

0. Priority

Binding law is only:

gg_master.md
gg_rules_of_xml.md
gg_rules_of_css.md
gg_rules_of_js.md
gg_rules_of_worker.md

This file does not override repo law.

1. Project in one breath

BLOG GAGA-ish / PakRPP is a content-first web app on Blogger with Cloudflare Worker at the edge.
Goal: app-like feel, premium trust, strong SEO/GEO/SEA, strict ownership, low maintenance, AI-safe architecture.

2. Operator reality

The operator is a vibe coder.
ChatGPT must translate intention into precise engineering TASKs.
CODEX implements.
Do not expect the operator to phrase requests technically.

3. Layer ownership defaults
XML owns SSR truth, render-context truth, semantic shell, host placement.
CSS owns presentation.
JS owns behavior, lifecycle, re-init.
Worker owns public URL handling, redirects/rewrites, headers, cache, release/drift guards.
Docs own governance, not runtime behavior.
4. Always-on assumptions
XML is the source of SSR truth.
CSS is not a router.
Worker is not a second template system.
Native Blogger comments are protected.
Soft-navigation parity matters.
Hard-refresh-only success is failure.
Prefer the smallest correct change.
Preserve SEO, GEO/AI discoverability, SEA readiness.
5. Before writing any TASK
Translate user language into engineering intent.
Classify the real problem:
structural SSR → XML
visual → CSS
lifecycle/state → JS
URL/cache/canonical/edge → Worker
Pick one primary owner layer.
Split into multiple TASKs if more than one primary owner exists.
Freeze scope:
in scope
out of scope
allowed files
protected zones
Define verify + rollback.
6. Hard bans

Do not let ChatGPT or CODEX do these:

CSS patch for XML truth
Worker patch for JS lifecycle
JS patch as substitute for missing XML host
route truth split across layers
naming drift
legacy aliases quietly becoming architecture
“looks okay” as verification
reload-only success as acceptance
mega-task by default
7. No-Playwright rule

Never instruct CODEX to use Playwright.
The operator’s device does not support it.

Therefore:

do not require Playwright
do not propose Playwright install/setup
do not make acceptance depend on Playwright
do not ask for browser automation as default verification

Preferred verification modes:

static code inspection
grep / diff / file-level contract checks
repo-safe shell commands that do not require Playwright
explicit manual route checklist for the operator when runtime proof is needed
8. Naming discipline

Use GG naming for internal machine-facing contracts:

.gg-*
#gg-*
data-gg-*
gg:*
gg-tpl-*

Do not preserve dishonest names as final architecture.
Examples:

detail metadata final family = gg-detail-info-sheet
listing preview family = gg-editorial-preview
do not use gg-editorial-preview for detail metadata
do not keep gg-info-panel as final family
9. TASK output minimum

Every TASK must state:

objective
owner layer
route surface / render context if relevant
allowed files
constraints
risks
rollback note
verify list

Also obey the layer-specific required output format from the governing law doc.

10. Verification minimum

Check as relevant:

route behavior
render-context integrity
no cross-surface leakage
canonical/head integrity
comments safety
naming-law compliance
no unjustified perf regression
hard refresh vs soft navigation parity when relevant
11. Success rule

A good TASK is:

atomic
owner-correct
testable
accountable
small enough for safe CODEX implementation
explicit about remaining debt