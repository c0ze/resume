---
name: resume.arda.tr
description: The category standard for a résumé, executed at full craft — one accent, two weights, and a rail that makes twenty-five years scannable.
colors:
  light-bg: "#FFFFFF"
  light-surface: "#F7F8F9"
  light-border: "#E3E5E8"
  light-text: "#15171A"
  light-muted: "#646A72"
  light-accent: "#0D6E79"
  light-accent-contrast: "#FFFFFF"
  light-hc-bg: "#FFFFFF"
  light-hc-surface: "#F1F3F4"
  light-hc-border: "#8A9098"
  light-hc-text: "#000000"
  light-hc-muted: "#3A4046"
  light-hc-accent: "#08505A"
  light-hc-accent-contrast: "#FFFFFF"
  dark-bg: "#0E1013"
  dark-surface: "#171A1E"
  dark-border: "#282C31"
  dark-text: "#EDEFF2"
  dark-muted: "#9BA3AC"
  dark-accent: "#4FC3D0"
  dark-accent-contrast: "#0E1013"
  dark-hc-bg: "#000000"
  dark-hc-surface: "#121417"
  dark-hc-border: "#5C646C"
  dark-hc-text: "#FFFFFF"
  dark-hc-muted: "#C9D0D7"
  dark-hc-accent: "#7FE3EE"
  dark-hc-accent-contrast: "#000000"
  print-bg: "#ffffff"
  print-surface: "#ffffff"
  print-border: "#cccccc"
  print-text: "#000000"
  print-muted: "#444444"
  print-accent: "#000000"
  print-accent-contrast: "#ffffff"
typography:
  name:
    fontFamily: '"M PLUS 2", "Hiragino Kaku Gothic ProN", Meiryo, system-ui, sans-serif'
    fontSize: "clamp(1.75rem, 1.2rem + 2.4vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.026em"
  subtitle:
    fontSize: "clamp(1rem, 0.94rem + 0.3vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "-0.006em"
  section-label:
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.08em"
  entry-title:
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "-0.012em"
  body:
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    fontFeature: '"palt" 1'
  meta:
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tabular-nums"
  label:
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.08em"
rounded:
  xs: "0.1875rem"
  sm: "0.225rem"
  md: "0.375rem"
  pill: "999px"
spacing:
  step: "0.25rem"
  gutter: "1.5rem"
  stack: "1.75rem"
  rail: "8.5rem"
  measure: "34rem"
  doc: "54rem"
components:
  button:
    backgroundColor: "{colors.light-bg}"
    textColor: "{colors.light-text}"
    typography: "{typography.meta}"
    rounded: "{rounded.md}"
    padding: "0.45rem 0.85rem"
  button-hover:
    backgroundColor: "{colors.light-surface}"
    textColor: "{colors.light-text}"
  button-primary:
    backgroundColor: "{colors.light-accent}"
    textColor: "{colors.light-accent-contrast}"
    typography: "{typography.meta}"
    rounded: "{rounded.md}"
    padding: "0.45rem 0.85rem"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.light-muted}"
    rounded: "{rounded.md}"
    padding: "0.45rem 0.5rem"
  control-selected:
    backgroundColor: "{colors.light-surface}"
    textColor: "{colors.light-text}"
    rounded: "{rounded.md}"
    padding: "0.25rem 0.5rem"
  file-row:
    backgroundColor: "{colors.light-bg}"
    textColor: "{colors.light-text}"
    padding: "0.7rem 0.9rem"
  chat-bubble:
    backgroundColor: "{colors.light-surface}"
    textColor: "{colors.light-text}"
    rounded: "{rounded.md}"
    padding: "0.55rem 0.75rem"
  chat-bubble-user:
    backgroundColor: "{colors.light-accent}"
    textColor: "{colors.light-accent-contrast}"
    rounded: "{rounded.md}"
    padding: "0.55rem 0.75rem"
  modal-panel:
    backgroundColor: "{colors.light-bg}"
    textColor: "{colors.light-text}"
    rounded: "{rounded.md}"
    width: "min(100%, 32rem)"
    height: "max 88vh"
---

# Design System: resume.arda.tr

<!-- This system replaced "The Bound Notebook" on 2026-08-18. Nothing of that
     world — quad grid, spine, folios, entry numbering, dot-leader contents,
     correction red — survives. Do not reintroduce any of it. -->

## Overview

**Creative North Star: "The Category Standard, at Full Craft"**

