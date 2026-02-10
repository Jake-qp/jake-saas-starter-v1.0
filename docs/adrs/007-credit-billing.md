# ADR-007: Credit-Based AI Billing
**Status:** Accepted
**Date:** 2026-02-10

## Context
AI features consume LLM API calls which have real costs. Need a way to meter and limit AI usage per team based on their subscription tier. Options: unlimited (unsustainable), hard request limits (inflexible), credit-based system (granular).

## Decision
Implement credit-based AI billing. Each tier gets a monthly credit allocation (configured in `planConfig.ts`). Different AI models cost different credit amounts (e.g., GPT-4 = 10 credits, Claude Haiku = 2 credits). Credits are checked before each request and decremented after completion.

## Consequences
- Granular cost control — expensive models cost more credits than cheap ones
- Configurable per tier — Free gets 100 credits, Pro gets 5000, Enterprise gets unlimited
- Credits tracked per team per billing period via `aiUsage` table
- Pre-check prevents starting requests that would exceed limits
- Post-completion decrement uses actual token count for accuracy
- Potential for drift between pre-check estimate and actual cost — reconciliation via scheduled function
- Clear upgrade prompts when credits are exhausted
