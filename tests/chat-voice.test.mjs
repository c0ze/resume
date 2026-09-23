import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { TextDecoder, TextEncoder } from 'node:util';

// The widget's spoken reply, end to end but offline: the compiled stream transport feeds
// mocked speech events to the real voice.js speaker (on a fake Web Audio clock), and the
// visible text is what the widget renders: revealPrefix(raw, revealed).

// ---- a fake Web Audio whose clock the test moves by hand
let clock = 0;
let stopped = 0;
const param = (value = 0) => ({ value });
const node = (extra = {}) => ({ connect: (to) => to, disconnect() {}, start() {}, stop() { stopped++; }, ...extra });
class FakeAudioContext {
  state = 'running';
  sampleRate = 48000;
  destination = node();
  get currentTime() { return clock; }
  resume() { this.state = 'running'; return Promise.resolve(); }
  createBuffer() { return { duration: 0 }; }
  createBufferSource() { return node({ buffer: null, onended: null }); }
  createGain() { return node({ gain: param(1) }); }
  createOscillator() { return node({ frequency: param() }); }
  createWaveShaper() { return node({ curve: null }); }
  createBiquadFilter() { return node({ frequency: param(), Q: param() }); }
  createDelay() { return node({ delayTime: param() }); }
  createDynamicsCompressor() {
    return node({ threshold: param(), knee: param(), ratio: param(), attack: param(), release: param() });
  }
  createAnalyser() { return node({ fftSize: 1024, getFloatTimeDomainData: (a) => a.fill(0.1) }); }
  // The mocked "audio" is its own duration in seconds, as text.
  decodeAudioData(bytes, ok, fail) {
    const seconds = Number(new TextDecoder().decode(bytes));
    queueMicrotask(() => (seconds > 0 ? ok({ duration: seconds }) : fail(new Error('undecodable'))));
  }
}
const store = new Map();
globalThis.window = {
  AudioContext: FakeAudioContext,
  localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) },
};
// The speaker ticks on animation frames and a 250 ms interval; the test ticks it instead.
const tickers = new Set();
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = () => {};
globalThis.setInterval = (fn) => { tickers.add(fn); return fn; };
globalThis.clearInterval = (fn) => tickers.delete(fn);
const at = (seconds) => { clock = seconds; for (const fn of [...tickers]) fn(); };

const voice = await import('../client/src/lib/voice.js');
const { revealPrefix } = await import('../client/src/components/markdownParse.mjs');

// ---- the compiled transport, as in chat-transport.test.mjs
const source = readFileSync(new URL('../client/src/components/ChatWidget.res.mjs', import.meta.url), 'utf8');
const start = source.search(/(?:var|let|const) postChat =/);
const end = source.search(/(?:var|let|const) scrollToBottom =/);
assert.ok(start >= 0 && end > start, 'compiled chat transport boundaries must exist');

// Runs one reply the way ChatWidget does and returns what the reader would see over time.
async function reply(frames, lang = 'en') {
  const context = vm.createContext({ TextDecoder, AbortController, setTimeout: () => 1, clearTimeout() {} });
  let body;
  context.fetch = (_url, options) => {
    body = JSON.parse(options.body);
    const parts = frames.map((f) => `data: ${JSON.stringify(f)}\n\n`);
    const reader = {
      async read() { return parts.length ? { done: false, value: new TextEncoder().encode(parts.shift()) } : { done: true }; },
      async cancel() {},
    };
    return Promise.resolve({ ok: true, body: { getReader: () => reader } });
  };
  vm.runInContext(source.slice(start, end) + '\nthis.postChatStream = postChatStream;', context);

  voice.unlockAudio();
  const state = { raw: '', revealed: -1, levels: [], ended: 0, done: false };
  const speaker = voice.createSpeaker({
    onReveal: (n) => { state.revealed = n; },
    onLevel: (l) => state.levels.push(l),
    onEnd: () => { state.ended++; },
  });
  state.visible = () => (state.revealed < 0 ? '' : revealPrefix(state.raw, state.revealed));
  state.stop = () => speaker.stop();
  await new Promise((resolve) => {
    context.postChatStream('hello', [], (full) => { state.raw = full; },
      (full) => { state.raw = full; state.done = true; resolve(); }, resolve,
      voice.requestFields(lang), (event) => speaker.handle(event));
  });
  await new Promise((resolve) => setImmediate(resolve)); // let the clips decode
  return { state, body };
}

const b64 = (seconds) => Buffer.from(String(seconds)).toString('base64');
const RAW = 'Arda writes **Go** and Python. He has lived in Tokyo since 2004.';
const FINAL = RAW + '\n\nContact: use the chat.';
const spoken = (lang = 'en') => [
  { type: 'thinking' },
  { type: 'voice', on: true },
  { type: 'chunk', text: RAW.slice(0, 30) },
  { type: 'chunk', text: RAW.slice(30) },
  { type: 'speech', seq: 0, start: 0, end: 30, audio: b64(1), mime: 'audio/mpeg', marks: [{ o: 12, t: 0.4 }, { o: 18, t: 0.6 }] },
  { type: 'speech', seq: 1, start: 30, end: RAW.length, audio: b64(1), mime: 'audio/mpeg', marks: [] },
  { type: 'speech_end', upto: RAW.length },
  { type: 'done', text: FINAL },
];