There is no borrowed world here, no metaphor and no governing conceit. That is
the design decision, not the absence of one. A résumé is read in about forty
seconds by someone holding a dozen other candidates, on a laptop mid-screening
call or on a phone, and then printed or parsed by an ATS. An apparatus laid over
the facts costs attention in the only forty seconds this page gets. So the page
does the ordinary thing — name, statement, roles, skills, works, education,
contact, in that order — and spends everything it has on executing it better
than the category does.

This refuses two opposites at once. It refuses the **modern CV page**: sidebar
photo, skill bars, dotted timeline, tech-logo grid, gradient name. It equally
refuses the **design-object résumé** — the bound laboratory notebook this
replaced, whose spine, folios and entry numbering cost more attention than they
returned. The craft bar, named by the user, is **Linear/Vercel, Apple/MUJI,
read.cv**: convention executed at their level of finish, without irony and
without a smuggled quirk.

Expression therefore lives where the reader feels it without naming it — the
precision of the type ramp, the rail that makes the span scannable, tabular
figures down every date column, themed selection and caret and scrollbars, one
authored motion moment, and a print sheet that actually works. The surface's
job is to disappear.

**Key Characteristics:**

- One accent, spent only where it changes what a reader does
- Exactly two text weights: 400 and 700. Nothing else is requested or used
- An 8.5rem right-aligned rail carrying section names beside one 34rem column
- 1px hairlines and a 6px radius; flat in the document, shadow only above it
- One family — M PLUS 2 — carrying English, Japanese and Turkish
- Print is a real usage scene with its own sheet, not a downgrade

## Colors

A neutral surface with exactly one accent: deep teal (`#0D6E79` in the native
rendition, lifted per rendition where it must stay legible). Everything else is
a ground, an inset surface, a hairline, or one of two text values.

Every rendition is **exactly seven tokens** — `--bg`, `--surface`, `--border`,
`--text`, `--muted`, `--accent`, `--accent-contrast` — emitted per class by
`scripts/generate-theme.mjs`. There is no eighth, and a test asserts all four
screen renditions define all seven. A rendition that omits one inherits it from
the light default, which is how a dark mode ends up with a single white hairline
nobody can account for. **Print is a fifth rendition expressed in the same seven
tokens** (see The Print Rendition Rule) — which is why no hex literal appears
anywhere in `client/src/index.css` except in that one block.

### Primary

- **Deep Teal** (`light-accent`): the one accent. Primary action, links, the
  focus ring, the selected control, and the current-role period.
- **Lifted Teal** (`dark-accent`, `dark-hc-accent`): the same accent, raised for
  the dark grounds. `#0D6E79` on near-black is 1.9:1 — unreadable. The accent is
  per-rendition for exactly one reason: the value has a job, and the seed value
  fails it on those grounds.

### Neutral

- **Ground** (`*-bg`): the page. White in both light renditions. A résumé is
  read under office light, on a phone, and printed; white is the honest ground
  for all three, and the warm-paper ground a résumé design reaches for by reflex
  costs legibility and print fidelity for nothing.
- **Surface** (`*-surface`): the inset fill — hover states, the selected
  control, chat bubbles, the chat panel header.
- **Hairline** (`*-border`): every rule, divider and control edge, always 1px.
- **Text** (`*-text`) and **Muted** (`*-muted`): the two text values. There is no
  third. Metadata, periods, org names, labels and the colophon are Muted;
  everything a reader is meant to actually read is Text.

### The renditions

Four on screen — ids `light`, `light-hc`, `dark`, `dark-hc`; display names Light,
Light HC, Dark, Dark HC — and a fifth on paper. Measured against each rendition's
own ground:

| Rendition | text | muted | accent | hairline |
| --- | --- | --- | --- | --- |
| Light | 18.0:1 | 5.5:1 | 6.0:1 | 1.26:1 |
| Light HC | 21:1 | 10.5:1 | 9.1:1 | 3.2:1 |
| Dark | 16.5:1 | 7.5:1 | 9.1:1 | 1.36:1 |
| Dark HC | 21:1 | 13.5:1 | 14.1:1 | 3.5:1 |
| Print | 21:1 | 9.7:1 | 21:1 | 1.6:1 |

The two HC renditions target **WCAG AAA** — that is what they are for, and it is
the only reason to lift the hairlines to 3.2:1 and 3.5:1, where the structure
survives for a reader who needs the contrast.

