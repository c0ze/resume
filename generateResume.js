import PDFDocument from 'pdfkit';
import fs from 'fs';

// Create a PDF document
const doc = new PDFDocument({
  size: 'A4',
  margins: {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
  },
  info: {
    Title: 'Arda Karaduman - Resume',
    Author: 'Arda Karaduman',
    Subject: 'Resume',
    Keywords: 'resume, software engineer, web development',
  }
});

// Pipe the PDF document to a file
doc.pipe(fs.createWriteStream('public/resume.pdf'));

// Define colors and styles
const colors = {
  primary: '#3B82F6',
  secondary: '#1E40AF',
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#F9FAFB'
};

// Helper function for section headers
function addSectionHeader(text) {
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor(colors.primary)
     .text(text, { underline: true })
     .moveDown(0.5);
}

// Helper function for subsection headers
function addSubsectionHeader(title, subtitle, dates) {
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor(colors.text)
     .text(title, { continued: false });
  
  doc.fontSize(11)
     .font('Helvetica')
     .fillColor(colors.primary)
     .text(subtitle, { continued: false });
  
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor(colors.lightText)
     .text(dates)
     .moveDown(0.2);
}

// Header - Name and Title
doc.fontSize(24)
   .font('Helvetica-Bold')
   .fillColor(colors.primary)
   .text('Arda Karaduman', { align: 'center' })
   .fontSize(14)
   .font('Helvetica')
   .fillColor(colors.secondary)
   .text('Full Stack Developer', { align: 'center' })
   .moveDown(0.5);

// Contact Info
doc.fontSize(10)
   .font('Helvetica')
   .fillColor(colors.text)
   .text('Location: Tokyo, Japan', { align: 'center' })
   .text('Email: me@arda.karaduman.web.tr', { align: 'center' })
   .text('Website: arda.karaduman.web.tr', { align: 'center' })
   .moveDown(1.5);

// About Me
addSectionHeader('About Me');
doc.fontSize(11)
   .font('Helvetica')
   .fillColor(colors.text)
   .text('I am a passionate and versatile software engineer with expertise in web development, particularly with React and JavaScript/TypeScript. With a strong background in building user-focused applications, I excel at creating clean, efficient code and innovative solutions to complex problems.', { align: 'justify' })
   .moveDown(0.5);
doc.text('My experience spans from front-end development to back-end services, with a particular focus on creating responsive, accessible, and performance-optimized web applications. I\'m constantly exploring new technologies and methodologies to improve my craft and deliver better results.', { align: 'justify' })
   .moveDown(1);

// Languages
doc.fontSize(11)
   .font('Helvetica-Bold')
   .fillColor(colors.text)
   .text('Languages:')
   .fontSize(11)
   .font('Helvetica')
   .fillColor(colors.text)
   .text('Turkish (Native), English (Fluent), Japanese (Daily Conversation)')
   .moveDown(1);

// Work Experience
addSectionHeader('Work Experience');

// Job 1
addSubsectionHeader('Senior Software Engineer', 'Trendyol', '2021 - Present');
doc.fontSize(10)
   .font('Helvetica')
   .fillColor(colors.text);
doc.list([
  'Led front-end development for the e-commerce platform serving millions of daily users',
  'Implemented performance optimizations that reduced page load times by 30%',
  'Collaborated with cross-functional teams to deliver feature-rich web applications',
  'Mentored junior developers and established best practices for the front-end team'
], { bulletRadius: 2, textIndent: 10 });
doc.moveDown(0.5);

// Job 2
addSubsectionHeader('Frontend Developer', 'Getir', '2019 - 2021');
doc.fontSize(10)
   .font('Helvetica')
   .fillColor(colors.text);
doc.list([
  'Developed and maintained user interfaces for the fast-delivery application',
  'Built responsive web applications using React and TypeScript',
  'Participated in architectural decisions for frontend infrastructure',
  'Improved application accessibility and user experience'
], { bulletRadius: 2, textIndent: 10 });
doc.moveDown(0.5);

// Job 3
addSubsectionHeader('Software Developer', 'Teknasyon', '2017 - 2019');
doc.fontSize(10)
   .font('Helvetica')
   .fillColor(colors.text);
