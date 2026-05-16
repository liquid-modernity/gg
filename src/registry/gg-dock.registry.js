export const GG_DOCK = Object.freeze({
  order: Object.freeze(["home", "contact", "search", "blog", "more"]),
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