**`.dark-hc` must be emitted after `.dark`.** `dark` is both a rendition id and
the class Tailwind's `dark:` variant keys off, so `<html>` carries *both* classes
for the high-contrast dark rendition. At equal specificity the later rule wins;
emit them in the wrong order and high contrast silently renders as ordinary dark
and the AAA guarantee is quietly untrue. The emission order is pinned in the
generator and asserted by `tests/static-output.test.mjs`.

### Named Rules

**The One Accent Rule.** There is exactly one accent and it is spent only on:
the primary action, links, the current-role period, the focus ring, and the
selected control. Everywhere else the page is neutral. A second colour is a
system violation — see `.chat-bubble--err`, which needs to say "this failed" and
still refuses a red: the accent is dropped, the bubble takes a hairline, and the
failure is carried by the text. If an error can live without a red, nothing else
gets one.

**The Accent Marks Facts Once.** The accent is an affordance colour — it means
"you can act on this" — with a single deliberate exception: the period of the
current engagement (`.entry--current .entry__period`). That is the one fact a
recruiter looks for first, so it is the one place the accent marks a fact rather
than an affordance. Do not extend the exception.

**The Two Text Values Rule.** Text and Muted are the entire text palette. Never
tint a token to make a third grey. The tokens are deliberately **not**
channel-split for Tailwind's `<alpha-value>` slot, so `text-text/60` cannot even
be written — reach for `text-muted` instead. A tint is how a clean palette turns
into six undocumented greys.

**The Fill Is Not The State.** `--surface` on `--bg` measures ~1.06:1 in Light
and ~1.14:1 at its strongest — as a fill it does not exist. Any selected or
pressed state must additionally carry a real hairline and a weight change
(`.controls__group .btn[aria-pressed="true"]` uses `inset 0 0 0 1px var(--border)`
plus weight 700), so the state survives the low-contrast renditions and a
greyscale print.

**The Print Rendition Rule.** Print is not a set of exceptions to the screen
design — it is a **fifth rendition, redefined in the same seven tokens** inside
`@media print`. Never override a colour on paper by restyling a class with a hex
literal; change the token and let the whole document follow. Three things this
buys, all of them real:

- A reader who printed from the Dark rendition gets a black-on-white sheet
  rather than dark chrome carried onto paper.
- Every colour that reaches paper is inside the documented system. There is no
  second, undocumented print palette to keep in sync.
- `--accent` resolves to black on paper, so the current-role emphasis survives
  as **weight** on a monochrome sheet — the accent stops being a colour and the
  700 does the work. This is why The Fill Is Not The State matters: any state
  carried by hue alone would vanish here.

**The trap, which cost a real defect:** the print block's selectors are
`html`-qualified (`html:root, html.light, html.light-hc, html.dark, html.dark-hc`).
`client/src/Main.res` imports `theme.css` **after** `index.css`, so at equal
specificity the generated palette wins and a plain `.light` override silently
does nothing — the first version of this printed a teal accent onto a
black-and-white page. **Anything in `index.css` that overrides a generated token
must out-specify it.**

## Typography

**Root size is `118.75%` (19px).** Every size, gap and max-width in the
stylesheet is `rem`, so the base is the single dial that scales the whole
system — the ramp, the rhythm and the `34rem` measure move together and the line
length stays at ~68 characters. Media queries deliberately resolve `rem` against
the 16px initial value, which is why the layout breakpoint is a raw number and
does not move when the base does.

**Single Font:** M PLUS 2 (400, 700), with `"Hiragino Kaku Gothic ProN"`,
Meiryo, `system-ui`, `sans-serif` behind it.

**Character:** One neutral, modern Japanese sans carrying all three languages at
one optical weight. Nothing about it is expressive; that is the point. `palt` is
on at the body level so Japanese proportional metrics apply.

**The face was chosen by what the browser actually paints, and any change must
be verified the same way.** Use `CSS.getPlatformFontsForNode` on rendered text,
**never** a declared `@font-face unicode-range`. A declared range is a subset
declaration, not a coverage guarantee: **Zen Kaku Gothic New and Noto Sans JP
both declare `U+0100–02BA` and ship no `Ş ş Ğ ğ İ`**, so Turkish silently falls
back to a serif mid-word. M PLUS 2 paints all twenty test glyphs itself. This
cost a real defect once; it must not be re-learned.

