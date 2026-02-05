const fs = require('fs');

const files = ['index.dev.xml', 'index.prod.xml'];

function stripBom(s) {
  return s.replace(/^\uFEFF/, '');
}

function parse(xml, file) {
  let i = 0;
  const stack = [];
  const len = xml.length;

  function error(msg) {
    throw new Error(file + ': ' + msg + ' at ' + i);
  }

  while (i < len) {
    const lt = xml.indexOf('<', i);
    if (lt === -1) break;
    if (lt > i) i = lt;

    if (xml.startsWith('<!--', i)) {
      const end = xml.indexOf('-->', i + 4);
      if (end === -1) error('unclosed comment');
      i = end + 3;
      continue;
    }
    if (xml.startsWith('<![CDATA[', i)) {
      const end = xml.indexOf(']]>', i + 9);
      if (end === -1) error('unclosed CDATA');
      i = end + 3;
      continue;
    }
    if (xml.startsWith('<?', i)) {
      const end = xml.indexOf('?>', i + 2);
      if (end === -1) error('unclosed PI');
      i = end + 2;
      continue;
    }
    if (xml.startsWith('<!DOCTYPE', i) || xml.startsWith('<!doctype', i)) {
      const end = xml.indexOf('>', i + 2);
      if (end === -1) error('unclosed DOCTYPE');
      i = end + 1;
      continue;
    }

    let j = i + 1;
    let inQuote = null;
    for (; j < len; j++) {
      const ch = xml[j];
      if (inQuote) {
        if (ch === inQuote) inQuote = null;
        continue;
      }
      if (ch === '"' || ch === "'") {
        inQuote = ch;
        continue;
      }
      if (ch === '>') break;
    }
    if (j >= len) error('unclosed tag');

    const raw = xml.slice(i + 1, j).trim();
    i = j + 1;
    if (!raw) continue;
    if (raw[0] === '!' || raw[0] === '?') continue;

    const isClose = raw[0] === '/';
    const isSelf = raw[raw.length - 1] === '/';
    const nameMatch = raw.match(/^\/?\s*([A-Za-z0-9._:-]+)/);
    if (!nameMatch) continue;

    const name = nameMatch[1];
    if (isClose) {
      const last = stack.pop();
      if (last !== name) {
        error('mismatched close: ' + name + ', expected ' + (last || 'none'));
      }
    } else if (!isSelf) {
      stack.push(name);
    }
  }

  if (stack.length) error('unclosed tag: ' + stack[stack.length - 1]);
}

for (const f of files) {
  const xml = stripBom(fs.readFileSync(f, 'utf8'));
  parse(xml, f);
  console.log('OK', f);
}
