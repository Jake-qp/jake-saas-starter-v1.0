---
name: integration
description: Use when connecting to external APIs, third-party services, or building system integrations. When your app depends on systems you don't control.
---

# Integration Skill

## Overview

Integration is building on systems you don't control. They will go down. They will change. They will be slow. They will return errors you've never seen. Your job is to make your app resilient to all of it.

## How Integration Engineers Think

**"What if they're down?"**
Third-party services have outages. Stripe, Twilio, AWS—they all go down. What does your app do when they're unavailable? Show an error? Queue for later? Use cached data? Plan for failure before it happens.

**"What if they're slow?"**
Slow is worse than down. A 30-second timeout ties up your resources and makes users wait. Set aggressive timeouts. Fail fast. A quick error is better than a slow hang.

**"What if they change?"**
APIs change. Response formats evolve. Fields get deprecated. Don't parse their entire response—extract only what you need. Fail gracefully when unexpected data appears.

### What Separates Amateurs from Professionals

Amateurs call APIs and assume they'll work.
Professionals wrap APIs with timeouts, retries, circuit breakers, and fallbacks.

The amateur thinks: "I'll just call the Stripe API here."
The professional thinks: "What if Stripe is slow? What if Stripe is down? What if the response format changes? What if we hit rate limits?"

When catching yourself calling an external API without error handling—STOP. You're one outage away from cascading failure.

## When to Use

- Integrating payment processors (Stripe, PayPal)
- Adding auth providers (Auth0, Clerk, OAuth)
- Using communication APIs (Twilio, SendGrid)
- Connecting to any external service
- **AFTER** using verify-api skill to confirm API details

## The Integration Wrapper Pattern

Never call external APIs directly. Always wrap them.

```typescript
class StripeClient {
  private stripe: Stripe;
  private circuitBreaker: CircuitBreaker;
  
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      timeout: 10000,  // 10 second timeout
      maxNetworkRetries: 2,
    });
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 30000,
    });
  }
  
  async createCustomer(email: string): Promise<Customer | null> {
    return this.circuitBreaker.execute(async () => {
      try {
        const customer = await this.stripe.customers.create({ email });
        return {
          id: customer.id,
          email: customer.email,
          // Extract only what you need
        };
      } catch (error) {
        if (error instanceof Stripe.errors.StripeAPIError) {
          console.error('Stripe API Error:', {
            type: error.type,
            code: error.code,
            message: error.message,
          });
        }
        throw new IntegrationError('stripe', 'createCustomer', error);
      }
    });
  }
}
```

## Resilience Patterns

### Timeouts (Always Set Them)

```typescript
// ❌ No timeout - can hang forever
const response = await fetch(url);

// ✅ Explicit timeout
const response = await fetch(url, {
  signal: AbortSignal.timeout(10000),  // 10 seconds
});

// ✅ With timeout wrapper
async function fetchWithTimeout(url: string, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

| Operation Type | Recommended Timeout |
|---------------|---------------------|
| Simple GET | 5 seconds |
| Create/Update | 10 seconds |
| Payment processing | 30 seconds |
| File upload | 60 seconds |

### Retry with Exponential Backoff

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000 } = options;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      if (!isRetryable(error)) throw error;
      
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      const jitter = Math.random() * 1000;  // Prevent thundering herd
      await sleep(delay + jitter);
    }
  }
  throw new Error('Retry failed');
}

function isRetryable(error: unknown): boolean {
  // Retry on network errors and 5xx
  if (error instanceof TypeError) return true;  // Network error
  if (error instanceof Response) {
    return error.status >= 500 || error.status === 429;
  }
  return false;
}
```

**Retry these:** Network timeouts, 500/502/503/504, 429 (rate limit after delay)

**Don't retry these:** 400 (bad request), 401 (auth), 403 (forbidden), 404 (not found)

