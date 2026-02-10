---
name: performance
description: Use when pages load slowly, before launch scaling review, or when handling large datasets. Measure first, optimize second.
---

# Performance Skill

## Overview

Performance is user experience measured in milliseconds. Every 100ms of delay loses users. Every KB of JavaScript blocks the main thread. Measure first, then optimize the bottleneck—not what you guess is slow.

## How Performance Engineers Think

**"What's the actual bottleneck?"**
Intuition lies. Profilers don't. Before optimizing anything, measure. The slow thing is rarely what you think it is. A 10x improvement to something that takes 5ms is worthless. A 2x improvement to something that takes 500ms is gold.

**"What's blocking the user?"**
Users perceive "fast" when they can see content and interact. Time to First Byte doesn't matter if the page then takes 3 seconds to become interactive. Optimize for what the user experiences, not what the server measures.

**"What's the cost of this code?"**
Every line of JavaScript ships to users. Every dependency bloats the bundle. Every animation can jank. Think about the cost before adding complexity. Sometimes the fastest code is no code.

### What Separates Amateurs from Professionals

Amateurs optimize based on intuition.
Professionals optimize based on profiling data.

The amateur thinks: "This function looks slow, let me optimize it."
The professional thinks: "Let me profile to find what's actually slow. Oh, it's not where I expected."

When catching yourself optimizing without measuring first—STOP. You're probably optimizing the wrong thing.

## When to Use

- Page loads feel slow
- Users report lag or unresponsiveness
- Before launch scaling review
- Handling large datasets
- **NOT** during initial development (premature optimization)
- **NOT** without measuring first (guess-driven optimization)

## The Performance Workflow

```
1. MEASURE  → Identify the actual bottleneck
2. ANALYZE  → Understand why it's slow
3. FIX      → Address root cause
4. VERIFY   → Confirm improvement with data
```

**Skip none of these steps.** Especially not step 1.

## Core Web Vitals (The Standards)

| Metric | Target | What It Measures |
|--------|--------|------------------|
| LCP | < 2.5s | Largest Contentful Paint - when main content appears |
| INP | < 200ms | Interaction to Next Paint - input responsiveness |
| CLS | < 0.1 | Cumulative Layout Shift - visual stability |

### Measuring Core Web Vitals

```javascript
// In browser console
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.value}`);
  }
}).observe({ type: 'largest-contentful-paint', buffered: true });

