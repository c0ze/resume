# CLAUDE.md

This file provides repository-specific guidance to Claude Code when working here.

## Design System

The visual system is the **category standard executed at full craft** — see `DESIGN.md`, which is
binding. Product truth is in `PRODUCT.md`; the direction contract for the single
`/` route is in `.impeccable/surfaces/client-src-pages-home-res.md`. Read those
before changing anything visual.

## Project Overview

`resume.arda.tr` is a static, multilingual resume site for Arda Karaduman. The app renders the homepage with React, prerenders it to static HTML during build, generates language-specific PDF, DOCX, and JSON Resume files plus a vCard, and deploys the final output to GitHub Pages.

## Current Stack

- Vite 8
- React 18
- ReScript 11
- Tailwind CSS (reset, token-mapped colours and the spacing scale only)
- M PLUS 2 from Google Fonts (weights 400 and 700 only). **Verify any face
  change by what the browser actually paints** (`CSS.getPlatformFontsForNode`),
  never by declared `unicode-range` — several JP families declare latin-ext and
  ship no `Ş ş Ğ ğ İ`, so Turkish falls back to a serif mid-word.
- PDFKit + docx (PDF/DOCX resumes)
- GitHub Actions + GitHub Pages (CI runs Node 24)

## Source of Truth

- Website content: `content/{en,ja,tr}/*.json` (12 files each, structurally
  aligned; `record.json` holds the page's own chrome vocabulary)
- Theme palette catalogue: `themePalettes` in `scripts/generate-theme.mjs` — generates `client/src/theme.css` (never edit the generated CSS directly)
- Theme base settings: `config/theme.json` (appearance, radius — consumed by the generator)
- Tooling config: `config/{vite.config.ts,tailwind.config.cjs,postcss.config.cjs}`
- ReScript config: `rescript.json`
- PDF generator: `scripts/generate-resume.mjs`
- DOCX generator: `scripts/generate-docx.mjs`
- JSON Resume generator: `scripts/generate-json-resume.mjs`
- vCard generator: `scripts/generate-vcard.mjs`
- Theme contract check (names vs the shared arda.tr catalogue): `scripts/check-theme-contract.mjs` (run by `.github/workflows/theme-contract.yml`)
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
- **Web-only `abstract`** — each experience carries an `abstract`, rendered inline above its responsibilities (`.entry__abstract`). Nothing is behind an interaction: every responsibility, competency and work is in the prerendered HTML. `scripts/generate-resume.mjs`, `scripts/generate-docx.mjs`, and `scripts/generate-json-resume.mjs` deliberately ignore it; keep it out of the PDF/DOCX/JSON downloads.
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
- There is no icon set and no icon dependency. If an icon ever becomes
  necessary, prefer inline SVG over adding a package.
- Shared UI parts live in `client/src/components/Section.res` (the section name
  in its rail plus the content column every section is built from),
  `Controls.res` (language and rendition) and `Mark.res` (the monochrome
  employer/institution logo).

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


<!-- ============================================================
UNRECONCILED — 42 lines that existed only in AGENTS.md when CLAUDE.md and
AGENTS.md were consolidated (2026-08-08). Fold anything useful into the
sections above, then delete this block.
============================================================ -->

# AGENTS.md
Be careful when editing:
## Before You Change Anything
## Build Notes
- `CLAUDE.md` for repo-specific implementation notes
- `config/` for custom project configuration and build-tool config
## Content Editing Rules
- `DESIGN.md` for the design system — it is binding, not advisory
Do not add casual files to the repository root.
Do not commit exported resume artifacts such as loose `.txt` or `.docx` files.
- Each experience has a web-only `abstract` that the PDF/DOCX/JSON generators ignore — do not render it into the downloads.
Guidance for coding agents working in this repository.
- If you add a new field in one language, update the others in the same pass unless there is a good reason not to.
- JSON Resume and vCard generation lives in `scripts/generate-json-resume.mjs` and `scripts/generate-vcard.mjs`
- Keep language files structurally aligned. `record.json` carries the page's own chrome vocabulary (control labels, the download block, the build-provenance copy) and is translated in full — a test asserts the three files match in shape and differ in content.
Keep the site accurate, static-build-safe, and easy to maintain.
## Mission
`npm run build` does more than bundling. It also prerenders the homepage, regenerates the PDF/DOCX resumes, the JSON Resume exports, and the vCard, writes `artifact-status.json`, and emits `sitemap.xml`.
Only keep files at the root if a tool convention requires them there, such as `package.json`, `.gitignore`, and `.gitattributes`, or if they are repo-wide docs such as `README.md`, `CLAUDE.md`, or `AGENTS.md`.
- `package.json` for the supported commands
- PDF/DOCX generation lives in `scripts/generate-resume.mjs` and `scripts/generate-docx.mjs`
- `PRODUCT.md` for product truth, including what must never be fabricated
- `README.md` for project overview and layout
Read these files first when relevant:
- Rebuild after content changes so the PDF/DOCX/JSON/vCard artifacts and sitemap stay in sync.
- Resume content lives in `content/en`, `content/ja`, and `content/tr`
## Root Directory Rules
Run the smallest relevant set, but before finishing substantial work prefer:
- `scripts/build-static.mjs`
- `scripts/build-static.mjs` when touching the build pipeline
- `scripts/check-theme-contract.mjs` verifies the theme names against the shared arda.tr catalogue (separate, non-blocking `.github/workflows/theme-contract.yml`)
- `scripts/` for scripts and generators
- `scripts/generate-resume.mjs`
- `scripts/generate-theme.mjs`
- Static + unit validation lives in `tests/*.test.mjs` (run via `npm run test:static`)
- The "Ask about Arda" chat widget (`client/src/components/ChatWidget.res`) calls the ai.arda.tr bot; chat Markdown is rendered by `Markdown.res` + `markdownParse.mjs`
- The email (`header.contactViaEmail`) is intentionally kept out of the web page and only appears in the downloads (PDF/DOCX/JSON Resume/vCard) — do not surface it in the UI.
- The rendition catalogue lives in `themePalettes` inside `scripts/generate-theme.mjs`, which generates `client/src/theme.css` (never edit the generated CSS directly); `config/theme.json` holds the base settings consumed by the generator. A new token is a two-file change: the generator plus `config/tailwind.config.cjs`
- The visual system is the category standard at full craft — `DESIGN.md` is binding, `PRODUCT.md` holds product truth
- Tooling config lives in `config/`
Use:
## Validation Checklist
