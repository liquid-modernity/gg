export const GG_DOCK = Object.freeze({
  order: Object.freeze(["home", "contact", "search", "blog", "more"]),
  icons: Object.freeze({
    landing: Object.freeze({
      home: "home_app_logo",
      contact: "calendar_add_on",
      search: "explore",
      blog: "newsmode",
      more: "menu"
    }),
    blog: Object.freeze({
      home: "home_app_logo",
      contact: "calendar_add_on",
      search: "explore",
      blog: "newsmode",
      more: "menu"
    }),
    detail: Object.freeze({
      home: "home_app_logo",
      contact: "calendar_add_on",
      search: "explore",
      blog: "newsmode",
      more: "menu"
    }),
    page: Object.freeze({
      home: "home_app_logo",
      contact: "calendar_add_on",
      search: "explore",
      blog: "newsmode",
      more: "menu"
    }),
    store: Object.freeze({
      home: "home_app_logo",
      contact: "calendar_add_on",
      search: "search",
      blog: "newsmode",
      more: "menu"
    })
  }),
  surfaces: Object.freeze({
    landing: Object.freeze({
      active: "home",
      actions: Object.freeze({
        home: "scrollTop",
        contact: "scrollToContact",
        search: "openGlobalDiscovery",
        blog: "navigateBlog",
        more: "openMore"
      })
    }),
    blog: Object.freeze({
      active: "blog",
      actions: Object.freeze({
        home: "navigateHome",
        contact: "navigateContact",
        search: "openGlobalDiscovery",
        blog: "scrollTop",
        more: "openMore"
      })
    }),
    detail: Object.freeze({
      active: "blog",
      actions: Object.freeze({
        home: "navigateHome",
        contact: "navigateContact",
        search: "openGlobalDiscovery",
        blog: "navigateBlog",
        more: "openMore"
      })
    }),
    page: Object.freeze({
      active: "blog",
      actions: Object.freeze({
        home: "navigateHome",
        contact: "navigateContact",
        search: "openGlobalDiscovery",
        blog: "navigateBlog",
        more: "openMore"
      })
    }),
    store: Object.freeze({
      active: null,
      actions: Object.freeze({
        home: "navigateHome",
        contact: "navigateContact",
        search: "openStoreDiscovery",
        blog: "navigateBlog",
        more: "openMore"
      })
    })
  })
});
