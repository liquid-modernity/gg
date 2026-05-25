export const GG_ROUTES = Object.freeze({
  home: Object.freeze({
    id: "home",
    surface: "landing",
    href: "/landing",
    labelKey: "nav.home",
    publicName: "Home",
    icon: "home"
  }),
  blog: Object.freeze({
    id: "blog",
    surface: "blog",
    href: "/",
    labelKey: "nav.blog",
    publicName: "Blog",
    icon: "article"
  }),
  store: Object.freeze({
    id: "store",
    surface: "store",
    href: "/store",
    labelKey: "nav.store",
    publicName: "Store",
    icon: "shopping_bag"
  }),
  contact: Object.freeze({
    id: "contact",
    surface: "landing-section",
    href: "/landing#contact",
    labelKey: "nav.contact",
    publicName: "Contact",
    icon: "mail"
  }),
  search: Object.freeze({
    id: "search",
    surface: "utility",
    href: "",
    labelKey: "nav.search",
    publicName: "Search",
    icon: "search"
  }),
  more: Object.freeze({
    id: "more",
    surface: "utility",
    href: "",
    labelKey: "nav.more",
    publicName: "More",
    icon: "expand_more"
  }),
  sitemap: Object.freeze({
    id: "sitemap",
    surface: "system",
    href: "/sitemap.xml",
    labelKey: "more.sitemap",
    publicName: "Sitemap",
    icon: "account_tree"
  }),
  rss: Object.freeze({
    id: "rss",
    surface: "feed",
    href: "/feeds/posts/default?alt=rss",
    labelKey: "more.rss",
    publicName: "RSS",
    icon: "rss_feed"
  }),
  about: Object.freeze({
    id: "about",
    surface: "page",
    href: "/p/about.html",
    labelKey: "more.about",
    publicName: "About PakRPP",
    icon: "info"
  }),
  privacy: Object.freeze({
    id: "privacy",
    surface: "page",
    href: "/p/privacy-policy.html",
    labelKey: "more.privacy",
    publicName: "Privacy Policy",
    icon: "shield"
  }),
  terms: Object.freeze({
    id: "terms",
    surface: "page",
    href: "/p/terms-of-use.html",
    labelKey: "more.terms",
    publicName: "Terms of Use",
    icon: "description"
  }),
  disclaimer: Object.freeze({
    id: "disclaimer",
    surface: "page",
    href: "/p/disclaimer.html",
    labelKey: "more.disclaimer",
    publicName: "Disclaimer",
    icon: "warning"
  })
});

export const GG_ROUTE_IDS = Object.freeze(Object.keys(GG_ROUTES));
