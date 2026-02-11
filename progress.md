# Build Progress

## Current Feature
**ID:** (none)
**Phase:** -
**Status:** Ready for next build

---

## Last Completed
**ID:** F001-005
**Date:** 2026-02-11

AI/LLM Integration (Dual Streaming) — Vercel AI SDK v6 with dual streaming patterns (Next.js Edge API route default + Convex HTTP action alternative). AI chat page with useChat streaming, model selector (4 models), credit usage meter. Shared Convex mutations with full auth → permission → entitlement → rate limit → execute pattern. 28 new tests.

**Files Created:**
- `app/api/ai/chat/route.ts` — Next.js Edge streaming endpoint
- `app/t/[teamSlug]/ai/page.tsx` — AI chat page
- `convex/ai.ts` — Shared mutations (saveUserMessage, saveAssistantMessage, listMessages)
- `lib/aiModels.ts` — Model configuration
- `convex/__tests__/ai.test.ts` — 21 backend tests
- `lib/__tests__/aiModels.test.ts` — 7 model config tests

**Files Modified:**
- `convex/schema.ts` — Added aiMessages table
- `convex/http.ts` — Added alternative Convex HTTP action (documented)
- `app/t/TeamMenu.tsx` — Added "AI Chat" nav link

**Spec:** `docs/specs/F001-005-ai-llm-integration.spec`
**Gates:** Phase 4 ✅ | Phase 5 ✅
**ACs:** 7/7

---

## Project State
- **Tests:** 316 passing (6 todo seeds for future features)
- **Build:** ✅ succeeds
- **Features:** 10 complete | 7 pending
