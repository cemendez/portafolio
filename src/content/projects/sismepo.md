---
title: "Sistema de Monitoreo Estatal de Proyectos Estratégicos"
description: "Reemplacé un sistema de reportes en hojas de cálculo por una plataforma con mapas, dashboards y control de acceso granular para todo el gobierno estatal."
publishDate: 2024-05-18
image: "./assets/images/sismepo.png"
category: "Gobierno"
role: "Arquitecto de Software / Full-Stack Developer"
tags:
  - Laravel 12
  - PHP 8.4
  - MySQL
  - Spatie Permission
  - FastExcel
  - Bootstrap 5
  - GIS (KML/KMZ)
  - Leaflet.js
  - Chart.js
  - RBAC
status: "Privado"
---

## El Desafío

El gobierno estatal rastreaba sus programas y obras públicas con hojas de cálculo. Cada dependencia mandaba su archivo, alguien los consolidaba a mano, y para cuando tenían los datos ya estaban desactualizados. No había forma de saber en tiempo real cuánto se había ejercido, dónde se estaba invirtiendo o qué obras estaban atrasadas.

El reto era construir una plataforma única que consolidara más de 15 catálogos normativos (ejes nacionales, ODS, tipos de obra, programas presupuestarios), manejara recursos de 4 fuentes de fondeo distintas (federal, estatal, municipal, otros), y diera visibilidad geoespacial de todo, todo con roles y permisos para que cada dependencia viera solo lo que le corresponde.

## Lo que hice

Diseñé una arquitectura monolítica modular sobre Laravel, con 33 modelos Eloquent que reflejan la estructura del gasto público estatal.

**Dashboard multicapa:** Cuatro gráficas sincronizadas muestran el devengado general, tipo de acción, estatus de proyectos y categoría estratégica. Un mapa interactivo con Leaflet.js geo-referencia cada proyecto por municipio.

**Seguimiento dual:** Los programas/proyectos tienen seguimiento diario y mensual; las obras tienen seguimiento semanal de actividades, semanal general y mensual general. Cada uno con su propio subsistema de reportes y validaciones.

**GIS sin dolor:** Implementé una regla de validación personalizada para archivos KML/KMZ que verifica que estén bien formados antes de guardarlos. Los metadatos geoespaciales se almacenan para renderizarse en el mapa estatal.

**Reportes con estilo:** Usando FastExcel + OpenSpout, genero archivos de Excel con tipografía, colores de encabezado y formato listos para presentación ejecutiva. Nada de datos crudos.

**Permisos granulares:** 8 permisos CRUD por módulo asignados a plantillas de rol (Administrador, Dependencia, Visualizador, Invitado). Un Gate::before otorga superadmin a un usuario específico.

**Decisiones técnicas que importaron:**

- **Consultas optimizadas:** Usé subconsultas correlacionadas con `leftJoin` sobre `DB::raw` para agregar métricas de programado vs. ejercido sin multiplicar filas en el JOIN.
- **Validación híbrida:** Reglas de Laravel + regla personalizada para archivos geoespaciales + restricciones de unicidad compuesta a nivel de BD.
- **Migración Laravel 8 → 12:** Actualicé 40+ paquetes, consolidando middleware en `bootstrap/app.php` y adaptando a Carbon 3.x, sin regresión funcional.
- **Seguridad por capas:** Rate limiting en API, middleware CORS, CSRF, cifrado AES-256-CBC y HTTPS forzado en producción.
