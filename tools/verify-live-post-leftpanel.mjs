const args = process.argv.slice(2);

const getArg = (name) => {
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === name) return args[i + 1] || "";
    if (a.startsWith(`${name}=`)) return a.slice(name.length + 1);
  }
  return "";
};

const DEFAULT_BASE = "https://www.pakrpp.com";
const DEFAULT_POST = "https://www.pakrpp.com/2026/02/automatically-identify-key-words-and.html";
const DEFAULT_TIMEOUT_MS = 10000;

const baseRaw = (getArg("--base") || DEFAULT_BASE).trim();
const postRaw = (getArg("--post") || DEFAULT_POST).trim();
const timeoutRaw = parseInt(getArg("--timeout-ms"), 10);
const timeoutMs = Number.isFinite(timeoutRaw) && timeoutRaw > 0 ? timeoutRaw : DEFAULT_TIMEOUT_MS;

const stripTrailingSlash = (s) => String(s || "").replace(/\/+$/, "");
const base = stripTrailingSlash(baseRaw);

if (!base) {
  console.error("VERIFY_LIVE_POST_LEFTPANEL: FAIL");
  console.error("- missing --base");
  process.exit(1);
}

const resolveUrl = (raw) => {
  const input = String(raw || "").trim();
  if (!input) return "";
  try {
    return new URL(input).toString();
  } catch (_) {
    const path = input.startsWith("/") ? input : `/${input}`;
    return `${base}${path}`;
  }
};

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

const findPostBodyHtml = (html) => {
  const source = String(html || "");
  const openRe =
    /<([a-z0-9:-]+)\b[^>]*\bclass\s*=\s*(?:(['"])([^'"]*)\2|([^\s"'=<>`]+))[^>]*>/gi;
  let match;
  while ((match = openRe.exec(source))) {
    const tagName = String(match[1] || "").toLowerCase();
    const className = String(match[3] || match[4] || "");
    const tokens = className.split(/\s+/).map((x) => x.trim()).filter(Boolean);
    if (!tokens.includes("post-body")) continue;
    if (!tokens.includes("entry-content") && !tokens.includes("gg-post__content")) continue;
    const range = findElementRangeFromOpen(source, match.index, match[0], tagName);
    if (!range) continue;
    return range.innerHtml;
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

const countEligibleH2 = (postBodyHtml) => {
  const source = stripBlockedBlocks(postBodyHtml);
  const re = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
  let count = 0;
  let match;
  while ((match = re.exec(source))) {
    const text = cleanText(match[1] || "");
    if (!text) continue;
    count += 1;
  }
  return count;
};

const extractTocHtml = (html) => {
  const source = String(html || "");
  const m = source.match(/<nav\b[^>]*\bid\s*=\s*(["'])gg-toc\1[^>]*>[\s\S]*?<\/nav>/i);
  return m ? String(m[0] || "") : "";
};

const extractSectionById = (html, id) => {
  const source = String(html || "");
  const escaped = String(id || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = source.match(new RegExp(`<section\\b(?=[^>]*\\bid\\s*=\\s*(["'])${escaped}\\1)[^>]*>[\\s\\S]*?<\\/section>`, "i"));
  return m ? String(m[0] || "") : "";
};

const countTocLinks = (tocHtml) => {
  const source = String(tocHtml || "");
  if (!source) return 0;
  const strict = source.match(
    /<a\b[^>]*\bclass\s*=\s*(["'])[^"']*\bgg-toc__link\b[^"']*\1[^>]*\bhref\s*=\s*(["'])#[^"']+\2[^>]*>/gi
  );
  if (strict && strict.length) return strict.length;
  const fallback = source.match(/<a\b[^>]*\bhref\s*=\s*(["'])#[^"']+\1[^>]*>/gi);
  return fallback ? fallback.length : 0;
};

const targetUrl = resolveUrl(postRaw);
const failures = [];

if (!targetUrl) {
  failures.push(`invalid --post (${postRaw})`);
} else {
  let result;
  try {
    const sep = targetUrl.includes("?") ? "&" : "?";
    result = await fetchText(`${targetUrl}${sep}x=${Date.now()}`);
  } catch (e) {
    const msg = e && e.name === "AbortError" ? "timeout" : (e && e.message ? e.message : "fetch-failed");
    failures.push(`fetch failed (${msg}) ${targetUrl}`);
  }

  if (result) {
    if (!result.ok) {
      failures.push(`status ${result.status} ${targetUrl}`);
    } else if (!/\btext\/html\b/i.test(result.contentType)) {
      failures.push(`non-html content-type "${result.contentType}" ${targetUrl}`);
    } else {
      const html = String(result.text || "");
      if (/No content found/i.test(html)) {
        failures.push(`forbidden text "No content found" present @ ${targetUrl}`);
      }
      if (!/\bid\s*=\s*(["'])gg-postinfo\1/i.test(html)) {
        failures.push(`missing #gg-postinfo @ ${targetUrl}`);
      }
      if (!/\bid\s*=\s*(["'])gg-toc\1/i.test(html)) {
        failures.push(`missing #gg-toc @ ${targetUrl}`);
      }
      if (/\bid\s*=\s*(["'])gg-labeltree-detail\1/i.test(html)) {
        failures.push(`forbidden #gg-labeltree-detail present @ ${targetUrl}`);
      }
      const leftSidebar = extractSectionById(html, "gg-left-sidebar-post");
      if (leftSidebar && /\bInterests\b/i.test(leftSidebar)) {
        failures.push(`forbidden "Interests" text in post left sidebar @ ${targetUrl}`);
      }

      const postBodyHtml = findPostBodyHtml(html);
      if (!postBodyHtml) {
        failures.push(`unable to locate article body @ ${targetUrl}`);
      } else {
        const h2Count = countEligibleH2(postBodyHtml);
        const tocHtml = extractTocHtml(html);
        const tocLinkCount = countTocLinks(tocHtml);
        if (h2Count < 1) failures.push(`expected >=1 H2 headings in article body @ ${targetUrl}`);
        if (h2Count > 0 && tocLinkCount < 1) {
          const emptyHidden = /<div\b[^>]*\bclass\s*=\s*(["'])[^"']*\bgg-toc__empty\b[^"']*\1[^>]*\bhidden\b/i.test(
            tocHtml
          );
          if (!emptyHidden) {
            failures.push(`headings=${h2Count} but TOC links=${tocLinkCount} and empty block is not hidden @ ${targetUrl}`);
          }
        }
      }
    }
  }
}

if (failures.length) {
  console.error("VERIFY_LIVE_POST_LEFTPANEL: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`VERIFY_LIVE_POST_LEFTPANEL: PASS post=${targetUrl}`);
