---
title: Calculadora de retorno de inversión y contacto
description: Calculadora en el navegador que estima cuánto le cuesta a un negocio un proceso manual y compara pago único contra plan mensual, con explicación paso a paso y un formulario de contacto protegido.
seoTitle: "Calculadora de ROI para sitios y sistemas a la medida"
seoDescription: "Calculadora de retorno de inversión en el navegador: pago único o plan mensual, escenarios y explicación paso a paso. Astro, TypeScript, Turnstile y Resend."
publishDate: 2026-10-19
cover: ./assets/images/calculadora-roi-portada.webp
coverAlt: Resultados de la calculadora con las tarjetas de pago único y plan mensual
stack: [Astro, TypeScript, Cloudflare Pages Functions, Cloudflare Turnstile, Resend, Vitest]
status: Online
internalUrl: /roi
repoUrl: https://github.com/cemendez/portafolio
highlights:
    - Cálculo en una función pura con 27 pruebas unitarias
    - Pago único o plan mensual, sin amarrar al cliente
    - Explicación paso a paso de cada cifra
    - Formulario con Turnstile, campo trampa y envío por Resend
    - Función de servidor probada con fetch simulado
featured: false
priority: 3
---

## El problema

Quien contrata un sitio o un sistema a la medida suele comparar precios sin saber cuánto le cuesta hoy no tenerlo: horas de trabajo manual y clientes que se pierden por responder tarde. Del lado de quien cotiza, el problema es parecido: se regala el trabajo y las horas de hosting, soporte y cambios extra no se cobran.

Quería una página que ayudara a decidir con números, que se entendiera sin ser contador y que dijera con claridad qué incluye cada opción.

## La solución

Una página `/roi` donde el visitante elige un servicio, indica horas semanales, costo por hora, clientes perdidos y valor por cliente. La calculadora estima el costo mensual del problema y compara:

- **Pago único:** el precio de lista de una vez.
- **Plan mensual:** 30 % al inicio y 18 mensualidades; al terminar, el sitio pasa al cliente.
- **Mantenimiento opcional:** hosting, dominio y soporte, que se paga cada mes y no está en el precio del sitio.

Muestra tres escenarios (conservador, esperado y optimista), la tabla de lo que se paga a 12, 24 y 36 meses y una sección "Cómo se calculó" con cada cifra explicada. Desde ahí, un botón lleva al formulario de contacto con el servicio ya elegido.

## Decisiones técnicas

- **Cálculo en el navegador.** Son operaciones simples y no hay datos que proteger, así que no hace falta una API: la página responde al instante y funciona sin servidor. Antes había pensado en una API con NestJS; la descarté porque agregaba infraestructura sin aportar nada al usuario.
- **Una función pura y probada.** Toda la lógica vive en `utils/roi.ts`, sin tocar el DOM, y se prueba con Vitest. Así, cambiar un precio o un porcentaje no rompe el resto sin que una prueba lo avise.
- **Supuestos a la vista.** Los porcentajes de eficiencia y recuperación son estimaciones mías, no datos medidos. La página los muestra como supuestos y el resumen es cauteloso: si con el escenario conservador no se recupera la inversión, lo dice.
- **Formulario con Pages Function.** `functions/api/contacto.ts` revisa el origen, el tamaño, un campo trampa para bots, la validación compartida con el navegador y Cloudflare Turnstile; después envía un correo de texto plano con Resend. Los secretos viven en Cloudflare, no en el repositorio.
- **Validación en un solo lugar.** `utils/contacto.ts` se importa tanto en el navegador como en la función, para que las reglas no se desincronicen.
- **Eventos de medición sin datos personales.** Solo se registra qué servicio se calculó y si se llegó a enviar el mensaje.

## Lo que salió mal

- **Mis propios números confundían.** Con el ejemplo por defecto, el mantenimiento de $1,000 al mes se comía casi todo el beneficio conservador y la recuperación salía en 88 meses. No era un error de cálculo, pero una persona sin contexto lo leería como uno. La solución fue explicar cada paso y ajustar el texto del resumen.
- **Turnstile en local.** Fueron tres fallos seguidos: una clave secreta real con la clave pública de pruebas (`invalid-input-response`), un widget sin `localhost` en sus dominios (error 110200) y un archivo `.dev.var` mal nombrado que Wrangler no leía. Desde entonces el README documenta el arreglo.
- **`pnpm dev` no ejecuta las Functions.** El formulario daba 404 hasta que agregué el script `pages:dev` y un aviso claro en modo desarrollo.
- **Un archivo de prueba dentro de `functions/` se habría convertido en ruta.** Todo lo que está ahí se publica, así que las pruebas viven en `tests/`.

## Qué mejoraría

- Medir con datos reales de clientes si los porcentajes de recuperación son razonables y ajustarlos.
- Publicar condiciones de servicio y de cancelación del plan mensual.
- Una imagen de vista previa propia al compartir `/roi`.
- Pruebas de extremo a extremo del formulario con un navegador automatizado, no solo de la función con `fetch` simulado.
