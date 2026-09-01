from datetime import datetime, timezone

from fastapi import FastAPI

from backend_service.source.api.ProjectAPI import PROJECT_API

app = FastAPI(
    title="BuildPilot API",
    version="0.4.0",
    description="Backend services for the BuildPilot construction operations application.",
)

app.include_router(PROJECT_API)


@app.get("/api")
def api_root() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "buildpilot-api",
        "message": "BuildPilot API is online.",
    }


@app.get("/api/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "buildpilot-api",
        "version": "0.4.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
