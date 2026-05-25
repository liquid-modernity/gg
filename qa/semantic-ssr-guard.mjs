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

function countMatches(source, pattern) {
  return Array.from(source.matchAll(pattern)).length;
}

function requireIncludes(source, marker, label, file) {
  if (source.includes(marker)) pass(label);
  else fail(`${file}: missing ${label} (${marker})`);
}

function requirePattern(source, pattern, label, file) {
  if (pattern.test(source)) pass(label);
  else fail(`${file}: ${label}`);
}

function requireOneMain(source, file) {
  const mainCount = countMatches(source, /<main\b/gi);
  if (mainCount === 1) pass(`${file}: exactly one main landmark`);
  else fail(`${file}: expected exactly one <main>, found ${mainCount}`);
}

function requireNoPublicLandingLabel(source, file) {
  const visibleLandingLabel = />(?:\s|&nbsp;)*Landing(?:\s|&nbsp;)*</i.test(source);
  if (visibleLandingLabel) fail(`${file}: public visible "Landing" label is not allowed`);
  else pass(`${file}: no public Landing label`);
}

const indexXml = read("index.xml");
const landingHtml = read("landing.html");
const storeHtml = read("store.html");
const packageJson = read("package.json");
const qaCommands = read("QA-COMMANDS.md");

requireOneMain(indexXml, "index.xml");
requireOneMain(landingHtml, "landing.html");
requireOneMain(storeHtml, "store.html");

requirePattern(indexXml, /<h1\b[^>]*class=['"]gg-site-head__title['"][^>]*>\s*<data:blog\.title\/>\s*<\/h1>/i, "root/listing has meaningful h1", "index.xml");
requirePattern(indexXml, /<article\b[^>]*class=['"]gg-entry-row['"][^>]*data-gg-content-domain=.*?&quot;blog&quot;/is, "root listing rows use article semantics and blog/store domain marker", "index.xml");
requirePattern(indexXml, /<a\b(?=[^>]*class=['"]gg-entry-row__title-trigger['"])(?=[^>]*expr:href=['"]data:post\.url['"])(?=[^>]*data-gg-open=['"]preview['"])[^>]*>/is, "root listing title trigger is a real href while preserving preview trigger", "index.xml");
requirePattern(indexXml, /<b:if cond=['"]data:view\.isLabelSearch or not \(\(/i, "root listing excludes Store posts outside label search", "index.xml");
requirePattern(indexXml, /<article\b[^>]*class=['"]gg-article['"][^>]*expr:data-gg-post-url=['"]data:post\.url['"][^>]*>/is, "post/page detail uses article semantics with canonical post URL data", "index.xml");
requirePattern(indexXml, /<link\s+expr:href=['"]data:view\.url\.canonical \?: data:post\.url\.canonical \?: data:blog\.homepageUrl['"]\s+rel=['"]canonical['"]\/>/i, "canonical link remains Blogger-owned", "index.xml");
requireIncludes(indexXml, "data-gg-comment-engine='blogger-native'", "native Blogger comments marker", "index.xml");
requireIncludes(indexXml, "href='/landing#contact'", "contact route is a real link", "index.xml");
requireIncludes(indexXml, "href='/store'", "Store appears as navigation route", "index.xml");
requireNoPublicLandingLabel(indexXml, "index.xml");

requirePattern(landingHtml, /<h1\b[^>]*>\s*The Unfiltered Notes\.\s*<\/h1>/i, "landing has identity h1", "landing.html");
requireIncludes(landingHtml, 'id="contact"', "landing contact anchor", "landing.html");
requirePattern(landingHtml, /<section\b[^>]*id=["']hero["'][^>]*>/i, "landing hero section exists", "landing.html");
requirePattern(landingHtml, /<section\b[^>]*id=["']rubrics["'][^>]*>/i, "landing rubrics section exists", "landing.html");
requirePattern(landingHtml, /<section\b[^>]*id=["']faq["'][^>]*>/i, "landing FAQ section exists", "landing.html");
requirePattern(landingHtml, /href=["']#contact["']/i, "landing contact is reachable by real hash link", "landing.html");
requirePattern(landingHtml, /<nav\b[^>]*(?:aria-label|aria-labelledby)=["'][^"']+["'][^>]*>/i, "landing navigation has an accessible label", "landing.html");
requireNoPublicLandingLabel(landingHtml, "landing.html");

requirePattern(storeHtml, /<h1\b[^>]*>\s*Yellow Cart\s*<\/h1>/i, "store has product collection h1", "store.html");
requireIncludes(storeHtml, 'id="store-grid"', "store product grid container", "store.html");
requirePattern(storeHtml, /<article\b[^>]*class=["']store-semantic-product["'][^>]*>/i, "store semantic product articles exist", "store.html");
requirePattern(storeHtml, /class=["']store-semantic-product__title["'][^>]*>[^<]+<\/h3>/i, "store semantic product names exist", "store.html");
requirePattern(storeHtml, /class=["']store-semantic-product__summary["'][^>]*>[^<]+<\/p>/i, "store semantic product summaries exist", "store.html");
requirePattern(storeHtml, /class=["']store-card__price["'][^>]*>[^<]+<\/span>/i, "store product prices exist in HTML", "store.html");
requirePattern(storeHtml, /class=["']store-semantic-category-rail["'][^>]*(?:aria-label|role)=/i, "store category navigation exists", "store.html");
requirePattern(storeHtml, /href=["']https:\/\/www\.pakrpp\.com\/20\d{2}\//i, "store product detail links are real hrefs", "store.html");
requirePattern(storeHtml, /rel=["']sponsored nofollow noopener noreferrer["']/i, "marketplace affiliate links keep sponsored disclosure", "store.html");
requireNoPublicLandingLabel(storeHtml, "store.html");

requireIncludes(packageJson, '"gaga:verify-semantic-ssr"', "semantic SSR package script", "package.json");
requireIncludes(packageJson, "npm run gaga:verify-semantic-ssr", "semantic SSR guard is in aggregate QA", "package.json");
requireIncludes(qaCommands, "npm run gaga:verify-semantic-ssr", "semantic SSR command documented", "QA-COMMANDS.md");

if (failures.length) {
  console.error("SEMANTIC SSR GUARD CONTRACT_FAILURE");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

for (const message of passes) console.log(`PASS ${message}`);
console.log("SEMANTIC SSR GUARD PASS");
