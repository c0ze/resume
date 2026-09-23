---
name: resume.arda.tr
description: The résumé in One Bit Forest — paper, black toner, one moss signal, and a treeline. The most professional site in the arda.tr family.
---

# Design System: resume.arda.tr

## Overview

**System: "One Bit Forest"** — the shared design system of arda.tr,
blog.arda.tr, resume.arda.tr and ai.arda.tr (adopted 2026-09-23). The family
contract is `../DESIGN-SYSTEM.md`; the approved reference for this site is
section **03 · resume.arda.tr** of `../design-previews/sketch-1bit.html`. This
file is binding for this repo and must not contradict either.

The family meets at **1-bit dithering**: photocopied black-metal covers and
early Macs drawing everything in one bit, with one neon phosphor per site. On
the tone dial the résumé is **most professional**: calm, typographic, almost no
ornament. It is the surface `arda.tr` routes recruiters to, and restraint is
what it trades on.

What that means here:

- **Xerox by default** — photocopy paper, black toner, moss ink.
- **One moving thing**: a strip of pixel spruces under the status bar, drifting
  slowly. Nothing else animates on the page.
- **Two columns**: a mono-labelled meta rail and a main column that reads top
  to bottom like a document.
- **No other ornament.** No cards, no shadows, no gradients, no icons, no logos,
  no skill bars, no hover lift.

The PDF, DOCX, JSON Resume and vCard exports are separate objects with their
own fonts and layout; this system does not touch them.

## Colors

One bit plus one signal. Values live in `themePalettes` in
`scripts/generate-theme.mjs`, which writes `client/src/theme.css` (generated —
never hand-edit). Neutrals are the family's; the signal is the résumé's own.

| token | xerox (default) | xerox-hc | night | night-hc |
| --- | --- | --- | --- | --- |
| `--bg` ground | `#efede6` | `#ffffff` | `#060708` | `#000000` |
| `--surface` panels | `#f7f6f1` | `#ffffff` | `#0d0f10` | `#000000` |
| `--fg` ink | `#111210` | `#000000` | `#e4e0d4` | `#ffffff` |
| `--fg-2` muted | `#5d5b55` | `#2e2e2e` | `#9d998e` | `#d0cdc4` |
| `--rule` hairline | `#cfccc2` | `#1a1a1a` | `#22252a` | `#8a8a8a` |
| `--signal` moss | `#2d5a39` | `#1d4028` | `#8fd19e` | `#a8e6b6` |

Canvas palette, read by `onebit.js` every frame: `--ob-ink` = `--fg`,
`--ob-ground` = `--bg`, `--ob-signal` = `--signal`. Always hex. The chat panel
sets `--ob-ground: var(--surface)` so its orb and cursor sit on the panel.

Contrast on `--bg`: xerox fg 16.0, fg-2 5.8, signal 6.8; xerox-hc fg 21,
fg-2 13.6, signal 11.6; night fg 15.3, fg-2 7.1, signal 11.3; night-hc fg 21,
fg-2 13.2, signal 14.7. The HC renditions target WCAG AAA.

### Rules

- **Signal is for meaning, not decoration**: links, the current section in the
  bar, the site mark, the focus ring, the `ai ▸` label, the one solid button.
- **No tints.** The tokens are raw hex and deliberately not channel-split for
  Tailwind's alpha slot. Muted means `--fg-2`, not `--fg` at 60%. The only
  `color-mix` uses are a link's underline (signal at 45%) and the dialog scrim.
- Solid signal buttons set their label in `--bg`.

## Renditions

| id | role | name |
| --- | --- | --- |
| `xerox` | light | Xerox |
| `xerox-hc` | hc-light | Xerox HC |
| `night` | dark | Night |
| `night-hc` | hc-dark | Night HC |

- The class goes on `<html>`, plus `.dark` for the two dark ids, and
  `color-scheme` is set to match. The choice is stored in `localStorage`
  under `resume-theme`.
- A blocking bootstrap in `client/index.html` applies the stored rendition
  before first paint. It migrates legacy ids by role and writes the new id
  back:
  - `ruled`, `alucard`, `light` → `xerox`
  - `ruled-hc`, `paper`, `light-hc` → `xerox-hc`
  - `carbon-copy`, `van-helsing`, `dracula`, `dark` → `night`
  - `carbon-copy-hc`, `carbon`, `dark-hc` → `night-hc`
