import test from 'node:test';
import assert from 'node:assert/strict';

import { loadContent } from '../scripts/content.mjs';

// The generators used to log a bad content file and carry on with {}, so the
// build exited 0 and shipped downloads with "undefined" in them. A content
// file that cannot be read must stop the build.
test('loadContent reads a content file', () => {
  assert.equal(loadContent('en', 'header').title, 'Arda Karaduman');
});

test('loadContent throws, naming the file, when it cannot read one', () => {
  assert.throws(() => loadContent('xx', 'header'), /content[\\/]xx[\\/]header\.json/);
});
