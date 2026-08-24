# TraceLayer Phase 4 — RAG Foundation

## Status

Phase 4 is in progress. The goal is to move TraceLayer from deterministic structured analysis to a genuine retrieval-augmented generation flow while keeping every answer tenant-scoped and inspectable.

## Current flow

`Neon PostgreSQL → AI-ready MongoDB documents → Gemini embeddings → MongoDB Vector Search → grounded generation → execution trace`

## Infrastructure now available

- Neon PostgreSQL remains the operational source of truth.
- MongoDB Atlas project: `Project 0`.
- MongoDB Atlas cluster: `TraceLayerM0`.
- Cluster tier: free.
- MongoDB version: 8.0.29.
- Database: `tracelayer_ai`.
- Collection: `project_documents`.
- Four synthetic project documents have been loaded from the Neon dataset.

## AI-ready project document shape

Each project document contains:

- tenant id
- document type and schema version
- project summary
- customer summary
- financials
- material usage and costs
- expenses
- invoices
- `search_text` optimized for retrieval
- source references back to relational entities
- synthetic/source metadata

The Mongo `_id` is the original relational project id so syncs are idempotent and traceable.

## ETL implementation

`rag/sync_neon_to_mongo.py` performs the real relational-to-document transformation from Neon and upserts project documents into MongoDB Atlas. This is not a hard-coded demo export.

## Embeddings

`rag/embed_project_documents.py` generates embeddings from `search_text` using Gemini Embedding 2 and stores them in `embedding`.

Default embedding configuration:

- model: `gemini-embedding-2`
- dimensions: 768
- task: retrieval document

The API key is read only from `GEMINI_API_KEY`; it must never be committed.

## Planned vector index

The first vector index will target `embedding` and include `tenant_id` and `doc_type` as pre-filter fields. Tenant filtering is mandatory before semantic similarity is used in an answer.

The index is intentionally not created until its configuration is explicitly approved.

## Next implementation steps

1. Configure MongoDB credentials and `MONGODB_URI` privately in the runtime environment.
2. Configure `GEMINI_API_KEY` privately.
3. Run the ETL sync from Neon to MongoDB.
4. Generate 768-dimensional Gemini embeddings.
5. Create the approved MongoDB Vector Search index.
6. Run a tenant-filtered semantic query for Project Cedar.
7. Add retrieved document evidence to the API execution trace.
8. Add Gemini answer generation grounded only in retrieved and structured evidence.
9. Add validation that prevents unsupported claims and cross-tenant retrieval.

## Guardrails

- Synthetic data only.
- No employer code or confidential data.
- No credentials committed to GitHub.
- Tenant filter is required during retrieval.
- Generation must cite the evidence used.
- Retrieval and generation steps must appear only when they actually executed.
- Metrics shown publicly must be measured at runtime.
