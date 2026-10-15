# Agents.md — portafolio-web

Personal portfolio site (Carlos E. Méndez) built with **Astro 6**.  
Deployed at `https://carlosemendez.com`.  
Profile focus: **Software Architect** (Arquitecto de Software).

## Commands

```sh
pnpm dev       # dev server at localhost:4321
pnpm build     # static site to dist/ (~2s)
pnpm preview   # preview build locally
pnpm astro     # astro CLI
pnpm check     # astro check (types)
pnpm format    # prettier --write .
pnpm format:check   # prettier --check . (run by CI)
```

No unit tests. CI (`.github/workflows/ci.yml`) runs `check`, `format:check` and `build` on PRs and pushes to `main`; run them locally before pushing.

## Project structure

| Directory | Purpose |
|---|---|
| `src/pages/` | Routes: `index.astro`, `projects/[id].astro`, `lab/index.astro`, `lab/[id].astro`, `radar.astro` |
| `src/content/projects/` | MD project entries with frontmatter (Zod schema in `src/content.config.ts`) |
| `src/content/lab/` | MD entries of the Laboratorio técnico (learning projects); files starting with `_` are ignored (`_plantilla.md`) |
| `src/components/base/` | Low-level components: `BaseHead.astro`, `StructuredData.astro`, `Analytics.astro` |
| `src/components/sections/` | Page sections: `Hero.astro`, `About.astro`, `Experience.astro`, `Skills.astro`, `Portfolio.astro`, `Lab.astro` (home teaser) |
| `src/components/ui/` | Reusable cards: `ProjectCard.astro`, `LabCard.astro`, `ExperienceCard.astro`, `SkillCard.astro` |
| `src/layouts/` | `MainLayout.astro` (Poppins font, ClientRouter, `base.css`, slot `head`), `Header.astro`, `Footer.astro` |
| `src/assets/css/` | One stylesheet per component/section (`base.css`, `header.css`, `hero.css`, …) — custom properties, BEM naming |
| `src/utils/` | `experience.ts` (years), `lab.ts` (sorting/format helpers for the lab collection) |
| `public/` | Static assets: `favicon.svg`, `portada.jpg` (OG image) |

## Path aliases (tsconfig)

`@components/*`, `@layouts/*`, `@sections/*` (→ `src/components/sections/`), `@content/*`, `@assets/*`, `@utils/*` — all resolve under `src/`.

## Content collections

Two collections: `projects` (client/professional work) and `lab` (Laboratorio técnico, learning projects).

Projects use `astro:content` with `glob()` loader (`src/content/projects/**/*.md`).  
Project images are stored as `.webp` (max 1920px wide). Images in frontmatter use the `image()` schema type — reference project images via relative path (`./assets/images/<file>.webp`).  
Supported categories: `GIS`, `Gobierno`, `E-commerce`, `E-learning`, `FullStack`, `Web App`, `Freelance`.  
Statuses: `Online`, `Offline`, `Privado`, `Fase de Lanzamiento`.

### Project frontmatter schema

```yaml
title: string               # Project name
description: string          # Short summary (shown in cards)
publishDate: YYYY-MM-DD     # Shown on the detail page and used as sitemap lastmod
image: "./assets/images/<file>.webp"   # Card image (relative path)
category: "Gobierno"         # One of the enum values above
tags:                        # Array of tech tags
  - Laravel
  - PHP 8.4
status: "Online"             # One of the statuses above
role: "Arquitecto de software y desarrollador principal"   # Your role
featured: false              # Reserved for strongest architect-level projects (not used in the UI yet)
priority: 1                  # Display order on the home page (ascending, default 999)
demoUrl: "https://..."       # Optional live link
repoUrl: "https://..."       # Optional repo link
```

### Laboratorio técnico (`lab` collection)

Entries live in `src/content/lab/<name>.md` and are published at `/lab/<name>`. Copy `_plantilla.md` (drop the underscore) to add one. Frontmatter: `title`, `description` (≤220 chars, also meta description), `publishDate`, `updatedDate?`, `cover?`/`coverAlt?`, `gallery[]` (`src`, `alt`, `caption?`), `youtubeId?` (11-char ID; loaded on click from youtube-nocookie), `stack[]`, `status` (`En desarrollo` | `Online` | `Offline` | `Archivado`), `version?`, `internalUrl?` (page inside this site, e.g. `/radar`), `demoUrl?`, `demoNote?`, `repoUrl?`, `highlights[]`, `featured`, `priority` (ascending; featured first). Body sections: El problema → La solución → Decisiones técnicas → Lo que salió mal → Qué mejoraría. Screenshots go in `src/content/lab/assets/images/*.webp`.
Entries without `cover` render a title block on the card. Do not put private URLs (demos with open sign-up, unreviewed repos) in the markdown: the repo is public.

`/radar` is a client-rendered page: it fetches `archive/index.json` and `archive/<YYYY-MM-DD>.json` from `raw.githubusercontent.com/cemendez/radar-tech` in the browser (supports `?fecha=YYYY-MM-DD`). Crawlers only see the loading state; prerendering the latest edition at build time is a possible future step.

### Content writing style

Each project must follow the **Desafío → Solución → Impacto** narrative:

