#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const REGISTRY_URL = pathToFileURL(path.join(ROOT, "src/registry/gg-system-registry.js"));
const STORE_CATEGORIES_URL = pathToFileURL(path.join(ROOT, "src/store/store-categories.config.mjs"));
const { GG_DISCOVERY, GG_DOCK, GG_MORE_SHEET, GG_ROUTES } = await import(REGISTRY_URL.href);
const { STORE_CATEGORIES } = await import(STORE_CATEGORIES_URL.href);

const failures = [];
const passes = [];
const warnings = [];

function read(file) {
  return readFileSync(path.join(ROOT, file), "utf8");
}

function parseJson(file) {
  return JSON.parse(read(file));
}

function pass(message) {
  passes.push(message);
}

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function assertEqual(label, actual, expected) {
  if (actual !== expected) fail(`${label} expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`);
  else pass(label);
}

function assertArray(label, actual, expected) {
  const got = Array.isArray(actual) ? actual.join("|") : "(not-array)";
  const want = expected.join("|");
  if (got !== want) fail(`${label} expected ${want} got ${got}`);
  else pass(label);
}

function assertIncludes(label, source, marker) {
  if (source.includes(marker)) pass(label);
  else fail(`${label}: missing ${marker}`);
}

function attrValues(source, attr) {
  const pattern = new RegExp(`${attr}=([\\'"])(.*?)\\1`, "g");
  return Array.from(source.matchAll(pattern), (match) => match[2]);
}

