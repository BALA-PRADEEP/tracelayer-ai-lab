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


def get_mongo_client():
    global _mongo_client
    if _mongo_client is None:
        mongodb_uri = os.getenv("MONGODB_URI")
        if not mongodb_uri:
            raise RuntimeError("MONGODB_URI is required")

        # TraceLayer runs as a low-traffic Vercel serverless demo. Keep the pool small
        # per function instance and reuse it across warm invocations.
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


def embed_query(text: str) -> list[float]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is required")

    client = genai.Client(api_key=api_key)
    result = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_QUERY",
            output_dimensionality=EMBEDDING_DIMENSIONS,
        ),
    )
    if not result.embeddings:
        raise RuntimeError("Gemini did not return a query embedding")
    return result.embeddings[0].values


def semantic_project_search(
    query: str,
    tenant_slug: str,
    limit: int = 3,
) -> list[dict]:
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

    return list(collection.aggregate(pipeline))
