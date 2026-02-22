"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const budgetsPath = path.join(root, "docs/perf/BUDGETS.json");
const urlsPath = path.join(root, "docs/perf/URLS.json");

function readJson(absPath) {
  const raw = fs.readFileSync(absPath, "utf8");
  return JSON.parse(raw);
}

function getUrls() {
  if (!fs.existsSync(urlsPath)) {
    throw new Error("Missing docs/perf/URLS.json");
  }
  const payload = readJson(urlsPath);
  const urls = payload && payload.urls ? payload.urls : {};
  return [urls.home, urls.listing, urls.post].filter(Boolean);
}

const budgets = readJson(budgetsPath);
const ratchet = (budgets && budgets.ratchet) || {};
const urls = getUrls();
const inpAssertLevel = process.env.LHCI_INP_ASSERT_LEVEL || "warn";

if (!urls.length) {
  throw new Error("No Lighthouse URLs found in docs/perf/URLS.json");
}

const assertions = {
  "largest-contentful-paint": ["error", { maxNumericValue: ratchet.max_lcp_ms }],
  "cumulative-layout-shift": ["error", { maxNumericValue: ratchet.max_cls }],
  "total-blocking-time": ["error", { maxNumericValue: ratchet.max_tbt_ms }],
  "total-byte-weight": ["error", { maxNumericValue: ratchet.max_transfer_kb * 1024 }],
};

if (typeof ratchet.max_inp_ms === "number" && isFinite(ratchet.max_inp_ms)) {
  // INP audit is not guaranteed on all Lighthouse runners; keep it non-blocking by default.
  assertions["interaction-to-next-paint"] = [inpAssertLevel, { maxNumericValue: ratchet.max_inp_ms }];
}

module.exports = {
  ci: {
    collect: {
      url: urls,
      numberOfRuns: 3,
      settings: {
        emulatedFormFactor: "mobile",
        throttlingMethod: "simulate",
      },
    },
    assert: {
      assertions,
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
