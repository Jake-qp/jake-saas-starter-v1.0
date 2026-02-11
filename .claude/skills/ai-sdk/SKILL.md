---
name: ai-sdk
description: Use when implementing AI chat, streaming, LLM integration, or credit-based AI features. Before writing any AI code.
---

# AI SDK Skill

## Overview

AI features are the most expensive code in your SaaS. Every request costs real money, streams data over unpredictable networks, and touches billing logic that directly impacts revenue. Get the architecture wrong and you burn credits, lose messages mid-stream, or charge users for failed requests. This project ships dual streaming patterns (Next.js API route + Convex HTTP action) with credit-based billing -- the skill teaches you how to wire them correctly.

## How AI Engineers Think

**"What happens when the stream dies halfway through?"**
LLM responses take 5-30 seconds. Networks drop. Users navigate away. Servers timeout. If you decrement credits before the response completes, you charge for nothing. If you save the message before the stream finishes, you store garbage. Every AI feature is a long-running operation -- treat it like one.

**"How much does this cost, and who pays?"**
Every token has a price. GPT-4 costs 10x what Haiku costs. A team on the Free tier gets 100 credits. A runaway prompt with 8k tokens of context could blow through a team's monthly budget in one request. You must check credits before starting AND record actual usage after completion. Estimates are not invoices.

**"Can the user tell something is happening?"**
Streaming exists because users will not wait 15 seconds staring at a spinner. The first token must arrive fast. Progress must be visible. Errors must be immediate and actionable -- "You're out of credits" is useful, "Something went wrong" is not.

### What Separates Amateurs from Professionals

Amateurs build a chat UI that calls OpenAI and dumps the result.
Professionals build a metered, resilient streaming pipeline that handles model switching, credit gating, partial failures, message persistence, and graceful degradation -- and the user never sees the complexity.

The amateur thinks: "Call the API, show the response."
The professional thinks: "Authenticate the user. Check their team has credits. Pick the right model. Stream the response. Handle mid-stream failures. Save the message. Record actual token usage. Decrement credits. Show a clear error if anything fails."

When catching yourself hardcoding a model or skipping credit checks -- STOP. That is tech debt with a dollar sign.

## When to Use

- Implementing AI chat or streaming features
- Adding a new LLM model or provider
- Building the credit tracking system
- Connecting `useChat` to the backend
- Creating the Convex AI mutations (`convex/ai/`)
- Setting up `app/api/ai/chat/route.ts`
- **NOT** for general API routes (use backend skill)
- **NOT** for billing/subscription logic (use the billing module in F001-003)
- **NOT** for UI components (use frontend/ui skills, then come back here for the data layer)

## Architecture: Two Streaming Patterns

This project ships both patterns per [ADR-004](docs/adrs/004-ai-dual-streaming.md). They share the same Convex mutations for persistence and credit tracking. Only the streaming transport differs.

### Pattern 1: Next.js API Route (Default)

**When:** Most teams. Simpler. Runs on Vercel Edge. Direct `useChat` compatibility.

```
Client (useChat) --> POST /api/ai/chat --> Vercel Edge --> OpenAI/Anthropic
                                       --> Convex mutations (save + credits)
```

**File:** `app/api/ai/chat/route.ts`

Key decisions:
- `export const runtime = "edge"` -- runs on Vercel Edge, low latency
- Authentication via Convex session token in request headers
- Credit check calls Convex mutation BEFORE streaming starts
- `onFinish` callback records actual token usage AFTER stream completes
- Returns `result.toDataStreamResponse()` for wire-compatible streaming

### Pattern 2: Convex HTTP Action (Alternative)

**When:** Teams that want all server logic inside Convex. No separate API route.

```
Client (useChat) --> Convex HTTP endpoint --> OpenAI/Anthropic
                                          --> Convex mutations (save + credits)
```

**File:** `convex/http.ts` (registered as HTTP action)

Key decisions:
- Uses `httpAction` from Convex -- runs inside Convex runtime
- Auth via Convex context (`ctx`) -- no manual token verification
- Can call `ctx.runMutation` directly for credit checks and message saving
- Same `streamText` + `toDataStreamResponse()` pattern as Pattern 1

### Shared Layer (Both Patterns Use This)

**Files:** `convex/ai/` directory

```
convex/ai/
  checkCredits.ts      -- Pre-request credit validation
  recordUsage.ts       -- Post-completion token/credit tracking
  saveMessage.ts       -- Message persistence
  conversations.ts     -- Conversation CRUD queries
  creditCosts.ts       -- Model-to-credit cost mapping
```

