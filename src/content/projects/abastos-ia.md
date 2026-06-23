---
title: "Abastos IA: Plataforma de Voz a Datos para Gestión Comercial y Control de Taras"
description: "Plataforma de procesamiento de lenguaje natural que automatiza el registro de transacciones comerciales y balances de inventario mediante notas de voz en tiempo real con Inteligencia Artificial."
publishDate: "2026-06-12"
image: "./assets/images/abastos-ia.png"
category: "Freelance"
role: "Arquitecto de software y desarrollador principal"
tags: ["Laravel", "PHP 8.3", "OpenAI API (Whisper/GPT)", "JavaScript (MediaRecorder)", "Node.js (Proxy)", "SQL (Conditional Aggregation)", "Vite"]
status: "Privado"
---

## El Desafío

En los entornos caóticos y de alta velocidad de los mercados mayoristas (como la Central de Abastos de la Ciudad de Puebla), los comerciantes y transportistas no disponen de tiempo ni de la ergonomía necesaria para interactuar con pantallas táctiles, formularios complejos o bases de datos manuales. La captura tradicional de transacciones (ventas, compras, cobros) se omite o se posterga, lo que genera una brecha crítica en el control financiero.

El problema se agrava con el control de las **taras** (cajas, huacales o envases de madera y plástico). Al ser activos circulantes con valor comercial, su préstamo, renta o devolución constante a clientes y proveedores representa miles de dólares en pérdidas si no se registran con exactitud matemática.

Técnicamente, el proyecto presentaba tres grandes retos:
1. **Fricción de Captura:** Diseñar una interfaz nativa que permita procesar expresiones coloquiales y estructurarlas con precisión contable.
2. **Restricción de Seguridad del Navegador:** La API de `MediaRecorder` de HTML5 exige contextos seguros (HTTPS) para habilitar el uso del micrófono. Durante el desarrollo y pruebas locales con dispositivos móviles reales en el piso de venta, las conexiones tradicionales HTTP bloquean esta funcionalidad.
3. **Resiliencia ante APIs Externas:** Las llamadas concurrentes a modelos fundacionales (como Whisper y GPT-4o-mini) están propensas a latencias, fallos de red y límites de cuota (*Rate Limits*), los cuales no deben impactar negativamente la experiencia del usuario ni causar pérdida de datos.

---

## La Solución Técnica

Se diseñó e implementó **Abastos IA**, una plataforma web basada en **Laravel 13** y **PHP 8.3** que implementa un pipeline robusto de procesamiento de voz a base de datos relacional. 

### 1. Pipeline de Captura de Audio Multidispositivo (Frontend)
El cliente web utiliza la API nativa de JavaScript `MediaRecorder` con un algoritmo de detección adaptativo (`mejorMimeType`). Este algoritmo consulta al navegador los códecs soportados en tiempo real (`audio/webm`, `audio/mp4`, `audio/ogg` o `audio/wav`), lo que garantiza la compatibilidad cruzada entre dispositivos iOS, Android y de escritorio. Al finalizar la grabación, los fragmentos binarios (*chunks*) se empaquetan en memoria mediante un `Blob`, se inyectan dinámicamente como un objeto `File` en un formulario estándar usando la API de `DataTransfer` y se transmiten de forma asíncrona al backend.

### 2. Normalización de Archivos de Audio y Seguridad (Backend)
Debido a las estrictas restricciones de la API de Whisper (OpenAI) respecto a las extensiones y tipos MIME de los archivos, el controlador `AudioController` implementa un filtro de seguridad basado en la extensión de PHP `fileinfo`. En lugar de confiar en la cabecera provista por el cliente, el backend inspecciona los *magic numbers* del binario para determinar el tipo real del archivo, mapeándolo a un formato válido (como `.m4a` o `.webm`) y renombrándolo antes del envío. Formatos incompatibles de Apple (como AAC nativo de notas de voz de iPhone) son interceptados, notificando al usuario con alternativas claras de grabación.

### 3. Pipeline de Inteligencia Artificial (Whisper + GPT-4o-mini)
Una vez validado el audio, se orquesta un proceso secuencial:
- **Transcripción:** Consumo del modelo `whisper-1` con idioma predefinido en español para mitigar alucinaciones de traducción.
- **Estructuración Estricta (JSON Schema):** Se consume el modelo `gpt-4o-mini` configurado con `response_format => ['type' => 'json_object']`. A través de un system prompt optimizado, se obliga al LLM a comportarse como un serializador contable que mapea la entrada conversacional a un esquema JSON estricto (`tipo_movimiento`, `tipo_persona`, `contacto`, `tara_color`, `tara_cantidad`, `precio_unitario`, etc.).
- **Motor de Reintento con Decaimiento de Tasa (Backoff):** Para evitar fallos por *Rate Limits* de OpenAI, se programó un gestor de excepciones personalizado `esperarSegunRateLimit`. Este extrae las cabeceras HTTP de respuesta (`Retry-After` y `x-ratelimit-reset-*`), calcula el tiempo exacto de espera, detiene la ejecución de manera controlada (`sleep`) y reintenta la petición. Esto asegura una tasa de éxito cercana al 100% incluso bajo cuotas bajas.

### 4. Arquitectura y Optimización SQL a Nivel de Base de Datos
Para soportar miles de registros diarios sin degradar el rendimiento, el cálculo de los saldos de taras y finanzas pendientes por cliente/proveedor se delegó por completo al motor de base de datos a través de **agregación condicional en SQL** utilizando el modelo `Transaccion`:
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

Este diseño evita la carga innecesaria de colecciones masivas en la memoria del servidor de aplicaciones (PHP RAM) y realiza las sumas lógicas en una sola consulta indexada mediante cláusulas selectRaw y havingRaw.

### 5. Infraestructura de Desarrollo: Proxy SSL Inverso Local
Para solventar el requerimiento de HTTPS de la API MediaRecorder en dispositivos móviles locales, se desarrolló un proxy reverso SSL ligero en Node.js (serve-ssl.mjs). Este script carga certificados auto-firmados, escucha peticiones seguras en el puerto 3443 desde la red LAN y las redirecciona hacia el servidor HTTP local de Laravel en el puerto 8000. Gracias a esto, fue posible depurar la aplicación en tiempo real en teléfonos inteligentes físicos dentro de la red del mercado sin recurrir a servicios costosos o de alta latencia como ngrok.