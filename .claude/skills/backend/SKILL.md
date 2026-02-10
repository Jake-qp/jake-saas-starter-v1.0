---
name: backend
description: Use when building APIs, implementing business logic, or any server-side functionality. The "how to build it" skill for server code.
---

# Backend Skill

## Overview

Backend code runs without supervision. It handles malicious input, concurrent requests, partial failures, and unexpected load—while you're asleep. Every endpoint is a contract. Every operation must be safe to retry. Every failure must be recoverable.

## How Backend Engineers Think

**"What if this fails halfway through?"**
Operations get interrupted. Networks drop. Databases timeout. If a multi-step operation fails after step 2 of 5, what state is the system in? Can you recover? Can you retry safely? Design for partial failure from the start.

**"What if they call this twice?"**
Users double-click. Networks retry. Queues replay. Every operation should be idempotent—calling it twice should have the same result as calling it once. If creating a user twice creates two users, you have a bug.

**"What would a malicious user send?"**
Every input is hostile until validated. Every parameter is a lie until verified. The request didn't come from your UI—it came from curl. Validate everything. Trust nothing.

### What Separates Amateurs from Professionals

Amateurs build for the happy path.
Professionals build for the 3am outage when everything is on fire.

The amateur thinks: "If the request has these fields, do this."
The professional thinks: "Validate the fields. Check auth. Check authorization. Handle if the database is slow. Handle if the external API fails. Make it idempotent. Log what matters. Return useful errors."

When catching yourself only testing valid requests—STOP. You haven't tested the API.

## When to Use

- Creating API endpoints
- Implementing business logic
- Server-side data processing
- Background jobs and workers
- **NOT** for database schema (use database skill)
- **NOT** for deployment (use devops skill)

## The Endpoint Template

Every endpoint follows this structure:

```typescript
export async function POST(request: Request) {
  const requestId = generateRequestId();
  
  try {
    // 1. RATE LIMITING (before anything else)
    const rateLimit = await checkRateLimit(request);
    if (!rateLimit.ok) {
      return errorResponse(429, 'TOO_MANY_REQUESTS', 'Slow down', requestId);
    }
    
    // 2. AUTHENTICATION (who is calling?)
    const session = await getSession(request);
    if (!session) {
      return errorResponse(401, 'UNAUTHORIZED', 'Please log in', requestId);
    }
    
    // 3. INPUT VALIDATION (is the data valid?)
    const body = await request.json();
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid input', requestId, {
        details: validation.error.flatten(),
      });
    }
    
    // 4. AUTHORIZATION (can THIS user do THIS action?)
    const canAccess = await checkPermission(session.userId, validation.data);
    if (!canAccess) {
      return errorResponse(404, 'NOT_FOUND', 'Not found', requestId);
    }
    
    // 5. BUSINESS LOGIC (the actual work)
    const result = await performAction(validation.data, session.userId);
    
    // 6. RESPONSE
    return Response.json({ data: result }, { status: 201 });
    
  } catch (error) {
    // 7. ERROR HANDLING (never expose internals)
    console.error(`[${requestId}] Error:`, error);
    return errorResponse(500, 'SERVER_ERROR', 'Something went wrong', requestId);
  }
}
```

## Input Validation

**Validate everything. Assume everything is wrong.**

```typescript
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .trim(),
  budget: z.number()
    .positive('Budget must be positive')
    .max(1_000_000_000, 'Budget too large'),
  clientId: z.string()
    .uuid('Invalid client ID')
    .optional(),
});

// Type is inferred automatically
type CreateProjectInput = z.infer<typeof createProjectSchema>;
```

### Validation Patterns

| Input Type | Validations |
|------------|-------------|
| Strings | Min/max length, trim, allowed characters |
| Numbers | Type, min/max, integer vs float |
| IDs | Format (UUID), exists in database |
| Emails | Format, normalize (lowercase) |
| URLs | Protocol whitelist, valid format |
| Arrays | Min/max items, item validation |
| Dates | Format, reasonable range |

## Idempotency

**Every operation should be safe to retry.**

### Natural Idempotency
Some operations are naturally idempotent:
- GET (read) - always safe
- PUT (replace) - same input = same result
- DELETE (remove) - deleting twice = deleted

### Artificial Idempotency
Create operations need idempotency keys:

```typescript
export async function POST(request: Request) {
  const idempotencyKey = request.headers.get('Idempotency-Key');
  
  if (idempotencyKey) {
    // Check if we've seen this request before
    const existing = await cache.get(`idempotency:${idempotencyKey}`);
    if (existing) {
      return Response.json(existing); // Return cached result
    }
  }
  
  // Process the request
  const result = await createProject(data);
  
  if (idempotencyKey) {
    // Cache result for 24 hours
    await cache.set(`idempotency:${idempotencyKey}`, result, 86400);
  }
  
  return Response.json(result, { status: 201 });
}
```

