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
const LEGAL_PATHS = [
  "/p/editorial-policy.html",
  "/p/privacy-policy.html",
  "/p/terms-of-service.html",
  "/p/accessibility.html",
];
const BANNED_TEXT = [
  "Curated stories",
  "temporarily unavailable",
  "Feed unavailable",
  "Dummy",
];
const COMMENT_PATTERNS = [
  { label: "Load comments", re: /\bload\s+comments\b/i },
  { label: "Add comment", re: /\badd\s+comment\b/i },
  { label: "comments hash link", re: /\bhref\s*=\s*(["'])[^"']*#comments[^"']*\1/i },
  { label: "comments load gate", re: /\bdata-gg-comments-load\s*=\s*(["'])[^"']*\1/i },
];
const DECK_PATTERNS = [
  { label: "mixed deck id", re: /\bid\s*=\s*(["'])gg-mixed-[^"']+\1/i },
  { label: "mixed module", re: /\bdata-gg-module\s*=\s*(["'])mixed-media\1/i },
  { label: "mixed marker", re: /\bdata-gg-mixed\s*=\s*(["'])[^"']+\1/i },
];
const LEGAL_MARKER_RE = /\bdata-gg-page\s*=\s*(["'])legal\1/i;

const stripTrailingSlash = (s) => String(s || "").replace(/\/+$/, "");
const baseRaw = (getArg("--base") || DEFAULT_BASE).trim();
const timeoutRaw = parseInt(getArg("--timeout-ms"), 10);
const timeoutMs = Number.isFinite(timeoutRaw) && timeoutRaw > 0 ? timeoutRaw : DEFAULT_TIMEOUT_MS;
const base = stripTrailingSlash(baseRaw);

if (!base) {
  console.error("VERIFY_LIVE_LEGAL_CLEAN_ROOM: FAIL");
  console.error("- missing --base");
  process.exit(1);
}

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
    return {
      ok: res.ok,
      status: res.status,
      contentType: res.headers.get("content-type") || "",
      text,
    };
  } finally {
    clearTimeout(timer);
  }
};

const excerptAround = (source, index, marker = "") => {
  if (!Number.isFinite(index) || index < 0) return "";
  const left = Math.max(0, index - 80);
  const right = Math.min(source.length, index + String(marker || "").length + 80);
  return source.slice(left, right).replace(/\s+/g, " ").trim();
};

const findIndexInsensitive = (source, marker) => {
  const hay = String(source || "");
  const needle = String(marker || "");
  if (!needle) return -1;
  return hay.toLowerCase().indexOf(needle.toLowerCase());
};

const runRegex = (source, regex) => {
  regex.lastIndex = 0;
  const m = regex.exec(source);
  regex.lastIndex = 0;
  if (!m) return null;
  return { index: m.index, value: m[0] };
};

const failures = [];

for (const path of LEGAL_PATHS) {
  const url = `${base}${path}`;
  let result;
  try {
    result = await fetchText(`${url}?x=${Date.now()}`);
  } catch (e) {
    const msg = e && e.name === "AbortError" ? "timeout" : (e && e.message ? e.message : "fetch-failed");
    failures.push(`${path}: fetch failed (${msg}) ${url}`);
    continue;
  }

  if (!result.ok) {
    failures.push(`${path}: status ${result.status} ${url}`);
    continue;
  }
  if (!/\btext\/html\b/i.test(result.contentType)) {
    failures.push(`${path}: non-html content-type "${result.contentType}" ${url}`);
    continue;
  }

  const html = String(result.text || "");
  if (!LEGAL_MARKER_RE.test(html)) {
    failures.push(`${path}: missing marker data-gg-page="legal" @ ${url}`);
  }

  for (const marker of BANNED_TEXT) {
    const idx = findIndexInsensitive(html, marker);
    if (idx === -1) continue;
    const snippet = excerptAround(html, idx, marker);
    failures.push(
      `${path}: banned marker "${marker}" found @ ${url}${snippet ? ` | snippet: ${snippet}` : ""}`
    );
  }

  for (const entry of COMMENT_PATTERNS) {
    const hit = runRegex(html, entry.re);
    if (!hit) continue;
    const snippet = excerptAround(html, hit.index, hit.value);
    failures.push(
      `${path}: comment UI marker "${entry.label}" found @ ${url}${snippet ? ` | snippet: ${snippet}` : ""}`
    );
  }

  for (const entry of DECK_PATTERNS) {
    const hit = runRegex(html, entry.re);
    if (!hit) continue;
    const snippet = excerptAround(html, hit.index, hit.value);
    failures.push(
      `${path}: deck marker "${entry.label}" found @ ${url}${snippet ? ` | snippet: ${snippet}` : ""}`
    );
  }
}

if (failures.length) {
  console.error("VERIFY_LIVE_LEGAL_CLEAN_ROOM: FAIL");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`VERIFY_LIVE_LEGAL_CLEAN_ROOM: PASS checked=${LEGAL_PATHS.length} base=${base}`);
