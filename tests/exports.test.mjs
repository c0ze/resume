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