**The family is declared once, indirectly.** `client/src/index.css` sets
`font-family: theme("fontFamily.sans")` on `body`, which Tailwind resolves at
build time from the `sans` stack in `config/tailwind.config.cjs` — so the stack
has one home and the utility (`font-sans`) and the base rule cannot drift apart.
A reader or a static analyser looking only at the CSS will see no literal family
name and may conclude none is declared; it is declared, one file over. Do not
"fix" it by hard-coding the stack a second time.

### Hierarchy

Six distinct sizes carry seven roles — Entry Title and Body share `1rem`, and
differ by weight and colour rather than by scale. There is no seventh size:
`0.875rem` was removed as an off-ramp step, and the five call sites that used it
(`.entry__org`, `.file__name`, `.chat-bubble`, `.chat-input`, and the markdown
block) now take `0.8125rem`, which the ramp already had.

- **Name** (700, `clamp(1.75rem, 1.2rem + 2.4vw, 2.5rem)`, 1.1, `-0.026em`): the
  masthead `h1`, and the largest type on the site. It does not grow past 2.5rem
  at any viewport.
- **Subtitle** (400, `clamp(1rem, 0.94rem + 0.3vw, 1.125rem)`, 1.4, Muted): the
  position of record, directly under the name.
- **Section Label** (700, `0.75rem`, uppercase, Muted): the six section names in
  the rail. The one heading level a reader scans rather than reads.
- **Entry Title** (700, `1rem`, 1.45, `-0.012em`): a role title, a project name,
  a degree, a dialog title.
- **Body** (400, `1rem`, 1.65, max 34rem): abstracts, responsibilities,
  competencies, descriptions.
- **Meta** (400, `0.8125rem`, 1.5, Muted, tabular): periods, facts row, file
  metadata, link rows.
- **Label** (700, `0.6875rem`, uppercase, Muted): field names — Stack, the
  publications heading, dialog definition terms.

### Named Rules

**The Two Weights Rule.** 400 and 700. The webfont request itself is
`wght@400;700`, so a 500 or a 600 does not exist to be used — it would resolve to
a synthesised or substituted weight. Hierarchy comes from size, colour and
position, never from a third weight.

**The Latin-Only Tracking Rule.** Tracked capitals are a Latin convention.
`0.08em` on the section labels and field labels is applied under `:lang(en)` and
`:lang(tr)` only; applied to 自己紹介 or 職務経歴 it just loosens a word that is
already correctly spaced. Any new tracked or uppercased style must be scoped the
same way.

**The Ledger Figures Rule.** Every figure column is `tabular-nums` — periods,
years, counts, the build stamp, the commit. Applied globally to `<time>` and to
`.tabular`, and carried by `.t-meta`, `.entry__period`, `.file__meta`,
`.masthead__facts` and `.papers .yr`. A career is read by scanning dates down a
column; they align or the reader does the aligning.

**The No Poster Rule.** No type exceeds `2.5rem`. A dossier that shouts its own
name has already lost the reader it wanted.

## Layout

The document is a single centred column, `54rem` wide (`.doc`), with a `1.5rem`
gutter and `clamp(2.5rem, 1.5rem + 4vw, 5rem)` of block padding. One route, one
page, in the order a hiring decision actually reads it: masthead, statement,
record of service, competencies, works, education, contact, colophon.

**The rail carries navigation.** The page body (`.body`) is a two-part grid: an
`8.5rem` rail holding the section nav, and the document in `minmax(0, 1fr)`
beside it. The rail used to repeat each section's name; it now carries the only
thing a long page really needs from a margin, which is a way to move around it.
The masthead sits above the split so the name, the facts and the four artifacts
get the full width.

Below **56rem** the grid collapses to one column and the nav becomes a sticky,
horizontally scrollable bar at the top — an 8.5rem margin on a phone is a wasted
third of the screen. The breakpoint is 56rem rather than 46rem because at a 19px
base the content column needs the extra room. Note both grids use
`minmax(0, 1fr)` and the nav carries `min-width: 0`: a grid track defaults to
`min-width: auto`, and the nav's full row of section names will otherwise force
the whole page wider than a phone screen.

**Sections are disclosures.** Each section (`Section.res`) is a native
`<details>`, and on arrival every one is shut except the statement. The summary
row carries the section name, a hint, and an authored chevron that rotates on
open; the name takes the flex slack so hint and chevron land on the right edge
whether or not a section has a hint. The hint (`9 entries · 2011–2026`) is
load-bearing rather than decorative: it is the only evidence a reader has of
what a shut section holds, and a bare row of headings reads as an empty record.