- `ThemeContext.res` repeats that mapping.
- The rendition switch in the bar is one button that cycles the four and shows
  the current id.
- `ThemeToggle.res` keeps its `{id: …, name: "…"}` list shape, because the
  contract check parses it.

## Typography

From Google Fonts (`client/index.html`):

- **Big Shoulders Display** 800/900, uppercase: the name, the chat title and the
  dialog title. Nothing else.
- **IBM Plex Sans** 400/500/600: body, the position, row titles.
- **IBM Plex Mono** 400/500: the status bar, rail labels, section labels,
  periods, indices, chips, downloads, chat labels, the colophon.
- **IBM Plex Sans JP**: Japanese, both on `/` in Japanese and in the companion
  statement. It is the fallback in the sans and mono stacks, so kana and kanji
  never drop to a system face.

| role | spec |
| --- | --- |
| name | Big Shoulders 900, `clamp(56px, 6.2vw, 88px)`, line-height .84, one word per line |
| position | Plex Sans 500 21px |
| summary | Plex Sans 16.5px / 1.65, max 64ch |
| section label | Plex Mono 500 11px, tracking .16em, uppercase, `--fg-2`, a 1px rule runs to the edge |
| row title | Plex Sans 600 17px; the employer after it at 400 in `--fg-2` |
| row body | 15.5px lead, 14.5px list, max 66ch |
| gutter / meta | Plex Mono 12.5px, tabular figures, `--fg-2` |
| rail label | Plex Mono 500 10.5px, tracking .14em, uppercase |

## Layout

```
┌ status bar (34px, sticky) ───────────────────────────────────────────────┐
│ ▮ resume.arda.tr  about experience …      EN · JA · TR  JST 18:19  xerox │
├ treeline (52px, drifting) ───────────────────────────────────────────────┤
│  rail (260px)        │  main                                             │
│  LOCATION            │  ARDA                                             │
│  LANGUAGES           │  KARADUMAN                                        │
│  LINKS               │  position · summary                               │
│  DOWNLOAD  [PDF][DOCX]  ABOUT ME ──────────────────────────────────────  │
│            [JSON][vCard] English   │ paragraph                           │
│  ASK                 │  日本語     │ companion statement                  │
│                      │  WORK EXPERIENCE ─────────────────────────────── │
│                      │  2024 – Present │ Role · Company · Place          │
└──────────────────────┴───────────────────────────────────────────────────┘
```

- **Grid**: `260px | 1fr`, gap 64px, max 1180px, padding 54px 40px 80px.
- **Rail**: sticks under the bar when the viewport is at least 700px tall.
  - Groups: location (plus years in Tokyo), spoken languages (one per line),
    links, and the four downloads as a 2×2 grid of plain `<a download>` links
    that honour the `?flavor=` prefix.
  - Then the issue date and the certificate of issue, and Ask, which opens the
    chat.
- **Main**: name, position, summary (About paragraph 1), then about,
  experience, skills, projects, education, contact and the colophon.
  - **Rows**: every entry is a `120px | 1fr` row closed by a hairline. The mono
    gutter carries the period (experience, education), the language (about) or
    a two-digit index (skills, projects).
  - Nothing is hidden behind a click: every abstract, responsibility, skill and
    paper is in the prerendered HTML.
- **About** carries paragraph 2, then the whole statement in the companion
  language (Japanese for an English reader, English otherwise), muted.
- **Status bar**: marks the section being read with `aria-current="location"`,
  taking over the old spine folio's running head.
  - Below 1080px the nav folds into a `§ section ▾` button that opens the list.
  - Below 600px the host name and the clock drop out, so the bar never scrolls
    sideways.
- **Breakpoints**:
  - ≤900px: one column: the intro (name, position, summary) first, then the
    rail as a 3-column block under a hairline, then the sections. The chat
    launcher folds to a 44px `?` square (its label stays the accessible
    name) and the page keeps 96px of bottom padding so the colophon scrolls
    clear of it.
  - ≤600px: single column; rows stack with the gutter as a line above the
    entry.
  - Tested at 390px with no horizontal overflow.

## Motion

All motion comes from `client/src/lib/onebit.js`:

- The engine pauses every animation off-screen and in hidden tabs.
- Under `prefers-reduced-motion` it draws one still frame.
- `OneBit.useRepaintOnTheme` redraws still canvases when the rendition changes.

What moves:

