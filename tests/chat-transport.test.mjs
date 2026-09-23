import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { TextDecoder, TextEncoder } from 'node:util';

// Exercise the compiled transport boundary without importing the page or making network calls.
const source = readFileSync(new URL('../client/src/components/ChatWidget.res.mjs', import.meta.url), 'utf8');
const start = source.search(/(?:var|let|const) postChat =/);
const end = source.search(/(?:var|let|const) scrollToBottom =/);
assert.ok(start >= 0 && end > start, 'compiled chat transport boundaries must exist');
const transport = source.slice(start, end) + '\nthis.postChat = postChat; this.postChatStream = postChatStream;';

async function request(parts, { method = 'postChatStream', ok = true, timeout = false } = {}) {
  const events = [];
  let cancelled = 0;
  let deadline;
  let signal;
  const reader = {
    async read() {
      return parts.length ? { done: false, value: new TextEncoder().encode(parts.shift()) } : { done: true };
    },
    async cancel() { cancelled++; },
  };
  const context = vm.createContext({
    TextDecoder, AbortController,
    setTimeout(fn) { deadline = fn; return 1; },
    clearTimeout() {},
    fetch(_url, options) {
      signal = options.signal;
      if (timeout) return new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('aborted')));
        queueMicrotask(() => deadline());
      });
      return Promise.resolve({ ok, body: { getReader: () => reader }, json: async () => ({ reply: 'untrusted error body' }) });
    },
  });
  vm.runInContext(transport, context);
  await new Promise((resolve) => {
    const done = (text) => { events.push(['done', text]); resolve(); };
    const error = () => { events.push(['error']); resolve(); };
    if (method === 'postChat') context.postChat('hello', [], done, error);
    else context.postChatStream('hello', [], (text) => events.push(['chunk', text]), done, error);
  });
  await new Promise((resolve) => setImmediate(resolve));
  return { events, cancelled, signal };
}

test('empty stream reports failure instead of inserting an empty reply', async () => {
  assert.deepEqual((await request([])).events, [['error']]);
});

test('interrupted reply reports failure after preserving its received text', async () => {
  assert.deepEqual((await request(['data: {"type":"chunk","text":"partial"}\n\n'])).events,
    [['chunk', 'partial'], ['error']]);
});

test('completion closes the reader and ignores following events', async () => {
  const result = await request(['data: {"type":"done","text":"complete"}\n\ndata: {"type":"chunk","text":"stale"}\n\n']);
  assert.deepEqual(result.events, [['done', 'complete']]);
  assert.equal(result.cancelled, 1);
});

test('server error closes the reader', async () => {
  const result = await request(['data: {"type":"error","message":"failed"}\n\n']);
  assert.deepEqual(result.events, [['error']]);
  assert.equal(result.cancelled, 1);
});

test('fragmented CRLF and multiline data produce the complete reply', async () => {
  const result = await request(['data:{"type":"chunk",\r\ndata: "text":"hello"}\r', '\n\r\ndata: {"type":"done","text":"hello!"}\r\n\r\n']);
  assert.deepEqual(result.events, [['chunk', 'hello'], ['done', 'hello!']]);
});

test('malformed payloads cannot prevent a later valid completion', async () => {
  const result = await request(['data: null\n\ndata: {"type":"done","text":42}\n\ndata: {"type":"done","text":"valid"}\n\n']);
  assert.deepEqual(result.events, [['done', 'valid']]);
});

test('unterminated final event is not accepted as completion', async () => {
  assert.deepEqual((await request(['data: {"type":"done","text":"incomplete frame"}'])).events, [['error']]);
});

test('deadline aborts a stalled request and reports failure once', async () => {
  const result = await request([], { timeout: true });
  assert.deepEqual(result.events, [['error']]);
  assert.equal(result.signal.aborted, true);
});

test('non-streaming fallback rejects an HTTP error even if it contains reply text', async () => {
  assert.deepEqual((await request([], { method: 'postChat', ok: false })).events, [['error']]);
});
