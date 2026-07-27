---
name: resume.arda.tr
description: A career history set as a bound laboratory notebook — numbered, dated, witnessed, and impossible to quietly revise.
---

# Design System: resume.arda.tr

## Overview

**Creative North Star: "The Bound Notebook"**

A laboratory notebook is the instrument science uses to make claims about the
past *checkable*. It is bound so pages cannot be inserted. Pages are
sequentially numbered. Entries are dated and written in ink. An error is struck
through with a single line and initialled — never erased, because the record of
the correction is part of the record. A witness countersigns.

That is the exact problem a résumé has. A CV is a claim about twenty-five years
that a stranger must decide whether to believe, in about forty seconds, while
holding a dozen other candidates. This site's product principle is already
"verifiable or absent"; the notebook is the genre where verifiability *is* the
aesthetic rather than an assertion. It is also literally Arda's own document —
Amano Laboratory, Keio, 2006–2011, four first-author papers.

The register is formal and unembellished, because this is the surface `arda.tr`
routes recruiters to and restraint is what it trades on. Expression lives in
the apparatus — the ruled grid, the entry numbering, the marginal annotations,
the countersign block — never in ornament laid over the content.

**Critically, this must be built as a system, not a texture.** Page numbers,
dated entries, struck corrections, witness columns and a contents index are the
world. A paper-grain background image is not, and would make the whole thing
twee.

**Confirmed anti-references:** the modern CV page (sidebar photo, skill bars,
dotted timeline, tech-logo grid, gradient name) and its predictable opposite,
the black-Times-on-white "I don't need design" CV; plus the incumbent look this
replaces — gradient name fill, `.glass`, glow shadows, blur blobs, the dotted
dossier grid, scroll-reveal, the 42-second tech marquee, hover lift.

**Key Characteristics:**

- Every section is a numbered, dated entry on a numbered page
- A ruled quad grid underlies the whole layout and is faintly visible
- Corrections are struck through and kept, never removed
- Two inks: writing ink and correction red. Nothing else.
- Print-native — the PDF is the object, not a downgrade

## Colors

Two inks on ruled stock. The palette is deliberately narrower than the previous
system, because a notebook's is.

### Primary

- **Writing Ink** (`#1B2432`): a blue-black fountain/ballpoint ink. All body
  text, all headings, all rules. Distinct from a neutral black — ink on paper
  is never truly black.

### Secondary

- **Correction Red** (`#A32B20`): the second pen. Used only for struck-through
  corrections, the countersign, the page stamp, and required-field marks.
  Nowhere else, ever.

### Neutral

Every rendition is exactly seven tokens, emitted per class by
`scripts/generate-theme.mjs`: `--stock`, `--stock-deep`, `--grid`, `--rule`,
`--ink`, `--pencil`, `--red`. There is no eighth. Emphasis is a doubled rule or
a tone step, never a tint — which is why the tokens are raw hex rather than
channel-split for Tailwind's `<alpha-value>` slot. If you reach for
`text-ink/60`, reach for `text-pencil` instead.

**Ruled** (`.ruled`, light, the native rendition — laboratory stock is pale cool
green-grey, not cream and not white):

| Token | Value | Role |
| --- | --- | --- |
| `--stock` | `#EEF0EA` | the page |
| `--stock-deep` | `#E2E5DC` | entry blocks, table bands, the bound spine strip |
| `--grid` | `#C3C9BC` | the quad-ruled grid, at 5mm |
| `--rule` | `#8E9686` | printed hairlines and column borders |
| `--ink` | `#1B2432` | all primary text — 13.6:1 on stock |
| `--pencil` | `#5C6470` | metadata, page numbers, marginal notes — 5.2:1 |
| `--red` | `#A32B20` | Correction Red — 6.3:1 |

**Ruled HC** (`.ruled-hc`, the same sheet printed hard — AAA):
`--stock` `#F4F6F1` · `--stock-deep` `#E4E8DF` · `--grid` `#AEB6A6` ·
`--rule` `#3F4638` · `--ink` `#0D1219` (17.3:1) · `--pencil` `#333A44` (10.6:1) ·
`--red` `#7E1A12` (9.4:1).

