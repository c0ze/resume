import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Kara Duman as applied to the résumé (DESIGN.md): the family's most
// restrained site. Bone paper, the name in blackletter once, the emblem once,
// no artwork. These read the built page, so they hold for what a reader and a
// crawler actually get.
const dist = path.resolve(process.cwd(), 'dist/client');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const root = html.slice(html.indexOf('<div id="root">'));
const cssFile = html.match(/<link rel="stylesheet"[^>]* href="([^"]+)"/)?.[1];
const css = fs.readFileSync(path.join(dist, cssFile), 'utf8');
// The stylesheet is 350 KB on one line: a failed assert.match would print it.
const has = (text, pattern, message) => assert.ok(pattern.test(text), message);
const lacks = (text, pattern, message) => assert.ok(!pattern.test(text), message);

test('the built stylesheet orders its layers reset, astryx-base, astryx-theme, brand', () => {
  // Layers are ordered by first mention, in a statement or a block (the
  // minifier folds the statement of client/src/layers.css into the blocks).
  // If `brand` did not come after the theme, or a layer of the page's own
  // slipped in, the family patterns would lose to component styles, silently
  // and on every page.
  const order = [];
  for (const [, names] of css.matchAll(/@layer\s+([^;{]+)[;{]/g)) {
    for (const name of names.split(',').map((n) => n.trim())) if (!order.includes(name)) order.push(name);
  }
  assert.deepEqual(order, ['reset', 'astryx-base', 'astryx-theme', 'brand']);
  // The source states the order in a file of its own, imported first.
  const layers = fs.readFileSync(path.resolve(process.cwd(), 'client/src/layers.css'), 'utf8');
  assert.match(layers, /@layer reset, astryx-base, astryx-theme, brand;/);
  const main = fs.readFileSync(path.resolve(process.cwd(), 'client/src/Main.res'), 'utf8');
  const imports = [...main.matchAll(/import "([^"]+\.css)"/g)].map(([, file]) => file);
  assert.equal(imports[0], './layers.css', 'layers.css is the first stylesheet imported');
  assert.equal(imports.at(-1), './index.css', "the page's own rules come last");
});

test('the built stylesheet carries the theme, the family patterns and Astryx', () => {
  has(css, /\[data-astryx-theme=["']?arda["']?\]/, 'the arda theme scope');
  has(css, /\.ix-emblem\b/, 'the emblem of brand.css');
  has(css, /\.astryx-button\b/, "the theme's component rules");
});

test("the page's own stylesheet uses the theme's tokens only", () => {
  // A colour or a type size written out here would not follow the theme when
  // arda.tr changes it, and the four sites would drift apart. A written-out
  // size could also fall under the family's floor of 18px.
  const own = fs.readFileSync(path.resolve(process.cwd(), 'client/src/index.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(own, /#[0-9a-fA-F]{3,8}\b/, 'no hex colour');
  assert.doesNotMatch(own, /\b(?:rgb|hsl|oklch|oklab)a?\(/, 'no colour function with literal channels');
  assert.doesNotMatch(own, /font(?:-size)?\s*:[^;]*\d(?:px|pt|rem|em)\b/, 'no written-out type size');
});

test('blackletter names one thing: the name, the one h1', () => {
  const header = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'content/en/header.json'), 'utf8'));
  const h1s = root.match(/<h1[\s>][\s\S]*?<\/h1>/g) ?? [];
  assert.equal(h1s.length, 1, 'exactly one h1');
  assert.ok(h1s[0].includes(`>${header.title}</h1>`), 'the h1 is the name and nothing else');
  // The theme sets h1 and h2 in Grenze Gotisch. On the résumé only the name
  // may be: every section heading is the family's label (Spectral, capitals).
  // The one other h2 is the title of the build details, an Astryx Heading
  // inside a <dialog>, which the page's stylesheet sets back in Spectral.
  const h2s = root.match(/<h2 [^>]*>/g) ?? [];
  const labels = h2s.filter((h2) => /class="ix-label"/.test(h2));
  assert.equal(labels.length, 6, 'the six section headings are labels');
  for (const h2 of h2s.filter((h2) => !labels.includes(h2))) {
    assert.match(h2, /class="astryx-heading[^"]*" data-level="2"[^>]* data-autofocus="dialog-title"/, `${h2} would be set in blackletter`);
  }
  has(css, /dialog \.astryx-heading\[data-level=["']?2["']?\]\s*\{[^}]*font-family:\s*var\(--font-family-body\)/, "the dialog's title is set in Spectral");
  // On the Japanese page the family swaps the heading face for the Japanese
  // ones; the name stays in blackletter there through a rule that has to name
  // the face. It must be the face the theme uses for headings.
  const theme = fs.readFileSync(path.resolve(process.cwd(), 'client/src/brand/arda.css'), 'utf8');
  const blackletter = theme.match(/--font-family-heading:\s*['"]([^'"]+)['"]/)?.[1];
  assert.ok(blackletter, "expected the theme's heading face");
  has(css, new RegExp(`\\.head h1:lang\\(ja\\)\\s*\\{[^}]*font-family:\\s*["']?${blackletter}["']?\\s*,`), `the name is ${blackletter} on the Japanese page`);
  // The family's other blackletter classes, and the numerals of the landing
  // page, are not used here.
  assert.doesNotMatch(root, /class="[^"]*\bix-(?:display|name|num)\b/);
});

test('the top line: the emblem once, to arda.tr; one language switch; the family', () => {
  const top = root.match(/<header class="top">([\s\S]*?)<\/header>/)?.[1];
  assert.ok(top, 'expected the top line');

  // The emblem signs the page once. It is the family's artwork, served by
  // this site, and it is not hidden in print (it prints as a black seal).
  const emblems = root.match(/<img [^>]*class="ix-emblem"[^>]*>/g) ?? [];
  assert.equal(emblems.length, 1, 'one emblem on the page');
  const seal = top.match(/<a class="top__seal" href="https:\/\/arda\.tr"[^>]*>(<img [^>]*>)<\/a>/)?.[1];
  assert.ok(seal, 'the emblem links to arda.tr');
  assert.match(seal, /\balt="arda\.tr"/, 'the link has a name');
  const src = seal.match(/\bsrc="([^"]+)"/)?.[1];
  assert.match(src, /emblem[^/]*\.webp$/);
  assert.ok(fs.existsSync(path.join(dist, src)), `${src} is in the build`);
  assert.doesNotMatch(seal, /no-print/);

  // Each language is named in that language and marked up as it (so the
  // switch is announced correctly and 日本語 is set in the Japanese face);
  // the current one carries aria-current, which is also what fills it.
  const languages = [...top.matchAll(/<button ([^>]*)>([^<]+)<\/button>/g)].map(([, attrs, label]) => ({
    label,
    lang: attrs.match(/\blang="([^"]+)"/)?.[1],
    chip: /class="ix-chip"/.test(attrs),
    current: /aria-current="true"/.test(attrs),
  }));
  assert.deepEqual(languages, [
    { label: 'EN', lang: 'en', chip: true, current: true },
    { label: '日本語', lang: 'ja', chip: true, current: false },
    { label: 'TR', lang: 'tr', chip: true, current: false },
  ]);

  // The family's words are English on every page.
  assert.match(top, /<nav [^>]*\blang="en"/);
  const family = [...top.matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)].map(([, href, label]) => [label, href]);
  assert.deepEqual(family, [
    ['arda.tr', 'https://arda.tr'],
    ['blog', 'https://blog.arda.tr'],
    ['ask', 'https://ai.arda.tr'],
  ]);
});

test('no artwork: no plume, no wisp, no forest; the ember only as the assistant', () => {
  assert.doesNotMatch(root, /<canvas\b/);
  lacks(html + css, /plume|wisp|forest/i, 'no plume, wisp or forest in the page or its stylesheet');
  const assets = fs.readdirSync(path.join(dist, 'assets')).filter((file) => /\.(webp|png|jpe?g|avif|svg)$/.test(file));
  assert.deepEqual(assets.map((file) => file.replace(/-[^-.]+\./, '.')).sort(), ['ember.webp', 'emblem.webp']);
  // brand.css draws the assistant's mark from --ix-ember-art; without it the
  // mark is an empty soot disc.
  const ember = css.match(/--ix-ember-art:\s*url\(([^)]+)\)/)?.[1]?.replace(/["']/g, '');
  assert.ok(ember && fs.existsSync(path.join(dist, ember)), 'the ember is set and served');
  // In the page chrome the ember appears once: in the chat launcher.
  const marks = root.match(/<[a-z]+ [^>]*class="ix-mark[^"]*"[^>]*>/g) ?? [];
  assert.equal(marks.length, 1);
  assert.match(root, /<button [^>]*class="[^"]*\bchat-launcher no-print"[^>]*>(?:<span[^>]*>)*<span [^>]*class="ix-mark ix-mark--sm"/);
});

test('the fonts are the family’s four, swapped in when they load', () => {
  const href = html.match(/<link\s+href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"/)?.[1] ?? '';
  const families = [...href.matchAll(/family=([^&]+)/g)].map(([, family]) => family);
  // Grenze Gotisch at 800 only: it sets the name and nothing else.
  assert.deepEqual(families, ['Grenze+Gotisch:wght@800', 'JetBrains+Mono:wght@400', 'Spectral:ital,wght@0,400;0,600;1,400', 'Zen+Antique']);
  assert.match(href, /[?&]display=swap\b/);
  assert.match(html, /<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin/);
  assert.doesNotMatch(html, /Archivo|IBM\+?\s?Plex|Noto\+?\s?Sans|Big\+?\s?Shoulders/);
});

test('the four downloads are plain links in the prerendered page; the PDF is the primary', () => {
  // They must work without JavaScript, paste into an ATS and be crawlable.
  const links = [...root.matchAll(/<a ([^>]*\bdownload=""[^>]*)>/g)].map(([, attrs]) => ({
    href: attrs.match(/\bhref="([^"]+)"/)?.[1],
    variant: attrs.match(/\bdata-variant="([^"]+)"/)?.[1],
  }));
  for (const file of ['/resume-en.pdf', '/resume-en.docx', '/resume-en.json', '/arda.vcf']) {
    assert.ok(links.some(({ href }) => href === file), `expected a download link to ${file}`);
    assert.ok(fs.existsSync(path.join(dist, file)), `${file} is in the build`);
  }
  // One primary button on the page (bone on soot), and it is the PDF: the
  // file a recruiter keeps. The others are the theme's secondary, which the
  // family draws as a 1px outline.
  const primaries = root.match(/<[a-z]+ [^>]*data-variant="primary"[^>]*>/g) ?? [];
  assert.equal(primaries.length, 1);
  assert.deepEqual(links.filter(({ variant }) => variant === 'primary').map(({ href }) => href), ['/resume-en.pdf']);
  assert.deepEqual(
    links.filter(({ variant }) => variant === 'secondary').map(({ href }) => href),
    ['/resume-en.docx', '/resume-en.json', '/arda.vcf']
  );
  const secondary = css.match(/\.astryx-button\[data-variant=["']?secondary["']?\]\s*\{([^}]*)\}/)?.[1] ?? '';
  assert.match(secondary, /border:\s*1px solid/, "the theme's secondary button is outlined");
  assert.match(secondary, /background-color:\s*(?:transparent|#0000)/, 'and not filled');
});

test('on paper: 18mm margins, no controls, links print their address', () => {
  const print = css.slice(css.indexOf('@media print'));
  // A4 and Letter both: no page size is set, only the margin.
  has(print, /@page\s*\{\s*margin:\s*18mm;?\s*\}/, 'an 18mm page margin');
  lacks(css, /@page[^}]*\bsize\s*:/, 'no page size is forced');
  has(print, /\.no-print[^{]*\{[^}]*display:\s*none\s*!important/, '.no-print is hidden on paper');
  has(print, /attr\(href\)/, 'links print their address');
  // What the print rule hides: the switch and the family links, the
  // downloads, the chat.
  assert.match(root, /<div class="top__end no-print">/);
  assert.match(root, /<div [^>]*class="head__get no-print"/);
  assert.match(root, /<button [^>]*class="[^"]*\bchat-launcher no-print"/);
});
