import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';

// The résumé is the family's one light-only site (DESIGN.md, "Scheme"): it
// is bone paper and prints in black, so a reader on a dark system
// must get the same page as everyone else, from the first paint. That is
// decided in the HTML template, before any script runs.
const indexHtml = readFileSync(new URL('../client/index.html', import.meta.url), 'utf8');
const ardaCss = readFileSync(new URL('../client/src/brand/arda.css', import.meta.url), 'utf8');

test('the template pins the arda theme to its light scheme', () => {
  const html = indexHtml.match(/<html [^>]*>/)[0];
  // The theme's tokens are scoped to [data-astryx-theme="arda"]; without the
  // attribute every colour and size on the page is undefined.
  assert.match(html, /\bdata-astryx-theme="arda"/);
  // Without data-theme the theme follows the system and a dark system gets ink paper.
  assert.match(html, /\bdata-theme="light"/);
  const scheme = indexHtml.match(/<meta name="color-scheme" content="([^"]*)"/);
  assert.equal(scheme?.[1], 'light', 'form controls and scrollbars stay light too');
});

test('the browser chrome takes the paper colour of the page', () => {
  // theme-color is plain HTML, so the value is repeated there; it must stay
  // the light --color-background-body of the theme it is copied from.
  const paper = ardaCss.match(/--color-background-body:\s*light-dark\((#[0-9a-fA-F]{6}),/)?.[1];
  assert.ok(paper, 'expected the light page colour in brand/arda.css');
  const metas = indexHtml.match(/<meta name="theme-color"[^>]*>/g) ?? [];
  assert.equal(metas.length, 1, 'one theme-color, not one per OS colour scheme');
  assert.doesNotMatch(metas[0], /media=/);
  assert.equal(metas[0].match(/content="([^"]*)"/)[1].toLowerCase(), paper.toLowerCase());
});

test('nothing stores or switches a scheme any more', () => {
  // A leftover rendition switch (the old "resume-theme" key, a scheme toggle)
  // would let one reader see a different résumé from the one that prints.
  const sources = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const url = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, dir);
      if (entry.isDirectory()) return entry.name === 'brand' ? [] : sources(url);
      return /\.(res|js|css)$/.test(entry.name) ? [url] : [];
    });
  for (const url of [...sources(new URL('../client/src/', import.meta.url)), new URL('../client/index.html', import.meta.url)]) {
    const text = readFileSync(url, 'utf8');
    assert.doesNotMatch(text, /resume-theme|scheme\.js|toggleScheme/, `${url.pathname} still handles a scheme`);
  }
});

// The blocking bootstrap in client/index.html runs before first paint, outside
// React. Its one job now is <html lang>: until React mounts, a screen reader
// would otherwise announce a returning Japanese or Turkish reader's page as
// English. It must survive blocked storage (some private modes throw).
const bootstrap = indexHtml.match(/<script>\s*(\(function \(\) \{[\s\S]*?\}\)\(\);)\s*<\/script>/)[1];

function runBootstrap(getItem) {
  const root = { lang: 'en' };
  vm.runInNewContext(bootstrap, { document: { documentElement: root }, localStorage: { getItem } });
  return root.lang;
}

test('bootstrap applies the stored language before first paint', () => {
  assert.equal(runBootstrap(() => 'ja'), 'ja');
  assert.equal(runBootstrap(() => 'tr'), 'tr');
});

test('bootstrap keeps English when storage is blocked or holds something else', () => {
  assert.equal(runBootstrap(() => { throw new Error('Storage blocked'); }), 'en');
  for (const bad of [null, 'de', 'constructor', '__proto__']) {
    assert.equal(runBootstrap(() => bad), 'en', String(bad));
  }
});
