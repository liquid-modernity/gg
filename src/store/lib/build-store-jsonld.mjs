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

export function buildStoreJsonLd(products) {
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
      position: index + 1,
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
        "@id": STORE_COLLECTION_ID,
        name: "Yellow Cart",
        url: STORE_ROUTE_URL,
        isPartOf: { "@id": STORE_WEBSITE_ID },
        publisher: { "@id": STORE_ORGANIZATION_ID },
        description: STORE_SCHEMA_DESCRIPTION,
        mainEntity: { "@id": STORE_ITEMLIST_ID },
      },
      {
        "@type": "ItemList",
        "@id": STORE_ITEMLIST_ID,
        name: "Yellow Cart product picks",
        url: `${STORE_ORIGIN}${STORE_PATHNAME}`,
        numberOfItems: products.length,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: itemListElements,
      },
    ],
  };
}
