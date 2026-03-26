# TASK-P1.07AA

## Commits
- Ownership fix: `7da00a8fb61041c6bc6db2314581453a9048ee91`
- Deploy stabilization: `f2a6ee6dd7c577699c4491465399873cf72fca01`

## Workflow Runs
- CI: PASS  
  https://github.com/liquid-modernity/gg/actions/runs/23318023406
- Deploy Worker/Assets to Cloudflare: PASS  
  https://github.com/liquid-modernity/gg/actions/runs/23318052652

## Exact Files Changed
- public/assets/latest/modules/ui.bucket.core.js
- public/assets/latest/main.css
- public/assets/v/ac33998/modules/ui.bucket.core.js
- public/assets/v/ac33998/main.css
- .github/workflows/deploy.yml

## Old vs New Ownership
- Old runtime mount target: `#postcards > #ggPanelComments`
- New runtime mount target: `.gg-blog-sidebar--right > #ggPanelComments`
- Raw source HTML still emits the panel after the post stack, before the right sidebar. Runtime now corrects that on desktop by relocating the active panel into the real sidebar container.

### Raw Source Proof
- URL: https://www.pakrpp.com/2025/10/in-night-we-stand-in-day-we-fight.html
- Snippet:
  - <div class='gg-post__comments-anchor' data-gg-comments-owner='panel' ...></div>
  - </article>
  - <div class='gg-comments-panel' id='ggPanelComments' ...>
  -   <div class='gg-comments-panel__body' data-gg-slot='comments'>
  - <aside class='gg-blog-sidebar gg-blog-sidebar--right'>

### Before Runtime Proof
- Fixture: https://www.pakrpp.com/2025/10/in-night-we-stand-in-day-we-fight.html
- Panel chain: div#ggPanelComments.gg-comments-panel <- div#postcards.gg-stack <- div#Blog1.widget.Blog <- div#blog.gg-home-blog__body.section <- div.gg-blog-main <- div.gg-blog-layout.gg-blog-layout--post <- section#gg-home-blog.gg-home-blog <- main#gg-main.gg-main
- In sidebar: false
- In postcards/body stack: true
- Panel positioning: sticky / top 10px
- Sidebar positioning: sticky / top 0px

### After Runtime Proof
- Fixture: https://www.pakrpp.com/2025/10/in-night-we-stand-in-day-we-fight.html
- Panel chain: div#ggPanelComments.gg-comments-panel <- aside.gg-blog-sidebar.gg-blog-sidebar--right <- div.gg-blog-layout.gg-blog-layout--post <- section#gg-home-blog.gg-home-blog <- main#gg-main.gg-main <- div.gg-page-shell <- body.loading <- html
- In sidebar: true
- In postcards/body stack: false
- After info panel sibling: true
- Panel positioning: relative / top 0px
- Sidebar positioning: sticky / top 0px
- Runtime owner marker: sidebar-right
- Runtime mount target marker: .gg-blog-sidebar--right

## Editorial Preview Reference
- Reference selector: `.gg-blog-sidebar--right > .gg-info-panel`
- Sidebar chain: aside.gg-blog-sidebar.gg-blog-sidebar--right <- div.gg-blog-layout.gg-blog-layout--list <- section#gg-home-blog.gg-home-blog <- main#gg-main.gg-main <- div.gg-page-shell <- body.loading.gg-is-landing <- html
- Info panel chain: div.gg-info-panel <- aside.gg-blog-sidebar.gg-blog-sidebar--right <- div.gg-blog-layout.gg-blog-layout--list <- section#gg-home-blog.gg-home-blog <- main#gg-main.gg-main <- div.gg-page-shell <- body.loading.gg-is-landing <- html
- Sidebar position: sticky / top 0px
- Inherited from editorial preview:
  - actual ownership by `.gg-blog-sidebar--right`
  - sticky boundary owned by the sidebar column
  - child rail fills the sidebar interior rather than behaving like a viewport widget
- Intentionally not inherited:
  - editorial preview card UI/content
  - info-mode overlay behavior
  - listing-only preview semantics

## Sticky Model Cleanup
- Old conflict:
  - desktop still preferred global `#ggPanelComments` lookup under `main`
  - desktop CSS still treated `#ggPanelComments` as its own sticky shell
  - overlay CSS leaked up to `1200px`, wider than runtime mobile logic
- Fix:
  - added runtime helper at `public/assets/latest/modules/ui.bucket.core.js:1096-1138` to relocate the active panel into `.gg-blog-sidebar--right`
  - updated Panels focus/backdrop/init at `public/assets/latest/modules/ui.bucket.core.js:8460-8608,8740-8743` so desktop comments mode syncs the mount before use
  - changed desktop comments-mode sidebar alignment at `public/assets/latest/main.css:3163-3188` from visual fake-right to true stretch ownership
  - replaced desktop panel shell rules at `public/assets/latest/main.css:6347-6368` and `public/assets/latest/main.css:9481-9499` so the panel is `position: relative` and fills the sticky sidebar instead of being its own sticky/fixed shell
  - scoped overlay fallback to `max-width: 1023px` at `public/assets/latest/main.css:6674-6685` and `public/assets/latest/main.css:9877-9888`
- Mobile/narrow behavior preserved:
  - overlay path remains only for `max-width: 1023px`
  - desktop no longer shares the old fixed-shell path

## Live Smoke
- Final result: PASS
- Log: `qa/audit-output/task-p107aa-live-smoke.txt`

## Screenshots
- Before zero: `qa/audit-output/screenshots/task-p107aa-before-zero.png`
- Before two: `qa/audit-output/screenshots/task-p107aa-before-two.png`
- Before sixteen: `qa/audit-output/screenshots/task-p107aa-before-sixteen.png`
- After zero: `qa/audit-output/screenshots/task-p107aa-after-zero.png`
- After two: `qa/audit-output/screenshots/task-p107aa-after-two.png`
- After sixteen: `qa/audit-output/screenshots/task-p107aa-after-sixteen.png`

## Deploy Stabilization Note
- AA runtime fix itself was valid, but Deploy failed once because live-smoke ran before public rollout had fully settled.
- The deploy workflow now retries live-smoke at `.github/workflows/deploy.yml:235-278` without changing the contract or downgrading real failures.