This is the layer that matters. Both streaming patterns are thin wrappers around these shared mutations.

## Quick Reference

| Task | Pattern | Key File |
|------|---------|----------|
| Add AI chat to a page | `useChat` hook | Client component |
| Stream via Next.js (default) | API route + `streamText` | `app/api/ai/chat/route.ts` |
| Stream via Convex (alternative) | HTTP action + `streamText` | `convex/http.ts` |
| Check credits before request | `checkEntitlement(ctx, teamId, "aiCredits")` | `convex/ai/checkCredits.ts` |
| Record usage after completion | `internalMutation` in `onFinish` | `convex/ai/recordUsage.ts` |
| Save messages to history | `internalMutation` per message | `convex/ai/saveMessage.ts` |
| Add a new model | Add to `creditCosts` map + provider routing | `convex/ai/creditCosts.ts` |
| Switch providers | Route by model ID prefix | `getModel()` helper |

## Core Implementation Sequence

Build in this order. Each step depends on the previous.

### Step 1: Credit Cost Configuration

Define model costs before anything else. Everything downstream reads this.

```typescript
// convex/ai/creditCosts.ts
const CREDIT_COSTS: Record<string, number> = {
  "gpt-4": 10,
  "gpt-3.5-turbo": 1,
  "claude-opus-4-6": 15,
  "claude-sonnet-4-5-20250929": 5,
  "claude-haiku-4-5-20251001": 2,
};

// Cost per 1k tokens -- multiply by actual usage
export function calculateCredits(model: string, tokens: number): number {
  const costPer1k = CREDIT_COSTS[model] ?? 5; // safe default
  return Math.ceil((tokens / 1000) * costPer1k);
}
```

### Step 2: Shared Convex Mutations

These run regardless of which streaming pattern is used.

```typescript
// convex/ai/checkCredits.ts
// Uses: checkEntitlement(ctx, teamId, "aiCredits")
// Throws ConvexError if team has no remaining credits
// Returns remaining credit count for UI display

// convex/ai/recordUsage.ts
// Inserts into aiUsage table: { teamId, model, tokensUsed, creditsUsed }
// Called from onFinish with ACTUAL token count, not estimates

// convex/ai/saveMessage.ts
// Inserts into aiMessages: { teamId, memberId, role, content, model }
// Called for both user and assistant messages
```

**Checkpoint:** "Can I check credits and record usage without any streaming code?" If yes, proceed.

### Step 3: Model Router

Single function that maps model IDs to provider instances.

```typescript
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

export function getModel(modelId: string) {
  if (modelId.startsWith("claude")) return anthropic(modelId);
  return openai(modelId);
}
```

Never scatter provider selection logic across files. One function. One place.

### Step 4: Streaming Endpoint (Pick One First)

Start with Pattern 1 (Next.js API route). Add Pattern 2 later if needed.

The endpoint follows the project's mutation pattern: **Authenticate --> Authorize --> Entitle --> Execute --> Record**.

```typescript
// app/api/ai/chat/route.ts
export const runtime = "edge";

export async function POST(req: Request) {
  const { messages, model, teamId } = await req.json();

  // 1. Authenticate -- verify Convex session token from headers
  // 2. Authorize -- viewerHasPermission(ctx, teamId, "Contribute")
  // 3. Entitle -- checkEntitlement(ctx, teamId, "aiCredits")
  // 4. Stream
  const result = streamText({
    model: getModel(model),
    messages,
    onFinish: async ({ usage }) => {
      // 5. Record ACTUAL usage (not estimates)
      // Call Convex mutation: recordUsage({ teamId, model, tokens: usage.totalTokens })
    },
  });

  return result.toDataStreamResponse();
}
```

### Step 5: Client Hook

```tsx
"use client";
import { useChat } from "ai/react";

export function ChatInterface({ teamId }: { teamId: string }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/api/ai/chat",
      body: { teamId, model: "gpt-4" },
      onError: (error) => {
        // Show actionable error: "Out of credits" vs generic failure
      },
    });
  // Render messages + input form
}
```

**Checkpoint:** "Does the full loop work? User sends message --> credits checked --> response streams --> usage recorded --> credits decremented?" If yes, the core is done.

## Credit System Rules

These are non-negotiable. Violating any of them means billing bugs.

1. **Check BEFORE streaming.** Call `checkEntitlement` before `streamText`. If the team has zero credits, reject immediately with a clear upgrade prompt.