**The outline has one home.** `Outline.res` owns the id, label, hint and arrival
state of all six sections; the nav and the sections are two renderings of that
one list. Two hand-maintained copies is how a nav ends up pointing at a section
that was renamed or removed.

**The measure is `34rem`** (`.measure`, ~68 characters), applied to every block
of running prose: abstracts, responsibility lists, competencies, project
descriptions, the paper citations, the download note. The 54rem document is the
container; the 34rem measure is what prose is actually allowed to occupy.

**Rhythm.** The vertical unit is `--step: 0.25rem` and every gap is a multiple of
it. The recurring interval is `1.75rem`: `.stack > * + *`, and the
margin/padding pair on `.entry + .entry`. Sections carry
`clamp(2rem, 1.4rem + 2vw, 3.25rem)` of block padding and are separated by a
single 1px `border-top` — a rule is drawn once, by the section that starts, never
doubled by the one that ends.

**Nothing is behind an interaction, in the markup.** All 45 responsibilities,
11 competencies and 10 projects are rendered inline in the prerendered HTML —
including the ones inside a collapsed section. Sections are native `<details>`
and arrive shut except the statement, so the disclosure is a *visual* deferral
only: an ATS and a crawler read the whole record, browser find-in-page opens a
closed section to reveal a match, the page works with JavaScript off, and the
print sheet forces every section open. A JS-driven toggle that removed content
from the DOM would break all four of those and is the thing this rule forbids.

**Print is a real usage scene and gets its own sheet.** `@page` margin 14mm,
10.5pt body, controls and chat and actions dropped, and the whole page repainted
by the print rendition's seven tokens. Three rules earn their place there:

- **The palette is swapped at the token level, not per class.** See The Print
  Rendition Rule in Colors, including the `html`-qualification the override needs
  in order to win against the generated palette.
- **`.row` becomes `display: block` in print.** The rail is a two-column grid and
  Chrome cannot fragment a grid row across printed pages, so on paper every
  section became atomic and started its own sheet, printing page one nearly
  empty. The rail earns nothing on paper anyway — there is no scanning back and
  forth — so print gets a plain linear block flow, which fragments correctly.
- **Entries may break; headings may not be stranded.** `.entry` is
  `break-inside: auto` because an engagement with six bullets is routinely taller
  than the half page left to it, and forbidding the break just moves it whole and
  wastes the remainder. What may not happen is a title, employer or section name
  left at the foot of a page above content that moved on: `.entry__head`,
  `.entry__org`, `.t-h2`, `.t-h3` and `.t-label` all carry `break-after: avoid`,
  and paragraphs and list items carry `orphans: 3; widows: 3`. The result is
  verified at **10 pages with page one fully used** — the check that this is
  still true is "does page one carry content", not "does it look right".

### Named Rules

**The Rail Rule.** Section names live in the rail; the content column stays one
uninterrupted measure. Do not put a heading inside the content column to
introduce a section — that is what the rail is.

**The Browser Surfaces Are Ours Rule.** Selection, caret, both scrollbar engines
(`scrollbar-color` and the `::-webkit-scrollbar` set), the focus ring
(`2px solid var(--accent)`, `2px` offset, radius `var(--radius-sm)`) and
link underline offset (`0.2em`, 1px, at 40% accent until hover) are all themed on
purpose. Left alone they ship defaults that belong to no system and quietly
announce that the page was assembled.

## Elevation & Depth

**The document itself is flat.** No section, entry, table, list or control in the
document flow carries a shadow. Depth inside the page is the hairline and the
tone step of `--surface`, nothing else.

Shadow is reserved for the two things that genuinely leave the page: the dialog
and the chat. This is the whole vocabulary.

### Shadow Vocabulary

- **Floating panel** (`box-shadow: 0 16px 48px -12px color-mix(in srgb, var(--text) 30%, transparent)`):
  the modal panel and the chat panel. Tinted from `--text`, so it is a shadow in
  the rendition's own terms rather than a black smear on a dark ground.
- **Floating control** (`box-shadow: 0 6px 20px -6px color-mix(in srgb, var(--text) 28%, transparent)`):
  the chat launcher, which sits over arbitrary page content and needs an edge.
- **Inset hairline** (`box-shadow: inset 0 0 0 1px var(--border)`): not depth. It
  is a border drawn on the selected control where a real border would shift
  layout. See The Fill Is Not The State.

