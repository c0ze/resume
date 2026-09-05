import test from 'node:test';
import assert from 'node:assert/strict';
import * as Theme from '../client/src/contexts/ThemeContext.res.mjs';

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
  storage(t, () => 'dark-hc');
  assert.equal(Theme.themeToString(Theme.getStoredTheme()), 'dark-hc');
});

test('denied storage uses the default instead of crashing hydration', (t) => {
  storage(t, () => { throw new Error('Storage blocked'); });
  assert.equal(Theme.themeToString(Theme.getStoredTheme()), 'light');
});
