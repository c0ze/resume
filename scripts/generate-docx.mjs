import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, ShadingType,
} from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Strip CJK characters and surrounding parentheses for non-JA documents
function stripCJK(text) {
  if (typeof text !== 'string') return text;
  let result = text.replace(/\s*[（(][^\)）]*[\u3000-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]+[^\)）]*[)）]/g, '');
  result = result.replace(/[\u3000-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]+/g, '');
  return result.trim();
}

function sanitizeContent(obj) {
  if (typeof obj === 'string') return stripCJK(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeContent);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = sanitizeContent(v);
    return out;
  }
  return obj;
}

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

const COLOR = {
  black: '1a1a1a',
  dark: '2d2d2d',
  mid: '555555',
  light: '888888',
  rule: 'cccccc',
};

// ── Helpers (constructed per-language with correct fonts) ────────────
function makeHelpers(FONT, language) {
  const jaSpacing = language === 'ja';

  function sectionHeading(text) {
    return new Paragraph({
      children: [
        new TextRun({
          text: jaSpacing ? text : text.toUpperCase(),
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
async function generateDocx(language) {
  const raw = {
    header: loadContent(language, 'header'),
    about: loadContent(language, 'about'),
    experience: loadContent(language, 'experience'),
    education: loadContent(language, 'education'),
    skills: loadContent(language, 'skills'),
    projects: loadContent(language, 'projects'),
    pdf: loadContent(language, 'pdf_meta'),
  };
  const t = language === 'ja' ? raw : sanitizeContent(raw);

  const FONT = getFonts(language);
  const { sectionHeading, jobEntry, bulletItem, bodyPara } = makeHelpers(FONT, language);
  const isJa = language === 'ja';

  const children = [];
  const sep = '   ·   ';

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
      children: [
        new TextRun({ text: `${t.header.location}${sep}${t.header.contactViaEmail}${sep}${t.header.website}`, size: 18, font: FONT.heading, color: COLOR.dark }),
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
      new TextRun({ text: `${t.about.languages}: `, bold: true, size: 20, font: FONT.body, color: COLOR.black }),
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

  // ── Footer ──────────────────────────────────────────────────────
  children.push(new Paragraph({
    children: [new TextRun({
      text: `${t.pdf.generatedOn} ${new Date().toLocaleDateString()}`,
      size: 16,
      font: FONT.heading,
      color: COLOR.light,
    })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 300 },
  }));

  // ── Build document ──────────────────────────────────────────────
  const doc = new Document({
    creator: t.pdf.author,
    title: t.pdf.title,
    description: t.pdf.subject,
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

  const outputFile = path.join(projectRoot, 'public', `resume-${language}.docx`);
  try {
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputFile, buffer);
    console.log(`[${language}] Successfully generated: ${outputFile}`);
  } catch (err) {
    console.error(`[${language}] Error generating DOCX:`, err);
  }
}

// ── Run ─────────────────────────────────────────────────────────────
console.log('Starting DOCX resume generation...');
await Promise.all([generateDocx('en'), generateDocx('ja'), generateDocx('tr')]);
console.log('DOCX generation complete.');
