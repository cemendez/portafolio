---
title: "Sistema de Consulta: Anexo Estadístico de Gobierno"
description: "Plataforma digital para presentar la distribución geográfica de las acciones llevadas a cabo por el Gobierno del Estado, a nivel municipal y regional."
publishDate: 2026-03-30
image: "./assets/images/anexo-informe.png"
category: "Gobierno"
role: "Lead Developer / Architect"
tags: ["PHP", "Laravel", "MySQL", "Leaflet", "GeoServer"]
featured: true
demoUrl: "https://planeacion.puebla.gob.mx/anexo/"
status: "Online"
---

## El Desafío
Centralizar miles de indicadores estadísticos generados por diversas dependencias gubernamentales en una plataforma única, accesible y fácil de navegar para el ciudadano, garantizando la disponibilidad de la información conforme a las leyes de transparencia.

## Solución Técnica

**Arquitectura de Base de Datos Multidimensional:**
* **Diseño Jerárquico Dinámico:** Implementé una estructura de tres niveles para organizar indicadores:
  - **Ejes Temáticos**: Categorías de alto nivel (Educación, Salud, etc.)
  - **Acciones**: Subdivisiones asociadas a cada eje, con mapeo directo a columnas específicas de la base de datos
  - **Datos**: Registros granulares multidimensionales, sin duplicación mediante referencias cruzadas
  
* **Sistema de Versionado Anual:** Implementé un modelo de datos que mantiene consistencia temporal mediante:
  - Relaciones polimórficas entre municipios, ejecutoras y acciones
  - Jerarquía clara: Acción → Municipio → Ejecutora → Año, permitiendo consultas multidimensionales sin duplicaciones

**Integridad de Datos y Consistencia:**
* **Nomenclatura Controlada:** Uso de campos `clave_campo` y `codigo` como identificadores únicos para prevenir desincronización entre versiones anuales de indicadores
* **Foreign Keys Cascadas:** Implementé restricciones de integridad referencial entre `accion_datos` → `accions` → `cat_tematicas`, garantizando validez de relaciones en todo el sistema
* **Mapeo Dinámico de Campos:** La columna `columna_db` en la tabla `accions` permite reconfiguraciones de fuentes de datos sin alterar la estructura física de `accion_datos`, facilitando integraciones con múltiples ejecutoras gubernamentales

**Consultas Optimizadas y Renderizado Eficiente:**
* **Aggregations Multidimensionales:** Desarrollé queries con JOINs y GROUP BY que agregan datos por municipio, eje temático, ejecutora y año, permitiendo dashboards sin overhead de procesamiento en cliente
* **Filtrado Dinámico en Controladores:** El controlador principal construye vistas diferenciadas según tipo de acción (`grandes_obras`, `grupos_vulnerables`, `educación`), adaptando consultas SQL para optimizar resultado y reducir carga de red

**Valor Gubernamental:**
Este modelo transformó miles de registros dispersos en un **Dataset Estructurado y Auditable**, permitiendo:
- Trazabilidad completa de inversiones públicas por año, municipio y ejecutora
- Análisis comparativo entre períodos mediante versionado integrado
- Acceso público conforme a marcos de transparencia (Ley de Acceso a la Información)

**Valor Agregado**

Este proyecto transformó datos crudos en **Datos Abiertos**, facilitando el escrutinio público y la toma de decisiones basada en evidencia para académicos, periodistas y ciudadanos.