**Carbon Copy** (`.carbon-copy`, dark — a carbon flimsy, which is a real artifact
of the same desk. Purple-black, slightly smeared, not an inversion):

| Token | Value | Role |
| --- | --- | --- |
| `--stock` | `#14131A` | the page (Flimsy) |
| `--stock-deep` | `#1E1C26` | entry blocks, table bands |
| `--grid` | `#2E2B3A` | the quad grid |
| `--rule` | `#4A4658` | printed hairlines |
| `--ink` | `#E8E4F0` | Carbon Violet — carbon transfer reads violet-white, not neutral (14.8:1) |
| `--pencil` | `#918CA3` | metadata, page numbers (5.7:1) |
| `--red` | `#E2705F` | Correction Red, lifted (5.9:1) |

**Carbon Copy HC** (`.carbon-copy-hc`, the flimsy under a lamp — AAA):
`--stock` `#0B0A10` · `--stock-deep` `#17151F` · `--grid` `#332F42` ·
`--rule` `#8C87A0` · `--ink` `#F6F4FB` (18.1:1) · `--pencil` `#C4BFD6` (11.1:1) ·
`--red` `#FF9B8A` (9.7:1).

**Correction Red is per-rendition, not one constant.** `#A32B20` on Flimsy is
1.3:1 — it would make the one real correction on the document invisible. The
dark renditions carry a lifted red instead. This is the single palette value
that departs from the seed, and it departs because the seed's value fails the
only job the colour has.

### Named Rules

**The Two Pen Rule.** There are exactly two inks: Writing Ink and Correction
Red. Correction Red appears only where a real correction, countersign or stamp
exists. A third colour is a system violation.

**The Ruled Ground Rule.** The 5mm quad grid is the layout grid — components
align to it rather than floating over it. Three clarifications, all learned by
building it:

- It is a **block** grid, not a baseline grid. Body at `0.9375rem / 1.75` is
  26.25px of leading against an 18.9px quad; those do not divide. Structural
  edges land on rules; prose rides freely between them. Do not promise
  baselines the arithmetic cannot keep.
- **Minor rules draw at roughly 62% toward Stock; full `#C3C9BC` is reserved
  for a 20mm major.** At full strength every 5mm the grid fights 15px type and
  makes printed hairlines look doubled.
- The grid **continues through the spine.** The spine is a tone step, not an
  opaque strip that interrupts the ruling it is supposed to sit on.
- Browsers lay `5mm` out as 18.890625px, not the ideal 18.8976px. Pin the quad
  to a px constant rather than doing mm arithmetic, or components drift several
  pixels off the painted gradient over a long page.

**The Cool Stock Rule.** The light ground is a pale cool green-grey
(`#EEF0EA`). Cream, parchment, kraft and warm beige are forbidden; laboratory
stock is cool, and warm paper is the default this design refuses.

## Typography

**Display Font:** BIZ UDPGothic (700) — section headers, field labels, the
stamped blocks
**Body Font:** BIZ UDPMincho (400/700) — entries, prose, responsibilities
**Data Font:** BIZ UDPGothic (400, tracked) — page numbers, dates, periods

**Character:** Morisawa's BIZ UD families are Japanese *universal-design*
faces drawn specifically for business and instructional documents. They are the
native register of a 職務経歴書, they cover CJK and Latin in one system, and
they fixed a live defect: Japanese used to fall through to whatever the OS
provided, at a mismatched optical weight, with negative heading tracking applied
to it.

Both families ship 400 and 700 from Google Fonts and both weights are verified
loading (`document.fonts` reports four faces). Turkish coverage
(`ı İ ğ ş ç ö ü`) is present in the `latin-ext` subset of both — no companion
face is needed. (`document.fonts.check()` returns `false` for a weight/size
combination until that subset is actually painted; that is lazy loading, not a
coverage gap, and it is why the check is on `document.fonts` rather than on
`check()`.)