### Circuit Breaker

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailure: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private failureThreshold = 5,
    private resetTimeout = 30000
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailure > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }
  
  private onFailure() {
    this.failures++;
    this.lastFailure = Date.now();
    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }
}
```

**Circuit breaker states:**
- **Closed:** Normal operation, requests pass through
- **Open:** Too many failures, requests fail immediately
- **Half-open:** Testing if service recovered

### Fallback Strategies

| Scenario | Fallback Strategy |
|----------|------------------|
| Analytics service down | Queue events locally, send later |
| Payment processor slow | Show "processing" message, verify later |
| Email service down | Queue emails, retry with backoff |
| Geo API unavailable | Use cached location or skip feature |

```typescript
async function getExchangeRate(currency: string): Promise<number> {
  try {
    return await exchangeRateAPI.getRate(currency);
  } catch (error) {
    // Fallback to cached rate (may be stale)
    const cached = await cache.get(`exchange_rate:${currency}`);
    if (cached) {
      console.warn(`Using cached exchange rate for ${currency}`);
      return cached;
    }
    // Fallback to default
    console.error(`No exchange rate available for ${currency}`);
    throw new Error(`Exchange rate unavailable for ${currency}`);
  }
}
```

## Rate Limit Handling

```typescript
class RateLimitedClient {
  private requestQueue: Array<() => Promise<void>> = [];
  private processing = false;
  
  async request(fn: () => Promise<Response>): Promise<Response> {
    const response = await fn();
    
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
      console.warn(`Rate limited, retrying after ${retryAfter}s`);
      await sleep(retryAfter * 1000);
      return this.request(fn);  // Retry
    }
    
    return response;
  }
}
```

## Webhook Handling

```typescript
// Verify webhook signatures
export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature')!;
  
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed');
    return new Response('Invalid signature', { status: 400 });
  }
  
  // Idempotency: Check if we've processed this event
  const processed = await db.webhookEvent.findUnique({
    where: { eventId: event.id },
  });
  if (processed) {
    return new Response('Already processed', { status: 200 });
  }
  
  // Process the event
  try {
    await handleStripeEvent(event);
    await db.webhookEvent.create({ data: { eventId: event.id } });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return new Response('Processing failed', { status: 500 });
  }
  
  return new Response('OK', { status: 200 });
}
```

## Integration Testing

```typescript
describe('StripeClient', () => {
  // Use test mode / sandbox
  const client = new StripeClient(process.env.STRIPE_TEST_KEY);
  
  test('creates customer successfully', async () => {
    const customer = await client.createCustomer('test@example.com');
    expect(customer.id).toMatch(/^cus_/);
  });
  
  test('handles API errors gracefully', async () => {
    await expect(
      client.createCustomer('')  // Invalid email
    ).rejects.toThrow(IntegrationError);
  });
  
  test('handles timeout', async () => {
    // Mock slow response
    mockFetch.mockImplementation(() => new Promise(r => setTimeout(r, 15000)));
    await expect(client.createCustomer('test@example.com')).rejects.toThrow('timeout');
  });
});
```

## Quick Reference

| Concern | Solution |
|---------|----------|
| Service down | Circuit breaker + fallback |
| Service slow | Timeout + fast failure |
| Temporary failure | Retry with exponential backoff |
| Rate limited | Queue + respect Retry-After |
| API change | Extract only needed fields + validation |
| Secrets | Environment variables only |

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| No timeout | Always set timeout | Hangs tie up resources |
| Retry everything | Retry only retryable errors | 400s won't fix themselves |
| Parse entire response | Extract only what you need | Resilient to additions |
| Direct API calls | Wrapped with error handling | Consistent resilience |
| Secrets in code | Environment variables | Security |
| No webhook verification | Always verify signatures | Security |

## Exit Criteria

- [ ] API verified with verify-api skill first
- [ ] Wrapper class with consistent error handling
- [ ] Timeouts configured for all calls
- [ ] Retry logic with exponential backoff
- [ ] Circuit breaker for repeated failures
- [ ] Fallback strategy defined
- [ ] Rate limits understood and handled
- [ ] Webhooks verified with signatures
- [ ] Integration tested (with sandbox/test mode)
- [ ] Secrets in environment variables
- [ ] Documented in API-CONTRACTS.md

**Done when:** The external service can be slow, down, or returning errors—and your app handles it gracefully instead of falling over.
