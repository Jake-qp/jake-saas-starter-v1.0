---
name: mobile
description: Use when building mobile apps (React Native, Flutter) or ensuring web apps work well on mobile devices. Touch-first, offline-ready.
---

# Mobile Skill

## Overview

Mobile is where your users are. Thumbs are imprecise. Networks are unreliable. Attention is fleeting. Battery is precious. If it doesn't work on a phone in the subway with spotty connection, it doesn't work.

## How Mobile Engineers Think

**"Can they use this with one thumb?"**
Most users hold their phone in one hand and use their thumb. The bottom of the screen is easy. The top corners are hard. Put primary actions where thumbs can reach. Make touch targets big enough for imprecise taps.

**"What if they're offline?"**
Mobile users go through tunnels, elevators, and dead zones. They switch between WiFi and cellular. Your app can't just break. Cache aggressively. Queue actions for later. Always show something, even if it's stale.

**"Is this worth the battery?"**
Every network request, animation, and background process costs battery. Users notice when your app drains their phone. Be efficient. Batch requests. Avoid polling. Respect the user's device.

### What Separates Amateurs from Professionals

Amateurs shrink their desktop app for small screens.
Professionals design for mobile context from the start.

The amateur thinks: "It works on desktop, let's make it responsive."
The professional thinks: "Mobile users are distracted, on-the-go, and using their thumbs. How do we serve that context?"

When catching yourself designing desktop-first and adapting to mobile—STOP. Start with mobile constraints and expand up.

## When to Use

- Building React Native or Flutter apps
- Building responsive web apps
- When user context indicates mobile usage
- Optimizing for touch interfaces
- **ALWAYS** consider mobile (most users are on phones)

## Touch-First Design

### Touch Target Sizes

```css
/* Minimum touch targets */
.button {
  min-height: 44px;  /* iOS HIG */
  min-width: 44px;
  padding: 12px 16px;
}

/* Spacing between targets */
.button-group {
  gap: 8px;  /* Prevent mis-taps */
}
```

| Element | Minimum Size | Notes |
|---------|--------------|-------|
| Buttons | 44 × 44 px | Apple HIG / Material |
| List items | 48px height | Easy to tap |
| Form inputs | 44px height | Easy to select |
| Icon buttons | 44 × 44 px | Tap area, not icon size |

### Thumb Zone

```
┌─────────────────────────┐
│      HARD TO REACH      │  ← Top corners require stretch
│                         │
│    OKAY                 │
│                         │
│                         │
│    EASY - PRIMARY       │  ← Bottom center is thumb zone
│    ACTIONS HERE         │
└─────────────────────────┘
```

**Placement guidelines:**
- Primary actions → Bottom of screen
- Navigation → Bottom tabs or hamburger
- Cancel/back → Top left (standard) but consider bottom
- Destructive actions → Require confirmation, not easy tap

### Gestures

| Gesture | Common Use |
|---------|------------|
| Tap | Primary action |
| Long press | Context menu, selection |
| Swipe horizontal | Delete, archive, reveal actions |
| Swipe vertical | Scroll, pull-to-refresh |
| Pinch | Zoom |
| Edge swipe | Back navigation |

```typescript
// React Native gesture handling
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const swipeGesture = Gesture.Pan()
  .onEnd((event) => {
    if (event.translationX > 100) {
      onSwipeRight();
    }
  });

<GestureDetector gesture={swipeGesture}>
  <View>{children}</View>
</GestureDetector>
```

## Offline-First Architecture

### The Offline Strategy

```
┌─────────────────────────────────────────────────┐
│                    UI LAYER                      │
│            (Always renders from cache)           │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│                 CACHE LAYER                      │
│    (Local storage / SQLite / AsyncStorage)       │
└────────────────────┬────────────────────────────┘
                     │ Sync when online
┌────────────────────▼────────────────────────────┐
│                 NETWORK LAYER                    │
│         (API calls, background sync)             │
└─────────────────────────────────────────────────┘
```

### Implementation Patterns

```typescript
// Cache-first data fetching
async function fetchProjects(): Promise<Project[]> {
  // 1. Return cached data immediately
  const cached = await storage.get('projects');
  if (cached) {
    // Trigger background refresh
    refreshProjectsInBackground();
    return cached;
  }
  
  // 2. No cache? Fetch from network
  if (await isOnline()) {
    const projects = await api.getProjects();
    await storage.set('projects', projects);
    return projects;
  }
  
  // 3. Offline with no cache
  return [];
}

// Queue actions for later
async function createProject(data: ProjectInput) {
  if (await isOnline()) {
    return await api.createProject(data);
  } else {
    // Queue for later sync
    await actionQueue.add({
      type: 'CREATE_PROJECT',
      data,
      timestamp: Date.now(),
    });
    // Return optimistic result
    return { ...data, id: generateTempId(), pending: true };
  }
}

// Background sync when online
async function syncPendingActions() {
  const actions = await actionQueue.getAll();
  for (const action of actions) {
    try {
      await executeAction(action);
      await actionQueue.remove(action.id);
    } catch (error) {
      if (!isRetryable(error)) {
        await actionQueue.markFailed(action.id, error);
      }
    }
  }
}
```

