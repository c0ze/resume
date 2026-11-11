import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { applyFlavor, artifactBase, flavorTargets } from './flavors.mjs';
import { issueDate, missingGlyphs, sanitizeContent, withGlyphFallbacks } from './export-text.mjs';
import { fieldLabel, splitSpokenLanguages } from './labels.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function loadContent(language, section) {
  const filePath = path.join(projectRoot, 'content', language, `${section}.json`);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error loading content file: ${filePath}`, error);
    return {};
  }
}

// ── Layout constants ────────────────────────────────────────────────
const PAGE = {
  size: 'A4',
  margin: { top: 72, bottom: 60, left: 72, right: 72 },
};

const COLOR = {
  black: '#1a1a1a',
  dark: '#2d2d2d',
  mid: '#555555',
  light: '#888888',
  rule: '#cccccc',
};

const SIZE = {
  name: 22,
  subtitle: 11,
  contact: 9,
  sectionTitle: 11,
  jobTitle: 10.5,
  company: 10,
  period: 9,
  body: 10,
  bullet: 9.5,
  footer: 8,
};

// ── Font setup ──────────────────────────────────────────────────────
const fontDir = path.join(projectRoot, 'public', 'fonts');

function setupFonts(doc, language) {
  const fonts = { regular: 'Helvetica', bold: 'Helvetica-Bold', italic: 'Helvetica-Oblique' };

  if (language === 'ja') {
    // Noto Serif CJK JP — proper bold weight for visual hierarchy
    const serifJP = path.join(fontDir, 'NotoSerifCJKJP-Regular.ttf');
    const serifJPBold = path.join(fontDir, 'NotoSerifCJKJP-Bold.ttf');
    const sansJP = path.join(fontDir, 'NotoSansCJKJP-Regular.ttf');
    const sansJPBold = path.join(fontDir, 'NotoSansCJKJP-Bold.ttf');

    if (fs.existsSync(serifJP) && fs.existsSync(serifJPBold)) {
      doc.registerFont('NotoSerifJP', serifJP);
      doc.registerFont('NotoSerifJP-Bold', serifJPBold);
      fonts.regular = 'NotoSerifJP';
      fonts.bold = 'NotoSerifJP-Bold';
      fonts.italic = 'NotoSerifJP'; // no italic in CJK
    }
    if (fs.existsSync(sansJP) && fs.existsSync(sansJPBold)) {
      doc.registerFont('NotoSansJP', sansJP);
      doc.registerFont('NotoSansJP-Bold', sansJPBold);
      fonts.sansRegular = 'NotoSansJP';
      fonts.sansBold = 'NotoSansJP-Bold';
    }
    console.log(`[ja] Using Noto Serif CJK JP + Noto Sans CJK JP`);
  } else {
    // Noto Serif for body text — professional, readable serif
    const serifRegular = path.join(fontDir, 'NotoSerif-Regular.ttf');
    const serifBold = path.join(fontDir, 'NotoSerif-Bold.ttf');
    const serifItalic = path.join(fontDir, 'NotoSerif-Italic.ttf');
    // Noto Sans for headings — clean contrast
    const sansRegular = path.join(fontDir, 'NotoSans-Regular.ttf');
    const sansBold = path.join(fontDir, 'NotoSans-Bold.ttf');

    if (fs.existsSync(serifRegular) && fs.existsSync(serifBold)) {
      doc.registerFont('NotoSerif', serifRegular);
      doc.registerFont('NotoSerif-Bold', serifBold);
      if (fs.existsSync(serifItalic)) doc.registerFont('NotoSerif-Italic', serifItalic);
      fonts.regular = 'NotoSerif';
      fonts.bold = 'NotoSerif-Bold';
      fonts.italic = fs.existsSync(serifItalic) ? 'NotoSerif-Italic' : 'NotoSerif';
    }
    if (fs.existsSync(sansRegular) && fs.existsSync(sansBold)) {
      doc.registerFont('NotoSans', sansRegular);
      doc.registerFont('NotoSans-Bold', sansBold);
      fonts.sansRegular = 'NotoSans';
      fonts.sansBold = 'NotoSans-Bold';
    }
    console.log(`[${language}] Using Noto Serif + Noto Sans`);
  }

  return fonts;
}

// Fail the build instead of shipping tofu: every string drawn must have a
// glyph for each character in the font it is drawn in. (Standard PDF fonts,
// used only when the Noto files are missing, carry no fontkit font and are
// not checked.)
function guardGlyphs(doc, language) {
  const text = doc.text.bind(doc);
  doc.text = (str, ...rest) => {
    const font = doc._font?.font;
    if (typeof font?.hasGlyphForCodePoint === 'function') {
      const missing = missingGlyphs(font, str);
      if (missing.length > 0) {
        const codes = missing.map((c) => `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')} "${c}"`);
        throw new Error(`[${language}] ${doc._font.name} has no glyph for ${codes.join(', ')} in: ${str}`);
      }
    }
    return text(str, ...rest);
  };
}

