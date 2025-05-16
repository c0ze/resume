import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Helper function to load JSON data
function loadContent(lang, fileName) {
  const filePath = path.join(process.cwd(), 'content', lang, fileName);
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    try {
      return JSON.parse(fileContent);
    } catch (e) {
      console.error(`Error parsing JSON from ${filePath}:`, e);
      return {};
    }
  }
  console.warn(`Warning: File not found - ${filePath}`);
  return {};
}

async function generatePdfForLang(lang) {
  console.log(`[${lang}] Starting PDF generation...`);
  // Load content
  const headerContent = loadContent(lang, 'header.json');
  const aboutContent = loadContent(lang, 'about.json');
  const experienceContent = loadContent(lang, 'experience.json');
  const educationContent = loadContent(lang, 'education.json');
  const skillsContent = loadContent(lang, 'skills.json');
  const projectsContent = loadContent(lang, 'projects.json');
  const pdfMetaContent = loadContent(lang, 'pdf_meta.json');

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: pdfMetaContent.title || `Resume - ${headerContent.title || 'Arda Karaduman'}`,
      Author: pdfMetaContent.author || headerContent.title || 'Arda Karaduman',
      Subject: pdfMetaContent.subject || `Resume of ${headerContent.title || 'Arda Karaduman'}`,
      Keywords: pdfMetaContent.keywords || 'resume, cv',
    },
    lang: lang,
    pdfVersion: '1.7',
    tagged: true,
    displayTitle: true,
    autoFirstPage: true,
    // fontSubsetting: lang === 'ja' ? false : true // Subsetting can be problematic with some CJK fonts
  });

  const outputDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, `resume-${lang}.pdf`);
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  stream.on('finish', () => {
    console.log(`[${lang}] Successfully generated and saved: ${outputPath}`);
  });
  stream.on('error', (err) => {
    console.error(`[${lang}] Error writing PDF to stream for ${outputPath}:`, err);
  });

  const colors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    text: '#1F2937',
    lightText: '#6B7280',
  };

  const fontDir = path.join(process.cwd(), 'public', 'fonts');
  const notoRegularPath = path.join(fontDir, 'NotoSans-Regular.ttf');
  const notoBoldPath = path.join(fontDir, 'NotoSans-Bold.ttf');
  const ipaexgPath = path.join(fontDir, 'ipaexg.ttf');

  let regularFont = 'Helvetica';
  let boldFont = 'Helvetica-Bold';

  try {
    if (lang === 'ja') {
      console.log(`[ja] Attempting to load Japanese font (IPAexGothic)...`);
      if (!fs.existsSync(ipaexgPath)) throw new Error(`Japanese Font (IPAexGothic) not found: ${ipaexgPath}.`);
      doc.registerFont('CustomFont-Regular', ipaexgPath); // Use generic names for registration
      doc.registerFont('CustomFont-Bold', ipaexgPath);    // Can use same if no bold variant
      regularFont = 'CustomFont-Regular';
      boldFont = 'CustomFont-Bold';
      console.log(`[ja] Successfully registered Japanese font (IPAexGothic).`);
    } else { // For 'en', 'tr', and other languages
      console.log(`[${lang}] Attempting to load NotoSans fonts...`);
      if (!fs.existsSync(notoRegularPath)) throw new Error(`Regular Font (NotoSans-Regular) not found: ${notoRegularPath}`);
      if (!fs.existsSync(notoBoldPath)) throw new Error(`Bold Font (NotoSans-Bold) not found: ${notoBoldPath}`);
      doc.registerFont('CustomFont-Regular', notoRegularPath);
      doc.registerFont('CustomFont-Bold', notoBoldPath);
      regularFont = 'CustomFont-Regular';
      boldFont = 'CustomFont-Bold';
      console.log(`[${lang}] Successfully registered NotoSans fonts.`);
    }
    // Test font by setting it (optional, but can catch early errors)
    doc.font(regularFont).text('', 0, 0); 
  } catch (e) {
    console.error(`[${lang}] ERROR loading/using custom font: ${e.message}`);
    console.error(`[${lang}] Falling back to Helvetica. Characters may be garbled for non-Latin scripts.`);
    // regularFont and boldFont remain Helvetica
  }
  
  doc.font(regularFont); // Set default document font

  function addSectionHeader(text) {
    doc.fontSize(16).font(boldFont).fillColor(colors.primary)
       .text(text, { underline: false })
       .moveDown(0.5);
    doc.strokeColor(colors.primary).lineWidth(0.5)
       .moveTo(doc.x, doc.y - 5)
       .lineTo(doc.page.width - doc.page.margins.right, doc.y - 5)
       .stroke().moveDown(0.75);
  }

  function addSubsectionHeader(title, subtitle, dates) {
    const currentY = doc.y;
    doc.fontSize(12).font(boldFont).fillColor(colors.text)
       .text(title || '', doc.page.margins.left, currentY, { width: doc.page.width - doc.page.margins.left - doc.page.margins.right - (dates ? 100 : 0) });
    if (dates) {
      doc.fontSize(10).font(regularFont).fillColor(colors.lightText)
         .text(dates, doc.page.width - doc.page.margins.right - 90, currentY, { align: 'right', width: 90 });
    }
    doc.moveDown(0.1);
    if (subtitle) {
      doc.fontSize(11).font(regularFont).fillColor(colors.secondary)
         .text(subtitle, { continued: false });
      doc.moveDown(0.3);
    } else {
      doc.moveDown(0.3);
    }
  }

  // --- Start PDF Content ---
  doc.font(regularFont); // Ensure default font is set for the language

  // Header
  doc.fontSize(24).font(boldFont).fillColor(colors.primary)
     .text(headerContent.title || 'Arda Karaduman', { align: 'center' });
  doc.fontSize(14).font(regularFont).fillColor(colors.secondary)
     .text(headerContent.subtitle || 'Software Developer', { align: 'center' })
     .moveDown(0.5);

  const contactInfo = [
    headerContent.location || 'Location not specified',
    `Email: ${headerContent.contactViaEmail || 'Email not specified'}`,
    `Website: ${headerContent.website || 'Website not specified'}`
  ].join('  •  ');
  doc.fontSize(9).font(regularFont).fillColor(colors.text)
     .text(contactInfo, { align: 'center' })
     .moveDown(1.5);

  // About Me
  addSectionHeader(aboutContent.title || 'About Me');
  doc.font(regularFont).fontSize(10).fillColor(colors.text); // Set font for body
  doc.text(aboutContent.paragraph1 || '', { align: 'justify', lineGap: 2 }).moveDown(0.5);
  if (aboutContent.paragraph2) {
    doc.text(aboutContent.paragraph2, { align: 'justify', lineGap: 2 }).moveDown(1);
  } else {
    doc.moveDown(1);
  }
  if (aboutContent.languages && aboutContent.languagesContent) {
    doc.font(boldFont).fontSize(10).text(`${aboutContent.languages} `, { continued: true });
    doc.font(regularFont).fontSize(10).text(aboutContent.languagesContent).moveDown(1);
  }

  // Work Experience
  addSectionHeader(experienceContent.title || 'Work Experience');
  if (experienceContent.jobs && Array.isArray(experienceContent.jobs)) {
    experienceContent.jobs.forEach(job => {
      doc.font(regularFont); // Ensure correct font for subsection
      addSubsectionHeader(job.title, job.company, job.period);
      if (job.responsibilities && Array.isArray(job.responsibilities)) {
        doc.fontSize(10).font(regularFont).fillColor(colors.text)
           .list(job.responsibilities, { bulletRadius: 1.5, textIndent: 10, lineGap: 2, paragraphGap: 3 });
      }
      doc.moveDown(0.75);
    });
  }

  // Education
  addSectionHeader(educationContent.title || 'Education');
  if (educationContent.entries && Array.isArray(educationContent.entries)) {
    educationContent.entries.forEach(entry => {
      doc.font(regularFont);
      addSubsectionHeader(entry.degree, entry.institution, entry.period);
      doc.fontSize(10).font(regularFont).fillColor(colors.text);
      if (entry.description) {
        doc.text(entry.description, { lineGap: 2 }).moveDown(0.3);
      }
      if (entry.additionalInfo) {
        const additionalInfoLines = entry.additionalInfo.split('\n').map(line => line.trim()).filter(line => line);
        if (additionalInfoLines.length > 0) {
          doc.list(additionalInfoLines.map(line => line.startsWith('- ') ? line.substring(2).trim() : line.trim()), 
                     { bulletRadius: 1.5, textIndent: 10, lineGap: 2, paragraphGap: 3 });
        }
      }
      doc.moveDown(0.75);
    });
  }

  // Skills
  addSectionHeader(skillsContent.title || 'Skills');
  if (skillsContent.technicalSkillsTitle && skillsContent.technicalSkills && Array.isArray(skillsContent.technicalSkills)) {
    doc.fontSize(11).font(boldFont).fillColor(colors.text)
       .text(skillsContent.technicalSkillsTitle).moveDown(0.2);
    doc.fontSize(10).font(regularFont).fillColor(colors.text)
       .list(skillsContent.technicalSkills, { bulletRadius: 1.5, textIndent: 10, columns: 2, columnGap: 15, lineGap: 2, paragraphGap: 3 });
    doc.moveDown(1);
  }

  // Projects
  addSectionHeader(projectsContent.title || 'Projects');
  if (projectsContent.entries && Array.isArray(projectsContent.entries)) {
    projectsContent.entries.forEach(project => {
      doc.font(regularFont);
      addSubsectionHeader(project.title, project.technologies, '');
      doc.fontSize(10).font(regularFont).fillColor(colors.text)
         .text(project.description || '', { lineGap: 2 })
         .moveDown(0.75);
    });
  }

  // Footer
  const footerY = doc.page.height - 40;
  const generatedOnText = pdfMetaContent.generatedOn || (lang === 'ja' ? '作成日:' : (lang === 'tr' ? 'Oluşturulma Tarihi:' : 'Generated on:'));
  doc.fontSize(8).font(regularFont).fillColor(colors.lightText)
     .text(`${generatedOnText} ${new Date().toLocaleDateString(lang === 'ja' ? 'ja-JP' : lang === 'tr' ? 'tr-TR' : 'en-US')}`,
           doc.page.margins.left, footerY, 
           { align: 'center', width: doc.page.width - doc.page.margins.left - doc.page.margins.right });
  // --- End PDF Content ---

  try {
    console.log(`[${lang}] Attempting to finalize PDF: ${outputPath}`);
    doc.end();
  } catch (e) {
    console.error(`[${lang}] Error during doc.end():`, e);
  }
}

async function main() {
  const languages = ['en', 'tr', 'ja'];
  for (const lang of languages) {
    await generatePdfForLang(lang);
  }
}

main().catch(error => {
  console.error("Error generating PDFs:", error);
  process.exit(1);
});