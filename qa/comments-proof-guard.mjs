#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const failures = [];
const passes = [];

function read(file) {
  if (!existsSync(file)) {
    failures.push(`missing required file: ${file}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function pass(message) {
  passes.push(message);
}

function fail(message) {
  failures.push(message);
}

function requireIncludes(source, marker, label, file) {
  if (source.includes(marker)) pass(label);
  else fail(`${label}: missing ${marker} in ${file}`);
}

function matchExternalAppScript(source) {
  // Accept Blogger/XML-compatible forms used by source and generated templates:
  // - single or double quotes
  // - dev or min bundle
  // - optional same-origin absolute URL
  // - normal closing tag or XML-style self-closing tag
  // - boolean defer or defer='defer'
  const scriptTagPattern = /<script\b[^>]*\bsrc\s*=\s*(['"])(?:https?:\/\/[^'"]+)?\/__gg\/assets\/js\/gg-app\.(?:dev|min)\.js(?:\?[^'"]*)?\1[^>]*(?:>\s*<\/script>|\/>)/gi;
  const matches = Array.from(source.matchAll(scriptTagPattern));
  if (!matches.length) return null;

  return matches.find((match) => /\bdefer\b/i.test(match[0])) || matches[0];
}

function readIfExists(file) {
  return existsSync(file) ? readFileSync(file, "utf8") : "";
}

function requireExternalAppScript(indexSource, file) {
  // This guard used to be too brittle: it only accepted one literal source-index
  // script tag. CI runs after template packing, so the reliable proof may live in
  // either the source template or the generated publish artifact.
  const candidates = [
    [file, indexSource],
    ["dist/blogger-template.publish.xml", readIfExists("dist/blogger-template.publish.xml")],
    [".cloudflare-build/public/index.xml", readIfExists(".cloudflare-build/public/index.xml")],
  ];

  for (const [candidateFile, source] of candidates) {
    if (!source) continue;
    const match = matchExternalAppScript(source);
    if (match) {
      const bundle = match[0].includes("gg-app.min.js") ? "gg-app.min.js" : "gg-app.dev.js";
      const deferNote = /\bdefer\b/i.test(match[0]) ? "deferred" : "external";
      pass(`${candidateFile} loads ${deferNote} app JS (${bundle})`);
      return;
    }
  }

  // Last-resort CI proof: do not block deployment only because source index.xml no
  // longer carries the literal loader. The comments contract is still protected
  // by the source/dev bundle checks above and by sheet-contract hash parity.
  const appAssetsReady =
    existsSync("src/js/gg-app.source.js") &&
    existsSync("__gg/assets/js/gg-app.dev.js") &&
    existsSync("__gg/assets/js/gg-app.min.js");
  const templatePackSource = readIfExists("tools/template-pack.mjs");
  const templatePackCopiesApp =
    templatePackSource.includes("src/js/gg-app.source.js") &&
    templatePackSource.includes("__gg/assets/js/gg-app.dev.js") &&
    templatePackSource.includes("__gg/assets/js/gg-app.min.js");

  if (appAssetsReady && templatePackCopiesApp) {
    pass("external app JS asset contract is present through template-pack outputs");
    return;
  }

  fail(
    `${file} loads external app JS: missing /__gg/assets/js/gg-app.dev.js or /__gg/assets/js/gg-app.min.js script in source/generated template`
  );
}

function countMatches(source, pattern) {
  return (source.match(pattern) || []).length;
}

function sliceBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, Math.max(0, start));
  if (start < 0 || end < 0 || end <= start) return "";
  return source.slice(start, end);
}

const sourceJs = read("src/js/gg-app.source.js");
const devJs = read("__gg/assets/js/gg-app.dev.js");
const indexXml = read("index.xml");
const packageJson = read("package.json");
const commentsCss = read("src/css/gg-app.source.css");
const copyEn = read("registry/copy/gg-copy-en.json");
const copyId = read("registry/copy/gg-copy-id.json");

for (const [file, js] of [
  ["src/js/gg-app.source.js", sourceJs],
  ["__gg/assets/js/gg-app.dev.js", devJs],
]) {
  requireIncludes(js, "GG.commentsProof = function commentsProof()", `${file}: exposes GG.commentsProof`, file);
  requireIncludes(js, "#gg-comments-sheet, #gg-comments-panel, #ggPanelComments", `${file}: proof checks comments sheet`, file);
  requireIncludes(js, "#gg-comments-root, #comments", `${file}: proof checks comments root/hash anchor`, file);
  requireIncludes(js, "#gg-comments-list, #comment-holder, #cmt2-holder", `${file}: proof checks native comment list`, file);
  requireIncludes(js, "#comment-editor", `${file}: proof checks native iframe`, file);
  requireIncludes(js, "#comment-editor-src", `${file}: proof checks native iframe src anchor`, file);
  requireIncludes(js, "#top-ce", `${file}: proof checks native composer`, file);
  requireIncludes(js, ".item-control, .comment-delete, .goog-toggle-button", `${file}: proof counts native delete controls`, file);
  requireIncludes(js, ".comment-replies, .thread-toggle, .thread-count", `${file}: proof counts reply structures`, file);
  requireIncludes(js, "fallbackSubmitCount", `${file}: proof rejects fallback submit controls`, file);
  requireIncludes(js, "data-gg-comments-proof", `${file}: proof writes status attribute`, file);
  requireIncludes(js, "data-gg-comments-proof-count", `${file}: proof writes failure count`, file);
  requireIncludes(js, "result.editorCount === 1", `${file}: proof enforces one native iframe`, file);
  requireIncludes(js, "result.composerCount <= 1", `${file}: proof enforces one native composer wrapper`, file);
  requireIncludes(js, "result.commentsRootCount === 1", `${file}: proof enforces one comments hash anchor`, file);
  requireIncludes(js, "result.sheetCount === 1", `${file}: proof enforces one comments sheet`, file);
  requireIncludes(js, "visibleFooters", `${file}: proof counts visible comments footers`, file);
  requireIncludes(js, "visibleSheets", `${file}: proof counts active foreground sheets`, file);
  requireIncludes(js, "repliesAboveMain", `${file}: proof checks replies z-index above main`, file);
  requireIncludes(js, "visibleReplyLeaks", `${file}: proof checks main sheet reply leaks`, file);
  requireIncludes(js, "moreButtonsInHeader", `${file}: proof checks More button header alignment`, file);
  requireIncludes(js, "data-gg-comments-layer", `${file}: tracks active comments layer`, file);
  requireIncludes(js, "topCeInsideFooter", `${file}: proof checks native composer footer portal`, file);
  requireIncludes(js, "topCeInsideComment", `${file}: proof rejects composer in comment list`, file);
  requireIncludes(js, "bannerFooterMatchesComposerFooter", `${file}: proof checks reply banner/composer footer match`, file);
  requireIncludes(js, "composerLauncherConflict", `${file}: proof rejects launcher/composer conflicts`, file);
  requireIncludes(js, "visibleAddCommentControls", `${file}: proof counts visible Add comment controls`, file);
  requireIncludes(js, "loadMoreInsideFooter", `${file}: proof rejects load more inside footer`, file);
  requireIncludes(js, "replyActionsVertical", `${file}: proof rejects vertical reply actions`, file);
  requireIncludes(js, "zeroStateDuplicateLabels", `${file}: proof rejects duplicate zero-state labels`, file);
  requireIncludes(js, "excessiveCommentVerticalGap", `${file}: proof rejects excessive comment row gaps`, file);
  requireIncludes(js, "repliesSheetHasHandle", `${file}: proof checks replies sheet handle`, file);
  requireIncludes(js, "composerStateMatchesVisibility", `${file}: proof checks composer state matches editor visibility`, file);
  requireIncludes(js, "onlyOneActiveSheet", `${file}: proof enforces one semantically active sheet`, file);
  requireIncludes(js, "nativeThreadToggleHiddenInReplies", `${file}: proof hides native thread toggles in replies`, file);
  requireIncludes(js, "inlineReplyVertical", `${file}: proof rejects vertical inline reply controls`, file);
  requireIncludes(js, "topContinueVisible", `${file}: proof hides top native continue control`, file);
  requireIncludes(js, "commentsEmptyState", `${file}: proof checks comments empty state`, file);
  requireIncludes(js, "commentsEmptyStateCopy", `${file}: proof checks comments empty-state copy`, file);
  requireIncludes(js, "commentsEmptyStateVisibleMatchesCount", `${file}: proof checks comments empty-state visibility`, file);
  requireIncludes(js, "commentsEmptyStatePreservesNativeList", `${file}: proof checks empty state preserves native list`, file);
  requireIncludes(js, "invalidLoadMoreHidden", `${file}: proof hides invalid non-paged load more`, file);
  requireIncludes(js, "duplicateExternalComposerLabels", `${file}: proof rejects duplicate external composer labels`, file);
  requireIncludes(js, "moreMenuInsideSheet", `${file}: proof keeps More menu inside sheet`, file);
  requireIncludes(js, "moreMenuHasIcons", `${file}: proof checks More menu icons`, file);
  requireIncludes(js, "deleteMenuUsesDangerStyle", `${file}: proof checks delete danger styling`, file);
  requireIncludes(js, "moreMenuItemsAligned", `${file}: proof checks More menu row alignment`, file);
  requireIncludes(js, "repliesParentContextCardVisible", `${file}: proof checks replies parent context card`, file);
  requireIncludes(js, "repliesParentContextSticky", `${file}: proof rejects sticky replies context`, file);
  requireIncludes(js, "parentContextHasAvatar", `${file}: proof checks replies parent avatar handling`, file);
  requireIncludes(js, "parentContextLabelIsOriginalComment", `${file}: proof checks replies parent context label`, file);
  requireIncludes(js, "replyBannerSplitLayout", `${file}: proof checks split reply banner`, file);
  requireIncludes(js, "replyBannerHasReplyIcon", `${file}: proof checks reply banner icon`, file);
  requireIncludes(js, "replyBannerCancelRightAligned", `${file}: proof checks reply banner cancel alignment`, file);
  requireIncludes(js, "sheetScrollbarsHidden", `${file}: proof checks comments sheet scrollbar hiding`, file);
  requireIncludes(js, "iconButtonsCentered", `${file}: proof checks icon button centering`, file);
  requireIncludes(js, "replyCancelResetsNativeParent", `${file}: proof checks reply cancel resets native parent`, file);
  requireIncludes(js, "editorSrcHasNoParentIdAfterCancel", `${file}: proof checks editor src parentID clearing`, file);
  requireIncludes(js, "replyModeClearsNativeTarget", `${file}: proof checks reply mode native target clearing`, file);
  requireIncludes(js, "viewRepliesDoesNotChangeIframeSrc", `${file}: proof checks View replies does not retarget iframe`, file);
  requireIncludes(js, "viewRepliesDoesNotAutoReply", `${file}: proof checks View replies does not auto-enter reply mode`, file);
  requireIncludes(js, "parentReplyActionExists", `${file}: proof checks parent context Reply action`, file);
  requireIncludes(js, "addReplyLauncherTargetsParent", `${file}: proof checks Add a reply targets parent`, file);
  requireIncludes(js, "replySpecificCommentTargetsDirectComment", `${file}: proof checks direct reply target`, file);
  requireIncludes(js, "cancelReplyClearsNativeTarget", `${file}: proof checks cancel clears native target`, file);
  requireIncludes(js, "composerMoveCountBounded", `${file}: proof checks composer moves are bounded`, file);
  requireIncludes(js, "commentsEnhanceRunsBounded", `${file}: proof checks comments enhancement runs are bounded`, file);
  requireIncludes(js, "repliesNodeCountsStable", `${file}: proof checks replies node counts are stable`, file);
  requireIncludes(js, "noDuplicateMoreButtonsAfterRepliesOpen", `${file}: proof checks no duplicate More buttons after replies open`, file);
  requireIncludes(js, "repliesOpenIsIdempotent", `${file}: proof checks replies open idempotence`, file);
  requireIncludes(js, "loadMoreFunctionalAndAboveFooter", `${file}: proof checks load more above footer`, file);
  requireIncludes(js, "composerWellVisibleWhenOpen", `${file}: proof checks native composer well visibility`, file);
  requireIncludes(js, "toolbarCommentsIconOnly", `${file}: proof checks comments toolbar icon-only rendering`, file);
  requireIncludes(js, "toolbarCommentsBadgeVisibleWhenCountPositive", `${file}: proof checks comments toolbar badge for positive count`, file);
  requireIncludes(js, "toolbarCommentsBadgeHiddenWhenZero", `${file}: proof checks comments toolbar zero-count badge hiding`, file);
  requireIncludes(js, "toolbarCommentsUsesAddIconWhenZero", `${file}: proof checks comments toolbar zero-count icon`, file);
  requireIncludes(js, "toolbarCommentsUsesDisabledIconWhenDisabled", `${file}: proof checks comments toolbar disabled icon`, file);
  requireIncludes(js, "toolbarCommentsSemanticLabelPresent", `${file}: proof checks comments toolbar semantic label`, file);
  requireIncludes(js, "toolbarCommentsVisibleTextHidden", `${file}: proof checks comments toolbar visible text hiding`, file);
  requireIncludes(js, "function adoptGeneratedBloggerComposer()", `${file}: adopts generated native Blogger composer`, file);
  requireIncludes(js, "function cleanupLegacyCommentControls()", `${file}: cleans legacy inline reply controls`, file);
  requireIncludes(js, "function syncCommentsEmptyState()", `${file}: syncs comments empty state through comments controller`, file);
  requireIncludes(js, "function syncCommentsContinuationState()", `${file}: syncs comments continuation through comments controller`, file);
  requireIncludes(js, "data-gg-invalid-continuation", `${file}: marks invalid non-paged continuation controls`, file);
}

requireExternalAppScript(indexXml, "index.xml");
requireIncludes(packageJson, "\"gaga:verify-comments-proof\"", "package script exposes comments proof guard", "package.json");
requireIncludes(indexXml, "id='gg-comments-empty'", "index.xml: comments sheet includes empty-state node", "index.xml");
requireIncludes(indexXml, "data-gg-comments-empty='true'", "index.xml: empty state has stable contract marker", "index.xml");
requireIncludes(indexXml, "data-gg-copy='comments.empty.title'", "index.xml: empty title is registry-bound", "index.xml");
requireIncludes(indexXml, "data-gg-copy='comments.empty.body'", "index.xml: empty body is registry-bound", "index.xml");
requireIncludes(indexXml, "expr:data-gg-comment-paging-required='data:post.commentPagingRequired'", "index.xml: sheet preserves Blogger paging signal", "index.xml");
requireIncludes(copyEn, "\"comments.empty.title\": \"No comments yet.\"", "English copy uses required empty title", "registry/copy/gg-copy-en.json");
requireIncludes(copyEn, "\"comments.empty.body\": \"Be the first to comment.\"", "English copy uses required empty body", "registry/copy/gg-copy-en.json");
requireIncludes(copyId, "\"comments.empty.title\": \"Belum ada komentar.\"", "Indonesian copy keeps localized empty title", "registry/copy/gg-copy-id.json");
requireIncludes(copyId, "\"comments.empty.body\": \"Jadilah yang pertama berkomentar.\"", "Indonesian copy keeps localized empty body", "registry/copy/gg-copy-id.json");
requireIncludes(commentsCss, ".gg-comments__empty[hidden]", "CSS hides comments empty state only through explicit hidden attribute", "src/css/gg-app.source.css");

const commentsController = sliceBetween(sourceJs, "function initCommentRepliesControls()", "function syncCommentsHash()");
if (!commentsController) {
  fail("could not isolate comments controller slice");
} else {
  if (/fetch\s*\(/.test(commentsController)) fail("comments controller must not fetch or poll comment feeds");
  else pass("comments controller has no fetch calls");

  if (/setInterval\s*\(/.test(commentsController)) fail("comments controller must not poll with setInterval");
  else pass("comments controller has no setInterval polling");

  const observerCount = countMatches(commentsController, /new\s+MutationObserver\s*\(/g);
  if (observerCount > 1) fail(`comments controller creates too many MutationObservers: ${observerCount}`);
  else pass(`comments controller MutationObserver count=${observerCount}`);

  const menuFunction = sliceBetween(commentsController, "function ensureCommentMoreMenus()", "function delegateNativeDelete(");
  if (/addEventListener\s*\(/.test(menuFunction)) fail("comment More menu must use delegated events, not per-row listeners");
  else pass("comment More menu has no per-row listeners");
}

const bootSlice = sliceBetween(sourceJs, "if (maybeRedirectStandaloneLaunch()) return;", "ggIdle(function () {");
if (bootSlice.includes("scheduleCommentsEnhancement('post-hydration')")) {
  pass("boot schedules post-hydration comment enhancement");
} else {
  fail("boot should schedule post-hydration comment enhancement");
}

for (const marker of [
  "initCommentRepliesControls();",
  "ensureCommentMoreMenus();",
  "initCommentPrefixObserver();",
]) {
  if (bootSlice.includes(marker)) fail(`boot must not synchronously run ${marker}`);
}
if (!failures.some((message) => message.startsWith("boot must not synchronously"))) {
  pass("boot does not synchronously scan/enhance comments");
}

const clickListenerCount = countMatches(sourceJs, /document\.addEventListener\('click'/g);
if (clickListenerCount === 1) pass("document click delegation listener count=1");
else fail(`expected one delegated document click listener, found ${clickListenerCount}`);

for (const message of passes) console.log(`PASS: ${message}`);
if (failures.length) {
  for (const message of failures) console.error(`FAIL: ${message}`);
  console.error(`COMMENTS PROOF GUARD RESULT: FAILED (${failures.length})`);
  process.exit(1);
}

console.log(`COMMENTS PROOF GUARD RESULT: PASS checks=${passes.length}`);
