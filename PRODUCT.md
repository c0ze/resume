# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: hiring managers, recruiters and technical interviewers** evaluating
Arda Karaduman for a role. `arda.tr` explicitly routes them here — it is the
one surface in the family that owes this audience a straight answer.

They arrive skeptical and in a hurry, often on a phone, often mid-pipeline with
a dozen other candidates open. Many are Japanese-speaking; some are Turkish.

**Secondary: Arda himself**, who forwards a PDF or DOCX into an application
form or an ATS.

## Product Purpose

The professional dossier. It states, verifiably, what Arda has built over
25 years — and hands over a file the recipient can attach, print or paste into
their own system.

Success: the reader believes the claim and keeps the PDF.

## Positioning

A working systems architect whose span runs from **90nm VLSI and Verilog on a
MIPS R3000 core** through cloud infrastructure to **legacy-to-AI integration
over MCP** — with four first-author computer-architecture papers behind the
early end of it.

The unusual, uncopyable combination is depth *and* longevity in one place:
22 years resident in Japan, nine roles all in Tokyo, published research, and
current work on AI platform architecture.

## Operating Context

- Single-route static site (`/`) prerendered by a ReScript SSR pass, deployed
  by hand to a Cloudflare Worker (static assets).
- Sibling to `arda.tr` (index), `blog.arda.tr` (writing), `ai.arda.tr` (a chat
  bot that answers questions about this résumé; it bakes the résumé in at build
  time and **redeploys itself daily** to pick up changes, so this repo pushes
  nothing to it and holds no credential for it). For an immediate refresh after
  a content edit: `gh workflow run deploy-backend.yml --repo c0ze/ai.arda.tr`.
- The site ships **four downloadable artifacts per language** — PDF, DOCX, JSON
  Resume and vCard — plus per-flavour variants.
- Read on a laptop mid-screening call, on a phone, and as a printed or
  ATS-parsed file. All three are real usage scenes.

## Capabilities and Constraints

- **Stack:** ReScript 11 → React 19, Vite 8, Astryx 0.7 (components for
  controls and layout). The UI is ReScript (`.res` files under `client/src/`);
  the theme and the family patterns are verbatim copies of arda.tr's `brand/`
  in `client/src/brand/`. `npm run check` is `rescript build`; there is **no lint and no
  `verify` script**. `npm run test:static` runs `node --test tests/*.test.mjs`
  and requires a prior build.
- **The exports are independent of the web layout.** `generate-resume.mjs`
  draws A4 with PDFKit; `generate-docx.mjs` writes OOXML. Neither imports
  anything from `client/`. **The binding contract is the content JSON schema,
  not the design** — every field path both generators read must survive.
- **Content is `content/{en,ja,tr}/*.json`**, 12 files each, structurally
  aligned, fully duplicated per language. `Translations.res` loads them through
  `Obj.magic` with **no runtime validation** — a renamed field is an
  `undefined` at runtime, not a compile error. `record.json` is the page's own
  chrome vocabulary (table labels, build details, chat labels) and is read by the
  web layer only.
- **Flavours** (`content/flavors/*.json`) override only `header.subtitle` and
  the two About paragraphs, selected by `?flavor=` in the browser. SSR always
  renders the base résumé.
- **`client/src/brand/` is not this repo's to edit.** Its files are verbatim
  copies of arda.tr's `brand/`; `scripts/check-brand-contract.mjs` compares
  them with the hashes arda.tr publishes. The page's own stylesheet
  (`client/src/index.css`) uses the theme's tokens only.
