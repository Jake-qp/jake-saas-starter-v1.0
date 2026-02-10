---
name: error-handling
description: Use when implementing any feature, after happy path works, or when users might encounter failures. Before marking any feature complete.
---

# Error Handling Skill

## Overview

Errors are not edge cases—they're guaranteed events. Networks fail, servers crash, users do unexpected things. Your job is to make failure graceful: preserve user work, explain what happened, and provide a path forward.

## How SREs Think About Errors

**"What are all the ways this can fail?"**
Happy paths are easy. Production is defined by sad paths. For every operation, ask: what if the network dies? What if the server is slow? What if the data is malformed? What if the user does something unexpected? Plan for these before they happen.

**"Fail gracefully, not catastrophically."**
When something breaks, the user shouldn't lose their work, see a stack trace, or wonder what happened. They should see a clear message, keep their data, and have an obvious next step. Partial success beats total failure.

**"What would I want to see at 3am?"**
When you're paged in the middle of the night, you need context: what failed, where, why, and how to fix it. Log the right things. Include request IDs. Make debugging possible without reproducing the issue.

### What Separates Amateurs from Professionals

Amateurs handle the happy path and hope errors don't happen.
Professionals design for failure as a first-class concern.

The amateur thinks: "I'll add a try/catch around this."
The professional thinks: "What are all the failure modes, and what happens in each?"

When catching yourself only testing the happy path—STOP. You haven't finished the feature.

## When to Use

- After happy path implementation works
- Before marking ANY feature complete
- When adding external API calls
- When handling user input
- **NOT** for debugging existing errors (use debugging skill)

## The Failure Mode Inventory

Before writing error handling, list every way the operation can fail:

| Operation | Failure Mode | Impact | Recovery |
|-----------|--------------|--------|----------|
| API call | Network timeout | No data | Retry with backoff |
| API call | 500 error | No data | Show cached/retry |
| Form submit | Validation fail | Can't proceed | Show field errors |
| Form submit | Server reject | Data lost? | Preserve input, retry |
| Data load | Empty response | Nothing to show | Empty state |
| Auth | Token expired | Blocked | Re-auth flow |

## Error Categories

| Category | Status | User Message Pattern | Log Level |
|----------|--------|---------------------|-----------|
| Validation | 400 | Field-specific errors | Info |
| Auth | 401 | "Please log in again" | Warning |
| Forbidden | 403 | "You don't have access" | Warning |
| Not Found | 404 | "Couldn't find that" | Info |
| Rate Limit | 429 | "Slow down, try in X seconds" | Warning |
| Server | 500 | "We're having trouble" | Error |
| Network | - | "Check your connection" | Warning |
| Timeout | - | "Taking too long, try again" | Warning |

## User-Facing Error Messages

Every error message must answer two questions:

```
1. What happened? (in plain language)
2. What can I do about it? (actionable next step)
```

### Bad vs Good Messages

| ❌ Useless | ✅ Actionable |
|-----------|---------------|
| "Error" | "Couldn't save. Tap to retry." |
| "Something went wrong" | "Couldn't save your project. Your changes are still here—try again." |
| "500 Internal Server Error" | "We're having trouble right now. Try again in a few minutes." |
| "ECONNREFUSED" | "Can't reach the server. Check your internet connection." |
| "ValidationError: name required" | "Please enter a project name." |
| "TypeError: undefined" | "Something unexpected happened. Refresh and try again." |
| "Request failed" | "Couldn't load your data. Tap to retry." |

### The Template

```
[What happened in plain language]. [What to do about it].
```

Examples:
- "Couldn't load your projects. Tap to retry."
- "That email is already registered. Try logging in instead."
- "Your session expired. Please log in again."
- "File too large (max 10MB). Choose a smaller file."

## Graceful Degradation

When something fails, don't fail completely:

