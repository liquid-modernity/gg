export const GG_SOURCE_BOUNDARY = Object.freeze({
  rootSource: Object.freeze({
    id: "rootSource",
    provider: "blogger",
    sourceHost: "pakrpp.blogspot.com",
    publicCanonicalBase: "https://www.pakrpp.com/",
    feed: Object.freeze({
      url: "https://pakrpp.blogspot.com/feeds/posts/default?alt=json",
      publicPath: "/feeds/posts/default?alt=json",
      maxResults: 80
    }),
    sitemap: Object.freeze({
      sourceUrl: "https://pakrpp.blogspot.com/sitemap.xml",
      publicUrl: "https://www.pakrpp.com/sitemap.xml"
    }),
    schemaFamily: Object.freeze(["Article", "WebPage", "BlogPosting"])
  }),
  storeSource: Object.freeze({
    id: "storeSource",
    provider: "blogger",
    sourceHost: "pakrppstore.blogspot.com",
    sourceCustomHost: "https://store.pakrpp.com/",
    publicCanonicalBase: "https://www.pakrpp.com/store/",
    feed: Object.freeze({
      url: "https://pakrppstore.blogspot.com/feeds/posts/default/-/Store?alt=json&max-results=50",
      legacyUrl: "https://pakrppstore.blogspot.com/feeds/posts/default/-/yellowcard?alt=json&max-results=50",
      maxResults: 50,
      primaryLabel: "Store",
      legacyLabel: "yellowcard"
    }),
    sitemap: Object.freeze({
      sourceUrl: "https://pakrppstore.blogspot.com/sitemap.xml",
      sourceCustomUrl: "https://store.pakrpp.com/sitemap.xml",
      publicCanonicalBase: "https://www.pakrpp.com/store/"
    }),
    schemaFamily: Object.freeze(["Product", "ItemList"])
  })
});

export const rootSource = GG_SOURCE_BOUNDARY.rootSource;
export const storeSource = GG_SOURCE_BOUNDARY.storeSource;

export function stripTrailingSlash(value) {
  return String(value || "").replace(/\/+$/u, "");
}
