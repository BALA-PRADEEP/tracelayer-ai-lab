from fastapi import FastAPI

from rag.retrieval import diagnose_runtime

app = FastAPI(title="TraceLayer RAG Diagnostics", version="0.4.2")


@app.get("/api/demo/rag-diagnostics")
def rag_diagnostics():
    return diagnose_runtime()
