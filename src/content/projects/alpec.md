---
title: "Alpec — E-commerce Multicanal con Gestión de Inventarios y Pagos PayPal"
description: >
  Plataforma completa de comercio electrónico para velas artesanales con carrito de compras,
  panel administrativo RBAC y procesamiento de pagos PayPal en dos modalidades.
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
Una PyME productora de velas artesanales necesitaba migrar sus ventas del canal presencial
(mercados locales) a un canal digital funcional, con requerimientos muy específicos:
- Un catálogo visual atractivo con imágenes por categoría y subcategoría.
- Un carrito de compras persistente en `localStorage` accesible sin registro.
- Capacidad de cobrar tanto con cuenta PayPal como con tarjeta de crédito/débito.
- Un panel administrativo donde el equipo, sin conocimientos técnicos, pudiera gestionar catálogo, inventario, roles de usuario y consultar pagos entrantes.
El reto principal era articular **tres ecosistemas en una sola base de código**:
un storefront público, un panel administrativo con control de acceso granular basado en roles, y un sistema de pagos que soportara dos flujos de cobro distintos sin depender de suscripciones mensuales a SaaS de terceros.

## La Solución Técnica

### Arquitectura General
Se implementó una arquitectura MVC monolítica sobre Laravel 8 con dos temas visuales independientes que conviven en la misma aplicación.
**Storefront público**: Layout propio con estilos CSS personalizados, slider Splide.js, carrusel de productos Tiny-Slider y carrito vía localStorage + JavaScript vanilla.
**Panel administrativo**: AdminLTE 3 como shell de layout, Jetstream + Fortify como backend de autenticación y Spatie Permission para RBAC. Los componentes Livewire de perfil de Jetstream se renderizan anidados dentro del layout de AdminLTE.

### Procesamiento de Pagos (Doble Flujo)

Se implementaron dos modalidades de cobro usando PayPal REST:

- **Pago directo**: Omnipay `PayPal_Rest` → `purchase()` + `completePurchase()` en `PaymentController`. 
- **Pago con tarjeta**: PayPal JS SDK → `onApprove()` → backend valida `order_data` en `PaymentCardController`

El flujo de pago directo crea registros de compra en estado `pending` antes del redirect y los actualiza a `approved` tras el callback, permitiendo rastrear carritos abandonados. El flujo de pago con tarjeta recibe el objeto ya autorizado desde el frontend y lo persiste directamente. Ambos flujos disparan notificaciones por email al administrador y al comprador.

### RBAC y Seguridad

- Spatie Permission con middleware por operación CRUD en cada controlador.
- Jetstream + Fortify para autenticación con two-factor y confirmación de password.
- Sanctum para API tokens, dejando la infraestructura lista para expansión.
- CSRF protegido en todas las rutas POST.
- El modelo `User` integra 5 traits simultáneamente: `HasApiTokens`, `HasFactory`, `HasProfilePhoto`, `TwoFactorAuthenticatable` y `HasRoles`.

### Gestión de Catálogo con Precios Variables

Los productos soportan precios múltiples por variante (ej. tamaño chico/mediano/grande) mediante una tabla hija `mas_precios`. La lógica de `array_combine()` sincroniza dinámicamente los arrays de descripciones y precios del formulario.

### Organización de Assets
Las imágenes se almacenan con estructura jerárquica que replica la taxonomía del negocio:
`assets/productos/{categoria}/{subcategoria}/`. Los controladores manejan creación y limpieza de directorios al agregar o eliminar registros, garantizando que no queden archivos huérfanos.

### Decisiones Técnicas Relevantes

- **Desnormalización controlada**: La tabla `payments_buys` almacena nombre y precio del producto como snapshot para preservar el histórico aunque el catálogo cambie.
- **Uso de JavaScript Vanilla y librerías ligeras**: El frontend público usa JavaScript vanilla con Splide.js y Tiny-Slider, evitando sobrecarga de librerías para el usuario final.
- **Livewire en modo híbrido**: Solo se usa para los componentes de perfil de Jetstream; el resto de la interacción del admin es JavaScript vanilla + Bootstrap 5.
### Stack Tecnológico
| Capa | Tecnología |
|---|---|
| Backend | Laravel 8, PHP 7.4, MySQL (MariaDB), Spatie Permission, Omnipay |
| Frontend | AdminLTE 3, Bootstrap 5, JavaScript Vanilla, Splide.js, Tiny-Slider |
| Auth | Jetstream + Fortify + Sanctum + Spatie Roles |
| Build | Laravel Mix 6 (Webpack), Sass |
| Payments | PayPal REST API (Omnipay Redirect + JS SDK Card) |
| Email | Laravel Mail (SMTP) con templates Blade inline |