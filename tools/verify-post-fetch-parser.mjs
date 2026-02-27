const args = process.argv.slice(2);

const getArg = (name) => {
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === name) return args[i + 1] || "";
    if (a.startsWith(`${name}=`)) return a.slice(name.length + 1);
  }
  return "";
};

const DEFAULT_GOLDEN = "https://www.pakrpp.com/2026/02/automatically-identify-key-words-and.html";
const DEFAULT_TIMEOUT_MS = 10000;
const OFFLINE_FIXTURE = `
<article class="post-outer">
  <div class="post-body entry-content">
    <div class="gg-postmeta" data-author="pakrpp" data-contributors="masrpp;kangrpp" data-tags="logi,win,marlboro" data-updated="2026-02-21" data-read-min="4"></div>
    <p>Automatically identify key words and build stronger retrieval context for your workflow.</p>
    <h2 id="intro">Introduction</h2>
    <p>Core body text for read-time fallback.</p>
  </div>
</article>`;

const goldenRaw = (getArg("--url") || DEFAULT_GOLDEN).trim();
const timeoutRaw = parseInt(getArg("--timeout-ms"), 10);
const timeoutMs = Number.isFinite(timeoutRaw) && timeoutRaw > 0 ? timeoutRaw : DEFAULT_TIMEOUT_MS;
const strictLive = String(process.env.VERIFY_POST_FETCH_PARSER_STRICT_LIVE || "0") === "1";
const allowFallback = String(process.env.VERIFY_POST_FETCH_PARSER_ALLOW_FALLBACK || "1") !== "0";

const failures = [];

const decodeEntities = (input) =>
  String(input || "").replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (m, code) => {
    const token = String(code || "").toLowerCase();
    if (token === "amp") return "&";
    if (token === "lt") return "<";
    if (token === "gt") return ">";
    if (token === "quot") return '"';
    if (token === "apos") return "'";
    if (token === "nbsp") return " ";
    if (token.startsWith("#x")) {
      const cp = Number.parseInt(token.slice(2), 16);
      return Number.isFinite(cp) && cp > 0 ? String.fromCodePoint(cp) : m;
    }
    if (token.startsWith("#")) {
      const cp = Number.parseInt(token.slice(1), 10);
      return Number.isFinite(cp) && cp > 0 ? String.fromCodePoint(cp) : m;
    }
    return m;
  });

const stripTags = (html) => String(html || "").replace(/<[^>]*>/g, " ");
const cleanText = (value) => decodeEntities(stripTags(value)).replace(/\s+/g, " ").trim();

const clipText = (raw, max) => {
  const txt = cleanText(raw);
  const n = Number.isFinite(max) ? max : 0;
  if (!txt || n < 8 || txt.length <= n) return txt;
  return `${txt.slice(0, n).replace(/[.,;:!?\s]+$/g, "")}...`;
};

const normalizePostUrl = (raw) => {
  try {
    const url = new URL(String(raw || "").trim());
    const m = String(url.searchParams.get("m") || "").trim();
    if (m === "0" || m === "1") url.searchParams.delete("m");
    url.hash = "";
    return url.toString();
  } catch (_) {
    return "";
  }
};

const splitList = (raw, rx) => {
  const src = cleanText(raw);
  if (!src) return [];
  return src
    .split(rx || /\s*[;,]\s*/)
    .map((part) => cleanText(part))
    .filter(Boolean);
};

const slugifyTag = (raw) =>
  cleanText(raw)
    .toLowerCase()
    .replace(/^#/, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/^-+|-+$/g, "");

const readMinLabel = (raw) => {
  const txt = cleanText(raw);
  const m = txt.match(/(\d+)/);
  if (!m) return "";
  const mins = Math.max(1, Number.parseInt(m[1], 10) || 1);
  return `${mins} min read`;
};

const findElementRangeFromOpen = (source, openStart, openTag, tagName) => {
  const html = String(source || "");
  const open = String(openTag || "");
  const name = String(tagName || "").trim().toLowerCase();
  if (!html || !open || !name) return null;
  const openEnd = openStart + open.length;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`<\\/?${escaped}\\b[^>]*>`, "gi");
  re.lastIndex = openEnd;
  let depth = 1;
  let closeStart = -1;
  let closeEnd = -1;
  let token;
  while ((token = re.exec(html))) {
    const tag = token[0];
    const isClose = /^<\//.test(tag);
    const selfClose = /\/>\s*$/.test(tag);
    if (isClose) depth -= 1;
    else if (!selfClose) depth += 1;
    if (depth === 0) {
      closeStart = token.index;
      closeEnd = re.lastIndex;
      break;
    }
  }
  if (closeStart < 0 || closeEnd < 0) return null;
  return {
    innerHtml: html.slice(openEnd, closeStart),
  };
};

