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

  const pdfDocOptions = {
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: { // Use data from pdf_meta.json
      Title: t.pdf.title || `Resume - ${language.toUpperCase()}`,
      Author: t.pdf.author || "Default Author",
      Subject: t.pdf.subject || `Resume (${language.toUpperCase()})`,
      Keywords: t.pdf.keywords || "resume, cv",
    },
    lang: language,
    pdfVersion: '1.7',
    tagged: true,
    displayTitle: true,
    autoFirstPage: true,
    fontSubsetting: language === 'ja' ? false : true // Disable subsetting for Japanese
  };

  const doc = new PDFDocument(pdfDocOptions);
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

  // Define monochrome colors for PDF
  const colors = {
    primary: '#000000',     // Black for main headers, titles
    secondary: '#333333',   // Dark gray for subtitles or secondary info
    text: '#000000',        // Black for body text
    lightText: '#555555',   // Lighter gray for dates, less important info
    // background: '#FFFFFF' // Background is white by default, no need to set explicitly
  };

  // Font paths relative to the script's location, then up to project root, then to public/fonts
  const fontDir = path.join(projectRoot, 'public', 'fonts');
  const notoRegularPath = path.join(fontDir, 'NotoSans-Regular.ttf');
  const notoBoldPath = path.join(fontDir, 'NotoSans-Bold.ttf');
  // const notoJPRegularPath = path.join(fontDir, 'NotoSansJP-Regular.ttf'); // No longer using NotoSansJP
  // const notoJPBoldPath = path.join(fontDir, 'NotoSansJP-Bold.ttf');    // No longer using NotoSansJP
  const ipaexgPath = path.join(fontDir, 'ipaexg.ttf'); // Path for IPAexGothic

  let regularFont = 'Helvetica';
  let boldFont = 'Helvetica-Bold';
  let customFontSuccessfullySet = false;

  if (language === 'ja') {
    console.log(`[ja] Attempting to load Japanese font (IPAexGothic)...`);
    try {
      if (!fs.existsSync(ipaexgPath)) throw new Error(`Japanese Font (IPAexGothic) not found: ${ipaexgPath}. Please download ipaexg.ttf and place it in public/fonts/`);
      
      // Register IPAexGothic for both regular and bold needs.
      // PDFKit will use the same font file; styling differences might be minimal without a dedicated bold variant.
      doc.registerFont('IPAexGothic', ipaexgPath);
      
      // Try to activate the font to force parsing by fontkit
      doc.font('IPAexGothic').text('', 0, 0); // Dummy text to trigger font processing
      
      regularFont = 'IPAexGothic';
      boldFont = 'IPAexGothic'; // Use the same for bold
      customFontSuccessfullySet = true;
      console.log(`[ja] Successfully registered and tested Japanese font (IPAexGothic).`);
    } catch (e) {
      console.error(`[ja] ERROR loading/using Japanese font (IPAexGothic): ${e.message}`);
      console.error(`[ja] This often means the font file at ${ipaexgPath} is corrupted, not valid TTF, or incompatible with the PDF font engine (fontkit).`);
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
    // Explicitly set x for section titles to ensure they obey left margin
    doc.x = doc.page.margins.left;
    // We need to ensure y is also correct if previous operations moved it unexpectedly.
    // However, addSectionHeader is usually called when y is already at a new line.
    // Let's also pass the width for consistency, though underline might not need it.
    const sectionTitleWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    renderText(text, { underline: true, width: sectionTitleWidth });
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
  // Revert to using align: 'center' with explicit bounding box based on margins
  const contentAreaWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  
  // Manually set starting Y position for the entire header block
  doc.y = doc.page.margins.top;

  doc.fontSize(24).font(boldFont).fillColor(colors.primary);
  // Manual centering for the title by setting doc.x
  // Re-assign textWidth and centeredX (remove 'let')
  var textWidth = doc.widthOfString(t.header.title); // Use var or ensure not re-declared if in same block scope
  var centeredX = (doc.page.width - textWidth) / 2; // Use var or ensure not re-declared
  doc.x = centeredX;
  // doc.y is already set from doc.page.margins.top
  renderText(t.header.title); // Render at current doc.x, doc.y
  doc.moveDown(0.5);

  doc.fontSize(14).font(regularFont).fillColor(colors.secondary);
  // Manual centering for the subtitle by setting doc.x
  // Re-assign textWidth and centeredX
  textWidth = doc.widthOfString(t.header.subtitle);
  centeredX = (doc.page.width - textWidth) / 2;
  doc.x = centeredX;
  // doc.y has advanced from the previous renderText and moveDown
  renderText(t.header.subtitle); // Render at current doc.x, doc.y
  doc.moveDown(0.5);

  // Contact Info with UTF-8 support (This section is correctly centered with manual doc.x)
  doc.fontSize(10).font(regularFont).fillColor(colors.text);
  let contactLine = `${t.about.location} ${t.header.location}`;
  // Re-assign textWidth and centeredX (remove 'let' as they were declared with 'var' earlier)
  textWidth = doc.widthOfString(contactLine);
  centeredX = (doc.page.width - textWidth) / 2;
  if (language === 'ja') {
    console.log(`[ja] Contact Line 1: "${contactLine}"`);
    console.log(`[ja]   doc.page.width: ${doc.page.width}, textWidth: ${textWidth}, centeredX: ${centeredX}`);
  }
  doc.x = centeredX; // Set doc.x manually
  doc.y = doc.y;     // Maintain current y
  renderText(contactLine); // Render text at current doc.x, doc.y

  contactLine = 'Email: me@arda.karaduman.web.tr';
  textWidth = doc.widthOfString(contactLine); // Re-assign
  centeredX = (doc.page.width - textWidth) / 2; // Re-assign
  if (language === 'ja') {
    console.log(`[ja] Contact Line 2: "${contactLine}"`);
    console.log(`[ja]   doc.page.width: ${doc.page.width}, textWidth: ${textWidth}, centeredX: ${centeredX}`);
  }
  doc.x = centeredX; // Set doc.x manually
  doc.y = doc.y;     // Maintain current y (renderText implies a line feed, so y should be ok for next line)
  renderText(contactLine); // Render text at current doc.x, doc.y

  contactLine = `${t.header.website}: arda.karaduman.web.tr`;
  textWidth = doc.widthOfString(contactLine); // Re-assign
  centeredX = (doc.page.width - textWidth) / 2; // Re-assign
  if (language === 'ja') {
    console.log(`[ja] Contact Line 3: "${contactLine}"`);
    console.log(`[ja]   doc.page.width: ${doc.page.width}, textWidth: ${textWidth}, centeredX: ${centeredX}`);
  }
  doc.x = centeredX; // Set doc.x manually
  doc.y = doc.y;     // Maintain current y
  renderText(contactLine); // Render text at current doc.x, doc.y
  doc.moveDown(1.5);

  // About Me with UTF-8 support
  addSectionHeader(t.about.title); // This title seems to align correctly
  
  doc.fontSize(11)
     .font(regularFont)
     .fillColor(colors.text);
  const paragraphWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // For paragraph1: Set doc.x explicitly, then renderText without x option
  doc.x = doc.page.margins.left;
  doc.y = doc.y; // ensure y is maintained if it was moved by addSectionHeader's moveDown
  renderText(t.about.paragraph1, {
    // x: doc.page.margins.left, // Rely on current doc.x
    // align: 'justify', // Still removed for testing
    width: paragraphWidth
  });
  doc.moveDown(0.5);

  // For paragraph2: Set doc.x explicitly, then renderText without x option
  doc.x = doc.page.margins.left;
  doc.y = doc.y;
  renderText(t.about.paragraph2, {
    // x: doc.page.margins.left, // Rely on current doc.x
    // align: 'justify', // Still removed for testing
    width: paragraphWidth
  });
  doc.moveDown(1);

  // Languages with UTF-8 support
  doc.fontSize(11)
     .font(boldFont)
     .fillColor(colors.text);
  // For languages title: Set doc.x explicitly
  doc.x = doc.page.margins.left;
  doc.y = doc.y;
  renderText(`${t.about.languages}`, {
    // x: doc.page.margins.left, // Rely on current doc.x
    width: paragraphWidth
  });
  
  doc.fontSize(11)
     .font(regularFont)
     .fillColor(colors.text);
  // For languages content: Set doc.x explicitly
  doc.x = doc.page.margins.left;
  doc.y = doc.y;
  renderText(t.about.languagesContent, {
    // x: doc.page.margins.left, // Rely on current doc.x
    width: paragraphWidth
  });
  doc.moveDown(1);

  // Work Experience
  addSectionHeader(t.experience.title);

  // Helper function to render a UTF-8 friendly list
  const renderList = (items) => {
    const listWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right - 10; // Subtract indent
    items.forEach(item => {
      // We use doc.x and doc.y for list items to flow naturally after the bullet.
      // The initial x for the bullet itself will be set by the calling context or default to margin.
      // However, to ensure the whole list block respects margins, the first call to renderList
      // should be preceded by setting doc.x to doc.page.margins.left if it's a new section.
      // For now, let's ensure the text *within* renderText respects a width.
      // The indent option in PDFKit handles the bullet point's horizontal spacing.
      renderText(`• ${item}`, {
        // x: doc.page.margins.left, // Let indent handle the bullet, text flows after
        width: listWidth,
        indent: 10
      });
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
        doc.x = doc.page.margins.left; // Set x before rendering the list
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
      const itemWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      if (entry.description) {
        renderText(entry.description, { x: doc.page.margins.left, width: itemWidth });
        doc.moveDown(0.3);
      }
      if (entry.additionalInfo) {
        renderText(entry.additionalInfo, { x: doc.page.margins.left, width: itemWidth });
      }
      doc.moveDown(0.5);
    });
  }
  doc.moveDown(1);

  // Skills with UTF-8 support
  addSectionHeader(t.skills.title);
  const skillsSectionWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // Technical Skills Title
  doc.fontSize(11)
     .font(boldFont)
     .fillColor(colors.text);
  renderText(t.skills.technicalSkillsTitle, { x: doc.page.margins.left, width: skillsSectionWidth }); // Use technicalSkillsTitle
  
  doc.fontSize(10)
     .font(regularFont)
     .fillColor(colors.text);
     
  // Technical Skills List (already handled with doc.x before renderList)
  const techSkills = t.skills.technicalSkills; // Assuming technicalSkills is an array in skills.json
                                            // If not, this needs to match the JSON structure.
                                            // The hardcoded list was:
                                            // [
                                            //   'JavaScript/TypeScript - Advanced', ...
                                            // ];
  if(Array.isArray(techSkills)) {
    doc.x = doc.page.margins.left;
    renderList(techSkills);
  }
  
  doc.moveDown(0.5);

  // Tech Stack with UTF-8 support
  doc.fontSize(11)
     .font(boldFont)
     .fillColor(colors.text);
  renderText(t.skills.techStackTitle, { x: doc.page.margins.left, width: skillsSectionWidth }); // Use techStackTitle
  
  doc.fontSize(10)
     .font(regularFont)
     .fillColor(colors.text);
  renderText(t.skills.techStackItems, { x: doc.page.margins.left, width: skillsSectionWidth });
  doc.moveDown(0.5);

  // Soft Skills with UTF-8 support
  doc.fontSize(11)
     .font(boldFont)
     .fillColor(colors.text);
  renderText(t.skills.softSkillsTitle, { x: doc.page.margins.left, width: skillsSectionWidth }); // Use softSkillsTitle
  
  doc.fontSize(10)
     .font(regularFont)
     .fillColor(colors.text);
  renderText(t.skills.softSkillItems, { x: doc.page.margins.left, width: skillsSectionWidth });
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
      const projectDescWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      if (project.description) {
        renderText(project.description, { x: doc.page.margins.left, width: projectDescWidth });
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