doc.list([
  'Contributed to mobile applications and web services development',
  'Implemented RESTful APIs using Node.js and Express',
  'Collaborated with UX/UI designers to implement intuitive user interfaces',
  'Participated in code reviews and testing implementation'
], { bulletRadius: 2, textIndent: 10 });
doc.moveDown(1);

// Education
addSectionHeader('Education');

// University
addSubsectionHeader('Computer Engineering', 'Istanbul Technical University', '2013 - 2017');
doc.fontSize(10)
   .font('Helvetica')
   .fillColor(colors.text)
   .text('Bachelor\'s Degree with focus on software development, algorithms, and data structures.')
   .moveDown(0.3);
doc.text('Notable coursework: Web Programming, Database Systems, Software Engineering, Computer Networks')
   .moveDown(0.5);

// High School
addSubsectionHeader('Science High School', 'Istanbul Erkek Lisesi', '2009 - 2013');
doc.fontSize(10)
   .font('Helvetica')
   .fillColor(colors.text)
   .text('Graduated with high honors, focusing on mathematics and science.')
   .moveDown(1);

// Skills
addSectionHeader('Skills');

// Technical Skills
doc.fontSize(11)
   .font('Helvetica-Bold')
   .fillColor(colors.text)
   .text('Technical Skills:')
   .fontSize(10)
   .font('Helvetica')
   .fillColor(colors.text);
doc.list([
  'JavaScript/TypeScript - Advanced',
  'React - Advanced',
  'HTML5/CSS3 - Advanced',
  'Node.js - Proficient',
  'Redux - Proficient'
], { bulletRadius: 2, textIndent: 10 });
doc.moveDown(0.5);

// Tech Stack
doc.fontSize(11)
   .font('Helvetica-Bold')
   .fillColor(colors.text)
   .text('Tech Stack:')
   .fontSize(10)
   .font('Helvetica')
   .fillColor(colors.text)
   .text('Next.js, Express, GraphQL, MongoDB, PostgreSQL, Docker, AWS, Git')
   .moveDown(0.5);

// Soft Skills
doc.fontSize(11)
   .font('Helvetica-Bold')
   .fillColor(colors.text)
   .text('Soft Skills:')
   .fontSize(10)
   .font('Helvetica')
   .fillColor(colors.text)
   .text('Team Leadership, Problem Solving, Communication, Agile Methodologies, Mentoring, Project Management')
   .moveDown(1);

// Projects
addSectionHeader('Featured Projects');

// Project 1
addSubsectionHeader('E-commerce Performance Optimization', 'React, Next.js, Performance', '');
doc.fontSize(10)
   .font('Helvetica')
   .fillColor(colors.text)
   .text('Implemented critical rendering path optimizations, resulting in a 30% improvement in load time and 20% increase in conversion rates.')
   .moveDown(0.5);

// Project 2
addSubsectionHeader('Analytics Dashboard', 'React, D3.js, REST API', '');
doc.fontSize(10)
   .font('Helvetica')
   .fillColor(colors.text)
   .text('Designed and built a real-time analytics dashboard using React and D3.js, providing actionable insights for business stakeholders.')
   .moveDown(0.5);

// Project 3
addSubsectionHeader('Team Collaboration Tool', 'Node.js, Socket.io, MongoDB', '');
doc.fontSize(10)
   .font('Helvetica')
   .fillColor(colors.text)
   .text('Built a real-time collaboration tool with WebSockets for team communication, task management, and document sharing.')
   .moveDown(0.5);

// Project 4
addSubsectionHeader('Mobile App Integration', 'Express, GraphQL, React Native', '');
doc.fontSize(10)
   .font('Helvetica')
   .fillColor(colors.text)
   .text('Developed a cross-platform API system to integrate web services with mobile applications, enabling seamless data synchronization.')
   .moveDown(1);

// Footer
const footerY = doc.page.height - 50;
doc.fontSize(9)
   .font('Helvetica')
   .fillColor(colors.lightText)
   .text('This resume was generated on ' + new Date().toLocaleDateString(), 50, footerY, { align: 'center' });

// Finalize the PDF and end the stream
doc.end();