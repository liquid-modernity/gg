const args = process.argv.slice(2);

const getArg = (name) => {
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === name) return args[i + 1] || "";
    if (arg.startsWith(`${name}=`)) return arg.slice(name.length + 1);
  }
  return "";
};

const DEFAULT_BASE = "https://www.pakrpp.com";
const DEFAULT_TIMEOUT_MS = 10000;
const REQUIRED_ROWS = ["updated", "readtime", "snippet", "tags", "contributors"];

const baseRaw = (getArg("--base") || DEFAULT_BASE).trim();
const timeoutRaw = parseInt(getArg("--timeout-ms"), 10);
const timeoutMs = Number.isFinite(timeoutRaw) && timeoutRaw > 0 ? timeoutRaw : DEFAULT_TIMEOUT_MS;

if (!baseRaw) {
  console.error("VERIFY_LISTING_EPANEL_INSTANT_ROWS: FAIL");
  console.error("- missing --base");
  process.exit(1);
}

const base = String(baseRaw).replace(/\/+$/, "");
const listingUrl = `${base}/blog`;
const failures = [];

function unquote(raw) {
  let value = String(raw || "").trim();
  if (!value) return "";
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value.trim();
}

function readAttr(tag, attrName) {
  const escaped = String(attrName).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = String(tag || "").match(
    new RegExp(`\\b${escaped}\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s\"'=<>\\\`]+))`, "i")
  );
  if (!match) return "";
  return unquote(match[1] || match[2] || match[3] || "");
}

function hasRow(html, key) {
  const escaped = String(key).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\bdata-row\\s*=\\s*(["'])${escaped}\\1`, "i").test(String(html || ""));
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      signal: controller.signal,
    });
    return {
      ok: res.ok,
      status: res.status,
      contentType: res.headers.get("content-type") || "",
      text: await res.text(),
    };
  } finally {
    clearTimeout(timer);
  }
}

function verifyContract(url, html) {
  const source = String(html || "");

  if (!/\bdata-gg-epanel\s*=\s*(["'])editorial\1/i.test(source)) {
    failures.push(`missing data-gg-epanel="editorial" @ ${url}`);
  }

  for (const row of REQUIRED_ROWS) {
    if (!hasRow(source, row)) failures.push(`missing row marker data-row="${row}" @ ${url}`);
  }

  const cardBlockRe =
    /<article\b[^>]*\bclass\s*=\s*(["'])[^"']*\bgg-post-card\b[^"']*\1[^>]*>[\s\S]*?<\/article>/gi;
  const cards = [...source.matchAll(cardBlockRe)].map((match) => String(match[0] || ""));
  if (!cards.length) {
    failures.push(`no .gg-post-card blocks found @ ${url}`);
    return;
  }

  let hasMetaNode = false;
  let hasUpdatedMetaAttr = false;
  let hasTagsMetaAttr = false;

  for (let i = 0; i < cards.length; i += 1) {
    const block = cards[i];
    const postMetaOpen = block.match(/<div\b[^>]*\bclass\s*=\s*(["'])[^"']*\bgg-postmeta\b[^"']*\1[^>]*>/i);
    if (!postMetaOpen) continue;
    hasMetaNode = true;
    const postMetaTag = String(postMetaOpen[0] || "");
    if (/\bdata-updated\s*=/i.test(postMetaTag)) hasUpdatedMetaAttr = true;
    if (/\bdata-tags\s*=/i.test(postMetaTag)) hasTagsMetaAttr = true;
    if (hasUpdatedMetaAttr && hasTagsMetaAttr) break;
  }

  if (!hasMetaNode) failures.push(`missing .gg-postmeta in listing cards @ ${url}`);
  if (!hasUpdatedMetaAttr) failures.push(`missing card .gg-postmeta data-updated attribute @ ${url}`);
  if (!hasTagsMetaAttr) failures.push(`missing card .gg-postmeta data-tags attribute @ ${url}`);
}

let result;
try {
  result = await fetchText(`${listingUrl}?x=${Date.now()}`);
} catch (err) {
  const message =
    err && err.name === "AbortError" ? "timeout" : (err && err.message ? err.message : "fetch-failed");
  failures.push(`fetch failed (${message}) ${listingUrl}`);
}

if (result) {
  if (!result.ok) failures.push(`status ${result.status} ${listingUrl}`);
  else if (!/\btext\/html\b/i.test(result.contentType)) {
    failures.push(`non-html content-type "${result.contentType}" ${listingUrl}`);
  } else verifyContract(listingUrl, result.text);
}

if (failures.length) {
  console.error("VERIFY_LISTING_EPANEL_INSTANT_ROWS: FAIL");
  for (const issue of failures) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`VERIFY_LISTING_EPANEL_INSTANT_ROWS: PASS listing=${listingUrl}`);
