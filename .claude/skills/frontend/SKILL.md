---
name: frontend
description: Use when building React components, managing state, fetching data, or implementing any client-side functionality. The "how to build it" skill for UI.
---

# Frontend Skill

## Overview

Frontend is where users live. Every component should load fast, respond instantly, work offline-ish, and never show a broken state. If it doesn't work on mobile, it doesn't work.

## How Frontend Engineers Think

**"What state lives where?"**
State architecture is the foundation. Get it wrong and you're fighting re-renders, prop drilling, and sync bugs forever. Server data goes in React Query. Global UI state goes in Zustand. Local state stays local. Everything else is a mistake.

**"What does the user see while waiting?"**
Users see loading states more than you think. Skeleton screens, optimistic updates, progressive loading—these aren't polish, they're the experience. A spinner that lasts 2 seconds feels broken. A skeleton that appears instantly feels fast.

**"What happens when things break?"**
Networks fail. APIs error. Users do weird things. Every component needs a plan for loading, error, and empty states. If you only built the happy path, you built half a component.

### What Separates Amateurs from Professionals

Amateurs build components. Professionals build systems of components.

The amateur thinks: "This component works!"
The professional thinks: "This component handles loading, error, empty, mobile, keyboard navigation, and gracefully degrades when the API is slow."

When catching yourself testing only the happy path on desktop—STOP. You haven't finished the component.

## When to Use

- Building React/Vue/Angular components
- Managing application state
- Fetching and caching server data
- Implementing user interactions
- **NOT** for visual design decisions (use design-system skill)
- **NOT** for UX flow decisions (use ux skill)

## Component Architecture

### The Component Template

```typescript
export function MyComponent({ prop1, prop2, onAction }: Props) {
  // 1. HOOKS - All hooks at the top, same order every render
  const [localState, setLocalState] = useState(initialValue);
  const { data, isLoading, error } = useQuery(...);
  const router = useRouter();
  
  // 2. DERIVED STATE - Compute, don't store
  const computedValue = useMemo(() => 
    expensiveCalculation(data), 
    [data]
  );
  
  // 3. EFFECTS - Side effects with proper deps
  useEffect(() => {
    // Effect logic
    return () => { /* Cleanup */ };
  }, [dependency]);
  
  // 4. HANDLERS - Stable references with useCallback if passed down
  const handleClick = useCallback(() => {
    onAction(localState);
  }, [localState, onAction]);
  
  // 5. EARLY RETURNS - Loading, error, empty before main render
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data?.length) return <EmptyState onCreate={handleCreate} />;
  
  // 6. MAIN RENDER - Only reached when data is ready
  return (
    <div>
      {data.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  );
}
```

### Component Responsibilities

| Component Type | Responsibility | State |
|---------------|----------------|-------|
| Page | Layout, data fetching, routing | Server state via React Query |
| Container | Business logic, coordination | Derived from props/queries |
| Presentational | Render UI, handle events | Minimal local state |
| Primitive | Single UI element | None or simple toggle |

## State Architecture

### The State Decision Tree

```
Where does this state belong?

Is it from the server?
  └─ YES → React Query / SWR (not useState!)
  └─ NO ↓

Is it needed by unrelated components?
  └─ YES → Global store (Zustand)
  └─ NO ↓

Is it needed by parent or siblings?
  └─ YES → Lift to common parent
  └─ NO ↓

Is it only for this component?
  └─ YES → useState
```

### State Layers

```
┌─────────────────────────────────────────────────┐
│  SERVER STATE (React Query / SWR)               │
│  ✓ API responses                                │
│  ✓ Cached automatically                         │
│  ✓ Synced with server                          │
│  ✓ Shared across components                    │
├─────────────────────────────────────────────────┤
│  GLOBAL UI STATE (Zustand)                      │
│  ✓ Theme, sidebar, modals                      │
│  ✓ Current user session                        │
│  ✓ App-wide preferences                        │
├─────────────────────────────────────────────────┤
│  LOCAL STATE (useState)                         │
│  ✓ Form input values                           │
│  ✓ Open/closed toggles                         │
│  ✓ Hover/focus states                          │
└─────────────────────────────────────────────────┘
```

