# ADR-004: Dual AI Streaming Patterns
**Status:** Accepted
**Date:** 2026-02-10

## Context
AI chat requires streaming responses from LLM providers (OpenAI, Anthropic) to the client. Two viable patterns exist in the Convex + Next.js ecosystem: (1) Next.js API route on Vercel Edge, (2) Convex HTTP action. Each has trade-offs.

## Decision
Ship both patterns. The Next.js API route (`app/api/ai/chat/route.ts`) is the default — simpler, runs on Vercel Edge, uses `useChat` from Vercel AI SDK directly. The Convex HTTP action (`convex/http.ts`) is documented as an alternative for teams that want all logic in Convex.

Both patterns share the same Convex mutations for saving messages, tracking usage, and checking entitlements. Only the streaming transport differs.

## Consequences
- Default pattern (Next.js API route) is simpler for most users
- Alternative pattern (Convex HTTP action) keeps all server logic in Convex
- Shared mutations prevent code duplication for message saving and credit tracking
- Developers choose based on their preference — no lock-in to either pattern
- Two patterns to document and maintain — acceptable trade-off for flexibility
