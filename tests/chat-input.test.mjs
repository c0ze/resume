import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The ai.arda.tr bot rejects a message over 20,000 characters with a 400,
// which the widget can only report as a connection error, so the input must
// not accept a longer one. The input is not in the prerendered page (the chat
// opens on demand), so this reads the props the compiled widget gives it.
const source = readFileSync(new URL('../client/src/components/ChatWidget.res.mjs', import.meta.url), 'utf8');

test('the chat input is capped at the bot\'s 20,000-character limit', () => {
  const input = source.match(/JsxRuntime\.jsx\("input", \{([\s\S]*?)\}\)/);
  assert.ok(input, 'expected the compiled chat <input>');
  assert.match(input[1], /type: "text"/);
  assert.match(input[1], /maxLength: 20000\b/);
});
