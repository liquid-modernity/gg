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
  requireIncludes(js, "function adoptGeneratedBloggerComposer()", `${file}: adopts generated native Blogger composer`, file);
  requireIncludes(js, "function cleanupLegacyCommentControls()", `${file}: cleans legacy inline reply controls`, file);
}

requireIncludes(indexXml, "<script defer='defer' src='/__gg/assets/js/gg-app.dev.js'></script>", "index.xml loads external app JS", "index.xml");
requireIncludes(packageJson, "\"gaga:verify-comments-proof\"", "package script exposes comments proof guard", "package.json");

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
