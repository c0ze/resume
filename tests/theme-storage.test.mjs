import test from 'node:test';
import assert from 'node:assert/strict';
import * as Theme from '../client/src/contexts/ThemeContext.res.mjs';

// The theme is read during React's first render. If localStorage throws
// (blocked site data, some private modes) and the read is not guarded, the
// whole page fails to hydrate, so these run against the compiled module.
function storage(t, getItem) {
  const priorWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const priorStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem } });
  t.after(() => {
    if (priorWindow) Object.defineProperty(globalThis, 'window', priorWindow);
    else delete globalThis.window;
    if (priorStorage) Object.defineProperty(globalThis, 'localStorage', priorStorage);
    else delete globalThis.localStorage;
  });
}

test('stored theme respects a saved rendition', (t) => {
  storage(t, () => 'night-hc');
  assert.equal(Theme.themeToString(Theme.getStoredTheme()), 'night-hc');
});

test('ids stored by earlier designs migrate by role', (t) => {
  // The previous live site stored light/light-hc/dark/dark-hc; a returning
  // reader keeps their light/dark and contrast choice rather than being reset.
  const expected = { light: 'xerox', 'light-hc': 'xerox-hc', dark: 'night', 'dark-hc': 'night-hc', ruled: 'xerox', 'carbon-copy-hc': 'night-hc' };
  for (const [legacy, current] of Object.entries(expected)) {
    assert.equal(Theme.themeToString(Theme.themeFromString(legacy)), current, legacy);
  }
});

test('denied storage uses the default instead of crashing hydration', (t) => {
  storage(t, () => { throw new Error('Storage blocked'); });
  assert.equal(Theme.themeToString(Theme.getStoredTheme()), 'xerox');
});

test('a missing value uses the default', (t) => {
  storage(t, () => null);
  assert.equal(Theme.themeToString(Theme.getStoredTheme()), 'xerox');
});

// The blocking bootstrap in client/index.html runs before first paint, outside
// React. It must survive the same failures, and it must not let a theme failure
// cost the language (or the reverse).
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const indexHtml = readFileSync(new URL('../client/index.html', import.meta.url), 'utf8');
const bootstrap = indexHtml.match(/<script>\s*(\(function \(\) \{[\s\S]*?\}\)\(\);)\s*<\/script>/)[1];

function runBootstrap(store) {
  const classes = new Set();
  const root = { classList: { add: (c) => classes.add(c) }, style: {}, lang: 'en' };
  const written = {};
  const themeColor = { content: '#efede6' };
  vm.runInNewContext(bootstrap, {
    document: {
      documentElement: root,
      querySelector: (selector) => (selector === 'meta[name="theme-color"]' ? themeColor : null),
    },
    localStorage: {
      getItem: (k) => store(k),
      setItem: (k, v) => { written[k] = v; },
    },
  });
  return {
    classes: [...classes].sort(),
    colorScheme: root.style.colorScheme,
    lang: root.lang,
    written,
    themeColor: themeColor.content,
  };
}

test('bootstrap paints the default rendition when storage is blocked', () => {
  const r = runBootstrap(() => { throw new Error('Storage blocked'); });
  assert.deepEqual(r.classes, ['xerox']);
  assert.equal(r.colorScheme, 'light');
  assert.equal(r.lang, 'en');
});

test('bootstrap still applies the language when the theme read fails', () => {
  const r = runBootstrap((k) => { if (k === 'resume-theme') throw new Error('blocked'); return 'ja'; });
  assert.deepEqual(r.classes, ['xerox']);
  assert.equal(r.lang, 'ja');
});

test('bootstrap migrates a legacy id and writes the new one back', () => {
  const r = runBootstrap((k) => (k === 'resume-theme' ? 'dark-hc' : 'tr'));
  assert.deepEqual(r.classes, ['dark', 'night-hc']);
  assert.equal(r.colorScheme, 'dark');
  assert.equal(r.lang, 'tr');
  assert.deepEqual(r.written, { 'resume-theme': 'night-hc' });
});

test('bootstrap ignores values that are not renditions, including prototype keys', () => {
  for (const bad of ['constructor', '__proto__', 'toString', 'nonsense']) {
    const r = runBootstrap((k) => (k === 'resume-theme' ? bad : null));
    assert.deepEqual(r.classes, ['xerox'], bad);
    assert.deepEqual(r.written, {}, bad);
  }
});

// The browser chrome (theme-color) should match the page, which follows the
// stored rendition, not the OS light/dark setting: a reader on a dark OS sees
// the default paper-coloured xerox page and should get a paper-coloured bar.
const renditionBg = Object.fromEntries(
  [...readFileSync(new URL('../client/src/theme.css', import.meta.url), 'utf8')
    .matchAll(/^\.([\w-]+) \{\n  --bg: (#[0-9a-f]{6});/gm)].map((m) => [m[1], m[2]])
);

test('index.html has one theme-color meta, not one per OS colour scheme', () => {
  const metas = indexHtml.match(/<meta name="theme-color"[^>]*>/g) ?? [];
  assert.equal(metas.length, 1);
  assert.doesNotMatch(metas[0], /media=/);
  assert.match(metas[0], new RegExp(`content="${renditionBg.xerox}"`));
});

test("bootstrap sets theme-color to the rendition's --bg", () => {
  assert.deepEqual(Object.keys(renditionBg).sort(), ['night', 'night-hc', 'xerox', 'xerox-hc']);
  for (const [id, bg] of Object.entries(renditionBg)) {
    assert.equal(runBootstrap((k) => (k === 'resume-theme' ? id : null)).themeColor, bg, id);
  }
  assert.equal(runBootstrap(() => { throw new Error('blocked'); }).themeColor, renditionBg.xerox);
});

test("switching rendition sets theme-color to the page's --bg", (t) => {
  const classes = new Set();
  const themeColor = { content: '#efede6' };
  const root = {
    classList: { add: (...c) => c.forEach((x) => classes.add(x)), remove: (...c) => c.forEach((x) => classes.delete(x)) },
    style: {},
  };
  const prior = ['document', 'getComputedStyle', 'localStorage'].map((k) => [k, Object.getOwnPropertyDescriptor(globalThis, k)]);
  const define = (k, value) => Object.defineProperty(globalThis, k, { configurable: true, value });
  define('document', {
    documentElement: root,
    querySelector: (selector) => (selector === 'meta[name="theme-color"]' ? themeColor : null),
  });
  define('getComputedStyle', (el) => ({
    getPropertyValue: (name) => (el === root && name === '--bg' ? ` ${renditionBg[[...classes].find((c) => c in renditionBg)]}` : ''),
  }));
  define('localStorage', { setItem() {} });
  t.after(() => {
    for (const [k, d] of prior) {
      if (d) Object.defineProperty(globalThis, k, d);
      else delete globalThis[k];
    }
  });

  Theme.applyThemeToDOM('night', true);
  assert.equal(themeColor.content, renditionBg.night);
  Theme.applyThemeToDOM('xerox-hc', false);
  assert.equal(themeColor.content, renditionBg['xerox-hc']);
});
