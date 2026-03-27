import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, TabStopPosition, TabStopType,
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

function generateDocx(language) {
  const t = {
    header: loadContent(language, 'header'),
    about: loadContent(language, 'about'),
    experience: loadContent(language, 'experience'),
    education: loadContent(language, 'education'),
    skills: loadContent(language, 'skills'),
    projects: loadContent(language, 'projects'),
    pdf: loadContent(language, 'pdf_meta'),
  };

  const sectionBorder = {
    bottom: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
  };

  function sectionHeading(text) {
    return new Paragraph({
      text,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 100 },
      border: sectionBorder,
    });
  }

  const children = [];

  // Header
  children.push(
    new Paragraph({
      children: [new TextRun({ text: t.header.title, bold: true, size: 36, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: t.header.subtitle, size: 22, color: '555555', font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: t.header.location, size: 18, font: 'Calibri' }),
        new TextRun({ text: '  |  ', size: 18, color: '999999', font: 'Calibri' }),
        new TextRun({ text: t.header.contactViaEmail, size: 18, font: 'Calibri' }),
        new TextRun({ text: '  |  ', size: 18, color: '999999', font: 'Calibri' }),
        new TextRun({ text: t.header.website, size: 18, font: 'Calibri' }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
  );

  // About
  children.push(sectionHeading(t.about.title));
  if (t.about.paragraph1) {
    children.push(new Paragraph({ children: [new TextRun({ text: t.about.paragraph1, size: 20, font: 'Calibri' })], spacing: { after: 80 } }));
  }
  if (t.about.paragraph2) {
    children.push(new Paragraph({ children: [new TextRun({ text: t.about.paragraph2, size: 20, font: 'Calibri' })], spacing: { after: 80 } }));
  }
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `${t.about.languages} `, bold: true, size: 20, font: 'Calibri' }),
        new TextRun({ text: t.about.languagesContent, size: 20, font: 'Calibri' }),
      ],
      spacing: { after: 100 },
    }),
  );

  // Experience
  children.push(sectionHeading(t.experience.title));
  if (Array.isArray(t.experience.jobs)) {
    for (const job of t.experience.jobs) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: job.title, bold: true, size: 22, font: 'Calibri' }),
            new TextRun({ text: `  —  ${job.company}`, size: 20, color: '333333', font: 'Calibri' }),
          ],
          spacing: { before: 140, after: 20 },
        }),
        new Paragraph({
          children: [new TextRun({ text: job.period, size: 18, italics: true, color: '666666', font: 'Calibri' })],
          spacing: { after: 60 },
        }),
      );
      if (Array.isArray(job.responsibilities)) {
        for (const item of job.responsibilities) {
          children.push(new Paragraph({
            children: [new TextRun({ text: item, size: 20, font: 'Calibri' })],
            bullet: { level: 0 },
            spacing: { after: 20 },
          }));
        }
      }
    }
  }

  // Education
  children.push(sectionHeading(t.education.title));
  if (Array.isArray(t.education.entries)) {
    for (const edu of t.education.entries) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree, bold: true, size: 22, font: 'Calibri' }),
            new TextRun({ text: `  —  ${edu.institution}`, size: 20, color: '333333', font: 'Calibri' }),
          ],
          spacing: { before: 140, after: 20 },
        }),
        new Paragraph({
          children: [new TextRun({ text: edu.period, size: 18, italics: true, color: '666666', font: 'Calibri' })],
          spacing: { after: 60 },
        }),
      );
      if (edu.description) {
        children.push(new Paragraph({ children: [new TextRun({ text: edu.description, size: 20, font: 'Calibri' })], spacing: { after: 40 } }));
      }
      if (edu.additionalInfo) {
        children.push(new Paragraph({
          children: [new TextRun({ text: edu.additionalInfo.title, bold: true, size: 20, font: 'Calibri' })],
          spacing: { before: 40, after: 20 },
        }));
        if (Array.isArray(edu.additionalInfo.items)) {
          for (const item of edu.additionalInfo.items) {
            children.push(new Paragraph({
              children: [new TextRun({ text: item, size: 20, font: 'Calibri' })],
              bullet: { level: 0 },
              spacing: { after: 20 },
            }));
          }
        }
      }
    }
  }

  // Skills
  children.push(sectionHeading(t.skills.title));
  if (Array.isArray(t.skills.technicalSkills)) {
    for (const skill of t.skills.technicalSkills) {
      children.push(new Paragraph({
        children: [new TextRun({ text: skill, size: 20, font: 'Calibri' })],
        bullet: { level: 0 },
        spacing: { after: 20 },
      }));
    }
  }

  // Projects
  children.push(sectionHeading(t.projects.title));
  if (Array.isArray(t.projects.entries)) {
    for (const project of t.projects.entries) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: project.title, bold: true, size: 20, font: 'Calibri' }),
          ],
          spacing: { before: 100, after: 20 },
        }),
        new Paragraph({
          children: [new TextRun({ text: project.technologies, size: 18, italics: true, color: '666666', font: 'Calibri' })],
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [new TextRun({ text: project.description, size: 20, font: 'Calibri' })],
          spacing: { after: 60 },
        }),
      );
    }
  }

  // Footer
  children.push(
    new Paragraph({
      children: [new TextRun({
        text: `${t.pdf.generatedOn} ${new Date().toLocaleDateString()}`,
        size: 16,
        color: '999999',
        font: 'Calibri',
      })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
    }),
  );

  const doc = new Document({
    creator: t.pdf.author,
    title: t.pdf.title,
    description: t.pdf.subject,
    sections: [{
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 720, right: 720 },
        },
      },
      children,
    }],
  });

  const outputFile = path.join(projectRoot, 'public', `resume-${language}.docx`);

  Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync(outputFile, buffer);
    console.log(`[${language}] Successfully generated: ${outputFile}`);
  }).catch(err => {
    console.error(`[${language}] Error generating DOCX:`, err);
  });
}

console.log('Starting DOCX resume generation...');
generateDocx('en');
generateDocx('ja');
generateDocx('tr');
console.log('DOCX generation process called for all languages.');
