from pathlib import Path
import sys

from fastapi import FastAPI, HTTPException, Query

BACKEND_ROOT = Path(__file__).resolve().parents[2] / "src" / "backend-service"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from backend_service.source.rag.generation import generate_grounded_answer

app = FastAPI(title="BuildPilot Grounded RAG API", version="0.5.0")


@app.get("/api/demo/rag-answer")
def rag_answer(
    q: str = Query(..., min_length=3, max_length=500),
    tenant_slug: str = "stark-roofing",
    limit: int = Query(3, ge=1, le=5),
):
    try:
        return generate_grounded_answer(q, tenant_slug=tenant_slug, limit=limit)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Grounded answer generation failed.") from exc
