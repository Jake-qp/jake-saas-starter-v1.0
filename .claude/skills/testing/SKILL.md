---
name: testing
description: Use when setting up test frameworks, designing test strategies, or writing tests beyond TDD unit tests. The "how to be confident" skill.
---

# Testing Skill

## Overview

Tests buy confidence. The question isn't "do we have tests?" but "would these tests catch a bug before production?" Every test should earn its place by catching real problems, not just increasing coverage numbers.

## How QA Engineers Think

**"What would catch this bug?"**
Before writing a test, imagine the bugs. What could go wrong? A null user? A network timeout? A race condition? Write tests that catch those specific bugs. Tests that don't catch bugs are noise.

**"What's the cost/benefit of this test?"**
Tests have costs: time to write, time to run, time to maintain when they break. A flaky E2E test that catches nothing but wastes 10 minutes per run is negative value. A 50ms unit test that catches regressions is pure gold.

**"Can I trust this test?"**
A test that passes when code is broken is worse than no test—it gives false confidence. A test that fails randomly is worse than no test—it trains people to ignore failures. Tests must be trustworthy.

### What Separates Amateurs from Professionals

Amateurs measure test coverage percentages.
Professionals measure confidence that the system works.

The amateur thinks: "We have 80% coverage!"
The professional thinks: "We have tests for the critical paths, edge cases, and past bugs. We're confident we'd catch a regression."

When catching yourself writing tests just for coverage—STOP. Write tests that would actually catch bugs.

## When to Use

- Setting up test frameworks
- Designing test strategy for a feature
- Writing integration or E2E tests
- Debugging flaky tests
- **NOT** for TDD workflow (use tdd skill)
- **NOT** for debugging failures (use debugging skill)

## The Test Pyramid

```
              /\
             /  \
            / E2E \        Few (5-10%)
           /  slow  \      High confidence, high cost
          /----------\
         /            \
        / Integration  \   Some (20-30%)
       /   medium       \  Cross-boundary tests
      /------------------\
     /                    \
    /        Unit          \  Many (60-70%)
   /        fast            \  Isolated, focused
  /--------------------------\
```

### Layer Responsibilities

| Layer | What It Tests | Speed | Confidence |
|-------|--------------|-------|------------|
| Unit | Single function/component in isolation | Fast (ms) | Low (narrow) |
| Integration | Multiple components working together | Medium (s) | Medium |
| E2E | Full user flows through real system | Slow (10s+) | High (broad) |

### The Confidence Equation

```
Confidence = (Unit × many) + (Integration × some) + (E2E × few)
```

Don't E2E test what a unit test can catch. Don't unit test what needs integration context.

## Test Strategy by Feature Type

### CRUD Feature
```
Unit tests:
- Validation logic
- Business calculations
- Data transformations

Integration tests:
- API endpoints with database
- Full request → response cycle

E2E tests (one or two):
- Create → Read → Update → Delete happy path
- Critical error handling
```

### User Authentication
```
Unit tests:
- Password hashing/verification
- Token generation/validation
- Input validation

Integration tests:
- Login endpoint success/failure
- Session creation/retrieval
- Rate limiting

E2E tests:
- Full login flow
- Password reset flow
- Session timeout handling
```

## Writing Effective Tests

### The AAA Pattern

```typescript
test('calculates discount correctly for premium users', () => {
  // Arrange - Set up the scenario
  const user = createUser({ tier: 'premium' });
  const cart = createCart({ total: 100 });
  
  // Act - Perform the action
  const discount = calculateDiscount(user, cart);
  
  // Assert - Verify the outcome
  expect(discount).toBe(20); // 20% premium discount
});
```

### Test Names Are Documentation

```typescript
// ❌ Meaningless
test('discount test', () => { ... });
test('test1', () => { ... });

// ✅ Documents behavior
test('applies 20% discount for premium users', () => { ... });
test('rejects discount codes expired more than 24 hours ago', () => { ... });
test('returns 0 discount for carts under minimum threshold', () => { ... });
```

### Test the Behavior, Not the Implementation

```typescript
// ❌ Tests implementation details
test('calls calculateSubtotal then applyTax', () => {
  const spy1 = jest.spyOn(cart, 'calculateSubtotal');
  const spy2 = jest.spyOn(cart, 'applyTax');
  cart.getTotal();
  expect(spy1).toHaveBeenCalledBefore(spy2);
});

// ✅ Tests observable behavior
test('includes tax in total', () => {
  const cart = createCart({ items: [{ price: 100 }], taxRate: 0.1 });
  expect(cart.getTotal()).toBe(110);
});
```

## Edge Cases Checklist

For every function, test:

