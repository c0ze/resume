import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const SCHEMA_URL = 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json';

function loadContent(language, section) {
  const filePath = path.join(projectRoot, 'content', language, `${section}.json`);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error loading content file: ${filePath}`, error);
    return {};
  }
}

// Extract JSON Resume iso8601 dates ("YYYY") from a free-form period string.
// "2024 - Present" → { startDate: "2024" }; "2020 - 2023" → both;
// "2014" → { startDate: "2014", endDate: "2014" }.
// Localized "present" markers (現在, Halen, …) simply carry no year.
function parsePeriod(period) {
  if (typeof period !== 'string' || period.trim() === '') return {};

  const [start, end] = period.split(/\s*[-–]\s*/);
  const startYear = start?.match(/\d{4}/)?.[0];
  const endYear = (end ?? start)?.match(/\d{4}/)?.[0];

  const dates = {};
  if (startYear) dates.startDate = startYear;
  if (endYear) dates.endDate = endYear;
  return dates;
}

// Split "Chofu, Tokyo" / "調布市、東京都" into JSON Resume location parts.
function parseLocation(location) {
  if (typeof location !== 'string' || location.trim() === '') return undefined;

  const parts = location.split(/[,、]/).map((part) => part.trim()).filter(Boolean);
  if (parts.length === 2) return { city: parts[0], region: parts[1] };
  return { address: location };
}

// Parse "Turkish (Native), English (Near Native)" into language entries.
function parseLanguages(languagesContent) {
  if (typeof languagesContent !== 'string' || languagesContent.trim() === '') return [];

  return languagesContent
    .split(/[,、]\s*/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const match = entry.match(/^(.*?)\s*[（(]([^)）]*)[)）]$/);
      if (match) return { language: match[1], fluency: match[2] };
      return { language: entry };
    });
}

function profileUsername(url) {
  const segments = new URL(url).pathname.split('/').filter(Boolean);
  return segments[segments.length - 1];
}

// ── Generator ───────────────────────────────────────────────────────
function generateJsonResume(language) {
  const t = {
    header: loadContent(language, 'header'),
    about: loadContent(language, 'about'),
    experience: loadContent(language, 'experience'),
    education: loadContent(language, 'education'),
    skills: loadContent(language, 'skills'),
    projects: loadContent(language, 'projects'),
    contact: loadContent(language, 'contact'),
  };

  const summary = [t.about.paragraph1, t.about.paragraph2]
    .filter((paragraph) => typeof paragraph === 'string' && paragraph.trim() !== '')
    .join('\n\n');

  const basics = {
    name: t.header.title,
    label: t.header.subtitle,
    // The email is allowed in downloadable artifacts (like the PDF/DOCX) but
    // must never be rendered into the site HTML.
    email: t.header.contactViaEmail,
    url: t.header.website,
    summary,
    location: parseLocation(t.header.location),
    profiles: (t.contact.socialLinks ?? []).map(({ name, url }) => ({
      network: name,
      username: profileUsername(url),
      url,
    })),
  };

  // NOTE: each job also carries a web-only `abstract` (card preview + modal).
  // Like the PDF/DOCX generators, this export deliberately ignores it.
  const work = (t.experience.jobs ?? []).map((job) => ({
    name: job.company,
    position: job.title,
    ...parsePeriod(job.period),
    highlights: job.responsibilities ?? [],
  }));

  const education = (t.education.entries ?? []).map((entry) => ({
    institution: entry.institution,
    ...(entry.links?.[0]?.url ? { url: entry.links[0].url } : {}),
    studyType: entry.degree,
    ...parsePeriod(entry.period),
  }));

  const skills = (t.skills.technicalSkills ?? []).map((skill) => ({ name: skill }));

  const languages = parseLanguages(t.about.languagesContent);

  const projects = (t.projects.entries ?? []).map((project) => ({
    name: project.title,
    description: project.description,
    keywords: typeof project.technologies === 'string'
      ? project.technologies.split(/,\s*/).filter(Boolean)
      : [],
    ...(project.repo ? { url: project.repo } : {}),
  }));

  const resume = { $schema: SCHEMA_URL, basics, work, education, skills, languages, projects };

  // Omit sections with no source data.
  for (const [section, value] of Object.entries(resume)) {
    if (Array.isArray(value) && value.length === 0) delete resume[section];
  }

  const outputFile = path.join(projectRoot, 'public', `resume-${language}.json`);
  fs.writeFileSync(outputFile, `${JSON.stringify(resume, null, 2)}\n`);
  console.log(`[${language}] Successfully generated: ${outputFile}`);
}

// ── Run ─────────────────────────────────────────────────────────────
console.log('Starting JSON Resume generation...');
generateJsonResume('en');
generateJsonResume('ja');
generateJsonResume('tr');
console.log('JSON Resume generation complete.');
