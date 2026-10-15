---
title: Cotizador para freelancers
description: Aplicación full-stack para administrar clientes y emitir cotizaciones con aritmética decimal exacta, folio consecutivo, flujo de estados y PDF de cotización y contrato.
publishDate: 2026-10-12
stack: [NestJS, Prisma, PostgreSQL, React, TypeScript, TanStack Query, Zod, Tailwind CSS, pdfmake, Vitest, Docker, GitHub Actions, Vercel, Render, Neon]
status: Online
# Sin demoUrl a proposito: el registro esta abierto y corre en un plan gratuito.
# repoUrl: se agrega cuando el repositorio sea publico (revisar .env.test y escanear el historial).
# youtubeId: ID del video de demostracion (YouTube, "no listado" sirve).
demoNote: Por ahora no hay demo pública. El registro está abierto y la API corre en un plan gratuito, así que la reservo para mis clientes. Si quieres verla en acción, escríbeme y te la muestro.
highlights:
    - Cálculos monetarios con Decimal, sin errores de punto flotante
    - Folio consecutivo por usuario sin colisiones
    - Autenticación propia con refresh token rotativo
    - Pruebas e2e contra PostgreSQL real
    - CI/CD con migraciones y verificación del despliegue
featured: true
priority: 2
---

## El problema

Un freelancer en México necesita cotizar con IVA, RFC y un folio consecutivo, dar seguimiento a cada propuesta y, si se acepta, entregar un contrato. Las hojas de cálculo no controlan estados ni evitan errores de redondeo.

Lo construí como práctica de NestJS y React con TypeScript, con un caso de uso que conozco de primera mano.

## Qué hace

- Alta y búsqueda de clientes.
- Editor de cotizaciones con conceptos dinámicos y totales en vivo.
- Flujo de estados: borrador → enviada → aceptada, rechazada o vencida.
- PDF de la cotización (con marca de agua mientras es borrador) y PDF del contrato al aceptarse.
- Panel con montos aceptados del mes, pendientes por moneda y cotizaciones por vencer.

## Arquitectura

Monorepo con pnpm: API en NestJS con Prisma y PostgreSQL, y una SPA en React con Vite. En producción, Vercel sirve el frontend y reenvía `/api` a Render, así que navegador y API comparten origen. Neon aloja la base de datos.

## Decisiones técnicas

- **Dinero con `Decimal` en una función pura.** El cálculo de importes, IVA y total vive en una función sin dependencias del framework, con redondeo *half-up* a dos decimales y pruebas unitarias (por ejemplo, 3 × 0.1 = 0.3 exacto). Los totales se guardan en columnas `Decimal(12,2)`.
- **El backend es la fuente de verdad.** El frontend replica el cálculo en centavos enteros solo para la vista previa.
- **Folio atómico.** El consecutivo por usuario se incrementa dentro de la misma transacción que crea la cotización, con una restricción única como respaldo.
- **Máquina de estados declarativa.** Una tabla define las transiciones válidas y el cambio se aplica con una actualización condicionada al estado actual, para evitar carreras.
- **Autenticación sin Passport.** Access token corto en memoria y refresh token opaco en cookie *httpOnly*, guardado como hash, con rotación y detección de reuso. Guard global y respuestas 404 ante recursos ajenos.
- **PDF con pdfmake**, sin navegador *headless*, para que el contenedor sea ligero.

## Calidad y despliegue

- Pruebas e2e contra PostgreSQL real: autenticación, aislamiento entre usuarios, cotizaciones, validación y límites de peticiones.
- Cada push a `main` ejecuta lint, build, pruebas e imágenes Docker; luego aplica migraciones, despliega la API y espera a que el *health check* reporte el commit exacto.

## Qué mejoraría

- Un paquete compartido para que el cálculo y las transiciones no estén duplicados entre API y web.
- Pruebas en el frontend.
- Marcar como vencidas, con una tarea programada, las cotizaciones enviadas cuya vigencia ya pasó.