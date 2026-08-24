import json
import os
from time import perf_counter

from google import genai
from google.genai import types

from rag.retrieval import semantic_project_search

GENERATION_MODEL = os.getenv("GEMINI_GENERATION_MODEL", "gemini-3.7-flash")
FALLBACK_GENERATION_MODEL = os.getenv(
    "GEMINI_GENERATION_FALLBACK_MODEL", "gemini-3.6-flash"
)
GENERATION_TIMEOUT_MS = int(os.getenv("GEMINI_GENERATION_TIMEOUT_MS", "8000"))
_generation_client = None


def get_generation_client():
    global _generation_client
    if _generation_client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is required")
        _generation_client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(
                timeout=GENERATION_TIMEOUT_MS,
                retry_options=types.HttpRetryOptions(attempts=1),
            ),
        )
    return _generation_client


def _error_signature(exc: Exception) -> str:
    error_type = type(exc).__name__
    code = getattr(exc, "code", None)
    status = getattr(exc, "status", None)
    parts = [error_type]
    if code is not None:
        parts.append(str(code))
    if status:
        parts.append(str(status))
    return ":".join(parts)


def _is_transient_generation_error(exc: Exception) -> bool:
    code = getattr(exc, "code", None)
    if code in {408, 429, 500, 502, 503, 504}:
        return True
    return type(exc).__name__ in {
        "ServerError",
        "TimeoutException",
        "ReadTimeout",
        "ConnectTimeout",
        "ConnectError",
    }


def _generate(prompt: str, model: str):
    return get_generation_client().models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_level="low"),
            max_output_tokens=500,
        ),
    )


def _build_evidence(hits: list[dict]) -> tuple[str, list[dict]]:
    evidence_items = []
    blocks = []

    for index, hit in enumerate(hits, start=1):
        evidence_id = f"E{index}"
        source_refs = hit.get("source_refs") or []
        evidence_items.append(
            {
                "id": evidence_id,
                "project_name": hit.get("project_name"),
                "score": hit.get("score"),
                "source_refs": source_refs,
            }
        )
        blocks.append(
            f"[{evidence_id}]\n"
            f"project_name: {hit.get('project_name')}\n"
            f"retrieval_score: {hit.get('score')}\n"
            f"project: {json.dumps(hit.get('project') or {}, separators=(',', ':'))}\n"
            f"financials: {json.dumps(hit.get('financials') or {}, separators=(',', ':'))}\n"
            f"materials: {json.dumps(hit.get('materials') or [], separators=(',', ':'))}\n"
            f"expenses: {json.dumps(hit.get('expenses') or [], separators=(',', ':'))}\n"
            f"invoices: {json.dumps(hit.get('invoices') or [], separators=(',', ':'))}\n"
            f"source_refs: {json.dumps(source_refs, separators=(',', ':'))}"
        )

    return "\n\n".join(blocks), evidence_items


