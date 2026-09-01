import os

from google import genai
from google.genai import types
from pymongo import MongoClient

DATABASE_NAME = os.getenv("MONGODB_DATABASE", "tracelayer_ai")
COLLECTION_NAME = "project_documents"
EMBEDDING_MODEL = os.getenv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-2")
EMBEDDING_DIMENSIONS = int(os.getenv("GEMINI_EMBEDDING_DIMENSIONS", "768"))


def main():
    mongodb_uri = os.getenv("MONGODB_URI")
    gemini_api_key = os.getenv("GEMINI_API_KEY")

    if not mongodb_uri:
        raise RuntimeError("MONGODB_URI is required")
    if not gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is required")

    mongo = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
    collection = mongo[DATABASE_NAME][COLLECTION_NAME]
    gemini = genai.Client(api_key=gemini_api_key)

    documents = list(
        collection.find(
            {"search_text": {"$exists": True, "$ne": ""}},
            {"search_text": 1, "project_name": 1, "embedding_model": 1},
        )
    )

    updated = 0
    for document in documents:
        result = gemini.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=document["search_text"],
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_DOCUMENT",
                title=document.get("project_name"),
                output_dimensionality=EMBEDDING_DIMENSIONS,
            ),
        )

        if not result.embeddings:
            raise RuntimeError(f"No embedding returned for {document['_id']}")

        collection.update_one(
            {"_id": document["_id"]},
            {
                "$set": {
                    "embedding": result.embeddings[0].values,
                    "embedding_model": EMBEDDING_MODEL,
                    "embedding_dimensions": EMBEDDING_DIMENSIONS,
                }
            },
        )
        updated += 1

    print(f"Embedded {updated} project documents using {EMBEDDING_MODEL} ({EMBEDDING_DIMENSIONS} dimensions).")


if __name__ == "__main__":
    main()