2. **Record AFTER completion.** Use `onFinish` to get `usage.totalTokens`. This is the actual cost, not the estimate. Decrement credits based on real numbers.

3. **Handle the gap.** Between check and record, another request could consume credits. Accept this. A scheduled reconciliation function catches drift (per [ADR-007](docs/adrs/007-credit-billing.md)).

4. **Costs are per 1k tokens, per model.** GPT-4 at 10 credits/1k and Haiku at 2 credits/1k means a 2k-token GPT-4 response costs 20 credits while the same tokens on Haiku cost 4.

5. **Unlimited means skip the check.** Enterprise tier (`aiCredits: -1`) bypasses credit gating entirely. Still record usage for analytics.

## Error Handling

AI errors are different from normal errors. They happen mid-stream, they cost money, and users are watching in real time.

| Error | When | User Sees | Code Does |
|-------|------|-----------|-----------|
| No credits | Before stream | "You've used all your AI credits. Upgrade to continue." | Reject with 402 + upgrade URL |
| Auth failure | Before stream | "Please sign in to use AI features." | Reject with 401 |
| Rate limited | Before stream | "Too many requests. Try again in a moment." | Reject with 429 |
| Provider down | During stream | "AI service temporarily unavailable." | Don't record usage. Don't charge credits. |
| Stream interrupted | During stream | Partial message displayed + "Response interrupted." | Save partial message. Charge for tokens received. |
| Invalid model | Before stream | "Selected model is not available." | Reject with 400 |

**Key principle:** Never charge for failed requests. If the provider errors, the user pays nothing. If the stream partially completes, charge only for tokens actually received.

## Common Mistakes

| Wrong | Right | Why |
|-------|-------|-----|
| Decrement credits before streaming | Decrement in `onFinish` after actual usage | Charges users for failed/partial requests |
| Hardcode `openai("gpt-4")` in route | Use `getModel(modelId)` router | Breaks model switching, locks to one provider |
| Skip credit check for "quick test" | Always check, even in dev | You will forget to add it back |
| Buffer full response then send | Use `streamText` + `toDataStreamResponse()` | Users wait 15+ seconds seeing nothing |
| Store messages client-side only | Save to Convex `aiMessages` table | Lost on refresh, no audit trail, no team history |
| Same error for all failures | Distinguish credit, auth, rate, provider errors | Users need actionable messages to fix the problem |
| Estimate token cost before completion | Use `usage.totalTokens` from `onFinish` | Estimates drift from reality, billing becomes inaccurate |
| Call provider directly from client | Always go through API route or Convex action | Exposes API keys, bypasses credit checks |
| Forget to handle partial streams | Save partial message, charge proportional credits | Users lose context, billing is wrong |
| Put credit costs in multiple files | Single `creditCosts.ts` source of truth | Costs diverge, billing breaks silently |

## Environment Variables

Both providers need keys set in the **Convex Dashboard** (not `.env.local`):

- `OPENAI_API_KEY` -- OpenAI API key
- `ANTHROPIC_API_KEY` -- Anthropic API key

For the Next.js API route pattern, these also need to be in Vercel environment variables since Edge functions run outside Convex.

## Dependencies

```
ai                  -- Vercel AI SDK core (streamText, useChat)
@ai-sdk/openai      -- OpenAI provider
@ai-sdk/anthropic   -- Anthropic provider
```

Already in `package.json`. Do not add provider SDKs directly (`openai`, `@anthropic-ai/sdk`) -- the AI SDK abstracts them.

## Exit Criteria

- [ ] Credit check runs before every AI request (no exceptions)
- [ ] Actual token usage recorded in `onFinish`, not estimated
- [ ] `getModel()` routes to correct provider by model ID prefix
- [ ] Default streaming works via Next.js API route (`/api/ai/chat`)
- [ ] Alternative streaming documented via Convex HTTP action
- [ ] Both patterns share the same Convex mutations for persistence and credits
- [ ] Error responses are specific: credit exhaustion, auth failure, rate limit, provider error
- [ ] Failed/partial requests do not charge full credits
- [ ] Messages saved to Convex for history and audit
- [ ] Credit costs defined in single source of truth (`creditCosts.ts`)
- [ ] Enterprise tier (unlimited credits) bypasses gating but still records usage
- [ ] `useChat` hook connected with `teamId` and model selection in body

**Done when:** A Free-tier user can chat, see their credits decrement accurately, get a clear upgrade prompt when credits run out, and the same code works if you swap GPT-4 for Claude without touching anything except the model ID.
