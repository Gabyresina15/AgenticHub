---
title: "OpenAI muestra cómo usa GPT-6 para borrar 800.000 líneas de código muerto"
date: 2026-10-17
summary: "Un equipo de OpenAI usó GPT-6 Astra en Codex para limpiar código sin uso y experimentos viejos: más de 1.400 pull requests en dos semanas. Y un modelo más barato logró el 92% de los hallazgos al 14% del costo."
sources:
  - https://developers.openai.com/blog/maintaining-software-with-the-gpt-6-family
tags: [agentes-de-codigo, openai, benchmarks]
---

**Contexto.** Todo proyecto de software acumula "basura" con el tiempo: código que ya nadie usa, experimentos A/B que terminaron pero siguen en el código, flags de configuración olvidados y tests que fallan a veces sin motivo. Limpiar eso es aburrido y riesgoso, porque borrar lo que no debías puede romper producción. Codex es el agente de programación de OpenAI; GPT-6 Astra es su modelo más potente y GPT-6.1 Sol uno más barato.

**Qué pasó.** Un ingeniero del equipo Core Experimentation de OpenAI contó en el blog para desarrolladores cómo lo usaron:

- Con un prompt corto y ambiguo ("ayudame a encontrar y limpiar código muerto, revisá Slack o lo que necesites"), Astra revisó PRs viejos, hilos de Slack, gestores de proyecto y datos de producción para confirmar qué no se usaba.
- Cinco ingenieros, a tiempo parcial durante dos semanas, mergearon más de 1.400 pull requests y borraron más de 800.000 líneas. La imagen de un servicio pasó de 3,31 GB a 1,72 GB (48% menos).
- Astra encontró un flag marcado como "Permanent" que generaba mucho consumo de CPU, pero en vez de borrarlo lo marcó para revisión humana. Al sacarlo, ahorraron un estimado de 0,42% de CPU en ese servicio.
- En una comparación de costos buscando experimentos viejos: Astra (esfuerzo máximo) costó US$109,06 y encontró 142 casos; GPT-6.1 Sol (esfuerzo máximo) costó US$15,12 y encontró 131. Es decir, 92% de los hallazgos al 14% del costo.
- Con otro prompt para optimizar la integración continua, el tiempo mediano de CI bajó de unos 10 minutos a 4,5.

**Cómo leer estos números.** Son resultados internos de OpenAI sobre su propio código, no un benchmark independiente. Lo valioso es el método y la comparación de costo por hallazgo, que cualquiera puede replicar.

**Por qué importa.** La conversación sobre agentes de código suele girar en torno a escribir funciones nuevas. Este caso muestra otro uso con impacto medible: el mantenimiento. Y deja una lección de costos: el modelo más caro no siempre conviene.

**Para builders.** Empezá chico: pedile a un agente que encuentre un solo caso (una función sin uso, un test inestable), que junte evidencia y que abra un PR pequeño. Probá la misma tarea con un modelo barato y uno caro y compará costo por resultado aceptado. Mantené siempre una revisión humana para lo que esté marcado como crítico o permanente.
