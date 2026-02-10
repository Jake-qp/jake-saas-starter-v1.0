# ADR-001: Convex Auth over Clerk
**Status:** Accepted
**Date:** 2026-02-10

## Context
The V1 boilerplate used Clerk for authentication. While Clerk provides a polished drop-in experience, it introduces an external dependency for a core system concern. User data lives in two places (Clerk + Convex), requiring sync via webhooks and `tokenIdentifier` lookups. This adds complexity to the data model and creates potential consistency issues.

## Decision
Replace Clerk with Convex Auth (`@convex-dev/auth`). Use two providers: Password (email/password) and ResendOTP (magic link via Resend). Auth sessions are managed natively in Convex. User lookup uses `getAuthUserId()` instead of `tokenIdentifier`.

## Consequences
- Single source of truth for user data — no external sync needed
- Simpler data model — remove `tokenIdentifier`, use session-based auth
- No OAuth providers initially (email/password + magic link only) — simpler setup for boilerplate users
- Requires custom auth pages (sign-in, sign-up, forgot-password) instead of Clerk hosted/modal
- Two-layer provider pattern: `ConvexAuthNextjsServerProvider` (server) + `ConvexAuthNextjsProvider` (client)
- Magic link emails sent via Resend (same provider used for transactional email)
