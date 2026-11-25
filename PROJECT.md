# PROJECT.md

The handoff document for `resume.arda.tr`: architecture, constraints, key files,
and how to run and validate. The generic working rules live in `CLAUDE.md`
(`AGENTS.md` is a symlink to it). Keep this file current (Rule 12).

## Mission

Keep the site accurate, static-build-safe, and easy to maintain.

## Before You Change Anything

Read these first when relevant:

- `DESIGN.md` for the design system. It is binding, not advisory.
- `PRODUCT.md` for product truth, including what must never be fabricated.
- `README.md` for the project overview and layout.
- `package.json` for the supported commands.
- `scripts/build-static.mjs` when touching the build pipeline.

## Design System

The visual system is **"Kara Duman"**, shared by the arda.tr family (the family
contract is `../DESIGN-SYSTEM.md`; adopted 2026-11-23, it replaced "The Index"
of the day before and "One Bit Forest"). The résumé is its most restrained
site: bone paper, light only, the name in blackletter once, the emblem once,
no artwork; it prints in black. The design is
`../output/rebrand-kara-duman/14-resume.png`. `DESIGN.md` is this repo's
binding spec. Product truth is in
`PRODUCT.md`; the direction contract for the single `/` route is in
`.impeccable/surfaces/client-src-pages-home-res.md`. Read those before changing
anything visual.

The brand files in `client/src/brand/` (`arda.css`, `arda.js` and its two
`.d.ts`, `brand.css`, `scheme.js`, `art/emblem.webp`, `art/ember.webp`) and
`public/favicon.svg` (`brand/logo/favicon.svg`) are **verbatim copies of
`../arda.tr/brand/`. Never edit them here**: change them in arda.tr, then copy
them out again. `scheme.js` is carried for the contract and not imported.

## Project Overview

`resume.arda.tr` is a static, multilingual resume site for Arda Karaduman. The app renders the homepage with React, prerenders it to static HTML during build, generates language-specific PDF, DOCX, and JSON Resume files plus a vCard, and is deployed by hand to a Cloudflare Worker (static assets): `npm run deploy`.

## Current Stack