test('a spoken reply is revealed only as far as the voice has got', async () => {
  clock = 0;
  const { state, body } = await reply(spoken(), 'ja');
  assert.deepEqual(body, { message: 'hello', history: [], voice: true, lang: 'ja' });
  // The whole text (and done) arrived, but nothing plays yet: nothing shows.
  assert.equal(state.done, true);
  at(0);
  assert.equal(state.visible(), '');
  // Clip 0 starts at 0.05 s; its marks pace the reveal through the sentence.
  at(0.45);
  assert.equal(state.visible(), 'Arda writes ');
  at(0.55);
  // Half-way through the bold word: the open ** is closed, never shown raw.
  assert.equal(state.visible(), 'Arda writes **G**');
  at(1.1);
  assert.ok(state.visible().startsWith(RAW.slice(0, 30)), 'clip 0 is fully shown once it has played');
  const mid = state.revealed;
  at(1.6);
  assert.ok(state.revealed > mid && state.revealed < RAW.length, 'clip 1 reveals progressively');
  assert.ok(state.levels.some((l) => l > 0), 'the orb gets a loudness while speaking');
  assert.equal(state.ended, 0);
  // Both clips played and speech_end came: everything shows, including done's contact notice.
  at(2.2);
  assert.equal(state.revealed, Infinity);
  assert.equal(state.visible(), FINAL);
  assert.equal(state.ended, 1);
  assert.equal(state.levels.at(-1), 0, 'the orb calms down at the end');
});

test('muting mid-reply silences the voice and shows everything at once', async () => {
  clock = 0;
  const { state } = await reply(spoken());
  at(0.45);
  assert.equal(state.visible(), 'Arda writes ');
  const before = stopped;
  voice.setVoiceEnabled(false);
  assert.equal(state.revealed, Infinity);
  assert.equal(state.visible(), FINAL);
  assert.ok(stopped > before, 'the scheduled clips were stopped');
  assert.equal(state.ended, 1);
  voice.setVoiceEnabled(true);
});

test('a muted visitor asks for no speech and reads the reply as it streams', async () => {
  voice.setVoiceEnabled(false);
  try {
    clock = 0;
    const { state, body } = await reply([
      { type: 'thinking' }, { type: 'chunk', text: 'Plain ' }, { type: 'chunk', text: 'text.' }, { type: 'done', text: 'Plain text.' },
    ], 'tr');
    assert.deepEqual(Object.keys(body).sort(), ['history', 'message']);
    assert.equal(state.revealed, Infinity);
    assert.equal(state.visible(), 'Plain text.');
    assert.equal(state.ended, 1);
  } finally {
    voice.setVoiceEnabled(true);
  }
});

test('a server that says voice off falls back to plain text', async () => {
  clock = 0;
  const { state } = await reply([
    { type: 'thinking' }, { type: 'voice', on: false }, { type: 'chunk', text: 'Hi.' }, { type: 'done', text: 'Hi.' },
  ]);
  assert.equal(state.visible(), 'Hi.');
  assert.equal(state.ended, 1);
});

test('stop() (a new question, closing, a language switch) reveals everything', async () => {
  clock = 0;
  const { state } = await reply(spoken());
  at(0.45);
  state.stop();
  assert.equal(state.visible(), FINAL);
  assert.equal(state.ended, 1);
});

test('revealPrefix never shows half a surrogate pair, a half-typed link or an open code span', () => {
  assert.equal(revealPrefix('Tokyo 🗼 tower', 7), 'Tokyo ');
  assert.equal(revealPrefix('see [the repo](https://github.com/ardakaraduman', 20), 'see the repo');
  assert.equal(revealPrefix('see [the re', 10), 'see the r');
  assert.equal(revealPrefix('uses `rescript build` daily', 12), 'uses `rescri`');
  assert.equal(revealPrefix('all of it', Infinity), 'all of it');
  assert.equal(revealPrefix('nothing yet', 0), '');
});

test('revealPrefix drops a bold or code opener that has nothing after it yet', () => {
  // The voice often rests right before a bold word; closing the empty opener would show "****"
  // (seen live in Japanese: "はい、Ardaは****").
  assert.equal(revealPrefix('はい、Ardaは**Go**の経験', 10), 'はい、Ardaは');
  assert.equal(revealPrefix('はい、Ardaは**Go**の経験', 9), 'はい、Ardaは', 'half a ** marker');
  assert.equal(revealPrefix('はい、Ardaは**Go**の経験', 11), 'はい、Ardaは**G**');
  assert.equal(revealPrefix('run `make` now', 5), 'run ');
});
