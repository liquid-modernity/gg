#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "qa/css-family-map.json");
const DOC_PATH = path.join(ROOT, "docs/css-family-map.md");
const EXPECTED_ACTIVE = "public/assets/v/ac33998/main.css";
const EXPECTED_LATEST = "public/assets/latest/main.css";
const EXPECTED_SOURCE_MODE = "temporary-runtime-bridge";

const ALLOWED_CATEGORIES = new Set([
  "tokens/settings",
  "base",
  "primitive",
  "layout",
  "component",
  "card",
  "surface-specific",
  "legacy bridge debt",
  "ambiguous/unresolved debt",
]);
const ALLOWED_STATUSES = new Set(["stable", "legacy_bridge", "ambiguous_debt"]);
const REQUIRED_FAMILIES = [
  "gg-dock",
  "gg-skeleton",
  "gg-labeltree",
  "gg-editorial-preview",
  "gg-detail-info-sheet",
  "gg-comments",
  "gg-comments-panel",
  "gg-toc",
  "gg-post-card",
  "gg-featured-card",
  "gg-panel-card",
  "gg-mixed-media",
  "gg-landing-card",
  "gg-landing-shell",
  "gg-search-surface",
  "gg-command-palette",
  "gg-share-sheet",
  "gg-info-panel",
  "gg-detail-toolbar",
];

const fail = (message) => {
  console.error(`CSS MAP FAIL: ${message}`);
  process.exit(1);
};

