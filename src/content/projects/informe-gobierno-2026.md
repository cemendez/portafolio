---
title: "Evolución Arquitectónica: Sistema de Captura para el Informe de Gobierno 2026"
description: "Los bloqueos globales paralizaban a todas las dependencias. Rediseñé la plataforma para que cada una avance a su ritmo, sin pisarse entre sí."
publishDate: 2026-05-15
image: "./assets/images/informe-gobierno-2026.png"
category: "Gobierno"
role: "Arquitecto de software y desarrollador principal"
tags: ['Laravel', 'Livewire', 'Alpine.js', 'MySQL', 'Spatie', 'Arquitectura Orientada a Eventos']
featured: true
status: "Privado"
---

## El Desafío

La versión anterior del sistema tenía un problema grave: cuando una dependencia enviaba su información, se bloqueaba todo. Nadie más podía avanzar hasta que el Órgano Interno de Control terminara de revisar. Y cuando alguien corregía algo, se sobrescribían los datos históricos. En un proceso donde decenas de dependencias reportan cientos de obras y proyectos cada mes, esto era un caos.

Necesitaban una plataforma donde cada dependencia avanzara a su propio ritmo, los datos históricos nunca se perdieran, y el OIC pudiera revisar y dictaminar sin bloquear a los demás.

## Arquitectura y Solución

Descarté una SPA tradicional desde el principio. Opté por **Laravel + Livewire + Alpine.js + Tailwind**. ¿Por qué? Porque toda la lógica crítica y la seguridad se quedan en el servidor (Laravel), donde deben estar. Alpine.js aporta reactividad en el cliente para una experiencia fluida, sin tener que serializar estados enormes en el frontend.

**Historial temporal, no sobrescritura:** Diseñé un administrador de periodos y un motor de estados en Eloquent que gobierna el ciclo de vida de cada registro: Borrador → Enviado → Observado → Validado. Las acciones ya no se sobrescriben; generan un histórico mes a mes, indexado y disponible para auditorías retroactivas.

**Flujos asíncronos:** Cada dependencia tiene su propio mes activo. Ya no hay un "corte global" que paralice a todos. Cada entidad avanza a su ritmo, y el sistema lo maneja sin conflictos.

**Patrón de bloqueo centralizado:** Cuando una cuenta está inactiva o el OIC formaliza un periodo, el sistema propaga un estado de solo lectura desde el componente padre. La interfaz se deshidrata automáticamente —no puedes editar aunque quieras— y los endpoints se bloquean a nivel de Middleware y Policies (Spatie RBAC).

## Logros técnicos

- **Optimización de consultas:** Refactorice el árbol jerárquico del PED y la generación de matrices en Excel. Con Eager Loading anidado (`with(['accion.dimensionEstrategica.eje', 'municipios.municipio'])`) reduje cientos de consultas redundantes a solo dos iteraciones, bajando el consumo de memoria del servidor en un 40%.
- **Preparación GIS:** Desarrollé un módulo de inyección masiva de cobertura municipal desde archivos Excel y generé reportes con claves INEGI y formato GeoJSON listos para sistemas de inteligencia territorial.
- **Cache Busting seguro:** Para evitar que los auditores vieran archivos cacheados, implementé URLs firmadas con timestamps de mutación en la capa de presentación.
- **Validación contextual:** El sistema evalúa en tiempo real el origen de los fondos (gasto corriente vs. inversión) para exigir dinámicamente la alineación a programas presupuestarios, manteniendo la BD limpia sin fricción para el usuario.
- **Componentes UI híbridos:** Combiné directivas de Blade, sincronización stateful de Livewire (`@entangle`) y Alpine.js para procesar catálogos grandes directamente en memoria del cliente.

## Impacto

La plataforma transformó un proceso burocrático y propenso a errores en un ecosistema auditable y predecible. El OIC ahora tiene trazabilidad atómica sobre cada peso invertido reduciendo los tiempos de revisión y dictamen en más del 60%. Cualquier intento de manipulación post-validación es rechazado de raíz.
