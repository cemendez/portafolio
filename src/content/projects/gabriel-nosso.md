---
title: "Plataforma E-Learning TNG Group — LMS Transformacional con Stripe + Zoom"
description: "Migré un negocio de cursos presenciales a uno digital global. Pagos con Stripe, sesiones Zoom, control concurrente y panel admin, todo desde cero."
publishDate: 2022-03-30
image: "./assets/images/gabriel-nosso.png"
category: "E-learning"
role: "Arquitecto de software y desarrollador principal"
tags:
    - Stripe API
    - PHP
    - MariaDB
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

The Nossovitch Group (TNG) daba cursos transformacionales —Intro Plus, EIP, GAP, Coaching, Tortugas— de forma presencial en México, Argentina, Chile y USA. Cuando llegó la pandemia, todo se detuvo. Necesitaban migrar a virtual, rápido, pero ninguna plataforma existente les servía porque su modelo era muy específico: inscripción con pago integrado, acceso a sesiones Zoom, tareas por día, material descargable, notificaciones y control administrativo. Todo desde cero, sin frameworks, con un presupuesto ajustado.

## Lo que hice

Construí una arquitectura monolítica en PHP puro con Front Controller y URL rewriting vía `.htaccess`. El corazón del sistema es un aprovisionamiento automático post-pago: el usuario compra un curso con Stripe y al instante el sistema le da acceso a todo lo que necesita, sin intervención humana.

**Control de concurrencia:** Implementé un polling cada 5 segundos que verifica si la sesión activa coincide con la registrada en BD. Si alguien más inicia sesión desde otro dispositivo, la sesión anterior se destruye en máximo 5 segundos. Esto evitaba que compartieran cuentas.

**Seguridad sin concesiones:** Cada formulario sensible tiene su token CSRF generado con SHA-256 más regex whitelist. Todas las queries sin excepción usan prepared statements con PDO. Nada de concatenar strings.

**Panel administrativo:** Gestiona fechas de cursos, activación de links de Zoom, subida de materiales, notificaciones y tareas por día. Todo desde un solo lugar.

## Detalles técnicos

- **Patrón:** Front Controller + Router artesanal, MVA (Model-View-Action) sin framework.
- **Stripe:** Dos flujos de pago diferenciados (cursos principales con redirects personalizados y cursos independientes), con environment IDs gestionados vía phpdotenv.
- **Optimización:** Archivos estáticos con Cache-Control público + Expires a 30 días, DEFLATE vía .htaccess, preload de fonts y versionado de assets.