const rel = (file) => path.relative(ROOT, file).replace(/\\/g, "/");
const readText = (file) => {
  try {
    return readFileSync(file, "utf8");
  } catch (error) {
    fail(`unable to read ${rel(file)}: ${error?.message || "read error"}`);
  }
};
const sha256 = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");
const marker = (text, name) => {
  const match = text.match(new RegExp(`^${name}:\\s*(.+?)\\s*$`, "m"));
  return match ? match[1].trim() : "";
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const assertString = (value, label) => {
  assert(typeof value === "string" && value.trim(), `${label} must be a non-empty string`);
};

const main = () => {
  assert(existsSync(MANIFEST_PATH), "missing qa/css-family-map.json");
  assert(existsSync(DOC_PATH), "missing docs/css-family-map.md");

  const manifest = JSON.parse(readText(MANIFEST_PATH));
  const doc = readText(DOC_PATH);
  assert(manifest && typeof manifest === "object", "manifest must be a JSON object");
  assert(Array.isArray(manifest.entries), "manifest.entries must be an array");
  assert(manifest.entries.length > 0, "manifest.entries must not be empty");
  assert(manifest.sourceMode === EXPECTED_SOURCE_MODE, `sourceMode must be ${EXPECTED_SOURCE_MODE}`);
  assert(manifest.activeCss === EXPECTED_ACTIVE, `activeCss must be ${EXPECTED_ACTIVE}`);
  assert(manifest.latestCss === EXPECTED_LATEST, `latestCss must be ${EXPECTED_LATEST}`);
  assert(manifest.activeCss !== manifest.latestCss, "activeCss and latestCss must remain distinct paths");
  assert(!manifest.activeCss.includes("/latest/"), "activeCss must not point at latest");

  const activePath = path.join(ROOT, manifest.activeCss);
  const latestPath = path.join(ROOT, manifest.latestCss);
  assert(existsSync(activePath), `active CSS missing: ${manifest.activeCss}`);
  assert(existsSync(latestPath), `latest CSS mirror missing: ${manifest.latestCss}`);

  const activeCss = readText(activePath);
  const latestHash = sha256(latestPath);
  const activeHash = sha256(activePath);
  assert(activeHash === latestHash, `${manifest.latestCss} must stay byte-identical to ${manifest.activeCss}`);

  assert(marker(doc, "CSS_MAP_SOURCE") === manifest.activeCss, "doc CSS_MAP_SOURCE does not match manifest activeCss");
  assert(marker(doc, "CSS_MAP_MIRROR") === manifest.latestCss, "doc CSS_MAP_MIRROR does not match manifest latestCss");
  assert(marker(doc, "CSS_MAP_MANIFEST") === "qa/css-family-map.json", "doc CSS_MAP_MANIFEST marker mismatch");
  assert(marker(doc, "CSS_MAP_VERIFIER") === "qa/verify-css-map.mjs", "doc CSS_MAP_VERIFIER marker mismatch");
  assert(Number(marker(doc, "CSS_MAP_ENTRY_COUNT")) === manifest.entries.length, "doc entry count marker mismatch");
  assert(marker(doc, "CSS_MAP_SOURCE_MODE") === EXPECTED_SOURCE_MODE, "doc source mode marker mismatch");

  const ids = new Set();
  const families = new Set();
  let stableCount = 0;
  let legacyCount = 0;
  let ambiguousCount = 0;

  for (const entry of manifest.entries) {
    assertString(entry.id, "entry.id");
    assert(!ids.has(entry.id), `duplicate entry id: ${entry.id}`);
    ids.add(entry.id);
    assertString(entry.family, `${entry.id}.family`);
    families.add(entry.family);
    assert(ALLOWED_CATEGORIES.has(entry.category), `${entry.id}.category is not allowed: ${entry.category}`);
    assert(ALLOWED_STATUSES.has(entry.status), `${entry.id}.status is not allowed: ${entry.status}`);
    if (entry.status === "stable") stableCount += 1;
    if (entry.status === "legacy_bridge") legacyCount += 1;
    if (entry.status === "ambiguous_debt") ambiguousCount += 1;
    assertString(entry.ownerType, `${entry.id}.ownerType`);
    assert(Array.isArray(entry.surfaces) && entry.surfaces.length > 0, `${entry.id}.surfaces must be non-empty`);
    assert(Array.isArray(entry.anchors) && entry.anchors.length > 0, `${entry.id}.anchors must be non-empty`);
    assertString(entry.startAnchor, `${entry.id}.startAnchor`);
    assertString(entry.endAnchor, `${entry.id}.endAnchor`);
    assertString(entry.notes, `${entry.id}.notes`);
    assert(doc.includes(entry.id), `docs/css-family-map.md does not mention ${entry.id}`);

    const startIndex = activeCss.indexOf(entry.startAnchor);
    assert(startIndex !== -1, `${entry.id}.startAnchor not found in ${manifest.activeCss}: ${entry.startAnchor}`);
    const endIndex = activeCss.indexOf(entry.endAnchor, startIndex);
    assert(endIndex !== -1, `${entry.id}.endAnchor not found after start in ${manifest.activeCss}: ${entry.endAnchor}`);
    for (const anchor of entry.anchors) {
      assertString(anchor, `${entry.id}.anchor`);
      assert(activeCss.includes(anchor), `${entry.id}.anchor not found in ${manifest.activeCss}: ${anchor}`);
    }
  }

  for (const family of REQUIRED_FAMILIES) {
    assert(families.has(family), `required family missing from manifest: ${family}`);
  }
  assert(legacyCount > 0, "manifest must identify at least one legacy bridge area");
  assert(ambiguousCount > 0, "manifest must identify at least one ambiguous debt area");

  console.log("CSS MAP OK");
  console.log(`- source_mode: ${manifest.sourceMode}`);
  console.log(`- active_css: ${manifest.activeCss}`);
  console.log(`- mirror_css: ${manifest.latestCss}`);
  console.log(`- active_sha256: ${activeHash}`);
  console.log(`- entries: ${manifest.entries.length}`);
  console.log(`- stable: ${stableCount}`);
  console.log(`- legacy_bridge: ${legacyCount}`);
  console.log(`- ambiguous_debt: ${ambiguousCount}`);
  console.log(`- required_families: ${REQUIRED_FAMILIES.length}`);
};

main();
