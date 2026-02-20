import fs from "node:fs";

const file = "index.prod.xml";
let xml = fs.readFileSync(file, "utf8");

function extractWidget(id) {
  const re = new RegExp(`\\n\\s*<b:widget id='${id}'[\\s\\S]*?<\\/b:widget>`, "m");
  const m = xml.match(re);
  if (!m) throw new Error(`missing widget ${id}`);
  xml = xml.replace(re, "\n");
  return m[0].replace(/^\n/, "");
}

const topIds = ["HTML15", "HTML6", "HTML5"];
const deferredIds = ["HTML10", "HTML11", "HTML7", "HTML12"];
const blocks = {};

for (const id of [...topIds, ...deferredIds]) {
  blocks[id] = extractWidget(id);
}

const featuredSection =
  "<b:section class='gg-featuredpost' id='gg-featuredpost1' name='gg-featuredpost1' showaddelement='true'>";
const popularSection =
  "<b:section class='gg-popularpost1' id='gg-popularpost1' name='gg-popularpost1' showaddelement='true'>";

if (!xml.includes(featuredSection)) throw new Error("missing gg-featuredpost1 section");
if (!xml.includes(popularSection)) throw new Error("missing gg-popularpost1 section");

xml = xml.replace(
  featuredSection,
  `${featuredSection}\n${topIds.map((id) => blocks[id]).join("\n")}`
);
xml = xml.replace(
  popularSection,
  `${popularSection}\n${deferredIds.map((id) => blocks[id]).join("\n")}`
);

fs.writeFileSync(file, xml);
console.log(`Reordered mixed widgets in ${file}`);
