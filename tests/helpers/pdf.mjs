// A small reader for the PDFs scripts/generate-resume.mjs writes, so the tests
// can check the deliverable itself without poppler or another dependency.
//
// It understands exactly what PDFKit emits: plain-text object dictionaries,
// FlateDecode streams with a direct /Length, Type0 fonts with a ToUnicode
// CMap, and one BT … ET block per drawn line. It is not a general PDF parser.

import fs from 'node:fs';
import zlib from 'node:zlib';

// Index of the `>>` that closes the dictionary opening at `start`.
function dictEnd(text, start) {
  let depth = 0;
  for (let i = start; i < text.length - 1; i++) {
    if (text[i] === '<' && text[i + 1] === '<') { depth++; i++; }
    else if (text[i] === '>' && text[i + 1] === '>') {
      depth--; i++;
      if (depth === 0) return i + 1;
    }
  }
  throw new Error('unterminated dictionary');
}

function parseObjects(buffer) {
  const text = buffer.toString('latin1');
  const objects = new Map();
  const header = /(\d+) 0 obj\n/g;
  let match;
  while ((match = header.exec(text))) {
    const id = Number(match[1]);
    let at = header.lastIndex;
    let dict = '';
    let stream = null;
    if (text.startsWith('<<', at)) {
      const end = dictEnd(text, at);
      dict = text.slice(at, end);
      at = end;
      const streamStart = text.indexOf('stream\n', at);
      if (streamStart === at + 1) {
        const length = Number(dict.match(/\/Length (\d+)/)[1]);
        const dataStart = streamStart + 'stream\n'.length;
        let data = buffer.subarray(dataStart, dataStart + length);
        if (/\/Filter \/FlateDecode/.test(dict)) data = zlib.inflateSync(data);
        stream = data;
        at = dataStart + length;
      }
    } else {
      dict = text.slice(at, text.indexOf('\nendobj', at));
    }
    objects.set(id, { dict, stream });
    header.lastIndex = text.indexOf('endobj', at) + 'endobj'.length;
  }
  return objects;
}

const ref = (dict, key) => {
  const m = dict.match(new RegExp(`/${key} (\\d+) 0 R`));
  return m ? Number(m[1]) : null;
};

// glyph code (number) -> string, from a ToUnicode CMap.
function parseToUnicode(cmap) {
  const map = new Map();
  const hexToString = (hex) => {
    let out = '';
    for (let i = 0; i < hex.length; i += 4) out += String.fromCharCode(parseInt(hex.slice(i, i + 4), 16));
    return out;
  };
  for (const block of cmap.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    for (const line of block[1].trim().split('\n')) {
      const m = line.match(/<([0-9a-f]+)> <([0-9a-f]+)> (\[.*\]|<[0-9a-f]+>)/i);
      if (!m) continue;
      const lo = parseInt(m[1], 16);
      const hi = parseInt(m[2], 16);
      if (m[3].startsWith('[')) {
        // A ligature glyph maps to several code units: <0066 0069>.
        const targets = [...m[3].matchAll(/<([0-9a-f ]+)>/gi)].map((t) => hexToString(t[1].replaceAll(' ', '')));
        for (let code = lo; code <= hi; code++) map.set(code, targets[code - lo]);
      } else {
        const base = parseInt(m[3].slice(1, -1), 16);
        for (let code = lo; code <= hi; code++) map.set(code, String.fromCharCode(base + code - lo));
      }
    }
  }
  for (const block of cmap.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const m of block[1].matchAll(/<([0-9a-f]+)> <([0-9a-f]+)>/gi)) {
      map.set(parseInt(m[1], 16), hexToString(m[2]));
    }
  }
  return map;
}

/**
 * Read a PDF written by PDFKit.
 *
 * @returns {{
 *   pages: Array<{ lines: Array<{ x: number, y: number, font: string, size: number, text: string, notdef: number }>,
 *                  text: string, links: string[] }>,
 *   structureTypes: string[],
 *   tagged: boolean,
 * }}
 */
export function readPdf(file) {
  const objects = parseObjects(fs.readFileSync(file));
  const catalog = [...objects.values()].find((o) => /\/Type \/Catalog/.test(o.dict));
  const pagesRoot = objects.get(ref(catalog.dict, 'Pages'));
  const kids = [...pagesRoot.dict.match(/\/Kids \[([^\]]*)\]/)[1].matchAll(/(\d+) 0 R/g)].map((m) => Number(m[1]));

  const fontCache = new Map();
  const fontMap = (fontId) => {
    if (!fontCache.has(fontId)) {
      const toUnicode = ref(objects.get(fontId).dict, 'ToUnicode');
      fontCache.set(fontId, toUnicode ? parseToUnicode(objects.get(toUnicode).stream.toString('latin1')) : new Map());
    }
    return fontCache.get(fontId);
  };

  const pages = kids.map((pageId) => {
    const page = objects.get(pageId).dict;
    const resources = objects.get(ref(page, 'Resources')).dict;
    const fonts = Object.fromEntries(
      [...resources.matchAll(/\/(F\d+) (\d+) 0 R/g)].map((m) => [m[1], Number(m[2])])
    );
    const content = objects.get(ref(page, 'Contents')).stream.toString('latin1');

    const lines = [];
    for (const block of content.matchAll(/\nBT\n([\s\S]*?)\nET\n/g)) {
      const body = block[1];
      const tm = body.match(/1 0 0 1 ([\d.-]+) ([\d.-]+) Tm/);
      const tf = body.match(/\/(F\d+) ([\d.]+) Tf/);
      const map = fontMap(fonts[tf[1]]);
      let text = '';
      let notdef = 0;
      for (const hex of body.matchAll(/<([0-9a-f]+)>/gi)) {
        for (let i = 0; i < hex[1].length; i += 4) {
          const code = parseInt(hex[1].slice(i, i + 4), 16);
          if (code === 0) notdef++;
          text += map.get(code) ?? '\uFFFD';
        }
      }
      lines.push({ x: Number(tm[1]), y: Number(tm[2]), font: tf[1], size: Number(tf[2]), text, notdef });
    }

    const annots = page.match(/\/Annots \[([^\]]*)\]/);
    const links = annots
      ? [...annots[1].matchAll(/(\d+) 0 R/g)]
          .map((m) => objects.get(Number(m[1])).dict.match(/\/URI \(([^)]*)\)/))
          .filter(Boolean)
          .map((m) => m[1])
      : [];

    return { lines, text: lines.map((l) => l.text).join('\n'), links };
  });

  const structureTypes = [...objects.values()]
    .map((o) => o.dict.match(/^<<\n\/S \/(\w+)\n/))
    .filter(Boolean)
    .map((m) => m[1]);

  return { pages, structureTypes, tagged: /\/StructTreeRoot \d+ 0 R/.test(catalog.dict) };
}
