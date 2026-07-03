# Resume site revamp — positioning, structure & proof

**Date:** 2026-07-03
**Status:** Approved design, pending implementation plan
**Scope:** `resume.arda.tr` only (static site). No backend work.

## Goal

Sharpen the site from a generically-senior résumé into a **highly classifiable**
one: *AI Platform + Backend Systems Architect* — with Go/Ruby/Python, OAuth 2.1 /
OIDC, and MCP as the proof. The experience bullets are already strong; the leak is
the top-of-page (hero + About) and a couple of self-sabotaging lines. Fix the funnel
top and surface the proof that already exists in the codebase.

## Positioning decision (locked)

- **Spine:** AI Platform + Backend. AI-platform is the hook; backend/cloud/auth are proof.
- **Ambition:** copy + light structure & proof. No visual redesign, no résumé variants.
- **Contact:** LinkedIn only. No email exposed. No contact form (explicitly dropped).

## In scope

Copy (all three languages: `content/{en,ja,tr}`) + small component tweaks in
`client/src/components`. Everything ships static; the build already propagates content
changes into the PDF/DOCX/JSON/vCard exports.

## Out of scope / deferred

- Message/contact form + any backend (Firebase function or `ai.arda.tr` bot tool). Dropped.
- Role-targeted résumé variants — **now planned as sub-project 2** (see below), as an overlay
  engine on shared base content rather than forked copies. Not part of SP1.
- Visual/theme redesign.
- The wider job-search campaign in the source feedback (recruiters, channels, interview prep) — not a site concern.

## Findings that shrank the work

- **"Duplicated skill cloud" is not a bug.** `TechMarquee.res` renders its list twice
  (`row(0)` + `row(1)`) for a seamless CSS scroll loop, and the band is already
  `ariaHidden`. A crawler reading "Go Ruby Python…" twice is seeing the marquee. **No action.**
- **LinkedIn is already wired.** `content/en/contact.json` already carries the correct
  LinkedIn URL (`linkedin.com/in/ardakaraduman/`) and GitHub, rendered as icon buttons in
  `ContactSection`. Gap: not above the fold.
- **A quick-facts band already exists.** `Header.res` renders a `statChip` row
  (`Go · Ruby · Python` / `AWS · GCP · Docker` / `EN · JA · TR`). We extend it, not rebuild.
- **Proof already exists.** `projects.json` has a "This Résumé Site" card linking the repo.
  The colophon just makes it prominent.
- **Email is not currently exposed** (the Contact CTA is the chat button, not email). Keep it that way.

## Changes — copy

### 1. Hero subtitle — `content/*/header.json` → `subtitle`

- From: `Systems Architect | AI Enthusiast`
- To (EN): **`AI Platform & Backend Systems Architect`**
- JA/TR: drafted in implementation, Arda verifies register.

### 2. About — `content/*/about.json` → `paragraph1`, `paragraph2`

`AboutSection` already renders `paragraph2` when non-empty, so filling it "just works."

- **paragraph1 (EN):** I build backend and platform systems where production software,
  cloud infrastructure, and AI agents meet. Most recently I lead Veltra's AI platform — a
  standards-compliant OAuth 2.1 authorization server and Model Context Protocol services
  that expose a live travel-activity catalog to assistants like Claude and ChatGPT.
- **paragraph2 (EN):** Before that, Go/Ruby/Python systems across logistics, fintech,
  medical IT, and games — shipped and operated in Tokyo since 2004. I work as a bridge
  between overseas and Japan teams, in English and Japanese.
- `languages` / `languagesContent`: unchanged.

### 3. Skills — `content/*/skills.json` → `technicalSkills`

`SkillsSection` maps the array in order, so array order = display order.

- **Reframe the last line** (the "vibe coding" line) to:
  > AI-accelerated development with strong regression discipline — using LLMs to ship
  > quickly while preserving tests, reviewability, and production safety.
- **Add a new line** (the biggest differentiator, currently absent from the list):
  > Security-aware platform work: OAuth 2.1 / OIDC (PKCE, JWKS, token rotation, PAR, DCR),
  > SSO, and RBAC.
- **Reorder** to lead with the brand: Go/Ruby/Python → AI/LLM (Gemini, Anthropic, MCP, TTS)
  → the new OAuth/security line → cloud (AWS/GCP) → backend APIs → Docker/CI-CD → frontend
  → browser automation → unix/Emacs → TDD/BDD/Agile → the reframed AI-accelerated line last.

## Changes — structure & proof

### 4. Section reorder — sink Education, lift Skills

Education currently sits 3rd (too high for a 15-year IC). New order:

`About(01) → Experience(02) → Skills(03) → Projects(04) → Education(05) → Contact(06)`

