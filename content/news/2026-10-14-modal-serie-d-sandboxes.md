---
title: "Modal levanta US$750 millones: la infraestructura para agentes se vuelve un gran negocio"
date: 2026-10-14
summary: "Modal, una nube para correr código y modelos de IA, levantó una Serie D de US$750 millones con una valuación de US$15.750 millones y superó los US$1.000 millones de ingresos anualizados."
sources:
  - https://modal.com/blog/1-billion-annualized-run-rate-series-d
  - https://siliconangle.com/2026/10/14/ai-cloud-startup-modal-raises-750m-at-15-75b-valuation/
tags: [inversion, infraestructura, sandboxes, agentes]
---

## Contexto

Cuando un agente de IA escribe código, ese código tiene que correr en algún lado. Hacerlo en tu propia computadora o en tus servidores es riesgoso. Por eso existen los **sandboxes**: entornos aislados, como cajas cerradas, donde el agente puede ejecutar cosas sin tocar nada más.

**Modal** es una empresa de nube pensada para IA: alquila GPUs (los chips que entrenan y corren modelos), sirve modelos y ofrece sandboxes.

## Qué pasó

El 14 de octubre de 2026, el CEO de Modal, Erik Bernhardsson, anunció una ronda **Serie D** (una etapa avanzada de financiamiento) de **US$750 millones**, con una valuación de **US$15.750 millones**. La lideró Accel, se sumó Kleiner Perkins y participaron todos los inversores anteriores.

La empresa dijo que superó los **US$1.000 millones de run rate**, es decir, lo que facturaría en un año al ritmo actual. Su uso se triplicó en los cinco meses desde la ronda anterior y creció más de 15 veces en un año. Según SiliconANGLE, la valuación más que se triplicó desde mayo.

El dato más interesante para quien arma agentes: los sandboxes solos ya son un producto de **US$300 millones** de run rate. Modal dice que creó cerca de 3.000 millones de sandboxes y que pueden escalar hasta un millón en simultáneo.

## Por qué importa

Muestra que la "capa de abajo" de los agentes, la infraestructura donde ejecutan código, se convirtió en un negocio enorme. Empresas como Cognition, Ramp y Linear usan Modal para sus agentes en segundo plano. También confirma que los inversores apuestan fuerte por quienes venden "picos y palas" en la fiebre de la IA.

## Ángulo práctico para builders

- **No reinventes la rueda**: antes de armar tu propia infraestructura de sandboxes, evaluá servicios existentes.
- **Pensá en escala**: si tu sistema va a correr muchos agentes en paralelo, cada uno necesita su entorno aislado.
- **Cuidá las credenciales**: SiliconANGLE describe una función de Modal que deja a los agentes usar credenciales sin verlas. Es una buena idea para copiar, uses la herramienta que uses.
