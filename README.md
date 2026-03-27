# resume.arda.tr

Multi-language resume/portfolio site for Arda Karaduman. The site is built with Vite + React, prerendered into static HTML, and ships downloadable PDF resumes for English, Japanese, and Turkish.

[![Deploy to GitHub Pages](https://github.com/c0ze/resume/actions/workflows/deploy.yml/badge.svg)](https://github.com/c0ze/resume/actions/workflows/deploy.yml)

## Features

- Static site output under `dist/client`
- Server-rendered initial HTML for the homepage
- Multi-language content sourced from JSON in `content/en`, `content/ja`, and `content/tr`
- Generated PDFs in `public/resume-en.pdf`, `public/resume-ja.pdf`, and `public/resume-tr.pdf`
- Generated `sitemap.xml` included in the production build
- Theme generation driven by `config/theme.json`

## Tech Stack

- React 18
- TypeScript
- Vite 8
- Tailwind CSS
- Wouter
- TanStack Query
- PDFKit
- GitHub Pages for deployment

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

- Node.js 20+
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

1. builds the client bundle
2. builds the SSR entry
3. prerenders the homepage into static HTML
4. regenerates the PDF resumes
5. copies public assets into `dist/client`
6. writes `pdf-status.json`
7. writes `sitemap.xml`

### Preview

```bash
npm run preview
```

### Validation

```bash
npm run check
npm run test:static
```

`npm run test:static` verifies that the generated homepage contains real content and that the sitemap includes the homepage and all generated PDFs.

## Content Workflow

Visible resume content lives in:

- `content/en/*.json`
- `content/ja/*.json`
- `content/tr/*.json`

When you update content:

1. keep language files aligned where possible
2. run `npm run build` to regenerate the PDFs and static output
3. run `npm run test:static` to verify the homepage and sitemap output

## Theme Workflow

Theme source is stored in `config/theme.json`. The generated CSS lands in `client/src/theme.css` through `scripts/generate-theme.mjs`. Tooling config for the site build also lives in `config/` so the repository root stays lean.

## Deployment

GitHub Actions builds the site and deploys `dist/client` to GitHub Pages using `.github/workflows/deploy.yml`.

## Notes

- `public/resume-*.pdf` are generated artifacts and are expected to change when the build runs.
- exported `.txt` and `.docx` resume files are intentionally not kept in the repository.
