import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { translations } from './translations.js';

// Function to generate resume PDF for a specific language
function generateResume(language) {
  const t = translations[language];
  
  // Create a PDF document with Unicode font support
  const doc = new PDFDocument({
    size: 'A4',
    margins: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50
    },
    info: {
      Title: t.pdf.title,
      Author: t.pdf.author,
      Subject: t.pdf.subject,
      Keywords: t.pdf.keywords,
    },
    // Explicitly set PDF for UTF-8 compatibility
    lang: language,
    pdfVersion: '1.7',
    tagged: true,
    displayTitle: true,
    // Tell PDFKit to interpret all strings as UTF-8
    autoFirstPage: true
  });
  
  // Determine output file name based on language
  let outputFile = 'public/resume.pdf';
  if (language === 'ja') {
    outputFile = 'public/resume-ja.pdf';
  } else if (language === 'tr') {
    outputFile = 'public/resume-tr.pdf';
  }
  
  // Pipe the PDF document to a file with explicit UTF-8 encoding
  const stream = fs.createWriteStream(outputFile, { encoding: 'utf8' });
  doc.pipe(stream);

  // Define colors and styles
  const colors = {
    primary: '#3B82F6',
    secondary: '#1E40AF',
    text: '#1F2937',
    lightText: '#6B7280',
    background: '#F9FAFB'
  };

  // Define standard fonts for Unicode support
  const boldFont = 'Helvetica-Bold';
  const regularFont = 'Helvetica';
  
  // Helper function to ensure UTF-8 text rendering
  const renderText = (text, options = {}) => {
    // Ensure text is properly encoded as UTF-8
    const utf8Text = text;
    return doc.text(utf8Text, Object.assign({
      characterSpacing: 0,
      wordSpacing: 0,
      lineGap: 0,
    }, options));
  };

  // Helper function for section headers with UTF-8 support
  function addSectionHeader(text) {
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor(colors.primary);
    renderText(text, { underline: true });
    doc.moveDown(0.5);
  }

  // Helper function for subsection headers with UTF-8 support
  function addSubsectionHeader(title, subtitle, dates) {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor(colors.text);
    renderText(title, { continued: false });
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor(colors.primary);
    renderText(subtitle, { continued: false });
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor(colors.lightText);
    renderText(dates);
    doc.moveDown(0.2);
  }

  // Header with UTF-8 support
  doc.fontSize(24)
     .font(boldFont)
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

  // Job 1 with UTF-8 support
  addSubsectionHeader(t.experience.job1.title, t.experience.job1.company, t.experience.job1.period);
  doc.fontSize(10)
     .font(regularFont)
     .fillColor(colors.text);
  renderList(t.experience.job1.responsibilities);
  doc.moveDown(0.5);

  // Job 2 with UTF-8 support
  addSubsectionHeader(t.experience.job2.title, t.experience.job2.company, t.experience.job2.period);
  doc.fontSize(10)
     .font(regularFont)
     .fillColor(colors.text);
  renderList(t.experience.job2.responsibilities);
  doc.moveDown(0.5);

  // Job 3 with UTF-8 support
  addSubsectionHeader(t.experience.job3.title, t.experience.job3.company, t.experience.job3.period);
  doc.fontSize(10)
     .font(regularFont)
     .fillColor(colors.text);
  renderList(t.experience.job3.responsibilities);
  doc.moveDown(1);

  // Education
  addSectionHeader(t.education.title);

  // University with UTF-8 support
  addSubsectionHeader(t.education.university.degree, t.education.university.institution, t.education.university.period);
  doc.fontSize(10)
     .font(regularFont)
     .fillColor(colors.text);
  renderText(t.education.university.description);
  doc.moveDown(0.3);
  renderText(t.education.university.additionalInfo);
  doc.moveDown(0.5);

  // High School with UTF-8 support
  addSubsectionHeader(t.education.highSchool.degree, t.education.highSchool.institution, t.education.highSchool.period);
  doc.fontSize(10)
     .font(regularFont)
     .fillColor(colors.text);
  renderText(t.education.highSchool.description);
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

  // Project 1 with UTF-8 support
  addSubsectionHeader(t.projects.project1.title, t.projects.project1.technologies, '');
  doc.fontSize(10)
     .font(regularFont)
     .fillColor(colors.text);
  renderText(t.projects.project1.description);
  doc.moveDown(0.5);

  // Project 2 with UTF-8 support
  addSubsectionHeader(t.projects.project2.title, t.projects.project2.technologies, '');
  doc.fontSize(10)
     .font(regularFont)
     .fillColor(colors.text);
  renderText(t.projects.project2.description);
  doc.moveDown(0.5);

  // Project 3 with UTF-8 support
  addSubsectionHeader(t.projects.project3.title, t.projects.project3.technologies, '');
  doc.fontSize(10)
     .font(regularFont)
     .fillColor(colors.text);
  renderText(t.projects.project3.description);
  doc.moveDown(0.5);

  // Project 4 with UTF-8 support
  addSubsectionHeader(t.projects.project4.title, t.projects.project4.technologies, '');
  doc.fontSize(10)
     .font(regularFont)
     .fillColor(colors.text);
  renderText(t.projects.project4.description);
  doc.moveDown(1);

  // Footer with UTF-8 support
  const footerY = doc.page.height - 50;
  doc.fontSize(9)
     .font(regularFont)
     .fillColor(colors.lightText);
  renderText(`${t.pdf.generatedOn} ` + new Date().toLocaleDateString(), 
    { align: 'center', lineBreak: false, continued: false, width: doc.page.width - 100, x: 50, y: footerY });

  // Finalize the PDF and end the stream
  doc.end();
  
  console.log(`Generated ${outputFile} for language: ${language}`);
}

// Generate resumes for all languages
generateResume('en');
generateResume('ja');
generateResume('tr');