Note the *P* in UDP: these are the **proportional**-metric variants.
`tabular-nums` still aligns the Latin figures, but if a column of dates ever
fails to align, the tabular-metric siblings are `BIZ UDGothic` / `BIZ UDMincho`.

### Hierarchy

- **Display** (BIZ UDPGothic 700, `clamp(1.75rem, 3.5vw, 2.5rem)`, 1.15): the
  name on the index page. This is a record, not a poster — it does not grow past
  2.5rem at any viewport.
- **Section** (BIZ UDPGothic 700, `1.125rem`, 1.2, with entry number): the six
  section headers, each stamped with its entry number and date range.
- **Entry Title** (BIZ UDPMincho 700, `1.0625rem`): a role title, a degree.
- **Body** (BIZ UDPMincho 400, `0.9375rem`, 1.75, max `66ch`): abstracts,
  responsibilities, descriptions.
- **Label** (BIZ UDPGothic 400, `0.7rem`, `0.1em`, uppercase): field names in
  the ruled table — Company, Period, Location.
- **Data** (BIZ UDPGothic 400, `0.8125rem`, tabular figures): dates, periods,
  page numbers, paper citations.

### Named Rules

**The Ledger Figures Rule.** Every date, period and page number uses
`font-variant-numeric: tabular-nums`. A career is read by scanning dates down a
column; they must align.

**The No Poster Rule.** No type on this site exceeds `2.5rem`. The incumbent
`md:text-7xl` hero is the specific thing being refused — a dossier that shouts
its own name has already lost the reader it wanted.

## Layout

The page is a **bound document**. A `28px` spine strip (`.spine`) runs down the
left edge in Stock Deep, carrying stitch marks, the running folio and the
running head — the binding, visible, holding the record together. It is
`aria-hidden`: every number and name it shows is already in the document as real
text.

Every section is an **entry** (`.entry`): a marginal column carrying the entry
number, its page ref and — for engagements and degrees — the employer or
institution mark; then a numbered header rule (`.entry__head`), then a ruled
field table (`.fields`, label column `7rem`, value column fluid), then prose at
66ch. Sub-entries are numbered `02.1 … 02.9`, `05.1 … 05.2`.

**The entry list is fixed at 00–06.** `00` Contents · `00.1` Issue & Artifacts ·
`01` Statement · `02` Record of Service · `03` Competencies · `04` Works ·
`05` Education · `06` Countersign & Issue. The anchors are the pre-existing
`#about`, `#experience`, `#skills`, `#projects`, `#education`, `#contact`.

**Page numbers are derived, never decorative.** `Folio.res` computes them from
the shape of the content — how many engagements, how many degrees — so the index
cites real pages and all three languages agree.

**The index page** opens the document: the `RECORD BOOK` rule, the name, the
struck correction where one is active, the ruled field table (Location /
Resident / Languages / Record / Site), the dot-leader contents, and the stamped
Issue & Artifacts block. A recruiter who reads only this screen knows what Arda
is and already has the file.

**The Record of Service opens with the register** — every engagement on one
ruled table (No. / Period / Employer / Title / p.), each row linking to the page
its full entry is written on — and then writes every engagement out **in full,
inline**. A bound record shows everything; nothing is hidden behind a click.

**The countersign block** closes it. There is no second party in this content
and inventing a witness is forbidden, so **the witness is the build**: commit
SHA, build timestamp, and each of the four artifacts attributed to the script
that actually generated it (`generate-resume.mjs`, `generate-docx.mjs`,
`generate-json-resume.mjs`, `generate-vcard.mjs`). The provenance is injected by
Vite `define` (`__BUILD_COMMIT__` / `__BUILD_TIME__`) and read through
`Build.res`; `scripts/build-static.mjs` pins `RESUME_BUILD_TIME` once so the
client bundle and the SSR bundle, built seconds apart, agree on when the record
was issued. The commit is a link to the commit.

