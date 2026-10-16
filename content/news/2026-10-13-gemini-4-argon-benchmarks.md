---
title: "Gemini 4 Argon: el nuevo modelo de Google y qué dicen sus benchmarks"
date: 2026-10-13
summary: "Google lanzó Gemini 4 Argon, su nuevo modelo de frontera, con resultados que lideran varios benchmarks pero no todos. Te explicamos cómo leer esos números."
sources:
  - https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-argon/
  - https://deepmind.google/models/model-cards/gemini-4-argon/
  - https://arcprize.org/results/google-gemini-4-argon
tags: [google, gemini, modelos, benchmarks]
---

## Contexto

Cada vez que sale un modelo de IA nuevo, la empresa publica una tabla de **benchmarks**: exámenes estandarizados que miden qué tan bien resuelve ciertas tareas (programar, razonar, usar una computadora, etc.). Sirven para comparar, pero conviene leerlos con cuidado: cada test mide algo puntual y muchas veces los resultados los informa la propia empresa.

## Qué pasó

El 13 de octubre de 2026 Google lanzó **Gemini 4 Argon**, su nuevo modelo de frontera (o sea, de los más potentes del mercado). Está disponible por API en AI Studio, en la app de Gemini para suscriptores Pro y Ultra, y en Google Antigravity, su entorno de programación con agentes. El precio de lanzamiento es de US$2 por millón de tokens de entrada y US$10 por millón de salida hasta el 30 de noviembre; después sube a US$4 y US$20. Tiene una ventana de 1 millón de tokens entre entrada y salida.

Según la *model card* (la ficha técnica oficial), Argon lidera el Vals Index, que mide desempeño en finanzas, legales, impuestos y código, con 68,9% contra 67,0% de Claude Opus 5.5. También gana en AutomationBench y DeepSWE v1.1. Pero no gana en todo: en Terminal-bench 4.0 saca 57,4% frente a 66,4% de Claude Opus 5.5, y en FrontierSWE v2 queda en 55,0% frente a 65,5% de GPT-6 Astra.

Hay además una medición independiente: la ARC Prize Foundation, que hace tests de razonamiento abstracto, informó que Argon logró 98,5% en ARC-AGI-1 y más de 91% en ARC-AGI-2 con razonamiento alto.

## Por qué importa

La carrera entre Google, OpenAI y Anthropic sigue muy pareja: ningún modelo gana en todos los frentes. Google también destaca que Argon es más resistente a la **inyección de prompts** (instrucciones maliciosas escondidas en páginas o mails que un agente lee), algo clave cuando los agentes navegan la web.

## Ángulo práctico para builders

- **No elijas modelo solo por la tabla**: armá tu propio set de pruebas con tareas reales de tu proyecto.
- **Ojo con el precio de lanzamiento**: si probás ahora, calculá costos con la tarifa que rige desde diciembre.
- **Mirá el benchmark que se parece a tu caso**: para agentes de terminal, Terminal-bench pesa más que un índice general.