### Offline UI Indicators

```tsx
function OfflineBanner() {
  const isOnline = useNetworkStatus();
  
  if (isOnline) return null;
  
  return (
    <View style={styles.offlineBanner}>
      <Icon name="wifi-off" />
      <Text>You're offline. Changes will sync when connected.</Text>
    </View>
  );
}

// Show pending status on items
function ProjectCard({ project }) {
  return (
    <View style={styles.card}>
      <Text>{project.name}</Text>
      {project.pending && (
        <Badge>Pending sync</Badge>
      )}
    </View>
  );
}
```

## Platform-Specific Considerations

### React Native

```typescript
import { Platform, StatusBar, SafeAreaView } from 'react-native';

// Platform-specific styles
const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 4 },
    }),
  },
});

// Safe areas
function Screen({ children }) {
  return (
    <SafeAreaView style={styles.safe}>
      {children}
    </SafeAreaView>
  );
}
```

### Responsive Web

```css
/* Mobile-first breakpoints */
.container {
  padding: 16px;  /* Mobile default */
}

@media (min-width: 768px) {
  .container {
    padding: 24px;  /* Tablet */
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 32px;  /* Desktop */
  }
}

/* Stack on mobile, side-by-side on desktop */
.layout {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .layout {
    flex-direction: row;
  }
}
```

## Performance on Mobile

### Reduce Bundle Size

```typescript
// ❌ Import entire library
import _ from 'lodash';

// ✅ Import only what you need
import debounce from 'lodash/debounce';

// ❌ Eager load everything
import HeavyComponent from './HeavyComponent';

// ✅ Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### Optimize Lists

```typescript
// React Native - use FlatList for long lists
<FlatList
  data={items}
  renderItem={({ item }) => <Item data={item} />}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
/>
```

### Minimize Network

```typescript
// Batch API calls
const [users, projects, stats] = await Promise.all([
  api.getUsers(),
  api.getProjects(),
  api.getStats(),
]);

// Compress images before upload
const compressed = await compressImage(photo, {
  maxWidth: 1080,
  quality: 0.8,
});

// Use pagination
const projects = await api.getProjects({ page: 1, limit: 20 });
```

## Testing Mobile

| Test Type | What to Check |
|-----------|---------------|
| Device variety | iPhone SE (small), iPhone Pro Max (large), Android variants |
| Orientations | Portrait primary, landscape if supported |
| Network conditions | Fast, slow 3G, offline |
| OS versions | Current and previous major versions |
| Interruptions | Incoming call, notification, backgrounding |

```typescript
// Test touch targets
test('button has minimum touch target', () => {
  const { getByRole } = render(<Button>Tap me</Button>);
  const button = getByRole('button');
  const { height, width } = button.getBoundingClientRect();
  expect(height).toBeGreaterThanOrEqual(44);
  expect(width).toBeGreaterThanOrEqual(44);
});
```

## Quick Reference

| Concern | Mobile Solution |
|---------|----------------|
| Small screens | Stack layouts, prioritize content |
| Fat fingers | 44px touch targets, spacing |
| Thumb reach | Primary actions at bottom |
| Slow network | Cache-first, optimistic updates |
| No network | Offline mode, queue actions |
| Battery | Minimize network, avoid polling |

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| Desktop-first design | Mobile-first design | Most users are mobile |
| Small touch targets | 44px minimum | Thumbs are imprecise |
| No offline handling | Cache-first architecture | Networks fail |
| Top-placed actions | Actions in thumb zone | Reachability |
| Network-dependent UI | Always show something | Users expect responsiveness |
| Eager loading everything | Lazy load, paginate | Limited bandwidth and battery |

## Exit Criteria

- [ ] Touch targets are 44px minimum
- [ ] Primary actions in thumb zone (bottom of screen)
- [ ] Works offline (shows cached data, queues actions)
- [ ] Syncs when back online
- [ ] Tested on small and large screens
- [ ] Tested on slow 3G connection
- [ ] Platform-specific adjustments (safe areas, etc.)
- [ ] Lists are virtualized for performance
- [ ] Pull-to-refresh on key lists

**Done when:** A user on a 3-year-old phone with spotty subway connection can complete the main tasks without frustration.
