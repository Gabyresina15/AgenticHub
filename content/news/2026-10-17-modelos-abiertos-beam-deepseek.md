---
title: "Dos modelos abiertos para programar: Reflection Beam y la actualización de DeepSeek V4.1 Flash"
date: 2026-10-17
summary: "Reflection publicó los pesos de Beam, un modelo de 501.000 millones de parámetros bajo licencia Apache 2.0, y DeepSeek actualizó V4.1 Flash con mejoras fuertes en sus propios benchmarks. Te explicamos cómo leer esos números."
sources:
  - https://huggingface.co/blog/reflection-beam
  - https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
  - https://ridgebench.com/news/deepseek-flash-1017
tags: [modelos, open-source, benchmarks]
---

**Contexto.** Un modelo "abierto" (*open-weight*) es uno cuyos pesos, es decir, el modelo entrenado en sí, se pueden descargar y correr en tus propios servidores. Eso da control y privacidad, pero exige hardware potente. Muchos de estos modelos usan una arquitectura llamada *mixture of experts* (MoE): tienen muchísimos parámetros en total, pero para cada palabra solo se activa una parte chica, así que responden rápido aunque ocupen mucha memoria.

**Qué pasó con Beam.** Reflection, un laboratorio nuevo de EE.UU., publicó en Hugging Face su primer modelo, Beam:

- 501.000 millones de parámetros en total, 23.000 millones activos por palabra, y ventana de contexto de 1 millón de tokens.
- Licencia Apache 2.0, que permite uso comercial, modificación y redistribución sin vueltas.
- Está pensado para programar y para agentes. En los benchmarks que dio Reflection: 81,6% en SWE-bench Verified (resolver issues reales de GitHub), 80,1% en Terminal-Bench 2.1 (tareas en una terminal) y 90,6% en GPQA Diamond (preguntas de ciencia de nivel posgrado).
- Para servirlo hace falta hardware serio: por ejemplo, cuatro GPU B200 de NVIDIA para tener margen con contextos largos.

**Qué pasó con DeepSeek.** El 17 de octubre, la empresa china DeepSeek reemplazó su modelo Flash por la versión V4.1-Flash-1017, al mismo precio y con pesos bajo licencia MIT. Según la tabla de DeepSeek, Terminal-Bench 4.0 pasó de 31,2 a 42,3; DeepSWE, de 74,2 a 77,0; y Humanity's Last Exam sin herramientas, de 36,8 a 42,6.

**Cómo leer estos números.** Todos los puntajes de arriba los reporta la propia empresa. El sitio de rankings Ridge señala que todavía nadie midió de forma independiente la versión 1017, y que el mismo benchmark da resultados muy distintos según el "harness" (el programa que conecta al modelo con las herramientas). Por ejemplo, para la versión de septiembre, DeepSeek reportó 31,2 en Terminal-Bench 4.0 y el evaluador independiente Vals midió 19,7. Regla práctica: un puntaje del fabricante es una promesa; uno independiente, un dato.

**Por qué importa.** Los modelos abiertos se acercan a los cerrados en tareas de programación, y con licencias cada vez más permisivas. Para empresas que no pueden mandar su código a una API externa, eso abre opciones reales.

**Para builders.** No necesitás un cluster de GPU para probarlos: Beam está en Inference Providers de Hugging Face y DeepSeek en su API. Armá 5 o 10 tareas reales de tu proyecto y corrélas con dos o tres modelos. Ese test propio vale más que cualquier tabla.
