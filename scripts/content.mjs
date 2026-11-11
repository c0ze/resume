// Content loading shared by the PDF, DOCX, JSON Resume and vCard generators.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const contentRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'content');

// Parse content/<language>/<section>.json. A file that is missing or is not
// valid JSON throws, so the generator exits non-zero and the build stops,
// instead of carrying on with {} and shipping "undefined" in a download.
export function loadContent(language, section) {
  const filePath = path.join(contentRoot, language, `${section}.json`);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot load content file ${filePath}: ${error.message}`, { cause: error });
  }
}
