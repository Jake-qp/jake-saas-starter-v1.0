# ADR-002: Polar for Team-Level Billing
**Status:** Accepted
**Date:** 2026-02-10

## Context
The boilerplate needs a billing system for SaaS products. Options considered: Stripe (most popular), LemonSqueezy (simple), Polar (Convex-native component). The billing model is team-level (B2B SaaS: Slack, Notion, Linear) rather than per-user.

## Decision
Use Polar via `@convex-dev/polar` Convex component. Billing is at the team level — `getUserInfo` maps to the team entity, not individual users. Three tiers: Free, Pro, Enterprise with configurable limits in `lib/planConfig.ts`.

## Consequences
- Native Convex component — webhook handling, idempotency, and state management built in
- Team-level billing simplifies the model (one subscription per team, not per user)
- `polarCustomerId` stored on teams table
- Subscription state changes propagate reactively via Convex subscriptions
- Polar is less mature than Stripe — acceptable trade-off for Convex-native integration
- Entitlement system reads from `planConfig.ts` — boilerplate users configure tiers in one file
