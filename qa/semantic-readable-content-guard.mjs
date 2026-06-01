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

function requireIncludes(label, text, needle, message) {
  if (text.includes(needle)) pass(`${label}: ${message}`);
  else fail(`${label}: ${message}`);
}

function requirePattern(label, text, pattern, message) {
  if (pattern.test(text)) pass(`${label}: ${message}`);
  else fail(`${label}: ${message}`);
}

function forbidPattern(label, text, pattern, message) {
  if (pattern.test(text)) fail(`${label}: ${message}`);
  else pass(`${label}: ${message}`);
}

function sectionBetween(text, startPattern, endPattern, label) {
  const startMatch = text.match(startPattern);
  if (!startMatch || typeof startMatch.index !== "number") {
    fail(`${label}: start marker is missing`);
    return "";
  }
  const startIndex = startMatch.index + startMatch[0].length;
  const endSource = text.slice(startIndex);
  const endMatch = endSource.match(endPattern);
  if (!endMatch || typeof endMatch.index !== "number") {
    fail(`${label}: end marker is missing`);
    return "";
  }
  return endSource.slice(0, endMatch.index);
}

function lineNumberFor(text, needle) {
  const index = text.indexOf(needle);
  if (index < 0) return -1;
  return text.slice(0, index).split("\n").length;
}

const indexXml = read("index.xml");
const worker = read("worker.js");
const packageJson = JSON.parse(read("package.json") || "{}");
const qaCommands = read("QA-COMMANDS.md");
const sourceOfTruth = read("SOURCE-OF-TRUTH.md");
const distPublish = read("dist/blogger-template.publish.xml");
const landingHtml = read("landing.html");
const storeHtml = read("store.html");

const head = sectionBetween(indexXml, /<head\b[^>]*>/i, /<\/head>/i, "index.xml head");
const postDetail = sectionBetween(
  indexXml,
  /<b:includable id='postDetail' var='post'>/i,
  /<b:includable id='postFooter' var='post'>/i,
  "postDetail includable"
);

forbidPattern("index.xml head", head, /data:post\./, "does not use post-scoped data in global head");
forbidPattern("index.xml head", head, /data:view\.isPost[\s\S]*data:post\.[\s\S]*application\/ld\+json/i, "does not emit post JSON-LD from global head scope");

requireIncludes("postDetail includable", postDetail, "id='gg-post-jsonld'", "emits post JSON-LD in post scope");
requireIncludes("postDetail includable", postDetail, "&quot;@type&quot;: &quot;BlogPosting&quot;", "uses BlogPosting schema");
requireIncludes("postDetail includable", postDetail, "&quot;headline&quot;: &quot;<data:post.title.escaped/>&quot;", "uses resolved post title in post scope");
requireIncludes("postDetail includable", postDetail, "&quot;@id&quot;: &quot;<data:post.url.canonical/>&quot;", "uses resolved canonical post URL in post scope");
requireIncludes("postDetail includable", postDetail, "&quot;description&quot;: &quot;<data:post.snippet.escaped/>&quot;", "uses resolved post snippet in post scope");
requireIncludes("postDetail includable", postDetail, "&quot;image&quot;: [&quot;<data:post.firstImageUrl/>&quot;]", "uses post image only inside post scope");

requirePattern("postDetail includable", postDetail, /<article\b[^>]*class='gg-article'[\s\S]*?<h1\b[^>]*class='gg-article__title'><data:post\.title\/><\/h1>[\s\S]*?<b:include data='post' name='postBody'\/>/i, "keeps article, h1, and SSR post body together");
requirePattern("postDetail includable", postDetail, /<footer\b[^>]*class='gg-article__tail'[\s\S]*?<data:post\.author\.name\/>[\s\S]*?<time\b[^>]*expr:datetime='data:post\.date\.iso8601'/i, "keeps readable byline and published time");
requirePattern("postDetail includable", indexXml, /<div class='gg-post-body entry-content' expr:id='&quot;post-body-&quot; \+ data:post\.id'>\s*<data:post\.body\/>\s*<\/div>/i, "keeps real post body in SSR HTML");

const articleClose = postDetail.indexOf("</article>");
for (const marker of [
  "id='gg-detail-outline'",
  "id='gg-comments-sheet'",
  "data-gg-comment-engine='blogger-native'",
]) {
  const markerIndex = postDetail.indexOf(marker);
  if (articleClose >= 0 && markerIndex > articleClose) pass(`postDetail includable: ${marker} is isolated after article`);
  else fail(`postDetail includable: ${marker} must be isolated after the main article`);
}

for (const [label, html] of [
  ["landing.html", landingHtml],
  ["store.html", storeHtml],
]) {
  forbidPattern(label, html, /Can't find substitution for tag/i, "has no unresolved Blogger substitution comments");
  forbidPattern(label, html, /<!--\s*Can't find substitution/i, "has no unresolved substitution comments");
  forbidPattern(label, html, /<data:/i, "has no Blogger data tags in static rendered HTML");
  forbidPattern(label, html, /\bexpr:[a-z-]+=/i, "has no Blogger expr attributes in static rendered HTML");
}

forbidPattern("dist Blogger publish artifact", distPublish, /Can't find substitution for tag/i, "does not carry unresolved Blogger substitution comments");
forbidPattern("dist Blogger publish artifact", distPublish, /<!--\s*Can't find substitution/i, "does not carry unresolved substitution comments");

forbidPattern("worker.js", worker, /HTMLRewriter/, "does not use HTMLRewriter as readability/schema fix");
forbidPattern("worker.js", worker, /post\.title|BlogPosting|application\/ld\+json/i, "does not inject post schema/readability repairs");

const postJsonLdLine = lineNumberFor(indexXml, "id='gg-post-jsonld'");
const postDetailLine = lineNumberFor(indexXml, "<b:includable id='postDetail' var='post'>");
const postFooterLine = lineNumberFor(indexXml, "<b:includable id='postFooter' var='post'>");
if (postJsonLdLine > postDetailLine && postJsonLdLine < postFooterLine) pass("index.xml: post JSON-LD is inside postDetail includable");
else fail("index.xml: post JSON-LD must stay inside postDetail includable");

const scripts = packageJson.scripts || {};
if (scripts["gaga:verify-semantic-readable-content"] === "node qa/semantic-readable-content-guard.mjs") pass("package script gaga:verify-semantic-readable-content is wired");
else fail("package.json missing gaga:verify-semantic-readable-content script");

if (String(scripts["ci:qa"] || "").includes("npm run gaga:verify-semantic-readable-content")) pass("ci:qa includes semantic readable content guard");
else fail("ci:qa must include npm run gaga:verify-semantic-readable-content");

requireIncludes("QA-COMMANDS.md", qaCommands, "npm run gaga:verify-semantic-readable-content", "documents semantic readable content guard");
requireIncludes("SOURCE-OF-TRUTH.md", sourceOfTruth, "qa/semantic-readable-content-guard.mjs", "documents semantic readable content guard");

if (failures.length) {
  console.error("SEMANTIC READABLE CONTENT GUARD CONTRACT_FAILURE");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

for (const message of passes) console.log(`PASS ${message}`);
console.log("SEMANTIC READABLE CONTENT GUARD PASS");