// Or use web-vitals library
import { onLCP, onINP, onCLS } from 'web-vitals';
onLCP(console.log);
onINP(console.log);
onCLS(console.log);
```

### Tools
- **Lighthouse:** Dev tools → Lighthouse tab
- **PageSpeed Insights:** https://pagespeed.web.dev/
- **Chrome DevTools Performance tab:** Record and analyze

## Frontend Performance

### JavaScript Bundle Size

**The problem:** Every KB of JS blocks the main thread during parse/compile.

```bash
# Analyze bundle size
npm run build -- --analyze
# or
npx source-map-explorer dist/*.js
```

| Bundle Size | User Impact |
|-------------|-------------|
| < 100 KB | Fast on 3G |
| 100-300 KB | Acceptable |
| 300-500 KB | Slow on mobile |
| > 500 KB | Unacceptable |

**Fixes:**

```typescript
// ❌ Import entire library
import { format } from 'date-fns';  // Imports everything

// ✅ Import only what you need
import format from 'date-fns/format';  // Just this function

// ❌ Eager load everything
import HeavyChart from './HeavyChart';

// ✅ Lazy load heavy components
const HeavyChart = lazy(() => import('./HeavyChart'));
```

### Image Optimization

| Format | Use For |
|--------|---------|
| WebP | Photos, complex images (30% smaller than JPEG) |
| AVIF | Best compression (if browser support ok) |
| SVG | Icons, logos, simple graphics |
| PNG | Transparency needed, simple images |

```tsx
// ✅ Next.js Image (auto-optimizes)
import Image from 'next/image';
<Image src="/hero.jpg" width={800} height={400} priority />

// ✅ Lazy loading (native)
<img src="image.jpg" loading="lazy" />

// ✅ Responsive images
<img 
  srcSet="small.jpg 400w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 400px, 800px"
/>
```

### Render Performance

```typescript
// ❌ Causes re-renders every time
<Component style={{ color: 'red' }} />

// ✅ Stable reference
const style = useMemo(() => ({ color: 'red' }), []);
<Component style={style} />

// ❌ Expensive calculation on every render
function List({ items }) {
  const sorted = items.sort((a, b) => a.name.localeCompare(b.name));
  return sorted.map(item => <Item key={item.id} item={item} />);
}

// ✅ Memoized calculation
function List({ items }) {
  const sorted = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );
  return sorted.map(item => <Item key={item.id} item={item} />);
}
```

### Layout Shift Prevention

```tsx
// ❌ Causes layout shift when image loads
<img src="photo.jpg" />

// ✅ Reserve space with dimensions
<img src="photo.jpg" width={400} height={300} />

// ❌ Injected content shifts layout
{isLoaded && <Banner />}

// ✅ Reserve space even when empty
<div style={{ minHeight: 60 }}>
  {isLoaded && <Banner />}
</div>
```

## Backend Performance

### Database Query Optimization

**Always EXPLAIN ANALYZE:**

```sql
EXPLAIN ANALYZE SELECT * FROM projects WHERE user_id = '123';

-- Good: "Index Scan" with low row count
-- Bad: "Seq Scan" on large table
-- Bad: High "actual rows" vs "estimated rows"
```

**Common fixes:**

| Problem | Solution |
|---------|----------|
| Seq Scan | Add index on filtered column |
| N+1 queries | Use JOIN or batch loading |
| Slow aggregation | Add index on GROUP BY column |
| Large result sets | Add pagination |

```typescript
// ❌ N+1: Queries database per item
const posts = await db.post.findMany();
for (const post of posts) {
  post.author = await db.user.findUnique({ where: { id: post.userId } });
}

// ✅ Single query with join
const posts = await db.post.findMany({
  include: { author: true },
});
```

### API Response Time

| Response Time | User Perception |
|---------------|-----------------|
| < 100ms | Instant |
| 100-300ms | Fast |
| 300-1000ms | Noticeable delay |
| > 1000ms | Slow |

**Optimization strategies:**

```typescript
// ✅ Parallel requests instead of sequential
const [users, projects, stats] = await Promise.all([
  getUsers(),
  getProjects(),
  getStats(),
]);

// ✅ Caching for expensive operations
const cached = await cache.get(key);
if (cached) return cached;

const result = await expensiveOperation();
await cache.set(key, result, TTL);
return result;

// ✅ Response compression (usually automatic in framework)
// ✅ CDN for static assets
// ✅ Connection pooling for database
```

### Caching Strategy

| Cache Type | TTL | Use For |
|------------|-----|---------|
| Browser cache | Long (1 year) | Static assets (versioned) |
| CDN cache | Medium (1 hour) | API responses that rarely change |
| Application cache | Short (1-5 min) | Expensive computations |
| No cache | - | User-specific data, real-time data |

```typescript
// Cache headers
response.headers.set('Cache-Control', 'public, max-age=3600'); // 1 hour
response.headers.set('Cache-Control', 'private, no-cache');     // No caching
```

## Profiling Checklist

### Frontend
```bash
1. Open DevTools → Performance tab
2. Click Record
3. Perform the slow action
4. Stop recording
5. Look for:
   - Long tasks (> 50ms) blocking main thread
   - Layout thrashing (forced reflow)
   - Excessive re-renders
```

### Backend
```bash
1. Add timing to suspicious code
   console.time('operation');
   await operation();
   console.timeEnd('operation');

2. Use APM tool (DataDog, New Relic)
   
3. Database: EXPLAIN ANALYZE every slow query

4. Look for:
   - N+1 queries
   - Missing indexes
   - Unoptimized queries
```

## Quick Reference

| Symptom | Likely Cause | Investigation |
|---------|--------------|---------------|
| Slow initial load | Large bundle | Analyze bundle, lazy load |
| Slow after interaction | Heavy computation | Profile main thread |
| Layout jumps | Missing dimensions | Check CLS, reserve space |
| Slow API | Database or N+1 | EXPLAIN ANALYZE, check queries |
| Slow database | Missing index | Add index on WHERE columns |

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| Optimizing without measuring | Profile first, always | Intuition lies |
| Optimizing everything | Optimizing the bottleneck | 80/20 rule |
| Premature optimization | Optimize when it matters | Clarity first |
| Caching everything | Strategic caching | Cache has costs too |
| Ignoring mobile | Test on real slow devices | Most users are mobile |

## Exit Criteria

- [ ] Core Web Vitals in green (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- [ ] Bundle size reasonable (< 300KB for main bundle)
- [ ] No N+1 database queries
- [ ] Database queries < 100ms (with indexes)
- [ ] API responses < 200ms (P95)
- [ ] Profiling shows no obvious bottlenecks
- [ ] Tested on slow 3G / mobile device

**Done when:** The app feels fast on a 3-year-old phone on a slow connection—and you have the metrics to prove it.
