// The JSON Resume files are read by other programs (resume themes, ATS
// importers), so they must follow JSON Resume schema v1.0.0 and have the same
// shape in every language. Run after `npm run build`.
//
// The validator below is the part of the v1.0.0 schema these files use
// (https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json):
// the top level allows only the listed sections; every other object allows
// extra properties; dates match the schema's iso8601 pattern. Written out here
// so the test needs no JSON Schema dependency.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(projectRoot, 'public');
const files = fs.readdirSync(publicDir).filter((f) => /^resume-.*\.json$/.test(f)).sort();
const read = (file) => JSON.parse(fs.readFileSync(path.join(publicDir, file), 'utf8'));
const content = (language, section) =>
  JSON.parse(fs.readFileSync(path.join(projectRoot, 'content', language, `${section}.json`), 'utf8'));

const ISO8601 = /^([1-2][0-9]{3}-[0-1][0-9]-[0-3][0-9]|[1-2][0-9]{3}-[0-1][0-9]|[1-2][0-9]{3})$/;
const string = { type: 'string' };
const strings = { type: 'array', items: string };
const uri = { type: 'string', format: 'uri' };
const date = { type: 'string', pattern: ISO8601 };
const object = (properties) => ({ type: 'object', properties });
const list = (properties) => ({ type: 'array', items: object(properties) });

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    $schema: uri,
    basics: object({
      name: string, label: string, image: string, email: { type: 'string', format: 'email' }, phone: string,
      url: uri, summary: string,
      location: object({ address: string, postalCode: string, city: string, countryCode: string, region: string }),
      profiles: list({ network: string, username: string, url: uri }),
    }),
    work: list({ name: string, location: string, description: string, position: string, url: uri,
      startDate: date, endDate: date, summary: string, highlights: strings }),
    volunteer: { type: 'array' },
    education: list({ institution: string, url: uri, area: string, studyType: string,
      startDate: date, endDate: date, score: string, courses: strings }),
    awards: { type: 'array' },
    certificates: { type: 'array' },
    publications: list({ name: string, publisher: string, releaseDate: date, url: uri, summary: string }),
    skills: list({ name: string, level: string, keywords: strings }),
    languages: list({ language: string, fluency: string }),
    interests: { type: 'array' },
    references: { type: 'array' },
    projects: list({ name: string, description: string, highlights: strings, keywords: strings,
      startDate: date, endDate: date, url: uri, roles: strings, entity: string, type: string }),
    meta: { type: 'object' },
  },
};

function validate(value, schema, at = '$') {
  const errors = [];
  const kind = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
  if (schema.type && kind !== schema.type) return [`${at}: expected ${schema.type}, got ${kind}`];
  if (schema.pattern && !schema.pattern.test(value)) errors.push(`${at}: "${value}" does not match ${schema.pattern}`);
  if (schema.format === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.push(`${at}: not an email`);
  if (schema.format === 'uri') {
    try { new URL(value); } catch { errors.push(`${at}: "${value}" is not a URI`); }
  }
  if (schema.items) value.forEach((item, i) => errors.push(...validate(item, schema.items, `${at}[${i}]`)));
  if (schema.properties) {
    for (const [key, child] of Object.entries(value)) {
      if (schema.properties[key]) errors.push(...validate(child, schema.properties[key], `${at}.${key}`));
      else if (schema.additionalProperties === false) errors.push(`${at}: unexpected property "${key}"`);
    }
  }
  return errors;
}

test('the validator rejects what the schema rejects', () => {
  assert.deepEqual(validate({ basics: { name: 'x' } }, SCHEMA), []);
  assert.equal(validate({ work: [{ startDate: '2021-7' }] }, SCHEMA).length, 1);
  assert.equal(validate({ work: [{ startDate: 'July 2021' }] }, SCHEMA).length, 1);
  assert.equal(validate({ basics: { location: 'Tokyo' } }, SCHEMA).length, 1);
  assert.equal(validate({ extra: 1 }, SCHEMA).length, 1);
  assert.equal(validate({ basics: { url: 'arda.tr' } }, SCHEMA).length, 1);
});

test('there is a JSON Resume for every language and flavour', () => {
  for (const name of ['en', 'ja', 'tr', 'backend-en', 'japan-bridge-en', 'japan-bridge-ja']) {
    assert.ok(files.includes(`resume-${name}.json`), `resume-${name}.json`);
  }
});

for (const file of files) {
  test(`${file} validates against JSON Resume schema v1.0.0`, () => {
    assert.deepEqual(validate(read(file), SCHEMA), []);
  });
}

// Every key path an importer might read, with array indices collapsed.
const shape = (value, at = '') =>
  Array.isArray(value)
    ? [...new Set(value.flatMap((item) => shape(item, `${at}[]`)))]
    : value && typeof value === 'object'
      ? Object.entries(value).flatMap(([key, child]) => shape(child, `${at}.${key}`))
      : [at];

test('the three languages have the same JSON Resume structure', () => {
  const [en, ...others] = ['en', 'ja', 'tr'].map((language) => shape(read(`resume-${language}.json`)).sort());
  for (const [i, other] of others.entries()) assert.deepEqual(other, en, ['ja', 'tr'][i]);
});

test('basics.location is a city and region in Japan in every language', () => {
  assert.deepEqual(read('resume-en.json').basics.location, { city: 'Chofu', region: 'Tokyo', countryCode: 'JP' });
  assert.deepEqual(read('resume-tr.json').basics.location, { city: 'Chofu', region: 'Tokyo', countryCode: 'JP' });
  assert.deepEqual(read('resume-ja.json').basics.location, { city: '調布市', region: '東京都', countryCode: 'JP' });
});

// "Veltra (Tokyo, Remote)": the company is the name, the place goes in the
// schema's own `location`, as the web page splits it (Section.splitPlace).
test('work entries carry the company as the name and the place as the location', () => {
  for (const language of ['en', 'ja', 'tr']) {
    const work = read(`resume-${language}.json`).work;
    const jobs = content(language, 'experience').jobs;
    assert.equal(work.length, jobs.length);
    for (const [i, entry] of work.entries()) {
      assert.doesNotMatch(entry.name, /[()（）]/, `${language}: ${entry.name}`);
      assert.ok(entry.location, `${language}: ${entry.name} has a location`);
      assert.ok(jobs[i].company.startsWith(entry.name), `${language}: ${entry.name}`);
      assert.ok(jobs[i].company.includes(entry.location), `${language}: ${entry.location}`);
    }
  }
});

// The content gives a month for the Ryde contract ("July 2021 - July 2022",
// "Temmuz 2021 - Temmuz 2022", "2021年7月 - 2022年7月"); the schema takes
// YYYY-MM, so the month must not be dropped.
test('a period with months keeps them as YYYY-MM, in every language', () => {
  for (const language of ['en', 'ja', 'tr']) {
    const ryde = read(`resume-${language}.json`).work.find((entry) => entry.name.startsWith('Ryde'));
    assert.equal(ryde.startDate, '2021-07', language);
    assert.equal(ryde.endDate, '2022-07', language);
    const veltra = read(`resume-${language}.json`).work.find((entry) => entry.name === 'Veltra');
    assert.equal(veltra.startDate, '2024', language);
    assert.equal(veltra.endDate, undefined, `${language}: an ongoing role has no end date`);
  }
});
