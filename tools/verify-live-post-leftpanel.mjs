const args = process.argv.slice(2);

const getArg = (name) => {
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === name) return args[i + 1] || "";
    if (a.startsWith(`${name}=`)) return a.slice(name.length + 1);
  }
  return "";
};

const parsePositiveInt = (name, fallback) => {
  const raw = parseInt(getArg(name), 10);
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
};

const DEFAULT_BASE = "https://www.pakrpp.com";
const DEFAULT_POST = "https://www.pakrpp.com/2026/02/automatically-identify-key-words-and.html";
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_RETRY_MAX = 4;
const DEFAULT_RETRY_BASE_MS = 800;
const DEFAULT_RETRY_CAP_MS = 10000;
const DEFAULT_USER_AGENT = "gg-live-gate/1.0 (+https://www.pakrpp.com)";

const baseRaw = (getArg("--base") || DEFAULT_BASE).trim();
const postRaw = (getArg("--post") || DEFAULT_POST).trim();
const timeoutMs = parsePositiveInt("--timeout-ms", DEFAULT_TIMEOUT_MS);
const retryMax = parsePositiveInt("--retry-max", DEFAULT_RETRY_MAX);
const retryBaseMs = parsePositiveInt("--retry-base-ms", DEFAULT_RETRY_BASE_MS);
const retryCapMs = parsePositiveInt("--retry-cap-ms", DEFAULT_RETRY_CAP_MS);
const userAgent = (getArg("--user-agent") || DEFAULT_USER_AGENT).trim() || DEFAULT_USER_AGENT;

const stripTrailingSlash = (s) => String(s || "").replace(/\/+$/, "");
const base = stripTrailingSlash(baseRaw);

const report = {
  transient: [],
  unavailable: [],
  functional: [],
};

const addTransient = (message) => {
  report.transient.push(message);
};

const addUnavailable = (message) => {
  report.unavailable.push(`LIVE UNAVAILABLE AFTER RETRIES: ${message}`);
};

const addFunctional = (message) => {
  report.functional.push(`FUNCTIONAL FAIL: ${message}`);
};

if (!base) {
  addFunctional("missing --base");
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

const sleep = (ms) => {
  const safe = Number.isFinite(ms) ? Math.max(0, Math.floor(ms)) : 0;
  if (safe <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, safe));
};

const parseRetryAfterMs = (raw) => {
  const value = String(raw || "").trim();
  if (!value) return 0;

  if (/^\d+$/.test(value)) {
    const seconds = parseInt(value, 10);
    if (!Number.isFinite(seconds) || seconds < 0) return 0;
    return seconds * 1000;
  }

  const when = Date.parse(value);
  if (!Number.isFinite(when)) return 0;
  const delta = when - Date.now();
  return delta > 0 ? delta : 0;
};

const nextWaitMs = (attempt, retryAfterMs) => {
  const exp = Math.min(retryCapMs, retryBaseMs * 2 ** Math.max(0, attempt - 1));
  const jitterBound = Math.max(120, Math.floor(exp * 0.25));
  const jitter = Math.floor(Math.random() * jitterBound);
  if (retryAfterMs > 0) return retryAfterMs + jitter;
  return exp + jitter;
};

const withCacheBust = (url) => {
  const sep = String(url || "").includes("?") ? "&" : "?";
  return `${url}${sep}x=${Date.now()}`;
};

const fetchTextWithRetry = async (url, label) => {
  for (let attempt = 1; attempt <= retryMax; attempt += 1) {
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
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": userAgent,
        },
        signal: controller.signal,
      });

      if (res.ok) {
        return {
          ok: true,
          status: res.status,
          contentType: res.headers.get("content-type") || "",
          text: await res.text(),
        };
      }

      const isRateLimit = res.status === 429;
      const isUpstreamTransient = res.status >= 500;
      if (!isRateLimit && !isUpstreamTransient) {
        return {
          ok: false,
          fatal: true,
          status: res.status,
        };
      }

      if (attempt >= retryMax) {
        addUnavailable(`${label} status=${res.status} attempts=${retryMax} url=${url}`);
        return { ok: false };
      }

      const retryAfterMs = parseRetryAfterMs(res.headers.get("retry-after"));
      const waitMs = nextWaitMs(attempt, retryAfterMs);
      if (isRateLimit) {
        addTransient(
          `TRANSIENT RATE LIMIT: ${label} attempt ${attempt}/${retryMax} status=429 wait=${waitMs}ms${
            retryAfterMs > 0 ? ` retry-after=${retryAfterMs}ms` : ""
          } url=${url}`
        );
      } else {
        addTransient(
          `TRANSIENT UPSTREAM: ${label} attempt ${attempt}/${retryMax} status=${res.status} wait=${waitMs}ms url=${url}`
        );
      }
      await sleep(waitMs);
    } catch (error) {
      const reason =
        error && error.name === "AbortError"
          ? "timeout"
          : error && error.message
            ? error.message
            : "fetch-failed";

      if (attempt >= retryMax) {
        addUnavailable(`${label} network-error=${reason} attempts=${retryMax} url=${url}`);
        return { ok: false };
      }

      const waitMs = nextWaitMs(attempt, 0);
      addTransient(
        `TRANSIENT NETWORK: ${label} attempt ${attempt}/${retryMax} error=${reason} wait=${waitMs}ms url=${url}`
      );
      await sleep(waitMs);
    } finally {
      clearTimeout(timer);
    }
  }

  return { ok: false };
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