The modal scrim is a flat
`color-mix(in srgb, var(--text) 45%, transparent)` with `backdrop-filter: blur(2px)`
— a dimmed background, not a lift.

### Named Rules

**The Flat Document Rule.** If an element is in the document flow, it has no
shadow. Shadow means "this is above the page", and only the dialog, the chat
panel and the chat launcher are. A card, an entry or a section that lifts is
wrong.

## Shapes

**One authored radius and two named derivations.** `config/theme.json` holds the
single authored value (`0.375rem` / 6px); `scripts/generate-theme.mjs` emits all
three steps into every rendition, and a test asserts one `--radius` value across
them all.

| Token | Value | Where |
| --- | --- | --- |
| `--radius` | 0.375rem | buttons, control groups, the file list, panels, bubbles |
| `--radius-sm` | 0.225rem (×0.6) | focus ring, dialog close, chat input, code blocks |
| `--radius-xs` | 0.1875rem (×0.5) | inline code |
| — | 999px | the two genuinely pill-shaped things: chat launcher, scrollbar thumb |

**The Derived Steps Are Tokens Rule.** The small steps are **tokens with one
home**, not `calc(var(--radius) * 0.6)` written out at each call site. Inline
arithmetic scattered across a stylesheet is a scale nobody can read and nobody
can change in one place; as tokens the whole ramp is visible in the generated
file and in `config/tailwind.config.cjs`, which maps them onto `rounded-sm` and
`rounded-xs`. Adding a step is the same **two-file change** as any other token:
the generator plus the Tailwind config.

**Borders are always 1px `--border` hairlines.** Emphasis is never a heavier
stroke. Where a rule needs to be more present, the fix is contrast (the HC
renditions lift the hairline to 3.2:1 and 3.5:1), not weight.

The one recurring form device beyond the hairline: `.files` is a 1px grid gap
over a `--border` background, so a stack of file rows reads as one bordered
object divided by hairlines rather than as four separate boxes. The list marker
is a 4px × 1px hairline dash in `--muted`, not a disc or a glyph.

## Components

The document's structure lives in named CSS classes in `client/src/index.css`;
Tailwind supplies the reset, the token-mapped colour utilities and the scale.
`client/src/index.css` is the whole stylesheet — there is no second one.

### Buttons

- **Shape:** 6px radius (`--radius`), 1px hairline, `0.45rem 0.85rem` padding,
  `0.8125rem` at weight 400, `white-space: nowrap`.
- **Default (`.btn`):** ground fill, Text label, hairline border. Used for
  secondary artifacts, social links, chat suggestions.
- **Primary (`.btn--primary`):** accent fill, `--accent-contrast` label. There is
  **one** primary action per view: Download PDF in the masthead, the chat launch
  in Contact, Send in the chat form.
- **Hover:** default goes to `--surface` with a `--muted` border; primary darkens
  by `color-mix(in srgb, var(--accent) 86%, var(--text))`. All transitions are
  140ms `ease-out` on colour only — nothing moves.
- **Quiet (`.btn--quiet`):** transparent, Muted label, tighter inline padding.
- **Pressed (`[aria-pressed="true"]`):** `--surface` fill, hairline, accent label.

### Controls (language and rendition)

The two things a reader can honestly change, both stated as pressed/unpressed
groups (`.controls__group`) rather than as cycling buttons, so a reader can see
what is available and what is selected without clicking to find out. The group is
a 1px-bordered container with `0.15rem` padding; its buttons drop their own
borders and run at `0.75rem`. Selected = `--surface` + inset hairline + Text +
weight 700. Excluded from print — a printed page has already chosen both.

### Navigation

`.nav` — the six section names, `Nav.res`, rendered from `Outline.res`. Sticky
in the rail at `top: 3rem` on desktop; below 56rem a sticky top bar with a
horizontally scrollable list and a `backdrop-filter` blur over the page.

Links are plain anchors, so navigation works with JavaScript off. Two behaviours
layer on top and both degrade to nothing: following a link opens the `<details>`
it points at (without this, a link to a collapsed section scrolls you to a shut
row and reads as broken), and the section currently under the reading line is
marked with `aria-current="true"`, which is the one place besides the current
role where the accent marks a state rather than an affordance. The marker is
computed from the last section whose top has passed the line rather than from an
IntersectionObserver ratio, because a shut section is only a few pixels tall.

Excluded from print: paper has no navigation.

### Entries

