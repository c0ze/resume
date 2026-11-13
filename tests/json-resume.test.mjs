// The JSON Resume files are read by other programs (resume themes, ATS
// importers), so they must follow JSON Resume schema v1.0.0 and have the same
// shape in every language. Run after `npm run build`.
//
// The schema is vendored unchanged in tests/fixtures/ (licence beside it) and
// checked with a small draft-04 validator for the keywords it uses
// (tests/helpers/json-schema.mjs), so the test needs no dependency.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validate } from './helpers/json-schema.mjs';
import { parsePeriod } from '../scripts/periods.mjs';
import { splitPlace } from '../scripts/labels.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(projectRoot, 'public');
const files = fs.readdirSync(publicDir).filter((f) => /^resume-.*\.json$/.test(f)).sort();
const read = (file) => JSON.parse(fs.readFileSync(path.join(publicDir, file), 'utf8'));
const content = (language, section) =>
  JSON.parse(fs.readFileSync(path.join(projectRoot, 'content', language, `${section}.json`), 'utf8'));
const SCHEMA = JSON.parse(fs.readFileSync(path.join(projectRoot, 'tests/fixtures/json-resume-schema-v1.0.0.json'), 'utf8'));

test('the vendored schema is JSON Resume v1.0.0, and the validator rejects what it rejects', () => {
  assert.equal(SCHEMA.$schema, 'http://json-schema.org/draft-04/schema#');
  assert.equal(SCHEMA.additionalProperties, false);
  assert.deepEqual(validate({ basics: { name: 'x' } }, SCHEMA), []);
  assert.equal(validate({ work: [{ startDate: '2021-7' }] }, SCHEMA).length, 1);
  assert.equal(validate({ work: [{ startDate: 'July 2021' }] }, SCHEMA).length, 1);
  assert.equal(validate({ basics: { location: 'Tokyo' } }, SCHEMA).length, 1);
  assert.equal(validate({ extra: 1 }, SCHEMA).length, 1);
  assert.equal(validate({ basics: { url: 'arda.tr' } }, SCHEMA).length, 1);
  assert.equal(validate({ basics: { email: 'not an email' } }, SCHEMA).length, 1);
  assert.equal(validate({ work: [{ highlights: [1] }] }, SCHEMA).length, 1);
  assert.throws(() => validate(1, { minimum: 0 }), /unsupported keyword "minimum"/);
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
      assert.ok(entry.location, `${language}: ${entry.name} has a location`);
      assert.ok(
        [`${entry.name} (${entry.location})`, `${entry.name}（${entry.location}）`].includes(jobs[i].company),
        `${language}: "${jobs[i].company}" splits into "${entry.name}" and "${entry.location}"`,
      );
    }
  }
});

// Only the last bracketed group is the place: a company whose name has
// brackets of its own keeps them.
test('splitPlace takes the place from the last bracketed group only', () => {
  assert.deepEqual(splitPlace('Veltra (Tokyo, Remote)'), { name: 'Veltra', location: 'Tokyo, Remote' });
  assert.deepEqual(splitPlace('Veltra（東京・リモート）'), { name: 'Veltra', location: '東京・リモート' });
  assert.deepEqual(splitPlace('Acme (Japan) KK (Tokyo, Onsite)'), { name: 'Acme (Japan) KK', location: 'Tokyo, Onsite' });
  assert.deepEqual(splitPlace('株式会社エー（日本）（東京・出社）'), { name: '株式会社エー（日本）', location: '東京・出社' });
  assert.deepEqual(splitPlace('Iron.io'), { name: 'Iron.io' });
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

// Periods are free text per language. Only the forms the content uses are
// read; anything else fails the build instead of turning into a wrong date
// ("Maybe 2021" is not May, 2021年13月 is not 2021).
test('parsePeriod reads the supported forms and nothing else', () => {
  assert.deepEqual(parsePeriod('2020 - 2023', 'en'), { startDate: '2020', endDate: '2023' });
  assert.deepEqual(parsePeriod('2014', 'tr'), { startDate: '2014', endDate: '2014' });
  assert.deepEqual(parsePeriod('2024 - Present', 'en'), { startDate: '2024' });
  assert.deepEqual(parsePeriod('2024 - 現在', 'ja'), { startDate: '2024' });
  assert.deepEqual(parsePeriod('2024 - Günümüz', 'tr'), { startDate: '2024' });
  assert.deepEqual(parsePeriod('July 2021 - July 2022', 'en'), { startDate: '2021-07', endDate: '2022-07' });
  assert.deepEqual(parsePeriod('APRIL 2021 - may 2022', 'en'), { startDate: '2021-04', endDate: '2022-05' });
  assert.deepEqual(parsePeriod('Temmuz 2021 - Temmuz 2022', 'tr'), { startDate: '2021-07', endDate: '2022-07' });
  // Turkish case folding: İ/I are not i/ı in Turkish.
  assert.deepEqual(parsePeriod('NİSAN 2021 - ARALIK 2021', 'tr'), { startDate: '2021-04', endDate: '2021-12' });
  assert.deepEqual(parsePeriod('2021年7月 - 2022年12月', 'ja'), { startDate: '2021-07', endDate: '2022-12' });
  for (const [period, language] of [
    ['Maybe 2021', 'en'], ['Mayıs 2021', 'en'], ['July 2021', 'tr'], ['2021年13月', 'ja'], ['2021年0月', 'ja'],
    ['Halen', 'tr'], ['2021 - Soon', 'en'], ['circa 2010', 'en'], ['2010 - 2012 - 2014', 'en'],
  ]) {
    assert.throws(() => parsePeriod(period, language), /is not a date|more than two ends/, `${language}: "${period}"`);
  }
});

test('every period in the content parses', () => {
  for (const language of ['en', 'ja', 'tr']) {
    for (const { period } of [...content(language, 'experience').jobs, ...content(language, 'education').entries]) {
      assert.doesNotThrow(() => parsePeriod(period, language), `${language}: "${period}"`);
    }
  }
});
