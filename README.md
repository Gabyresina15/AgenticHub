# AgenticHub

Backend Node para una academia tecnica y un gateway de agentes. Flutter entra solo por `POST /api/v1/orchestrate`.

## Getting Started

Requisitos: Node 20+, MongoDB local.

```bash
docker run -d --name agentichub-mongo -p 27017:27017 mongo:7
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

`npm run seed` borra las colecciones `topics` y `messages`, y carga temas limpios mas el system prompt de la sesion demo.

Health del proceso: el servidor escucha en `0.0.0.0:3000`.

Ejemplo para Flutter:

```bash
curl -X POST http://localhost:3000/api/v1/orchestrate \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"demo-session","message":"Cotiza 40 horas para el cliente acme"}'
```

Contrato de salida, siempre:

```json
{
  "status": "ok",
  "data": {},
  "agent_used": "commercial",
  "execution_ms": 120
}
```

## Flujo del AgentRouter

El router solo clasifica. No ejecuta herramientas ni redacta la respuesta. El controlador instancia el agente despues.

```mermaid
flowchart TD
  flutter[Flutter POST /api/v1/orchestrate] --> gateway[orchestrator.js]
  gateway --> window[sessionContext: indice 0 + ultimos N]
  gateway --> router[AgentRouter: un token]
  router -->|curator| curator[curatorAgent]
  router -->|commercial| commercial[commercialAgent]
  router -->|general| general[generalAgent]
  commercial --> tools[mockTools + Zod strict]
  curator --> search[buscar_en_internet]
  tools -->|error de esquema| llm[Gemini corrige el JSON]
  search -->|error de esquema| llm
  curator --> contract[sendContract]
  commercial --> contract
  general --> contract
```

Si `OLLAMA_ROUTER_URL` esta definido, el switch usa ese modelo local. Gemini queda para el razonamiento de los sub-agentes. Si Ollama falla, el router vuelve a Gemini.

## Layout nuevo

- `backend/src/prompts/`: system prompts versionados.
- `backend/src/routes/orchestrator.js`: unico gateway de Flutter.
- `backend/src/tools/mockTools.js`: `get_client_data` y `calculate_budget`.
- `backend/seed.js`: reset de historial y temas.

Las rutas de academia (`/api/courses`, `/api/auth`, `/api/lessons`) mantienen su contrato anterior para no romper el frontend React. El contrato estricto aplica a `/api/v1/orchestrate` y `/api/agent/research`.

## Ejecutar codigo de verdad

El reto ya no aprueba por contener un string. `POST /api/v1/execute` compila y corre tests.

```bash
docker run -d --name agentichub-piston --privileged -p 2000:2000 ghcr.io/engineer-man/piston
docker exec agentichub-piston piston ppman install python node go rust java
docker run -d --name agentichub-pg -e POSTGRES_PASSWORD=academy -e POSTGRES_DB=academy -p 5432:5432 pgvector/pgvector:pg16
```

En `.env`: `PISTON_URL=http://127.0.0.1:2000` y `PGVECTOR_URL=postgres://postgres:academy@127.0.0.1:5432/academy`.

`python`, `javascript`, `go`, `rust`, `java`, `c` y `cpp` pasan por Piston. `pgvector` corre en el Postgres sandbox, dentro de una transaccion que siempre hace rollback. La API publica de Piston ya no es libre: el runner tiene que ser propio.


Reemplazar esta URL cuando el pitch este publicado: `https://www.youtube.com/watch?v=VIDEO_PITCH`