The repeating unit of the record (`.entry`). A baseline-aligned head row with the
title left and the period right (`space-between`, wrapping), the organisation
line beneath it in Muted with its mark inline, an optional abstract at measure,
then a hairline-dashed list. Consecutive entries are separated by 1.75rem +
hairline + 1.75rem. `.entry--current` turns the period accent + 700.

### Employer & Institution Marks

`Mark.res` renders 11 real employer and institution logos at `1.4rem`, inline
before the organisation name, `aria-hidden` (the name is already beside it as
real text). They are `filter: grayscale(1) contrast(1.15)` at full opacity, and
`grayscale(1) invert(1) contrast(1.1)` at 0.92 on the dark renditions.

Monochrome because eleven brand palettes entering a one-accent system would cost
the page more than the recognition is worth. **Monochrome is not licence to make
them faint** — at 1.05rem and 0.7 opacity they resolved to grey discs, which is
the worst outcome: the palette cost of an image with none of the recognition it
exists to buy. They are a PRODUCT.md brand commitment and must not be dropped for
tidiness.

### File List

`.files` / `.file`: a hairline-divided stack of the four artifacts, each a plain
`<a download>` — filename at 700 `0.8125rem`, format and generating script in
Muted `0.75rem` tabular. Plain links, not click handlers: they work without
JavaScript, they can be copied into an ATS, and they are crawlable.

### Dialog

`.modal-scrim` + `.modal-panel`: bottom sheet on small screens (top corners
rounded, full width), centred card at `≥640px` (`max-width: 32rem`, all corners
rounded, `max-height: 88vh`). Entrance is `sheet-in` 320ms
`cubic-bezier(0.16, 1, 0.3, 1)`. The close button is a 1.85rem transparent
square in the top-right corner.

Its accessibility behaviour is load-bearing and predates this design: focus trap,
`inert` + `aria-hidden` on the app root, body scroll lock, Escape, scrim click,
and focus restore to the opener. Only the paper it is printed on is new.

### Chat

`.chat-launcher` (fixed bottom-right pill, floating-control shadow) opens
`.chat-panel` (`min(23rem, 100vw - 2rem)` × `min(30rem, 100vh - 2rem)`,
`sheet-in` 260ms). Bubbles are 6px radius: model on `--surface`, user on the
accent with `--accent-contrast`. The error bubble is transparent with a hairline
and Muted text — see The One Accent Rule. Non-modal by design (it is a floating
enquiry slip), so it restores focus to the launcher on close rather than trapping
it.

### Colophon

A hairline-topped `0.75rem` Muted block carrying the build provenance: build
time, the commit as a link to the commit, a link that opens the build dialog, the
repository, and back-to-top. The dialog opener is styled as a **link, not a
button** (`.colophon__action`), because the colophon is one row of peers and a
padded control there breaks the line it belongs to.

### Motion

**One authored moment.** The masthead resolves once, on load, in reading order:
`@keyframes settle` runs `opacity 0 → 1`, `translateY(0.4rem) → 0` and
`blur(5px) → 0` over 620ms `cubic-bezier(0.16, 1, 0.3, 1)`, staggered
60/120/180ms across the name, subtitle, facts row and actions. Blur is the
material here rather than another opacity fade, which is the entrance every page
ships. `both` holds the `from` keyframe through the delay, so the stagger is
capped at 180ms.

There are **no scroll reveals** and no `IntersectionObserver`. Everything else
that moves is a 140ms `ease-out` colour transition on a state change.

Under `prefers-reduced-motion: reduce` the animation is **removed entirely**
rather than shortened — `.settle`, `.modal-panel` and `.chat-panel` get
`animation: none`, all transitions collapse to `0.01ms`, and smooth scrolling is
turned off. A reader who never animates gets the composed page, never a blank
one.

## Do's and Don'ts

### Do:

- **Do** keep the four screen renditions — Light, Light HC, Dark, Dark HC (ids
  `light`, `light-hc`, `dark`, `dark-hc`) — with the two HC renditions targeting
  WCAG AAA, and keep `.dark-hc` emitted after `.dark`.
- **Do** express print as the fifth rendition: redefine the seven tokens inside
  `@media print`, keep the selectors `html`-qualified so they out-specify the
  generated palette, and let the document follow.
- **Do** verify any change to the body face by what the browser actually paints
  (`CSS.getPlatformFontsForNode`), never by a declared `unicode-range`.