def generate_grounded_answer(
    question: str,
    tenant_slug: str = "stark-roofing",
    limit: int = 3,
) -> dict:
    started = perf_counter()
    trace = []

    retrieval_started = perf_counter()
    hits, embedded_count = semantic_project_search(
        question,
        tenant_slug=tenant_slug,
        limit=limit,
    )
    retrieval_ms = round((perf_counter() - retrieval_started) * 1000, 2)
    trace.append(
        {
            "step": "Retrieval completed",
            "status": "complete",
            "detail": f"Retrieved {len(hits)} tenant-scoped project documents.",
            "duration_ms": retrieval_ms,
        }
    )

    if not hits:
        trace.append(
            {
                "step": "Validation completed",
                "status": "complete",
                "detail": "No supporting project documents were retrieved, so generation was skipped.",
                "duration_ms": 0,
            }
        )
        return {
            "question": question,
            "tenant": tenant_slug,
            "answer": "I could not find enough tenant-scoped evidence to answer that question.",
            "citations": [],
            "evidence": [],
            "retrieval": {"count": 0, "documents_embedded": embedded_count},
            "execution": trace,
            "mode": "rag_grounded_answer",
            "generation_model": GENERATION_MODEL,
            "generation_model_used": None,
            "fallback_used": False,
            "total_duration_ms": round((perf_counter() - started) * 1000, 2),
        }

    context, evidence_items = _build_evidence(hits)
    trace.append(
        {
            "step": "Evidence assembled",
            "status": "complete",
            "detail": f"Assembled {len(evidence_items)} evidence blocks from MongoDB Vector Search.",
            "duration_ms": 0,
        }
    )

    prompt = f"""You are TraceLayer, a production-minded construction operations copilot.
Answer the user's question using ONLY the evidence below.

Rules:
- Do not invent facts, causes, amounts, or dates.
- Cite every material claim inline using the evidence ids exactly like [E1] or [E1][E2].
- Prefer the highest-scoring directly relevant evidence.
- If the question's wording is more specific than the evidence supports, correct the framing clearly.
- Distinguish whole-project variance from material-only variance.
- Keep the answer concise: no more than 180 words.

Question:
{question}

Evidence:
{context}
"""

    generation_started = perf_counter()
    model_used = GENERATION_MODEL
    fallback_used = False
    primary_error_signature = None

    try:
        response = _generate(prompt, GENERATION_MODEL)
    except Exception as exc:
        primary_error_signature = _error_signature(exc)
        if not _is_transient_generation_error(exc):
            raise RuntimeError(
                f"gemini_generation_failed:primary:{primary_error_signature}"
            ) from exc

        fallback_used = True
        model_used = FALLBACK_GENERATION_MODEL
        trace.append(
            {
                "step": "Generation fallback",
                "status": "complete",
                "detail": (
                    f"{GENERATION_MODEL} returned {primary_error_signature}; "
                    f"retrying with {FALLBACK_GENERATION_MODEL}."
                ),
                "duration_ms": round((perf_counter() - generation_started) * 1000, 2),
            }
        )
        try:
            response = _generate(prompt, FALLBACK_GENERATION_MODEL)
        except Exception as fallback_exc:
            fallback_signature = _error_signature(fallback_exc)
            raise RuntimeError(
                "gemini_generation_failed:"
                f"primary:{primary_error_signature};"
                f"fallback:{fallback_signature}"
            ) from fallback_exc

    generation_ms = round((perf_counter() - generation_started) * 1000, 2)

    answer = (response.text or "").strip()
    if not answer:
        raise RuntimeError("gemini_generation_failed:EmptyResponse")

    used_citations = [item for item in evidence_items if f"[{item['id']}]" in answer]
    trace.append(
        {
            "step": "Generation completed",
            "status": "complete",
            "detail": f"Generated grounded answer with {model_used} at low thinking level.",
            "duration_ms": generation_ms,
        }
    )
    trace.append(
        {
            "step": "Validation completed",
            "status": "complete",
            "detail": f"Detected {len(used_citations)} cited evidence blocks in the generated answer.",
            "duration_ms": 0,
        }
    )

    return {
        "question": question,
        "tenant": tenant_slug,
        "answer": answer,
        "citations": used_citations,
        "evidence": evidence_items,
        "retrieval": {
            "count": len(hits),
            "documents_embedded": embedded_count,
            "top_results": [
                {
                    "project_name": hit.get("project_name"),
                    "score": hit.get("score"),
                }
                for hit in hits
            ],
        },
        "execution": trace,
        "mode": "rag_grounded_answer",
        "generation_model": GENERATION_MODEL,
        "generation_model_used": model_used,
        "fallback_model": FALLBACK_GENERATION_MODEL,
        "fallback_used": fallback_used,
        "primary_error_signature": primary_error_signature,
        "generation_timeout_ms": GENERATION_TIMEOUT_MS,
        "total_duration_ms": round((perf_counter() - started) * 1000, 2),
    }
