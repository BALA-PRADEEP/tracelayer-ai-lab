from pathlib import Path
import sys

from fastapi import FastAPI

BACKEND_ROOT = Path(__file__).resolve().parents[2] / "src" / "backend-service"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from backend_service.source.dal.vector_retrieval import diagnose_runtime

app = FastAPI(title="BuildPilot RAG Diagnostics", version="0.4.2")


@app.get("/api/demo/rag-diagnostics")
def rag_diagnostics():
    return diagnose_runtime()
