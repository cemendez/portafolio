# carlosemendez.com

Portafolio de **Carlos E. Méndez**, Arquitecto de Software. Sitio estático en español, tema oscuro, desplegado en Cloudflare Pages.

## Stack

- [Astro 6](https://astro.build) (salida estática, sin adaptador) con `@astrojs/sitemap`.
- Node >= 22.12 y pnpm 10 (`packageManager` en `package.json`; solo se versiona `pnpm-lock.yaml`).
- CSS plano con variables y nombres BEM, un archivo por componente. JavaScript vanilla; SweetAlert2 solo para el aviso al copiar el correo.
- Poppins vía `@fontsource`. Imágenes con `astro:assets` a partir de fuentes `.webp`.
- Analítica: GA4 (`src/components/base/Analytics.astro`, solo en producción) y Cloudflare Web Analytics.

## Comandos

| Comando             | Acción                                         |
| :------------------ | :--------------------------------------------- |
| `pnpm install`      | Instala dependencias                           |
| `pnpm dev`          | Servidor de desarrollo en `localhost:4321`     |
| `pnpm build`        | Compila el sitio a `dist/`                     |
| `pnpm preview`      | Sirve `dist/` localmente                       |
| `pnpm check`        | Verifica tipos con `astro check`               |
| `pnpm format`       | Formatea con Prettier                          |
| `pnpm format:check` | Comprueba el formato (lo ejecuta el CI)        |

## Estructura

```text
src/
├─ content.config.ts      colección `projects` (glob de src/content/projects, esquema Zod)
├─ content/projects/      proyectos en .md + assets/images/*.webp
├─ content/lab/           fichas del Laboratorio técnico (.md) + plantilla
├─ pages/                 index.astro (/), projects/[id].astro, lab/ (/lab, /lab/<id>), radar.astro (/radar) y roi.astro (/roi)
├─ layouts/               MainLayout, Header, Footer
├─ components/
│  ├─ base/               BaseHead (SEO/OG), StructuredData (JSON-LD), Analytics
│  ├─ sections/           Hero, Portfolio, Lab, Skills, About, Experience, RoiPreview
│  └─ ui/                 ProjectCard, LabCard, ExperienceCard, SkillCard, techIcons.ts
├─ assets/css/            base.css + una hoja por componente (header, hero, about, …)
├─ assets/images/         home.webp, iconos
└─ utils/                 experience.ts (años de experiencia), lab.ts (orden y fechas del laboratorio)
public/                   CV en PDF, favicon, portada.jpg (OG por defecto), robots.txt
```

Alias de TypeScript: `@components`, `@layouts`, `@sections` (→ `src/components/sections`), `@content`, `@assets`, `@utils`.

## Agregar un proyecto

1. Crea `src/content/projects/<nombre>.md` con el frontmatter definido en `src/content.config.ts`.
2. Agrega la captura en `src/content/projects/assets/images/<nombre>.webp` (máx. 1920 px de ancho).
3. Redacta el cuerpo con la narrativa **Desafío → Solución → Logros**.
4. El proyecto aparece solo en la home (ordenado por `priority`), en `/projects/<nombre>`, en el sitemap y con su propio Open Graph y JSON-LD.

## Laboratorio técnico

Proyectos de aprendizaje en `src/content/lab/` (copia `_plantilla.md` sin el guion bajo). Se publican en `/lab/<nombre>` y los destacados salen en la home. `/radar` lee en el navegador el archivo diario del repo público `radar-tech`.

Más detalle de convenciones en [`AGENTS.md`](./AGENTS.md); diseño y comportamiento en [`DESIGN.md`](./DESIGN.md).

## Despliegue

Cloudflare Pages con integración Git: cada push a `main` ejecuta `pnpm build` y publica `dist/`. El workflow `.github/workflows/ci.yml` solo valida (`check`, `format:check`, `build`) en PRs y pushes; no despliega.
