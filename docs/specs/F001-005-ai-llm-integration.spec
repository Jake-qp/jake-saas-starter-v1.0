# Feature: AI/LLM Integration (Dual Streaming)

## User Context
- **Primary User:** Team member with "Use AI" permission
- **Context:** Desktop at office, working within a team workspace
- **Top Goals:**
  1. Chat with an AI assistant and get streaming responses in real-time
  2. Choose between available AI models (GPT-4o, GPT-4o-mini, Claude Sonnet, Claude Haiku)
  3. Track AI credit usage against team billing quota
- **Mental Model:** Familiar with ChatGPT-style chat interfaces. Expects message history, streaming text, model selection.
- **Key Questions:** How many credits do I have left? What model am I using? Can I see my chat history?

## Feature Outline (Approved)

### Screens
1. **AI Chat Page** (`/t/[teamSlug]/ai`) - Full-page chat interface with streaming responses, model selector, and usage display

### Key User Flows
1. User navigates to AI Chat → sees message input + empty state → types message → sees streaming response → message saved to history
2. User selects a different AI model from the selector → next message uses the new model
3. User hits credit limit → sees entitlement error with upgrade link

### Out of Scope
- Multi-conversation management (single conversation per team for now)
- Image/file attachments in AI chat
- RAG / knowledge base / document retrieval
- Custom system prompts configuration UI
- AI features outside the chat page (e.g., AI-assisted notes)

## User Story
As a team member with "Use AI" permission
I want to chat with AI models and get streaming responses
So that I can use AI assistance within my team's credit quota

## Acceptance Criteria
- [ ] AC1: AI chat page renders with streaming responses
- [ ] AC2: Default streaming via Next.js API route (`/api/ai/chat`) works on Vercel Edge
- [ ] AC3: Alternative streaming via Convex HTTP action is documented and functional
- [ ] AC4: Both patterns share the same Convex mutations for saving messages and tracking usage
- [ ] AC5: Usage is tracked per team per billing period in credits
- [ ] AC6: Rate limiting prevents exceeding tier credit quota
- [ ] AC7: "Use AI" permission gates access

## Edge Cases
- No credits remaining: Show entitlement error with upgrade URL
- Rate limit exceeded: Show rate limit error with retry-after guidance
- No "Use AI" permission: Redirect or show permission denied
- API key not configured: Show graceful error (env var missing)
- Network error during streaming: Show error, allow retry
- Empty message submission: Prevent submission

## Implementation Notes (from PRD)
- **Default:** Next.js API route (`app/api/ai/chat/route.ts`) — Vercel Edge Function
- **Alternative:** Convex HTTP action (`convex/http.ts`) — documented as option
- Both share Convex mutations for saving messages + tracking credits
- Usage tracking + rate limiting + credit decrement via existing infrastructure
- AI chat page with Vercel AI SDK `useChat`

## Dependencies
- F001-003 (Polar Billing + Credits) - credit tracking, entitlements
- F001-004 (Enhanced RBAC) - "Use AI" permission

## Success Definition
We'll know this works when: A team member can open the AI chat, select a model, send a message, see a streaming response, and have their credit usage accurately tracked against their team's billing quota.