const readAttr = (tag, name) => {
  const escaped = String(name || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = String(tag || "").match(
    new RegExp(`\\b${escaped}\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s\"'=<>]+))`, "i")
  );
  return cleanText(m ? m[1] || m[2] || m[3] || "" : "");
};

const hasClassToken = (tag, token) => {
  const cls = readAttr(tag, "class");
  if (!cls) return false;
  return cls.split(/\s+/).includes(token);
};

const findRootHtml = (html) => {
  const source = String(html || "");
  const openRe = /<([a-z0-9:-]+)\b[^>]*>/gi;
  let m;
  while ((m = openRe.exec(source))) {
    const tag = String(m[0] || "");
    const tagName = String(m[1] || "").toLowerCase();
    const isMatch =
      hasClassToken(tag, "post-body") ||
      hasClassToken(tag, "entry-content") ||
      hasClassToken(tag, "post-body-container") ||
      hasClassToken(tag, "gg-post__content");
    if (!isMatch) continue;
    const range = findElementRangeFromOpen(source, m.index, tag, tagName);
    if (range && range.innerHtml) return range.innerHtml;
  }
  return "";
};

const stripBlockedBlocks = (html) => {
  let out = String(html || "");
  const patterns = [
    /<pre\b[\s\S]*?<\/pre>/gi,
    /<code\b[\s\S]*?<\/code>/gi,
    /<script\b[\s\S]*?<\/script>/gi,
    /<style\b[\s\S]*?<\/style>/gi,
    /<template\b[\s\S]*?<\/template>/gi,
    /<([a-z0-9:-]+)\b[^>]*\bhidden\b[^>]*>[\s\S]*?<\/\1>/gi,
    /<([a-z0-9:-]+)\b[^>]*\baria-hidden\s*=\s*(['"])true\2[^>]*>[\s\S]*?<\/\1>/gi,
  ];
  for (const re of patterns) out = out.replace(re, " ");
  return out;
};

const parseMetaTag = (html) => {
  const src = String(html || "");
  const re = /<([a-z0-9:-]+)\b[^>]*>/gi;
  let best = null;
  let bestScore = -1;
  let m;
  while ((m = re.exec(src))) {
    const tag = String(m[0] || "");
    const isMetaNode =
      /\bclass\s*=\s*(['"])\s*[^"']*\bgg-postmeta\b[^"']*\1/i.test(tag) ||
      /\bdata-gg-postmeta\b/i.test(tag) ||
      /\bid\s*=\s*(['"])gg-postmeta\1/i.test(tag);
    if (!isMetaNode) continue;
    const author = readAttr(tag, "data-author") || readAttr(tag, "data-gg-author") || readAttr(tag, "author");
    const contributors = splitList(readAttr(tag, "data-contributors") || readAttr(tag, "data-gg-contributors"), /\s*;\s*/);
    const tags = splitList(readAttr(tag, "data-tags") || readAttr(tag, "data-gg-tags"), /\s*,\s*/).map((raw) => ({
      key: slugifyTag(raw),
      text: cleanText(raw),
    }));
    const updated = readAttr(tag, "data-updated") || readAttr(tag, "data-gg-updated");
    const readMin =
      readAttr(tag, "data-read-min") ||
      readAttr(tag, "data-readtime") ||
      readAttr(tag, "data-gg-read-min") ||
      readAttr(tag, "data-gg-readtime");
    const snippet = readAttr(tag, "data-snippet") || readAttr(tag, "data-gg-snippet");
    const candidate = {
      found: true,
      author,
      contributors,
      tags,
      updated,
      readMin,
      snippet,
      hasContribAttr: /\bdata-contributors\b|\bdata-gg-contributors\b/i.test(tag),
    };
    const score =
      (candidate.author ? 2 : 0) +
      (candidate.updated ? 2 : 0) +
      (candidate.readMin ? 1 : 0) +
      (candidate.snippet ? 1 : 0) +
      (candidate.contributors.length * 3) +
      (candidate.tags.length * 4);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  if (best) {
    return best;
  }
  return {
    found: false,
    author: "",
    contributors: [],
    tags: [],
    updated: "",
    readMin: "",
    snippet: "",
    hasContribAttr: false,
  };
};

const parseHeadingItems = (html, sourceUrl) => {
  const out = [];
  const rootHtml = findRootHtml(html);
  const meta = parseMetaTag(html);
  const rootForHeadings = stripBlockedBlocks(rootHtml);
  const headings = [];
  const h2Re = /<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi;
  let m;
  while ((m = h2Re.exec(rootForHeadings)) && headings.length < 12) {
    const attrs = String(m[1] || "");
    const text = cleanText(m[2] || "");
    if (!text) continue;
    const id = readAttr(`<h2 ${attrs}>`, "id");
    const href = id ? `${sourceUrl}#${encodeURIComponent(id)}` : sourceUrl;
    headings.push({ text, level: 2, href });
  }

  let snippet = cleanText(meta.snippet || "");
  if (!snippet) {
    const pRe = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
    let pm;
    while ((pm = pRe.exec(rootForHeadings))) {
      const p = cleanText(pm[1] || "");
      if (!p) continue;
      snippet = clipText(p, 180);
      if (snippet) break;
    }
  }

  let readLabel = readMinLabel(meta.readMin || "");
  if (!readLabel) {
    const words = cleanText(rootForHeadings).split(/\s+/).filter(Boolean).length;
    if (words > 0) readLabel = `${Math.max(1, Math.ceil(words / 200))} min read`;
  }

  out.push(...headings);
  out._m = {
    a: cleanText(meta.author || ""),
    c: Array.isArray(meta.contributors) ? meta.contributors.map((x) => cleanText(x)).filter(Boolean) : [],
    t: Array.isArray(meta.tags) ? meta.tags.filter((x) => x && x.text) : [],
    u: cleanText(meta.updated || ""),
    r: cleanText(readLabel || ""),
    s: cleanText(snippet || ""),
    _hasContribAttr: !!meta.hasContribAttr,
  };
  return out;
};

const fetchText = async (url) => {
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
};

const normalizedUrl = normalizePostUrl(goldenRaw);
if (!normalizedUrl) {
  failures.push(`invalid --url (${goldenRaw})`);
}

let html = "";
let sourceUrl = normalizedUrl;

if (!failures.length) {
  try {
    const sep = normalizedUrl.includes("?") ? "&" : "?";
    const result = await fetchText(`${normalizedUrl}${sep}x=${Date.now()}`);
    if (!result.ok) {
      throw new Error(`status-${result.status}`);
    }
    if (!/\btext\/html\b/i.test(result.contentType)) {
      throw new Error(`content-type-${result.contentType || "unknown"}`);
    }
    html = String(result.text || "");
  } catch (err) {
    if (strictLive || !allowFallback) {
      failures.push(`fetch failed (${err && err.message ? err.message : "unknown"}) ${normalizedUrl}`);
    } else {
      html = OFFLINE_FIXTURE;
      sourceUrl = "https://fixture.local/2026/02/automatically-identify-key-words-and.html";
      console.log("VERIFY_POST_FETCH_PARSER: INFO fallback fixture used");
    }
  }
}

if (!failures.length) {
  const out = parseHeadingItems(html, sourceUrl);
  const meta = out && out._m ? out._m : {};
  const tagSet = new Set((Array.isArray(meta.t) ? meta.t : []).map((x) => cleanText(x && x.text ? x.text : x)).filter(Boolean).map((x) => x.toLowerCase()));

  if (!tagSet.has("logi")) failures.push('missing expected tag "logi"');
  if (!tagSet.has("win")) failures.push('missing expected tag "win"');

  if (meta && meta._hasContribAttr && (!Array.isArray(meta.c) || meta.c.length < 1)) {
    failures.push("contributors missing from parsed gg-postmeta");
  }

  if (!cleanText(meta.r || "")) failures.push("read time missing from parser output");
  if (!Array.isArray(out) || out.length < 1) failures.push("headings (H2) missing from parser output");
}

if (failures.length) {
  console.error("VERIFY_POST_FETCH_PARSER: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log(`VERIFY_POST_FETCH_PARSER: PASS url=${normalizedUrl}`);
