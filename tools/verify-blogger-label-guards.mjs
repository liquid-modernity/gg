import fs from "fs";
import path from "path";

const root = process.cwd();
const files = ["index.prod.xml", "index.dev.xml"];
const failures = [];

function lineNumberAt(source, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (source.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

function snippetAt(source, index, radius = 120) {
  const start = Math.max(0, index - radius);
  const end = Math.min(source.length, index + radius);
  return source
    .slice(start, end)
    .replace(/\s+/g, " ")
    .trim();
}

function parseIfScopes(source) {
  const scopes = [];
  const stack = [];
  const tagRe = /<\/?b:if\b[^>]*>/gi;
  let match;

  while ((match = tagRe.exec(source))) {
    const tag = match[0];
    const start = match.index;
    const end = tagRe.lastIndex;
    const isClose = /^<\s*\/\s*b:if/i.test(tag);
    if (isClose) {
      const open = stack.pop();
      if (!open) continue;
      scopes.push({
        start: open.start,
        end,
        cond: open.cond,
      });
      continue;
    }

    const condMatch = tag.match(/\bcond\s*=\s*(['"])([\s\S]*?)\1/i);
    stack.push({
      start,
      cond: condMatch ? String(condMatch[2] || "") : "",
    });
  }

  while (stack.length) {
    const open = stack.pop();
    scopes.push({
      start: open.start,
      end: source.length,
      cond: open.cond,
    });
  }

  return scopes;
}

function findNearestScope(scopes, index) {
  let nearest = null;
  for (const scope of scopes) {
    if (scope.start > index || scope.end <= index) continue;
    if (!nearest) {
      nearest = scope;
      continue;
    }
    const span = scope.end - scope.start;
    const nearestSpan = nearest.end - nearest.start;
    if (span < nearestSpan) nearest = scope;
  }
  return nearest;
}

const checks = [
  { token: "data:post.labels.first.url", required: "labels.first" },
  { token: "data:post.labels.first.name", required: "labels.first" },
  { token: "data:post.labels[0].url", required: "labels[0]" },
  { token: "data:post.labels[0].name", required: "labels[0]" },
];

for (const rel of files) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    failures.push(`${rel}: missing template file`);
    continue;
  }

  const source = fs.readFileSync(abs, "utf8");
  const scopes = parseIfScopes(source);

  for (const check of checks) {
    const tokenRe = new RegExp(check.token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    let match;
    while ((match = tokenRe.exec(source))) {
      const index = match.index;
      const line = lineNumberAt(source, index);
      const scope = findNearestScope(scopes, index);
      if (!scope) {
        failures.push(
          `${rel}:${line} ${check.token} has no surrounding <b:if> guard | ${snippetAt(source, index)}`
        );
        continue;
      }
      const cond = String(scope.cond || "").toLowerCase();
      if (!cond.includes(check.required.toLowerCase())) {
        failures.push(
          `${rel}:${line} ${check.token} guarded by cond='${scope.cond}' (missing ${check.required}) | ${snippetAt(source, index)}`
        );
      }
    }
  }
}

if (failures.length) {
  console.error("VERIFY_BLOGGER_LABEL_GUARDS: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("VERIFY_BLOGGER_LABEL_GUARDS: PASS");
