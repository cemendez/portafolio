---
title: "Alpec — E-commerce Multicanal con Gestión de Inventarios y Pagos PayPal"
description: >
  Tienda en línea para velas artesanales con carrito de compras, panel administrativo y pagos PayPal
  en dos modalidades. Hecha a la medida del negocio, no al revés.
publishDate: 2022-02-11
image: "./assets/images/alpec.png"
category: "E-commerce"
role: "Arquitecto de software y desarrollador principal"
tags:
  - Laravel 8
  - PHP 7.4
  - MySQL
  - AdminLTE 3
  - Bootstrap 5
  - PayPal REST API
  - Spatie Permission
  - Jetstream + Fortify
  - Livewire 2
  - JavaScript Vanilla
  - Splide.js
  - Blade Components
status: "Offline"
---
## El Desafío

Una productora de velas artesanales vendía solo en mercados locales. Necesitaban dar el salto a digital, pero no querían una tienda genérica de Shopify —necesitaban algo hecho a su medida: un catálogo visual por categorías, carrito sin registro obligatorio, cobro con PayPal y tarjeta, y un panel donde ellos —sin saber de tecnología— pudieran gestionar todo.

Lo difícil era juntar tres mundos en una sola base de código: una tienda pública bonita, un panel administrativo con permisos, y un sistema de pagos que soportara dos flujos distintos sin depender de suscripciones mensuales a servicios externos.

## Lo que hice

Construí una arquitectura MVC monolítica sobre Laravel 8 con dos temas visuales que conviven en la misma app.

**Storefront público:** Layout con CSS personalizado, slider Splide.js para presentar productos, carrusel Tiny-Slider y carrito persistente en localStorage con JavaScript vanilla. Sin frameworks pesados.

**Panel administrativo:** AdminLTE 3 con Jetstream + Fortify para autenticación, Spatie Permission para roles. Los componentes Livewire de perfil se renderizan anidados dentro del layout de AdminLTE.

**Pagos en dos modalidades:**
- Pago directo con cuenta PayPal (Omnipay `PayPal_Rest` → `purchase()` + `completePurchase()`)
- Pago con tarjeta (PayPal JS SDK → backend valida `order_data`)

El flujo directo crea registros en estado `pending` antes del redirect y los actualiza a `approved` tras el callback, permitiendo rastrear carritos abandonados. Ambos flujos mandan notificaciones por email al administrador y al comprador.

**RBAC y seguridad:** Spatie Permission con middleware por operación CRUD en cada controlador. Sanctum para API tokens, dejando infraestructura lista para expansión. CSRF en todas las rutas POST. El modelo User integra 5 traits: `HasApiTokens`, `HasFactory`, `HasProfilePhoto`, `TwoFactorAuthenticatable` y `HasRoles`.

**Catálogo con precios variables:** Los productos soportan múltiples precios por variante (chico/mediano/grande) mediante una tabla hija `mas_precios`. La lógica de `array_combine()` sincroniza dinámicamente descripciones y precios del formulario.

**Assets organizados:** Las imágenes se almacenan con estructura jerárquica que replica la taxonomía del negocio: `assets/productos/{categoria}/{subcategoria}/`. El sistema crea y limpia directorios al agregar o eliminar registros, sin dejar archivos huérfanos.

### Stack Tecnológico
| Capa | Tecnología |
|---|---|
| Backend | Laravel 8, PHP 7.4, MySQL (MariaDB), Spatie Permission, Omnipay |
| Frontend | AdminLTE 3, Bootstrap 5, JavaScript Vanilla, Splide.js, Tiny-Slider |
| Auth | Jetstream + Fortify + Sanctum + Spatie Roles |
| Build | Laravel Mix 6 (Webpack), Sass |
| Payments | PayPal REST API (Omnipay Redirect + JS SDK Card) |
| Email | Laravel Mail (SMTP) con templates Blade inline |
