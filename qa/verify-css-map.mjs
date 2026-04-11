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
const ALLOWED_STATUSES = new Set(["stable_official", "legacy_bridge", "ambiguous_debt"]);
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

const REQUIRED_LEDGER = [
  "gg-editorial-preview-official",
  "gg-info-panel-bridge",
  "gg-postinfo-to-detail-info-sheet",
  "post-toolbar-to-detail-toolbar",
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
const asArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

const assertString = (value, label) => {
  assert(typeof value === "string" && value.trim(), `${label} must be a non-empty string`);
};

const assertStringList = (value, label) => {
  const list = asArray(value);
  assert(list.length > 0, `${label} must be a non-empty string or string array`);
  for (const item of list) assertString(item, label);
  return list;
};

const targetIncludes = (entry, target) => assertStringList(entry.target_family, `${entry.id}.target_family`).includes(target);
const bridgeIncludes = (entry, fragment) =>
  assertStringList(entry.bridge_from, `${entry.id}.bridge_from`).some((item) => item.includes(fragment));

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
  assert(Array.isArray(manifest.statusVocabulary), "manifest.statusVocabulary must be an array");
  assert(
    manifest.statusVocabulary.length === ALLOWED_STATUSES.size &&
      manifest.statusVocabulary.every((status) => ALLOWED_STATUSES.has(status)),
    "manifest.statusVocabulary must be stable_official, legacy_bridge, ambiguous_debt"
  );

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
  assert(doc.includes("## Migration Ledger"), "docs/css-family-map.md must include a Migration Ledger section");

  const ids = new Set();
  const entryById = new Map();
  const representedFamilies = new Set();
  let stableOfficialCount = 0;
  let legacyCount = 0;
  let ambiguousCount = 0;

  for (const entry of manifest.entries) {
    assertString(entry.id, "entry.id");
    assert(!ids.has(entry.id), `duplicate entry id: ${entry.id}`);
    ids.add(entry.id);
    entryById.set(entry.id, entry);
    assertString(entry.family, `${entry.id}.family`);
    representedFamilies.add(entry.family);
    for (const target of asArray(entry.target_family)) representedFamilies.add(target);
    assert(ALLOWED_CATEGORIES.has(entry.category), `${entry.id}.category is not allowed: ${entry.category}`);
    assert(ALLOWED_STATUSES.has(entry.status), `${entry.id}.status is not allowed: ${entry.status}`);
    if (entry.status === "stable_official") stableOfficialCount += 1;
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

  assert(Array.isArray(manifest.migrationLedger), "manifest.migrationLedger must be an array");
  const ledgerById = new Map();
  for (const ledger of manifest.migrationLedger) {
    assertString(ledger.id, "migrationLedger.id");
    assert(!ledgerById.has(ledger.id), `duplicate migration ledger id: ${ledger.id}`);
    ledgerById.set(ledger.id, ledger);
    assertStringList(ledger.bridge_from, `${ledger.id}.bridge_from`);
    for (const target of assertStringList(ledger.target_family, `${ledger.id}.target_family`)) {
      representedFamilies.add(target);
    }
    assertString(ledger.owner_context, `${ledger.id}.owner_context`);
    assert(ALLOWED_STATUSES.has(ledger.status), `${ledger.id}.status is not allowed: ${ledger.status}`);
    assertString(ledger.reason, `${ledger.id}.reason`);
    assertString(ledger.followup_task_class, `${ledger.id}.followup_task_class`);
    assert(Array.isArray(ledger.manifest_entries) && ledger.manifest_entries.length > 0, `${ledger.id}.manifest_entries must be non-empty`);
    for (const entryId of ledger.manifest_entries) assert(entryById.has(entryId), `${ledger.id} references missing entry ${entryId}`);
    assert(doc.includes(ledger.id), `docs/css-family-map.md does not mention ledger ${ledger.id}`);
  }
  for (const id of REQUIRED_LEDGER) assert(ledgerById.has(id), `required migration ledger missing: ${id}`);

  const editorial = entryById.get("gg-editorial-preview");
  const editorialLedger = ledgerById.get("gg-editorial-preview-official");
  assert(editorial.status === "stable_official", "gg-editorial-preview must be stable_official");
  assert(editorial.family === "gg-editorial-preview", "gg-editorial-preview entry must keep official family name");
  assertString(editorial.owner_context, "gg-editorial-preview.owner_context");
  assert(editorial.owner_context.includes("listing-owned"), "gg-editorial-preview must be listing-owned");
  assert(targetIncludes(editorial, "gg-editorial-preview"), "gg-editorial-preview must target itself as official family");
  assert(editorialLedger.status === "stable_official", "gg-editorial-preview ledger must be stable_official");
  assert(targetIncludes(editorialLedger, "gg-editorial-preview"), "gg-editorial-preview ledger target must be gg-editorial-preview");

  const infoPanel = entryById.get("gg-info-panel-legacy");
  const infoPanelLedger = ledgerById.get("gg-info-panel-bridge");
  assert(infoPanel.status === "legacy_bridge", "gg-info-panel must be legacy_bridge");
  assert(infoPanel.family === "gg-info-panel", "gg-info-panel bridge entry must use old bridge family name");
  assert(targetIncludes(infoPanelLedger, "gg-detail-info-sheet"), "gg-info-panel bridge must target gg-detail-info-sheet");
  assert(targetIncludes(infoPanelLedger, "gg-editorial-preview"), "gg-info-panel bridge must record listing target gg-editorial-preview");
  assert(bridgeIncludes(infoPanelLedger, ".gg-info-panel"), "gg-info-panel ledger must bridge from .gg-info-panel");
  assert(infoPanelLedger.owner_context.includes("bridge-only"), "gg-info-panel ledger must be bridge-only");

  const detailInfo = entryById.get("detail-info-sheet-legacy");
  const postinfoLedger = ledgerById.get("gg-postinfo-to-detail-info-sheet");
  assert(detailInfo.status === "legacy_bridge", "gg-postinfo bridge must be legacy_bridge");
  assert(detailInfo.family === "gg-postinfo", "detail-info-sheet-legacy entry must identify bridge family gg-postinfo");
  assert(targetIncludes(detailInfo, "gg-detail-info-sheet"), "gg-postinfo bridge entry must target gg-detail-info-sheet");
  assert(targetIncludes(postinfoLedger, "gg-detail-info-sheet"), "gg-postinfo ledger must target gg-detail-info-sheet");
  assert(bridgeIncludes(postinfoLedger, "#gg-postinfo"), "gg-postinfo ledger must bridge from #gg-postinfo");
  assert(postinfoLedger.owner_context.includes("detail-owned"), "gg-postinfo ledger must be detail-owned bridge-only");

  const officialToolbar = entryById.get("gg-detail-toolbar");
  assert(officialToolbar, "gg-detail-toolbar official entry is required after runtime migration");
  assert(officialToolbar.status === "stable_official", "gg-detail-toolbar official entry must be stable_official");
  assert(officialToolbar.family === "gg-detail-toolbar", "gg-detail-toolbar official entry must keep official family name");
  assert(targetIncludes(officialToolbar, "gg-detail-toolbar"), "gg-detail-toolbar official entry must target itself");
  assertString(officialToolbar.owner_context, "gg-detail-toolbar.owner_context");
  assert(officialToolbar.owner_context.includes("detail-owned"), "gg-detail-toolbar official entry must be detail-owned");

  const toolbar = entryById.get("detail-toolbar-legacy");
  const toolbarLedger = ledgerById.get("post-toolbar-to-detail-toolbar");
  assert(toolbar.status === "legacy_bridge", ".gg-post__toolbar bridge must be legacy_bridge");
  assert(toolbar.family === "gg-post__toolbar", "detail-toolbar-legacy entry must identify bridge family .gg-post__toolbar");
  assert(targetIncludes(toolbar, "gg-detail-toolbar"), ".gg-post__toolbar bridge entry must target gg-detail-toolbar");
  assert(targetIncludes(toolbarLedger, "gg-detail-toolbar"), ".gg-post__toolbar ledger must target gg-detail-toolbar");
  assert(bridgeIncludes(toolbarLedger, ".gg-post__toolbar"), ".gg-post__toolbar ledger must bridge from .gg-post__toolbar");
  assert(toolbarLedger.owner_context.includes("detail-owned"), ".gg-post__toolbar ledger must be detail-owned bridge-only");
  assert(
    asArray(toolbarLedger.manifest_entries).includes("gg-detail-toolbar"),
    ".gg-post__toolbar ledger must reference official gg-detail-toolbar entry"
  );

  for (const family of REQUIRED_FAMILIES) {
    assert(representedFamilies.has(family), `required family missing from manifest or migration ledger: ${family}`);
  }
  assert(stableOfficialCount > 0, "manifest must identify at least one stable official area");
  assert(legacyCount > 0, "manifest must identify at least one legacy bridge area");
  assert(ambiguousCount > 0, "manifest must identify at least one ambiguous debt area");

  console.log("CSS MAP OK");
  console.log(`- source_mode: ${manifest.sourceMode}`);
  console.log(`- active_css: ${manifest.activeCss}`);
  console.log(`- mirror_css: ${manifest.latestCss}`);
  console.log(`- active_sha256: ${activeHash}`);
  console.log(`- entries: ${manifest.entries.length}`);
  console.log(`- stable_official: ${stableOfficialCount}`);
  console.log(`- legacy_bridge: ${legacyCount}`);
  console.log(`- ambiguous_debt: ${ambiguousCount}`);
  console.log(`- migration_ledger: ${manifest.migrationLedger.length}`);
  console.log(`- required_families: ${REQUIRED_FAMILIES.length}`);
};

main();
