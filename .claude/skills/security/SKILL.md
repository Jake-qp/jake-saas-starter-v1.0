---
name: security
description: Use when implementing auth, handling user data, creating API endpoints, processing payments, or before any launch. Security review before code ships.
---

# Security Skill

## Overview

Security is not a feature—it's a property of every feature. Every input is untrusted. Every user could be malicious. Every endpoint is a potential attack surface. Your job is to make exploitation hard and detection easy.

## How Security Engineers Think

**"What could a malicious user do here?"**
For every feature, assume an attacker is looking at it. What if they send unexpected input? What if they manipulate the request? What if they bypass the frontend entirely? The attacker doesn't use your UI—they use curl.

**"Defense in depth."**
No single control is enough. Validate on the frontend AND backend. Check permissions at the route AND the data layer. Hash passwords AND rate-limit logins. Layers matter because individual layers fail.

**"Trust nothing from the client."**
Every request could be forged. Every parameter could be tampered. Every cookie could be stolen. Validate everything server-side. The client is in enemy territory.

### What Separates Amateurs from Professionals

Amateurs add security as an afterthought.
Professionals think about attack vectors during design.

The amateur thinks: "I'll add auth to this endpoint."
The professional thinks: "What if someone calls this endpoint with a forged user ID? What if they're authenticated but not authorized? What if they send 10,000 requests per second?"

When catching yourself assuming users will behave—STOP. Assume they won't.

## When to Use

- Implementing authentication/authorization
- Creating any API endpoint
- Handling personal information (PII)
- Processing payments
- Before `/launch` command
- **Every feature** (security is not optional)

## The Attacker Mindset Review

For every feature, ask these questions:

| Question | What You're Checking |
|----------|---------------------|
| Can I call this without auth? | Missing authentication |
| Can I access other users' data? | Broken authorization (IDOR) |
| Can I inject code/SQL/scripts? | Injection vulnerabilities |
| Can I exhaust resources? | DoS via rate limiting gaps |
| Can I leak data through errors? | Information disclosure |
| Can I bypass the frontend? | Client-side only validation |

## Authentication Checklist

| Control | Implementation | Why |
|---------|---------------|-----|
| Password hashing | bcrypt or argon2, never SHA/MD5 | Hashing algorithms matter |
| Secure sessions | httpOnly, secure, sameSite=strict | Prevent XSS/CSRF token theft |
| Rate limiting | Max 5 attempts/minute per IP+user | Stop brute force |
| Account lockout | Lock after 10 failures, time-based reset | Slow down attacks |
| Password reset | Time-limited token, single use | Prevent token reuse |
| Session expiry | Reasonable timeout, force re-auth for sensitive ops | Limit exposure window |

```typescript
// ✅ Secure cookie settings
const sessionCookie = {
  httpOnly: true,      // JS can't read it
  secure: true,        // HTTPS only
  sameSite: 'strict',  // No cross-site sending
  maxAge: 60 * 60 * 24 // 24 hour expiry
};
```

## Authorization Checklist

| Control | Implementation | Why |
|---------|---------------|-----|
| Route-level auth | Check session on every protected route | No unauthenticated access |
| Resource ownership | Verify user owns/can access resource | Prevent IDOR |
| Role verification | Check role has permission for action | Least privilege |
| Data-layer checks | Verify permissions at DB query level | Defense in depth |

```typescript
// ✅ Check ownership at data layer, not just route
async function getProject(projectId: string, userId: string) {
  const project = await db.project.findFirst({
    where: { 
      id: projectId,
      // Ownership check AT THE QUERY
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } }
      ]
    }
  });
  
  if (!project) {
    throw new NotFoundError(); // Same error for "not found" and "not yours"
  }
  
  return project;
}
```

**Critical:** Return the same error for "doesn't exist" and "not authorized." Different errors let attackers enumerate valid IDs.

## Input Validation

**Validate everything. Trust nothing.**

```typescript
// ✅ Server-side validation (Zod example)
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  budget: z.number().positive().max(1_000_000_000),
  clientId: z.string().uuid(),
});

export async function POST(request: Request) {
  const body = await request.json();
  
  // Validation throws on invalid input
  const data = createProjectSchema.parse(body);
  
  // data is now typed AND validated
  return createProject(data);
}
```

