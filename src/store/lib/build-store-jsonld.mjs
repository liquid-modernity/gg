import {
  STORE_COLLECTION_ID,
  STORE_ITEMLIST_ID,
  STORE_ORGANIZATION_ID,
  STORE_ORIGIN,
  STORE_PATHNAME,
  STORE_ROUTE_URL,
  STORE_SCHEMA_DESCRIPTION,
  STORE_WEBSITE_ID,
} from "../store.config.mjs";
import { absoluteUrl, clean } from "./normalize-store-product.mjs";

export function isNonSpecificOfferUrl(value) {
  return /\/search\b|[?&](q|query|keyword|keywords)=|[?&]st=product(?:&|$)/i.test(clean(value));
}

function marketplaceDisplayName(key) {
  if (key === "shopee") return "Shopee";
  if (key === "tokopedia") return "Tokopedia";
  if (key === "tiktok") return "TikTok";
  if (key === "lazada") return "Lazada";
  return "";
}

function specificOfferMeta(product) {
  for (const key of ["shopee", "tokopedia", "tiktok", "lazada", "website"]) {
    const href = absoluteUrl(product?.links?.[key]);
    if (href && !isNonSpecificOfferUrl(href)) return { key, url: href };
  }
  return null;
}

export function buildStoreJsonLd(products, options = {}) {
  const routeUrl = clean(options.routeUrl) || STORE_ROUTE_URL;
  const collectionId = clean(options.collectionId) || STORE_COLLECTION_ID;
  const itemListId = clean(options.itemListId) || STORE_ITEMLIST_ID;
  const collectionName = clean(options.collectionName) || "Yellow Cart";
  const itemListName = clean(options.itemListName) || "Yellow Cart product picks";
  const description = clean(options.description) || STORE_SCHEMA_DESCRIPTION;
  const positionOffset = Math.max(0, Number.parseInt(String(options.positionOffset || 0), 10) || 0);
  const itemListElements = products.map((product, index) => {
    const item = {
      "@type": "Product",
      "@id": `${product.canonicalUrl}#product`,
      name: product.name,
      description: product.summary,
      image: product.images,
      brand: {
        "@type": "Brand",
        name: product.brand || "Generic",
      },
      category: product.category,
    };
    const offerMeta = specificOfferMeta(product);

    if (product.price > 0 && product.priceCurrency && offerMeta?.url) {
      item.offers = {
        "@type": "Offer",
        url: offerMeta.url,
        price: String(product.price),
        priceCurrency: product.priceCurrency,
      };
      if (offerMeta.key !== "website") {
        item.offers.seller = {
          "@type": "Organization",
          name: marketplaceDisplayName(offerMeta.key),
        };
      }
    }

    return {
      "@type": "ListItem",
      position: positionOffset + index + 1,
      url: product.canonicalUrl,
      item,
    };
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": STORE_WEBSITE_ID,
        name: "PakRPP",
        url: STORE_ORIGIN,
      },
      {
        "@type": "Organization",
        "@id": STORE_ORGANIZATION_ID,
        name: "PakRPP",
        url: STORE_ORIGIN,
      },
      {
        "@type": "CollectionPage",
        "@id": collectionId,
        name: collectionName,
        url: routeUrl,
        isPartOf: { "@id": STORE_WEBSITE_ID },
        publisher: { "@id": STORE_ORGANIZATION_ID },
        description,
        mainEntity: { "@id": itemListId },
      },
      {
        "@type": "ItemList",
        "@id": itemListId,
        name: itemListName,
        url: routeUrl || `${STORE_ORIGIN}${STORE_PATHNAME}`,
        numberOfItems: products.length,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: itemListElements,
      },
    ],
  };
}
