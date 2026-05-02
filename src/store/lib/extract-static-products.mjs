import { clean } from "./normalize-store-product.mjs";

export function extractMarkedRegion(text, startMarker, endMarker) {
  const startIndex = text.indexOf(startMarker);
  const endIndex = text.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) return "";
  return text.slice(startIndex + startMarker.length, endIndex);
}

export function extractScriptTextById(source, id) {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`<script\\b[^>]*id=["']${escapedId}["'][^>]*>([\\s\\S]*?)<\\/script>`, "i"));
  return match ? match[1] : "";
}

export function parseJsonScript(source, id) {
  const scriptText = extractScriptTextById(source, id);
  if (!clean(scriptText)) return null;
  return JSON.parse(scriptText);
}

export function extractStaticProductsFromStoreHtml(source) {
  const parsed = parseJsonScript(source, "store-static-products");
  return Array.isArray(parsed) ? parsed : [];
}
