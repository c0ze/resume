import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // For ES module __dirname equivalent
// Removed: import { translations } from './translations.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to load JSON content for a given language and section
function loadContent(language, section) {
  const projectRoot = path.resolve(__dirname); // Assumes script is at project root
  const filePath = path.join(projectRoot, 'content', language, `${section}.json`);
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading content file: ${filePath}`, error);
    return {}; // Return empty object on error to avoid breaking the structure
  }
}

// Function to generate resume PDF for a specific language
function generateResume(language) {
  // Load all content sections for the given language
  const contentSections = {
    header: loadContent(language, 'header'),
    about: loadContent(language, 'about'),
    experience: loadContent(language, 'experience'),
    education: loadContent(language, 'education'),
    skills: loadContent(language, 'skills'),
    projects: loadContent(language, 'projects'),
    pdf: loadContent(language, 'pdf_meta') // pdf_meta.json for PDF metadata
  };
  const t = contentSections; // Use 't' as before for consistency in the rest of the script

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: { // Use data from pdf_meta.json
      Title: t.pdf.title || `Resume - ${language.toUpperCase()}`,
      Author: t.pdf.author || "Default Author",
      Subject: t.pdf.subject || `Resume (${language.toUpperCase()})`,
      Keywords: t.pdf.keywords || "resume, cv",
    },
    lang: language, pdfVersion: '1.7', tagged: true,
    displayTitle: true, autoFirstPage: true
  });
  // Output path relative to the script's directory, then up to project root, then to public
  const projectRoot = path.resolve(__dirname); // Assumes script is at project root
  let outputFile = path.join(projectRoot, 'public', 'resume.pdf');
  if (language === 'ja') {
    outputFile = path.join(projectRoot, 'public', 'resume-ja.pdf');
  } else if (language === 'tr') {
    outputFile = path.join(projectRoot, 'public', 'resume-tr.pdf');
  }
  
  const stream = fs.createWriteStream(outputFile); // Removed encoding: 'utf8' as it's for text streams
  doc.pipe(stream);

  const colors = {
    primary: '#3B82F6', secondary: '#1E40AF',
    text: '#1F2937', lightText: '#6B7280', background: '#F9FAFB'
  };

  // Font paths relative to the script's location, then up to project root, then to public/fonts
  const fontDir = path.join(projectRoot, 'public', 'fonts');
  const notoRegularPath = path.join(fontDir, 'NotoSans-Regular.ttf');
  const notoBoldPath = path.join(fontDir, 'NotoSans-Bold.ttf');
  const notoJPRegularPath = path.join(fontDir, 'NotoSansJP-Regular.ttf');
  const notoJPBoldPath = path.join(fontDir, 'NotoSansJP-Bold.ttf');

  let regularFont = 'Helvetica';
  let boldFont = 'Helvetica-Bold';
  let customFontSuccessfullySet = false;

  if (language === 'ja') {
    console.log(`[ja] Attempting to load Japanese fonts...`);
    try {
      if (!fs.existsSync(notoJPRegularPath)) throw new Error(`Japanese Regular Font not found: ${notoJPRegularPath}`);
      if (!fs.existsSync(notoJPBoldPath)) throw new Error(`Japanese Bold Font not found: ${notoJPBoldPath}`);
      
      doc.registerFont('NotoSansJP-Regular', notoJPRegularPath);
      doc.registerFont('NotoSansJP-Bold', notoJPBoldPath);
      
      // Try to activate the font to force parsing by fontkit
      doc.font('NotoSansJP-Regular').text('', 0, 0); // Dummy text to trigger font processing
      // No need to test bold separately if regular works, or vice-versa, as fontkit error is general
      
      regularFont = 'NotoSansJP-Regular';
      boldFont = 'NotoSansJP-Bold'; // Assume bold is also fine if regular loaded
      customFontSuccessfullySet = true;
      console.log(`[ja] Successfully registered and tested Japanese fonts (NotoSansJP).`);
    } catch (e) {
      console.error(`[ja] ERROR loading/using Japanese fonts (NotoSansJP): ${e.message}`);
      console.error(`[ja] This often means the font files at ${notoJPRegularPath} or ${notoJPBoldPath} are corrupted, not valid TTF, or incompatible with the PDF font engine (fontkit).`);
      console.error("[ja] Falling back to Helvetica for Japanese. Characters will likely be garbled.");
      // regularFont and boldFont remain Helvetica
    }
  } else if (language === 'tr') {
    console.log(`[tr] Attempting to load NotoSans fonts for Turkish...`);
    try {
      if (!fs.existsSync(notoRegularPath)) throw new Error(`Regular Font (NotoSans-Regular) not found: ${notoRegularPath}`);
      if (!fs.existsSync(notoBoldPath)) throw new Error(`Bold Font (NotoSans-Bold) not found: ${notoBoldPath}`);

      doc.registerFont('NotoSans-Regular', notoRegularPath);
      doc.registerFont('NotoSans-Bold', notoBoldPath);

      doc.font('NotoSans-Regular').text('', 0, 0); // Dummy text

      regularFont = 'NotoSans-Regular';
      boldFont = 'NotoSans-Bold';
      customFontSuccessfullySet = true;
      console.log(`[tr] Successfully registered and tested NotoSans fonts for Turkish.`);
    } catch (e) {
      console.error(`[tr] ERROR loading/using NotoSans fonts for Turkish: ${e.message}`);
      console.error(`[tr] This often means the font files at ${notoRegularPath} or ${notoBoldPath} are corrupted, not valid TTF, or incompatible with the PDF font engine (fontkit).`);
      console.error("[tr] Falling back to Helvetica for Turkish. Some characters may be garbled.");
      // regularFont and boldFont remain Helvetica
    }
  }
  // For 'en', Helvetica is used by default, customFontSuccessfullySet remains false.
  
  // Helper function to ensure UTF-8 text rendering
  const renderText = (text, options = {}) => {
    // pdfkit handles UTF-8 strings directly when fonts support the characters.
    return doc.text(text, Object.assign({ // Removed utf8Text variable, direct usage
      characterSpacing: 0,
      wordSpacing: 0,
      lineGap: 0,
    }, options));
  };

  // Helper function for section headers with UTF-8 support
  function addSectionHeader(text) {
    doc.fontSize(16)
       .font(boldFont) // Use dynamic boldFont
       .fillColor(colors.primary);
    renderText(text, { underline: true });
    doc.moveDown(0.5);
  }

  // Helper function for subsection headers with UTF-8 support
  function addSubsectionHeader(title, subtitle, dates) {
    doc.fontSize(12)
       .font(boldFont) // Use dynamic boldFont
       .fillColor(colors.text);
    renderText(title, { continued: false });
    
    doc.fontSize(11)
       .font(regularFont) // Use dynamic regularFont
       .fillColor(colors.primary);
    renderText(subtitle, { continued: false });
    
    doc.fontSize(10)
       .font(regularFont) // Use dynamic regularFont
       .fillColor(colors.lightText);
    renderText(dates);
    doc.moveDown(0.2);
  }

  // Header with UTF-8 support
  doc.fontSize(24)
     .font(boldFont) // Already using dynamic boldFont
     .fillColor(colors.primary);
  renderText(t.header.title, { align: 'center' });
  
  doc.fontSize(14)
     .font(regularFont)
     .fillColor(colors.secondary);
  renderText(t.header.subtitle, { align: 'center' });
  doc.moveDown(0.5);

  // Contact Info with UTF-8 support
  doc.fontSize(10)
     .font(regularFont)
     .fillColor(colors.text);
  renderText(`${t.about.location} ${t.header.location}`, { align: 'center' });
  renderText('Email: me@arda.karaduman.web.tr', { align: 'center' });
  renderText(`${t.header.website}: arda.karaduman.web.tr`, { align: 'center' });
  doc.moveDown(1.5);

  // About Me with UTF-8 support
  addSectionHeader(t.about.title);
  doc.fontSize(11)
     .font(regularFont)
     .fillColor(colors.text);
  renderText(t.about.paragraph1, { align: 'justify' });
  doc.moveDown(0.5);
  renderText(t.about.paragraph2, { align: 'justify' });
  doc.moveDown(1);

  // Languages with UTF-8 support
  doc.fontSize(11)
     .font(boldFont)
     .fillColor(colors.text);
  renderText(`${t.about.languages}`);
  
  doc.fontSize(11)
     .font(regularFont)
     .fillColor(colors.text);
  renderText(t.about.languagesContent);
  doc.moveDown(1);

  // Work Experience
  addSectionHeader(t.experience.title);

  // Helper function to render a UTF-8 friendly list
  const renderList = (items) => {
    items.forEach(item => {
      renderText(`• ${item}`, { indent: 10 });
    });
  };

  // Iterate over jobs array
  if (t.experience && Array.isArray(t.experience.jobs)) {
    t.experience.jobs.forEach(job => {
      addSubsectionHeader(job.title, job.company, job.period);
      doc.fontSize(10)
         .font(regularFont)
         .fillColor(colors.text);
      if (Array.isArray(job.responsibilities)) {
        renderList(job.responsibilities);
      }
      doc.moveDown(0.5);
    });
  }
  doc.moveDown(0.5); // Add a bit more space after the last job, was 1 before for job3

  // Education
  addSectionHeader(t.education.title);

  // Iterate over education entries array
  if (t.education && Array.isArray(t.education.entries)) {
    t.education.entries.forEach(entry => {
      addSubsectionHeader(entry.degree, entry.institution, entry.period);
      doc.fontSize(10)
         .font(regularFont)
         .fillColor(colors.text);
      if (entry.description) {
        renderText(entry.description);
        doc.moveDown(0.3);
      }
      if (entry.additionalInfo) {
        renderText(entry.additionalInfo);
      }
      doc.moveDown(0.5);
    });
  }
  doc.moveDown(1);

  // Skills with UTF-8 support
  addSectionHeader(t.skills.title);

  // Technical Skills
  doc.fontSize(11)
     .font(boldFont)
     .fillColor(colors.text);
  renderText(t.skills.technicalSkills);
  
  doc.fontSize(10)
     .font(regularFont)
     .fillColor(colors.text);
     
  // Create a UTF-8 friendly list
  const techSkills = [
    'JavaScript/TypeScript - Advanced',
    'React - Advanced',
    'HTML5/CSS3 - Advanced',
    'Node.js - Proficient',
    'Redux - Proficient'
  ];
  
  renderList(techSkills);
  
  doc.moveDown(0.5);

  // Tech Stack with UTF-8 support
  doc.fontSize(11)
     .font(boldFont)
     .fillColor(colors.text);
  renderText(t.skills.techStack);
  
  doc.fontSize(10)
     .font(regularFont)
     .fillColor(colors.text);
  renderText(t.skills.techStackItems);
  doc.moveDown(0.5);

  // Soft Skills with UTF-8 support
  doc.fontSize(11)
     .font(boldFont)
     .fillColor(colors.text);
  renderText(t.skills.softSkills);
  
  doc.fontSize(10)
     .font(regularFont)
     .fillColor(colors.text);
  renderText(t.skills.softSkillItems);
  doc.moveDown(1);

  // Projects
  addSectionHeader(t.projects.title);

  // Iterate over projects entries array
  if (t.projects && Array.isArray(t.projects.entries)) {
    t.projects.entries.forEach(project => {
      addSubsectionHeader(project.title, project.technologies, ''); // No date for projects here
      doc.fontSize(10)
         .font(regularFont)
         .fillColor(colors.text);
      if (project.description) {
        renderText(project.description);
      }
      doc.moveDown(0.5);
    });
  }
  doc.moveDown(0.5); // Add a bit more space after the last project, was 1 before

  // Footer with UTF-8 support
  const footerY = doc.page.height - 50;
  doc.fontSize(9)
     .font(regularFont)
     .fillColor(colors.lightText);
  renderText(`${t.pdf.generatedOn} ` + new Date().toLocaleDateString(),
    { align: 'center', lineBreak: false, continued: false, width: doc.page.width - 100, x: 50, y: footerY });

  // Finalize the PDF and end the stream
  try {
    console.log(`[${language}] Attempting to finalize PDF: ${outputFile}`);
    doc.end();
  } catch (e) {
    console.error(`[${language}] Error during doc.end():`, e);
  }

  stream.on('finish', () => {
    console.log(`[${language}] Successfully generated and saved: ${outputFile}`);
  });

  stream.on('error', (err) => {
    console.error(`[${language}] Error writing PDF to stream for ${outputFile}:`, err);
  });
}

// Generate resumes for all languages
console.log("Starting resume generation process...");
generateResume('en');
generateResume('ja');
generateResume('tr');
console.log("Resume generation process called for all languages.");