---
title: "Replit pone a OpenAI como modelo por defecto y relega a Anthropic"
date: 2026-10-17
summary: "El CEO de Replit dijo que GPT pasa a ser el motor por defecto de su agente de programación por costo, alianza y rendimiento. Claude sigue disponible, pero ya no es la opción que usa la mayoría."
sources:
  - https://techcrunch.com/2026/10/17/replit-is-no-longer-working-with-anthropic-ceo-says/
tags: [agentes-de-codigo, openai, anthropic]
---

**Contexto.** Replit es una plataforma para programar y publicar apps desde el navegador. Su producto estrella, Replit Agent, arma aplicaciones a partir de instrucciones en lenguaje natural (lo que se conoce como *vibe coding*). Por dentro, ese agente no tiene un "cerebro" propio: usa modelos de terceros, y durante años el principal fue Claude, de Anthropic. Replit llegó a ser uno de los cinco clientes más grandes de Anthropic.

**Qué pasó.** En TechCrunch Disrupt, el CEO Amjad Masad dijo que Replit dejó de trabajar con Anthropic. Después aclaró: los modelos de Claude siguen disponibles en la plataforma, pero ahora el modelo **por defecto** es el de OpenAI. Masad explicó que fue una decisión "por costo, alianza y rendimiento" y que en su benchmark interno y en uno público los modelos Sol y Astra de OpenAI rinden mejor armando apps desde cero. Fuentes cercanas a Anthropic le dijeron a TechCrunch que la alianza sigue vigente. Masad también contó que los contratos empresariales pasaron de ~2% de los ingresos el año pasado a ~15% este año, y que más de la mitad de sus ingresos ya es B2B.

**Por qué importa.** Cambiar el valor por defecto parece un detalle, pero casi nadie lo toca: la mayoría de los usuarios se queda con lo que viene configurado. Por eso este cambio puede mover mucho gasto de Anthropic a OpenAI. Además muestra que, para las empresas que construyen sobre modelos, el proveedor es intercambiable y se elige por precio y benchmarks propios.

**Para builders.** Diseñá tu producto para poder cambiar de modelo sin reescribir todo: una capa que abstraiga al proveedor, tus propios tests de calidad con casos reales y una medición de costo por tarea terminada. Así la decisión la tomás con datos, como hizo Replit.
