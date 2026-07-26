# Design Document — carlosemendez.com

## Overview

Single-page Astro 6 static site for Carlos E. Méndez, Software Architect.  
Deployed via GitHub Actions → rsync to shared hosting.  
Spanish-language, focused on government-sector architecture experience.

## Technical Architecture

| Layer | Technology |
|---|---|
| Static site generator | Astro 6 (`astro:transitions` ClientRouter, `astro:content`) |
| Styling | Single CSS file, custom properties, BEM naming |
| Client JS | Vanilla JS (no framework) |
| Notifications | SweetAlert2 for copy-to-clipboard toasts |
| Fonts | Poppins 300–900 via `@fontsource/poppins` |
| Images | `astro:assets` `Image` component for automatic optimization |
| Hosting | Shared hosting, `dist/` rsync'd |

## Visual Design System

### Color Palette

```
--bg:           #f8fafc    (page background, light slate)
--bg-alt:       #ffffff    (card/section background)
--text:         #0f172a    (headings, dark slate)
--text-muted:   #64748b    (body text)
--accent:       #0284c7    (primary blue, #00abf0 in older vars)
--accent-rgb:   2, 132, 199
--border:       #e2e8f0    (subtle borders)
```

The hero section uses a dark overlay (`#071A29` background with `--background-image`) so text in the hero is white/light. Accent blue is used for interactive elements, links, active states, and decorative borders.

### Typography

- **Font:** Poppins (300–900 weights)
- **Heading sizes:** `heading` class is 2.8rem centered; section title `about__subtitle` 1.8rem
- **Body:** 0.9rem (scales to 1.05rem on desktop)
- **Tags/labels:** 0.65rem–0.75rem uppercase or bold

### Spacing & Layout

- Sections: 7rem padding top/bottom (10rem desktop), min-height 100vh
- Side padding: `--padding-side: 8%`
- Max content width: 900–1200px depending on section
- Grids use CSS Grid with `auto-fill, minmax(310px, 1fr)` for portfolio cards

## Component Tree

```
MainLayout
├── BaseHead (meta/OG tags)
├── StructuredData (JSON-LD Person schema)
├── Header (fixed, sticky on scroll, hamburger mobile menu)
├── <slot>
│   ├── Hero
│   │   ├── Animated typing heading (CSS @keyframes)
│   │   ├── Mouse trail thumbnails (project screenshots follow cursor)
│   │   ├── Social buttons (LinkedIn, GitHub, WhatsApp, Phone, CV download)
│   │   └── Email display + copy-to-clipboard (SweetAlert2 toast)
│   ├── About
│   │   ├── Image with gradient border, hover lift, sticky on desktop
│   │   ├── Bio paragraphs
│   │   └── Skills box (key technologies, soft skills)
│   ├── Experience
│   │   └── Timeline list with dot indicators
│   │       └── ExperienceCard (date, role, company, description, tags)
│   ├── Skills
│   │   └── 2×2 grid of SkillCards with mouse spotlight effect
│   │       └── SkillCard (title, description, tag pills)
│   └── Portfolio (sticky-card stack with scroll-driven scale animation)
│       └── N sticky cards (one per project)
│           ├── Titlebar (window chrome dots)
│           ├── Image column (60%)
│           └── Info column (40%): number, category, status, title, description, tags, role
└── Footer
    └── Scroll-to-top button, copyright
```

### Route: `/projects/[id]`

Detail page for each project. Uses `getStaticPaths()` from the content collection.  
Renders the MD content with `astro:content`'s `render()`.

## Interactive Features

### 1. Hero Mouse Trail
On `mousemove` over the hero, small project screenshots spawn at cursor position with rotation, fade out after 1s. Creates a playful portfolio preview effect.

### 2. Portfolio Sticky Stack
Projects render as cards stacked vertically with `position: sticky`. On scroll, each card scales down from `startScale` (calculated by index) to 1.0. Uses `requestAnimationFrame` for smooth updates. Shows a window-chrome titlebar on each card.

### 3. Skills Spotlight
Two effects on skill cards:
- Radial gradient spotlight following mouse position (CSS `--mouse-x`/`--mouse-y` custom properties)
- Code rain background revealed via CSS `mask-image` radial gradient on hover

### 4. Header Behavior
- Transparent → sticky background on scroll past 100px
- Mobile hamburger menu (toggle `active` class on navbar)
- Nav links auto-highlight based on scroll position
- Desktop: nav links white on hero, dark on scroll

### 5. Email Copy
Copy email to clipboard with SweetAlert2 success toast; fallback using `document.execCommand('copy')`.

### 6. Years of Experience
Auto-calculated: `new Date().getFullYear() - 2014`, displayed via `.experience__years` class.

## Responsive Design

| Breakpoint | Behavior |
|---|---|
| < 769px (mobile) | Single column grids, full-width cards, hamburger menu visible, sticky cards become normal flow |
| 769–991px (tablet) | Two-column skills grid, horizontal footer, inline nav |
| ≥ 992px (desktop) | 25%/75% about layout, two-column skills, hero text left-aligned, inline social bar at bottom |

## Content Model (Astro Content Collections)

Projects in `src/content/projects/*.md` with Zod schema:

```typescript
{
  title: string
  description: string
  publishDate: Date
  image: Image           // relative path e.g. "./assets/images/project.png"
  category: enum         // GIS | Gobierno | E-commerce | FullStack | Web App | Freelance
  tags: string[]
  status: enum           // Online | Offline | Privado | Fase de Lanzamiento
  role: string
  featured: boolean      // reserved for top projects (spans 2 cols)
  demoUrl?: URL
  repoUrl?: URL
}
```

Body follows narrative: **Desafío → Solución → Impacto**.

## Performance & SEO

- Static site, no server rendering
- OG tags + JSON-LD structured data (Person schema)
- Canonical URLs, sitemap linked
- `astro:assets` Image component for automatic optimization
- Accessibility: skip link, `focus-visible` outlines, `prefers-reduced-motion` media query disables animations
- Custom scrollbar styling
- `::selection` styled with accent color

## Deployment Pipeline

```
Git push main → GitHub Actions:
  1. Setup Node 22, npm cache
  2. npm install
  3. npm run build  → dist/
  4. rsync -avzr --delete dist/ → remote server
```

Docker dev: `docker compose up` runs `npm run dev -- --host` on port 4321.

## Notable Implementation Details

- All CSS in a single file (~1830 lines), no CSS modules or preprocessors
- No typecheck, lint, or test scripts configured
- Both `package-lock.json` and `pnpm-lock.yaml` tracked; CI uses npm
- `.editorconfig`: spaces 4-wide, CRLF, no trailing whitespace trim, no final newline
- Astro dev toolbar disabled in config
- Section components live in `src/components/sections/` (not `src/sections/` as the tsconfig alias `@sections/*` suggests)
- Root OG image is `public/portada.jpg` (referenced as `/portada.jpg`)
- Logo is an inline SVG in `Header.astro` with CSS custom properties for color theming (`--logo-primary`, `--logo-accent`)
- Scroll-driven animations use `.show-animate` class (from intersection-based scroll logic in script.js)
