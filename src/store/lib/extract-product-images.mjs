import { absoluteUrl, arr, clean, unique } from "./normalize-store-product.mjs";

export const IMAGE_SOURCE_KEYS = [
  "gg-store-data.images",
  "post-content-img",
  "media-thumbnail",
  "existing-static-fallback",
  "missing",
];

function srcsetFirstUrl(value) {
  return clean(value).split(",")[0]?.trim().split(/\s+/)[0] || "";
}

export function extractImagesFromHtml(html) {
  const source = String(html || "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ");
  const out = [];
  const patterns = [
    /<img\b[^>]*\bsrc=(["'])(.*?)\1/gi,
    /<img\b[^>]*\bdata-src=(["'])(.*?)\1/gi,
    /<img\b[^>]*\bsrcset=(["'])(.*?)\1/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(source))) {
      const raw = pattern === patterns[2] ? srcsetFirstUrl(match[2]) : match[2];
      const href = absoluteUrl(raw);
      if (href) out.push(href);
    }
  }

  return unique(out);
}

export function upgradeBloggerImageUrl(value) {
  const href = absoluteUrl(value);
  if (!href) return "";

  try {
    const url = new URL(href);
    const host = String(url.hostname || "").toLowerCase();
    const bloggerHost = /(blogger|googleusercontent|bp\.blogspot)\./.test(host);
    if (!bloggerHost) return url.toString();

    url.pathname = url.pathname.replace(/\/s\d+(?:-[a-z]+)?\//i, "/s1600/");
    if (url.search) {
      url.search = url.search.replace(/([?&=])s\d+(?:-[a-z]+)?(?:-c)?/gi, "$1s1600");
    }

    return url.toString();
  } catch (error) {
    return href;
  }
}

export function extractEntryImageUrls(entry) {
  const out = [];
  const thumbnail = entry?.["media$thumbnail"];
  const thumbnailUrl = upgradeBloggerImageUrl(thumbnail?.url || thumbnail?.$t);

  if (thumbnailUrl) out.push(thumbnailUrl);

  for (const media of arr(entry?.["media$content"])) {
    const href = upgradeBloggerImageUrl(media?.url || media?.$t);
    if (href) out.push(href);
  }

  for (const link of arr(entry?.link)) {
    const rel = clean(link?.rel).toLowerCase();
    const type = clean(link?.type).toLowerCase();
    if (rel === "enclosure" || type.startsWith("image/")) {
      const href = upgradeBloggerImageUrl(link?.href);
      if (href) out.push(href);
    }
  }

  return unique(out);
}

export function resolveProductImages({ dataImages, dataImage, contentHtml, entry, existingImages = [] }) {
  const scriptImages = unique(arr(dataImages).concat(arr(dataImage)).map((value) => absoluteUrl(value)).filter(Boolean));
  if (scriptImages.length) {
    return {
      imageSource: "gg-store-data.images",
      images: scriptImages,
      warnings: [],
    };
  }

  const htmlImages = extractImagesFromHtml(contentHtml);
  if (htmlImages.length) {
    return {
      imageSource: "post-content-img",
      images: htmlImages,
      warnings: [],
    };
  }

  const thumbnailImages = extractEntryImageUrls(entry);
  if (thumbnailImages.length) {
    return {
      imageSource: "media-thumbnail",
      images: thumbnailImages,
      warnings: [],
    };
  }

  const staticFallbackImages = unique(arr(existingImages).map((value) => absoluteUrl(value)).filter(Boolean));
  if (staticFallbackImages.length) {
    return {
      imageSource: "existing-static-fallback",
      images: staticFallbackImages,
      warnings: ["used existing static image fallback"],
    };
  }

  return {
    imageSource: "missing",
    images: [],
    warnings: ["missing image after feed extraction fallbacks"],
  };
}