const findTagBlockByClass = (html, tagName, classToken) => {
  const source = String(html || "");
  const tag = String(tagName || "").trim().toLowerCase();
  const needle = String(classToken || "").trim();
  if (!source || !tag || !needle) return "";
  const openRe = new RegExp(
    `<${tag}\\b[^>]*\\bclass\\s*=\\s*(?:(['"])([^'"]*)\\1|([^\\s"'=<>` + "`" + `]+))[^>]*>`,
    "gi"
  );
  let match;
  while ((match = openRe.exec(source))) {
    const classes = String(match[2] || match[3] || "")
      .split(/\s+/)
      .map((x) => x.trim())
      .filter(Boolean);
    if (!classes.includes(needle)) continue;
    const range = findElementRangeFromOpen(source, match.index, match[0], tag);
    if (range && range.innerHtml) return range.innerHtml;
  }
  return "";
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

const countEligibleHeadings = (postBodyHtml) => {
  const source = stripBlockedBlocks(postBodyHtml);
  const re = /<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  const levels = { h1: 0, h2: 0, h3: 0, h4: 0, total: 0 };
  let match;
  while ((match = re.exec(source))) {
    const level = String(match[1] || "");
    const text = cleanText(match[2] || "");
    const key = `h${level}`;
    if (!text) continue;
    if (!Object.prototype.hasOwnProperty.call(levels, key)) continue;
    levels[key] += 1;
    levels.total += 1;
  }
  return levels;
};

const extractTocHtml = (html) => {
  const source = String(html || "");
  const m = source.match(/<nav\b[^>]*\bid\s*=\s*(["'])gg-toc\1[^>]*>[\s\S]*?<\/nav>/i);
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
if (!targetUrl) {
  addFunctional(`invalid --post (${postRaw})`);
}

if (targetUrl) {
  const result = await fetchTextWithRetry(withCacheBust(targetUrl), "post-leftpanel");

  if (!result.ok) {
    if (result.fatal) {
      addFunctional(`status ${result.status} ${targetUrl}`);
    }
  } else if (!/\btext\/html\b/i.test(result.contentType)) {
    addFunctional(`non-html content-type "${result.contentType}" ${targetUrl}`);
  } else {
    const html = String(result.text || "");
    if (/No content found/i.test(html)) {
      addFunctional(`forbidden text "No content found" present @ ${targetUrl}`);
    }
    const leftScope = findTagBlockByClass(html, "aside", "gg-blog-sidebar--left");
    const rightScope = findTagBlockByClass(html, "aside", "gg-blog-sidebar--right");
    if (!leftScope) {
      addFunctional(`missing left sidebar .gg-blog-sidebar--left @ ${targetUrl}`);
    } else {
      if (!/\bid\s*=\s*(["'])gg-toc\1/i.test(leftScope)) {
        addFunctional(`left sidebar missing #gg-toc @ ${targetUrl}`);
      }
      if (!/\bid\s*=\s*(["'])gg-labeltree-post\1/i.test(leftScope)) {
        addFunctional(`left sidebar missing #gg-labeltree-post (Interests) @ ${targetUrl}`);
      }
      if (/\bid\s*=\s*(["'])gg-postinfo\1/i.test(leftScope)) {
        addFunctional(`forbidden #gg-postinfo still present in left sidebar @ ${targetUrl}`);
      }
    }
    if (!rightScope) {
      addFunctional(`missing right sidebar .gg-blog-sidebar--right @ ${targetUrl}`);
    } else if (!/\bid\s*=\s*(["'])gg-postinfo\1/i.test(rightScope)) {
      addFunctional(`right sidebar missing #gg-postinfo info sheet @ ${targetUrl}`);
    }
    if (/\bid\s*=\s*(["'])gg-labeltree-detail\1/i.test(html)) {
      addFunctional(`forbidden #gg-labeltree-detail present @ ${targetUrl}`);
    }

    const postBodyHtml = findPostBodyHtml(html);
    if (!postBodyHtml) {
      addFunctional(`unable to locate article body @ ${targetUrl}`);
    } else {
      const headingCount = countEligibleHeadings(postBodyHtml);
      const expectedLinks = Math.min(headingCount.total, 12);
      const tocHtml = extractTocHtml(html);
      const tocLinkCount = countTocLinks(tocHtml);
      if (headingCount.total < 1) {
        addFunctional(
          `expected >=1 heading (h1-h4) in article body @ ${targetUrl} (h1=${headingCount.h1}, h2=${headingCount.h2}, h3=${headingCount.h3}, h4=${headingCount.h4})`
        );
      }
      if (headingCount.total > 0 && tocLinkCount < expectedLinks) {
        const emptyHidden = /<div\b[^>]*\bclass\s*=\s*(["'])[^"']*\bgg-toc__empty\b[^"']*\1[^>]*\bhidden\b/i.test(
          tocHtml
        );
        if (!emptyHidden) {
          addFunctional(
            `h1-h4 total=${headingCount.total} expected_links>=${expectedLinks} but TOC links=${tocLinkCount} and empty block is not hidden @ ${targetUrl}`
          );
        }
      }
    }
  }
}

const hasUnavailable = report.unavailable.length > 0;
const hasFunctional = report.functional.length > 0;

if (hasUnavailable || hasFunctional) {
  console.error("VERIFY_LIVE_POST_LEFTPANEL: FAIL");
  console.error(`- FAILURE_CLASS: ${hasFunctional ? "FUNCTIONAL_FAIL" : "LIVE_UNAVAILABLE"}`);
  for (const line of report.transient) console.error(`- ${line}`);
  for (const line of report.unavailable) console.error(`- ${line}`);
  for (const line of report.functional) console.error(`- ${line}`);
  process.exit(1);
}

if (report.transient.length) {
  console.log("VERIFY_LIVE_POST_LEFTPANEL: TRANSIENT RECOVERY");
  for (const line of report.transient) console.log(`- ${line}`);
}

console.log(`VERIFY_LIVE_POST_LEFTPANEL: PASS post=${targetUrl}`);
