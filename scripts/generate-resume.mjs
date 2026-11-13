import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadContent } from './content.mjs';
import { applyFlavor, artifactBase, flavorTargets } from './flavors.mjs';
import { issueDate, missingGlyphs, sanitizeContent, withGlyphFallbacks } from './export-text.mjs';
import { fieldLabel, splitSpokenLanguages } from './labels.mjs';
import { fitFontSize, linesThatFit, planList } from './pdf-layout.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// ── Layout constants ────────────────────────────────────────────────
const PAGE = {
  size: 'A4',
  margin: { top: 72, bottom: 60, left: 72, right: 72 },
};

const COLOR = {
  black: '#1a1a1a',
  dark: '#2d2d2d',
  mid: '#555555',
  light: '#595959', // 7:1 on white; #888888 was 3.5:1 at 8-9pt
  rule: '#cccccc',
};

const SIZE = {
  name: 22,
  subtitle: 11,
  subtitleMin: 9.5,
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

  // ── Structure ───────────────────────────────────────────────────
  // The PDF is tagged, so everything drawn goes into the structure tree:
  // Document > H1 (name), H2 (sections), H3 (entries), P, L > LI > Lbl/LBody.
  // Rules and the footer are marked as artifacts. Tags add marked-content
  // operators only; they do not change what is drawn.
  const root = doc.struct('Document');
  doc.addStructure(root);

  // Draw into a leaf element (`draw` runs at once, inside its marked content).
  function tag(type, draw, parent = root) {
    parent.add(doc.struct(type, draw));
  }

  // A container element (L, LI) filled by `fill(element)`.
  function group(type, fill, parent = root) {
    const element = doc.struct(type);
    parent.add(element);
    fill(element);
    element.end();
  }

  function artifact(draw, options = undefined) {
    doc.markContent('Artifact', options);
    draw();
    doc.endMarkedContent();
  }

  // ── Helpers ─────────────────────────────────────────────────────
  // Centre across the content width: a box sized to widthOfString() is too
  // tight for CJK, where PDFKit's line breaker can wrap the last character.
  function textCenter(text, options = {}) {
    doc.x = PAGE.margin.left;
    doc.text(text, { width: contentWidth, align: 'center', ...options });
  }

  function drawRule() {
    const y = doc.y;
    artifact(() => {
      doc.strokeColor(COLOR.rule).lineWidth(0.5)
         .moveTo(PAGE.margin.left, y)
         .lineTo(doc.page.width - PAGE.margin.right, y)
         .stroke();
    });
    doc.y = y + 6;
  }

  // ── Pagination ──────────────────────────────────────────────────
  // Every page break is decided here rather than left to PDFKit, which breaks
  // a block wherever the page ends. scripts/pdf-layout.mjs makes the
  // decisions (tested in tests/pdf-layout.test.mjs): a block of up to four
  // lines is never broken, a longer one keeps two lines on each side of a
  // break, the last item of a list does not start a page alone, and a
  // heading moves to the next page when the block under it would.
  const pageBottom = () => doc.page.height - PAGE.margin.bottom;
  const atTop = () => doc.y <= PAGE.margin.top + 0.01;

  // A new page that carries any open marked content (a tagged element drawn
  // across the break) and the fill colour over, as PDFKit's own breaks do.
  function newPage() {
    doc.continueOnNewPage();
    if (doc._fillColor) doc.fillColor(...doc._fillColor);
  }

  // The lines PDFKit wraps `text` into in the current font and size: the dry
  // run heightOfString makes, collecting each line. They rejoin to `text`.
  function wrapLines(text, options) {
    const { x, y } = doc;
    const lines = [];
    doc._text(text, x, y, { ...options, height: Infinity }, (line) => lines.push(line));
    doc.x = x;
    doc.y = y;
    return lines;
  }

  // A block of text in the current font: its lines and line metrics.
  function textBlock(text, options) {
    const lineHeight = doc.currentLineHeight(true);
    return { options, lines: wrapLines(text, options), lineHeight, step: lineHeight + (options.lineGap ?? 0) };
  }

  // Plans for a run of blocks in one font (a list, or one paragraph) that
  // starts `lead` points below the cursor; see planList.
  function planRun(blocks, lead = 0) {
    const { lineHeight, step } = blocks[0];
    const fit = linesThatFit(pageBottom() - doc.y - lead, lineHeight, step);
    const capacity = linesThatFit(pageBottom() - PAGE.margin.top, lineHeight, step);
    return planList(blocks.map((b) => b.lines.length), fit, capacity, atTop());
  }

  // Before a heading `lead` points tall: a new page when the blocks under it
  // would not start on this one (or, with nothing under it, when it does
  // not fit).
  function keepWithNext(lead, blocks) {
    if (atTop()) return;
    if (blocks.length === 0 ? doc.y + lead > pageBottom() : planRun(blocks, lead)[0][0] === 0) newPage();
  }

  // Start a planned block: a leading 0 is a new page. Returns the rest.
  function startPlanned(plan) {
    if (plan[0] !== 0) return plan;
    newPage();
    return plan.slice(1);
  }

  // Draw a block's lines page by page, `segments` lines at a time, at x from y.
  function drawSegments(block, x, y, segments) {
    let from = 0;
    segments.forEach((count, i) => {
      if (i > 0) newPage();
      doc.text(block.lines.slice(from, from + count).join(''), x, i === 0 ? y : doc.y, block.options);
      from += count;
    });
  }

  // A paragraph drawn as planned, at the left margin.
  function paragraph(block) {
    const segments = startPlanned(planRun([block])[0]);
    const y = doc.y;
    tag('P', () => drawSegments(block, PAGE.margin.left, y, segments));
  }

  // ── Measuring headings ──────────────────────────────────────────
  // Heights of what the drawing code below puts above a block, step by step
  // (moveDown adds a fraction of the current font's line height). Each sets
  // the font it measures in; every drawing step sets its own.
  function lineHeightOf(font, size) {
    doc.font(font).fontSize(size);
    return doc.currentLineHeight(true);
  }
  function heightOf(font, size, text, options = { width: contentWidth }) {
    doc.font(font).fontSize(size);
    return doc.heightOfString(text, options);
  }
  const periodFont = fonts.italic || fonts.regular;

  // H2 and its rule, as sectionHeader draws them.
  const sectionHeadHeight = (title) =>
    heightOf(headingFont, SIZE.sectionTitle, title.toLocaleUpperCase(language), { width: contentWidth, characterSpacing: 1.5 }) +
    0.3 * lineHeightOf(headingFont, SIZE.sectionTitle) + 6;

  // "Title  —  by" (a line steps by the company font that ends it), the
  // period, then `gap` line heights of the period font.
  const entryHeadHeight = (title, by, period, gap) =>
    heightOf(fonts.regular, SIZE.company, `${title}  —  ${by}`) +
    heightOf(periodFont, SIZE.period, period) + gap * lineHeightOf(periodFont, SIZE.period);

  // A bulleted item with a hanging indent: the bullet sits 10pt in, and every
  // line of the text, wrapped ones included, starts where the first line's
  // text does. Drawn in the current font, size and colour.
  const bulletX = PAGE.margin.left + 10;
  const bulletRight = PAGE.margin.left + contentWidth - 10;
  const bulletOptions = () => ({ width: bulletRight - bulletX - doc.widthOfString('•  '), lineGap: bulletGap });

  // Lists and descriptions are both set in the bullet font.
  function bulletBlocks(items) {
    doc.font(fonts.regular).fontSize(SIZE.bullet);
    return items.map((text) => textBlock(text, bulletOptions()));
  }
  function descriptionBlock(text) {
    doc.font(fonts.regular).fontSize(SIZE.bullet);
    return textBlock(text, { width: contentWidth, lineGap: bulletGap });
  }

  // `first`: the lead (headings) and blocks of the section's first entry,
  // which the section heading stays with.
  function sectionHeader(title, first) {
    keepWithNext(sectionHeadHeight(title) + first.lead, first.blocks);
    doc.font(headingFont).fontSize(SIZE.sectionTitle).fillColor(COLOR.black);
    doc.x = PAGE.margin.left;
    tag('H2', () => doc.text(title.toLocaleUpperCase(language), { width: contentWidth, characterSpacing: 1.5 }));
    doc.moveDown(0.15);
    drawRule();
    doc.moveDown(0.15);
  }

  function bulletItem(block, plan, list) {
    const segments = startPlanned(plan);
    const y = doc.y;
    const textX = bulletX + doc.widthOfString('•  ');
    group('LI', (item) => {
      tag('Lbl', () => doc.text('•', bulletX, y, { lineBreak: false }), item);
      tag('LBody', () => drawSegments(block, textX, y, segments), item);
    }, list);
    doc.x = PAGE.margin.left;
  }

  // The items are planned together, so the list rule sees the last item.
  function bulletList(blocks) {
    const plans = planRun(blocks);
    group('L', (list) => blocks.forEach((block, i) => bulletItem(block, plans[i], list)));
  }

  // ── Header ──────────────────────────────────────────────────────
  doc.y = PAGE.margin.top;

  // Name
  doc.font(headingFont).fontSize(SIZE.name).fillColor(COLOR.black);
  tag('H1', () => textCenter(t.header.title));
  doc.moveDown(0.2);

  // Subtitle: one line. A long one (the japan-bridge flavour in Japanese is
  // 475pt at 11pt against 451pt) steps down in size until it fits rather than
  // wrapping, which in Japanese breaks mid-word; below the 9.5pt floor the
  // build fails.
  doc.font(fonts.italic || fonts.regular).fillColor(COLOR.mid);
  const subtitleSize = fitFontSize(
    (size) => doc.fontSize(size).widthOfString(t.header.subtitle),
    contentWidth,
    { from: SIZE.subtitle, floor: SIZE.subtitleMin, label: flavor ? `${flavor.name}/${language}` : language },
  );
  doc.fontSize(subtitleSize);
  tag('P', () => textCenter(t.header.subtitle));
  doc.moveDown(0.4);

  // Contact line: location · email · website
  doc.font(headingRegular).fontSize(SIZE.contact).fillColor(COLOR.dark);
  const sep = '   ·   ';
  const contactStr = `${t.header.location}${sep}${t.header.contactViaEmail}${sep}${t.header.website}`;
  const contactY = doc.y;
  tag('P', () => textCenter(contactStr));
  // Make the email and the website clickable without changing how they look:
  // link annotations over where the centred line put them.
  const contactWidth = doc.widthOfString(contactStr);
  if (contactWidth <= contentWidth) {
    const lineHeight = doc.currentLineHeight();
    let x = PAGE.margin.left + (contentWidth - contactWidth) / 2;
    for (const [segment, url] of [
      [`${t.header.location}${sep}`, null],
      [t.header.contactViaEmail, `mailto:${t.header.contactViaEmail}`],
      [sep, null],
      [t.header.website, t.header.website],
    ]) {
      const width = doc.widthOfString(segment);
      if (url) doc.link(x, contactY, width, lineHeight, url);
      x += width;
    }
  }
  doc.moveDown(0.6);

  drawRule();
  doc.moveDown(0.3);

  // ── About ───────────────────────────────────────────────────────
  doc.font(fonts.regular).fontSize(SIZE.body);
  const aboutOptions = { width: contentWidth, lineGap };
  const aboutFirst = t.about.paragraph1 ? [textBlock(t.about.paragraph1, aboutOptions)] : [];
  sectionHeader(t.about.title, { lead: 0, blocks: aboutFirst });

  doc.font(fonts.regular).fontSize(SIZE.body).fillColor(COLOR.dark);
  doc.x = PAGE.margin.left;
  if (t.about.paragraph1) {
    tag('P', () => doc.text(t.about.paragraph1, aboutOptions));
    doc.moveDown(0.3);
  }
  if (t.about.paragraph2) {
    doc.x = PAGE.margin.left;
    tag('P', () => doc.text(t.about.paragraph2, aboutOptions));
    doc.moveDown(0.3);
  }

  // Languages
  doc.x = PAGE.margin.left;
  doc.font(fonts.bold).fontSize(SIZE.body).fillColor(COLOR.black);
  const languagesLabel = fieldLabel(t.about.languages);
  const labelWidth = doc.widthOfString(languagesLabel);
  doc.font(fonts.regular);
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
  // The same line spacing as the paragraphs above (it wraps in Japanese).
  tag('P', () => {
    doc.font(fonts.bold).fillColor(COLOR.black);
    doc.text(languagesLabel, { continued: true, width: contentWidth, lineGap });
    doc.font(fonts.regular).fillColor(COLOR.dark);
    doc.text(languageLines.join(languageSep.trimEnd() + '\n'), { width: contentWidth, lineGap });
  });
  doc.moveDown(0.5);

  // ── Experience ──────────────────────────────────────────────────
  // A job's heading (title — company, period) stays with its bullets.
  const jobs = Array.isArray(t.experience.jobs) ? t.experience.jobs : [];
  const jobFirst = (job) => ({
    blocks: bulletBlocks(job.responsibilities ?? []),
    lead: entryHeadHeight(job.title, job.company, job.period, 0.15),
  });
  sectionHeader(t.experience.title, jobs.length ? jobFirst(jobs[0]) : { lead: 0, blocks: [] });

  jobs.forEach((job, i) => {
    const { blocks, lead } = jobFirst(job);
    keepWithNext(lead, blocks);

    // Job title — Company | Period (on same line)
    doc.x = PAGE.margin.left;
    tag('H3', () => {
      doc.font(fonts.bold).fontSize(SIZE.jobTitle).fillColor(COLOR.black);
      doc.text(job.title, { continued: true, width: contentWidth });

      doc.font(fonts.regular).fontSize(SIZE.company).fillColor(COLOR.mid);
      doc.text(`  —  ${job.company}`, { width: contentWidth });
    });

    doc.x = PAGE.margin.left;
    doc.font(periodFont).fontSize(SIZE.period).fillColor(COLOR.light);
    tag('P', () => doc.text(job.period, { width: contentWidth }));
    doc.moveDown(0.15);

    // Responsibilities
    if (blocks.length) {
      doc.font(fonts.regular).fontSize(SIZE.bullet).fillColor(COLOR.dark);
      bulletList(blocks);
    }

    if (i < jobs.length - 1) doc.moveDown(0.4);
  });
  doc.moveDown(0.3);

  // ── Skills ──────────────────────────────────────────────────────
  const skills = bulletBlocks(Array.isArray(t.skills.technicalSkills) ? t.skills.technicalSkills : []);
  sectionHeader(t.skills.title, { lead: 0, blocks: skills });

  if (skills.length) {
    doc.font(fonts.regular).fontSize(SIZE.bullet).fillColor(COLOR.dark);
    bulletList(skills);
  }
  doc.moveDown(0.3);

  // ── Projects ────────────────────────────────────────────────────
  // A project's title and technologies stay with its description.
  const projects = Array.isArray(t.projects.entries) ? t.projects.entries : [];
  const projectFirst = (project) => ({
    blocks: project.description ? [descriptionBlock(project.description)] : [],
    lead:
      heightOf(fonts.bold, SIZE.jobTitle, project.title) +
      heightOf(periodFont, SIZE.period, project.technologies) +
      0.1 * lineHeightOf(periodFont, SIZE.period),
  });
  sectionHeader(t.projects.title, projects.length ? projectFirst(projects[0]) : { lead: 0, blocks: [] });

  projects.forEach((project, i) => {
    const { blocks, lead } = projectFirst(project);
    keepWithNext(lead, blocks);

    doc.x = PAGE.margin.left;
    doc.font(fonts.bold).fontSize(SIZE.jobTitle).fillColor(COLOR.black);
    tag('H3', () => doc.text(project.title, { width: contentWidth }));

    doc.x = PAGE.margin.left;
    doc.font(periodFont).fontSize(SIZE.period).fillColor(COLOR.light);
    tag('P', () => doc.text(project.technologies, { width: contentWidth }));
    doc.moveDown(0.1);

    if (blocks.length) {
      doc.font(fonts.regular).fontSize(SIZE.bullet).fillColor(COLOR.dark);
      paragraph(blocks[0]);
    }

    if (i < projects.length - 1) doc.moveDown(0.3);
  });
  doc.moveDown(0.3);

  // ── Education ───────────────────────────────────────────────────
  // A degree's heading stays with its description (or, without one, with
  // its papers), and "Selected Papers:" with its first paper.
  const schools = Array.isArray(t.education.entries) ? t.education.entries : [];
  const papersOf = (edu) => (Array.isArray(edu.additionalInfo?.items) ? edu.additionalInfo.items : []);
  const schoolFirst = (edu) => {
    if (edu.description) {
      return {
        blocks: [descriptionBlock(edu.description)],
        lead: entryHeadHeight(edu.degree, edu.institution, edu.period, 0.1),
      };
    }
    const papers = papersOf(edu);
    return {
      blocks: bulletBlocks(papers),
      lead:
        entryHeadHeight(edu.degree, edu.institution, edu.period, papers.length ? 0.15 : 0) +
        (papers.length ? heightOf(fonts.bold, SIZE.bullet, edu.additionalInfo.title) : 0),
    };
  };
  sectionHeader(t.education.title, schools.length ? schoolFirst(schools[0]) : { lead: 0, blocks: [] });

  schools.forEach((edu, i) => {
    const first = schoolFirst(edu);
    keepWithNext(first.lead, first.blocks);

    doc.x = PAGE.margin.left;
    tag('H3', () => {
      doc.font(fonts.bold).fontSize(SIZE.jobTitle).fillColor(COLOR.black);
      doc.text(edu.degree, { continued: true, width: contentWidth });

      doc.font(fonts.regular).fontSize(SIZE.company).fillColor(COLOR.mid);
      doc.text(`  —  ${edu.institution}`, { width: contentWidth });
    });

    doc.x = PAGE.margin.left;
    doc.font(periodFont).fontSize(SIZE.period).fillColor(COLOR.light);
    tag('P', () => doc.text(edu.period, { width: contentWidth }));

    if (edu.description) {
      doc.moveDown(0.1);
      doc.font(fonts.regular).fontSize(SIZE.bullet).fillColor(COLOR.dark);
      paragraph(first.blocks[0]);
    }

    const papers = papersOf(edu);
    if (papers.length) {
      const gap = 0.15 * doc.currentLineHeight(true);
      const blocks = bulletBlocks(papers);
      keepWithNext(gap + heightOf(fonts.bold, SIZE.bullet, edu.additionalInfo.title), blocks);
      if (!atTop()) doc.moveDown(0.15);
      doc.x = PAGE.margin.left;
      doc.font(fonts.bold).fontSize(SIZE.bullet).fillColor(COLOR.black);
      tag('P', () => doc.text(edu.additionalInfo.title, { width: contentWidth }));
      doc.font(fonts.regular).fontSize(SIZE.bullet).fillColor(COLOR.dark);
      bulletList(blocks);
    }

    if (i < schools.length - 1) doc.moveDown(0.4);
  });

  // ── Footer ──────────────────────────────────────────────────────
  // The footer sits in the bottom margin of the last content page. PDFKit
  // starts a new page for any line that crosses the margin, so the margin is
  // lifted while the footer is written and put back afterwards.
  // fieldLabel, like the other labels: "作成日：" plus a space was a double gap.
  const footerText = `${fieldLabel(t.pdf.generatedOn)}${issueDate()}`;
  const bottomMargin = doc.page.margins.bottom;
  const footerY = doc.page.height - bottomMargin + 10;
  doc.font(headingRegular).fontSize(SIZE.footer).fillColor(COLOR.light);
  doc.page.margins.bottom = 0;
  artifact(
    () => doc.text(footerText, PAGE.margin.left, footerY, { width: contentWidth, align: 'center' }),
    { type: 'Pagination' }
  );
  doc.page.margins.bottom = bottomMargin;
  root.end();

  // Finalize. An error here, or while the file is written, fails the run.
  stream.on('finish', () => console.log(`[${language}] Successfully generated: ${outputFile}`));
  stream.on('error', (err) => {
    console.error(`[${language}] Error writing PDF ${outputFile}:`, err);
    process.exitCode = 1;
  });
  doc.end();
  console.log(`[${language}] Finalizing PDF: ${outputFile}`);
}

// ── Run ─────────────────────────────────────────────────────────────
console.log('Starting resume generation...');
generateResume('en');
generateResume('ja');
generateResume('tr');
for (const { flavor, language } of flavorTargets()) generateResume(language, flavor);
console.log('Resume generation complete.');