## Error Handling

### Error Response Contract

```typescript
interface ErrorResponse {
  error: string;       // Human-readable message
  code: string;        // Machine-readable code
  requestId: string;   // For debugging
  details?: object;    // Additional context (validation errors)
}

function errorResponse(
  status: number,
  code: string,
  message: string,
  requestId: string,
  extra?: object
): Response {
  return Response.json({
    error: message,
    code,
    requestId,
    ...extra,
  }, { status });
}
```

### Status Code Guide

| Code | When | Example |
|------|------|---------|
| 200 | Success with body | GET returns data |
| 201 | Created | POST creates resource |
| 204 | Success, no body | DELETE succeeds |
| 400 | Bad input | Validation failed |
| 401 | Not logged in | No/invalid token |
| 403 | Not allowed | Valid user, wrong permissions |
| 404 | Not found | Resource doesn't exist OR not authorized |
| 409 | Conflict | Duplicate entry |
| 429 | Too many requests | Rate limit hit |
| 500 | Server error | Something broke |

**Important:** Return 404 (not 403) when user lacks permission. This prevents attackers from discovering valid resource IDs.

## Business Logic Patterns

### Keep Handlers Thin

```typescript
// ❌ Business logic in handler
export async function POST(request: Request) {
  const { name, budget, clientId } = await request.json();
  
  // 50 lines of business logic mixed with HTTP concerns
  
  return Response.json(result);
}

// ✅ Handler orchestrates, service does work
export async function POST(request: Request) {
  const session = await getSession(request);
  const data = createProjectSchema.parse(await request.json());
  
  const project = await projectService.create(data, session.userId);
  
  return Response.json({ data: project }, { status: 201 });
}

// Business logic is testable in isolation
class ProjectService {
  async create(input: CreateProjectInput, userId: string): Promise<Project> {
    // All business logic here
    // Easy to unit test without HTTP
  }
}
```

### Transaction Patterns

```typescript
// Wrap related operations in transaction
async function transferFunds(fromId: string, toId: string, amount: number) {
  return await db.$transaction(async (tx) => {
    // Debit from source
    const from = await tx.account.update({
      where: { id: fromId },
      data: { balance: { decrement: amount } },
    });
    
    if (from.balance < 0) {
      throw new Error('Insufficient funds');
    }
    
    // Credit to destination
    await tx.account.update({
      where: { id: toId },
      data: { balance: { increment: amount } },
    });
    
    return { success: true };
  });
}
```

## Pagination

**Always paginate lists. Always.**

```typescript
// Request: GET /api/projects?page=1&limit=20
const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));
const skip = (page - 1) * limit;

const [projects, total] = await Promise.all([
  db.project.findMany({ skip, take: limit, where: filters }),
  db.project.count({ where: filters }),
]);

return Response.json({
  data: projects,
  pagination: {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  },
});
```

## Logging

**Log what you'd need to debug at 3am.**

```typescript
// Request start
console.log(JSON.stringify({
  event: 'request_start',
  requestId,
  method: request.method,
  path: new URL(request.url).pathname,
  userId: session?.userId,
}));

// Business events (not every line)
console.log(JSON.stringify({
  event: 'project_created',
  requestId,
  projectId: project.id,
  userId: session.userId,
}));

// Errors with context
console.error(JSON.stringify({
  event: 'error',
  requestId,
  error: error.message,
  stack: error.stack,
  userId: session?.userId,
}));
```

## Quick Reference

| Situation | Pattern |
|-----------|---------|
| New endpoint | Use the endpoint template |
| List endpoint | Always paginate |
| Create endpoint | Add idempotency key support |
| Delete endpoint | Soft delete or check dependencies |
| Update endpoint | Use transactions for related data |
| Sensitive operation | Add audit logging |

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| Business logic in handlers | Thin handlers, service layer | Testability, reusability |
| 403 for unauthorized | 404 (don't reveal existence) | Security: prevent enumeration |
| No idempotency | Idempotency keys for creates | Retries create duplicates |
| console.log(request) | Structured logging with requestId | Debuggability at scale |
| No pagination | Always paginate lists | Memory and performance |
| Auth check some endpoints | Auth check ALL endpoints | Easy to miss one |

## Exit Criteria

- [ ] All endpoints follow the template structure
- [ ] Input validation with Zod (or equivalent)
- [ ] Authentication on all protected endpoints
- [ ] Authorization at the data layer (not just route)
- [ ] Consistent error response format
- [ ] Pagination on all list endpoints
- [ ] Idempotency for create operations
- [ ] Structured logging with request IDs
- [ ] Business logic in service layer
- [ ] API documented (request/response/errors)

**Done when:** You could replay any request, get consistent results, and debug any failure from the logs alone.
