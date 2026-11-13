import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadContent } from './content.mjs';
import { applyFlavor, artifactBase, flavorTargets } from './flavors.mjs';
import { splitSpokenLanguages } from './labels.mjs';
import { parsePeriod } from './periods.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const SCHEMA_URL = 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json';

// The résumé's location is in Japan; the content names no country.
const COUNTRY_CODE = 'JP';

// Split the header location into JSON Resume parts: "Chofu, Tokyo" (en, tr)
// is city, region; "東京都調布市" (ja) is prefecture then municipality.
function parseLocation(location) {
  if (typeof location !== 'string' || location.trim() === '') return undefined;

  const ja = location.trim().match(/^(.+?[都道府県])(.+?[市区町村])$/u);
  if (ja) return { city: ja[2], region: ja[1], countryCode: COUNTRY_CODE };
  const parts = location.split(/[,、]/).map((part) => part.trim()).filter(Boolean);
  if (parts.length === 2) return { city: parts[0], region: parts[1], countryCode: COUNTRY_CODE };
  return { address: location, countryCode: COUNTRY_CODE };
}

// "Veltra (Tokyo, Remote)" / "Veltra（東京・リモート）" → the company and the
// place, with the regex the page uses (client/src/components/Section.res,
// splitPlace).
function splitPlace(company) {
  const match = String(company ?? '').match(/^(.*?)\s*[（(]([^()（）]*)[)）]\s*$/);
  return match ? { name: match[1], location: match[2] } : { name: String(company ?? '') };
}

// Parse "Turkish (Native), English (Near Native; TOEFL 263, 2004)" into
// language entries. Only top-level commas separate languages: a comma inside the
// brackets belongs to the certificate, which stays in `fluency`.
function parseLanguages(languagesContent) {
  if (typeof languagesContent !== 'string' || languagesContent.trim() === '') return [];

  return splitSpokenLanguages(languagesContent)
    .map((entry) => {
      const match = entry.match(/^(.*?)\s*[（(]([^)）]*)[)）]$/);
      if (match) return { language: match[1], fluency: match[2] };
      return { language: entry };
    });
}

// "2011: Cache Implementation … (IPSJ Transactions …, T-SLDM)" →
// { name, publisher, releaseDate: "2011" }. An item in another shape keeps
// its whole text as the name.
function parsePublication(item) {
  const match = item.match(/^(\d{4}):\s*(.+?)\s*[（(]([^()（）]+)[)）]$/);
  if (!match) return { name: item };
  return { name: match[2], publisher: match[3], releaseDate: match[1] };
}

function profileUsername(url) {
  const segments = new URL(url).pathname.split('/').filter(Boolean);
  return segments[segments.length - 1];
}

// ── Generator ───────────────────────────────────────────────────────
function generateJsonResume(language, flavor = null) {
  const base = {
    header: loadContent(language, 'header'),
    about: loadContent(language, 'about'),
    experience: loadContent(language, 'experience'),
    education: loadContent(language, 'education'),
    skills: loadContent(language, 'skills'),
    projects: loadContent(language, 'projects'),
    contact: loadContent(language, 'contact'),
  };
  const t = flavor ? applyFlavor(base, flavor, language) : base;

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
    ...splitPlace(job.company),
    position: job.title,
    ...parsePeriod(job.period, language),
    highlights: job.responsibilities ?? [],
  }));

  // education.url is the institution's website in the schema; the content's
  // links are thesis repositories, which have no place in it, so they are
  // left out.
  const education = (t.education.entries ?? []).map((entry) => ({
    institution: entry.institution,
    studyType: entry.degree,
    ...parsePeriod(entry.period, language),
  }));

  const publications = (t.education.entries ?? [])
    .flatMap((entry) => entry.additionalInfo?.items ?? [])
    .map(parsePublication);

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

  const resume = { $schema: SCHEMA_URL, basics, work, education, publications, skills, languages, projects };

  // Omit sections with no source data.
  for (const [section, value] of Object.entries(resume)) {
    if (Array.isArray(value) && value.length === 0) delete resume[section];
  }

  const outputFile = path.join(projectRoot, 'public', `${artifactBase(flavor?.name, language)}.json`);
  fs.writeFileSync(outputFile, `${JSON.stringify(resume, null, 2)}\n`);
  console.log(`[${language}] Successfully generated: ${outputFile}`);
}

// ── Run ─────────────────────────────────────────────────────────────
console.log('Starting JSON Resume generation...');
generateJsonResume('en');
generateJsonResume('ja');
generateJsonResume('tr');
for (const { flavor, language } of flavorTargets()) generateJsonResume(language, flavor);
console.log('JSON Resume generation complete.');