- **Treeline**: `treeline(canvas, {seed: 3, px: 2, speed: 4})`, the only motion
  on the page itself.
- **Chat orb**: `orb(canvas, {size: 40})` revolves while the panel is open and
  `sizzle()`s on each streamed chunk.
- **Chat cursor**: a `crackle()` block cursor trails the reply while it streams.
- **Hover**: colour transitions of 150ms; nothing lifts, scales or slides.

`onebit.js` is a verbatim copy of `../design-previews/onebit/onebit.js`. Do not
fork it: change the shared file first, then copy it to every site.

## Components

- **Status bar** (`StatusBar.res`, `TokyoClock.res`, `ThemeToggle.res`): the
  family's 34px mono strip.
  - The site mark is an 8×14 signal block plus the host name.
  - The language switch is `EN · JA · TR`; the active language is `--fg` with a
    signal underline.
  - The rendition button has a 1px border.
- **Treeline** (`Treeline.res`): decorative, `aria-hidden`.
- **Rail** (`Rail.res`): a `<dl>` of labelled groups.
  - Downloads are 1px `--fg` boxes that invert on hover.
- **Rows** (`Section.res`): `Section` (label + rule) and `Section.Row` (gutter +
  body).
  - Project stacks are the page's only chips: 1px `--rule` border, mono
    11.5px, `--fg-2`.
- **Contact** (`ContactSection.res`): "Get In Touch", one solid signal button
  that opens the chat, the public profiles.
  - No email anywhere in the HTML; a test asserts this.
- **Colophon** (`Footer.res`): copyright, how the page is built, source, commit,
  issue time, certificate.
- **Certificate of issue** (`Certificate.res`, `Artifacts.res`, `Modal.res`):
  the commit, the build time, the source, the `?flavor=` in effect, and each
  artifact against the script that generates it.
  - Behaviour: an accessible dialog with the root made `inert`, a focus trap,
    Escape and focus restore.
- **Chat** (`ChatWidget.res`, `Markdown.res`): styled like ai.arda.tr.
  - Layout: orb and "Ask about Arda" in the header, `ai ▸` / `you ▸` label
    columns, numbered mono quick prompts, and a terminal-line input with a `▸`
    prompt.
  - Behaviour is unchanged: SSE with the non-streaming fallback and timeouts,
    Escape, focus into the input on open, focus back to whatever opened it,
    safe element-only Markdown, and the `arda:open-chat` event.

## Geometry

- Radius 0 everywhere (`--radius: 0rem`, asserted by the static test).
- No drop shadows. No gradients, except the dialog scrim.
- 1px rules.
- Focus ring: 2px solid `--signal`, offset 2px. The chat input draws it on the
  whole terminal line.

## Print

- Black on white whatever the rendition: the print block overrides the tokens.
- The bar, treeline, chat, launcher, switches, downloads and dialogs are hidden.
- The rail prints as a compact header row.
- Rows do not break across pages.
- External links print their URL.

## Do's and Don'ts

**Do:**

- Keep copy in `content/{en,ja,tr}` and keep the three languages aligned.
- Use `--fg-2` for anything secondary and `--signal` only for meaning.
- Keep downloads as plain `<a download>` links. They must work without
  JavaScript, paste into an ATS and be crawlable.
- Add tokens in two places: `generate-theme.mjs` and
  `config/tailwind.config.cjs`.

**Don't:**

- Add a second moving thing, a pre-dithered image, an icon set or employer
  logos to the page.
- Hand-edit `client/src/theme.css`.
- Use opacity modifiers on tokens (`text-fg/60`).
- Fork `onebit.js`.
- Reintroduce the OAuth line (removed 2026-09-23) anywhere.
- Claim anything that isn't real. No invented taglines, metrics or blurbs.

## Cross-repo theme contract

arda.tr publishes `config/themes.json` **v3**: the four ids, their roles and
names, the required tokens and its own values.

`scripts/check-theme-contract.mjs` (run by
`.github/workflows/theme-contract.yml`, non-blocking) checks:

- the **id set**
- each id's **role**
- that every local rendition defines every **required token**

Values are never compared. A name mismatch only warns.

It soft-passes when:

- the contract cannot be fetched;
- the contract is older than v3, as it is while arda.tr main still publishes
  v2.

`THEMES_CONTRACT_PATH=../arda.tr/config/themes.json` checks against a local
checkout.
