# TASK-P1.07H

## 1. Legacy Logic Triage Matrix

| Behavior | Classification | Evidence | Reason | Next-task rule |
| --- | --- | --- | --- | --- |
| Reply context parsing | KEEP AS PRODUCT LOGIC | `public/assets/latest/modules/ui.bucket.core.js` parses `[reply ...]` tokens and falls back to parent comment ancestry in `parseReplyToken()` and `resolveReplyContext()` | This is real product value: it preserves who a reply targets even when nested depth or DOM shape changes | Rebuild as footer-owned reply state; keep token parsing as hidden transport only |
| Reply mention render | KEEP AS PRODUCT LOGIC | `ensureReplyContext()` injects `.cmt2-reply-meta` above the body; CSS compresses it for rail mode | This gives readable reply ancestry in a narrow thread without opening the parent | Keep, but make the badge smaller, one-line, and always footer/thread-owner rendered by enhanced layer |
| Target jump + highlight | KEEP AS PRODUCT LOGIC | `jumpToComment()` and `markTarget()` add `is-targeted`; CSS styles `li.comment.is-targeted` | Useful and rail-safe; it turns reply context into navigation | Keep exactly as product behavior, but scope it to enhanced reply badge only |
| Thread toggle | KEEP AS PRODUCT LOGIC | `ensureToggleButton()` creates `.cmt2-thread-toggle`; `toggleReplies()` owns collapsed state | Valuable in 240px because reply stacks otherwise overrun the rail | Keep, but collapse copy and placement to a compact secondary action under one owner |
| Moderation / deleted-state handling | REBUILD DIFFERENTLY | `isDeletedComment()` regex-detects removed/deleted text; `ensureModerationState()` emits generic `Moderation note` | Valuable, but current implementation collapses distinct native states into one vague label | Keep the idea, but map native deleted/removed/moderated states into explicit enhanced labels |
| Pseudo-like | DISCARD COMPLETELY | Comments CSS still carries `.btn-pill` and `.btn-pill.is-liked`, but no comment runtime creates or persists likes | It is dead weight in the threaded-comments owner path and adds action pressure in 240px | Do not carry it into the reset; revisit only after ownership is stable |
| Author badge / role cue | REBUILD DIFFERENTLY | No active comment role/badge logic exists beyond author name rendering and `data:comment.adminClass` plumbing | Potentially useful, but there is no trustworthy visible implementation to preserve | If added later, compute a minimal `Post author` cue from post-author metadata; do not infer more roles yet |
| Composer / editor movement | DISCARD COMPLETELY | `mountTopComposer()`, `mountReplyComposer()`, `restoreReplyComposer()`, and `syncComposerOwner()` move native composer nodes between list and footer | This is the center of the hybrid-owner problem; it makes ownership depend on runtime relocation | Replace with one fixed visible footer owner and one bounded hidden plumbing slot |
| MutationObserver enhancement loop | DISCARD COMPLETELY | `bindHost()` installs `host.__ggCommentsObserver` and re-runs `enhance()` on subtree churn | This is fragile and makes Blogger/native churn fight the enhanced layer repeatedly | Replace with event-bounded sync points only: initial load, native reply open, native delete/moderation result, and panel open |
| Native DOM cleansing strategy | REBUILD DIFFERENTLY | CSS and JS both suppress native nodes: `.item-control`, native reply links, thread scaffolds, help copy, helper messages | Some hiding is unavoidable, but current strategy is broad post-render warfare | Move suppression to a small allowlist/denylist enforced at template + one post-load pass, not ongoing warfare |
| Reply template / token handling | KEEP AS PRODUCT LOGIC | `[reply ...]` token stripping is active; helper-copy suppression still references manual rich-tag copy | The hidden token is useful; the visible template/help UX is not | Keep token parsing only; remove any user-facing manual reply-template pattern from the visible product |
| Add-comment ownership | REBUILD DIFFERENTLY | Footer CTA `#gg-top-continue`, native `#top-continue`, and `ui.bucket.authors.js` bridge can all open composer paths | Multiple entry points currently compete and require cleanup/proof logic | Next build must expose one visible `Add comment` owner in the footer only |
| Nested reply ownership | REBUILD DIFFERENTLY | `normalizeReplyLink()` creates enhanced reply while native reply links still exist underneath and are suppressed afterward | The product needs reply on nested items, but current implementation leaves duplicate ownership behind it | Keep one enhanced `Reply` per eligible comment; native reply links stay hidden plumbing only |
| Delete / more-actions ownership | REBUILD DIFFERENTLY | `ensureMenuButton()` sometimes reuses native `.goog-toggle-button` as visible `.cmt2-native-more` | Reusing native visible controls violates the single visible owner contract | Enhanced `More` stays visible owner; native delete link remains hidden backend action only |

