---
title: "Sistema de Pago del Impuesto Predial — San Andrés Cholula"
description: "Plataforma transaccional que digitalizó el ciclo completo de consulta, cálculo y pago del impuesto predial para 200,000+ cuentas catastrales, eliminando filas presenciales y reduciendo morosidad municipal."
publishDate: "2021-01-01"
image: "./assets/images/predial-sach.png"
category: "Gobierno"
role: "Arquitecto de Software / Full-Stack Developer"
tags: ["PHP", "SQL Server", "jQuery", "Apache", "Bootstrap", "AdquiraCloud"]
status: "Offline"
---

## El Desafío

El **Ayuntamiento de San Andrés Cholula, Puebla**, enfrentaba un problema crítico: miles de contribuyentes saturaban las ventanillas de recaudación para consultar y pagar el impuesto predial y servicio de limpia. El proceso era en gran parte presencial ya que la opción de pago en línea era muy limitada. Esto generaba largas filas, errores en el cálculo manual de recargos y multas, y una baja recaudación por deserción de contribuyentes.

**Problemas clave:**
- Cálculo complejo de actualizaciones.
- Rezago de adeudos acumulados por múltiples ejercicios fiscales, cada uno con su propia tasa de recargos y multas.
- Sincronización manual entre el sistema catastral y el sistema de ingresos.
- Procesamiento de pagos sin integración bancaria directa.

## La Solucion Tecnica

Se diseñó y desarrolló un sistema web transaccional que cubre el ciclo completo: consulta de adeudo, cálculo de impuestos actualizados, integración con pasarela de pagos y generación automática de recibos oficiales.

### Modulos del Sistema

| Modulo | Funcion |
|--------|---------|
| **Consulta de cuenta** | Búsqueda por número de cuenta urbana/rústica con validación de estado |
| **Motor de cálculo fiscal** | Algoritmo que actualiza impuestos históricos aplicando recargos, multas y descuentos progresivos |
| **Confirmación y pago** | Captura de datos de contacto, redirección a pasarela AdquiraCloud-Bancomer |
| **Post-pago** | Recepción de confirmación, actualización de adeudos en ambas BDs, generación de recibo de ingresos |
| **Estado de cuenta** | Reporte detallado imprimible con desglose por ejercicio fiscal |

### Complejidad Técnica

**1. Motor de actualización fiscal por INPC**
El motor del sistema es un algoritmo que toma el impuesto base de cada ejercicio fiscal y lo actualiza al valor presente usando el INPC oficial. La lógica considera:
- Tasa de recargos variable por ejercicio (DNRECAR vs DNRECARA para cuentas notificadas)
- Cálculo de multas progresivas escalonadas por rango de impuesto (desde $67 hasta 10% del impuesto)
- Descuentos simultáneos en recargos y multas segun la periodicidad de pago
- Monto mínimo de pago ($175 MXN) que funciona como piso fiscal

**2. Arquitectura de doble base de datos**
El sistema opera sobre dos bases SQL Server interconectadas:
- **EGOBCPC**: Datos maestros de catastro, cuentas prediales, histórico de adeudos por año, tabla de INPC
- **EGOBSCI**: Registro de contribuyentes, recibos de ingresos, detalle contable de cada pago

La sincronización entre ambas se logra mediante transacciones distribuidas con sentencias `USE [database]` explícitas, manteniendo la consistencia en el mismo pool de conexión.

**3. Seguridad y protección de datos**
- Tokenización CSRF por sesión con hash SHA-256
- Validación de entrada con expresiones regulares estrictas
- Consultas parametrizadas contra SQL Server (prevención de inyección SQL)
- Archivo `.htaccess` con protección por password en el directorio de configuración
- Bloqueo de navegación de directorios

**4. Integración con pasarela de pagos**
El sistema se integra con AdquiraCloud mediante POST sincrono. El flujo incluye:
- Generación de referencias únicas de pago
- Recepción de confirmación vía POST con `s_transm`, `c_referencia` y `t_importe`
- Validación y conciliación automática contra las tablas de adeudo
- Creación instantánea del recibo de ingresos en EGOBSCI

**5. Infraestructura SSL — Certificado en servidor privado con redirección desde VPS**

Uno de los retos más complejos del proyecto fue cumplir el requisito de **Bancomer**: el dominio desde el cuál se enviaban las peticiones de pago debía contar con SSL sí o sí.

La infraestructura del ayuntamiento estaba segmentada:
- Un **VPS en la nube** generaba el subdominio público (`predial.sach.gob.mx`).
- Ese subdominio **redirigía el tráfico** hacia los servidores privados del ayuntamiento, donde el sistema estaba alojado por seguridad.
- El certificado SSL del dominio principal (`sach.gob.mx`) **no podía reutilizarse**, ya que la generación del CSR y validación del dominio apuntaban al VPS, no al servidor interno.

La solución fue:
1. Generar un **certificado autofirmado en el servidor privado** del ayuntamiento.
2. Configurar Apache en el servidor privado para servir el sistema **exclusivamente por HTTPS** con ese certificado.
3. El VPS actuaba como **proxy inverso** (redirección a nivel de subdominio) hacia el servidor privado.
4. Cuando el VPS redirigía `predial.sach.gob.mx` al servidor interno, la conexión **heredaba el SSL** del servidor privado, manteniendo el canal cifrado de extremo a extremo.

El resultado fue un canal de pago seguro que cumplió la auditoría de Bancomer sin depender del certificado del dominio principal.

### Stack Tecnológico

| Componente | Tecnología | Propósito |
|-----------|-----------|-----------|
| Frontend | HTML5, CSS3, jQuery 3, Bootstrap 4 | Interfaz de usuario responsiva |
| Backend | PHP 7.4 nativo | Lógica de negocio y cálculos fiscales |
| Base de datos | SQL Server 2019 (2 BDs: EGOBCPC + EGOBSCI) | Datos catastrales y contables |
| Servidor web | Apache 2.4 + mod_rewrite | Hosting y URL rewriting |
| Pasarela de pagos | AdquiraCloud | Procesamiento de pagos en línea |

## Impacto

- **Digitalización** del proceso de pago predial para +200,000 cuentas catastrales.
- **Eliminación** de filas presenciales en ventanilla de recaudación.
- **Cálculo automático** de actualización por INPC, recargos y multas sin intervención humana.
- **Reducción de morosidad** al facilitar el pago de ejercicios anteriores con descuentos.
- **Automatización** de la generación de recibos de ingresos y conciliación contable.
