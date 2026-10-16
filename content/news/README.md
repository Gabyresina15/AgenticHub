# Noticias de IA

Cada archivo `.md` de esta carpeta se publica automáticamente en `/news` al
compilar el frontend (`npm run build` en `frontend/`).

- Nombre de archivo: `YYYY-MM-DD-slug.md` (slug en minúsculas, kebab-case, ASCII).
- La fecha del nombre debe coincidir con `date` del frontmatter.
- Un archivo inválido hace fallar el build y los tests indicando el archivo.

Ejemplo de frontmatter:

```markdown
---
title: "Título de la noticia"
date: 2026-10-16
summary: "Resumen breve en una o dos frases."
sources:
  - https://ejemplo.com/articulo-original
tags: [modelos, open-source]
---

Cuerpo en **Markdown**. El HTML crudo no se renderiza.
```

Este README no se publica (solo se procesan archivos con el formato de nombre).
