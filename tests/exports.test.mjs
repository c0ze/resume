// Checks on the PDF and DOCX files themselves: they are what a recruiter
// forwards, so a defect in them is a defect in the product (PRODUCT.md,
// "The file is the deliverable"). Run after `npm run build`.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readPdf } from './helpers/pdf.mjs';
import { readZip } from './helpers/zip.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(projectRoot, 'public');
const languages = ['en', 'ja', 'tr'];

const content = (language, section) =>
  JSON.parse(fs.readFileSync(path.join(projectRoot, 'content', language, `${section}.json`), 'utf8'));

// Every generated PDF: the base résumé per language plus the flavours.
const pdfFiles = fs.readdirSync(publicDir).filter((f) => /^resume-.*\.pdf$/.test(f)).sort();
const pdfLanguage = (file) => file.match(/-(en|ja|tr)\.pdf$/)[1];

const pdfCache = new Map();
const pdf = (file) => {
  if (!pdfCache.has(file)) pdfCache.set(file, readPdf(path.join(publicDir, file)));
  return pdfCache.get(file);
};

test('every language has a PDF to check', () => {
  for (const language of languages) assert.ok(pdfFiles.includes(`resume-${language}.pdf`));
});

for (const file of pdfFiles) {
  test(`${file}: the last page carries content, not only the "generated on" footer`, () => {
    const { pages } = pdf(file);
    const generatedOn = content(pdfLanguage(file), 'pdf_meta').generatedOn;
    const last = pages.at(-1).lines;
    const footer = last.filter((line) => line.text.startsWith(generatedOn));
    assert.equal(footer.length, 1, 'expected the footer on the last page');
    assert.ok(
      last.length > footer.length,
      `the last of ${pages.length} pages holds only the footer: a blank page in every printout`
    );
  });
}

// Upper-casing must follow the language: in Turkish i → İ, so a locale-blind
// toUpperCase() prints "İŞ DENEYIMI" and "EĞITIM", a misspelling in the heading.
const docxXml = (file) => readZip(path.join(publicDir, file)).get('word/document.xml');
const docxText = (xml) => [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((m) => m[1]).join('');

test('Turkish section headings are upper-cased the Turkish way', () => {
  const pdfText = pdf('resume-tr.pdf').pages.map((p) => p.text).join('\n');
  const docx = docxText(docxXml('resume-tr.docx'));
  for (const heading of ['İŞ DENEYİMİ', 'EĞİTİM']) {
    assert.ok(pdfText.includes(heading), `expected ${heading} in resume-tr.pdf`);
    assert.ok(docx.includes(heading), `expected ${heading} in resume-tr.docx`);
  }
  assert.doesNotMatch(pdfText, /DENEYIMI|EĞITIM/);
  assert.doesNotMatch(docx, /DENEYIMI|EĞITIM/);
});

// "Generated on" must be unambiguous in every language (11/12 reads as
// 11 December in Turkey and Japan) and must be the build's own date, the one
// the web page prints as "Issued", not the generating machine's clock.
test('the "generated on" date is the ISO date of the build, in the PDF and the DOCX', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'dist/client/index.html'), 'utf8');
  const issued = content('en', 'record').issued;
  const issuedOn = html.match(new RegExp(`${issued}\\s*(?:<!-- -->)?\\s*(\\d{4}-\\d{2}-\\d{2})`))?.[1];
  assert.ok(issuedOn, 'expected the web page to print its ISO issue date');

  for (const file of pdfFiles) {
    const generatedOn = content(pdfLanguage(file), 'pdf_meta').generatedOn;
    const footer = pdf(file).pages.at(-1).lines.find((line) => line.text.startsWith(generatedOn));
    assert.equal(footer?.text, `${generatedOn} ${issuedOn}`, `${file} footer`);
  }
  for (const language of languages) {
    const generatedOn = content(language, 'pdf_meta').generatedOn;
    assert.ok(
      docxText(docxXml(`resume-${language}.docx`)).includes(`${generatedOn} ${issuedOn}`),
      `expected resume-${language}.docx to say "${generatedOn} ${issuedOn}"`
    );
  }
});

// A character the embedded font has no glyph for prints as an empty box
// ("tofu"): "LAME (PCM→MP3)" did, in the en/tr PDFs.
for (const file of pdfFiles) {
  test(`${file}: every character drawn has a glyph in its font`, () => {
    const missing = pdf(file).pages.flatMap((p) => p.lines).filter((line) => line.notdef > 0);
    assert.deepEqual(missing.map((line) => line.text), []);
  });
}

// A wrapped bullet must hang: its second and later lines align with the text
// after the bullet, not with the bullet or the left margin, or the list reads
// as one block of prose.
for (const file of pdfFiles) {
  test(`${file}: wrapped bullet lines hang-indent past the bullet`, () => {
    const lines = pdf(file).pages.flatMap((p) => p.lines);
    let bullets = 0;
    for (const [i, marker] of lines.entries()) {
      if (!marker.text.startsWith('•')) continue;
      bullets++;
      for (const line of lines.slice(i + 1)) {
        if (line.text.startsWith('•') || line.font !== marker.font || line.size !== marker.size) break;
        assert.ok(
          line.x > marker.x,
          `"${line.text.slice(0, 40)}…" starts at x=${line.x}, left of its bullet at x=${marker.x}`
        );
      }
    }
    assert.ok(bullets > 10, 'expected the experience and skills bullets');
  });
}
