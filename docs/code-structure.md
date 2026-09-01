# BuildPilot code structure

BuildPilot is organized under a single `src/` boundary with two clear application areas: the user-facing web application and the Python backend service.

```text
src/
  web-ui/
    application/     # page/workspace compositions
    components/      # reusable UI grouped by product area
    services/        # HTTP/API clients
    interfaces/      # TypeScript domain contracts
    constants/       # navigation and UI constants
    data/            # temporary synthetic/demo data
    utils/           # UI formatting helpers
    styles/          # shared/global styles

  backend-service/
    backend_service/ # importable Python package
      main.py
      source/
        api/          # FastAPI routers and HTTP boundary
        service/      # business workflows and orchestration
        dal/          # ALL database/persistence concerns
          database/   # schema and seed assets
          db_session.py
          base_dao.py
          ProjectRepository.py
          vector_retrieval.py
          embed_project_documents.py
          sync_neon_to_mongo.py
        rag/          # grounded generation logic; retrieval stays in DAL
        agent/        # agent orchestration
        tools/        # safe tools that call services
        Utils/        # cross-cutting backend helpers
        tests/        # backend tests
```

## Database boundary

Anything that directly talks to PostgreSQL, Neon, MongoDB, database sessions, repositories, persistence schemas, seed data, database retries, embeddings stored in a database, or synchronization between databases belongs under `src/backend-service/backend_service/source/dal/`.

Rules:
- API handlers never contain SQL.
- Services never open database connections directly.
- Agent code never queries a database directly.
- Agent tools call application services.
- Services call DAL repositories/adapters.
- Database migrations/schema/seed assets live inside DAL.
- External API clients that do not persist/query data may live outside DAL in a dedicated integration layer when introduced.

## Frontend boundary

All product UI code belongs under `src/web-ui/`. Next.js `app/` remains only as the framework routing/bootstrap layer and imports the real UI from `src/web-ui/`.

Rules:
- Product screens are composed under `web-ui/application`.
- Reusable UI lives under `web-ui/components`.
- Network requests live under `web-ui/services`.
- Domain interfaces live under `web-ui/interfaces`.
- React components do not contain backend/database logic.

## Deployment adapters

The root `app/` and `api/` folders remain intentionally thin because Next.js and Vercel use them as deployment/routing entrypoints. They are not product implementation folders.

The backend remains Python only. The GMS source is used only to understand structure and business flow; BuildPilot remains an independent implementation.
