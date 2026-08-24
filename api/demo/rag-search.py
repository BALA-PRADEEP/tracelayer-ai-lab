from fastapi import FastAPI, HTTPException, Query

from rag.retrieval import semantic_project_search

app = FastAPI(title="TraceLayer Vector Retrieval API", version="0.4.1")


@app.get("/api/demo/rag-search")
def rag_search(
    q: str = Query(..., min_length=3, max_length=500),
    tenant_slug: str = "stark-roofing",
    limit: int = Query(3, ge=1, le=5),
):
    try:
        hits, embedded_count = semantic_project_search(
            q,
            tenant_slug=tenant_slug,
            limit=limit,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Vector retrieval failed.") from exc

    return {
        "query": q,
        "tenant": tenant_slug,
        "count": len(hits),
        "mode": "tenant_filtered_vector_retrieval",
        "bootstrap": {
            "documents_embedded": embedded_count,
            "note": (
                "Missing synthetic demo embeddings were created on this request. "
                "If results are still warming, retry once after a few seconds."
                if embedded_count
                else "Demo document embeddings were already current."
            ),
        },
        "results": hits,
    }