| Scenario | ❌ Catastrophic | ✅ Graceful |
|----------|----------------|-------------|
| One API fails | Whole page crashes | Show rest of page + error for that section |
| Image fails to load | Broken image icon | Placeholder with retry |
| Real-time fails | Silent failure | Fall back to polling |
| Offline | Block everything | Show cached data + offline indicator |

## Preserve User Work (CRITICAL)

**Never lose user input on error.**

```typescript
// ❌ WRONG: Clears form on error
try {
  await saveProject(formData);
  setFormData({}); // Clears even on failure
} catch (e) {
  showError(e);
}

// ✅ RIGHT: Preserves input, only clears on success
try {
  await saveProject(formData);
  setFormData({}); // Only on success
  showSuccess('Saved!');
} catch (e) {
  showError('Couldn\'t save. Your changes are still here—try again.');
  // formData is preserved, user can retry
}
```

## Retry Logic

Transient failures deserve automatic retry:

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Retry failed');
}
```

**Retry these:** Network timeouts, 502/503/504, rate limits (after delay)

**Don't retry these:** 400 (bad request), 401 (auth), 403 (forbidden), 404 (not found)

## Error Response Contract

```typescript
interface ErrorResponse {
  error: string;         // User-friendly message
  code: string;          // Machine-readable (VALIDATION_ERROR, etc.)
  details?: FieldError[];// Validation field errors
  requestId?: string;    // For debugging/support
}

interface FieldError {
  field: string;
  message: string;
}
```

## Backend Error Handler

```typescript
export function handleError(error: unknown, requestId: string): Response {
  // Log full error for debugging
  console.error(`[${requestId}] Error:`, error);
  
  if (error instanceof ValidationError) {
    return Response.json({
      error: 'Please check your input',
      code: 'VALIDATION_ERROR',
      details: error.fields,
      requestId,
    }, { status: 400 });
  }
  
  if (error instanceof AuthError) {
    return Response.json({
      error: 'Please log in again',
      code: 'UNAUTHORIZED',
      requestId,
    }, { status: 401 });
  }
  
  if (error instanceof NotFoundError) {
    return Response.json({
      error: 'Couldn\'t find that',
      code: 'NOT_FOUND',
      requestId,
    }, { status: 404 });
  }
  
  // Unknown errors - don't expose details
  return Response.json({
    error: 'Something went wrong. Please try again.',
    code: 'SERVER_ERROR',
    requestId, // User can report this for debugging
  }, { status: 500 });
}
```

## Frontend Error Boundary

```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, info) {
    // Log to error tracking service
    console.error('Uncaught error:', error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          message="Something went wrong"
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }
    return this.props.children;
  }
}
```

## Quick Reference

| Situation | Pattern |
|-----------|---------|
| API call | try/catch + user message + preserve state |
| Form submit | Validate first + preserve on failure + retry |
| Data load | Loading → success/error states + retry |
| Network issue | Detect offline + show indicator + queue |
| Rate limit | Show countdown + auto-retry after delay |
| Auth expired | Redirect to login + preserve intended destination |

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| "Something went wrong" | "[What happened]. [What to do]." | Generic messages don't help |
| Showing stack traces | Human-readable messages | Users can't interpret traces |
| Clearing form on error | Preserving user input | Lost work is unforgivable |
| Silent failures | Visible error + retry option | Users think it worked |
| Retrying 400 errors | Only retry transient failures | 400s won't fix themselves |
| console.log(error) | Structured logging with requestId | Need context for debugging |

## Exit Criteria

- [ ] All failure modes identified for each operation
- [ ] Every API call wrapped in error handling
- [ ] User-facing messages are actionable (what + what to do)
- [ ] User work is preserved on error
- [ ] Retry logic for transient failures
- [ ] Error responses follow standard contract
- [ ] No stack traces visible to users
- [ ] RequestId included for debugging

**Done when:** A user who hits an error knows what happened, hasn't lost their work, and knows exactly what to do next.
