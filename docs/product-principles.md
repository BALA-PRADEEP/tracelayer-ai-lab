# BuildPilot Product Principles

BuildPilot is designed as a construction operations application first. The product should make sense to a project manager, estimator, procurement user, or finance user without requiring them to understand the implementation behind it.

## Product-first rule

Design from the user's job and next decision, not from backend objects, APIs, database tables, or AI capabilities.

Every screen should answer three questions quickly:

1. What is happening?
2. What needs my attention?
3. What can I do next?

## Application structure

Primary product areas:

- Overview
- Customers
- Estimates
- Projects
- Procurement
- Finance

The first vertical slice is centered on the working project lifecycle:

Customer -> Estimate -> Project -> Materials/BOM -> Purchase Orders -> Costs -> Investigation

## AI behavior

AI is part of the application workflow, not a separate developer demo.

The user should encounter AI through contextual actions such as:

- Investigate project
- Explain cost variance
- Compare supplier options
- Review purchase orders
- Prepare a purchase order

The application supplies the project context automatically. Users should not need to know tool names, database models, retrieval architecture, or orchestration concepts.

Read-only investigation may run automatically. Side-effecting operations require explicit user approval.

## Backend rule

BuildPilot backend code is Python only.

Preferred stack:

- FastAPI
- Pydantic
- SQLAlchemy 2
- psycopg
- Alembic
- PostgreSQL / Neon

GMS Java code can be studied only to understand business behavior and domain flows. BuildPilot does not copy or reuse proprietary GMS implementation code.

## Source-system boundary

The restored tn9 Neon database is a private reference/source environment. It may contain proprietary structures or real operational records.

BuildPilot must not expose that source data publicly. The public application uses a sanitized BuildPilot-facing model and synthetic/demo-safe records.

## UX rules

- Use plain construction/business language.
- Prefer task and outcome language over implementation terms.
- Show important status and exceptions before secondary information.
- Keep primary actions obvious.
- Avoid exposing raw IDs, schemas, service names, traces, prompts, or developer diagnostics in normal product screens.
- Technical execution detail, when useful for portfolio proof, belongs behind an optional secondary surface.
- A project workspace should consolidate related work rather than make users navigate unrelated modules.
- Preserve familiar construction workflows while simplifying the interaction model.

## First application slice

Build in this order:

1. Overview dashboard
2. Projects list
3. Project workspace
4. Estimate summary
5. Materials/BOM
6. Purchase orders
7. Cost summary / job margin
8. Contextual project investigation
9. Supplier comparison
10. Approval-gated procurement action

The same Python services should serve both normal UI actions and agent tools. The AI layer must not become a separate duplicate backend.
