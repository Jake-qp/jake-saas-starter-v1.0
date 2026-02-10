# ADR-003: convex-ents for Data Model
**Status:** Accepted
**Date:** 2026-02-10

## Context
Convex's built-in schema system provides table definitions and validators but lacks relationship management (edges), soft deletion, and unique constraints as first-class features. These are essential for a multi-tenant SaaS data model.

## Decision
Use `convex-ents` for the data model. It provides typed edges between entities, soft deletion with configurable grace periods, unique field constraints, and a fluent query API that traverses relationships.

## Consequences
- Typed edges (e.g., `member.edge("team")`, `member.edge("role")`) replace manual foreign key management
- Soft deletion built in — `deletion("soft")` on users, members, notes; `deletion("scheduled", { delayMs })` on teams
- Unique constraints on fields like `teams.slug`, `users.email`, `roles.name`
- Custom query/mutation wrappers in `convex/functions.ts` inject the ents context
- Requires `getEntDefinitions(schema)` export for runtime type resolution
- Slight learning curve for developers unfamiliar with convex-ents API