| Input Type | Validation |
|------------|------------|
| Strings | Max length, allowed characters, sanitize HTML |
| Numbers | Type check, min/max bounds, integer vs float |
| IDs | Format validation (UUID), existence check |
| Files | Size limit, type whitelist, virus scan |
| URLs | Protocol whitelist (https), domain validation |

## API Security

Every endpoint needs:

```typescript
export async function handler(request: Request) {
  // 1. Rate limiting (before anything else)
  const rateLimit = await checkRateLimit(request);
  if (!rateLimit.ok) {
    return new Response('Too many requests', { status: 429 });
  }
  
  // 2. Authentication
  const session = await getSession(request);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // 3. Input validation
  const body = await request.json();
  const data = schema.safeParse(body);
  if (!data.success) {
    return Response.json({ error: 'Invalid input' }, { status: 400 });
  }
  
  // 4. Authorization (can THIS user do THIS action?)
  const canAccess = await checkPermission(session.userId, data.resourceId);
  if (!canAccess) {
    return new Response('Not found', { status: 404 }); // Not 403!
  }
  
  // 5. Business logic
  // ...
}
```

## Secrets Management

**Never in code. Never in logs. Never in errors.**

| ❌ Wrong | ✅ Right |
|---------|----------|
| `const API_KEY = "sk_live_..."` | `const API_KEY = process.env.API_KEY` |
| `console.log('Request:', request)` | `console.log('Request to:', request.url)` |
| `{ error: "DB connection failed: password=..." }` | `{ error: "Database unavailable" }` |
| `.env` in git | `.env` in `.gitignore` |

**Pre-commit check:** Scan for secrets before every commit.

```bash
# .git/hooks/pre-commit
if git diff --cached | grep -E "(sk_live|api_key|password|secret)" ; then
  echo "BLOCKED: Potential secret in commit"
  exit 1
fi
```

## Common Vulnerabilities

| Vulnerability | Attack | Prevention |
|--------------|--------|------------|
| SQL Injection | `'; DROP TABLE users;--` | Parameterized queries, ORMs |
| XSS | `<script>steal(cookies)</script>` | Escape output, CSP headers |
| CSRF | Forged form submission | SameSite cookies, CSRF tokens |
| IDOR | Change `userId=123` to `userId=456` | Ownership checks at data layer |
| Mass Assignment | Add `isAdmin=true` to request | Whitelist allowed fields |
| Path Traversal | `../../../etc/passwd` | Validate/sanitize file paths |

## Error Messages

**Errors should help users, not attackers.**

| ❌ Leaky | ✅ Safe |
|---------|--------|
| "User admin@example.com not found" | "Invalid email or password" |
| "Password must match: correcthorse" | "Invalid email or password" |
| "SQL Error: SELECT * FROM users WHERE..." | "Something went wrong" |
| "Access denied to project 12345" | "Not found" |

## Security Headers

```typescript
// Set security headers on all responses
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
```

## Quick Reference

| Situation | Security Control |
|-----------|-----------------|
| User login | Hash passwords, rate limit, secure cookies |
| API endpoint | Auth + authz + validation + rate limit |
| Database query | Parameterized, ownership in WHERE clause |
| File upload | Size limit, type whitelist, separate storage |
| Error response | Generic message, log details server-side |
| Third-party data | Validate as strictly as user input |

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| Auth check in frontend only | Auth check on server | Frontends are bypassable |
| Different errors for "not found" vs "forbidden" | Same error for both | Prevents enumeration |
| `SELECT * FROM users WHERE id = ${id}` | Parameterized query | SQL injection |
| Logging full request bodies | Logging only safe fields | Secrets leak into logs |
| Trusting `userId` from client | Getting `userId` from session | Client data is forgeable |

## Exit Criteria

- [ ] All endpoints require authentication (or explicitly public)
- [ ] Authorization checks at route AND data layer
- [ ] All input validated server-side
- [ ] Passwords hashed with bcrypt/argon2
- [ ] Sessions use httpOnly, secure, sameSite cookies
- [ ] Rate limiting on auth endpoints
- [ ] No secrets in code or logs
- [ ] Error messages don't leak information
- [ ] Ownership verified for all resource access
- [ ] Security headers set

**Done when:** You could hand the codebase to a penetration tester and sleep soundly.
