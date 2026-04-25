#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_FILE = "index.xml";
const CARRIER_ID = "gg-fingerprint";
const CARRIER_ATTR = "data-gg-template-fingerprint";
const FP_PLACEHOLDER = "__GG_TEMPLATE_FP__";
const CARRIER_TAG_RE = /<[^>]*\bid=(['"])gg-fingerprint\1[^>]*>/i;
const LIVE_CARRIER_TAG_RE = /<[^>]*\bid=(['"])gg-fingerprint\1[^>]*>/i;
const META_TAG_RE = /<meta\b[^>]*\bname=(['"])gg-template-fingerprint\1[^>]*>/i;
const STRIP_SCRIPT_RE = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
const STRIP_STYLE_RE = /<style\b[^>]*>[\s\S]*?<\/style>/gi;
const STRIP_COMMENT_RE = /<!--[\s\S]*?-->/g;

const USAGE = `Usage:
  node qa/template-fingerprint.mjs [--file index.xml] [--value|--embedded|--check|--write|--extract-live]

Modes:
  --value     Print deterministic fingerprint derived from template content.
  --embedded  Print fingerprint embedded in #${CARRIER_ID}[${CARRIER_ATTR}].
  --check     Exit non-zero if embedded carrier does not match deterministic fingerprint.
  --write     Rewrite embedded carrier value (and legacy meta marker when present).
  --extract-live
              Extract live carrier value from fetched HTML file. Returns empty when absent/unreadable.
`;

function fail(message, code = 1) {
  console.error(`ERROR: ${message}`);
  process.exit(code);
}

function parseArgs(argv) {
  let file = path.resolve(DEFAULT_FILE);
  let mode = "summary";

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      console.log(USAGE);
      process.exit(0);
    }
    if (arg === "--file") {
      const next = argv[i + 1];
      if (!next || next.startsWith("-")) {
        fail("--file requires a path");
      }
      i += 1;
      file = path.resolve(next);
      continue;
    }
    if (
      arg === "--value" ||
      arg === "--embedded" ||
      arg === "--check" ||
      arg === "--write" ||
      arg === "--extract-live"
    ) {
      if (mode !== "summary") {
        fail(`Only one mode flag is allowed. Got '${mode}' and '${arg}'`);
      }
      mode = arg.slice(2);
      continue;
    }
    fail(`Unknown argument '${arg}'\n\n${USAGE}`);
  }

  return { file, mode };
}

function normalizeText(value) {
  return String(value || "").replace(/\r\n?/g, "\n");
}

function escapeForRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractAttr(tag, name) {
  if (!tag) return "";
  const re = new RegExp(`\\b${escapeForRegExp(name)}=(['"])([^'"]+)\\1`, "i");
  const match = tag.match(re);
  return match ? String(match[2] || "").trim() : "";
}

function replaceAttr(tag, name, value) {
  const re = new RegExp(`(\\b${escapeForRegExp(name)}=)(['"])[^'"]*\\2`, "i");
  if (!re.test(tag)) {
    fail(`Missing required attribute '${name}' in marker tag: ${tag}`);
  }
  return tag.replace(re, `$1'${value}'`);
}

function parseMarkers(source) {
  const carrierMatch = source.match(CARRIER_TAG_RE);
  if (!carrierMatch) {
    fail(`Missing required carrier tag with id='${CARRIER_ID}'`);
  }
  const carrierTag = carrierMatch[0];
  const carrierValue = extractAttr(carrierTag, CARRIER_ATTR).toLowerCase();
  if (!carrierValue) {
    fail(
      `Missing required carrier attribute '${CARRIER_ATTR}' on #${CARRIER_ID}`
    );
  }

  const metaMatch = source.match(META_TAG_RE);
  const metaTag = metaMatch ? metaMatch[0] : "";
  const metaValue = extractAttr(metaTag, "content").toLowerCase();

  return {
    carrierTag,
    carrierValue,
    metaTag,
    metaValue,
  };
}

function canonicalizeCarrierTag(tag) {
  return replaceAttr(tag, CARRIER_ATTR, FP_PLACEHOLDER);
}

function canonicalizeMetaTag(tag) {
  if (!tag) return "";
  return replaceAttr(tag, "content", FP_PLACEHOLDER);
}

function sanitizeLiveHtml(source) {
  return normalizeText(source)
    .replace(STRIP_SCRIPT_RE, " ")
    .replace(STRIP_STYLE_RE, " ")
    .replace(STRIP_COMMENT_RE, " ");
}

function extractLiveFingerprint(source) {
  const sanitized = sanitizeLiveHtml(source);
  const carrierMatch = sanitized.match(LIVE_CARRIER_TAG_RE);
  if (!carrierMatch) return "";
  const value = extractAttr(carrierMatch[0], CARRIER_ATTR).toLowerCase();
  if (!/^[a-f0-9]{8,64}$/.test(value)) return "";
  return value;
}

function computeFingerprint(source) {
  const normalized = normalizeText(source);
  const markers = parseMarkers(normalized);
  let canonicalSource = normalized.replace(
    markers.carrierTag,
    canonicalizeCarrierTag(markers.carrierTag)
  );
  if (markers.metaTag) {
    canonicalSource = canonicalSource.replace(
      markers.metaTag,
      canonicalizeMetaTag(markers.metaTag)
    );
  }
  return createHash("sha256").update(canonicalSource, "utf8").digest("hex").slice(0, 12);
}

function withMarkerValue(source, value) {
  const normalized = normalizeText(source);
  const markers = parseMarkers(normalized);
  let updated = normalized.replace(
    markers.carrierTag,
    replaceAttr(markers.carrierTag, CARRIER_ATTR, value)
  );
  if (markers.metaTag) {
    updated = updated.replace(
      markers.metaTag,
      replaceAttr(markers.metaTag, "content", value)
    );
  }
  return updated;
}

function assertMarkerSync(markers, computed, file) {
  if (markers.carrierValue !== computed) {
    fail(
      `Template fingerprint mismatch in ${file}: carrier='${markers.carrierValue}' expected='${computed}'`,
      2
    );
  }
  if (markers.metaTag && markers.metaValue && markers.metaValue !== computed) {
    fail(
      `Template fingerprint mismatch in ${file}: legacy meta='${markers.metaValue}' expected='${computed}'`,
      2
    );
  }
}

function main() {
  const { file, mode } = parseArgs(process.argv.slice(2));
  const source = readFileSync(file, "utf8");

  if (mode === "extract-live") {
    process.stdout.write(`${extractLiveFingerprint(source)}\n`);
    return;
  }

  const normalized = normalizeText(source);
  const markers = parseMarkers(normalized);
  const embedded = markers.carrierValue;
  const computed = computeFingerprint(source);

  if (mode === "value") {
    process.stdout.write(`${computed}\n`);
    return;
  }

  if (mode === "embedded") {
    process.stdout.write(`${embedded}\n`);
    return;
  }

  if (mode === "check") {
    assertMarkerSync(markers, computed, file);
    process.stdout.write(`OK: ${computed}\n`);
    return;
  }

  if (mode === "write") {
    if (
      embedded === computed &&
      (!markers.metaTag || !markers.metaValue || markers.metaValue === computed)
    ) {
      process.stdout.write(`UNCHANGED: ${computed}\n`);
      return;
    }
    const updated = withMarkerValue(source, computed);
    writeFileSync(file, updated, "utf8");
    process.stdout.write(`UPDATED: ${embedded} -> ${computed}\n`);
    return;
  }

  process.stdout.write(
    `${JSON.stringify(
      {
        file,
        embedded_carrier: embedded,
        embedded_meta: markers.metaValue || null,
        computed,
        in_sync:
          embedded === computed &&
          (!markers.metaTag || !markers.metaValue || markers.metaValue === computed),
      },
      null,
      2
    )}\n`
  );
}

main();