**The Certificate of Issue** is the countersign made examinable: the one modal
in the document, opened from the issue stamp on page 01 and from the closing
entry. It exists so the modal's accessibility work — focus trap, `inert`,
Escape, focus restore — stays in a real, always-available flow rather than
being kept alive as a component nobody reaches.

**Navigation is the contents index.** There is no pill bar. The only fixed
chrome is the **reader's tag** (`.tag`, bottom right): the language of this copy
and the rendition it is printed on — the two things a bound record can honestly
let you change.

**Field labels are one word, at most 11 characters.** The label column is
`7rem`; "POSITION OF RECORD" wraps to three lines at `0.7rem / 0.1em`. This is
why the employer field is labelled `Employer`, not `Organisation`.

**Entries are closed by their own rule, not opened by the next one.** Implemented
as `border-top` on `.entry` with no bottom rule, so a rule is drawn once. The
masthead is the exception — it closes page 01 with an ink rule — so
`.masthead + .entry` explicitly suppresses its `border-top`.

Responsive: the field table restacks to `label: value` pairs below `768px`; the
spine narrows to `16px` and keeps the page number; the marginal column collapses
into a single line. The grid stays 5mm. **The register scrolls sideways; the
artifacts table reflows.** A ledger may scroll — a reader who has to scroll
sideways to find the issue checkmark has not been shown the artifacts, so on
narrow sheets the generator attribution moves under the filename instead.

## Elevation & Depth

**This system has no shadows.** Depth is the page itself: the ruled grid, the
spine strip, the tone step of an entry block against stock, and the faint
offset of the carbon copy. Nothing floats above the page, because nothing on a
bound page can.

### Named Rules

**The Bound Page Rule.** `box-shadow`, `backdrop-filter` and blur are not used
anywhere. `.glass`, `.glass-strong`, `--shadow-glow` and the two `blur-3xl`
blobs were deleted, not restyled. The modal scrim is a flat
`color-mix(in srgb, var(--ink) 74%, transparent)` — an overlay, not a shadow.
A DOM audit of the built page reports zero elements with a non-zero radius, a
box-shadow, or a backdrop-filter.

## Shapes

**Radius is `0`** on every element — entries, tables, buttons, the modal, the
chat panel. Paper does not have rounded corners. Enforced twice: `--radius: 0rem`
comes from `config/theme.json` through the generator, and `@layer base * {
border-radius: 0 }` catches anything that reaches for a literal.

Borders are `1px` Rule hairlines. Emphasis is a doubled rule (`3px double`) or a
tone step, never a heavier stroke and never a colour change.

## Components

The world is made of CSS classes with the document's own names, not Tailwind
soup. `client/src/index.css` is the stylesheet; Tailwind supplies the reset,
the token-mapped colour utilities and the quad spacing scale (`p-q`, `mt-q2`,
`w-spine`) only.

| Class | What it is |
| --- | --- |
| `.sheet` / `.page` | the ruled ground and the text block |
| `.spine` / `.spine__folio` / `.spine__head` / `.spine__cap` | the binding, running folio, running head, volume |
| `.masthead` / `.masthead__strip` / `.masthead__sub` | page 01's header |
| `.struck` / `.amend` / `.amend__prov` | the correction, the amendment, its provenance stamp |
| `.entry` / `.entry--major` / `.entry__marg` / `.entry__mark` / `.entry__head` | a numbered entry and its margin |
| `.fields` (`dl` grid) | the ruled field table |
| `.record` | numbered sub-records (responsibilities, competencies, works) |
| `.contents` / `.toc-row` / `.toc-lead` | the dot-leader index |
| `.schedule` / `.schedule-wrap` | the register of service |
| `.stamp` / `.stamp--double` | Correction Red stamps |
| `.issue` / `.artifacts` / `.countersign` / `.sigline` | the issue block and countersign |
| `.papers` | ruled citation list |
| `.bilingual` | the EN/JA statement, side by side |
| `.slip` / `.tag` | a control drawn as a hairlined slip of stock; the reader's tag |
| `.modal-scrim` / `.modal-panel` / `.chat-panel` / `.chat-bubble` | dialog and enquiry surfaces |

