# BuildPilot

Construction operations intelligence.

BuildPilot is a public, synthetic construction operations application that helps teams understand project cost movement, investigate overruns, compare supplier pricing, and make evidence-backed decisions.

The application experience is intentionally product-first. Its AI, retrieval, tool-use, validation, and execution-trace capabilities sit underneath the workflow instead of defining the product surface.

## Core product experience

A user can:

1. Inspect project cost performance.
2. Ask why a project is exceeding its estimate.
3. Review the materials, expenses, and supplier records behind the variance.
4. Compare supplier options.
5. Receive recommendations grounded in operational evidence.
6. Review the analysis steps used to reach the result.
7. Later approve controlled procurement actions.

## Product areas

- Overview
- Projects
- Cost insights
- Materials
- Suppliers
- Procurement
- Assistant

## Application architecture

```text
User
   |
Next.js application
   |
FastAPI orchestration layer
   |-- PostgreSQL / Neon        operational data
   |-- MongoDB Atlas            retrieval-oriented documents
   |-- Supplier tools           pricing and availability
   `-- LLM provider             grounded reasoning and response generation
```

## Current milestone

BuildPilot currently supports a live project cost-variance workflow backed by synthetic construction data. The next milestone is to evolve that flow into a bounded agent that can investigate a project dynamically, compare supplier options, recommend a mitigation, and prepare a controlled purchase request with approval.

## Data and privacy guardrails

- Synthetic public data only.
- No employer source code, schemas, credentials, client information, or production records.
- The private source database is used only as a reference for understanding realistic construction-domain relationships.
- Public schemas and records are redesigned and generalized for BuildPilot.
- Runtime metrics are measured, never invented.
- Recommendations and AI answers must remain evidence-backed and inspectable.

## Engineering visibility

The primary experience should feel like a real application. Engineering proof remains available through source code, architecture documentation, validation behavior, failure handling, tests, and an optional analysis trace.
