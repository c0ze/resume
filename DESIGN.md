---
name: resume.arda.tr
description: The résumé in Kara Duman, the arda.tr family's system, at its most restrained. Bone paper, the name in blackletter once, the emblem once, no artwork.
---

# Design System: resume.arda.tr

## Overview

**System: "Kara Duman"**, the shared design system of arda.tr, blog.arda.tr,
resume.arda.tr and ai.arda.tr (adopted 2026-11-23). It replaced "The Index"
(22 November 2026, rejected the next day as generic) and "One Bit Forest"
(September 2026). The family contract is `../DESIGN-SYSTEM.md`; the design of
this site is slide 14 of the Moda canvas, captured in
`../output/rebrand-kara-duman/14-resume.png`. **Look at it before changing
anything visual.** This file is binding for this repo and says how the family
system is applied here.

The idea of the family: his surname means black smoke. Soot on paper, cut by
hand, signed by one person. The résumé is where that idea is held back the
most, because its reader is a recruiter with forty seconds:

- **Blackletter: the name, once.** Everything else is Spectral.
- **No plume, no wisp, no forest.** The emblem signs the page once, top left.
- **No ember in the page.** Links are Ember Deep (`--color-text-accent`),
  buttons are soot. The ember appears only as the assistant, in the chat.
- **Two rule weights, no boxes, no shadows.**
- **Light only.** It prints in black.

## Where the system lives

| What | Where | Notes |
|---|---|---|
| Built theme | `client/src/brand/arda.css`, `arda.js` (+ `arda.d.ts`, `arda.variants.d.ts`) | The Astryx `arda` theme. The stylesheet is scoped to `[data-astryx-theme="arda"]`; the module is what `App.res` passes to `<Theme>`. |
| Family patterns | `client/src/brand/brand.css` | Classes prefixed `ix-`. Used here: `.ix-wrap`, `.ix-emblem`, `.ix-label`, `.ix-mono`, `.ix-note`, `.ix-small`, `.ix-muted`, `.ix-row__title`, `.ix-chip(s)`, `.ix-input`, `.ix-kv`, `.ix-prose`, `.ix-foot`, `.ix-sr`, and the assistant's `.ix-mark`, `.ix-thread`, `.ix-msg`. |
| Scheme switch | `client/src/brand/scheme.js` | Carried for the contract; **not imported** (this site has no switch). |
| Artwork | `client/src/brand/art/emblem.webp`, `ember.webp` | The only two pieces this site uses. |
| Favicon | `public/favicon.svg` | The family's small glyph. |
| Page layout | `client/src/index.css` | This site's own rules: tokens only. |
| Layer order | `client/src/layers.css` | `@layer reset, astryx-base, astryx-theme, brand;`, imported first. |

Everything under `client/src/brand/` and `public/favicon.svg` is a **verbatim
copy of `../arda.tr/brand/`. Never edit a copy.** Change the file in arda.tr,
copy it out again, and let the contract check confirm it (see the end of this
file). A pattern brand.css lacks goes in `client/src/index.css` and in the
list under "Patterns outside brand.css".

## Colors

The light column of the family's table; nothing is redefined here.

