# resume.arda.tr

Multi-language resume/portfolio site for Arda Karaduman. The site is built with Vite + React, prerendered into static HTML, and ships downloadable PDF, DOCX, and JSON Resume files for English, Japanese, and Turkish, plus a vCard.

[![Deploy to GitHub Pages](https://github.com/c0ze/resume/actions/workflows/deploy.yml/badge.svg)](https://github.com/c0ze/resume/actions/workflows/deploy.yml)

## Features

- Static site output under `dist/client`, with the homepage prerendered to HTML
- Multi-language content (English, Japanese, Turkish) sourced from JSON in `content/{en,ja,tr}`
- Generated PDF/DOCX resumes in `public/resume-{en,ja,tr}.{pdf,docx}`
- Generated [JSON Resume](https://jsonresume.org/schema) exports in `public/resume-{en,ja,tr}.json` and a vCard in `public/arda.vcf`
- A web-only `abstract` per experience (card preview + detail modal) that the PDF/DOCX/JSON exports deliberately ignore
- "Ask about Arda" AI chat assistant — streams answers from the [ai.arda.tr](https://ai.arda.tr) bot and renders Markdown
- Cookieless Cloudflare Web Analytics (the email is kept out of the page — only in the downloads)
- SEO: Open Graph / Twitter cards, JSON-LD `Person`, and a generated `sitemap.xml`
- Multiple selectable themes generated from the `themePalettes` catalogue in `scripts/generate-theme.mjs`

## Tech Stack

- ReScript 11 (compiled to JS, rendered by React 18)
- React 18
- Vite 8 (client build + SSR prerender)
- Tailwind CSS (with `@tailwindcss/typography`)
- PDFKit (PDF resumes) and `docx` (DOCX resumes)
- Lucide icons
- GitHub Actions + GitHub Pages for deployment

## Repository Layout

```text
.
├── client/               # React app and UI components
├── config/               # Tooling and theme configuration
│   ├── postcss.config.cjs
│   ├── tailwind.config.cjs
│   ├── theme.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── content/              # Resume content for each language
├── public/               # Static assets and generated PDFs
├── scripts/              # Build helpers, theme generation, PDF generation
├── tests/                # Lightweight smoke tests for static output
├── CLAUDE.md             # Repo-specific instructions for Claude Code
├── AGENTS.md             # Repo-specific instructions for coding agents
└── README.md             # Human-facing project documentation
```

## Root Directory Policy

The root is intentionally kept for:

- tool conventions that truly require the root, such as `package.json`, `package-lock.json`, `.gitignore`, and `.gitattributes`
- repo-wide docs such as `README.md`, `CLAUDE.md`, and `AGENTS.md`
- top-level source directories such as `client/`, `content/`, `public/`, `scripts/`, and `tests/`

Do not add new loose assets or ad-hoc notes to the root. Put them in one of these places instead:

- `scripts/` for automation
- `config/` for Vite, TypeScript, Tailwind, PostCSS, and theme configuration

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

This generates theme CSS first, then starts Vite with `config/vite.config.ts`.

### Build

```bash
npm run build
```

The build pipeline:

1. generates theme CSS via `scripts/generate-theme.mjs` (base settings from `config/theme.json`)
2. compiles ReScript sources to `.res.mjs`
3. builds the client bundle
4. builds the SSR entry
5. prerenders the homepage into static HTML
6. regenerates the PDF and DOCX resumes
7. regenerates the JSON Resume exports (`scripts/generate-json-resume.mjs`) and the vCard (`scripts/generate-vcard.mjs`)
8. writes `artifact-status.json`
9. copies public assets into `dist/client`
10. writes `sitemap.xml`

### Preview

```bash
npm run preview
```

### Validation

```bash
npm run check
npm run test:static
```

`npm run test:static` runs the smoke tests in `tests/*.test.mjs`. They verify the generated homepage contains real content (and that the email is *not* in the HTML), the sitemap includes the homepage plus all generated PDF/DOCX/JSON resumes and the vCard, `artifact-status.json` reports all generated artifacts, the JSON Resume exports carry the basics but none of the web-only abstracts, the vCard is well-formed, the generated theme CSS includes every theme, and the chat Markdown renderer produces correct, XSS-safe output.

## Content Workflow

Visible resume content lives in:

- `content/en/*.json`
- `content/ja/*.json`
- `content/tr/*.json`

When you update content:

1. keep language files aligned where possible
2. run `npm run build` to regenerate the PDF/DOCX files and static output
3. run `npm run test:static` to verify the homepage, sitemap, and artifact status output

## Theme Workflow

The theme palette catalogue lives in the `themePalettes` object in `scripts/generate-theme.mjs`, which generates `client/src/theme.css` — never edit the generated CSS directly. `config/theme.json` holds the base variant settings (variant, primary, appearance, radius) consumed by the generator, and theme selector state lives in `client/src/contexts/ThemeContext.res`. Tooling config for the site build also lives in `config/` so the repository root stays lean.

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