```
## El Desafío
Describe el problema de negocio o técnico. ¿Qué necesitaba el cliente?
¿Por qué era complejo? Menciona restricciones, escalas de datos, concurrencia,
seguridad, etc.

## Arquitectura y Solución (or "La Solución Técnica")
Explica las decisiones arquitectónicas que tomaste. ¿Por qué elegiste X
tecnología sobre Y? ¿Qué patrones aplicaste? Menciona trade-offs.
Usa bloques de código SQL, configuración, o diagramas si aplica.

## Logros Técnicos (or "Resultados" / "Impacto")
Métricas concretas: "Reduje el consumo de memoria en un 40%",
"Reducción del 60% en tiempos de dictamen", "Zero-downtime migration".
Siempre cuantificar cuando sea posible.
```

## Style guide

### CSS conventions

- **One file per owner:** `base.css` (tokens, reset, shared utilities like `.heading`, `.animate`, `.tech-badge`) is imported by `MainLayout`; every other stylesheet is imported from the frontmatter of the component that owns it (`import "@assets/css/hero.css"`), so each page only ships the CSS it uses. New sections get their own file and a class prefix (`lab.css` uses `lab-`/`radar`).
- **Custom properties** in `:root` (`base.css`) for colors, fonts, spacing:
  ```css
  --bg: #0f172a;
  --bg-alt: #1e293b;
  --text: #f8fafc;
  --text-muted: #94a3b8;
  --accent: #3b82f6;
  --accent-rgb: 59, 130, 246;
  --border: #334155;
  --padding-side: 8%;
  --font-family: "Poppins", sans-serif;
  ```
  Dark theme only; use the tokens instead of hard-coded colors.
- **BEM-like naming:** `block__element--modifier`
  - `.portfolio-card__title`, `.experience-card__date`, `.header--sticky`
  - Section wrapper uses the block name: `.portfolio`, `.experience`, `.skills`
- **Responsive breakpoints:** 769px (tablet), 992px (desktop).
- **Animations:** defined with `@keyframes`. (`.show-animate` is still toggled by the Header script but no CSS uses it.)
- **Hover effects:** `::before` pseudo-element with `width: 0 → 100%` pattern for fill animations on buttons and cards.

### Component patterns

**.astro file structure** (3 sections):

```
--- (frontmatter / JS logic)
  - imports
  - TypeScript interfaces
  - data fetching & processing
--- (template)
  - semantic HTML with BEM classes
  - Astro components via {ComponentName}
  - view transitions via transition:name
<script> (client-side JS, if needed)
  - Vanilla JS only (no framework)
  - SweetAlert2 for toasts
```

**Props pattern:** Always define `interface Props` at the top of the frontmatter for reusable components.

```astro
---
interface Props {
    title: string;
    description: string;
    skills: string[];
}
const { title, description, skills } = Astro.props;
---
```

**Section components** (in `src/components/sections/`) are full-page sections with `id` for anchor navigation. They are consumed by `index.astro`.

**UI components** (in `src/components/ui/`) are reusable cards that receive data via props.

### JavaScript patterns

- **Vanilla JS only** in `<script>` tags (no framework).
- **SweetAlert2** for toast notifications (copy-to-clipboard feedback).
- **Navigation:** scroll-spy and mobile menu live in the `<script>` of `Header.astro`, bound on `astro:page-load` (Header is re-created on every ClientRouter navigation). Menu links are `/#section` so they work from any route. Links to separate pages use `data-routes="/lab /radar"` (active on those paths) and, for a home section without an anchor link, `data-section="<section id>"`.

### Open Graph & SEO

- Default OG image: `public/portada.jpg` (1200×737). Project pages generate a 1200×630 JPG with `getImage` and pass it, with `imageAlt`, `imageWidth`, `imageHeight` and `publishedTime`, through `MainLayout` to `BaseHead`.
- Meta tags generated in `src/components/base/BaseHead.astro` (Open Graph, Twitter with `name=`, `es_MX` locale).
- Structured data (JSON-LD): global `Person` in `StructuredData.astro` with `jobTitle: "Software Architect"` (deliberately matches the social profiles; do not translate). Project pages add `CreativeWork` + `BreadcrumbList` via the layout `head` slot.
- Sitemap `lastmod` comes from each project's `publishDate` (see `astro.config.mjs`).
- Site canonical URL uses `Astro.site` config (`https://carlosemendez.com`).

### Creating a new project entry

1. Add a new `.md` file in `src/content/projects/` with the proper frontmatter.
2. Add a screenshot in `src/content/projects/assets/images/<project-name>.webp`.
3. Follow the **Desafío → Solución → Impacto** narrative in the body.
4. Set `priority` to place it on the home page; it will appear in `Portfolio.astro` (sorted by `priority`) and get its own `/projects/<name>` page.

## Deployment

- Hosted on **Cloudflare Pages**: every push to `main` triggers a build there (`pnpm build`, output `dist/`). GitHub Actions only validates (`ci.yml`); there is no Docker and no `_headers`/`_redirects`/CSP in the repo.

## Style quirks

- Line endings: repo stores LF (`.gitattributes`); `.editorconfig` asks for CRLF in the Windows working copy (git shows harmless "LF will be replaced by CRLF" warnings). Prettier: 4 spaces, `endOfLine: auto`.
- Uses `@fontsource/poppins` (weights 400, 600, 700 imported in `MainLayout`).
- Astro dev toolbar disabled in config.
- Package manager is **pnpm** (`packageManager` in package.json); only `pnpm-lock.yaml` is kept.
- Run `pnpm format` before committing; Prettier owns formatting (`.prettierignore` skips markdown, `src/content` and `public`).
- `hero.css` still has unused `.trail-thumbnail` / `@keyframes trailFade` from a removed effect.
- Astro view transitions enabled via `ClientRouter` in `MainLayout.astro`.
