# AGENTS.md

Guidance for coding agents working in this repository.

## Mission

Keep the site accurate, static-build-safe, and easy to maintain.

## Before You Change Anything

Read these files first when relevant:

- `README.md` for project overview and layout
- `CLAUDE.md` for repo-specific implementation notes
- `package.json` for the supported commands
- `scripts/build-static.mjs` when touching the build pipeline

## Source of Truth

- Resume content lives in `content/en`, `content/ja`, and `content/tr`
- The theme palette catalogue lives in `themePalettes` inside `scripts/generate-theme.mjs`, which generates `client/src/theme.css` (never edit the generated CSS directly); `config/theme.json` holds the base variant settings consumed by the generator
- Tooling config lives in `config/`
- PDF/DOCX generation lives in `scripts/generate-resume.mjs` and `scripts/generate-docx.mjs`
- The "Ask about Arda" chat widget (`client/src/components/ChatWidget.res`) calls the ai.arda.tr bot; chat Markdown is rendered by `Markdown.res` + `markdownParse.mjs`
- Static + unit validation lives in `tests/*.test.mjs` (run via `npm run test:static`)

## Validation Checklist

Run the smallest relevant set, but before finishing substantial work prefer:

```bash
npm run check
npm run build
npm run test:static
```

## Root Directory Rules

Do not add casual files to the repository root.

Use:

- `scripts/` for scripts and generators
- `config/` for custom project configuration and build-tool config

Only keep files at the root if a tool convention requires them there, such as `package.json`, `.gitignore`, and `.gitattributes`, or if they are repo-wide docs such as `README.md`, `CLAUDE.md`, or `AGENTS.md`.

Do not commit exported resume artifacts such as loose `.txt` or `.docx` files.

## Content Editing Rules

- Keep language files structurally aligned.
- If you add a new field in one language, update the others in the same pass unless there is a good reason not to.
- Each experience has a web-only `abstract` (card preview + modal) that the PDF/DOCX generators ignore — do not render it into the downloads.
- The email (`header.contactViaEmail`) is intentionally kept out of the web page and only appears in the PDF/DOCX — do not surface it in the UI.
- Rebuild after content changes so the PDF/DOCX artifacts and sitemap stay in sync.

## Build Notes

`npm run build` does more than bundling. It also prerenders the homepage, regenerates PDF/DOCX resumes, writes `artifact-status.json`, and emits `sitemap.xml`.

Be careful when editing:

- `scripts/build-static.mjs`
- `scripts/generate-resume.mjs`
- `scripts/generate-theme.mjs`
