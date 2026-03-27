# CLAUDE.md

This file provides repository-specific guidance to Claude Code when working here.

## Project Overview

`resume.arda.tr` is a static, multilingual resume site for Arda Karaduman. The app renders the homepage with React, prerenders it to static HTML during build, generates language-specific PDF and DOCX resumes, and deploys the final output to GitHub Pages.

## Current Stack

- Vite 8
- React 18
- TypeScript
- Tailwind CSS
- Wouter
- TanStack Query
- PDFKit
- GitHub Actions + GitHub Pages

## Source of Truth

- Website content: `content/{en,ja,tr}/*.json`
- Theme config: `config/theme.json`
- Tooling config: `config/{vite.config.ts,tsconfig.json,tailwind.config.cjs,postcss.config.cjs}`
- PDF generator: `scripts/generate-resume.mjs`
- DOCX generator: `scripts/generate-docx.mjs`
- Static build pipeline: `scripts/build-static.mjs`
- Static smoke tests: `tests/static-output.test.mjs`

## Important Directories

```text
client/               React application
content/              Language-specific JSON content
config/               Theme and build-tool configuration
public/               Static assets, fonts, generated resume artifacts
scripts/              Build scripts and generators
tests/                Smoke tests for build output
```

## Commands

```bash
npm run dev
npm run build
npm run preview
npm run check
npm run test:static
```

## Build Expectations

`npm run build` should:

1. build the client bundle
2. build the SSR entry
3. prerender `/` into static HTML
4. regenerate `public/resume-{en,ja,tr}.pdf` and `public/resume-{en,ja,tr}.docx`
5. write `dist/client/artifact-status.json`
6. copy public assets into `dist/client`
7. generate `dist/client/sitemap.xml`

If content, theme configuration, or build scripts change, run:

```bash
npm run check
npm run build
npm run test:static
```

## Content Rules

- Keep `en`, `ja`, and `tr` content files structurally aligned.
- Treat `content/` as the canonical source for visible resume content.
- Do not hand-edit generated files in `dist/`.
- Expect `public/resume-*.pdf` and `public/resume-*.docx` to change after builds because they are generated artifacts.

## Repository Hygiene

- Keep the root lean.
- Put new automation in `scripts/`.
- Put tool config in `config/` unless a tool hard-requires the root.
- Do not commit exported resume artifacts such as loose `.txt` or `.docx` files.
