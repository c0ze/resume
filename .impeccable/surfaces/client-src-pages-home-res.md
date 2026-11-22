---
version: 3
slug: "client-src-pages-home-res"
primary_target: "client/src/pages/Home.res"
related_targets: ["client/src/index.css","client/src/brand/brand.css","client/src/Astryx.res"]
---

## Scope & mode

`resume.arda.tr`: the single `/` route and its four generated artifacts.
Visitor mode: **Persuade**. The reader must decide and act in about forty
seconds, while holding a dozen other candidates.

## Audience, job, action

- **Who:** hiring managers, recruiters and technical interviewers, routed here
  explicitly from `arda.tr`. Many are Japanese-speaking, some Turkish, often on
  a phone.
- **Success:** they believe the claim and keep the PDF.

## Direction contract

**SYSTEM.** Kara Duman, the arda.tr family system (`../DESIGN-SYSTEM.md`,
adopted 2026-11-23), at its most restrained. It replaces The Index
(2026-11-22) and One Bit Forest (2026-09-23). `DESIGN.md` is the binding spec;
the design is `../output/rebrand-kara-duman/14-resume.png`.

**THESIS.** Soot on bone paper, signed once. The name is the only blackletter;
the emblem, top left, is the only artwork; everything else is Spectral between
two weights of rule. It refuses the modern CV arrangement: sidebar photo, skill
bars, dotted timeline, tech-logo grid, gradient name.

**OWN-WORLD.**
- **Colour:** bone `#E8E0CE`, soot `#0D0C0A`, secondary `#5C574C`, Ember Deep
  `#A33312` for links only. No ember in the page. Light only; prints in black.
- **Type:** Grenze Gotisch 800 for the name; Spectral for everything else
  (600 for the position, entry titles and labels; italic for the
  organisation); JetBrains Mono for periods; Zen Antique for Japanese. Nothing
  below 18px.
- **Geometry:** 2px corners on controls, no shadow, no box; a 1px rule under
  the head and above the colophon, hairlines between sections and entries.

**STORY.** A recruiter reads one screen. They see the name, the position, where
Arda is and the four files. They scroll a plain, complete record, and take the
PDF.

**FIRST VIEWPORT.**
- **Top line:** the emblem (to arda.tr); the family's arda.tr, blog, ask; the
  language switch, one segmented control, EN 日本語 TR.
- **Head:** the name, the position, the place, the downloads (PDF the one
  primary button), the build date and details, the section links.

**FORM.** One column 60rem wide. Every section is two columns: its label in
capitals at the left, its entries at the right.
- An entry: the title in Spectral 600, the period in mono at the far right,
  the organisation in italics, the details in small text.
- On a phone the label sits above its entries and the language switch is full
  width.

## Memorable moment

The name, cut in blackletter, alone on bone paper under the seal.

## Kept from the previous directions

- The build details (formerly "certificate of issue") as machine provenance:
  the commit SHA, the build timestamp, and each artifact attributed to its real
  generator script. No human witness is invented.
- The bilingual statement: About repeats the whole statement in the companion
  language.

## Hard constraints — do not break

- The position (`header.subtitle`) and the contact labels must survive into the
  prerendered HTML (`tests/static-output.test.mjs`).
- `header.contactViaEmail` must never appear in rendered HTML.
- `abstract` is web-only and must stay out of every export.
- Every content JSON field path read by the four generators must survive.
- `client/src/brand/` holds verbatim copies of arda.tr's `brand/`; never edit
  them here (`scripts/check-brand-contract.mjs`).
- `client/src/index.css` uses the theme's tokens only: no hex, no written-out type size.
- Blackletter is the name's alone; no artwork but the emblem, once.
- Light only: no scheme or rendition switch.
- The OAuth line is gone from the résumé (2026-09-23). Do not reintroduce it.
