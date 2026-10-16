---
title: "Meta libera Muse Spark Open, un modelo abierto que corre en dos Mac Studio"
date: 2026-10-15
summary: "Meta publicó los pesos de Muse Spark Open, un modelo de 816.000 millones de parámetros pensado para programar y para agentes, que se puede correr localmente en dos Mac Studio con M5 Ultra."
sources:
  - https://research.meta.ai/blog/muse-spark-open
tags: [meta, open-weights, modelos, agentes, local]
---

## Contexto

Hay dos grandes formas de usar un modelo de IA. Con los modelos **cerrados**, accedés solo a través de la API de la empresa. Con los modelos de **pesos abiertos** (*open-weight*), podés descargar los "pesos", es decir, los números que el modelo aprendió durante el entrenamiento, y correrlo en tu propio hardware.

Los **parámetros** miden el tamaño de un modelo. Muchos modelos modernos usan una arquitectura donde solo una parte de esos parámetros se "activa" para cada token (cada pedacito de texto), lo que lo hace más eficiente.

## Qué pasó

El 15 de octubre de 2026 Meta publicó **Muse Spark Open**, al que presenta como el modelo abierto estadounidense más capaz hasta la fecha. Tiene **816.000 millones de parámetros en total, de los cuales se activan 42.000 millones**, entiende texto e imágenes y tiene una ventana de contexto de **1 millón de tokens**. Meta dice que está pensado para programar, para trabajo con agentes y para tareas largas de varios pasos.

La novedad llamativa: se puede correr en un escritorio, usando **dos Mac Studio con chip M5 Ultra** conectadas, con el framework MLX de Apple. Cada máquina tiene hasta 512 GB de memoria unificada, así que entre las dos alcanzan para cargar todo el modelo.

Además se puede usar por API en proveedores como Together AI, Fireworks, Groq, Modal y OpenRouter, y los pesos están en Hugging Face. La licencia, la Muse Model License, tiene **condiciones comerciales limitadas**, aunque según Meta permite que muchos desarrolladores lo usen gratis.

## Por qué importa

Hasta ahora, los modelos más potentes para agentes eran casi todos cerrados. Un modelo abierto fuerte da más **control**: podés correrlo sin mandar datos a terceros, ajustarlo a tu caso y no depender de las decisiones de un solo proveedor.

## Ángulo práctico para builders

- **Leé la licencia** antes de usarlo en un producto comercial.
- **Probalo por API primero**: es más barato que comprar hardware, y te sirve para comparar con tu modelo actual.
- **Sumá una capa de abstracción**: si tu código usa una API compatible con OpenAI, cambiar entre modelos abiertos y cerrados es mucho más simple.
