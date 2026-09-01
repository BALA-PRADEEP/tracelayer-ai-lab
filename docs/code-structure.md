# BuildPilot code structure

BuildPilot follows two proven organizational patterns from the supplied GMS Cloud source while remaining an independent implementation.

## Backend

The Python backend follows the shape of `gmscloud-external-services`:

```text
backend/
  main.py
  source/
    api/        # FastAPI routers and request/response boundary
    service/    # business workflows and orchestration
    dal/        # repositories, database sessions, persistence models
    dao/        # shared data-access behavior such as retries
    Utils/      # cross-cutting helpers
    agent/      # agent orchestration; added behind services
    tools/      # safe agent tools that call service methods
    tests/      # backend tests

api/            # thin Vercel deployment entrypoints only
```

Rules:
- Python only for backend code.
- API handlers do not contain SQL or business workflows.
- Services own business behavior.
- Repositories own database access.
- Agent tools call services; agents never query PostgreSQL directly.
- Deployment-specific files stay thin.

## Frontend

The frontend adapts the organizational ideas in `gmscloud-tenant-web` to Next.js instead of copying its CRA/router setup:

```text
app/            # Next.js routes and root layout only
src/
  components/   # reusable UI grouped by product area
  pages/        # page/workspace compositions
  services/     # HTTP/API clients
  hooks/        # reusable React hooks
  contexts/     # shared application context
  store/        # client state when needed
  constants/    # navigation, feature constants
  data/         # temporary mock/demo data only
  interfaces/   # TypeScript domain contracts
  utils/        # formatting and small helpers
  styles/       # feature/shared styles as the UI grows
```

Rules:
- `app/` stays thin; product UI belongs in `src/`.
- Pages compose components; they do not become giant all-in-one files.
- Network requests live in `services/`, not React components.
- Domain types live in `interfaces/`.
- Components are grouped by user-facing product area, not technical implementation detail.

## Reference boundary

The GMS source is used only to understand application structure and business flow. BuildPilot remains an independently designed product. The restored tn9 database is private reference/source data and is not exposed directly through the public application.
