import os

from google import genai
from google.genai import types
from pymongo import MongoClient

DATABASE_NAME = os.getenv("MONGODB_DATABASE", "tracelayer_ai")
COLLECTION_NAME = "project_documents"
VECTOR_INDEX = "project_documents_vector"
EMBEDDING_MODEL = os.getenv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-2")
EMBEDDING_DIMENSIONS = int(os.getenv("GEMINI_EMBEDDING_DIMENSIONS", "768"))

_mongo_client = None
_gemini_client = None


def get_mongo_client():
    global _mongo_client
    if _mongo_client is None:
        mongodb_uri = os.getenv("MONGODB_URI")
        if not mongodb_uri:
            raise RuntimeError("MONGODB_URI is required")

        # TraceLayer is a low-traffic Vercel serverless demo. Reuse a small pool
        # across warm invocations instead of reconnecting on every request.
        _mongo_client = MongoClient(
            mongodb_uri,
            maxPoolSize=5,
            minPoolSize=0,
            maxIdleTimeMS=30000,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=10000,
        )
    return _mongo_client


def get_gemini_client():
    global _gemini_client
    if _gemini_client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is required")
        _gemini_client = genai.Client(api_key=api_key)
    return _gemini_client


def embed_text(text: str, task_type: str, title: str | None = None) -> list[float]:
    config = types.EmbedContentConfig(
        task_type=task_type,
        output_dimensionality=EMBEDDING_DIMENSIONS,
    )
    if title and task_type == "RETRIEVAL_DOCUMENT":
        config.title = title

    result = get_gemini_client().models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config=config,
    )
    if not result.embeddings:
        raise RuntimeError("Gemini did not return an embedding")

    values = result.embeddings[0].values
    if len(values) != EMBEDDING_DIMENSIONS:
        raise RuntimeError(
            f"Unexpected embedding dimensions: {len(values)} (expected {EMBEDDING_DIMENSIONS})"
        )
    return values


def embed_query(text: str) -> list[float]:
    return embed_text(text, task_type="RETRIEVAL_QUERY")


def ensure_document_embeddings(max_documents: int = 20) -> int:
    """Create missing/outdated embeddings for the small synthetic demo corpus.

    This is intentionally idempotent. Public retrieval can safely bootstrap the demo
    once after a fresh deployment without exposing a general write endpoint.
    """
    collection = get_mongo_client()[DATABASE_NAME][COLLECTION_NAME]
    missing_filter = {
        "metadata.synthetic": True,
        "doc_type": "project_summary",
        "search_text": {"$exists": True, "$ne": ""},
        "$or": [
            {"embedding": {"$exists": False}},
            {"embedding_dimensions": {"$ne": EMBEDDING_DIMENSIONS}},
            {"embedding_model": {"$ne": EMBEDDING_MODEL}},
        ],
    }

    documents = list(
        collection.find(
            missing_filter,
            {"search_text": 1, "project_name": 1},
        ).limit(max_documents)
    )

    updated = 0
    for document in documents:
        values = embed_text(
            document["search_text"],
            task_type="RETRIEVAL_DOCUMENT",
            title=document.get("project_name"),
        )
        collection.update_one(
            {"_id": document["_id"]},
            {
                "$set": {
                    "embedding": values,
                    "embedding_model": EMBEDDING_MODEL,
                    "embedding_dimensions": EMBEDDING_DIMENSIONS,
                }
            },
        )
        updated += 1

    return updated


def semantic_project_search(
    query: str,
    tenant_slug: str,
    limit: int = 3,
) -> tuple[list[dict], int]:
    embedded_count = ensure_document_embeddings()
    query_vector = embed_query(query)
    collection = get_mongo_client()[DATABASE_NAME][COLLECTION_NAME]

    pipeline = [
        {
            "$vectorSearch": {
                "index": VECTOR_INDEX,
                "path": "embedding",
                "queryVector": query_vector,
                "numCandidates": max(limit * 20, 40),
                "limit": limit,
                "filter": {
                    "tenant_id": tenant_slug,
                    "doc_type": "project_summary",
                },
            }
        },
        {
            "$project": {
                "_id": 1,
                "tenant_id": 1,
                "doc_type": 1,
                "project_name": 1,
                "project": 1,
                "financials": 1,
                "materials": 1,
                "expenses": 1,
                "invoices": 1,
                "search_text": 1,
                "source_refs": 1,
                "score": {"$meta": "vectorSearchScore"},
            }
        },
    ]

    return list(collection.aggregate(pipeline)), embedded_count
