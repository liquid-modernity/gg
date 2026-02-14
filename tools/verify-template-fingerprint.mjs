import fs from "fs";
import path from "path";

const root = process.cwd();
const failures = [];

const read = (rel) => {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) {
    failures.push(`${rel} missing`);
    return "";
  }
  return fs.readFileSync(p, "utf8");
};

const extractAttr = (tag, attr) => {
  if (!tag) return "";
  const re = new RegExp(`${attr}\\s*=\\s*(['"])([^'"]*)\\1`, "i");
  const match = tag.match(re);
  return match ? match[2] : "";
};

const findMetaContent = (xml, name) => {
  const re = new RegExp(`<meta[^>]+name=['"]${name}['"][^>]*>`, "i");
  const match = xml.match(re);
  if (!match) return "";
  return extractAttr(match[0], "content");
};

const findFingerprint = (xml) => {
  const envMeta = findMetaContent(xml, "gg-env");
  const relMeta = findMetaContent(xml, "gg-release");
  const divMatch = xml.match(/<div[^>]+id=['"]gg-fingerprint['"][^>]*>/i);
  const divTag = divMatch ? divMatch[0] : "";
  const envDiv = extractAttr(divTag, "data-env");
  const relDiv = extractAttr(divTag, "data-release");
  return { envMeta, relMeta, envDiv, relDiv };
};

const expect = (cond, msg) => {
  if (!cond) failures.push(msg);
};

const devXml = read("index.dev.xml");
const prodXml = read("index.prod.xml");
const worker = read("src/worker.js");

if (devXml) {
  const fp = findFingerprint(devXml);
  expect(fp.envMeta.toLowerCase() === "dev", "index.dev.xml gg-env meta must be dev");
  expect(fp.envDiv.toLowerCase() === "dev", "index.dev.xml gg-fingerprint data-env must be dev");
  expect(fp.relMeta.toLowerCase() === "dev", "index.dev.xml gg-release meta must be dev");
  expect(fp.relDiv.toLowerCase() === "dev", "index.dev.xml gg-fingerprint data-release must be dev");
}

if (prodXml) {
  const fp = findFingerprint(prodXml);
  const prodRelMatch = prodXml.match(/\/assets\/v\/([^/]+)\//);
  const prodRel = prodRelMatch ? prodRelMatch[1] : "";
  expect(fp.envMeta.toLowerCase() === "prod", "index.prod.xml gg-env meta must be prod");
  expect(fp.envDiv.toLowerCase() === "prod", "index.prod.xml gg-fingerprint data-env must be prod");
  expect(fp.relMeta.length > 0, "index.prod.xml gg-release meta missing/empty");
  expect(fp.relDiv.length > 0, "index.prod.xml gg-fingerprint data-release missing/empty");
  if (prodRel) {
    expect(fp.relMeta === prodRel, "index.prod.xml gg-release meta must match assets release id");
    expect(fp.relDiv === prodRel, "index.prod.xml gg-fingerprint data-release must match assets release id");
  } else {
    failures.push("index.prod.xml assets release id not found");
  }
}

if (worker) {
  expect(worker.includes("x-gg-template-mismatch"), "src/worker.js missing mismatch header handling");
  expect(worker.includes("gg-fingerprint"), "src/worker.js missing gg-fingerprint handling");
  expect(worker.includes("gg-release"), "src/worker.js missing gg-release handling");
}

if (failures.length) {
  console.error("VERIFY_TEMPLATE_FINGERPRINT: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("VERIFY_TEMPLATE_FINGERPRINT: PASS");