function stripRuntimeAndAttrs(source) {
  return source
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/\s+[a-zA-Z_:][\w:.-]*=(["'])[\s\S]*?\1/g, "");
}

function blockForAttr(source, attr, value) {
  const tagPattern = new RegExp(`<(?:a|button)\\b(?=[^>]*\\b${attr}=(['"])${value}\\1)[\\s\\S]*?<\\/(?:a|button)>`, "i");
  const match = source.match(tagPattern);
  return match ? match[0] : "";
}

function copyKeyPattern(key) {
  return new RegExp(`\\bdata-(?:gg-)?copy=(['"])${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\1`);
}

function iconPattern(icon) {
  return new RegExp(`>\\s*${icon.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*<`);
}

function visibleFilters(source, attr) {
  return attrValues(source, attr);
}

function assertDockSurface(label, source, attr, surfaceKey) {
  const order = GG_DOCK.order;
  assertArray(`${label} dock order matches registry`, visibleFilters(source, attr).slice(0, order.length), order);
  for (const item of order) {
    const route = GG_ROUTES[item];
    const block = blockForAttr(source, attr, item);
    if (!block) {
      fail(`${label}: missing dock item ${item}`);
      continue;
    }
    if (!copyKeyPattern(route.labelKey).test(block)) fail(`${label}: dock ${item} must bind ${route.labelKey}`);
    else pass(`${label}: dock ${item} copy key matches registry`);
    if (!block.includes(`>${route.publicName}<`)) fail(`${label}: dock ${item} fallback label must be ${route.publicName}`);
    else pass(`${label}: dock ${item} fallback label matches registry`);
    const expectedIcon = GG_DOCK.icons?.[surfaceKey]?.[item];
    if (!expectedIcon) fail(`GG_DOCK.icons.${surfaceKey}.${item} missing`);
    else if (!iconPattern(expectedIcon).test(block)) fail(`${label}: dock ${item} icon expected ${expectedIcon}`);
    else pass(`${label}: dock ${item} icon matches registry`);
  }
}

function assertMoreRoute(sourceLabel, source, routeId) {
  const route = GG_ROUTES[routeId];
  const block = blockForAttr(source, "data-gg-more-route", routeId);
  if (!block) {
    fail(`${sourceLabel}: missing More route ${routeId}`);
    return;
  }
  if (route.href && !block.includes(`href=${block.includes(`href="${route.href}"`) ? `"${route.href}"` : `'${route.href}'`}`)) {
    fail(`${sourceLabel}: More route ${routeId} href must be ${route.href}`);
  } else {
    pass(`${sourceLabel}: More route ${routeId} href matches registry`);
  }
  if (!copyKeyPattern(route.labelKey).test(block)) fail(`${sourceLabel}: More route ${routeId} must bind ${route.labelKey}`);
  else pass(`${sourceLabel}: More route ${routeId} copy key matches registry`);
  if (!iconPattern(route.icon).test(block)) fail(`${sourceLabel}: More route ${routeId} icon expected ${route.icon}`);
  else pass(`${sourceLabel}: More route ${routeId} icon matches registry`);
}

function assertMoreItem(sourceLabel, source, itemId) {
  const route = GG_ROUTES[itemId];
  const labelKey = route?.labelKey || {
    search: "more.search",
    language: "more.section.language",
    appearance: "more.section.appearance",
    reading: "more.section.reading",
    motion: "more.section.motion",
  }[itemId];
  const icon = route?.icon || GG_MORE_SHEET.preferenceIcons?.[itemId] || (itemId === "search" ? GG_MORE_SHEET.localSearch.icon : "");
  if (!labelKey) {
    fail(`registry missing More item copy key for ${itemId}`);
    return;
  }
  if (!source.includes(labelKey)) fail(`${sourceLabel}: missing More item copy key ${labelKey}`);
  else pass(`${sourceLabel}: More item ${itemId} copy key present`);
  if (icon && !source.includes(`>${icon}<`)) fail(`${sourceLabel}: More item ${itemId} icon expected ${icon}`);
  else if (icon) pass(`${sourceLabel}: More item ${itemId} icon present`);
}

function assertDiscoverySurface(label, source, attr, expected) {
  assertArray(`${label} Discovery visible filters match registry`, visibleFilters(source, attr), expected);
  for (const filter of expected) {
    const copyKey = `discovery.filter.${filter}`;
    if (!source.includes(copyKey)) fail(`${label}: Discovery filter ${filter} missing ${copyKey}`);
    else pass(`${label}: Discovery filter ${filter} copy key present`);
  }
}

function categorySignature(categories) {
  return categories.map((entry) => `${entry.key}:${entry.label}:${entry.path}`).join("|");
}

function assertStoreCategories(manifest, buildReport, workerSource) {
  const expected = STORE_CATEGORIES.map((category) => ({
    key: category.key,
    label: category.label,
    path: category.path,
  }));
  const expectedSignature = categorySignature(expected);
  assertEqual("Store category source order", STORE_CATEGORIES.map((category) => category.key).join("|"), "fashion|skincare|workspace|tech|everyday");
  assertEqual("Store manifest categories match source registry", categorySignature(manifest.categories || []), expectedSignature);
  assertEqual("Store build report categories match source registry", categorySignature(buildReport.manifestCategories || []), expectedSignature);
  for (const category of expected) {
    assertIncludes(`Worker Store category registry includes ${category.key}`, workerSource, `"key": "${category.key}"`);
    assertIncludes(`Worker Store category registry includes ${category.path}`, workerSource, `"path": "${category.path}"`);
    assertIncludes(`Worker Store category registry includes ${category.label}`, workerSource, `"label": "${category.label}"`);
  }
  const pageKeys = Array.from(new Set((buildReport.categoryPages || []).map((entry) => entry.key)));
  assertArray("Store category pages match source registry", pageKeys, expected.map((entry) => entry.key));
}

const indexXml = read("index.xml");
const landingHtml = read("landing.html");
const storeHtml = read("store.html");
const workerSource = read("worker.js");
const packageJson = parseJson("package.json");
const copyEn = parseJson("registry/copy/gg-copy-en.json");
const copyId = parseJson("registry/copy/gg-copy-id.json");
const manifest = parseJson("store/data/manifest.json");
const buildReport = parseJson("store/data/build-report.json");
const qaCommands = read("QA-COMMANDS.md");
const sourceOfTruth = read("SOURCE-OF-TRUTH.md");

assertEqual("Route truth home href", GG_ROUTES.home.href, "/landing");
assertEqual("Route truth blog href", GG_ROUTES.blog.href, "/");
assertEqual("Route truth contact href", GG_ROUTES.contact.href, "/landing#contact");
assertEqual("Route truth store href", GG_ROUTES.store.href, "/store");
assertArray("Dock public order", GG_DOCK.order, ["home", "contact", "search", "blog", "more"]);
assertArray("Global Discovery filters", GG_DISCOVERY.global.filters, ["all", "articles", "topics", "saved"]);
assertArray("Store Discovery filters", GG_DISCOVERY.store.filters, ["all", "products", "categories", "saved"]);

for (const routeId of ["home", "contact", "search", "blog", "more", "store", "sitemap", "rss", "about", "privacy", "terms", "disclaimer"]) {
  const route = GG_ROUTES[routeId];
  if (!route) {
    fail(`GG_ROUTES missing ${routeId}`);
    continue;
  }
  if (!route.labelKey) fail(`GG_ROUTES.${routeId} missing labelKey`);
  else pass(`GG_ROUTES.${routeId} owns labelKey`);
  if (!route.publicName) fail(`GG_ROUTES.${routeId} missing publicName`);
  else pass(`GG_ROUTES.${routeId} owns publicName`);
  if (!route.icon) fail(`GG_ROUTES.${routeId} missing icon`);
  else pass(`GG_ROUTES.${routeId} owns icon`);
  if (route.labelKey && copyEn[route.labelKey] === undefined) fail(`EN copy missing ${route.labelKey}`);
  else if (route.labelKey) pass(`EN copy has ${route.labelKey}`);
  if (route.labelKey && copyId[route.labelKey] === undefined) fail(`ID copy missing ${route.labelKey}`);
  else if (route.labelKey) pass(`ID copy has ${route.labelKey}`);
}

assertDockSurface("index.xml", indexXml, "data-gg-nav", "blog");
assertDockSurface("landing.html", landingHtml, "data-gg-nav", "landing");
assertDockSurface("store.html", storeHtml, "data-store-dock", "store");

for (const [label, source] of [["index.xml", indexXml], ["landing.html", landingHtml], ["store.html", storeHtml]]) {
  for (const routeId of ["home", "blog", "store", "contact"]) assertMoreRoute(label, source, routeId);
  for (const itemId of ["search", "sitemap", "rss", "about", "privacy", "terms", "disclaimer", "language", "appearance", "reading", "motion"]) {
    assertMoreItem(label, source, itemId);
  }
  for (const section of GG_MORE_SHEET.sections) {
    if (!source.includes(section.titleKey)) fail(`${label}: More section ${section.id} missing ${section.titleKey}`);
    else pass(`${label}: More section ${section.id} copy key present`);
  }
}

assertDiscoverySurface("index.xml", indexXml, "data-gg-command-tab", GG_DISCOVERY.global.filters);
assertDiscoverySurface("landing.html", landingHtml, "data-discovery-filter", GG_DISCOVERY.global.filters);
assertDiscoverySurface("store.html", storeHtml, "data-store-discovery-kind", GG_DISCOVERY.store.filters);

for (const hidden of ["routes", "sections", "actions"]) {
  if (visibleFilters(indexXml, "data-gg-command-tab").includes(hidden)) fail(`index.xml exposes hidden Global Discovery filter ${hidden}`);
  else pass(`index.xml does not expose hidden Global Discovery filter ${hidden}`);
  if (visibleFilters(landingHtml, "data-discovery-filter").includes(hidden)) fail(`landing.html exposes hidden Global Discovery filter ${hidden}`);
  else pass(`landing.html does not expose hidden Global Discovery filter ${hidden}`);
}
if (visibleFilters(storeHtml, "data-store-discovery-kind").some((kind) => ["routes", "actions", "sections"].includes(kind))) {
  fail("store.html exposes hidden Store Discovery route/action/section filter");
} else {
  pass("store.html does not expose hidden Store Discovery route/action/section filters");
}

assertStoreCategories(manifest, buildReport, workerSource);

for (const [label, source] of [["index.xml", indexXml], ["landing.html", landingHtml], ["store.html", storeHtml]]) {
  const publicText = stripRuntimeAndAttrs(source);
  if (/>\s*Landing\s*</i.test(publicText)) fail(`${label}: public Landing label returned`);
  else pass(`${label}: no public Landing label`);
  if (/data-(?:gg-)?theme-option=(['"])system\1|data-store-theme=(['"])system\2/i.test(source)) fail(`${label}: public theme option exposes System`);
  else pass(`${label}: no public System theme option`);
}
if (copyEn["appearance.system"] || copyId["appearance.system"]) fail("copy registry must not expose appearance.system");
else pass("copy registry does not expose appearance.system");

if (GG_MORE_SHEET.routeNotes && Object.keys(GG_MORE_SHEET.routeNotes).join("|") === "store") pass("More route notes remain store-only");
else fail("More route notes must remain store-only");
if (!landingHtml.includes("more.commerceNote") && !indexXml.includes("more.commerceNote")) pass("commerce note is not exposed outside Store");
else fail("commerce note must not appear on landing/root More sheets");

const scripts = packageJson.scripts || {};
if (scripts["gaga:verify-registry-contract"] === "node qa/registry-contract-guard.mjs") pass("package script gaga:verify-registry-contract is wired");
else fail("package.json missing gaga:verify-registry-contract");
if (String(scripts["ci:qa"] || "").includes("npm run gaga:verify-registry-contract")) pass("ci:qa includes registry contract guard");
else fail("ci:qa must include npm run gaga:verify-registry-contract");
if (qaCommands.includes("npm run gaga:verify-registry-contract")) pass("QA-COMMANDS documents registry contract guard");
else fail("QA-COMMANDS.md must document npm run gaga:verify-registry-contract");
if (sourceOfTruth.includes("qa/registry-contract-guard.mjs")) pass("SOURCE-OF-TRUTH documents registry contract guard");
else warn("SOURCE-OF-TRUTH.md does not list qa/registry-contract-guard.mjs");

if (failures.length) {
  console.error("REGISTRY CONTRACT GUARD CONTRACT_FAILURE");
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
  console.log("REGISTRY CONTRACT GUARD PASS_WITH_WARNINGS");
} else {
  console.log("REGISTRY CONTRACT GUARD PASS");
}
