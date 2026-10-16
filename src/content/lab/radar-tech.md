---
title: Radar Tech
description: Digest diario de noticias tech curado con un LLM. Se dispara solo cada mañana, llega por Telegram y queda archivado en una página pública.
seoTitle: "Radar Tech: noticias tech diarias con IA y Telegram"
seoDescription: "Bot que elige cada mañana con un LLM las noticias de IA y programación, las envía por Telegram y las archiva. Node.js, Cloudflare y GitHub Actions."
publishDate: 2026-10-14
cover: ./assets/images/radar-tech-portada.webp
coverAlt: Página /radar con la edición diaria del digest y el selector de fechas
gallery:
    - src: ./assets/images/radar-tech-movil.webp
      alt: Radar Tech en un celular, con la edición del día y su resumen por nota
      caption: La misma página en móvil
# youtubeId: ID del video de demostración (YouTube, "no listado" sirve)
stack: [Node.js, GitHub Actions, Cloudflare Workers, Groq (LLM), Telegram Bot API, Astro]
status: Online
version: v1.0
internalUrl: /radar
repoUrl: https://github.com/cemendez/radar-tech
highlights:
    - Costo de operación cero con servicios gratuitos
    - Disparo puntual con un cron de Cloudflare Worker
    - Control de duplicados entre ediciones
    - Archivo histórico en JSON consumido por este portafolio
    - Construido por versiones y documentado con ADRs
featured: true
priority: 1
---

## El problema

Mantenerme al día en IA, programación, arquitectura y herramientas me costaba media hora diaria saltando entre sitios. Quería un resumen corto, a la misma hora y sin pagar por ningún servicio.

## La solución

Un pipeline que corre solo cada mañana:

1. **Lectura de feeds**: obtiene las notas recientes de las fuentes configuradas.
2. **Curaduría con LLM**: un modelo gratuito (Groq) selecciona lo relevante y escribe un resumen breve de cada nota.
3. **Entrega**: el digest se envía por Telegram.
4. **Archivo**: cada edición se guarda en el repositorio como JSON, con un índice de fechas. La página [/radar](/radar) de este portafolio lee ese archivo.

## Decisiones técnicas

- **Cloudflare Worker como disparador (v0.4).** El `schedule` de GitHub Actions llegaba con horas de retraso. Un cron en un Worker dispara el workflow a las 8:55 a. m. de Puebla y desde entonces el digest llega puntual.
- **Archivo en el repo, no en una base de datos.** Los JSON versionados en Git son gratis, auditables y cualquier sitio estático puede leerlos.
- **Lectura en el navegador (ADR-006).** La página /radar pide el JSON al cargar, así que muestra la edición del día sin recompilar el portafolio. Recompilar con un Deploy Hook queda como opción futura si hace falta mejor SEO.

## Lo que salió mal

- El cron de GitHub Actions no es confiable para horarios exactos. La solución fue mover el disparo fuera de GitHub.
- Sin control de duplicados, la misma noticia se repetía varios días. Se agregó un registro de enlaces ya enviados.

## Versiones

- **v0.1** — Lectura de feeds.
- **v0.2** — Curaduría y resúmenes con LLM.
- **v0.3** — Envío por Telegram, ejecución diaria y control de duplicados.
- **v0.4** — Disparo con Cloudflare Worker.
- **v1.0** — Archivo histórico y página pública en este portafolio.