| Edge Case | Example |
|-----------|---------|
| Empty input | `[]`, `""`, `null`, `undefined` |
| Single item | Array with one element |
| Boundary values | 0, -1, MAX_INT, min/max allowed |
| Invalid types | String where number expected |
| Duplicate data | Same item twice |
| Missing fields | Partial objects |
| Concurrent calls | Race conditions |

```typescript
describe('calculateTotal', () => {
  test('returns 0 for empty cart', () => {
    expect(calculateTotal([])).toBe(0);
  });
  
  test('handles single item', () => {
    expect(calculateTotal([{ price: 10 }])).toBe(10);
  });
  
  test('rejects negative prices', () => {
    expect(() => calculateTotal([{ price: -5 }])).toThrow();
  });
  
  test('handles maximum cart size', () => {
    const items = Array(1000).fill({ price: 1 });
    expect(calculateTotal(items)).toBe(1000);
  });
});
```

## Integration Test Patterns

### API Endpoint Test

```typescript
describe('POST /api/projects', () => {
  test('creates project with valid data', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ name: 'Test Project', budget: 10000 });
    
    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe('Test Project');
    
    // Verify it's actually in the database
    const project = await db.project.findUnique({ where: { id: response.body.data.id } });
    expect(project).not.toBeNull();
  });
  
  test('returns 401 without authentication', async () => {
    const response = await request(app)
      .post('/api/projects')
      .send({ name: 'Test' });
    
    expect(response.status).toBe(401);
  });
  
  test('returns 400 for invalid data', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ name: '' });  // Empty name
    
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });
});
```

### Database Test with Cleanup

```typescript
describe('ProjectRepository', () => {
  beforeEach(async () => {
    await db.project.deleteMany();  // Clean slate
  });
  
  afterAll(async () => {
    await db.$disconnect();
  });
  
  test('finds projects by user', async () => {
    // Arrange
    await db.project.createMany({
      data: [
        { name: 'P1', userId: 'user1' },
        { name: 'P2', userId: 'user1' },
        { name: 'P3', userId: 'user2' },
      ],
    });
    
    // Act
    const projects = await repo.findByUser('user1');
    
    // Assert
    expect(projects).toHaveLength(2);
    expect(projects.every(p => p.userId === 'user1')).toBe(true);
  });
});
```

## E2E Test Patterns

### Playwright Example

```typescript
test('user can create and view a project', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Create project
  await page.click('text=New Project');
  await page.fill('[name="name"]', 'My Test Project');
  await page.fill('[name="budget"]', '10000');
  await page.click('button[type="submit"]');
  
  // Verify it appears in list
  await expect(page.locator('text=My Test Project')).toBeVisible();
  
  // Verify detail page
  await page.click('text=My Test Project');
  await expect(page.locator('h1')).toContainText('My Test Project');
  await expect(page.locator('[data-testid="budget"]')).toContainText('$10,000');
});
```

## Dealing with Flaky Tests

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Random failures | Race condition | Add proper waits/assertions |
| Fails only in CI | Environment difference | Match CI environment locally |
| Fails after other tests | Shared state | Proper cleanup in beforeEach |
| Timeout failures | Slow operation | Increase timeout or mock |

```typescript
// ❌ Flaky: Arbitrary timeout
await page.click('button');
await new Promise(r => setTimeout(r, 1000));
expect(await page.textContent('.result')).toBe('Done');

// ✅ Stable: Wait for actual condition
await page.click('button');
await expect(page.locator('.result')).toHaveText('Done');
```

## Quick Reference

| Test Type | When to Use |
|-----------|-------------|
| Unit | Pure functions, calculations, validation |
| Integration | API endpoints, database operations, service interactions |
| E2E | Critical user journeys, smoke tests |
| Snapshot | UI regression (use sparingly) |

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| Testing implementation | Testing behavior | Implementation changes; behavior shouldn't |
| 100% coverage goal | Confidence goal | Coverage doesn't equal correctness |
| E2E for everything | Right level for each test | E2E is slow and flaky |
| Ignoring flaky tests | Fix or delete them | Flaky tests erode trust |
| No edge case tests | Explicit edge case coverage | Bugs hide in edge cases |
| `setTimeout` for async | Proper async assertions | Timeouts are flaky |

## Exit Criteria

- [ ] Test strategy defined (what's unit vs integration vs E2E)
- [ ] Critical paths have integration tests
- [ ] Edge cases explicitly tested
- [ ] At least one E2E test for main flow
- [ ] No flaky tests
- [ ] Tests run in CI on every commit
- [ ] Test names document expected behavior
- [ ] Cleanup between tests (no shared state)

**Done when:** You'd bet money that if a bug existed, these tests would catch it.