**There are no icons.** A record book has stamps, rules and marginal marks, not
a pictogram language. Affordances are typographic — `×`, `↗`, `↳`, `✓` — and
`lucide-react` was removed from the dependency tree entirely. If an icon ever
becomes genuinely necessary, prefer inline SVG drawn in this grammar (hairline
strokes, no fills, square caps) over reintroducing the package.

**Alignment is a runtime pass.** `Quad.res` measures the browser's real 5mm,
pins `--q` to it, and nudges every `.js-snap` block's bottom padding down to the
next rule — padding-bottom only, so React never has to fight it. It re-runs on
resize, on `document.fonts.ready`, and when the language changes.

## Do's and Don'ts

### Do:

- **Do** number and date every section as an entry, and number every page in
  the spine.
- **Do** render corrections as struck-through-and-kept. The **flavour system is
  the honest use of this device**: when `?flavor=` is active, the base subtitle
  is struck in Correction Red and the flavour subtitle written beside it.
- **Do** align every component to the 5mm quad grid.
- **Do** keep four renditions — Ruled, Ruled HC, Carbon Copy, Carbon Copy HC —
  with the two HC modes targeting WCAG AAA.
- **Do** set `<html lang>` from the selected language and keep the blocking
  bootstrap in `client/index.html` — it applies the stored rendition and language
  before first paint, which is what stops the dark-rendition flash and the
  screen-reader mismatch.
- **Do** preserve every content JSON field path the four generators read. The
  schema is a contract with `generate-resume.mjs`, `generate-docx.mjs`,
  `generate-json-resume.mjs` and `ai.arda.tr`.
- **Do** preserve the modal's existing accessibility behaviour — focus trap,
  `inert`, Escape, focus restore.
- **Do** translate the apparatus. `content/{en,ja,tr}/record.json` holds the
  record book's own vocabulary — field labels, column heads, the issue and
  countersign copy — in all three languages, because "Japanese and Turkish are
  not fallbacks" applies to the chrome as much as to the claims. A test asserts
  the three files are structurally aligned and actually differ.

### Don't:

- **Don't** invent a correction, an amendment or a witness that did not happen.
  Struck-through text must correspond to something real, and the only real one
  today is the flavour override.
- **Don't** use paper-grain images, coffee rings, tape, torn edges, handwriting
  faces, or any other skeuomorphic prop. The apparatus is the world; texture is
  not.
- **Don't** exceed `2.5rem` type anywhere.
- **Don't** use cream, parchment or kraft as the light ground.
- **Don't** let Correction Red carry anything other than a correction,
  countersign, stamp or required mark.
- **Don't** surface `header.contactViaEmail` in the rendered HTML — repo rule
  and test assertion.
- **Don't** hand-edit `client/src/theme.css`; it is generated by
  `scripts/generate-theme.mjs`. A new token is a two-file change: the generator
  plus `config/tailwind.config.cjs`.
- **Don't** use a token's opacity modifier (`bg-ink/10`). The tokens are raw hex
  and deliberately not channel-split, because a tint is a third ink.
- **Don't** hide part of the record behind an interaction. Every
  responsibility, competency and work is rendered inline, visible, and in the
  prerendered HTML — that is what "impossible to quietly revise" costs.

## Cross-repo theme contract

The renditions are named for the artifact they imitate. The canonical arda.tr
catalogue (v2) names the same four *roles* — light, high-contrast light, dark,
high-contrast dark — after its own world: Stock, Stock HC, Microfiche,
Microfiche HC. `scripts/check-theme-contract.mjs` holds the mapping:

| This repo | Canonical |
| --- | --- |
| Ruled | Stock |
| Ruled HC | Stock HC |
| Carbon Copy | Microfiche |
| Carbon Copy HC | Microfiche HC |

The roles line up one-for-one; the words are owned by each site's design system.
The check was failing before this redesign (the local names were still Ivory /
Paper / Steel / Carbon against a catalogue that had moved on) and passes now.
