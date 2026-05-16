export const GG_ROUTES = Object.freeze({
  home: Object.freeze({
    id: "home",
    surface: "landing",
    href: "/landing",
    labelKey: "nav.home",
    publicName: "Home"
  }),
  blog: Object.freeze({
    id: "blog",
    surface: "blog",
    href: "/",
    labelKey: "nav.blog",
    publicName: "Blog"
  }),
  store: Object.freeze({
    id: "store",
    surface: "store",
    href: "/store",
    labelKey: "nav.store",
    publicName: "Store"
  }),
  contact: Object.freeze({
    id: "contact",
    surface: "landing-section",
    href: "/landing#contact",
    labelKey: "nav.contact",
    publicName: "Contact"
  }),
  search: Object.freeze({
    id: "search",
    surface: "utility",
    href: "",
    labelKey: "nav.search",
    publicName: "Search"
  }),
  more: Object.freeze({
    id: "more",
    surface: "utility",
    href: "",
    labelKey: "nav.more",
    publicName: "More"
  }),
  sitemap: Object.freeze({
    id: "sitemap",
    surface: "system",
    href: "/sitemap.xml",
    labelKey: "more.sitemap",
    publicName: "Sitemap"
  }),
  rss: Object.freeze({
    id: "rss",
    surface: "feed",
    href: "/feeds/posts/default?alt=rss",
    labelKey: "more.rss",
    publicName: "RSS"
  }),
  about: Object.freeze({
    id: "about",
    surface: "page",
    href: "/p/about.html",
    labelKey: "more.about",
    publicName: "About PakRPP"
  }),
  privacy: Object.freeze({
    id: "privacy",
    surface: "page",
    href: "/p/privacy-policy.html",
    labelKey: "more.privacy",
    publicName: "Privacy Policy"
  }),
  terms: Object.freeze({
    id: "terms",
    surface: "page",
    href: "/p/terms-of-use.html",
    labelKey: "more.terms",
    publicName: "Terms of Use"
  }),
  disclaimer: Object.freeze({
    id: "disclaimer",
    surface: "page",
    href: "/p/disclaimer.html",
    labelKey: "more.disclaimer",
    publicName: "Disclaimer"
  })
});

export const GG_ROUTE_IDS = Object.freeze(Object.keys(GG_ROUTES));
