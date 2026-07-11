---
title: "Abastos IA: Plataforma de Voz a Datos para Gestión Comercial y Control de Taras"
description: "Un comerciante en la Central de Abastos no puede parar para capturar datos. Le diseñé un sistema que entiende su voz y lo registra todo."
publishDate: "2026-06-12"
image: "./assets/images/abastos-ia.png"
category: "Freelance"
role: "Arquitecto de software y desarrollador principal"
tags: ["Laravel", "PHP 8.3", "OpenAI API (Whisper/GPT)", "JavaScript (MediaRecorder)", "Node.js (Proxy)", "SQL (Conditional Aggregation)", "Vite"]
status: "Privado"
---

## El Desafío

En la Central de Abastos de Puebla, los comerciantes y transportistas no tienen tiempo para estar picándole a una pantalla. Están descargando mercancía, cobrando, moviendo taras (cajas, huacales, envases) valuadas en miles de dólares. Capturar una venta o un préstamo de taras implica abrir un sistema, llenar formularios, seleccionar opciones. Cosas que simplemente no pasan en el ajetreo del día.

El resultado: transacciones sin registrar, taras que se pierden, dinero que no se cobra.

El reto técnico tenía tres filos:
1. Cero fricción — el comerciante no va a escribir nada, mucho menos navegar menús.
2. El navegador no deja usar el micrófono sin HTTPS, pero durante el desarrollo estábamos en redes locales.
3. OpenAI tiene rate limits, latencia, y de repente se cae — el sistema no puede fallar por eso.

## La solución

Construí **Abastos IA**, una plataforma Laravel que convierte voz en registros de base de datos. El flujo es simple: el comerciante graba un audio diciendo algo como "préstamo de 5 cajas rojas a don Toño", y el sistema lo transcribe, lo estructura y lo guarda.

**Captura de audio que funciona donde sea:** El frontend usa `MediaRecorder` de JavaScript, con un algoritmo que detecta el formato que soporta cada navegador (webm, mp4, ogg, wav). Funciona en iPhone, Android y computadora. Cuando termina la grabación, el audio se empaqueta y se envía al servidor sin recargar la página.

**Validación del lado del servidor:** Como Whisper de OpenAI es exigente con los formatos, el backend no confía en lo que el navegador dice que es el archivo. Inspecciona los bytes reales del binario (magic numbers) para saber si es realmente m4a, webm, etc. Si alguien sube un audio de iPhone en formato AAC, el sistema lo detecta y pide grabarlo de nuevo.

**Pipeline de IA con Whisper + GPT-4o-mini:** Primero Whisper transcribe el audio a texto. Luego GPT-4o-mini toma ese texto y lo convierte en un JSON estructurado: tipo de movimiento, persona, cantidad, precio. Todo esto con un system prompt que lo obliga a comportarse como un contador, no como un chatbot.

**Reintentos inteligentes:** Cada llamada a OpenAI puede fallar por rate limit. Programé un gestor de excepciones que lee las cabeceras HTTP de respuesta (Retry-After), calcula cuánto esperar y reintenta automáticamente. Tasa de éxito: prácticamente 100%.

**SQL que hace el trabajo pesado:** Con miles de transacciones diarias, no podía cargar todo en memoria PHP para calcular saldos. Diseñé una consulta con agregación condicional que calcula en una sola pasada el saldo de taras y dinero pendiente por cliente:
```sql
SELECT 
    contacto,
    SUM(CASE WHEN tipo_movimiento IN ('prestamo_tara', 'renta_tara') THEN tara_cantidad 
             WHEN tipo_movimiento = 'devolucion_tara' THEN -tara_cantidad 
             ELSE 0 END) as saldo_taras,
    SUM(CASE WHEN tipo_movimiento IN ('renta_tara', 'venta') AND estado_pago = 'pendiente' THEN COALESCE(precio_total, 0) 
             ELSE 0 END) as saldo_dinero
FROM transaccions
GROUP BY contacto
HAVING saldo_taras != 0 OR saldo_dinero != 0;
```

**Proxy SSL casero para desarrollo:** Como MediaRecorder exige HTTPS y estábamos en redes locales, armé un proxy reverso con Node.js que sirve certificados auto-firmados desde la LAN. Así pudimos probar en teléfonos reales dentro del mercado sin pagar servicios como ngrok.
