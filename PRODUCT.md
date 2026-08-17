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
  to GitHub Pages.
- Sibling to `arda.tr` (index), `blog.arda.tr` (writing), `ai.arda.tr` (a chat
  bot that answers questions about this résumé and is notified on content
  changes via `notify-bot.yml`).
- The site ships **four downloadable artifacts per language** — PDF, DOCX, JSON
  Resume and vCard — plus per-flavour variants.
- Read on a laptop mid-screening call, on a phone, and as a printed or
  ATS-parsed file. All three are real usage scenes.

## Capabilities and Constraints

- **Stack:** ReScript 12 → React 18, Vite, Tailwind 3. ~2,515 LOC across 29
  `.res` files. `npm run check` is `rescript build`; there is **no lint and no
  `verify` script**. `npm run test:static` runs `node --test tests/*.test.mjs`
  and requires a prior build.
- **The exports are independent of the web layout.** `generate-resume.mjs`
  draws A4 with PDFKit; `generate-docx.mjs` writes OOXML. Neither imports
  anything from `client/`. **The binding contract is the content JSON schema,
  not the design** — every field path both generators read must survive.
- **Content is `content/{en,ja,tr}/*.json`**, 12 files each, structurally
  aligned, fully duplicated per language. `Translations.res` loads them through
  `Obj.magic` with **no runtime validation** — a renamed field is an
  `undefined` at runtime, not a compile error. `record.json` is the record
  book's own chrome vocabulary and is read by the web layer only.
- **Flavours** (`content/flavors/*.json`) override only `header.subtitle` and
  the two About paragraphs, selected by `?flavor=` in the browser. SSR always
  renders the base résumé.
- **`client/src/theme.css` is generated** by `scripts/generate-theme.mjs` from
  its `themePalettes` object. Never hand-edit it. New tokens are a two-file
  change: the generator plus `config/tailwind.config.cjs`.
- **Two literal strings are asserted in `tests/static-output.test.mjs`** and
  must survive into the prerendered HTML: `"Backend Systems Architect"` and
  `"Get In Touch"`. `artifact-status.json` is deep-equality asserted.
- **`header.contactViaEmail` must never appear in the rendered HTML** — it is
  both a repo rule and a test assertion. It does go into the downloads.
- **`abstract` is web-only** and must stay out of every export.
- `<html lang>` tracks the selected language, and a blocking bootstrap in
  `client/index.html` applies the stored rendition and language before first
  paint. Both fix live defects and must not regress.
- **The body face must be verified by what the browser paints, not by declared
  `unicode-range`.** Several Japanese families (Zen Kaku Gothic New, Noto Sans
  JP) declare the latin-ext range and ship no `Ş ş Ğ ğ İ`, so Turkish silently
  falls back to a serif mid-word. **M PLUS 2** was chosen because
  `CSS.getPlatformFontsForNode` reports it painting every glyph in all three
  languages itself. Re-run that check before changing the face.
- **Still open:** `createRoot` discards the SSR markup rather than hydrating, so
  the prerendered HTML is thrown away on first paint. It costs a re-render, not
  correctness, and it is why the SSR pass always renders the base English
  résumé without a flavour overlay.
- The visual system is the **category standard at full craft** (`DESIGN.md`,
  binding). The four renditions are Light, Light HC, Dark, Dark HC; the two HC
  renditions target WCAG AAA. It replaced "The Bound Notebook" on 2026-08-18,
  which had itself replaced the four-theme professional subset on 2026-07-27.
- `docs/superpowers/specs/2026-07-03-resume-revamp-design.md` states "no visual
  redesign" and is **superseded** by that work; the file carries the notice.

## Brand Commitments

- Name **Arda Karaduman**; the site is the formal register of the family.
- **Standing preference: the category standard, executed at full craft.** Asked
  to choose a visual world, the user twice re-rolled concept-led directions and
  then asked for "something simpler." Treat that as durable: do not propose a
  metaphor, an artifact genre or a governing conceit for this surface again
  without being asked. The named craft bar is **Linear/Vercel, Apple/MUJI and
  read.cv** — convention executed at their level of finish, without irony and
  without a smuggled quirk.
- Voice is factual and unembellished; no growth-copy, no superlatives.
- Employer logos are real assets in `public/` and are used as marks.
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
- 11 technical skill strings, 10 projects (3 with public repos), real employer
  logos, real paper titles.

**Absent — must never be fabricated:** salary, references, testimonials,
performance metrics, team sizes, revenue impact, certifications, or any
quantified business outcome. None of it exists in the content.

## Product Principles

1. **Verifiable or absent.** Every claim on this page traces to a real role,
   paper or repository.
2. **The file is the deliverable.** The PDF is what gets forwarded; it deserves
   at least as much design attention as the screen.
3. **Plain and professional is the register.** On 2026-08-18 the standing
   "restraint is the register" doctrine was dropped and replaced by the user's
   own brief: *plain, professional, simple, elegant*. This surface deliberately
   carries no borrowed world and no governing metaphor — expression lives in
   the precision of type, spacing and state, never in an apparatus laid over
   the content, and never at the cost of credibility or scanability.
4. **Three languages, equally.** Japanese and Turkish are not fallbacks.
5. **Content schema is a contract.** Four generators and a chat bot read it;
   changing a field path is a breaking change.

## Accessibility & Inclusion

- WCAG-conscious contrast in every rendition, with one AAA-targeted
  high-contrast light rendition and one AAA-targeted high-contrast dark
  rendition (Light HC and Dark HC).
- `prefers-reduced-motion` fully respected; content readable without JS. Every
  responsibility, competency and work is in the prerendered HTML.
- **Sections are collapsible, and on arrival only the statement is open**
  (2026-08-18, at the user's request). This qualifies the older "nothing is
  behind an interaction" rule rather than discarding it: the mechanism is a
  native `<details>`, so the whole record stays in the prerendered HTML for an
  ATS and a crawler, browser find-in-page opens a closed section to reveal a
  match, it works with JavaScript off, and the print sheet forces every section
  open. What genuinely changed is that a hurried reader now sees an index
  first — which is the trade that was chosen deliberately.
- The modal is genuinely accessible (focus trap, `inert`, Escape, focus
  restore) — that standard must be preserved, not regressed.
- `<html lang>` tracks the selected language, set before first paint by the
  bootstrap in `client/index.html` and kept in sync by `LanguageContext.res`.
