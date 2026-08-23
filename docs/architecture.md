# TraceLayer Architecture

## Goal

TraceLayer is a public proof-of-skill system for production-minded AI engineering. The architecture is intentionally small enough to understand quickly, while still demonstrating the concerns that matter in real AI applications: data modeling, retrieval, tool use, tenant isolation, evidence, failure handling, testing, and observability.

## Request flow

```text
Employer
  |
  v
Next.js UI
  |
  v
FastAPI API / Orchestrator
  |--------------------|---------------------|
  v                    v                     v
Structured query   Vector retrieval      External tools
  |                    |                     |
Neon/Postgres      MongoDB Atlas         Supplier provider
  |                    |                     |
  |____________________|_____________________|
                       |
                       v
                Evidence assembly
                       |
                       v
                  LLM provider
                       |
                       v
              Grounded response
                       |
                       v
                Execution trace
```

## Responsibilities

### Next.js UI
- Employer-facing interaction.
- Suggested questions and answer presentation.
- Evidence/source display.
- Execution trace and later architecture explorer.

### FastAPI
- Request validation.
- Intent and workflow orchestration.
- Structured database queries.
- Retrieval calls.
- External tool invocation.
- Evidence assembly.
- LLM provider abstraction.
- Trace event collection.

### PostgreSQL / Neon
Source-of-truth operational demo data:
- tenants
- customers
- projects
- estimates
- expenses
- materials
- project materials
- invoices
- supplier catalog/pricing

Every tenant-owned operational table carries `tenant_id` so tenant isolation remains visible in the design from the first phase.

### ETL
Transforms normalized relational entities into retrieval-oriented documents. The ETL output is deliberately separate from operational models so changes to AI retrieval do not require redesigning source-of-truth tables.

### MongoDB Atlas
Stores AI-ready project documents and their retrieval metadata. Vector search will be added after the first public shell and operational database are connected.

### External-service provider layer
The first tool is a sanitized supplier service. Provider-specific behavior remains isolated from orchestration logic. Later iterations will demonstrate credentials/configuration per tenant and controlled failure scenarios.

## Execution trace

The trace shown to an employer must represent actual backend events, not a fake animation. Initial event types:

1. request_received
2. intent_resolved
3. structured_query
4. retrieval_completed
5. tool_called
6. evidence_assembled
7. generation_completed
8. validation_completed
9. response_returned

Each event will eventually include duration and sanitized metadata.

## Security and privacy rules

- Synthetic data only.
- No Softteam/GMS source code or schemas.
- Secrets remain server-side in hosting-provider environment variables.
- Public traces never expose credentials, connection strings, raw prompts containing secrets, or sensitive headers.
- Tenant ID is propagated through data and retrieval boundaries.

## Scope discipline

TraceLayer is not intended to recreate enterprise infrastructure for appearance. Infrastructure is added only when it demonstrates an engineering concern relevant to hiring.
