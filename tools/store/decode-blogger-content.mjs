const HTML_ENTITY_MAP = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

export function decodeHtmlEntities(value) {
  return String(value || "").replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    const raw = String(entity || "");
    if (!raw) return match;

    if (raw[0] === "#") {
      const isHex = raw[1]?.toLowerCase() === "x";
      const numeric = Number.parseInt(raw.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      if (Number.isFinite(numeric)) {
        try {
          return String.fromCodePoint(numeric);
        } catch (error) {
          return match;
        }
      }
      return match;
    }

    return HTML_ENTITY_MAP[raw.toLowerCase()] || match;
  });
}

export function normalizeEscapedHtml(value) {
  return String(value || "")
    .replace(/<\\\/script/gi, "</script")
    .replace(/\\u003c/gi, "<")
    .replace(/\\u003e/gi, ">")
    .replace(/\\u0026/gi, "&");
}

export function decodeEmbeddedJsonText(value) {
  return normalizeEscapedHtml(decodeHtmlEntities(value)).trim();
}

export function decodeBloggerContent(value, options = {}) {
  const maxPasses = Number.isFinite(options.maxPasses) ? Math.max(1, options.maxPasses) : 2;
  const variants = [];
  const seen = new Set();
  let current = String(value || "");

  function pushVariant(candidate) {
    const text = String(candidate || "");
    if (!text || seen.has(text)) return;
    seen.add(text);
    variants.push(text);
  }

  pushVariant(current);

  for (let pass = 0; pass < maxPasses; pass += 1) {
    const next = normalizeEscapedHtml(decodeHtmlEntities(current));
    pushVariant(next);
    if (next === current) break;
    current = next;
  }

  return {
    raw: variants[0] || "",
    decoded: variants[variants.length - 1] || "",
    variants,
  };
}
