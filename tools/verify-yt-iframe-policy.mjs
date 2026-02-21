import fs from "fs";
import path from "path";

const root = process.cwd();
const coreRel = "public/assets/latest/modules/ui.bucket.core.js";
const coreAbs = path.join(root, coreRel);
const failures = [];

function fail(msg) {
  failures.push(msg);
}

if (!fs.existsSync(coreAbs)) {
  fail(`missing file: ${coreRel}`);
} else {
  const src = fs.readFileSync(coreAbs, "utf8");

  if (/youtube\.com\/embed\//i.test(src)) {
    fail("core still references youtube.com/embed/ in yt-lite activation");
  }
  if (!/youtube-nocookie\.com\/embed\//i.test(src)) {
    fail("core missing youtube-nocookie.com/embed/ usage");
  }
  if (!/iframe\.setAttribute\(\s*['\"]title['\"]\s*,/i.test(src)) {
    fail("core missing iframe title assignment");
  }
  if (!/iframe\.setAttribute\(\s*['\"]referrerpolicy['\"]\s*,\s*['\"]strict-origin-when-cross-origin['\"]\s*\)/i.test(src)) {
    fail("core missing strict-origin-when-cross-origin referrerpolicy");
  }
  if (!/iframe\.setAttribute\(\s*['\"]allow['\"]\s*,/i.test(src)) {
    fail("core missing iframe allow assignment");
  }
  if (!/function\s+preconnectOnce\s*\(/.test(src)) {
    fail("core missing preconnectOnce helper in yt-lite flow");
  }
  if (!/preconnectOnce\(\s*['\"]https:\/\/www\.youtube-nocookie\.com['\"]\s*\)/.test(src)) {
    fail("core missing preconnectOnce for youtube-nocookie host");
  }
  if (!/preconnectOnce\(\s*['\"]https:\/\/i\.ytimg\.com['\"]\s*\)/.test(src)) {
    fail("core missing preconnectOnce for i.ytimg.com host");
  }
  if (!/addEventListener\(\s*['\"]pointerenter['\"]\s*,\s*warm\s*,\s*\{\s*once\s*:\s*true\s*\}\s*\)/.test(src)) {
    fail("core missing pointerenter warm preconnect hook");
  }
  if (!/addEventListener\(\s*['\"]focus['\"]\s*,\s*warm\s*,\s*\{\s*once\s*:\s*true\s*\}\s*\)/.test(src)) {
    fail("core missing focus warm preconnect hook");
  }
}

if (failures.length) {
  console.error("VERIFY_YT_IFRAME_POLICY: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: yt iframe policy (nocookie + title + intent preconnect)");