// ── Generator ───────────────────────────────────────────────────────
function generateResume(language, flavor = null) {
  const base = {
    header: loadContent(language, 'header'),
    about: loadContent(language, 'about'),
    experience: loadContent(language, 'experience'),
    education: loadContent(language, 'education'),
    skills: loadContent(language, 'skills'),
    projects: loadContent(language, 'projects'),
    pdf: loadContent(language, 'pdf_meta'),
  };
  const raw = flavor ? applyFlavor(base, flavor, language) : base;
  // Strip CJK from EN/TR since those fonts don't support Japanese characters,
  // and spell out the few other characters they have no glyph for.
  const t = language === 'ja' ? raw : withGlyphFallbacks(sanitizeContent(raw));

  const doc = new PDFDocument({
    size: PAGE.size,
    margins: PAGE.margin,
    info: {
      Title: t.pdf.title || `Resume - ${language.toUpperCase()}`,
      Author: t.pdf.author || 'Arda Karaduman',
      Subject: t.pdf.subject || 'Resume',
      Keywords: t.pdf.keywords || 'resume',
    },
    lang: language,
    pdfVersion: '1.7',
    tagged: true,
    displayTitle: true,
    autoFirstPage: true,
    fontSubsetting: language !== 'ja',
  });

  const outputFile = path.join(projectRoot, 'public', `${artifactBase(flavor?.name, language)}.pdf`);
  const stream = fs.createWriteStream(outputFile);
  doc.pipe(stream);

  const fonts = setupFonts(doc, language);
  guardGlyphs(doc, language);
  const contentWidth = doc.page.width - PAGE.margin.left - PAGE.margin.right;

  // Use sans-serif for headings (or same font for JA)
  const headingFont = fonts.sansBold || fonts.bold;
  const headingRegular = fonts.sansRegular || fonts.regular;
  // Japanese text needs more vertical breathing room (single-weight font, dense glyphs)
  const lineGap = language === 'ja' ? 6 : 2;
  const bulletGap = language === 'ja' ? 5 : 1;

  // ── Helpers ─────────────────────────────────────────────────────
  // Centre across the content width: a box sized to widthOfString() is too
  // tight for CJK, where PDFKit's line breaker can wrap the last character.
  function textCenter(text, options = {}) {
    doc.x = PAGE.margin.left;
    doc.text(text, { width: contentWidth, align: 'center', ...options });
  }

  function drawRule() {
    const y = doc.y;
    doc.strokeColor(COLOR.rule).lineWidth(0.5)
       .moveTo(PAGE.margin.left, y)
       .lineTo(doc.page.width - PAGE.margin.right, y)
       .stroke();
    doc.y = y + 6;
  }

  function sectionHeader(title) {
    // Reserve enough for the header + rule + first entry (title, subtitle, period, ~2 lines).
    // This prevents the section header from rendering at the bottom of a page
    // with the first entry breaking onto the next page.
    ensureSpace(200);
    doc.font(headingFont).fontSize(SIZE.sectionTitle).fillColor(COLOR.black);
    doc.x = PAGE.margin.left;
    doc.text(title.toLocaleUpperCase(language), { width: contentWidth, characterSpacing: 1.5 });
    doc.moveDown(0.15);
    drawRule();
    doc.moveDown(0.15);
  }

  function ensureSpace(needed) {
    if (doc.y + needed > doc.page.height - PAGE.margin.bottom) {
      doc.addPage();
    }
  }

  // A bulleted item with a hanging indent: the bullet sits 10pt in, and every
  // line of the text, wrapped ones included, starts where the first line's
  // text does. Drawn in the current font, size and colour.
  function bulletItem(text) {
    ensureSpace(20); // keep the bullet and its first line on the same page
    const y = doc.y;
    const bulletX = PAGE.margin.left + 10;
    const textX = bulletX + doc.widthOfString('•  ');
    const right = PAGE.margin.left + contentWidth - 10;
    doc.text('•', bulletX, y, { lineBreak: false });
    doc.text(text, textX, y, { width: right - textX, lineGap: bulletGap });
    doc.x = PAGE.margin.left;
  }

  // ── Header ──────────────────────────────────────────────────────
  doc.y = PAGE.margin.top;

  // Name
  doc.font(headingFont).fontSize(SIZE.name).fillColor(COLOR.black);
  textCenter(t.header.title);
  doc.moveDown(0.2);

  // Subtitle
  doc.font(fonts.italic || fonts.regular).fontSize(SIZE.subtitle).fillColor(COLOR.mid);
  textCenter(t.header.subtitle);
  doc.moveDown(0.4);

  // Contact line: location · email · website
  doc.font(headingRegular).fontSize(SIZE.contact).fillColor(COLOR.dark);
  const sep = '   ·   ';
  const contactStr = `${t.header.location}${sep}${t.header.contactViaEmail}${sep}${t.header.website}`;
  textCenter(contactStr);
  doc.moveDown(0.6);

  drawRule();
  doc.moveDown(0.3);

  // ── About ───────────────────────────────────────────────────────
  sectionHeader(t.about.title);

  doc.font(fonts.regular).fontSize(SIZE.body).fillColor(COLOR.dark);
  doc.x = PAGE.margin.left;
  if (t.about.paragraph1) {
    doc.text(t.about.paragraph1, { width: contentWidth, lineGap });
    doc.moveDown(0.3);
  }
  if (t.about.paragraph2) {
    doc.x = PAGE.margin.left;
    doc.text(t.about.paragraph2, { width: contentWidth, lineGap });
    doc.moveDown(0.3);
  }

  // Languages
  doc.x = PAGE.margin.left;
  doc.font(fonts.bold).fontSize(SIZE.body).fillColor(COLOR.black);
  const languagesLabel = fieldLabel(t.about.languages);
  const labelWidth = doc.widthOfString(languagesLabel);
  doc.text(languagesLabel, { continued: true, width: contentWidth });
  doc.font(fonts.regular).fillColor(COLOR.dark);
  // Break only between languages, never inside one: left to PDFKit, a long
  // line splits "Japanese" from its bracket, or "JLPT 2" from "級" in Japanese.
  const languageSep = language === 'ja' ? '、' : ', ';
  const languageLines = [];
  for (const entry of splitSpokenLanguages(t.about.languagesContent)) {
    const last = languageLines.length - 1;
    const room = contentWidth - (last <= 0 ? labelWidth : 0) - 2;
    const joined = last >= 0 ? languageLines[last] + languageSep + entry : null;
    if (joined !== null && doc.widthOfString(joined) <= room) languageLines[last] = joined;
    else languageLines.push(entry);
  }
  doc.text(languageLines.join(languageSep.trimEnd() + '\n'), { width: contentWidth });
  doc.moveDown(0.5);

  // ── Experience ──────────────────────────────────────────────────
  sectionHeader(t.experience.title);

  if (Array.isArray(t.experience.jobs)) {
    t.experience.jobs.forEach((job, i) => {
      ensureSpace(60);

      // Job title — Company | Period (on same line)
      doc.x = PAGE.margin.left;
      doc.font(fonts.bold).fontSize(SIZE.jobTitle).fillColor(COLOR.black);
      doc.text(job.title, { continued: true, width: contentWidth });

      doc.font(fonts.regular).fontSize(SIZE.company).fillColor(COLOR.mid);
      doc.text(`  —  ${job.company}`, { width: contentWidth });

      doc.x = PAGE.margin.left;
      doc.font(fonts.italic || fonts.regular).fontSize(SIZE.period).fillColor(COLOR.light);
      doc.text(job.period, { width: contentWidth });
      doc.moveDown(0.15);

      // Responsibilities
      if (Array.isArray(job.responsibilities)) {
        doc.font(fonts.regular).fontSize(SIZE.bullet).fillColor(COLOR.dark);
        for (const item of job.responsibilities) bulletItem(item);
      }

      if (i < t.experience.jobs.length - 1) doc.moveDown(0.4);
    });
  }
  doc.moveDown(0.3);

  // ── Skills ──────────────────────────────────────────────────────
  sectionHeader(t.skills.title);

  if (Array.isArray(t.skills.technicalSkills)) {
    doc.font(fonts.regular).fontSize(SIZE.bullet).fillColor(COLOR.dark);
    for (const skill of t.skills.technicalSkills) bulletItem(skill);
  }
  doc.moveDown(0.3);

  // ── Projects ────────────────────────────────────────────────────
  sectionHeader(t.projects.title);

  if (Array.isArray(t.projects.entries)) {
    t.projects.entries.forEach((project, i) => {
      ensureSpace(40);

      doc.x = PAGE.margin.left;
      doc.font(fonts.bold).fontSize(SIZE.jobTitle).fillColor(COLOR.black);
      doc.text(project.title, { width: contentWidth });

      doc.x = PAGE.margin.left;
      doc.font(fonts.italic || fonts.regular).fontSize(SIZE.period).fillColor(COLOR.light);
      doc.text(project.technologies, { width: contentWidth });
      doc.moveDown(0.1);

      if (project.description) {
        doc.x = PAGE.margin.left;
        doc.font(fonts.regular).fontSize(SIZE.bullet).fillColor(COLOR.dark);
        doc.text(project.description, { width: contentWidth, lineGap: bulletGap });
      }

      if (i < t.projects.entries.length - 1) doc.moveDown(0.3);
    });
  }
  doc.moveDown(0.3);

  // ── Education ───────────────────────────────────────────────────
  sectionHeader(t.education.title);

  if (Array.isArray(t.education.entries)) {
    t.education.entries.forEach((edu, i) => {
      ensureSpace(50);

      doc.x = PAGE.margin.left;
      doc.font(fonts.bold).fontSize(SIZE.jobTitle).fillColor(COLOR.black);
      doc.text(edu.degree, { continued: true, width: contentWidth });

      doc.font(fonts.regular).fontSize(SIZE.company).fillColor(COLOR.mid);
      doc.text(`  —  ${edu.institution}`, { width: contentWidth });

      doc.x = PAGE.margin.left;
      doc.font(fonts.italic || fonts.regular).fontSize(SIZE.period).fillColor(COLOR.light);
      doc.text(edu.period, { width: contentWidth });

      if (edu.description) {
        doc.moveDown(0.1);
        doc.x = PAGE.margin.left;
        doc.font(fonts.regular).fontSize(SIZE.bullet).fillColor(COLOR.dark);
        doc.text(edu.description, { width: contentWidth, lineGap: bulletGap });
      }

      if (edu.additionalInfo && Array.isArray(edu.additionalInfo.items)) {
        doc.moveDown(0.15);
        doc.x = PAGE.margin.left;
        doc.font(fonts.bold).fontSize(SIZE.bullet).fillColor(COLOR.black);
        doc.text(edu.additionalInfo.title, { width: contentWidth });
        doc.font(fonts.regular).fontSize(SIZE.bullet).fillColor(COLOR.dark);
        for (const item of edu.additionalInfo.items) bulletItem(item);
      }

      if (i < t.education.entries.length - 1) doc.moveDown(0.4);
    });
  }

  // ── Footer ──────────────────────────────────────────────────────
  // The footer sits in the bottom margin of the last content page. PDFKit
  // starts a new page for any line that crosses the margin, so the margin is
  // lifted while the footer is written and put back afterwards.
  const footerText = `${t.pdf.generatedOn} ${issueDate()}`;
  const bottomMargin = doc.page.margins.bottom;
  const footerY = doc.page.height - bottomMargin + 10;
  doc.font(headingRegular).fontSize(SIZE.footer).fillColor(COLOR.light);
  doc.page.margins.bottom = 0;
  doc.text(footerText, PAGE.margin.left, footerY, { width: contentWidth, align: 'center' });
  doc.page.margins.bottom = bottomMargin;

  // Finalize
  try {
    doc.end();
    console.log(`[${language}] Finalizing PDF: ${outputFile}`);
  } catch (e) {
    console.error(`[${language}] Error during doc.end():`, e);
  }

  stream.on('finish', () => console.log(`[${language}] Successfully generated: ${outputFile}`));
  stream.on('error', (err) => console.error(`[${language}] Error writing PDF:`, err));
}

// ── Run ─────────────────────────────────────────────────────────────
console.log('Starting resume generation...');
generateResume('en');
generateResume('ja');
generateResume('tr');
for (const { flavor, language } of flavorTargets()) generateResume(language, flavor);
console.log('Resume generation complete.');
