# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Online resume/portfolio at resume.arda.tr - a multi-language professional resume website with PDF generation support for English, Japanese, and Turkish.

## Architecture

- **Framework**: Vite 5 + React 18 + TypeScript
- **Styling**: TailwindCSS + shadcn/ui components
- **Routing**: Wouter (lightweight router)
- **State**: TanStack React Query + React Context (language)
- **Theme Management**: CSS variables with 3 themes (dark, dracula, light)
- **PDF Generation**: pdfkit for resume downloads
- **Deployment**: GitHub Pages (static)

## Project Structure

```
.
├── client/
│   ├── src/
│   │   ├── App.tsx              # Main app with routes
│   │   ├── main.tsx             # Entry point with providers
│   │   ├── index.css            # Tailwind directives
│   │   ├── theme.css            # Theme CSS variables (HSL)
│   │   ├── components/
│   │   │   ├── Header.tsx       # Name, title, contact info
│   │   │   ├── Navigation.tsx   # Sticky nav + language selector
│   │   │   ├── AboutSection.tsx
│   │   │   ├── ExperienceSection.tsx
│   │   │   ├── EducationSection.tsx
│   │   │   ├── SkillsSection.tsx
│   │   │   ├── ProjectsSection.tsx
│   │   │   ├── ContactSection.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ThemeToggle.tsx  # Theme switcher (3 themes)
│   │   │   └── ui/              # shadcn/ui components
│   │   ├── contexts/
│   │   │   └── LanguageContext.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx         # Main resume page
│   │   │   └── not-found.tsx    # 404 page
│   │   └── lib/                 # Utilities
│   └── index.html               # HTML template
├── content/                     # Multi-language JSON content
│   ├── en/                      # English translations
│   ├── ja/                      # Japanese translations
│   └── tr/                      # Turkish translations
├── public/                      # Static assets (PDFs, images)
├── scripts/                     # Build scripts (PDF generation, theme)
├── tailwind.config.ts           # Tailwind configuration
└── theme.json                   # Theme configuration
```

## Common Commands

```bash
# Development server
npm run dev

# Production build (includes PDF generation)
npm run build

# Preview production build
npm run preview

# Type checking
npm run check
```

## Key Implementation Details

### Theming

- 3 themes: Van Helsing (dark), Dracula Pro, Alucard (light)
- CSS variables defined in `client/src/theme.css` using HSL format
- Tailwind configured to use CSS variables via `tailwind.config.ts`
- Theme class applied to `<html>` element
- Theme preference stored in localStorage

### Multi-Language Support

- Languages: English (en), Japanese (ja), Turkish (tr)
- Content stored in `content/{lang}/*.json` files
- Language context provides translations throughout app
- PDF resumes generated for each language

### Design Style

- Anthropic-inspired minimal design
- Clean typography with professional spacing
- Subtle borders and soft shadows
- Smooth transitions on interactions

### Sections

1. **Header**: Name, title, contact info, download resume button
2. **Navigation**: Sticky nav with section links + language selector + theme toggle
3. **About**: Bio and language proficiencies
4. **Experience**: Work history with responsibilities
5. **Education**: Academic background
6. **Skills**: Technical skills in columns
7. **Projects**: Featured projects
8. **Contact**: Contact form
9. **Footer**: Copyright + back to top

### SEO

- JSON-LD structured data (Person schema)
- OpenGraph and Twitter card meta tags
- Semantic HTML5 tags
- robots.txt with sitemap directive
