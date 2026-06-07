---
title: "Sistema de Monitoreo Estatal de Proyectos Estratégicos"
description: "Plataforma gubernamental para la planeación, seguimiento y visualización geoespacial de programas, proyectos y obras públicas del Estado de Puebla."
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

El Gobierno del Estado de Puebla necesitaba reemplazar un sistema obsoleto de seguimiento de programas y obras públicas que operaba con reportes manuales en hojas de cálculo, imposibilitando la trazabilidad en tiempo real del ejercicio del gasto. El principal desafío era consolidar en una sola plataforma la gestión de más de 15 catálogos normativos (ejes nacionales, ODS, tipos de obra, programas presupuestarios, ZAPs), el registro de recursos financieros de 4 fuentes de fondeo (federal, estatal, municipal y otros), y la generación de reportes ejecutivos con datos geoespaciales, todo bajo un esquema de roles y permisos granular que permitiera a todas las dependencias y entidades estatales operar sin exponer información cruzada.

## La Solución Técnica

Se diseñó una arquitectura monolítica modular sobre **Laravel 8**, migrada posteriormente a **Laravel 12 con PHP 8.4** como parte de un proceso de modernización continua. El sistema se articuló en torno a un modelo de datos central (`Proyecto`) con 33 modelos Eloquent que reflejan fielmente la estructura orgánica del gasto público estatal.

**Módulos clave:**

- **Dashboard ejecutivo multicapa**: Panel con 4 gráficas sincronizadas (devengado general, tipo de acción, categoría estratégico/prioritario, estatus de proyectos) y un mapa interactivo con Leaflet.js que geo-referencia proyectos por municipio.
- **Seguimiento dual**: Los programas/proyectos operan con seguimiento diario y mensual; las obras con seguimiento semanal de actividades, semanal general y mensual general,  cada uno con su propio subsistema de reportes y validaciones.
- **Fichas técnicas con GIS**: Carga y validación de archivos KML/KMZ mediante regla de validación personalizada (`KmlKmzValidationRule`), con almacenamiento de metadatos geoespaciales para renderizado en el mapa estatal.
- **Exportación profesional a Excel**: Generación de reportes con estilos tipográficos y celdas con color de encabezado mediante **FastExcel + OpenSpout**, descargando archivos formateados listos para presentación ejecutiva.
- **RBAC con Spatie Permission**: 8 permisos granulares (CRUD por módulo) asignados a plantillas de rol (`Administrador`, `Dependencia`, `Visualizador`, `Invitado`), con un `Gate::before` que otorga superadmin a un usuario específico.
- **Configuraciones dinámicas**: Mes de evaluación configurable por ciclo fiscal para determinar las ventanas de reporteo activo.

**Decisiones técnicas destacadas:**

- **Optimización de consultas**: Se implementaron subconsultas correlacionadas con `leftJoin` sobre `DB::raw` para agregar métricas programado vs. ejercido sin multiplicación de filas en el JOIN, manteniendo el conjunto de resultados plano.
- **Validación híbrida**: Reglas de validación de Laravel combinadas con regla personalizada para archivos geoespaciales, más restricciones de unicidad compuesta a nivel de base de datos.
- **Migración de plataforma**: Se completó la migración de Laravel 8 → 12 con actualización de 40+ paquetes, incluyendo la consolidación de middleware en `bootstrap/app.php` y la adaptación a Carbon 3.x, sin regresión funcional.
- **Seguridad por capas**: Rate limiting en API, middleware CORS, CSRF, cifrado AES-256-CBC, y forzado de HTTPS en producción.
