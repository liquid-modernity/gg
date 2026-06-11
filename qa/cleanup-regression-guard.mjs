#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const failures = [];
const warnings = [];
const passes = [];

function pass(message) {
  passes.push(message);
}

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function filePath(file) {
  return path.resolve(ROOT, file);
}

function read(file) {
  const absolute = filePath(file);
  if (!existsSync(absolute)) {
    fail(`missing required file: ${file}`);
    return "";
  }
  return readFileSync(absolute, "utf8");
}

function assertIncludes(source, needle, label) {
  if (source.includes(needle)) pass(label);
  else fail(`${label}: missing ${needle}`);
}

function assertNotIncludes(source, needle, label) {
  if (source.includes(needle)) fail(`${label}: found ${needle}`);
  else pass(label);
}

function assertPattern(source, pattern, label) {
  if (pattern.test(source)) pass(label);
  else fail(label);
}

function assertNoPattern(source, pattern, label) {
  if (pattern.test(source)) fail(label);
  else pass(label);
}

function stripScriptsAndStyles(source) {
  return source
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "");
}

function publicText(source) {
  return stripScriptsAndStyles(source)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const packageJson = read("package.json");
const qaCommands = read("QA-COMMANDS.md");
const cleanupReport = read("CLEANUP-REPORT.md");
const sourceOfTruth = read("SOURCE-OF-TRUTH.md");
const indexXml = read("index.xml");
const landingHtml = read("landing.html");
const storeHtml = read("store.html");
const appJs = read("src/js/gg-app.source.js");
const registryGuard = read("qa/registry-contract-guard.mjs");
const schemaGuard = read("qa/schema-jsonld-guard.mjs");
const assetGuard = read("qa/asset-architecture-guard.mjs");

if (existsSync(filePath("qa/live-smoke-worker 2.sh"))) {
  fail("stale duplicate worker live-smoke script returned: qa/live-smoke-worker 2.sh");
} else {
  pass("stale duplicate worker live-smoke script is absent");
}

assertIncludes(packageJson, "\"gaga:verify-cleanup\": \"node qa/cleanup-regression-guard.mjs\"", "package script gaga:verify-cleanup is wired");
assertIncludes(packageJson, "npm run gaga:verify-cleanup", "ci:qa includes cleanup guard");
assertIncludes(qaCommands, "npm run gaga:verify-cleanup", "QA-COMMANDS documents cleanup guard");
assertIncludes(sourceOfTruth, "qa/cleanup-regression-guard.mjs", "SOURCE-OF-TRUTH documents cleanup guard");
assertIncludes(cleanupReport, "qa/live-smoke-worker 2.sh", "cleanup report documents removed duplicate smoke script");
assertIncludes(cleanupReport, "How usage was checked", "cleanup report records usage proof");
assertIncludes(cleanupReport, "Regression protection", "cleanup report records regression guards");

for (const source of [packageJson, qaCommands]) {
  assertNotIncludes(source, "live-smoke-worker 2.sh", "package/QA docs do not reference stale duplicate worker smoke script");
}

for (const [label, source] of [
  ["index.xml", indexXml],
  ["landing.html", landingHtml],
  ["store.html", storeHtml],
]) {
  const text = publicText(source);
  if (/\bSystem\b/.test(text) && /Appearance|Theme|Light|Dark/.test(text)) {
    fail(`${label}: public System theme option appears to have returned`);
  } else {
    pass(`${label}: no public System theme option`);
  }
}

assertNoPattern(stripScriptsAndStyles(landingHtml), /\bdata-sheet-handle\b/i, "landing.html markup has no legacy-only data-sheet-handle handles");
assertIncludes(landingHtml, "data-gg-drag-handle=\"command\"", "landing command sheet uses current drag handle contract");
assertIncludes(landingHtml, "data-gg-drag-handle=\"more\"", "landing more sheet uses current drag handle contract");

for (const [label, source] of [
  ["index.xml", indexXml],
  ["landing.html", landingHtml],
]) {
  for (const deprecatedFilter of ["sections", "routes", "actions", "products", "categories"]) {
    assertNoPattern(
      source,
      new RegExp(`data-(?:gg-command-tab|discovery-filter)=(["'])${deprecatedFilter}\\1`, "i"),
      `${label}: deprecated public Discovery filter is absent: ${deprecatedFilter}`
    );
  }
}

assertNoPattern(appJs, /hardblock|blockedTitles|blockedSlugs|titleBlocklist|slugBlocklist/i, "app JS has no hardblock title/slug cleanup regression");
assertNoPattern(indexXml, /hardblock|blockedTitles|blockedSlugs|titleBlocklist|slugBlocklist/i, "index.xml has no hardblock title/slug cleanup regression");

assertPattern(indexXml, /data:view\.isLabelSearch or not \(\([\s\S]*?data:post\.body contains &quot;gg-store-data&quot;/, "root listing still excludes gg-store-data Store posts");
assertPattern(indexXml, /data:view\.isLabelSearch or not \(\([\s\S]*?data:post\.body contains &quot;gg-yellowcard-data&quot;/, "root listing still excludes gg-yellowcard-data Store posts");
assertIncludes(appJs, "if (isStoreContent(post)) return null;", "Discovery Articles still exclude Store content");

assertNotIncludes(indexXml, "data:schemaPosts", "Blog1 root schema does not use data:schemaPosts");
assertNoPattern(indexXml, /id=['"]gg-root-jsonld['"][\s\S]*?data:posts\s+filter\s*\(p\s*=&gt;/i, "Blog1 root schema does not use filtered data:posts ItemList");
assertIncludes(schemaGuard, "root schema avoids data:schemaPosts", "schema guard protects Blog1-safe root schema");
assertIncludes(assetGuard, "Blog1 root schema avoids data:schemaPosts", "asset guard protects Blog1-safe schema boundary");
assertIncludes(registryGuard, "copy registry does not expose appearance.system", "registry guard protects public Light/Dark-only theme UI");

if (failures.length) {
  console.error("CLEANUP REGRESSION GUARD CONTRACT_FAILURE");
  for (const failure of failures) console.error(`- ${failure}`);
  if (warnings.length) {
    console.error("Warnings:");
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

for (const message of passes) console.log(`PASS ${message}`);
if (warnings.length) {
  for (const warning of warnings) console.warn(`WARN ${warning}`);
  console.log("CLEANUP REGRESSION GUARD PASS_WITH_WARNINGS");
} else {
  console.log("CLEANUP REGRESSION GUARD PASS");
}
