from datetime import datetime, timezone

from fastapi import FastAPI

app = FastAPI(
    title="TraceLayer API",
    version="0.1.0",
    description="Backend foundation for the TraceLayer Production AI Engineering Lab.",
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "tracelayer-api",
        "version": "0.1.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
