---
title: "Plataforma E-Learning TNG Group — LMS Transformacional con Stripe + Zoom"
description: "Plataforma integral de cursos transformacionales con pago automatizado vía Stripe, control de sesiones concurrentes, gestión de Zoom y panel administrativo — migró un modelo presencial a uno digital global."
publishDate: 2022-03-30
image: "./assets/images/gabriel-nosso.png"
category: "E-learning"
role: "Arquitecto de software y desarrollador principal"
tags:
    - PHP
    - MariaDB
    - Stripe API
    - Bootstrap 5
    - PDO
    - Apache
    - JavaScript Vanilla
    - SweetAlert2
    - Zoom API
    - phpdotenv
status: "Offline"
---

## El Desafío

The Nossovitch Group (TNG) operaba sus programas de entrenamiento transformacional —Intro Plus, EIP, GAP, Coaching y Tortugas— bajo un modelo 100% presencial en México, Argentina, Chile y USA. La pandemia exigió una migración abrupta a virtual, pero no existía una plataforma que articulara: inscripción con pago, entrega de credenciales, acceso a sesiones Zoom, tareas digitales por día, notificaciones, material descargable y control administrativo, todo desde cero y sin frameworks.

## La Solución Técnica

Se diseñó una **arquitectura monolítica en PHP puro** con Front Controller y URL rewriting vía `.htaccess`. El corazón del sistema es un motor de **aprovisionamiento automático post-pago**: el usuario llega a un Checkout Session de Stripe, y al completarse el pago, se orquesta en una transacción lógica: validar el pago vía Stripe API, crear/recuperar el registro, insertar el curso comprado, generar tareas predefinidas conforme al curso adquirido, y establecer la sesión PHP autenticada sin intervención humana.

Para el **control de concurrencia**, se implementó un polling vía `setInterval(fetch(/check_log), 5000)` que compara el `session_id` almacenado en BD contra la sesión activa; si otro dispositivo inicia sesión, la sesión anterior se destruye automáticamente en máx. 5 segundos. El **panel admin** gestiona fechas de cursos, activación de Zoom links, notificaciones, subida de materiales, y activación/desactivación de tareas por día. Toda forma sensible está protegida con **tokens CSRF por SHA-256 + regex whitelist** y todas las `queries` usan **sentencias preparadas PDO** sin excepción.

Detalles técnicos adicionales para entrevista

- Patrón usado: Front Controller + Router simple (sin framework), MVA (Model-View-Action) artesanal
- Seguridad: CSRF en cada formulario, validación server-side con regex, prepared statements PDO en todas las queries, sesión con cookie_lifetime de 6 meses
- Optimización: Archivos estáticos con Cache-Control: public + Expires 30 días, DEFLATE vía .htaccess, preload de fonts y assets críticos, versionado
- Stripe: Dos flujos de pago diferenciados (cursos principales con redirects personalizados y cursos independientes), prices IDs por ambiente gestionados con phpdotenv