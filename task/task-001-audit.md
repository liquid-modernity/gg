# TASK — Audit Repository Against SYSTEM_ARCHITECTURE_AND_CODING_STANDARDS.md

You are auditing this repository against:

`SYSTEM_ARCHITECTURE_AND_CODING_STANDARDS.md`

This is an AUDIT-ONLY task.

Do not refactor code.
Do not move files.
Do not delete files.
Do not edit generated outputs.
Do not change production flags.
Do not loosen guards.
Do not fix anything yet.

Your job is to inspect the repository, run available checks, compare the actual repository state against the architecture and coding standards document, and produce factual audit reports with evidence.

Do not print, expose, inspect, or request secret values.
Only verify workflow references to expected GitHub repository secret names if needed.
Expected secret names may include:

- BLOGGER_API_KEY
- BLOGGER_ID_PAKRPP
- BLOGGER_ID_PAKRPP_STORE
- CLOUDFLARE_ACCOUNT_ID
- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ZONE_ID

Never expose secret values.

---

## Audit Scope

Audit the repository against these requirements from `SYSTEM_ARCHITECTURE_AND_CODING_STANDARDS.md`:

1. HTML-first rendering and progressive enhancement
2. Crawlable fallback content
3. Semantic HTML, heading hierarchy, and landmark structure
4. Registry-driven route and content contracts
5. Centralized metadata, canonical URLs, robots directives, Open Graph, Twitter/X cards, and schema
6. Single source of truth for behavior, routes, microcopy, icons, layout, schema, discovery content, and navigation
7. No duplicated route logic across `/`, `/landing`, and `/store`
8. Centralized JavaScript controller with approved route/surface adapters
9. Global CSS contract, design tokens, and no override pile
10. Accessibility and mobile-first requirements
11. Performance and Core Web Vitals readiness
12. Strict source/generated boundary
13. Generated files are not manually patched
14. Repository structure and file ownership clarity
15. Folder-level readability for humans and AI agents
16. CI, QA, guard, build, and Cloudflare deploy readiness
17. GitHub Actions workflow completeness
18. Repo hygiene: `.gitignore`, `.DS_Store`, `__MACOSX`, unused files, archive files
19. AI-agent operating rules and maintainability
20. Definition of Done compliance

---

## Required Commands

Run these commands when available.

If a command does not exist, report it clearly.
If a command fails because of local environment, report it clearly.
Do not hide failed commands.

```bash
git status --short
find . -name ".DS_Store" -o -name "__MACOSX"
find . -maxdepth 3 -type f | sort
npm ci
npm run build
npm run gaga:verify-repo-structure-tidy
npm run gaga:verify-ci-reconciliation
npm run ci:qa
npm run ci:85
npm run ci:95

Also inspect package.json and run any relevant existing audit/QA/guard command that is clearly related to:

repo structure
source/generated boundary
registry contract
controller architecture
CSS/visual system
accessibility
semantic HTML
schema/SEO
worker/Cloudflare
store readiness
production readiness
unused code/assets
Required Output Files

Create this report:

docs/audits/SYSTEM_ARCHITECTURE_COMPLIANCE_REPORT.md

Also create this machine-readable score file:

docs/audits/system-architecture-compliance-score.json

Also create this unused-cleanup candidate report:

docs/audits/UNUSED_CLEANUP_CANDIDATES.md

Do not create fixes yet.

Required Report Structure

docs/audits/SYSTEM_ARCHITECTURE_COMPLIANCE_REPORT.md must include:

Executive verdict
Overall percentage score
Development-readiness status
Production-readiness status
Score table by category
Pass/fail/warning evidence
Exact commands run
Exact failed commands
Missing files/folders
Source/generated boundary findings
CI/CD and GitHub Actions findings
Guard/QA/tooling findings
Accessibility findings
Performance findings
Store readiness findings
Repo hygiene findings
AI-agent maintainability findings
Human maintainability findings
Top 10 blockers
Top 10 warnings
Top 10 recommended fixes
Recommended next task order
“Do not fix yet” section listing risky changes that require approval

Use evidence-based scoring only.

Do not give a high score because the architecture “looks good”.
Reduce score for:

missing .gitignore
missing .github/workflows
failing CI/QA guards
missing folder ownership docs
unclear source/generated boundary
generated files without traceable source
duplicate route logic
scattered CSS/JS
production placeholder assets
production flags not ready
missing Cloudflare deploy proof
macOS junk files
unused files with unclear ownership
Required JSON Structure

Create:

docs/audits/system-architecture-compliance-score.json

Use this structure:

{
  "overallScore": 0,
  "status": "not-ready",
  "categories": {
    "htmlFallbackSeo": 0,
    "sourceOfTruth": 0,
    "registryArchitecture": 0,
    "javascriptController": 0,
    "cssVisualSystem": 0,
    "accessibility": 0,
    "performance": 0,
    "routeStability": 0,
    "repoStructure": 0,
    "sourceGeneratedBoundary": 0,
    "ciQaGuards": 0,
    "cloudflareDeploy": 0,
    "storeReadiness": 0,
    "repoHygiene": 0,
    "aiAgentReadability": 0,
    "humanMaintainability": 0
  },
  "blockers": [],
  "warnings": [],
  "recommendedNextTasks": []
}
Unused / Lean Repository Audit

Create:

docs/audits/UNUSED_CLEANUP_CANDIDATES.md

Audit unused or probably-unused code and assets, but do not delete anything yet.

Identify candidates for:

unused CSS selectors
unused JavaScript modules/functions
unused HTML fragments/templates
unused generated outputs
unused assets/images/icons/fonts
unused JSON/data files
unused QA/tools scripts
duplicate route logic
duplicate controller behavior
duplicate style contracts
archive files still imported by active source
dead files with unclear ownership
obsolete reports or stale generated artifacts
macOS/system junk files such as .DS_Store and __MACOSX

Use this table:

Path	Type	Evidence	Risk	Suggested Action

Rules:

Do not delete files.
Do not modify source.
Do not edit generated output.
Do not remove anything only because it “looks unused”.
Every cleanup candidate must include evidence.
Mark high-risk candidates clearly.
Scoring Rules

Use this interpretation:

95–100: production-grade and fully aligned
90–94: release-candidate ready with minor warnings
80–89: strong development architecture, not fully production-ready
70–79: usable but not professionally clean
60–69: structurally risky
below 60: not ready

Do not claim 100% unless:

clean install works
build works
all required QA/CI guards pass
source/generated boundary is clear
GitHub Actions are present
Cloudflare deploy workflow is present
no junk files exist
major folder ownership is documented
generated output is traceable back to source
no production placeholder assets remain
no critical accessibility/SEO/schema failures remain
Final Response

When done, summarize only:

files created
overall score
failed commands
top blockers
recommended next task

Do not perform fixes.