- **Do** keep every figure column `tabular-nums`.
- **Do** keep the struck-correction device honest. `?flavor=` replaces the
  position of record; the original is struck (`.struck`) and kept beside it, and
  the amendment is disclosed in the build dialog. That is the **only** thing this
  document ever strikes.
- **Do** keep the machine countersign: commit SHA, build time, and each of the
  four artifacts attributed to the script that generated it. There is no second
  party in this content, so the witness is the build — and all of it is checkable
  against a public repository.
- **Do** keep the chat widget as the contact route; the email is not on the page.
- **Do** keep the 11 employer and institution marks, monochrome and inverted on
  dark. They are a brand commitment.
- **Do** keep the blocking rendition + language bootstrap in `client/index.html`.
  It applies the stored rendition and sets `<html lang>` before first paint, which
  is what stops the dark-rendition flash and the screen-reader mismatch. Both were
  live defects.
- **Do** keep the print sheet working: `.row` as a block, entries breakable,
  headings `break-after: avoid`, orphans/widows 3. Re-render it after any layout
  change and confirm page one is fully used.

### Don't:

- **Don't** introduce a second colour. Not for errors, not for warnings, not for
  a "secondary" accent. The error bubble is the precedent.
- **Don't** use a third text weight. 400 and 700 only; the webfont ships nothing
  else.
- **Don't** use a token's opacity modifier (`text-text/60`, `bg-accent/10`). The
  tokens are raw hex and deliberately not channel-split.
- **Don't** hand-edit `client/src/theme.css` — it is generated by
  `scripts/generate-theme.mjs`. A new token is a **two-file change**: the
  generator plus `config/tailwind.config.cjs`.
- **Don't** write a colour literal into `client/src/index.css`. The print
  rendition's seven tokens are the only hex values in that file, and they are
  there because they *are* a rendition.
- **Don't** override a generated token from `index.css` without out-specifying
  it. `theme.css` is imported after `index.css`, so an equal-specificity
  override silently does nothing.
- **Don't** write `calc(var(--radius) * n)` at a call site. If a new step is
  needed, add it to the generator as `--radius-*` and map it in the Tailwind
  config.
- **Don't** add a seventh type size. The ramp is six; `0.875rem` was removed for
  being off it.
- **Don't** give anything in the document flow a shadow.
- **Don't** exceed `2.5rem` type anywhere.
- **Don't** propose a metaphor, artifact genre or governing conceit for this
  surface. It has been rejected twice in the user's own words; it is a standing
  preference, recorded in PRODUCT.md, not a task-local refusal.
- **Don't** reintroduce any modern-CV device: sidebar photo, skill bars, dotted
  timeline, tech-logo grid, gradient name.
- **Don't** take any part of the record out of the prerendered markup. A
  section may collapse — that is a native `<details>`, and the content is still
  in the HTML for an ATS, a crawler, find-in-page, a JS-off reader and the
  printer. A JS toggle that mounts content on demand is a different thing and is
  forbidden.
- **Don't** let a section collapse in print. `@media print` overrides both
  `::details-content` and the legacy `display:none` path, and `Main.res` forces
  every section open on `beforeprint`. Two mechanisms because engines disagree;
  the first attempt shipped a one-page résumé.
- **Don't** let `"Backend Systems Architect"` or `"Get In Touch"` fall out of the
  prerendered HTML — both are asserted by `tests/static-output.test.mjs`.
- **Don't** surface `header.contactViaEmail` in rendered HTML, and don't let
  `abstract` into any export. Both are repo rules with test assertions.
- **Don't** break a content JSON field path read by the four generators. The
  schema is the contract with `generate-resume.mjs`, `generate-docx.mjs`,
  `generate-json-resume.mjs`, `generate-vcard.mjs` and `ai.arda.tr`.
- **Don't** regress the dialog's accessibility behaviour: focus trap, `inert`,
  Escape, focus restore.

## Cross-repo theme contract

The renditions are named for what they are, because naming a light mode anything
other than "Light" would be exactly the invented vocabulary this system refuses.
The canonical arda.tr catalogue names the same four *roles* after its own world.
`scripts/check-theme-contract.mjs` holds the mapping and currently passes:

| This repo | Canonical |
| --- | --- |
| Light | Stock |
| Light HC | Stock HC |
| Dark | Microfiche |
| Dark HC | Microfiche HC |

The roles line up one-for-one; the words are owned by each site's design system.
The check reads the `name` fields from `ThemeToggle.res` and the palette ids from
`generate-theme.mjs`, so keep the shape of both lists.