- Vite 8
- React 19
- ReScript 11 (`@rescript/react` 0.13)
- Astryx 0.7.17, pinned exactly (`@astryxdesign/core`, `@stylexjs/stylex` as its peer, `@astryxdesign/theme-neutral` because the built theme `brand/arda.js` imports it, `@astryxdesign/cli` as a dev dependency): the theme, buttons, links, the dialog, the switch, bound in `client/src/Astryx.res`. The agent skill is in `.agents/skills/astryx-project/` (`npx astryx init --to skills`; never run a bare `npx astryx init`, which would write an Astryx block into `CLAUDE.md`)
- No Tailwind, no PostCSS: plain CSS in cascade layers (`client/src/layers.css` declares `reset, astryx-base, astryx-theme, brand`; `client/src/index.css` is the page's own unlayered rules, tokens only)
- Grenze Gotisch 800 (the name only) + Spectral 400/400i/600 + JetBrains Mono 400 + Zen Antique 400 (Japanese, under `lang="ja"`) from Google Fonts (the PDF/DOCX embed their own fonts)
- `client/src/lib/voice.js` — the assistant's spoken replies (spoken English replies with no effect, gated reveal, mute choice), a verbatim copy of `../design-previews/onebit/voice.js` (its header documents the protocol), bound in `client/src/Voice.res`
- PDFKit + docx (PDF/DOCX resumes)
- Cloudflare Worker static assets, deployed by hand (`tools/deploy_cloudflare.sh`); GitHub Actions build check (CI runs Node 24)

## Source of Truth

- Website content: `content/{en,ja,tr}/*.json` (12 files each, structurally
  aligned; `record.json` holds the page's own chrome vocabulary — table labels,
  build details, chat labels)
- Theme and family patterns: `client/src/brand/` (verbatim copies of arda.tr's `brand/`, see above); the page's own layout: `client/src/index.css`
- Tooling config: `config/vite.config.ts`; `astryx.config.mjs` at the root (the Astryx CLI requires it there)
- ReScript config: `rescript.json`
- PDF generator: `scripts/generate-resume.mjs`
- DOCX generator: `scripts/generate-docx.mjs`
- JSON Resume generator: `scripts/generate-json-resume.mjs`
- vCard generator: `scripts/generate-vcard.mjs`
- PDF layout decisions (subtitle size, where a block may break across pages; tested in `tests/pdf-layout.test.mjs`): `scripts/pdf-layout.mjs`
- Generator helpers: `scripts/content.mjs` (`loadContent`, shared by the four generators; a missing or malformed content file throws, so the build fails) and `scripts/export-text.mjs` (the en/tr sanitising — Japanese runs stripped, characters the Noto fonts lack spelled out — the glyph check behind the PDF generator's build-time guard, and the ISO issue date printed after "Generated on")
- Brand contract check (v4: the sha256 of the copies in `client/src/brand/` vs the hashes in arda.tr's `config/themes.json`; passes with a note on an older contract or a failed fetch, fails on a mismatch or a newer contract): `scripts/check-brand-contract.mjs` (run by `.github/workflows/brand-contract.yml`; `THEMES_CONTRACT_PATH=../arda.tr/config/themes.json` checks against a local checkout)
- Static build pipeline: `scripts/build-static.mjs`
- Chat Markdown renderer: `client/src/components/markdownParse.mjs` (+ `Markdown.res`; also `revealPrefix`, the part of a spoken reply that is safe to render)
- Tests (static output, the brand as built (`brand.test.mjs`: layer order, tokens only, blackletter for the one h1 only, the top line, no artwork but the emblem and the assistant's ember, the fonts, the PDF as the one primary button, the print rules), the light-only template and the language bootstrap (`light-only.test.mjs`), the brand contract comparison, the PDF/DOCX files themselves, the JSON Resume files against schema v1.0.0 (vendored in `tests/fixtures/` with its licence), Markdown, labels, flavours, the compiled chat transport, and the voice's gated reveal): `tests/*.test.mjs` (run by `npm run test:static`, and by the deploy workflow after the build; `tests/helpers/` reads PDFKit's PDFs and the DOCX zips without extra dependencies)

## Important Directories

```text
client/               React application (ReScript source in client/src/)
content/              Language-specific JSON content
config/               Theme and build-tool configuration
public/               Static assets, fonts, generated resume artifacts
scripts/              Build scripts and generators
tests/                Smoke tests for build output
```

## Commands

```bash
npm run dev           # ReScript watch + Vite dev server (requires concurrently)
npm run build         # Full static build (ReScript → Vite → SSR → PDF/DOCX)
npm run preview       # Preview built site
npm run check         # ReScript type check (rescript build)
npm run test:static   # Static output and browser-boundary tests (tests/*.test.mjs)
npm run res:build     # ReScript compile only
npm run res:clean     # Clean ReScript build artifacts
```

## Key Features

- **AI chat widget** — `client/src/components/ChatWidget.res` ("Ask about Arda", styled with the family's patterns: the assistant is the ember, `.ix-mark`, drawn from `--ix-ember-art` (set on `:root` in `index.css`), which glows while a reply is on its way; its replies sit left with no bubble, the visitor's right on the surface colour; the suggested questions are `.ix-chip`s) POSTs to the ai.arda.tr bot's SSE `/api/chat/stream` (falls back to non-streaming `/api/chat`) and renders Markdown via `Markdown.res` + `markdownParse.mjs` (builds React elements only — XSS-safe). The bot holds the API key, so the static site ships no secrets. Other components open it via the `arda:open-chat` window event (`ChatWidget.openChat()`).
- **Chat voice** — as on ai.arda.tr, replies are read aloud unless the visitor turns off the "read replies aloud" `Switch` under the input (label `chat.voice`; `chat.voiceOn`/`voiceOff` are no longer shown; the choice is localStorage `"voice"`, owned by `voice.js`). The stream request carries `Voice.requestFields(lang)` (`{voice: true, lang}` in the page's language, nothing when muted); each reply gets one speaker that sees every SSE event, gates the Markdown to what has been spoken (`revealPrefix`) and writes the loudness to `--ix-level` on that reply's ember, which glows with it. `unlockAudio()` runs inside the send gesture. A new question, closing (× / Escape), a language switch or muting stops it and shows the whole reply. With voice the server holds `done` back until the speech is sent, so the 45s stream deadline is an idle one (re-armed on every read). `tests/chat-voice.test.mjs` runs the real `voice.js` on a fake Web Audio clock with mocked speech events.
- **Chat stream recovery** — streaming completion requires a complete `done` event. An interrupted reply keeps the text it received and adds an error message. The non-streaming fallback is tried only when the stream never got an answer from the bot (a network error, a deadline or a closed connection before any byte, HTTP 413 or a 5xx); any other 4xx (429, 400, 403, 415), an SSE `error` event and any failure after the first byte are final and show the error, so a refused or rate-limited question is not paid for twice. `tests/chat-transport.test.mjs` runs the compiled transport against simulated responses and never contacts the bot.
- **Light only** — `<html data-astryx-theme="arda" data-theme="light">`, `<meta name="color-scheme" content="light">`, theme-color `#E8E0CE` and `<Theme mode="light">` (`App.res`). No scheme switch, nothing stored. The one blocking script in `client/index.html` sets `<html lang>` from the stored language; `localStorage` can throw (blocked site data, some private modes), so it and `LanguageContext` catch that and fall back to English. `tests/light-only.test.mjs` covers both.
- **Astryx's own strings** — "Close" and "(opens in new tab)" follow the page's language: `App.res` wraps the page in Astryx's `InternationalizationProvider` and loads the Japanese or Turkish catalog as its own chunk when that language is first shown (English ships with the components; a catalog that fails to load leaves those strings in English).
- **Web-only `abstract`** — each experience carries an `abstract`, rendered as the small lead line of its entry in the Experience section, above the responsibilities. `scripts/generate-resume.mjs`, `scripts/generate-docx.mjs`, and `scripts/generate-json-resume.mjs` deliberately ignore it; keep it out of the PDF/DOCX/JSON downloads.
- **Contact = chat** — the email is not rendered in the page (spam-hardening); it stays only in the downloads: PDF/DOCX/JSON Resume/vCard (`header.contactViaEmail`, do not remove that field). The smoke test asserts the email is absent from the HTML.
- **Analytics + SEO** — a cookieless Cloudflare Web Analytics beacon, Open Graph/Twitter meta, and JSON-LD `Person` all live in `client/index.html`. The Person is the family's one identity (`"@id": "https://arda.tr/#person"`, `url` arda.tr); this page is its `mainEntityOfPage` (a `ProfilePage` at `https://resume.arda.tr/`), while the canonical link, og:url and the sitemap name the page.

## Build Expectations

`npm run build` should:

1. compile ReScript sources to `.res.mjs`
2. build the client bundle
3. build the SSR entry
4. prerender `/` into static HTML
5. regenerate `public/resume-{en,ja,tr}.pdf` and `public/resume-{en,ja,tr}.docx`
6. regenerate `public/resume-{en,ja,tr}.json` (JSON Resume) and `public/arda.vcf` (vCard)
7. write `dist/client/artifact-status.json`
8. copy public assets into `dist/client`
9. generate `dist/client/sitemap.xml`

If content, styles, or build scripts change, run:

```bash
npm run check
npm run build
npm run test:static
```

After changing the Astryx setup (packages, stylesheet imports, the skill), also
run `npx astryx doctor` and `npx astryx doctor --built dist/client`. One
warning is expected: `themes` reports that no theme "appears wired", because
the theme is the family's built copy in `client/src/brand/` rather than one the
CLI manages (`npx astryx theme add`); it is wired in `App.res`.

To look at the page, serve `dist/client` and take headless screenshots
(`google-chrome-stable --headless=new --screenshot=…`, `--print-to-pdf=…` for
the print rules). The language comes from `localStorage` (`resume-lang`), so a
Japanese or Turkish capture needs it set first.

Local toolchain: Node 24 (`mise exec node@24.14.0 -- npm run build`).

## ReScript Notes

- Source files are `.res` in `client/src/` with subdirectories for organization.
- ReScript compiles to `.res.mjs` files in-source (same directory as `.res`).
- The `.res.mjs` files are gitignored — Vite picks them up during build.
- JSON content is loaded via Vite's `import.meta.glob` through `%raw` interop.
- Astryx components are bound in one file, `client/src/Astryx.res`
  (`@module("@astryxdesign/core/Button") @react.component external make: …`).
  Read a component's props with `npx astryx component <Name>` and add only the
  props a section needs. Buttons take their text in `label`; booleans start
  with `is`/`has`; a prop that is a ReScript keyword is renamed with `@as`
  (`@as("type") ~type_`).
- The only icons are the two Astryx draws itself (the new-tab mark of an
  external `Link`, the close cross of the dialog and the chat). Do not add an
  icon set.
- Page structure: `App.res` = Astryx `Theme` (mode light) + its i18n provider
  around `pages/Home.res` = `Bar` (the top line: the emblem, the family's
  links, the language switch) + (`<main>`: `Head`, the six sections) +
  `Footer` + `Certificate` (the build details dialog) + `ChatWidget`. The top
  `<header>` and the colophon `<footer>` stay outside `<main>`, so they are
  top-level landmarks; the name (the one h1) is in `<main>`. Every section is
  built from `components/Section.res`: `Section` = the label (`h2.ix-label`)
  at the left + its entries at the right, `Section.Entry` = a title with a
  mono period at the far right, an italic line, then the details,
  `Section.Row` = a row of the build details' key/value table,
  `Section.External` = a link that leaves the family; `Section.ids` is the
  order of the head's section links.
- The theme sizes and colours every `<p>` itself: to make a paragraph small or
  secondary, put the class on the `<p>`, not on its container.

## Content Rules

- Keep `en`, `ja`, and `tr` content files structurally aligned.
- `record.json` carries the page's own vocabulary (the head's table labels, the build details and their column heads, chat labels) and is translated in full. Several of its keys date from earlier designs and are no longer shown; the paths are kept. A test asserts the three files match in shape and differ in content.
- If you add a field in one language, update the others in the same pass unless there is a good reason not to.
- The email (`header.contactViaEmail`) stays out of the web page and appears only in the downloads.
- `about.languagesContent` is one line: `Language (Level; Certificate, Year)` joined by `, ` (ja: `言語（レベル／資格・年）` joined by `、`). `splitSpokenLanguages()` in `scripts/labels.mjs` splits it only on commas outside brackets, for the JSON Resume and the PDF (the page's About section splits it the same way in `AboutSection.res`) (which breaks lines only between languages). The label goes through `fieldLabel()`, so it may or may not end in a colon.
- Treat `content/` as the canonical source for visible resume content.
- Do not hand-edit generated files in `dist/`.
- Expect `public/resume-*.{pdf,docx,json}` and `public/arda.vcf` to change after builds because they are generated (gitignored) artifacts.

## Repository Hygiene

- Keep the root lean. Only keep files at the root if a tool convention requires them (`package.json`, `.gitignore`) or they are repo-wide docs (`README.md`, `CLAUDE.md`/`AGENTS.md`, `PROJECT.md`, `DESIGN.md`, `PRODUCT.md`).
- Put new automation in `scripts/`.
- Put tool config in `config/` unless a tool hard-requires the root (`astryx.config.mjs` and `.agents/` do).
- Do not commit exported resume artifacts such as loose `.txt` or `.docx` files.
- Do not commit `.res.mjs` files — they are build artifacts.
- `.github/workflows/notify-bot.yml` is gone: the ai.arda.tr bot redeploys itself daily (see `PRODUCT.md`).