### React Query Pattern (Server State)

```typescript
// Define query hook
function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Define mutation hook
function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newProject) => 
      fetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify(newProject),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
    },
  });
}

// Use in component
function ProjectList() {
  const { data, isLoading, error } = useProjects();
  const createProject = useCreateProject();
  
  if (isLoading) return <Skeleton count={5} />;
  if (error) return <Error message={error.message} />;
  
  return <List items={data} onCreate={createProject.mutate} />;
}
```

### Zustand Pattern (Global UI State)

```typescript
// Create store
const useAppStore = create((set) => ({
  // State
  sidebarOpen: false,
  theme: 'light',
  
  // Actions
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}));

// Use anywhere - no provider needed
function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  // ...
}
```

## Data Fetching Patterns

### Loading States

| Duration | Treatment |
|----------|-----------|
| < 200ms | No indicator (feels instant) |
| 200ms - 1s | Skeleton screen |
| > 1s | Skeleton + "still loading" message |
| > 5s | Progress indicator + cancel option |

```typescript
// Skeleton while loading
if (isLoading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
```

### Optimistic Updates

```typescript
const likeMutation = useMutation({
  mutationFn: (postId) => likePost(postId),
  onMutate: async (postId) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['posts']);
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['posts']);
    
    // Optimistically update
    queryClient.setQueryData(['posts'], old =>
      old.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p)
    );
    
    return { previous };
  },
  onError: (err, postId, context) => {
    // Rollback on error
    queryClient.setQueryData(['posts'], context.previous);
  },
});
```

## Responsive Design

### Mobile-First Approach

```typescript
// Mobile-first: base styles are mobile, then add breakpoints
<div className="
  flex flex-col          /* Mobile: stack vertically */
  md:flex-row            /* Desktop: side by side */
  gap-4
  p-4 md:p-8             /* Larger padding on desktop */
">
```

### Touch Targets

```typescript
// Minimum 44px touch targets on mobile
<button className="
  min-h-[44px] min-w-[44px]
  p-3 md:p-2             /* Larger padding on mobile */
">
```

## Performance Patterns

### Prevent Unnecessary Re-renders

```typescript
// ❌ Inline objects cause re-renders every time
<Component style={{ color: 'red' }} />

// ✅ Stable reference
const style = useMemo(() => ({ color: 'red' }), []);
<Component style={style} />

// ❌ Inline functions cause re-renders
<Button onClick={() => handleClick(id)} />

// ✅ Stable callback
const handleButtonClick = useCallback(() => handleClick(id), [id]);
<Button onClick={handleButtonClick} />
```

### Lazy Loading

```typescript
// Lazy load heavy components
const HeavyChart = lazy(() => import('./HeavyChart'));

function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart />
    </Suspense>
  );
}
```

## Quick Reference

| Situation | Pattern |
|-----------|---------|
| Data from API | React Query with queryKey |
| Global UI state | Zustand store |
| Form inputs | useState (local) |
| Expensive calculation | useMemo |
| Stable callback | useCallback (if passed as prop) |
| Side effect | useEffect with cleanup |
| Loading state | Skeleton screen |
| Error state | Error boundary + inline error |

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| useState for API data | React Query / SWR | Handles caching, loading, errors |
| Props passed 3+ levels | Context or Zustand | Prop drilling is unmanageable |
| useEffect for derived state | useMemo | Don't sync what you can derive |
| No loading/error states | Always handle both | Users will see these |
| Fetching in useEffect raw | React Query | Handles race conditions, caching |
| Desktop-only testing | Mobile-first always | Most users are on mobile |
| Inline objects/functions | Stable references | Prevents re-render cascades |

## Exit Criteria

- [ ] Components follow standard structure
- [ ] State is in the right layer (server/global/local)
- [ ] All components handle loading, error, empty states
- [ ] Mobile responsive (44px touch targets, stacked layouts)
- [ ] No prop drilling beyond 2 levels
- [ ] Performance: no unnecessary re-renders
- [ ] Keyboard navigable
- [ ] Works offline-ish (graceful degradation)

**Done when:** The feature works on a slow 3G connection, on mobile, with the API being flaky—and the user still has a good experience.
