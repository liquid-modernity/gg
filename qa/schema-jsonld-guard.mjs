#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const failures = [];
const warnings = [];
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

function warn(message) {
  warnings.push(message);
}

function htmlDecode(value) {
  return String(value || "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function extractJsonLdBlocks(source, file) {
  return Array.from(source.matchAll(/<script\b([^>]*)type=["']application\/ld\+json["']([^>]*)>([\s\S]*?)<\/script>/gi)).map((match, index) => {
    const attrs = `${match[1] || ""} ${match[2] || ""}`;
    const idMatch = attrs.match(/\bid=["']([^"']+)["']/i);
    return {
      file,
      index,
      id: idMatch ? idMatch[1] : `jsonld-${index + 1}`,
      body: htmlDecode(match[3]).trim(),
    };
  });
}

function parseStaticJsonLdBlocks(source, file) {
  const blocks = extractJsonLdBlocks(source, file);
  const parsed = [];
  for (const block of blocks) {
    if (/<\/?(?:b|data):/i.test(block.body) || /<b:/i.test(block.body)) {
      pass(`${file}#${block.id}: Blogger JSON-LD template is source-validated`);
      continue;
    }
    try {
      parsed.push({ ...block, json: JSON.parse(block.body) });
      pass(`${file}#${block.id}: valid JSON-LD parses`);
    } catch (error) {
      fail(`${file}#${block.id}: invalid JSON-LD (${error.message})`);
    }
  }
  return parsed;
}

function graphNodes(json) {
  if (!json) return [];
  return Array.isArray(json["@graph"]) ? json["@graph"] : [json];
}

function hasType(node, type) {
  const value = node && node["@type"];
  return Array.isArray(value) ? value.includes(type) : value === type;
}

function findNode(nodes, type, predicate = () => true) {
  return nodes.find((node) => hasType(node, type) && predicate(node));
}

function requireNode(nodes, type, label, predicate) {
  const node = findNode(nodes, type, predicate);
  if (node) pass(label);
  else fail(label);
  return node || null;
}

function itemListElements(node) {
  return Array.isArray(node?.itemListElement) ? node.itemListElement : [];
}

function visibleTextByPattern(source, pattern) {
  return Array.from(source.matchAll(pattern), (match) => normalizeText(match[1].replace(/<[^>]+>/g, ""))).filter(Boolean);
}

function requireIncludes(source, needle, label, file) {
  if (source.includes(needle)) pass(label);
  else fail(`${file}: missing ${label} (${needle})`);
}

function requirePattern(source, pattern, label, file) {
  if (pattern.test(source)) pass(label);
  else fail(`${file}: ${label}`);
}

function schemaNamesFromItemList(itemList) {
  return itemListElements(itemList)
    .map((entry) => entry?.item?.name || entry?.name || "")
    .map(normalizeText)
    .filter(Boolean);
}

function schemaUrlsFromItemList(itemList) {
  return itemListElements(itemList)
    .map((entry) => entry?.url || entry?.item?.url || entry?.item?.["@id"] || "")
    .map(String)
    .filter(Boolean);
}

function checkBreadcrumb(node, label, expected) {
  const items = itemListElements(node);
  const actual = items.map((item) => ({
    name: normalizeText(item?.name),
    item: String(item?.item || ""),
  }));
  for (let index = 0; index < expected.length; index += 1) {
    const want = expected[index];
    const got = actual[index] || {};
    if (got.name !== want.name || got.item !== want.item) {
      fail(`${label}: breadcrumb position ${index + 1} expected ${want.name}(${want.item}), got ${got.name || "missing"}(${got.item || "missing"})`);
      return;
    }
  }
  pass(`${label}: breadcrumb route truth is Home(/landing) -> Blog(/) -> current`);
}

const indexXml = read("index.xml");
const landingHtml = read("landing.html");
const storeHtml = read("store.html");
const appJs = read("src/js/gg-app.source.js");
const storeManifest = JSON.parse(read("store/data/manifest.json") || "{}");
const packageJson = JSON.parse(read("package.json") || "{}");
const qaCommands = read("QA-COMMANDS.md");
const sourceOfTruth = read("SOURCE-OF-TRUTH.md");

const landingParsed = parseStaticJsonLdBlocks(landingHtml, "landing.html");
const storeParsed = parseStaticJsonLdBlocks(storeHtml, "store.html");
parseStaticJsonLdBlocks(indexXml, "index.xml");

const landingNodes = landingParsed.flatMap((entry) => graphNodes(entry.json));
const landingWebPage = requireNode(landingNodes, "WebPage", "landing schema has WebPage identity surface", (node) => node.url === "https://www.pakrpp.com/landing");
requireNode(landingNodes, "WebSite", "landing schema has WebSite for pakrpp.com", (node) => node.url === "https://www.pakrpp.com");
requireNode(landingNodes, "Person", "landing schema has Person identity", (node) => node.url === "https://www.pakrpp.com/landing");
requireNode(landingNodes, "Organization", "landing schema has Organization identity", (node) => node.url === "https://www.pakrpp.com/landing");
requireNode(landingNodes, "ItemList", "landing schema has visible rubric ItemList", (node) => String(node["@id"] || "").endsWith("/landing#rubrics"));
const landingBreadcrumb = requireNode(landingNodes, "BreadcrumbList", "landing schema has route-truth breadcrumb", (node) => String(node["@id"] || "").endsWith("/landing#breadcrumb"));
if (landingBreadcrumb) {
  checkBreadcrumb(landingBreadcrumb, "landing", [
    { name: "Home", item: "https://www.pakrpp.com/landing" },
    { name: "Blog", item: "https://www.pakrpp.com/" },
  ]);
}
requireIncludes(landingHtml, 'id="contact"', "landing visible contact anchor exists", "landing.html");
requireIncludes(landingHtml, "https://www.pakrpp.com/landing#webpage", "landing WebPage schema ID matches canonical route", "landing.html");
requireIncludes(landingHtml, "'@type':'Organization'", "landing runtime schema builder keeps Organization identity", "landing.html");
if (landingWebPage?.name && />\s*Landing\s*</i.test(landingHtml)) {
  fail("landing.html: public visible Landing label is not allowed");
} else {
  pass("landing schema does not introduce public Landing IA label");
}

const storeSchema = storeParsed.find((entry) => entry.id === "store-itemlist-jsonld")?.json;
const storeNodes = graphNodes(storeSchema);
const storeCollection = requireNode(storeNodes, "CollectionPage", "store schema has CollectionPage", (node) => node.url === "https://www.pakrpp.com/store");
const storeItemList = requireNode(storeNodes, "ItemList", "store schema has Product ItemList", (node) => node.url === "https://www.pakrpp.com/store");
const storeBreadcrumb = requireNode(storeNodes, "BreadcrumbList", "store schema has route-truth breadcrumb", (node) => String(node["@id"] || "").endsWith("/store#breadcrumb"));
if (storeBreadcrumb) {
  checkBreadcrumb(storeBreadcrumb, "store", [
    { name: "Home", item: "https://www.pakrpp.com/landing" },
    { name: "Blog", item: "https://www.pakrpp.com/" },
    { name: "Yellow Cart", item: "https://www.pakrpp.com/store" },
  ]);
}
if (storeCollection?.name && !new RegExp(`<h1\\b[^>]*>\\s*${storeCollection.name}\\s*<\\/h1>`, "i").test(storeHtml)) {
  fail("store.html: CollectionPage name does not match visible h1");
} else {
  pass("store CollectionPage name matches visible h1");
}
const manifestItems = Array.isArray(storeManifest.items) ? storeManifest.items : [];
const storeSchemaNames = schemaNamesFromItemList(storeItemList);
const storeSchemaUrls = schemaUrlsFromItemList(storeItemList);
if (storeItemList?.numberOfItems === manifestItems.length) {
  pass("store ItemList count matches manifest");
} else {
  fail(`store ItemList count mismatch: schema=${storeItemList?.numberOfItems ?? "missing"} manifest=${manifestItems.length}`);
}
for (const item of manifestItems) {
  if (!storeSchemaNames.includes(item.name)) fail(`store ItemList missing manifest product name: ${item.name}`);
  if (!storeSchemaUrls.includes(item.url)) fail(`store ItemList missing manifest product URL: ${item.url}`);
}
if (manifestItems.length && storeSchemaNames.length >= manifestItems.length) pass("store ItemList includes manifest product names");
if (manifestItems.length && storeSchemaUrls.length >= manifestItems.length) pass("store ItemList includes manifest product detail URLs");
const productEntries = itemListElements(storeItemList).map((entry) => entry?.item).filter((item) => item && hasType(item, "Product"));
if (productEntries.length === manifestItems.length) pass("store Product schema exists for every manifest product");
else fail(`store Product schema count mismatch: schema=${productEntries.length} manifest=${manifestItems.length}`);
const visibleProductNames = visibleTextByPattern(storeHtml, /class=["']store-semantic-product__title["'][^>]*>([\s\S]*?)<\/h3>/gi);
for (const name of visibleProductNames) {
  if (!storeSchemaNames.includes(name)) fail(`store visible product missing from JSON-LD: ${name}`);
}
if (visibleProductNames.length) pass("store schema names match visible semantic product names");

const rootSchemaMatch = indexXml.match(/<script\b[^>]*id=['"]gg-root-jsonld['"][^>]*>([\s\S]*?)<\/script>/i);
if (!rootSchemaMatch) {
  fail("index.xml: root Blog JSON-LD block #gg-root-jsonld is missing");
} else {
  const rootSchema = rootSchemaMatch[1];
  requireIncludes(rootSchema, "&quot;@type&quot;: &quot;Blog&quot;", "root schema identifies / as Blog", "index.xml");
  requireIncludes(rootSchema, "&quot;@type&quot;: &quot;ItemList&quot;", "root schema has ItemList", "index.xml");
  requireIncludes(rootSchema, "&quot;@type&quot;: &quot;Article&quot;", "root ItemList items are Articles", "index.xml");
  requireIncludes(rootSchema, "data:schemaPosts", "root schema ItemList is generated from filtered visible posts", "index.xml");
  requireIncludes(indexXml, "p.body contains &quot;gg-store-data&quot;", "root schema filter excludes Store data marker", "index.xml");
  requireIncludes(indexXml, "p.body contains &quot;gg-yellowcard-data&quot;", "root schema filter excludes Yellow Cart data marker", "index.xml");
  for (const item of manifestItems) {
    if (rootSchema.includes(item.name) || rootSchema.includes(item.slug)) {
      fail(`root schema block must not hard-code Store product in Blog ItemList: ${item.name}`);
    }
  }
  pass("root schema block does not hard-code Store product titles or slugs");
}
requirePattern(indexXml, /data:posts filter \(p =&gt; not \(\(p\.labels any[\s\S]*?gg-store-data[\s\S]*?gg-yellowcard-data[\s\S]*?\)\)/, "root schema ItemList uses same Store exclusion contract as visible listing", "index.xml");
requirePattern(indexXml, /<b:if cond=['"]data:view\.isLabelSearch or not \(\(/, "root visible listing keeps Store isolation condition", "index.xml");
requireIncludes(appJs, "if (isStoreContent(post)) return null;", "global Discovery Articles exclude Store content", "src/js/gg-app.source.js");
requireIncludes(appJs, "storeExclusion: STORE_DOMAIN", "global Discovery Topics keep Store exclusion contract", "src/js/gg-app.source.js");

requirePattern(indexXml, /&quot;@type&quot;: &quot;<b:if cond='[\s\S]*?gg-store-data[\s\S]*?'>Product<b:else\/>BlogPosting<\/b:if>&quot;/, "post detail schema switches Store posts to Product and editorial posts to BlogPosting", "index.xml");
requirePattern(indexXml, /<b:if cond='data:view\.isPage'>[\s\S]*?&quot;@type&quot;: &quot;WebPage&quot;[\s\S]*?BreadcrumbList/, "page detail schema is WebPage with breadcrumb", "index.xml");
requireIncludes(indexXml, "&quot;name&quot;: &quot;<data:post.title.escaped/>&quot;", "detail schema name reflects visible post title", "index.xml");
requireIncludes(indexXml, "&quot;item&quot;: &quot;https://www.pakrpp.com/landing&quot;", "detail schema breadcrumb starts at Home(/landing)", "index.xml");
requireIncludes(indexXml, "&quot;name&quot;: &quot;Blog&quot;", "detail schema breadcrumb includes Blog(/)", "index.xml");
requirePattern(indexXml, /<link\s+expr:href=['"]data:view\.url\.canonical \?: data:post\.url\.canonical \?: data:blog\.homepageUrl['"]\s+rel=['"]canonical['"]\/>/, "canonical Blogger URL remains source of truth", "index.xml");

const scripts = packageJson.scripts || {};
if (scripts["gaga:verify-schema-jsonld"] === "node qa/schema-jsonld-guard.mjs") pass("package script gaga:verify-schema-jsonld is wired");
else fail("package.json missing gaga:verify-schema-jsonld script");
if (String(scripts["ci:qa"] || "").includes("npm run gaga:verify-schema-jsonld")) pass("ci:qa includes schema JSON-LD guard");
else fail("ci:qa must include npm run gaga:verify-schema-jsonld");
if (qaCommands.includes("npm run gaga:verify-schema-jsonld")) pass("QA-COMMANDS documents schema JSON-LD guard");
else fail("QA-COMMANDS.md must document npm run gaga:verify-schema-jsonld");
if (sourceOfTruth.includes("qa/schema-jsonld-guard.mjs")) pass("SOURCE-OF-TRUTH documents schema JSON-LD guard");
else warn("SOURCE-OF-TRUTH.md does not list qa/schema-jsonld-guard.mjs");

if (failures.length) {
  console.error("SCHEMA JSON-LD GUARD CONTRACT_FAILURE");
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
  console.log("SCHEMA JSON-LD GUARD PASS_WITH_WARNINGS");
} else {
  console.log("SCHEMA JSON-LD GUARD PASS");
}