| Role | Token | Value on bone paper |
|---|---|---|
| Page | `--color-background-body` | Bone `#E8E0CE` |
| Surface (the visitor's chat message, inputs, the dialog) | `--color-background-surface` | `#F3EDDF` |
| Text | `--color-text-primary` | Soot `#0D0C0A` |
| Secondary text, labels | `--color-text-secondary` | `#5C574C` |
| Section rule | `--color-border-emphasized` | `#5C574C` |
| Row hairline | `--color-border` | `#BDB5A2` |
| Link | `--color-text-accent` | Ember Deep `#A33312` |
| Primary button | `--color-accent` / `--color-on-accent` | soot / bone |
| Focus | `--focus-outline-color` | soot, 2px, 3px offset |
| Error | `--ix-error` | `#9B1C1C`, always with a written message |

### Rules

- `client/src/index.css` writes no colour: no hex, no `rgb()`. A test enforces
  it. (`white` and `black` appear in the print block only.)
- Ember `#E2502A` and Ash are banned as text on bone. The only ember on this
  site is the artwork of the assistant's mark.
- One primary button on the page: the PDF.
- `<meta name="theme-color">` repeats the page colour (`#E8E0CE`); a test keeps
  it in step with `brand/arda.css`.

## Scheme

Light only: `<html data-astryx-theme="arda" data-theme="light">`,
`<meta name="color-scheme" content="light">`, `<Theme mode="light">`. No
switch, nothing stored, no scheme script. A reader on a dark system gets the
same page as everyone else and the same page that prints.

## Typography

Google Fonts, `display=swap`, preconnected: Grenze Gotisch 800 · Spectral 400,
400 italic, 600 · JetBrains Mono 400 · Zen Antique 400.

| What | Face | Size |
|---|---|---|
| The name (the one `h1`) | Grenze Gotisch 800 | Heading 1: 64px, 44px on a phone |
| The position (`.head__title`) | Spectral 600 | Heading 3: 26px |
| An entry's title (`h3.ix-row__title`) | Spectral 600 | Body: 20px |
| The About statement | Spectral 400 | Body: 20px |
| Employer, school, stack (`.ix-note`) | Spectral 400 italic, secondary | Small: 18px |
| Details, the colophon, the chat | Spectral 400 | Small: 18px |
| Section and entry labels (`.ix-label`) | Spectral 600, capitals, 0.14em | 18px |
| Periods, years (`.ix-mono`) | JetBrains Mono 400 | 18px |

- **Nothing on screen is set below 18px.** `index.css` writes no type size
  (a test enforces it); sizes are the theme's tokens.
- The theme sets `h1` *and* `h2` (and a dialog's title) in blackletter. Here
  every section heading is an `h2.ix-label`, and the title of the build
  details is set back to Heading 3 in Spectral by `index.css`. A test checks
  both.
- **Japanese sits under `lang="ja"`** and falls through to Zen Antique: the
  whole Japanese page, the 日本語 cell of the language switch, the companion
  statement in About on the English page. The name is Latin in every language
  and stays in blackletter on the Japanese page too (`.head h1:lang(ja)`).
- The theme sizes and colours every `<p>` itself, so a rule that should make a
  paragraph small or secondary must name the `<p>` (or put `.ix-small` /
  `.ix-muted` on it), not its container.
- The PDF and DOCX keep their own embedded fonts and layout; they are not part
  of this system.

## Layout

One column, 960px wide (`--ix-max: 60rem`), inside the family's margins
(`.ix-wrap`). Tight.

1. **The top line** (`Bar.res`, `<header class="top">`): the emblem at the
   left, 56px, linking to arda.tr. At the right the family's links in small
   text (arda.tr, blog, ask) and the language switch: one segmented control,
   EN | 日本語 | TR, the current one filled soot with bone text
   (`aria-current="true"`).
2. **The head** (`Head.res`): the name; the position; where Arda is, in small
   secondary text; the four downloads (PDF primary, DOCX, JSON and vCard
   outlined); the build date with the link to the build details; the section
   links.
3. **A 1px rule**, then **the sections** (`Section.res`), each two columns:
   the label in capitals at the left (220px), the entries at the right.
   A hairline separates sections and, across the content column, entries.
   An entry is its title with the period in mono at the far right, the
   organisation in italics under it, then the details in small text. Every
   detail is on the page: nothing is behind a click.
4. **A 1px rule**, then **the colophon** (`Footer.res`) in small secondary
   text: copyright, how the page is made, the commit and build time, the
   family's sites.

On a phone (below 45rem): one column, labels above their content, the
language switch full width under the emblem.

## Landmarks

`<header>` (the top line), `<main>` (the name, the downloads, every section),
`<footer>` (the colophon). One `h1`; sections are `h2`; entries `h3`; the
papers `h4`. Two `<nav>`s, named: the family (`arda.tr`) and the sections.
Sections are not labelled regions: six more landmarks would bury the three
that matter.

## Motion

None of the page's own. The assistant's ember glows while a reply is on its
way and with the voice's loudness (brand.css); under
`prefers-reduced-motion: reduce` it holds one brightness.

## Components

- **Astryx** (`client/src/Astryx.res`): `Theme`, the i18n provider, `Button`,
  `Link`, `Dialog` + `DialogHeader` (the build details), `Switch` (read
  replies aloud), `IconButton` + `Icon` (close the chat), `Text`, `HStack`.
- **Buttons** are Astryx's `Button`: the theme's primary is bone on soot, its
  secondary (the default) a 1px outline.
- **The language switch**: `.ix-chip` buttons joined (`.lang`).
- **The chat** (`ChatWidget.res`): a launcher (a secondary Button with the small ember,
  `.ix-mark--sm`) that opens a panel on the page colour with a 1px border.
  The assistant's messages sit left beside the ember with no bubble
  (`.ix-msg`); the visitor's sit right on the surface colour
  (`.ix-msg--you`); the suggested questions are `.ix-chip`s; the input is
  `.ix-input` with a primary button. The ember is drawn by `.ix-mark` from
  `--ix-ember-art`, which `index.css` sets on `:root`; `data-busy="true"`
  while a reply is on its way; `--ix-level` from the voice. On a phone the
  panel is a bottom sheet.

## Print

- Ground white, all ink pure black (text, rules, links).
- Hidden: the language switch and the family links, the downloads, the build
  date line, the section links, the chat (`.no-print`).
- Links lose their colour and print their address, unless the link's text is
  already the address (`.url-text`).
- The emblem prints as a solid black seal: a black disc, its lines the white
  of the paper (`print-color-adjust: exact`).
- A4 and Letter: no page size is set; the margin is 18mm.
- Type is a step smaller on paper than on screen. A title stays with what
  follows it; a paragraph or list item is not cut in two.

## Patterns outside brand.css

In `client/src/index.css`, tokens only. Candidates for brand.css if another
site needs them:

- **`.lang`**: the segmented control made of `.ix-chip`s (joined cells, 48px
  tall, radius on the outer corners only).
- **`.sec`, `.sec__body`, `.entry`, `.entry__head`**: the résumé's section
  (label column + entries, hairlines) and its entry (title, mono period at the
  far right, italic line, details). brand.css has `.ix-kv` for facts and
  `.ix-row` for the landing page's numbered rows; neither carries an entry.
- **`.links`**: a wrapping line of small bare links.
- **`.plain`, `.rows`, `.entry__list`, `.papers`**: lists without bullets,
  with hairlines, with a dash, as citations.
- **`.colophon`**: a colophon of several lines (brand.css's `.ix-foot__in` is
  one line).
- **`.chat*`, `.md*`**: where the chat floats, its frame, and a reply's
  Markdown.
- **`.head h1:lang(ja)`**: names the blackletter face, because under
  `lang="ja"` brand.css replaces `--font-family-heading` on every element and
  the theme's value cannot be reached. A test keeps the name in step with
  `brand/arda.css`.
- **`dialog .astryx-heading[data-level="2"]`**: a dialog's title in Spectral.
- **The print block**: black-ink token overrides, the black seal, link
  addresses, `@page`.

## Do's and Don'ts

- Do keep blackletter to the name. A new heading is `.ix-label` or Spectral.
- Do use the theme's tokens for every colour, size and space.
- Do mark Japanese text `lang="ja"`, and English-only words inside a Turkish
  or Japanese page `lang="en"` where capitals are applied.
- Don't add artwork, the wordmark, a second emblem, or the ember outside the
  chat.
- Don't add a second primary button, a card, a box or a shadow.
- Don't set anything below 18px on screen.
- Don't add a scheme switch.
- Don't render `header.contactViaEmail` (the email stays in the downloads), and
  don't bring back the OAuth line (`PRODUCT.md`).

## Cross-repo brand contract

`scripts/check-brand-contract.mjs` (run by
`.github/workflows/brand-contract.yml` on pushes to `main`) fetches
`https://raw.githubusercontent.com/c0ze/arda.tr/main/config/themes.json`. If
its `version` is 4, the sha256 of this site's `arda.css`, `arda.js`,
`brand.css` and `scheme.js` must equal `files[name].sha256`; a mismatch fails.
While arda.tr's `main` still publishes an older contract, the check prints a
note and passes. `THEMES_CONTRACT_PATH=../arda.tr/config/themes.json` checks
against a local checkout.
