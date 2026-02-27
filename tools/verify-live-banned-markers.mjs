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
const DEFAULT_TIMEOUT_MS = 10000;
const BANNED_MARKERS = [
  "Feed unavailable",
  "Dummy form",
  "Curated stories are loading",
  "YOUR_HANDLE",
];

const baseRaw = (getArg("--base") || DEFAULT_BASE).trim();
const postRaw = (getArg("--post") || "").trim();
const timeoutRaw = parseInt(getArg("--timeout-ms"), 10);
const timeoutMs = Number.isFinite(timeoutRaw) && timeoutRaw > 0 ? timeoutRaw : DEFAULT_TIMEOUT_MS;

if (!baseRaw) {
  console.error("VERIFY_LIVE_BANNED_MARKERS: FAIL");
  console.error("- missing --base");
  process.exit(1);
}
const stripTrailingSlash = (s) => s.replace(/\/+$/, "");
const base = stripTrailingSlash(baseRaw);

const normalizeUrl = (raw) => {
  try {
    return new URL(raw).toString();
  } catch (_) {
    const path = String(raw || "").trim();
    if (!path) return "";
    const prefixed = path.startsWith("/") ? path : `/${path}`;
    return `${base}${prefixed}`;
  }
};

const HOME_URL = `${base}/`;
const BLOG_URL = `${base}/blog`;

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
    const text = await res.text();
    return { ok: res.ok, status: res.status, contentType: res.headers.get("content-type") || "", text };
  } finally {
    clearTimeout(timer);
  }
};

const excerptAround = (source, index, marker) => {
  if (index < 0) return "";
  const start = Math.max(0, index - 80);
  const end = Math.min(source.length, index + marker.length + 80);
  return source.slice(start, end).replace(/\s+/g, " ").trim();
};

const findPostUrl = (html, baseUrl) => {
  const hrefRe = /href\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s"'=<>`]+))/gi;
  for (const m of html.matchAll(hrefRe)) {
    const raw = String(m[1] || m[2] || m[3] || "").trim();
    if (!raw) continue;
    if (/^mailto:|^tel:|^javascript:/i.test(raw)) continue;
    let candidate;
    try {
      candidate = new URL(raw, baseUrl);
    } catch (_) {
      continue;
    }
    if (!/^https?:$/i.test(candidate.protocol)) continue;
    if (candidate.hostname !== new URL(baseUrl).hostname) continue;
    if (!/\/20\d{2}\/\d{2}\/[^/?#]+\.html$/i.test(candidate.pathname)) continue;
    return candidate.toString();
  }
  return "";
};

const checkMarkers = (id, url, text, violations) => {
  const haystack = String(text || "");
  const low = haystack.toLowerCase();
  for (const marker of BANNED_MARKERS) {
    const markerLow = marker.toLowerCase();
    const idx = low.indexOf(markerLow);
    if (idx === -1) continue;
    const snippet = excerptAround(haystack, idx, marker);
    violations.push(
      `${id}: banned marker "${marker}" found @ ${url}${snippet ? ` | snippet: ${snippet}` : ""}`
    );
  }
};

const fetchAndInspect = async (id, url, violations) => {
  let result;
  try {
    result = await fetchText(url);
  } catch (e) {
    const msg = e && e.name === "AbortError" ? "timeout" : (e && e.message ? e.message : "fetch-failed");
    violations.push(`${id}: fetch failed (${msg}) ${url}`);
    return null;
  }

  if (!result.ok) {
    violations.push(`${id}: status ${result.status} ${url}`);
    return null;
  }

  checkMarkers(id, url, result.text, violations);
  return result.text;
};

const violations = [];
const homeHtml = await fetchAndInspect("home", HOME_URL, violations);
const blogHtml = await fetchAndInspect("blog", BLOG_URL, violations);

let postUrl = "";
if (postRaw) {
  postUrl = normalizeUrl(postRaw);
  if (!postUrl) {
    violations.push(`post: invalid --post target (${postRaw})`);
  }
}

if (!postUrl && blogHtml) {
  postUrl = findPostUrl(blogHtml, base);
}

if (!postUrl) {
  violations.push("post: unable to resolve post URL (set --post or ensure /blog has post links)");
} else {
  await fetchAndInspect("post", postUrl, violations);
}

if (violations.length) {
  console.error("VERIFY_LIVE_BANNED_MARKERS: FAIL");
  for (const v of violations) {
    console.error(`- ${v}`);
  }
  process.exit(1);
}

console.log(
  `VERIFY_LIVE_BANNED_MARKERS: PASS checked=3 markers=${BANNED_MARKERS.length} base=${base}`
);
