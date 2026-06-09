(function () {
  "use strict";

  var state = {
    snapshot: null,
    activeTab: "profile"
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function text(value) {
    return value === undefined || value === null || value === "" ? "unavailable" : String(value);
  }

  function clear(node) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "className") node.className = attrs[key];
      else if (key === "text") node.textContent = text(attrs[key]);
      else node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function (child) {
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  function cell(value, className) {
    return el("td", className ? { className: className, text: value } : { text: value });
  }

  function badge(value) {
    var normalized = String(value || "").toLowerCase();
    var tone = normalized.includes("pass") || normalized.includes("present") || normalized.includes("wired") || normalized === "true"
      ? "ok"
      : normalized.includes("missing") || normalized.includes("false")
        ? "bad"
        : "warn";
    return el("span", { className: "badge badge--" + tone, text: value });
  }

  function appendRows(tbody, rows) {
    clear(tbody);
    rows.forEach(function (row) {
      tbody.appendChild(row);
    });
  }

  function renderSummary(snapshot) {
    var summary = byId("summary-grid");
    clear(summary);
    [
      ["Profile", snapshot.profile.status],
      ["Surfaces", snapshot.surfaces.length],
      ["Copy keys", snapshot.copy.locales.en + " EN / " + snapshot.copy.locales.id + " ID"],
      ["A11y flags", Object.values(snapshot.a11y.totals).reduce(function (sum, value) { return sum + value; }, 0)],
      ["CI commands", snapshot.ci.commandChecklist.filter(function (item) { return item.status === "wired"; }).length + "/" + snapshot.ci.commandChecklist.length],
      ["Fingerprint", snapshot.profile.templateFingerprint]
    ].forEach(function (item) {
      summary.appendChild(el("article", { className: "metric" }, [
        el("span", { text: item[0] }),
        el("strong", { text: item[1] })
      ]));
    });
  }

  function renderProfile(snapshot) {
    byId("profile-status").textContent = snapshot.profile.status;
    var grid = byId("profile-grid");
    clear(grid);
    [
      ["Site name", snapshot.profile.siteName],
      ["Canonical base", snapshot.profile.canonicalBase],
      ["Root CMS", snapshot.profile.rootBloggerSource],
      ["Store CMS", snapshot.profile.storeBloggerSource],
      ["Store legacy feed", snapshot.profile.storeLegacySource],
      ["Landing URL", snapshot.profile.landingSurfaceUrl],
      ["Store URL", snapshot.profile.storeCanonicalUrl],
      ["Environment", snapshot.profile.environment],
      ["Release", snapshot.profile.release],
      ["Fingerprint", snapshot.profile.templateFingerprint]
    ].forEach(function (item) {
      grid.appendChild(el("div", { className: "kv" }, [
        el("span", { text: item[0] }),
        el("strong", { text: item[1] })
      ]));
    });

    appendRows(byId("prototype-rows"), snapshot.prototype.extractedConcepts.map(function (item) {
      return el("tr", {}, [
        cell(item.id),
        el("td", {}, [badge(item.present ? "present" : "missing")])
      ]);
    }));
  }

  function renderSurfaces(snapshot) {
    appendRows(byId("surface-rows"), snapshot.surfaces.map(function (surface) {
      return el("tr", {}, [
        cell(surface.id),
        cell(surface.type),
        cell(surface.renderer),
        cell(surface.source, "mono"),
        cell(surface.canonical, "mono"),
        el("td", {}, [badge(surface.status)])
      ]);
    }));

    appendRows(byId("route-rows"), snapshot.routes.publicRoutes.map(function (route) {
      return el("tr", {}, [
        cell(route.route, "mono"),
        cell(route.meaning),
        cell(route.owner)
      ]);
    }));
  }

  function renderTokens(container, items, key) {
    clear(container);
    if (!items.length) {
      container.appendChild(el("span", { className: "empty-token", text: "none" }));
      return;
    }
    items.forEach(function (item) {
      container.appendChild(el("span", { className: "token", text: item[key || "id"] || item }));
    });
  }

  function renderNavigation(snapshot) {
    renderTokens(byId("dock-items"), snapshot.navigation.dockItems, "id");
    renderTokens(byId("listing-filters"), snapshot.navigation.listingFilters, "id");
    appendRows(byId("more-link-rows"), snapshot.navigation.moreLinks.map(function (link) {
      return el("tr", {}, [
        cell(link.id),
        cell(link.label),
        cell(link.href, "mono"),
        cell(link.copyKey, "mono")
      ]);
    }));

    var contact = byId("contact-grid");
    clear(contact);
    [
      ["Contact mode", snapshot.navigation.contact.rootMode],
      ["Landing route", snapshot.navigation.contact.landingRoute],
      ["Fallback email", snapshot.navigation.contact.fallbackEmail]
    ].forEach(function (item) {
      contact.appendChild(el("div", { className: "kv" }, [
        el("span", { text: item[0] }),
        el("strong", { text: item[1] })
      ]));
    });
  }

  function renderCopy(snapshot) {
    var summary = byId("copy-summary");
    clear(summary);
    [
      ["EN keys", snapshot.copy.locales.en],
      ["ID keys", snapshot.copy.locales.id],
      ["Namespaces", snapshot.copy.namespaces.length],
      ["Policy entries", snapshot.copy.namespacePolicyCount]
    ].forEach(function (item) {
      summary.appendChild(el("article", { className: "metric" }, [
        el("span", { text: item[0] }),
        el("strong", { text: item[1] })
      ]));
    });

    appendRows(byId("copy-file-rows"), snapshot.copy.files.map(function (file) {
      return el("tr", {}, [
        cell(file.relPath, "mono"),
        el("td", {}, [badge(file.status)]),
        cell(file.bytes)
      ]);
    }));

    renderTokens(byId("namespace-list"), snapshot.copy.namespaces);
    renderList(byId("missing-id"), snapshot.copy.missingInId);
    renderList(byId("missing-en"), snapshot.copy.missingInEn);
  }

  function renderList(node, items) {
    clear(node);
    if (!items.length) {
      node.appendChild(el("li", { text: "none" }));
      return;
    }
    items.slice(0, 80).forEach(function (item) {
      node.appendChild(el("li", { className: "mono", text: item }));
    });
    if (items.length > 80) node.appendChild(el("li", { text: "+" + (items.length - 80) + " more" }));
  }

  function renderA11y(snapshot) {
    var summary = byId("a11y-summary");
    clear(summary);
    Object.entries(snapshot.a11y.totals).forEach(function (entry) {
      summary.appendChild(el("article", { className: "metric" }, [
        el("span", { text: entry[0] }),
        el("strong", { text: entry[1] })
      ]));
    });

    appendRows(byId("a11y-rows"), snapshot.a11y.perFile.map(function (item) {
      return el("tr", {}, [
        cell(item.relPath, "mono"),
        cell(item.duplicateIdCount),
        cell(item.buttonsWithoutNames),
        cell(item.missingFormLabels),
        cell(item.sheetTriggerPanelMismatches)
      ]);
    }));
  }

  function renderBuild(snapshot) {
    appendRows(byId("command-rows"), snapshot.ci.commandChecklist.map(function (item) {
      return el("tr", {}, [
        cell(item.command, "mono"),
        el("td", {}, [badge(item.status)])
      ]);
    }));

    appendRows(byId("workflow-rows"), snapshot.ci.workflows.map(function (workflow) {
      return el("tr", {}, [
        cell(workflow.file, "mono"),
        el("td", {}, [badge(workflow.status)]),
        el("td", {}, [badge(String(Boolean(workflow.node20)))]),
        el("td", {}, [badge(String(Boolean(workflow.npmCi)))]),
        el("td", {}, [badge(String(Boolean(workflow.cloudflareCi || workflow.advisory)))]),
        el("td", {}, [badge(String(Boolean(workflow.verifyBeforeDeploy || workflow.preparedDeploy || workflow.strictLiveSmoke || workflow.advisory)))])
      ]);
    }));

    var policy = byId("policy-lists");
    clear(policy);
    Object.entries(snapshot.ci.policy).forEach(function (entry) {
      policy.appendChild(el("h4", { text: entry[0].toUpperCase() }));
      var list = el("ul", { className: "plain-list" });
      entry[1].forEach(function (item) {
        list.appendChild(el("li", { text: item }));
      });
      policy.appendChild(list);
    });

    var packaging = byId("packaging-grid");
    clear(packaging);
    [
      ["Dotfiles documented", String(snapshot.ci.packaging.dotfilesDocumented)],
      [".gitignore", snapshot.ci.packaging.gitignorePresent ? "present" : "missing"]
    ].forEach(function (item) {
      packaging.appendChild(el("div", { className: "kv" }, [
        el("span", { text: item[0] }),
        el("strong", { text: item[1] })
      ]));
    });
  }

  function render(snapshot) {
    renderSummary(snapshot);
    renderProfile(snapshot);
    renderSurfaces(snapshot);
    renderNavigation(snapshot);
    renderCopy(snapshot);
    renderA11y(snapshot);
    renderBuild(snapshot);
  }

  function setStatus(value, tone) {
    var node = byId("snapshot-status");
    node.textContent = value;
    node.dataset.tone = tone || "neutral";
  }

  function clearErrorCard() {
    var existing = document.querySelector("[data-console-error]");
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
  }

  function renderErrorCard(error) {
    var main = byId("main");
    var message = error && error.message ? error.message : "Snapshot request failed";
    clearErrorCard();
    main.insertBefore(el("section", {
      className: "error-card",
      "data-console-error": "true",
      "role": "alert"
    }, [
      el("strong", { text: "Snapshot unavailable" }),
      el("p", { text: "/api/snapshot: " + message })
    ]), main.querySelector(".summary-grid"));
  }

  function loadSnapshot() {
    clearErrorCard();
    setStatus("Loading", "neutral");
    return fetch("/api/snapshot", { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("Snapshot request failed");
        return response.json();
      })
      .then(function (snapshot) {
        state.snapshot = snapshot;
        render(snapshot);
        setStatus("Ready", "ok");
      })
      .catch(function (error) {
        renderErrorCard(error);
        setStatus(error.message, "bad");
      });
  }

  function activateTab(tab) {
    state.activeTab = tab || "profile";
    document.querySelectorAll("[data-tab-link]").forEach(function (link) {
      var active = link.dataset.tabLink === state.activeTab;
      link.setAttribute("aria-current", active ? "page" : "false");
    });
    document.querySelectorAll("[data-tab-panel]").forEach(function (panel) {
      panel.hidden = panel.dataset.tabPanel !== state.activeTab;
    });
  }

  function routeFromHash() {
    return (window.location.hash || "#profile").replace(/^#/, "") || "profile";
  }

  document.addEventListener("DOMContentLoaded", function () {
    byId("refresh-button").addEventListener("click", loadSnapshot);
    window.addEventListener("hashchange", function () {
      activateTab(routeFromHash());
    });
    activateTab(routeFromHash());
    loadSnapshot();
  });
}());
