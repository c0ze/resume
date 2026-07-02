import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const siteUrl = 'https://resume.arda.tr';

function loadContent(language, section) {
  const filePath = path.join(projectRoot, 'content', language, `${section}.json`);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error loading content file: ${filePath}`, error);
    return {};
  }
}

// Escape text values per RFC 2426 (vCard 3.0): backslash, comma, semicolon, newline.
function escapeVCardValue(value) {
  return String(value)
    .replaceAll('\\', '\\\\')
    .replaceAll(',', '\\,')
    .replaceAll(';', '\\;')
    .replaceAll(/\r?\n/g, '\\n');
}

// ── Generator ───────────────────────────────────────────────────────
function generateVCard() {
  const header = loadContent('en', 'header');

  // "Arda Karaduman" → family name "Karaduman", given name(s) "Arda".
  const nameParts = header.title.trim().split(/\s+/);
  const familyName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const givenName = nameParts.slice(0, Math.max(nameParts.length - 1, 1)).join(' ');

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCardValue(header.title)}`,
    `N:${escapeVCardValue(familyName)};${escapeVCardValue(givenName)};;;`,
    `TITLE:${escapeVCardValue(header.subtitle)}`,
    // The email is allowed in downloadable artifacts (like the PDF/DOCX) but
    // must never be rendered into the site HTML.
    `EMAIL;TYPE=INTERNET:${escapeVCardValue(header.contactViaEmail)}`,
    `URL:${siteUrl}`,
    'END:VCARD',
  ];

  const outputFile = path.join(projectRoot, 'public', 'arda.vcf');
  // vCard 3.0 requires CRLF line endings.
  fs.writeFileSync(outputFile, `${lines.join('\r\n')}\r\n`);
  console.log(`Successfully generated: ${outputFile}`);
}

// ── Run ─────────────────────────────────────────────────────────────
console.log('Starting vCard generation...');
generateVCard();
console.log('vCard generation complete.');
