---
title: "Sistema de Consulta: Anexo Geográfico de Gobierno"
description: "Miles de indicadores gubernamentales organizados en un mapa, accesibles para cualquier ciudadano."
publishDate: 2026-03-30
image: "./assets/images/anexo-informe.png"
category: "Gobierno"
role: "Lead Developer / Architect"
tags: ["Laravel", "PHP", "MySQL", "Leaflet", "GeoServer"]
featured: true
demoUrl: "https://planeacion.puebla.gob.mx/anexo/"
status: "Online"
---

## El Desafío

El gobierno produce montañas de datos cada año. El problema no es generarlos, sino organizarlos de manera que alguien pueda entenderlos. El reto era tomar miles de indicadores de distintas dependencias, con estructuras diferentes y lógicas dispares, y convertirlos en una sola plataforma donde cualquier ciudadano pudiera consultarlos sin volverse loco.

## Lo que hice

Diseñé una base de datos con tres niveles jerárquicos —ejes temáticos, acciones y datos granulares— que permite organizar cualquier indicador sin importar su origen. Implementé un sistema de versionado anual para que los datos de cada año se conserven sin sobrescribirse, con relaciones polimórficas entre municipios, ejecutoras y acciones.

Para las consultas, desarrollé agregaciones con JOINs y GROUP BY que cruzan datos por municipio, eje temático, ejecutora y año. El controlador principal construye vistas diferentes según el tipo de acción (obras, grupos vulnerables, educación), adaptando las consultas SQL para que el dashboard responda rápido incluso con miles de registros.

## Valor real

Lo que antes eran archivos dispersos que solo unos cuantos podían interpretar, se convirtió en un dataset estructurado, auditable y público. Académicos, periodistas y ciudadanos pueden hoy consultar la inversión pública por año, municipio y ejecutora. Y el gobierno puede demostrar que rinde cuentas.
