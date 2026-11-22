# resume.arda.tr

Multi-language resume/portfolio site for Arda Karaduman. The site is built with Vite + React, prerendered into static HTML, and ships downloadable PDF, DOCX, and JSON Resume files for English, Japanese, and Turkish, plus a vCard.

[![Deploy to GitHub Pages](https://github.com/c0ze/resume/actions/workflows/deploy.yml/badge.svg)](https://github.com/c0ze/resume/actions/workflows/deploy.yml)

## Features

- Static site output under `dist/client`, with the homepage prerendered to HTML
- Multi-language content (English, Japanese, Turkish) sourced from JSON in `content/{en,ja,tr}`
- Generated PDF/DOCX resumes in `public/resume-{en,ja,tr}.{pdf,docx}`
- Generated [JSON Resume](https://jsonresume.org/schema) exports in `public/resume-{en,ja,tr}.json` and a vCard in `public/arda.vcf`
- A web-only `abstract` per experience (the lead line of each Experience row) that the PDF/DOCX/JSON exports deliberately ignore
- "Ask about Arda" AI chat assistant — streams answers from the [ai.arda.tr](https://ai.arda.tr) bot and renders Markdown; the assistant is the family's ember
- Cookieless Cloudflare Web Analytics (the email is kept out of the page — only in the downloads)
- SEO: Open Graph / Twitter cards, JSON-LD `Person`, and a generated `sitemap.xml`
- "Kara Duman", the design system shared with arda.tr, blog.arda.tr and ai.arda.tr (see `DESIGN.md`): the résumé is its most restrained site, bone paper, light only, the name in blackletter once, the emblem once, no artwork; it prints in black. The Astryx `arda` theme and the family patterns are verbatim copies of arda.tr's `brand/` in `client/src/brand/`
- `<html lang>` tracks the selected language, and a blocking bootstrap applies the stored language before first paint

## Tech Stack

- ReScript 11 (compiled to JS, rendered by React 19)
- React 19
- Vite 8 (client build + SSR prerender)
- Astryx 0.7.17 (`@astryxdesign/core`, pinned) components for controls, with the family's built `arda` theme; the page's own rules are plain CSS in `client/src/index.css`
- PDFKit (PDF resumes) and `docx` (DOCX resumes)
- Grenze Gotisch (the name only) + Spectral + JetBrains Mono + Zen Antique for Japanese (Google Fonts)
- GitHub Actions + GitHub Pages for deployment

## Repository Layout

```text
.
├── client/               # React app and UI components
├── config/               # Tooling configuration
│   └── vite.config.ts
├── content/              # Resume content for each language
├── public/               # Static assets and generated PDFs
├── scripts/              # Build helpers, the generators, the brand contract check
├── tests/                # Lightweight smoke tests for static output
├── DESIGN.md             # The design system — binding, not advisory
├── PRODUCT.md            # Product truth, audience, and what must never be fabricated
├── CLAUDE.md             # Generic agent rules (identical across repos)
├── AGENTS.md             # Symlink to CLAUDE.md
├── PROJECT.md            # Project handoff: architecture, key files, validation
└── README.md             # Human-facing project documentation
```

## Root Directory Policy

The root is intentionally kept for:

- tool conventions that truly require the root, such as `package.json`, `package-lock.json`, `.gitignore`, `.gitattributes`, and `astryx.config.mjs`
- repo-wide docs such as `README.md`, `DESIGN.md`, `PRODUCT.md`, `PROJECT.md`, `CLAUDE.md`, and `AGENTS.md`
- top-level source directories such as `client/`, `content/`, `public/`, `scripts/`, and `tests/`

Do not add new loose assets or ad-hoc notes to the root. Put them in one of these places instead:

- `scripts/` for automation
- `config/` for Vite configuration

Do not commit exported resume artifacts such as ad-hoc `.txt` or `.docx` exports. They are not build inputs and should stay out of the repository.

## Getting Started

### Prerequisites

- Node.js 24 (matches CI)
- npm

### Install

```bash
npm ci
```

### Development

```bash
npm run dev
```

This compiles ReScript, then starts the ReScript watcher and Vite with `config/vite.config.ts`.

### Build

```bash
npm run build
```

The build pipeline:

1. compiles ReScript sources to `.res.mjs`
2. builds the client bundle
3. builds the SSR entry
4. prerenders the homepage into static HTML
5. regenerates the PDF and DOCX resumes
6. regenerates the JSON Resume exports (`scripts/generate-json-resume.mjs`) and the vCard (`scripts/generate-vcard.mjs`)
7. writes `artifact-status.json`
8. copies public assets into `dist/client`
9. writes `sitemap.xml`

### Preview

```bash
npm run preview
```

### Validation

```bash
npm run check
npm run test:static
```

`npm run test:static` runs the smoke tests in `tests/*.test.mjs`. They verify the generated homepage contains real content (and that the email is *not* in the HTML), the sitemap includes the homepage plus all generated PDF/DOCX/JSON resumes and the vCard, `artifact-status.json` reports all generated artifacts, the JSON Resume exports carry the basics but none of the web-only abstracts, the vCard is well-formed, the page is built as the brand prescribes (layer order, tokens only, blackletter for the one h1 only, the top line, no artwork, the print rules) and stays light only, and the chat Markdown renderer produces correct, XSS-safe output. `tests/exports.test.mjs` reads the PDF and DOCX files themselves: no footer-only last page, no missing glyphs, hanging bullets, links, the structure tree, Turkish headings, the ISO issue date and the DOCX metadata.

## Content Workflow

Visible resume content lives in:

- `content/en/*.json`
- `content/ja/*.json`
- `content/tr/*.json`

When you update content:

1. keep language files aligned where possible
2. run `npm run build` to regenerate the PDF/DOCX files and static output
3. run `npm run test:static` to verify the homepage, sitemap, and artifact status output

## Brand Workflow

The colours, type and spacing are tokens of the Astryx `arda` theme; the emblem, the label, the buttons and chips, the ember and the chat thread are the family's patterns. Both live in `client/src/brand/` as **verbatim copies of the arda.tr repository's `brand/` folder** (`arda.css`, `arda.js` and its two `.d.ts`, `brand.css`, `scheme.js`, `art/emblem.webp`, `art/ember.webp`; `public/favicon.svg` is `brand/logo/favicon.svg`). Never edit them here: change them in arda.tr, then copy them out again. The page's own layout is `client/src/index.css`, which uses those tokens only (no hex colour, no px type size); `client/src/layers.css` declares the cascade-layer order and is imported first. See `DESIGN.md`.

Controls and layout are Astryx components, bound for ReScript in `client/src/Astryx.res`. `npx astryx component <Name>` prints a component's props; `npx astryx doctor` checks the setup.

arda.tr publishes the sha256 of the brand files in its `config/themes.json` (contract v4). `scripts/check-brand-contract.mjs` compares this site's copies with them and fails on a mismatch; it passes with a note while arda.tr's `main` still publishes an older contract. `.github/workflows/brand-contract.yml` runs it on every push to `main` as a separate, non-blocking workflow. Point `THEMES_CONTRACT_PATH` at a local `themes.json` to check against an unpublished contract.

## Deployment

GitHub Actions builds the site and deploys `dist/client` to GitHub Pages using `.github/workflows/deploy.yml`.

## Notes

- `public/resume-*.{pdf,docx,json}` and `public/arda.vcf` are generated artifacts (gitignored) and are expected to change when the build runs.
- exported `.txt` and `.docx` resume files are intentionally not kept in the repository.

## License

The code — build pipeline, chat widget, PDF/DOCX generators — is
[MIT-licensed](./LICENSE). The résumé content (`content/`) and the generated
resume artifacts (`public/resume-*`) are © Arda Karaduman, all rights
reserved: fork the tech, not the career.
