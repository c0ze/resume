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
import { fieldLabel } from '../scripts/labels.mjs';

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
    const generatedOn = fieldLabel(content(pdfLanguage(file), 'pdf_meta').generatedOn).trim();
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

  // The label goes through fieldLabel like the other labels: "作成日：" plus
  // a space printed a full-width colon and a space, a double gap.
  for (const file of pdfFiles) {
    const generatedOn = fieldLabel(content(pdfLanguage(file), 'pdf_meta').generatedOn);
    const footer = pdf(file).pages.at(-1).lines.find((line) => line.text.startsWith(generatedOn.trim()));
    assert.equal(footer?.text, `${generatedOn}${issuedOn}`, `${file} footer`);
    assert.doesNotMatch(footer.text, /：\s/, `${file}: full-width colon followed by a space`);
  }
  for (const language of languages) {
    const generatedOn = fieldLabel(content(language, 'pdf_meta').generatedOn);
    assert.ok(
      docxText(docxXml(`resume-${language}.docx`)).includes(`${generatedOn}${issuedOn}`),
      `expected resume-${language}.docx to say "${generatedOn}${issuedOn}"`
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

// The email and the website are printed on every résumé; a reader expects to
// click them, in the PDF and in Word.
test('the printed email and website are links in the PDF and the DOCX', () => {
  for (const language of languages) {
    const { contactViaEmail, website } = content(language, 'header');
    const expected = [`mailto:${contactViaEmail}`, website];

    const links = pdf(`resume-${language}.pdf`).pages[0].links;
    for (const url of expected) assert.ok(links.includes(url), `resume-${language}.pdf: expected a link to ${url}`);

    const zip = readZip(path.join(publicDir, `resume-${language}.docx`));
    const rels = zip.get('word/_rels/document.xml.rels');
    const xml = zip.get('word/document.xml');
    for (const url of expected) {
      const id = rels.match(new RegExp(`Id="([^"]+)"[^>]*Target="${url}"[^>]*TargetMode="External"`))?.[1]
        ?? rels.match(new RegExp(`Target="${url}"[^>]*Id="([^"]+)"`))?.[1];
      assert.ok(id, `resume-${language}.docx: expected an external relationship to ${url}`);
      assert.match(xml, new RegExp(`<w:hyperlink [^>]*r:id="${id}"`), `resume-${language}.docx: expected a hyperlink to ${url}`);
    }
  }
});

// Word and ATS parsers read the DOCX's metadata, its language (for proofing
// and hyphenation) and its heading styles (for the outline). They should say
// what the PDF says.
test('each DOCX carries the PDF metadata, its language and real section headings', () => {
  const runLanguage = { en: 'en-US', ja: 'ja-JP', tr: 'tr-TR' };
  for (const language of languages) {
    const zip = readZip(path.join(publicDir, `resume-${language}.docx`));
    const meta = content(language, 'pdf_meta');
    const core = zip.get('docProps/core.xml');
    assert.ok(core.includes(`<dc:title>${meta.title}</dc:title>`), `${language}: title`);
    assert.ok(core.includes(`<dc:subject>${meta.subject}</dc:subject>`), `${language}: subject`);
    assert.ok(core.includes(`<cp:keywords>${meta.keywords}</cp:keywords>`), `${language}: keywords`);
    assert.ok(core.includes(`<cp:lastModifiedBy>${meta.author}</cp:lastModifiedBy>`), `${language}: lastModifiedBy`);

    const defaults = zip.get('word/styles.xml').match(/<w:docDefaults>[\s\S]*?<\/w:docDefaults>/)[0];
    assert.match(defaults, new RegExp(`<w:lang [^>]*w:val="${runLanguage[language]}"`), `${language}: run language`);

    const xml = zip.get('word/document.xml');
    const headings = [...xml.matchAll(/<w:p>(?:(?!<\/w:p>)[\s\S])*?<w:pStyle w:val="Heading1"\/>[\s\S]*?<\/w:p>/g)]
      .map((m) => docxText(m[0]));
    const titles = ['about', 'experience', 'skills', 'projects', 'education'].map((s) => content(language, s).title);
    assert.deepEqual(
      headings,
      titles.map((title) => (language === 'ja' ? title : title.toLocaleUpperCase(language))),
      `${language}: section headings use the Heading 1 style`
    );
  }
});

// The PDFs are created tagged (MarkInfo /Marked true), which promises screen
// readers and reflow a structure tree. It must not be empty.
for (const file of pdfFiles) {
  test(`${file}: the tagged PDF has a real structure tree`, () => {
    const { tagged, structureTypes } = pdf(file);
    assert.ok(tagged, 'expected a StructTreeRoot');
    const count = (type) => structureTypes.filter((t) => t === type).length;
    assert.equal(count('Document'), 1);
    assert.equal(count('H1'), 1, 'the name');
    assert.equal(count('H2'), 5, 'one per section');
    assert.ok(count('L') >= 3, 'the responsibility, skill and paper lists');
    assert.ok(count('LI') > 10 && count('LI') === count('LBody'), 'list items with bodies');
    assert.ok(count('P') > 10, 'paragraphs');
  });
}

// JSON Resume's education.url is the institution's website. The thesis repo
// is not that, and the papers belong in `publications`.
test('the JSON Resume lists the papers as publications and no thesis repo as a school URL', () => {
  for (const language of languages) {
    const resume = JSON.parse(fs.readFileSync(path.join(publicDir, `resume-${language}.json`), 'utf8'));
    for (const entry of resume.education) {
      assert.doesNotMatch(entry.url ?? '', /github\.com/, `${language}: ${entry.institution} url`);
    }
    const papers = content(language, 'education').entries.flatMap((e) => e.additionalInfo?.items ?? []);
    assert.equal(resume.publications?.length, papers.length, `${language}: one publication per paper`);
    for (const publication of resume.publications) {
      assert.match(publication.releaseDate, /^\d{4}$/);
      assert.ok(publication.name && publication.publisher, `${language}: name and publisher`);
      assert.ok(!publication.name.includes('('), `${language}: the venue is not part of the title`);
    }
  }
});

// The subtitle is the role the recruiter files the résumé under. A centred
// subtitle that wraps breaks mid-word in Japanese ("…AIプラット" / "フォーム")
// and reads as two lines of unrelated text.
for (const file of pdfFiles) {
  test(`${file}: the subtitle is one line`, () => {
    const lines = pdf(file).pages[0].lines;
    const email = content(pdfLanguage(file), 'header').contactViaEmail;
    const contact = lines.findIndex((line) => line.text.includes(email));
    assert.ok(contact > 1, 'expected the name, the subtitle, then the contact line');
    const subtitle = lines.slice(1, contact).map((line) => line.text);
    assert.equal(subtitle.length, 1, `the subtitle wraps: ${subtitle.join(' / ')}`);
  });
}

// A bullet or a description that breaks across pages must not leave one line
// alone ("generated charts." opening page 2), and a short one (up to four
// lines) must not break at all: the reader has to turn the page mid-sentence
// for a line or two.
for (const file of pdfFiles) {
  test(`${file}: no short block, and no single line of a block, is split across pages`, () => {
    const { pages } = pdf(file);
    const same = (a, b) => a.font === b.font && a.size === b.size && a.x === b.x;
    for (let p = 1; p < pages.length; p++) {
      const before = pages[p - 1].lines;
      const after = pages[p].lines;
      const last = before.at(-1);
      // A block continues when the new page opens with a line of the same
      // font, size and indent as the last one, and not with a new bullet.
      if (after[0].text === '•' || !same(after[0], last)) continue;
      // Lines of the block on the page before: back to its bullet, or to a
      // line in another font or indent (a project's technologies).
      let tail = 0;
      for (let i = before.length - 1; i >= 0 && same(before[i], last); i--) {
        tail++;
        if (before[i - 1]?.text === '•') break;
      }
      let head = 0;
      while (head < after.length && after[head].text !== '•' && same(after[head], last)) head++;
      const where = `${file} p${p}-p${p + 1}: "${last.text.slice(0, 30)}…" / "${after[0].text.slice(0, 30)}…"`;
      assert.ok(tail + head > 4, `${where}: a ${tail + head}-line block breaks across pages`);
      assert.ok(tail > 1 && head > 1, `${where}: ${tail} line(s) before the break, ${head} after`);
    }
  });
}

// The spoken-languages block wraps to two lines in Japanese; it must use the
// line spacing of the paragraphs above it, not PDFKit's tighter default.
test('resume-ja.pdf: the languages block has the paragraphs\' line spacing', () => {
  const lines = pdf('resume-ja.pdf').pages[0].lines;
  const label = fieldLabel(content('ja', 'about').languages).trim();
  const at = lines.findIndex((line) => line.text.startsWith(label));
  assert.ok(at > 2, 'expected the languages label after the About paragraphs');
  const step = (i) => Math.round((lines[i].y - lines[i + 1].y) * 10) / 10;
  // The label and its text are drawn as two runs on the first line.
  const next = lines.findIndex((line, i) => i > at && line.y < lines[at].y);
  assert.ok(next > at, 'expected the languages block to wrap in Japanese');
  assert.equal(Math.round((lines[at].y - lines[next].y) * 10) / 10, step(at - 2), 'languages vs paragraph line step');
});

// Word moves a paragraph marked keepNext to the next page with the one after
// it. Without it a project's title and technologies, or "Selected Papers:",
// can end a page with their description or first paper on the next.
test('each DOCX keeps project headings and "Selected Papers:" with what follows', () => {
  for (const language of languages) {
    const xml = docxXml(`resume-${language}.docx`);
    const paragraphs = [...xml.matchAll(/<w:p>[\s\S]*?<\/w:p>/g)].map((m) => m[0]);
    const unescape = (s) => s.replace(/&(apos|quot|lt|gt|amp);/g, (_, e) => ({ apos: "'", quot: '"', lt: '<', gt: '>', amp: '&' })[e]);
    const keeps = (text) => {
      const p = paragraphs.find((para) => unescape(docxText(para)) === text);
      assert.ok(p, `${language}: expected a paragraph "${text}"`);
      return /<w:keepNext\/>/.test(p);
    };
    for (const project of content(language, 'projects').entries) {
      assert.ok(keeps(project.title), `${language}: "${project.title}" keeps with next`);
      assert.ok(keeps(project.technologies), `${language}: technologies of "${project.title}" keep with next`);
    }
    for (const entry of content(language, 'education').entries) {
      if (entry.additionalInfo?.title) assert.ok(keeps(entry.additionalInfo.title), `${language}: papers heading`);
    }
  }
});

// The bottom of a page must not be a heading (a section, a job, a project, a
// degree or "Selected Papers:") whose content starts on the next page, and
// the top of a page must not be the last item of a list on its own, cut off
// from the rest of its list. Bullets and paragraphs are in the bullet font
// (the font of the "•" lines) or the About body text; anything else at the
// foot of a page is a heading.
for (const file of pdfFiles) {
  test(`${file}: no heading ends a page, and no list's last item starts one alone`, () => {
    const { pages } = pdf(file);
    const bullet = pages.flatMap((p) => p.lines).find((line) => line.text === '•');
    const body = (line) => line.font === bullet.font && (line.size === bullet.size || line.size === 10) && !line.text.startsWith('  —  ');
    for (let p = 0; p < pages.length - 1; p++) {
      const last = pages[p].lines.at(-1);
      assert.ok(body(last), `page ${p + 1} ends with a heading: "${last.text.slice(0, 40)}"`);
    }
    for (let p = 1; p < pages.length; p++) {
      const lines = pages[p].lines;
      if (lines[0].text !== '•') continue;
      // The first item's lines, then whatever follows it on the page.
      let next = 1;
      while (next < lines.length && lines[next].text !== '•' && lines[next].font === lines[1].font && lines[next].x === lines[1].x) next++;
      const listGoesOn = next < lines.length && lines[next].text === '•';
      const continued = pages[p - 1].lines.at(-1).x === lines[1].x;
      assert.ok(listGoesOn || !continued, `page ${p + 1} opens with the last item of a list alone: "${lines[1].text.slice(0, 40)}"`);
    }
  });
}

// Every bullet is drawn in the body colour, on whichever page it lands: a
// page started by hand begins in black unless the colour is set again.
for (const file of pdfFiles) {
  test(`${file}: bullets keep their colour across page breaks`, () => {
    const lines = pdf(file).pages.flatMap((p) => p.lines);
    const bullets = lines.filter((line) => line.text === '•');
    assert.deepEqual([...new Set(bullets.map((line) => line.colour))], ['45,45,45'], 'every bullet in #2d2d2d');
  });
}

// The gap above "Selected Papers:" is a fraction (0.15) of the line height of
// the description it follows, measured and drawn in that font. (It used to
// be drawn in the bold title font after being measured in the regular one;
// Noto Serif's regular and bold share their line height, so the PDFs did not
// show it, but the fallback fonts would.)
test('resume-en.pdf: the gap above "Selected Papers:" is 0.15 of the description line height', async () => {
  const { default: PDFDocument } = await import('pdfkit');
  const probe = new PDFDocument({ autoFirstPage: true });
  const metrics = (file) => {
    probe.font(path.join(publicDir, 'fonts', file)).fontSize(9.5);
    return { lineHeight: probe.currentLineHeight(true), ascender: (probe._font.ascender / 1000) * 9.5 };
  };
  const regular = metrics('NotoSerif-Regular.ttf');
  const bold = metrics('NotoSerif-Bold.ttf');

  const lines = pdf('resume-en.pdf').pages.flatMap((p) => p.lines);
  const papers = content('en', 'education').entries.find((e) => e.additionalInfo).additionalInfo.title;
  const at = lines.findIndex((line) => line.text === papers);
  const [before, last, title] = [lines[at - 2], lines[at - 1], lines[at]];
  const step = before.y - last.y; // the description's line step
  // PDF y runs upwards and marks the baseline-ish origin: undo the ascender difference.
  const gap = last.y - title.y - (bold.ascender - regular.ascender) - step;
  assert.ok(Math.abs(gap - 0.15 * regular.lineHeight) < 0.01, `gap ${gap.toFixed(3)} vs ${(0.15 * regular.lineHeight).toFixed(3)}`);
});
