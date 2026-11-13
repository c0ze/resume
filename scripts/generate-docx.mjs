import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, ExternalHyperlink,
} from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadContent } from './content.mjs';
import { applyFlavor, artifactBase, flavorTargets } from './flavors.mjs';
import { issueDate, sanitizeContent } from './export-text.mjs';
import { fieldLabel } from './labels.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// ── Typography constants (sizes in half-points) ─────────────────────
function getFonts(language) {
  if (language === 'ja') {
    return {
      heading: 'Noto Sans CJK JP',  // sans for headings — has proper bold
      body: 'Noto Serif CJK JP',    // serif for body — has proper bold
    };
  }
  return {
    heading: 'Calibri',
    body: 'Cambria',
  };
}

// Proofing language of every run, per document.
const RUN_LANGUAGE = {
  en: { value: 'en-US' },
  ja: { value: 'ja-JP', eastAsia: 'ja-JP' },
  tr: { value: 'tr-TR' },
};

const COLOR = {
  black: '1a1a1a',
  dark: '2d2d2d',
  mid: '555555',
  light: '595959', // 7:1 on white; 888888 was 3.5:1 at 8-9pt
  rule: 'cccccc',
};

// ── Helpers (constructed per-language with correct fonts) ────────────
function makeHelpers(FONT, language) {
  const jaSpacing = language === 'ja';

  // A real Heading 1, so Word's outline and ATS parsers see the sections; the
  // run keeps its explicit look, and the style is defined to match it.
  function sectionHeading(text) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [
        new TextRun({
          text: jaSpacing ? text : text.toLocaleUpperCase(language),
          bold: true,
          size: 22,
          font: FONT.heading,
          color: COLOR.black,
          characterSpacing: jaSpacing ? 20 : 60,
        }),
      ],
      spacing: { before: 280, after: jaSpacing ? 100 : 60 },
      keepNext: true,  // prevent orphaned section headers at page bottom
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 1, color: COLOR.rule, space: 4 },
      },
    });
  }

  function jobEntry(title, company, period) {
    return [
      new Paragraph({
        children: [
          new TextRun({ text: title, bold: true, size: 21, font: FONT.body, color: COLOR.black }),
          new TextRun({ text: `  —  ${company}`, size: 20, font: FONT.body, color: COLOR.mid }),
        ],
        keepNext: true,  // keep title with period line
        spacing: { before: 120, after: 10 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: period, size: 18, italics: !jaSpacing, font: FONT.body, color: COLOR.light }),
        ],
        keepNext: true,  // keep period with first content line
        spacing: { after: jaSpacing ? 60 : 40 },
      }),
    ];
  }

  function bulletItem(text) {
    return new Paragraph({
      children: [new TextRun({ text, size: 19, font: FONT.body, color: COLOR.dark })],
      bullet: { level: 0 },
      spacing: { after: jaSpacing ? 30 : 15 },
    });
  }

  function bodyPara(text, opts = {}) {
    return new Paragraph({
      children: [new TextRun({ text, size: 20, font: FONT.body, color: COLOR.dark, ...opts })],
      spacing: { after: jaSpacing ? 80 : 60 },
    });
  }

  return { sectionHeading, jobEntry, bulletItem, bodyPara };
}

