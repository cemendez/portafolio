---
title: "Sistema de Pago del Impuesto Predial — San Andrés Cholula"
description: "Digitalicé el pago predial para más de 200,000 cuentas catastrales. La gente dejó de hacer filas y el municipio redujo la morosidad."
publishDate: "2021-01-01"
image: "./assets/images/predial-sach.png"
category: "Gobierno"
role: "Arquitecto de Software / Full-Stack Developer"
tags: ["PHP", "SQL Server", "jQuery", "Apache", "Bootstrap", "AdquiraCloud"]
status: "Offline"
---

## El Desafío

San Andrés Cholula crecía rápido, pero pagar el predial seguía siendo como en los 90: ir al municipio, hacer fila, que te calcularan a mano los recargos y esperar a que alguien encontrara tu cuenta en el sistema. La gente prefería no pagar a perder medio día en eso.

El sistema en línea que existía era limitadísimo: no calculaba actualizaciones, no manejaba ejercicios anteriores, no se integraba con el banco. Y atrás había dos bases de datos SQL Server que no se hablaban entre sí.

## Lo que hice

Construí un sistema web que cubría el ciclo completo: consulta de adeudo, cálculo actualizado, pago en línea y recibo oficial.

**Motor de cálculo fiscal:** El corazón del sistema es un algoritmo que toma el impuesto base de cada año y lo actualiza al valor presente usando el INPC oficial. Considera:
- Tasas de recargos variables por ejercicio fiscal
- Multas progresivas escalonadas por rango de impuesto (desde $67 hasta 10%)
- Descuentos simultáneos en recargos y multas según la periodicidad
- Monto mínimo de pago de $175 MXN como piso fiscal

**Dos bases de datos, una sola transacción:** El sistema opera sobre dos SQL Server interconectadas (EGOBCPC para catastro, EGOBSCI para contabilidad). La sincronización se logró con transacciones distribuidas usando sentencias `USE [database]` explícitas, manteniendo consistencia en el mismo pool de conexión.

**Seguridad:** Tokenización CSRF por sesión con SHA-256, validación de entrada con regex, consultas parametrizadas, protección por password en configuración y bloqueo de navegación de directorios.

**Integración con Bancomer vía AdquiraCloud:** El sistema genera referencias únicas de pago, redirige a la pasarela y recibe la confirmación vía POST. Al instante se actualizan ambas bases de datos y se genera el recibo oficial.

**El problema del SSL:** Bancomer exigía HTTPS. El municipio tenía su servidor en una red privada, no en la nube. La solución fue un proxy: un VPS público redirigía el tráfico al servidor interno, que tenía un certificado autofirmado. El canal quedó cifrado de extremo a extremo y Bancomer lo aceptó.

## Impacto

- **+200,000 cuentas catastrales** digitalizadas.
- **Cero filas** en ventanilla para consulta y pago.
- **Cálculo automático** de actualización por INPC, recargos y multas.
- **Reducción de morosidad** al facilitar el pago de ejercicios anteriores con descuentos.
- Recibos y conciliación contable generados automáticamente.