## 2. Valuable Product Logic To Keep

- Reply-context resolution is worth keeping: token-first, ancestry-fallback.
- Clickable reply mention is worth keeping because it compresses reply ancestry into rail-safe context.
- Jump-to-comment plus temporary highlight is worth keeping.
- View/hide replies is worth keeping, especially for nested replies inside 240px.
- Deleted/moderated state presentation is worth keeping, but it needs clearer state labels than the current generic note.
- A reply-mode banner is worth keeping, but only as a light footer cue tied to the single composer owner.
- Proof assertions are worth keeping as release gates. The current runtime already encodes useful failure conditions such as duplicate composer owners and duplicate add-comment owners.

## 3. Legacy Implementation Patterns To Discard

- Any model where the visible composer owner changes by moving native composer nodes between thread and footer.
- Any model where native reply/delete/helper scaffolding is allowed to render first and then be hidden by broad JS/CSS cleanup.
- Any visible reuse of native Blogger popup chrome such as `.goog-toggle-button` / `.item-control`.
- Any broad subtree `MutationObserver` that re-enhances the whole comments tree after native churn.
- Any user-visible help modal, rich-tag helper copy, or manual reply-template UX as part of the primary comments path.
- Any assumption that a top-level `#top-continue` or inline reply box can remain a visible peer beside the enhanced footer owner.
- Any rule that tolerates native and enhanced reply controls being simultaneously visible, even briefly.

## 4. Single Visible Owner Model

- Backend owner: Blogger remains source of truth for comment storage, reply targets, delete/moderation permissions, and actual submission plumbing.
- Visible owner: the enhanced right-rail comments UI becomes the only visible owner for actions, reply context, thread toggles, moderation labels, add-comment CTA, reply cue, and composer state.
- Visible add-comment owner: one footer CTA inside the rail footer.
- Visible composer owner: one sticky footer composer inside the rail footer.
- Visible reply owner: one enhanced `Reply` action per eligible comment.
- Visible more/delete owner: one enhanced `More` menu per eligible comment; delete remains inside that menu, never as a visible peer when `More` exists.
- Visible moderation owner: one enhanced state label per comment.

## 5. Backend-Hidden Vs Visible-Enhanced Boundary Map

| Layer | Keep | Hide | Retire |
| --- | --- | --- | --- |
| Blogger backend | `data:post.commentHtml`, native permission logic, native reply/delete URLs, iframe submission plumbing, `BLOG_CMT_createIframe()` | N/A | N/A |
| Native DOM plumbing | Hidden reply links, hidden delete links, hidden reply boxes, hidden native add-comment link, hidden form source node `#comment-editor-src` | Visible native reply links, visible native `item-control`, visible native help/helper copy | SSR legacy `comments-ssr` visual owner |
| Enhanced visible layer | Rail footer CTA, rail footer composer shell, enhanced reply badge, enhanced reply action, enhanced thread toggle, enhanced more menu, enhanced moderation label, jump/highlight behavior | Nothing else should own the visible interaction layer | Any fallback that leaves native helpers visible underneath |

Boundary rule:

- Native markup may exist only as hidden plumbing that the enhanced layer triggers or reads from.
- The moment a native helper becomes visible, ownership has failed.

## 6. Composer / Reply Architecture Reset Summary

- The sticky rail footer becomes the only visible composer owner.
- `Add comment` opens the footer composer in default mode.
- `Reply` opens the same footer composer in reply mode.
- Reply mode sets one root-level state object: `replyTargetId`, `replyTargetAuthor`, `replyPermalink`, `replyMode`.
- The footer shows one compact reply cue above the composer. No inline reply owner is visible inside the thread.
- Native Blogger reply plumbing may still be triggered behind the scenes to set the backend reply target, but the resulting native form must be docked into one fixed hidden plumbing slot inside the footer, not displayed inline in the thread.
- There is no restore-to-thread visible cycle. The thread never regains visible composer ownership.
- Nested replies use the same footer owner. No depth level gets its own visible composer.

## 7. 240px Rail Adaptation Rules

- Treat `--gg-col-right: 240px` as the primary contract, not a responsive edge case.
- Keep the header single-line and low-noise.
- Actions per comment should collapse to: `Reply`, `View/Hide replies` when needed, and `More`.
- Reply context badge must fit one line with truncation; it cannot become a block quote.
- Nested reply indentation must stay shallow. One visual guide line is enough.
- Moderation labels must be short: `Deleted`, `Removed by admin`, `Awaiting moderation`, or equivalent final copy.
- Footer CTA and composer must fit the full rail width with no secondary inline owners.
- `More` menu width must be rail-safe and not rely on wide desktop spacing.
- Highlight state must not expand layout or add large outlines that consume width.
- Any behavior that assumes a wide feed card, horizontal toolbar, or two-column comment row must be rejected.

