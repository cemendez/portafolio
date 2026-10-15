# Design Document — carlosemendez.com

## Overview

Single-page Astro 6 static site for Carlos E. Méndez, Software Architect, plus one detail route per project.  
Spanish-language, dark theme only, focused on government-sector architecture experience.  
Hosted on Cloudflare Pages (Git integration: every push to `main` builds and publishes `dist/`).

## Technical Architecture

| Layer | Technology |
|---|---|
| Static site generator | Astro 6 (`astro:transitions` ClientRouter, `astro:content`, `astro:assets`) |
| Styling | Plain CSS, one stylesheet per component, custom properties, BEM naming |
| Client JS | Vanilla JS in component `<script>` tags (no framework) |
| Notifications | SweetAlert2 toast for copy-to-clipboard |
| Fonts | Poppins 400/600/700 via `@fontsource/poppins` |
| Images | `.webp` sources, optimized with `astro:assets`; project OG image generated at build |
| Analytics | GA4 (production only, manual `page_view` on `astro:page-load`) + Cloudflare Web Analytics |
| Tooling | pnpm, `astro check`, Prettier (`prettier-plugin-astro`), GitHub Actions CI (validation only) |

## Visual Design System

Tokens live in `src/assets/css/base.css` (`:root`). There is a single dark theme; there is no `prefers-color-scheme` or theme switch.

```
--bg:           #0f172a   (page background, deep navy)
--bg-alt:       #1e293b   (cards, badges, tags)
--text:         #f8fafc   (headings)
--text-muted:   #94a3b8   (body copy)
--accent:       #3b82f6   (links, active states, buttons)
--accent-rgb:   59, 130, 246
--border:       #334155
--padding-side: 8%
--font-family:  "Poppins", sans-serif
```

The hero uses a dark overlay over `home.webp` (`--background-image`). Accent blue marks interactive elements and active states. Accessibility contrast was tuned to WCAG AA (see commit history for accent/badge colors).

### Layout

- Sections: `min-height: 100vh`, 7rem vertical padding (10rem on desktop), horizontal `--padding-side`.
- Portfolio: CSS grid, `repeat(auto-fill, minmax(310px, 1fr))`.
- Skills grid: 1 column, 2 from 640px, 4 from 1024px.
- Breakpoints: 769px (tablet), 992px (desktop); a few components also use 640px and 1024px.

## Routes and Components

| Route | File |
|---|---|
| `/` | `src/pages/index.astro` (Hero, Portfolio, Skills, About, Experience) |
| `/projects/[id]` | `src/pages/projects/[id].astro` — `getStaticPaths()` over the `projects` collection |

```
MainLayout (BaseHead, StructuredData, Analytics, slot "head", ClientRouter)
├── Header   logo SVG, hamburger menu, nav links "/#section", scroll-spy
├── <slot>
│   ├── Hero         title, CTA buttons, social links, CV download, email copy
│   ├── Portfolio    grid of ProjectCard (sorted by `priority`)
│   ├── Skills       grouped columns of skill tags
│   ├── About        summary card (years of experience), skills box, narrative blocks
│   └── Experience   timeline of ExperienceCard
└── Footer   scroll-to-top, copyright
```

Project detail page: title, role/category/status/date badges, tag list, demo and repository links, hero image (shared view transition with the card), rendered markdown.

## Interactive Features

1. **Header:** transparent → sticky background past 100px of scroll; mobile hamburger toggle; nav link highlighting by scroll position (only on pages whose sections match the menu). Bound on `astro:page-load` because the Header is re-created on every navigation.
2. **Scroll reveal:** sections receive `.show-animate` when scrolled into view.
3. **View transitions:** card image → detail image via `transition:name="img-<id>"`.
4. **Email copy:** clipboard API with SweetAlert2 toast; falls back to `document.execCommand("copy")` for non-secure contexts.
5. **Years of experience:** `utils/experience.ts` computes `currentYear - 2014`.

## Content Model

Projects in `src/content/projects/*.md`, schema in `src/content.config.ts`:

```typescript
{
  title: string
  description: string
  publishDate: Date
  image: Image            // "./assets/images/<name>.webp"
  category: enum          // GIS | Gobierno | E-commerce | E-learning | FullStack | Web App | Freelance
  tags: string[]
  status: enum            // Online | Offline | Privado | Fase de Lanzamiento
  role: string
  featured: boolean       // default false; currently not used in the UI
  priority: number        // default 999; ascending order on the home page
  demoUrl?: URL
  repoUrl?: URL
}
```

Body follows the narrative **Desafío → Solución → Logros**.

## SEO and Quality

- `BaseHead.astro`: title, description, canonical (`Astro.site`), Open Graph (site name, locale `es_MX`, image size and alt, `article:published_time`) and Twitter Card (`name=` attributes).
- Structured data: global `Person` JSON-LD; each project adds `CreativeWork` and `BreadcrumbList` through the layout's `head` slot.
- Project OG image: JPG 1200×630 generated with `getImage`; default `public/portada.jpg` (1200×737).
- Sitemap via `@astrojs/sitemap`; `lastmod` comes from each project's `publishDate` (home uses the newest). `robots.txt` allows all.
- Accessibility: skip link, `:focus-visible` outlines, `prefers-reduced-motion` disables animations.
- No CSP or custom headers are defined in the repo.
- CI (`.github/workflows/ci.yml`): `pnpm check`, `pnpm format:check`, `pnpm build`. There are no unit tests.

## Notable Implementation Details

- Line endings: repo is LF (`.gitattributes` `text=auto`); `.editorconfig` asks for CRLF in the Windows working copy. Prettier uses `endOfLine: auto`.
- Astro dev toolbar is disabled in config.
- Root OG image is referenced as `/portada.jpg`.
- Logo is an inline SVG in `Header.astro`, colored through `--logo-primary` and `--logo-accent`.
- `hero.css` still contains `.trail-thumbnail` / `@keyframes trailFade`, leftovers of a removed mouse-trail effect.
