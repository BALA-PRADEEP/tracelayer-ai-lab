# TraceLayer AI Lab

Production AI systems you can inspect.

TraceLayer is a hiring-focused, production-minded AI engineering lab built by Bala Pradeep R. It demonstrates how a modern AI system can combine operational data, retrieval, tool calls, evidence, reliability, and an inspectable execution trace.

## Why this exists

A resume can claim experience with RAG, ETL, integrations, security, and production debugging. TraceLayer makes those engineering ideas visible in a sanitized public system using synthetic construction data.

## Target experience

An employer can:

1. Ask a realistic question about projects, costs, materials, or suppliers.
2. Receive a grounded answer with evidence.
3. Open **View execution** to inspect retrieval, structured queries, tool calls, validation, and latency.
4. Explore architecture, trade-offs, failure handling, tests, and source code.

## MVP architecture

```text
Employer
   |
Next.js UI
   |
FastAPI orchestrator
   |-- PostgreSQL / Neon        (operational data)
   |-- MongoDB Atlas            (AI-ready documents + vectors)
   |-- Supplier tool            (sanitized external-service simulation)
   `-- Gemini                   (grounded response generation)
```

## MVP milestone

The first public milestone is intentionally small:

- Next.js portfolio shell
- FastAPI health endpoint
- one public Vercel deployment
- synthetic PostgreSQL schema
- PostgreSQL -> AI-document ETL
- vector retrieval
- one supplier tool
- one grounded RAG question
- evidence + execution trace
- Playwright E2E coverage

## Principles

- Employer-first: every feature proves a skill worth hiring for.
- Synthetic data only: no employer code, schemas, credentials, or client information.
- Inspectable AI: evidence, trace, architecture, and tests are visible.
- Production-minded: explicit failure states, retries, validation, and honest metrics.
- Zero-cost V1: GitHub, Vercel, Neon, MongoDB Atlas, and Gemini free tiers.

## Status

Phase A — Foundation / Public MVP
