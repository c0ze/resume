import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fieldLabel, splitSpokenLanguages } from '../scripts/labels.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LANGUAGES = ['en', 'ja', 'tr'];

test('fieldLabel appends exactly one separator, whatever the label ends with', () => {
  assert.equal(fieldLabel('Spoken languages:'), 'Spoken languages: ');
  assert.equal(fieldLabel('Konuşulan diller:'), 'Konuşulan diller: ');
  assert.equal(fieldLabel('言語'), '言語: ');
  assert.equal(fieldLabel('言語：'), '言語: ');
  assert.equal(fieldLabel('Spoken languages'), 'Spoken languages: ');
  assert.equal(fieldLabel('Spoken languages :'), 'Spoken languages: ');
  assert.equal(fieldLabel('Spoken languages \t: \n'), 'Spoken languages: ');
  assert.equal(fieldLabel('言語　：　'), '言語: ');
  assert.equal(fieldLabel('Spoken languages::'), 'Spoken languages: ');
});

test('missing or blank labels keep the separator without printing undefined', () => {
  // Content loading can yield a missing field; composition must remain safe
  // and preserve the separator contract for the following value.
  for (const label of ['', undefined, ' \t\n']) {
    assert.equal(fieldLabel(label) + 'Turkish (Native)', ': Turkish (Native)');
  }
});

test('fieldLabel is idempotent and honours a custom separator', () => {
  assert.equal(fieldLabel(fieldLabel('言語').trim()), '言語: ');
  assert.equal(fieldLabel('言語', '：'), '言語：');
});

test('no shipped about.languages value produces a doubled colon', () => {
  // The regression: en and tr carried their own trailing colon while ja did
  // not, so the generators printed "Spoken languages:: …".
  for (const lang of LANGUAGES) {
    const about = JSON.parse(
      fs.readFileSync(path.join(projectRoot, 'content', lang, 'about.json'), 'utf8'),
    );
    const composed = fieldLabel(about.languages) + about.languagesContent;
    assert.doesNotMatch(composed, /[:：]\s*[:：]/, `${lang}: doubled separator in "${composed.slice(0, 40)}…"`);
    assert.match(composed, /[:：]/, `${lang}: separator missing entirely`);
  }
});

test('labels that are printed as-is keep their own trailing colon', () => {
  // These are NOT passed through fieldLabel — the generators print them
  // verbatim, so the colon in the content file is load-bearing.
  for (const lang of LANGUAGES) {
    const read = (f) =>
      JSON.parse(fs.readFileSync(path.join(projectRoot, 'content', lang, f), 'utf8'));
    assert.match(read('pdf_meta.json').generatedOn, /[:：]$/, `${lang}: pdf_meta.generatedOn`);
    const info = read('education.json').entries?.[0]?.additionalInfo;
    if (info?.title) assert.match(info.title, /[:：]$/, `${lang}: additionalInfo.title`);
  }
});

test('splitSpokenLanguages keeps a certificate comma inside its language', () => {
  assert.deepEqual(
    splitSpokenLanguages('Turkish (Native), English (Near Native; TOEFL 263, 2004), Japanese (Business; JLPT Level 2, 2006)'),
    ['Turkish (Native)', 'English (Near Native; TOEFL 263, 2004)', 'Japanese (Business; JLPT Level 2, 2006)'],
  );
  assert.deepEqual(
    splitSpokenLanguages('トルコ語（母語）、英語（準ネイティブ／TOEFL 263・2004年）'),
    ['トルコ語（母語）', '英語（準ネイティブ／TOEFL 263・2004年）'],
  );
  assert.deepEqual(splitSpokenLanguages(undefined), []);
});

test('every shipped languages line splits into the same three languages', () => {
  // The rail, the PDF line breaks and the JSON Resume all count on this.
  for (const lang of LANGUAGES) {
    const about = JSON.parse(fs.readFileSync(path.join(projectRoot, 'content', lang, 'about.json'), 'utf8'));
    assert.equal(splitSpokenLanguages(about.languagesContent).length, 3, lang);
  }
});