Touch points (all mechanical):
- `client/src/pages/Home.res`: move `<EducationSection />` below `<ProjectsSection />`.
- `client/src/components/Navigation.res`: reorder the `sections` array to match.
- `SectionHeading index` props: Skills `04→03`, Projects `05→04`, Education `03→05`
  (About/Experience/Contact unchanged). Files: `SkillsSection.res`, `ProjectsSection.res`,
  `EducationSection.res`.
- `navigation.json`: labels/order there are unchanged (order is driven by `Navigation.res`).

### 5. Hero: LinkedIn above the fold + extended fact chips — `Header.res`

- Add LinkedIn (and GitHub) to the hero link row (the `ad-4` row with chat + website), sourced
  from `contact.socialLinks`, using the existing `LucideReact.Linkedin` / `Github` icons.
- Extend the `statChip` row with two brand/tenure facts:
  - `OAuth 2.1 · MCP` (surfaces the positioning) — Shield/KeyRound icon
  - `Tokyo since 2004` (tenure is a real differentiator) — CalendarDays/MapPin icon

### 6. Colophon — `Footer.res`

Add one muted line linking `github.com/c0ze/resume`:
> Built with ReScript + React, prerendered static · downloadable PDF/DOCX/JSON/vCard ·
> MCP-backed "Ask about Arda" chat · source ↗

This turns the site's own engineering into a visible credential (it *is* the AI-platform +
infra-discipline brand).

### 7. TechMarquee — surface auth (optional, minor) — `TechMarquee.res`

Add `OAuth 2.1` / `OIDC` to the `techs` ticker (currently absent despite being a headline skill).

## i18n plan

Draft JA and TR to mirror the EN copy above (subtitle, About paragraphs, the two skill edits).
- **JA:** business register; Arda verifies keigo/wording before ship.
- **TR:** Arda's native language; he verifies.
- Chip/colophon strings that are proper nouns/tech (`OAuth 2.1 · MCP`, `Tokyo since 2004`,
  the colophon) can stay largely language-neutral; localize the connective words only.

## Build & verify

Documented workflow, unchanged:
1. `npm run build` — regenerates theme CSS, compiles ReScript, prerenders, and regenerates
   PDF/DOCX/JSON/vCard from the edited content.
2. `npm run test:static` — smoke tests: homepage has real content, **email is NOT in the HTML**
   (guards the no-email rule), sitemap/artifacts present, exports carry basics but no web-only
   abstracts, chat Markdown is XSS-safe.
3. Manual: check hero (subtitle, LinkedIn link, chips), nav order, section numbering, and the
   footer colophon render correctly in EN/JA/TR.

## Acceptance

- No "AI Enthusiast" or "vibe coding" strings remain in any language.
- Hero subtitle reads `AI Platform & Backend Systems Architect` (localized).
- About leads with the positioning statement; `paragraph2` renders.
- Skills list leads with the brand and includes the OAuth/OIDC line.
- LinkedIn is reachable from the hero without scrolling; email still absent from the HTML.
- Section order is About → Experience → Skills → Projects → Education → Contact, numbered `01–06`.
- Footer colophon links the repo.
- `npm run build` and `npm run test:static` pass.

## Sub-project 2 (planned): flavored résumés — overlay engine

Decided in principle; **detailed spec + plan come after SP1's default copy is locked**, because
each flavor is a *diff against that copy* — designing the deltas before the base text is final
would be premature.

- **Model:** targeted artifacts to **send**, not a public switcher. The live site keeps one sharp
  AI-platform default; flavors are for outreach (attach a role-specific PDF / send a deep-link).
- **Flavors:** `ai-platform` (= the SP1 default, i.e. flavor #0), `backend` (Go/Cloud),
  `japan-bridge` (Technical Lead). Adjustable.
- **Overlay = thin patch on shared base.** A flavor overrides only `subtitle`, `about` positioning,
  skills ordering/emphasis, and the *featured ordering* of experience/projects. It does **not**
  rewrite per-job bullets — the base content (`content/{en,ja,tr}`) stays single-source, so a bullet
  edited once is inherited by every flavor. This is what defuses the maintenance/drift objection.
- **Delivery:** `?flavor=<name>` applies the overlay client-side (no param → default); the build
  fans out per-flavor exports, the same way it already fans out per language.
- **Artifact matrix (proposed, adjustable):** default flavor → PDF/DOCX/JSON in EN/JA/TR (as today);
  non-default flavors → EN, plus JA for `japan-bridge`, to bound build cost. Generated artifacts stay
  gitignored.
- **On brand:** the overlay + fan-out engine is itself proof of the data-pipeline discipline the
  positioning sells — the same argument as the colophon.
