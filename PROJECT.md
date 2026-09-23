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

The visual system is **"One Bit Forest"**, shared by the arda.tr family (the
family contract is `../DESIGN-SYSTEM.md`, the approved reference is section 03
of `../design-previews/sketch-1bit.html`). `DESIGN.md` is this repo's binding
spec. Product truth is in `PRODUCT.md`; the direction contract for the single
`/` route is in `.impeccable/surfaces/client-src-pages-home-res.md`. Read those
before changing anything visual.

## Project Overview

`resume.arda.tr` is a static, multilingual resume site for Arda Karaduman. The app renders the homepage with React, prerenders it to static HTML during build, generates language-specific PDF, DOCX, and JSON Resume files plus a vCard, and deploys the final output to GitHub Pages.

## Current Stack

- Vite 8
- React 18
- ReScript 11
- Tailwind CSS (reset and token-mapped colours; the visual system is plain CSS in `client/src/index.css`)
- Big Shoulders Display (name) + IBM Plex Sans / Plex Mono / Plex Sans JP from Google Fonts (the PDF/DOCX embed their own fonts)
- `client/src/lib/onebit.js` — the family's 1-bit canvas engine (treeline, chat orb, crackle cursor), a verbatim copy of `../design-previews/onebit/onebit.js`, bound in `client/src/OneBit.res`
- PDFKit + docx (PDF/DOCX resumes)
- GitHub Actions + GitHub Pages (CI runs Node 24)

## Source of Truth

- Website content: `content/{en,ja,tr}/*.json` (12 files each, structurally
  aligned; `record.json` holds the page's own chrome vocabulary — rail labels,
  certificate, chat labels)
- Rendition catalogue: `themePalettes` in `scripts/generate-theme.mjs` — the four One Bit ids `xerox` (default), `xerox-hc`, `night`, `night-hc`, each with a role; generates `client/src/theme.css` (never edit the generated CSS directly)
- Theme base settings: `config/theme.json` (appearance, radius — consumed by the generator)
- Tooling config: `config/{vite.config.ts,tailwind.config.cjs,postcss.config.cjs}`
- ReScript config: `rescript.json`
- PDF generator: `scripts/generate-resume.mjs`
- DOCX generator: `scripts/generate-docx.mjs`
- JSON Resume generator: `scripts/generate-json-resume.mjs`
- vCard generator: `scripts/generate-vcard.mjs`
- Theme contract check (v3: id set, roles and required tokens vs arda.tr's `config/themes.json`; soft-passes on older contracts): `scripts/check-theme-contract.mjs` (run by `.github/workflows/theme-contract.yml`)
- Static build pipeline: `scripts/build-static.mjs`
- Chat Markdown renderer: `client/src/components/markdownParse.mjs` (+ `Markdown.res`)
- Tests (static output, Markdown, labels, flavours, browser storage, and the compiled chat transport): `tests/*.test.mjs` (run by `npm run test:static`, and by the deploy workflow after the build)

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

- **AI chat widget** — `client/src/components/ChatWidget.res` ("Ask about Arda", styled like ai.arda.tr: a 1-bit orb that sizzles per streamed chunk and a crackle cursor) POSTs to the ai.arda.tr bot's SSE `/api/chat/stream` (falls back to non-streaming `/api/chat`) and renders Markdown via `Markdown.res` + `markdownParse.mjs` (builds React elements only — XSS-safe). The bot holds the API key, so the static site ships no secrets. Other components open it via the `arda:open-chat` window event (`ChatWidget.openChat()`).
- **Chat stream recovery** — streaming completion requires a complete `done` event. An interrupted reply keeps the text it received and adds an error message; the non-streaming fallback is tried only before any text arrives. `tests/chat-transport.test.mjs` runs the compiled transport against simulated responses and never contacts the bot.
- **Blocked storage** — `localStorage` can throw (blocked site data, some private modes). The bootstrap in `client/index.html`, `ThemeContext.getStoredTheme` and `LanguageContext` all catch it and fall back to `xerox` / English; `tests/theme-storage.test.mjs` covers the theme side.
- **Web-only `abstract`** — each experience carries an `abstract`, rendered as the lead line of its row in the Experience section, above the responsibilities. `scripts/generate-resume.mjs`, `scripts/generate-docx.mjs`, and `scripts/generate-json-resume.mjs` deliberately ignore it; keep it out of the PDF/DOCX/JSON downloads.
- **Contact = chat** — the email is not rendered in the page (spam-hardening); it stays only in the downloads: PDF/DOCX/JSON Resume/vCard (`header.contactViaEmail`, do not remove that field). The smoke test asserts the email is absent from the HTML.
- **Analytics + SEO** — a cookieless Cloudflare Web Analytics beacon, Open Graph/Twitter meta, and JSON-LD `Person` all live in `client/index.html`.

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

If content, theme configuration, or build scripts change, run:

```bash
npm run check
npm run build
npm run test:static
```

## ReScript Notes

- Source files are `.res` in `client/src/` with subdirectories for organization.
- ReScript compiles to `.res.mjs` files in-source (same directory as `.res`).
- The `.res.mjs` files are gitignored — Vite picks them up during build.
- JSON content is loaded via Vite's `import.meta.glob` through `%raw` interop.
- There are no icon bindings and no icon dependency: the design system uses
  typographic marks and hairline rules (see `DESIGN.md` → Components). If an
  icon becomes necessary, prefer inline SVG over adding a package.
- Page structure: `pages/Home.res` = `StatusBar` + `Treeline` + (`Rail` | main
  column: `Intro`, the six sections, `Footer`) + `ChatWidget`. Sections are
  built from `components/Section.res` (`Section` = mono label + rule,
  `Section.Row` = mono gutter + body; `Section.ids` is the nav order).
- Canvas work goes through `OneBit.res` (`useCanvas`, `useRepaintOnTheme`);
  never fork `lib/onebit.js` — change the shared copy in `design-previews/`
  first, then copy it to every site.

## Content Rules

- Keep `en`, `ja`, and `tr` content files structurally aligned.
- `record.json` carries the page's own vocabulary (rail labels, certificate and column heads, chat labels) and is translated in full. A test asserts the three files match in shape and differ in content.
- If you add a field in one language, update the others in the same pass unless there is a good reason not to.
- The email (`header.contactViaEmail`) stays out of the web page and appears only in the downloads.
- `about.languagesContent` is printed verbatim after `about.languages` in the PDF/DOCX (the label goes through `fieldLabel()` in `scripts/labels.mjs`, so it may or may not end in a colon).
- Treat `content/` as the canonical source for visible resume content.
- Do not hand-edit generated files in `dist/`.
- Expect `public/resume-*.{pdf,docx,json}` and `public/arda.vcf` to change after builds because they are generated (gitignored) artifacts.

## Repository Hygiene

- Keep the root lean. Only keep files at the root if a tool convention requires them (`package.json`, `.gitignore`) or they are repo-wide docs (`README.md`, `CLAUDE.md`/`AGENTS.md`, `PROJECT.md`, `DESIGN.md`, `PRODUCT.md`).
- Put new automation in `scripts/`.
- Put tool config in `config/` unless a tool hard-requires the root.
- Do not commit exported resume artifacts such as loose `.txt` or `.docx` files.
- Do not commit `.res.mjs` files — they are build artifacts.
- `.github/workflows/notify-bot.yml` is gone: the ai.arda.tr bot redeploys itself daily (see `PRODUCT.md`).
