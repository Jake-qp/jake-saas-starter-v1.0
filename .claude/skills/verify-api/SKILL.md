---
name: verify-api
description: Use before integrating any external API, third-party service, or SDK. Before writing any integration code.
allowed-tools: Read, Grep, Glob, WebFetch, WebSearch
---

# Verify API Skill

## Overview

External API documentation is a claim, not a fact. APIs change, docs lag, and your training data is already stale. Verify everything before writing a single line of integration code.

## How API Integration Experts Think

**"Documentation is a starting hypothesis."**
Every API doc you read is what someone intended to write at some point in the past. The actual API might have changed, the docs might be wrong, the version might differ. Treat docs as claims to verify, not truth to trust.

**"My training data is already wrong."**
APIs change constantly. Stripe, Twilio, OpenAI—they all ship updates faster than training data refreshes. If you're implementing from memory, you're implementing from the past. Always verify against current docs.

**"Test before you build."**
A 30-second curl command saves 3 hours of debugging. Verify the endpoint exists, verify auth works, verify the response shape matches what you expect. Then implement.

### What Separates Amateurs from Professionals

Amateurs implement from memory and blog posts.
Professionals verify against current official docs and test before building.

The amateur thinks: "I know how Stripe's API works."
The professional thinks: "I think I know—let me verify the current version."

When catching yourself writing API integration code from memory—STOP. Verify first.

## When to Use

- Before integrating ANY external API
- Before installing any API SDK
- When "unexpected response" errors occur
- When "method not found" errors appear
- **NOT** for internal APIs you control (different skill)
- **NOT** after you've already verified (don't re-verify same session)

## The Iron Law of API Integration

**NEVER trust training data for external API details.**

This is non-negotiable. APIs change too frequently. What you "know" about an API is what it looked like months or years ago.

## Verification Process

### Step 1: Find Current Official Documentation

Use **WebSearch** to find the current official docs, then **WebFetch** to read them.

**Priority order:**
1. MCP documentation tools (Context7, etc.) — most current
2. Official API docs website via WebFetch — authoritative
3. SDK TypeScript definitions via Read — type-accurate
4. Confirm with user — when uncertain

**Never trust:**
- Blog posts or tutorials (outdated immediately)
- Stack Overflow answers (often years old)
- Your own memory (training data is stale)

```
✅ WebSearch → find official docs URL → WebFetch to read
✅ Read installed SDK's TypeScript definitions for type accuracy
❌ "How to use Stripe API" blog from 2022
❌ Stack Overflow answer from 3 years ago
```

### Step 2: Verify Exact Signatures

Document what you find:

```markdown
## API: [Service Name] - [Endpoint]

**Endpoint:** POST https://api.stripe.com/v1/customers
**Auth:** Bearer token in Authorization header
**Content-Type:** application/x-www-form-urlencoded

**Required params:**
- (none for basic create)

**Common params:**
- email: string
- name: string  
- metadata: object

**Response shape:**
{
  "id": "cus_xxx",
  "object": "customer",
  "email": "...",
  ...
}

**Source:** https://stripe.com/docs/api/customers/create
**Verified:** [today's date]
```

### Step 3: Verify Response Shape

Before writing integration code, confirm the API behaves as documented:

1. **Use WebFetch** on the API's official docs to verify endpoint, method, params, and response shape
2. **Use Read** to check any installed SDK's TypeScript definitions for type accuracy
3. **Use Grep** to find existing integrations in the codebase for patterns to follow

If the docs are ambiguous or you can't verify the response shape, flag this to the user and suggest a manual curl test before proceeding.

**Note:** This skill is read-only. For live API testing (curl/fetch), ask the user to test manually or use a separate tool.

### Step 4: Document Findings

Add to SCRATCHPAD or inline comments:

```markdown
## API Verification: Stripe Customers

- **Docs:** https://stripe.com/docs/api/customers
- **Version:** 2023-10-16 (API version)
- **Verified:** [date]
- **Auth:** Bearer token (sk_test_xxx)
- **Quirks:** 
  - Uses form encoding, not JSON
  - Returns 200 even for idempotent creates
```

## Using Available Research Tools

Use the tools available to this skill for verification:

- **WebSearch** — Find current official documentation URLs
- **WebFetch** — Read API docs pages directly to verify endpoints, params, response shapes
- **Grep** — Search the codebase for existing integrations and patterns
- **Read** — Read SDK TypeScript definitions, existing config, integration code
- **Glob** — Find relevant files (SDK type definitions, existing API clients)

**WebSearch + WebFetch give you current docs.** Use them first. They exist to solve the stale-training-data problem.

## Red Flags That Demand Re-verification

| Red Flag | What It Means |
|----------|---------------|
| "Method not found" | API changed, your signature is wrong |
| Unexpected response shape | Response format changed |
| Auth failing | Auth method or format changed |
| "Deprecated" warning | API version is old |
| "Invalid parameter" | Param name or type changed |

When you see these, don't guess. Go back to Step 1.

## Common API Traps

| Trap | Reality |
|------|---------|
| "I know this API" | You know an old version |
| Blog tutorial code | Outdated the day it was published |
| Assuming v1 = v2 | Breaking changes are common |
| SDK "just works" | SDKs have versions too |
| Skipping auth test | Auth is the #1 failure point |

## Quick Reference

| Situation | Action |
|-----------|--------|
| New API integration | Full verification (Steps 1-4) |
| API returning errors | Re-verify against current docs |
| "I remember how this works" | Verify anyway—you remember the past |
| Using MCP tools | Query first, then test with curl |
| No MCP available | Official docs → test → document |

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| Implementing from memory | Verify current docs first | Training data is stale |
| Trusting blog tutorials | Official docs only | Blogs are outdated instantly |
| Skipping the curl test | Always test before building | 30 seconds saves 3 hours |
| Assuming auth is simple | Verify auth method explicitly | Auth fails most often |
| "It worked last project" | Re-verify for this project | APIs change between uses |

## Exit Criteria

- [ ] Official current documentation found
- [ ] Exact endpoint, method, and params documented
- [ ] Auth method verified
- [ ] Real API call tested (curl/fetch)
- [ ] Response shape confirmed
- [ ] Findings documented in SCRATCHPAD
- [ ] Ready to implement with confidence

**Done when:** You've seen the API work with your own eyes, not just trusted what you think you remember.