## 8. Decommission List

Remove outright:

- The visible legacy `comments-ssr` owner path as a product surface.
- Broad comments help modal / helper-copy affordances in the active comments UX.
- Visible native `item-control` / `.goog-toggle-button` reuse.
- Visible raw native reply links and raw native thread scaffolds.
- Subtree-wide comments `MutationObserver` re-enhancement loop.

Replace with narrower logic:

- Replace composer relocation with one fixed footer plumbing slot.
- Replace broad DOM suppression with a one-time normalization pass plus template-level omission where possible.
- Replace generic moderation note generation with explicit state mapping.
- Replace multiple add-comment triggers with one footer CTA that proxies hidden native plumbing.
- Replace proof-by-cleanup with proof-by-owner-contract: fail if native visible peers appear.

## 9. Proof / Test Plan

Release proof conditions for the rebuild:

1. Exactly one visible add-comment owner exists.
2. Exactly one visible composer owner exists.
3. No visible native helper scaffolding remains.
4. No visible `Delete` peer remains when `More` exists.
5. Every eligible nested reply exposes one visible enhanced `Reply`.
6. Sticky composer opens reliably from both `Add comment` and `Reply`.
7. Reply mention jump/highlight works from top-level and nested replies.
8. Moderation state has one visible owner and one explicit label.
9. No duplicate native + enhanced comments rails remain visible.

Recommended proof shape for the next implementation task:

- Unit-test pure parsing/state helpers: reply token parsing, moderation-state mapping, proof collector.
- DOM integration tests for the footer-owner contract.
- One live verification that triggers native add-comment, reply, delete availability, and nested reply toggle in rail mode.
- Keep a runtime proof collector, but make it assert the new owner contract rather than patch around failures.

## 10. Ranked Implementation Order For The Next Task

1. Remove legacy visible owners at the template level: eliminate any secondary visible comments owner and harden one rail-root contract.
2. Replace the composer model first: one footer owner, one hidden plumbing slot, one reply state machine.
3. Replace action ownership next: enhanced `Reply`, `More`, and thread toggle only; native actions become hidden plumbing.
4. Rebuild reply context and jump/highlight on top of the new owner model.
5. Rebuild moderation state mapping with explicit labels.
6. Delete the comments-specific subtree observer and broad cleanup paths.
7. Re-run proof assertions and convert them into CI/live verification checks.
8. Only after the owner contract is stable, evaluate optional author cue work. Keep pseudo-like out of scope.

## 11. Exact Files / Sections Inspected

- `index.prod.xml`
  - `commentDeleteIcon`, `commentForm`, `commentItem`, `comments`, and `threadedComments` includables
  - post toolbar comments trigger
  - comments panel mount slot
- `public/assets/latest/modules/ui.bucket.core.js`
  - `GG.services.comments.mountWithRetry()`
  - `GG.core.commentsGate`
  - `GG.modules.Comments` from `ensureLoaded()` through `enhance()`, proof collection, menu ownership, reply state, toggle state, and observer binding
  - right-panel / right-mode comments panel wiring
  - `rehydrateComments()`
- `public/assets/latest/modules/ui.bucket.authors.js`
  - composer bridge opened from `[data-gg-postbar="comments"]`
- `public/assets/latest/modules/ui.bucket.post.js`
  - comments panel visibility detection hooks
- `public/assets/latest/main.css`
  - root rail width contract `--gg-col-right: 240px`
  - comments footer, rail-mode layout, suppression rules, thread layout, reply badge, moderation badge, jump highlight, native-more styling
- `.github/workflows/ci.yml`
  - CI scope truth and dry-run behavior
- `.github/workflows/deploy.yml`
  - deploy scope truth, `main` guard, Cloudflare deploy, live smoke, template-release guard
- `qa/gaga-audit.mjs`
  - ZIP audit expectations and output paths
- `qa/template-pack.sh`
  - Blogger template artifact packaging and manual publish boundary
- `docs/github-actions-cloudflare.md`
  - GitHub Actions deploy model and Cloudflare scope

## 12. No-Code Conclusion

This task should not patch the current comments runtime incrementally.

The evidence shows that the useful part of the legacy module is behavioral, not architectural. The next implementation task should preserve reply context, jump/highlight, thread toggle, and moderation presentation, while deleting hybrid ownership patterns: visible native peers, composer relocation ownership, native popup reuse, and observer-driven cleanup warfare.

The next task succeeds only if the rail ends with one visible owner, one sticky composer, one action system, and hidden Blogger plumbing underneath it.
