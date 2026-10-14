# Agents.md — portafolio-web

Personal portfolio site (Carlos E. Méndez) built with **Astro 6**.  
Deployed at `https://carlosemendez.com`.  
Profile focus: **Software Architect** (Arquitecto de Software).

## Commands

```sh
pnpm dev       # dev server at localhost:4321
pnpm build     # static site to dist/ (~2s)
pnpm preview   # preview build locally
pnpm astro     # astro CLI (e.g. `pnpm astro check`)
```

No test, lint, format, or typecheck scripts are configured.

## Project structure

| Directory | Purpose |
|---|---|
| `src/pages/` | Routes: `index.astro`, `projects/[id].astro` |
| `src/content/projects/` | MD project entries with frontmatter (Zod schema in `src/content.config.ts`) |
| `src/components/base/` | Low-level components: `BaseHead.astro`, `StructuredData.astro` |
| `src/components/sections/` | Page sections: `Hero.astro`, `About.astro`, `Experience.astro`, `Skills.astro`, `Portfolio.astro` |
| `src/components/ui/` | Reusable cards: `ProjectCard.astro`, `ExperienceCard.astro`, `SkillCard.astro` |
| `src/layouts/` | `MainLayout.astro` (Poppins font, ClientRouter, global CSS), `Header.astro`, `Footer.astro` |
| `src/assets/css/` | One stylesheet per component/section (`base.css`, `header.css`, `hero.css`, …) — custom properties, BEM naming |
| `public/` | Static assets: `favicon.svg`, `portada.jpg` (OG image) |

## Path aliases (tsconfig)

`@components/*`, `@layouts/*`, `@sections/*` (→ `src/components/sections/`), `@content/*`, `@assets/*`, `@utils/*` — all resolve under `src/`.

## Content collections

Projects use `astro:content` with `glob()` loader (`src/content/projects/**/*.md`).  
Project images are stored as `.webp` (max 1920px wide). Images in frontmatter use the `image()` schema type — reference project images via relative path (`./assets/images/<file>.webp`).  
Supported categories: `GIS`, `Gobierno`, `E-commerce`, `FullStack`, `Web App`, `Freelance`.  
Statuses: `Online`, `Offline`, `Privado`, `Fase de Lanzamiento`.

### Project frontmatter schema

```yaml
title: string               # Project name
description: string          # Short summary (shown in cards)
publishDate: YYYY-MM-DD     # Sort order (descending)
image: "./assets/images/<file>.webp"   # Card image (relative path)
category: "Gobierno"         # One of the enum values above
tags:                        # Array of tech tags
  - Laravel
  - PHP 8.4
status: "Online"             # One of the statuses above
role: "Arquitecto de software y desarrollador principal"   # Your role
featured: false              # Reserved for strongest architect-level projects
demoUrl: "https://..."       # Optional live link
repoUrl: "https://..."       # Optional repo link
```

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

- **One file per owner:** `base.css` (tokens, reset, shared utilities like `.heading`, `.animate`, `.tech-badge`) is imported by `MainLayout`; every other stylesheet is imported from the frontmatter of the component that owns it (`import "@assets/css/hero.css"`), so each page only ships the CSS it uses. New sections get their own file (e.g. `lab.css`) and a class prefix.
- **Custom properties** in `:root` for colors, fonts, spacing:
  ```css
  --color-bg-primary: #081b29;
  --color-bg-secondary: #112e42;
  --color-color-title: #f9f4f2;
  --color-color-text: rgba(255, 255, 255, 0.6);
  --color-color-main: #00abf0;
  --padding-side: 8%;
  --font-family: "Poppins", sans-serif;
  ```
- **BEM-like naming:** `block__element--modifier`
  - `.portfolio-card__title`, `.experience-card__date`, `.header--sticky`
  - Section wrapper uses the block name: `.portfolio`, `.experience`, `.skills`
- **Responsive breakpoints:** 769px (tablet), 992px (desktop).
- **Animations:** defined with `@keyframes`, triggered by `.show-animate` class on scroll.
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
- **Navigation:** scroll-spy and mobile menu live in the `<script>` of `Header.astro`, bound on `astro:page-load` (Header is re-created on every ClientRouter navigation). Menu links are `/#section` so they work from any route.
- **Portfolio filtering:** client-side JS toggling `display: block/none` based on `data-category` attribute.

### Open Graph & SEO

- OG image file: `public/portada.jpg` (recommended: 1200×630px).
- Meta tags generated in `src/components/base/BaseHead.astro`.
- OG/Twitter image uses root-relative path (`/portada.jpg`) to work on any domain/subdomain.
- Structured data (JSON-LD) in `StructuredData.astro` — currently set to `Software Architect`.
- Site canonical URL uses `Astro.site` config (`https://carlosemendez.com`).

### Creating a new project entry

1. Add a new `.md` file in `src/content/projects/` with the proper frontmatter.
2. Add a screenshot in `src/content/projects/assets/images/<project-name>.webp`.
3. Follow the **Desafío → Solución → Impacto** narrative in the body.
4. The project will automatically appear in `Portfolio.astro` (sorted by date) and the category filters will pick it up.

## Portfolio filtering

`Portfolio.astro` renders category filter buttons above the project grid.  
Filtering is client-side JS: buttons toggle `display: block/none` on `.portfolio__item[data-category]`.  
No page reload needed. New categories appear automatically when added to project frontmatter.

## Deployment

- Hosted on **Cloudflare Pages**: every push to `main` triggers a build there (`pnpm build`, output `dist/`). No GitHub Actions workflow and no Docker.

## Style quirks

- `.editorconfig`: spaces, 4-wide, CRLF, no trailing whitespace trim, no final newline.
- Uses `@fontsource/poppins` (weights 300–900).
- Astro dev toolbar disabled in config.
- Package manager is **pnpm** (`packageManager` in package.json); only `pnpm-lock.yaml` is kept.
- No semicolons in CSS (codebase convention).
- Astro view transitions enabled via `ClientRouter` in `MainLayout.astro`.