- **`tests/static-output.test.mjs` asserts that content survives into the
  prerendered HTML**: the position (`header.subtitle`, under the name, not
  just the template's `<head>`) and the contact labels
  (`contact.getInTouch`, `contact.findMeOn`), read from `content/en`.
  `artifact-status.json` is deep-equality asserted.
- **`header.contactViaEmail` must never appear in the rendered HTML** — it is
  both a repo rule and a test assertion. It does go into the downloads.
- **`abstract` is web-only** and must stay out of every export.
- Type: Grenze Gotisch for the name only, Spectral for everything else,
  JetBrains Mono for dates, Zen Antique for Japanese (under `lang="ja"`). `<html lang>`
  tracks the selected language; a blocking bootstrap in `client/index.html`
  applies the stored language before first paint. The scheme is fixed: light only.
- **Still open:** `createRoot` discards the SSR markup rather than hydrating, so
  the prerendered HTML is thrown away on first paint. It costs a re-render, not
  correctness, and it is why the SSR pass always renders the base English
  résumé without a flavour overlay.
- The visual system is **"Kara Duman"**, the arda.tr family system
  (`../DESIGN-SYSTEM.md`; `DESIGN.md` is this repo's binding spec), adopted
  2026-11-23. It replaced "The Index" (2026-11-22, rejected the next day),
  "One Bit Forest" (2026-09-23) and "The Bound Notebook" (2026-07-27). The
  résumé is its most restrained site: bone paper, light only, the name in
  blackletter once, the emblem once, no artwork, black in print; high contrast
  comes from `prefers-contrast: more`.
- `docs/superpowers/specs/*` are historical; the 2026-07-03 revamp spec states
  "no visual redesign" and is superseded (the file carries the notice).
- The OAuth line was removed from the résumé on 2026-09-23 and must not return.

## Brand Commitments

- Name **Arda Karaduman**; the site is the formal register of the family —
  restraint here is the point, not a limitation.
- Voice is factual and unembellished; no growth-copy, no superlatives.
- No employer logos on the page (`DESIGN.md`: no logos); the files in
  `public/images/logos/` are not used.
- Four downloadable formats are a promised capability, not a nice-to-have.

## Evidence on Hand

Real and verifiable — use freely:

- **Nine roles, all Tokyo**: Veltra (Systems Architect, 2024–present), Gaussy
  (2020–2023), Robotfund (2018–2020), Allm (2014–2018), Aiming (2014), Kii
  (2012–2014), Mobilous (2011–2012), plus contract work at Ryde (2021–2022)
  and Iron.io (2017–2019).
- **M.Sc. Keio University 2006–2011**, Amano Laboratory — computer
  architecture, embedded, VLSI. Four first-author papers on the "Echo
  instruction" (IPSJ T-SLDM 2011, IEICE 2009, Embedded World Nuremberg 2009);
  Verilog on a MIPS R3000 core at 90nm.
- **B.Sc. Istanbul Bilgi University 2000–2004** — dissertation on parallel
  quantum-circuit simulation on Linux clusters (MPI); QFT, Grover, Shor.
- 10 technical skill strings, 10 projects (3 with public repos), real paper
  titles.
- Two language certificates, in `about.languagesContent`: TOEFL 263 (old CBT
  scale, 2004) and JLPT Level 2 (2006).

**Absent — must never be fabricated:** salary, references, testimonials,
performance metrics, team sizes, revenue impact, certifications beyond the two
language certificates above, or any quantified business outcome. None of it
exists in the content.

## Product Principles

1. **Verifiable or absent.** Every claim on this page traces to a real role,
   paper or repository.
2. **The file is the deliverable.** The PDF is what gets forwarded; it deserves
   at least as much design attention as the screen.
3. **Restraint is the register.** This is the formal surface of the family.
   Expression must never cost credibility or scanability.
4. **Three languages, equally.** Japanese and Turkish are not fallbacks.
5. **Content schema is a contract.** Four generators and a chat bot read it;
   changing a field path is a breaking change.

## Accessibility & Inclusion

- Every text colour passes WCAG AA on its background (the theme's table, see
  `../DESIGN-SYSTEM.md`); under `prefers-contrast: more` hairlines and muted
  text gain contrast. One light scheme, for everyone.
- `prefers-reduced-motion` fully respected (the chat's mark neither blinks nor
  swells); content readable without JS. Every
  responsibility, competency and work is in the prerendered HTML — nothing is
  behind an interaction.
- The build-details dialog is a native modal `<dialog>` (Astryx `Dialog`:
  inert page, Escape, focus to the title and back to the opener) — that
  standard must be preserved, not regressed.
- `<html lang>` tracks the selected language, set before first paint by the
  bootstrap in `client/index.html` and kept in sync by `LanguageContext.res`.
