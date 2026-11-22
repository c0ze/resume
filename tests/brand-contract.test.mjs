import test from 'node:test';
import assert from 'node:assert/strict';

import { BRAND_FILES, compareWithContract, readBrandFile, sha256 } from '../scripts/check-brand-contract.mjs';

// The brand files in client/src/brand/ are verbatim copies of arda.tr's. The
// check exists so an edited or outdated copy is noticed; these tests pin the
// three outcomes it must tell apart.
const files = { 'arda.css': 'a{}', 'arda.js': 'export {}', 'brand.css': 'b{}', 'scheme.js': '//' };
const read = (name) => (name in files ? Buffer.from(files[name]) : null);
const contract = (version, overrides = {}) => ({
  version,
  files: Object.fromEntries(
    Object.entries(files).map(([name, text]) => [name, { sha256: overrides[name] ?? sha256(Buffer.from(text)) }])
  ),
});

test('identical copies pass against a v4 contract', () => {
  const result = compareWithContract(contract(4), read);
  assert.equal(result.ok, true);
  assert.deepEqual(result.checked, BRAND_FILES);
  assert.deepEqual(result.mismatches, []);
});

test('an edited or outdated copy fails, and the file is named', () => {
  const result = compareWithContract(contract(4, { 'brand.css': 'f'.repeat(64) }), read);
  assert.equal(result.ok, false);
  assert.equal(result.mismatches.length, 1);
  assert.match(result.mismatches[0], /^brand\.css: /);
});

test('a contract older than v4 has no hashes: a note, and a pass', () => {
  // arda.tr main publishes v3 until its rebrand merges; that must not fail here.
  const result = compareWithContract({ version: 3, themes: [] }, read);
  assert.equal(result.ok, true);
  assert.deepEqual(result.checked, []);
  assert.equal(result.notes.length, 1);
});

test('a contract newer than v4 fails instead of passing unread', () => {
  assert.equal(compareWithContract(contract(5), read).ok, false);
});

test('a file this site does not carry is skipped; carrying none fails', () => {
  const partial = compareWithContract(contract(4), (name) => (name === 'scheme.js' ? null : read(name)));
  assert.equal(partial.ok, true);
  assert.deepEqual(partial.checked, ['arda.css', 'arda.js', 'brand.css']);
  assert.equal(compareWithContract(contract(4), () => null).ok, false);
});

test('a hash missing from the contract fails', () => {
  const broken = contract(4);
  delete broken.files['arda.js'];
  const result = compareWithContract(broken, read);
  assert.equal(result.ok, false);
  assert.match(result.mismatches[0], /^arda\.js: /);
});

test('this site carries all four brand files', () => {
  for (const name of BRAND_FILES) assert.ok(readBrandFile(name), `client/src/brand/${name} is missing`);
});
