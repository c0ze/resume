import test from 'node:test';
import assert from 'node:assert/strict';

import { injectAppHtml } from '../scripts/build-static.mjs';

// String.prototype.replace treats $&, $1, $$ … in a string replacement as
// patterns. Rendered content that happens to contain one ("costs $$", a regex
// in a project description) must reach the page verbatim.
test('the prerendered app is injected verbatim, $-sequences included', () => {
  const template = '<body><div id="root"></div></body>';
  const html = '<p>$& $1 $$ $` $\' price: $$5</p>';
  const out = injectAppHtml(template, html);
  assert.equal(out, `<body><div id="root">${html}</div></body>`);
});

test('the outlet placeholder is used when the template has one', () => {
  assert.equal(injectAppHtml('<main><!--ssr-outlet--></main>', '<p>$&</p>'), '<main><p>$&</p></main>');
});