// ── Generator ───────────────────────────────────────────────────────
async function generateDocx(language, flavor = null) {
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
  const t = language === 'ja' ? raw : sanitizeContent(raw);

  const FONT = getFonts(language);
  const { sectionHeading, jobEntry, bulletItem, bodyPara } = makeHelpers(FONT, language);
  const isJa = language === 'ja';

  const children = [];
  const sep = '   ·   ';
  const contactRun = { size: 18, font: FONT.heading, color: COLOR.dark };

  // ── Header ──────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [new TextRun({ text: t.header.title, bold: true, size: 40, font: FONT.heading, color: COLOR.black })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 30 },
    }),
    new Paragraph({
      children: [new TextRun({ text: t.header.subtitle, size: 22, font: FONT.body, italics: !isJa, color: COLOR.mid })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    new Paragraph({
      // The email and the website are links, set like the rest of the line.
      children: [
        new TextRun({ text: `${t.header.location}${sep}`, ...contactRun }),
        new ExternalHyperlink({
          link: `mailto:${t.header.contactViaEmail}`,
          children: [new TextRun({ text: t.header.contactViaEmail, ...contactRun })],
        }),
        new TextRun({ text: sep, ...contactRun }),
        new ExternalHyperlink({
          link: t.header.website,
          children: [new TextRun({ text: t.header.website, ...contactRun })],
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 1, color: COLOR.rule, space: 6 },
      },
    }),
  );

  // ── About ───────────────────────────────────────────────────────
  children.push(sectionHeading(t.about.title));
  if (t.about.paragraph1) children.push(bodyPara(t.about.paragraph1));
  if (t.about.paragraph2) children.push(bodyPara(t.about.paragraph2));
  children.push(new Paragraph({
    children: [
      new TextRun({ text: fieldLabel(t.about.languages), bold: true, size: 20, font: FONT.body, color: COLOR.black }),
      new TextRun({ text: t.about.languagesContent, size: 20, font: FONT.body, color: COLOR.dark }),
    ],
    spacing: { after: isJa ? 80 : 60 },
  }));

  // ── Experience ──────────────────────────────────────────────────
  children.push(sectionHeading(t.experience.title));
  if (Array.isArray(t.experience.jobs)) {
    for (const job of t.experience.jobs) {
      children.push(...jobEntry(job.title, job.company, job.period));
      if (Array.isArray(job.responsibilities)) {
        for (const item of job.responsibilities) {
          children.push(bulletItem(item));
        }
      }
    }
  }

  // ── Skills ──────────────────────────────────────────────────────
  children.push(sectionHeading(t.skills.title));
  if (Array.isArray(t.skills.technicalSkills)) {
    for (const skill of t.skills.technicalSkills) {
      children.push(bulletItem(skill));
    }
  }

  // ── Projects ────────────────────────────────────────────────────
  children.push(sectionHeading(t.projects.title));
  if (Array.isArray(t.projects.entries)) {
    for (const project of t.projects.entries) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: project.title, bold: true, size: 20, font: FONT.body, color: COLOR.black })],
          spacing: { before: 80, after: 10 },
        }),
        new Paragraph({
          children: [new TextRun({ text: project.technologies, size: 18, italics: !isJa, font: FONT.body, color: COLOR.light })],
          spacing: { after: isJa ? 50 : 30 },
        }),
        new Paragraph({
          children: [new TextRun({ text: project.description, size: 19, font: FONT.body, color: COLOR.dark })],
          spacing: { after: isJa ? 60 : 40 },
        }),
      );
    }
  }

  // ── Education ───────────────────────────────────────────────────
  children.push(sectionHeading(t.education.title));
  if (Array.isArray(t.education.entries)) {
    for (const edu of t.education.entries) {
      children.push(...jobEntry(edu.degree, edu.institution, edu.period));
      if (edu.description) {
        children.push(new Paragraph({
          children: [new TextRun({ text: edu.description, size: 19, font: FONT.body, color: COLOR.dark })],
          spacing: { after: isJa ? 50 : 30 },
        }));
      }
      if (edu.additionalInfo) {
        children.push(new Paragraph({
          children: [new TextRun({ text: edu.additionalInfo.title, bold: true, size: 19, font: FONT.body, color: COLOR.black })],
          spacing: { before: 30, after: 15 },
        }));
        if (Array.isArray(edu.additionalInfo.items)) {
          for (const item of edu.additionalInfo.items) {
            children.push(bulletItem(item));
          }
        }
      }
    }
  }

  // ── Footer ──────────────────────────────────────────────────────
  children.push(new Paragraph({
    children: [new TextRun({
      text: `${fieldLabel(t.pdf.generatedOn)}${issueDate()}`, // as in the PDF
      size: 16,
      font: FONT.heading,
      color: COLOR.light,
    })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 300 },
  }));

  // ── Build document ──────────────────────────────────────────────
  // Metadata mirrors the PDF's (title, author, subject, keywords).
  const doc = new Document({
    creator: t.pdf.author,
    lastModifiedBy: t.pdf.author,
    title: t.pdf.title,
    subject: t.pdf.subject,
    description: t.pdf.subject,
    keywords: t.pdf.keywords,
    styles: {
      default: {
        document: { run: { language: RUN_LANGUAGE[language] } },
        // Word's default Heading 1 is 16pt blue; match the section heading instead.
        heading1: {
          run: { bold: true, size: 22, font: FONT.heading, color: COLOR.black },
          paragraph: { outlineLevel: 0 },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1000,    // ~0.7in
            bottom: 850,  // ~0.6in
            left: 1100,   // ~0.76in
            right: 1100,
          },
        },
      },
      children,
    }],
  });

  const outputFile = path.join(projectRoot, 'public', `${artifactBase(flavor?.name, language)}.docx`);
  // An error here rejects, and the run exits non-zero.
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputFile, buffer);
  console.log(`[${language}] Successfully generated: ${outputFile}`);
}

// ── Run ─────────────────────────────────────────────────────────────
console.log('Starting DOCX resume generation...');
await Promise.all([generateDocx('en'), generateDocx('ja'), generateDocx('tr')]);
await Promise.all(flavorTargets().map(({ flavor, language }) => generateDocx(language, flavor)));
console.log('DOCX generation complete.');
