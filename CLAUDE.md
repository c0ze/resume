# CLAUDE.md

This file provides repository-specific guidance to Claude Code when working here.

## Project Overview

`resume.arda.tr` is a static, multilingual resume site for Arda Karaduman. The app renders the homepage with React, prerenders it to static HTML during build, generates language-specific PDF, DOCX, and JSON Resume files plus a vCard, and deploys the final output to GitHub Pages.

## Current Stack

- Vite 8
- React 18
- ReScript 11
- Tailwind CSS
- PDFKit + docx (PDF/DOCX resumes)
- GitHub Actions + GitHub Pages (CI runs Node 24)

## Source of Truth

- Website content: `content/{en,ja,tr}/*.json`
- Theme palette catalogue: `themePalettes` in `scripts/generate-theme.mjs` — generates `client/src/theme.css` (never edit the generated CSS directly)
- Theme base settings: `config/theme.json` (variant, primary, appearance, radius — consumed by the generator)
- Tooling config: `config/{vite.config.ts,tailwind.config.cjs,postcss.config.cjs}`
- ReScript config: `rescript.json`
- PDF generator: `scripts/generate-resume.mjs`
- DOCX generator: `scripts/generate-docx.mjs`
- JSON Resume generator: `scripts/generate-json-resume.mjs`
- vCard generator: `scripts/generate-vcard.mjs`
- Static build pipeline: `scripts/build-static.mjs`
- Chat Markdown renderer: `client/src/components/markdownParse.mjs` (+ `Markdown.res`)
- Smoke tests (static output + Markdown): `tests/*.test.mjs` (run by `npm run test:static`)

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
npm run test:static   # Smoke tests: static output + Markdown renderer (tests/*.test.mjs)
npm run res:build     # ReScript compile only
npm run res:clean     # Clean ReScript build artifacts
```

## Key Features

- **AI chat widget** — `client/src/components/ChatWidget.res` ("Ask about Arda") POSTs to the ai.arda.tr bot's SSE `/api/chat/stream` (falls back to non-streaming `/api/chat`) and renders Markdown via `Markdown.res` + `markdownParse.mjs` (builds React elements only — XSS-safe). The bot holds the API key, so the static site ships no secrets. Other components open it via the `arda:open-chat` window event (`ChatWidget.openChat()`).
- **Web-only `abstract`** — each experience carries an `abstract` (card preview + modal). `scripts/generate-resume.mjs`, `scripts/generate-docx.mjs`, and `scripts/generate-json-resume.mjs` deliberately ignore it; keep it out of the PDF/DOCX/JSON downloads.
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
- Lucide React icon bindings are in `client/src/bindings/LucideReact.res`.
- UI primitives (Card, CardContent, Button) are in `client/src/UI.res`.

## Content Rules

- Keep `en`, `ja`, and `tr` content files structurally aligned.
- Treat `content/` as the canonical source for visible resume content.
- Do not hand-edit generated files in `dist/`.
- Expect `public/resume-*.{pdf,docx,json}` and `public/arda.vcf` to change after builds because they are generated (gitignored) artifacts.

## Repository Hygiene

- Keep the root lean.
- Put new automation in `scripts/`.
- Put tool config in `config/` unless a tool hard-requires the root.
- Do not commit exported resume artifacts such as loose `.txt` or `.docx` files.
- Do not commit `.res.mjs` files — they are build artifacts.
