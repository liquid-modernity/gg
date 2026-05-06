import { CATEGORY_CONFIG, CATEGORY_ORDER } from "./category-config.mjs";
import { absoluteUrl, clean, isDummyValue, slugEndsWithHtml, slugLooksLikeUrl } from "./normalize-store-product.mjs";

function isKebabCaseSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clean(value));
}

export function isPlaceholderImageUrl(value) {
  let url;
  try {
    url = new URL(String(value || "").trim());
  } catch (_) {
    return false;
  }

  const host = url.hostname.toLowerCase();
  return (
    host === "picsum.photos" ||
    host.endsWith(".picsum.photos") ||
    host === "placehold.co" ||
    host.endsWith(".placehold.co") ||
    host === "placeholder.com" ||
    host.endsWith(".placeholder.com") ||
    host === "dummyimage.com" ||
    host.endsWith(".dummyimage.com") ||
    host === "via.placeholder.com"
  );
}

export function productionImageUrlIssue(value) {
  const raw = String(value || "").trim();
  let url;

  if (!raw) return "empty image URL";
  if (/^(?:data|blob):/i.test(raw)) return "data/blob image URL is not allowed in production";
  if (/^\/\//.test(raw) || /^\//.test(raw)) return "relative image URL is not allowed in production";

  try {
    url = new URL(raw);
  } catch (_) {
    return "image URL is not a valid absolute URL";
  }

  const host = url.hostname.toLowerCase();
  if (url.protocol !== "https:") return "image URL must be HTTPS in production";
  if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".local")) {
    return "localhost image URL is not allowed in production";
  }
  if (isPlaceholderImageUrl(raw)) return "placeholder image URL is not allowed in production";
  return "";
}

export function isDummyProduct(product) {
  return [
    product?.id,
    product?.slug,
    product?.name,
    product?.canonicalUrl,
  ].some((value) => isDummyValue(value));
}

export function validateStoreProduct(product, options = {}) {
  const mode = clean(options.mode || "development").toLowerCase() || "development";
  const errors = [];
  const warnings = [];
  const imageSource = clean(options.imageSource);
  const slug = clean(product?.slug);
  const name = clean(product?.name);
  const categoryKey = clean(product?.categoryKey);
  const category = clean(product?.category);
  const canonicalUrl = clean(product?.canonicalUrl);
  const images = Array.isArray(product?.images) ? product.images.filter(Boolean) : [];
  const firstImage = clean(images[0]);

  if (!name) errors.push("missing name");
  if (name && isDummyValue(name)) errors.push("name contains dummy");

  if (!slug) errors.push("missing slug");
  if (slug && !isKebabCaseSlug(slug)) errors.push("slug must be lowercase kebab-case");
  if (slug && /\s/.test(slug)) errors.push("slug contains spaces");
  if (slug && slugLooksLikeUrl(slug)) errors.push("slug looks like a URL");
  if (slug && slugEndsWithHtml(slug)) errors.push("slug ends with .html");
  if (slug && isDummyValue(slug)) errors.push("slug contains dummy");

  if (!categoryKey) errors.push("missing categoryKey");
  else if (!CATEGORY_ORDER.includes(categoryKey)) errors.push(`invalid categoryKey (${JSON.stringify(categoryKey)})`);

  if (!category) errors.push("missing category");
  else if (category === "Etc") errors.push('public category "Etc" is not allowed');

  if (categoryKey && CATEGORY_CONFIG[categoryKey] && category !== CATEGORY_CONFIG[categoryKey].label) {
    errors.push(`category does not match categoryKey (${categoryKey})`);
  }

  if (!canonicalUrl) errors.push("missing canonicalUrl");
  else if (!absoluteUrl(canonicalUrl)) errors.push("canonicalUrl is not an absolute http(s) URL");

  if (!firstImage) errors.push("missing image");
  if (imageSource === "existing-static-fallback") {
    if (mode === "production") errors.push("used existing static image fallback");
    else warnings.push("used existing static image fallback");
  }
  if (imageSource === "missing") errors.push("image extraction source is missing");

  const placeholderImages = images.filter((value) => isPlaceholderImageUrl(value));
  if (mode === "production") {
    const unsafeIssues = uniqueProductionImageIssues(images.map(productionImageUrlIssue).filter(Boolean));
    errors.push(...unsafeIssues);
  } else if (placeholderImages.length) {
    warnings.push("placeholder image URL remains in non-production data");
  }

  return { errors, warnings };
}

function uniqueProductionImageIssues(values) {
  return Array.from(new Set(values));
}
