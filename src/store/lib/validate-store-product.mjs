import { CATEGORY_CONFIG, CATEGORY_ORDER } from "./category-config.mjs";
import { absoluteUrl, clean, isDummyValue, slugEndsWithHtml, slugLooksLikeUrl } from "./normalize-store-product.mjs";

function isKebabCaseSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clean(value));
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

  const picsumImages = images.filter((value) => /picsum\.photos/i.test(String(value)));
  if (mode === "production" && picsumImages.length) {
    errors.push("picsum.photos is not allowed in production");
  } else if (picsumImages.length) {
    warnings.push("picsum.photos remains in non-production data");
  }

  return { errors, warnings };
}
