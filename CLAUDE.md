# CLAUDE.md

This file provides repository-specific guidance to Claude Code when working here.

## Project Overview

`resume.arda.tr` is a static, multilingual resume site for Arda Karaduman. The app renders the homepage with React, prerenders it to static HTML during build, generates language-specific PDF and DOCX resumes, and deploys the final output to GitHub Pages.

## Current Stack

- Vite 8
- React 18
- ReScript 11
- Tailwind CSS
- PDFKit
- GitHub Actions + GitHub Pages

## Source of Truth

- Website content: `content/{en,ja,tr}/*.json`
- Theme config: `config/theme.json`
- Tooling config: `config/{vite.config.ts,tailwind.config.cjs,postcss.config.cjs}`
- ReScript config: `rescript.json`
- PDF generator: `scripts/generate-resume.mjs`
- DOCX generator: `scripts/generate-docx.mjs`
- Static build pipeline: `scripts/build-static.mjs`
- Static smoke tests: `tests/static-output.test.mjs`

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
npm run test:static   # Smoke tests for build output
npm run res:build     # ReScript compile only
npm run res:clean     # Clean ReScript build artifacts
```

## Build Expectations

`npm run build` should:

1. compile ReScript sources to `.res.mjs`
2. build the client bundle
3. build the SSR entry
4. prerender `/` into static HTML
5. regenerate `public/resume-{en,ja,tr}.pdf` and `public/resume-{en,ja,tr}.docx`
6. write `dist/client/artifact-status.json`
7. copy public assets into `dist/client`
8. generate `dist/client/sitemap.xml`

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
- Lucide React icon bindings are in `client/src/bindings/LucideReact.res`.
- UI primitives (Card, CardContent, Button) are in `client/src/UI.res`.

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
- Do not commit `.res.mjs` files — they are build artifacts.
