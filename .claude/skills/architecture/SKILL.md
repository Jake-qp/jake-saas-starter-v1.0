---
name: design
description: Use when designing APIs, data models, component interfaces, or system architecture. Before writing implementation code.
---

# Design Skill

## Overview

Design is deciding what to build before building it. Good design makes the right things easy and the wrong things hard. Every interface is a contract—think carefully before committing.

## How System Architects Think

**"What are the boundaries?"**
Every system has components. Every component has a boundary. What goes in? What comes out? What does it own? What does it delegate? Clear boundaries make systems understandable, testable, and changeable.

**"What are the trade-offs?"**
Every design decision is a trade-off. Speed vs. simplicity. Flexibility vs. clarity. Consistency vs. optimization. There are no perfect designs—only designs with trade-offs you've consciously accepted.

**"How will this change?"**
Requirements change. Scale changes. Teams change. Design for the change you expect. Couple tightly what changes together. Decouple what changes independently. Predict where flexibility matters.

### What Separates Amateurs from Professionals

Amateurs design for today's requirements.
Professionals design for today's requirements plus tomorrow's likely changes.

The amateur thinks: "This works for our current data."
The professional thinks: "What happens when we have 100x the data? When we add multi-tenancy? When we need to audit changes?"

When catching yourself designing only for the immediate case—STOP. Consider what's likely to change.

## When to Use

- Before implementing new features
- Designing API endpoints
- Planning data models
- Defining component interfaces
- System integration planning
- **NOT** for visual design (use design-system skill)
- **NOT** for implementation details (use implementation-plan skill)

## The Design Process

### Step 1: Define Boundaries

What are the components? What does each own?

```
┌─────────────────────────────────────────────────┐
│                    System                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  │
│  │   Frontend  │  │    API      │  │   DB    │  │
│  │             │──│             │──│         │  │
│  │  - UI State │  │  - Auth     │  │  - Data │  │
│  │  - Routing  │  │  - Validate │  │  - Index│  │
│  │  - Display  │  │  - Business │  │  - Query│  │
│  └─────────────┘  └─────────────┘  └─────────┘  │
└─────────────────────────────────────────────────┘
```

For each boundary, define:
- What data crosses it?
- What format?
- Who is responsible for validation?
- How are errors communicated?

### Step 2: Design Contracts

Define interfaces before implementation:

```typescript
// API Contract
interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  request: RequestShape;
  response: ResponseShape;
  errors: ErrorShape[];
}

// Example: Create Project
const createProject: Endpoint = {
  method: 'POST',
  path: '/api/projects',
  request: {
    name: string;        // required, 1-100 chars
    budget: number;      // required, positive
    clientId?: string;   // optional, valid UUID
  },
  response: {
    id: string;
    name: string;
    budget: number;
    createdAt: string;   // ISO 8601
  },
  errors: [
    { status: 400, code: 'VALIDATION_ERROR' },
    { status: 401, code: 'UNAUTHORIZED' },
    { status: 409, code: 'DUPLICATE_NAME' },
  ]
};
```

### Step 3: Consider Edge Cases

For every design, answer:

| Question | Design Impact |
|----------|--------------|
| What if it's empty? | Empty state handling |
| What if there's one item? | Singular vs. plural |
| What if there's 1 million items? | Pagination, indexing |
| What if it fails mid-operation? | Transactions, rollback |
| What if it's called twice? | Idempotency |
| What if the caller is malicious? | Validation, authorization |

### Step 4: Document Trade-offs

Every design has trade-offs. Document them:

```markdown
## Design Decision: Soft Delete for Projects

**Options Considered:**
1. Hard delete - simple, clean, but data is gone forever
2. Soft delete (isDeleted flag) - recoverable, but complicates queries
3. Archive table - clean separation, but more complex

**Chosen:** Soft delete with isDeleted flag

**Trade-offs Accepted:**
- ✅ Data is recoverable for 30 days
- ✅ Simple to implement
- ⚠️ All queries must filter by isDeleted
- ⚠️ Database grows over time (need cleanup job)

**Why:** Recovery is more important than query simplicity for this use case.
```

## API Design Patterns

### REST Endpoint Conventions

```
GET    /api/projects          # List (paginated)
GET    /api/projects/:id      # Get one
POST   /api/projects          # Create
PUT    /api/projects/:id      # Update (full replace)
PATCH  /api/projects/:id      # Update (partial)
DELETE /api/projects/:id      # Delete
```

| Pattern | Example | Notes |
|---------|---------|-------|
| Plural nouns | `/projects` not `/project` | Consistency |
| Kebab-case | `/project-tasks` not `/projectTasks` | URL convention |
| Nested resources | `/projects/:id/tasks` | When child belongs to parent |
| Query params | `?status=active&limit=20` | Filtering, pagination |

### Response Shapes

```typescript
// Success (single item)
{ data: Project }

// Success (list)
{ 
  data: Project[],
  pagination: { page: 1, limit: 20, total: 100 }
}

// Error
{
  error: string,      // Human-readable
  code: string,       // Machine-readable
  details?: object    // Additional context
}
```

### Status Code Usage

| Code | When to Use |
|------|-------------|
| 200 | Success with body |
| 201 | Created new resource |
| 204 | Success, no body (DELETE) |
| 400 | Bad request (validation) |
| 401 | Not authenticated |
| 403 | Not authorized |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 500 | Server error |

## Data Model Design

### Schema First

```typescript
// Define the shape before implementation
interface Project {
  id: string;           // UUID, primary key
  name: string;         // 1-100 chars, unique per user
  budget: number;       // Positive integer, cents
  status: ProjectStatus;
  ownerId: string;      // FK to users
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;     // Soft delete
}

type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived';
```

### Relationship Patterns

| Relationship | Implementation |
|-------------|----------------|
| One-to-many | FK on the "many" side |
| Many-to-many | Junction table |
| One-to-one | FK with unique constraint |
| Self-referential | FK to same table |

## Component Design

### Props Interface

```typescript
interface ProjectCardProps {
  // Required
  project: Project;
  
  // Optional with defaults
  showBudget?: boolean;        // default: true
  variant?: 'compact' | 'full'; // default: 'full'
  
  // Callbacks
  onClick?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}
```

### State Handling

Every component should handle:
- Default state
- Loading state
- Empty state
- Error state
- Success state

## Quick Reference

| Design Element | Key Questions |
|---------------|---------------|
| API endpoint | Method? Path? Request/response shape? |
| Data model | Fields? Types? Constraints? Relationships? |
| Component | Props? States? Callbacks? |
| Integration | Protocol? Auth? Error handling? |

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| Designing during implementation | Design first, then implement | Design changes are cheap; code changes are expensive |
| No error response design | Define error shapes upfront | Errors are part of the contract |
| Ignoring pagination | Design for lists from the start | Adding pagination later is painful |
| Tight coupling | Clear boundaries between components | Enables independent changes |
| No trade-off documentation | Document why decisions were made | Future you will forget |

## Exit Criteria

- [ ] Component boundaries defined
- [ ] All interfaces/contracts typed
- [ ] Request/response shapes documented
- [ ] Error responses designed
- [ ] Edge cases considered
- [ ] Trade-offs documented
- [ ] Consistent with existing patterns
- [ ] Ready for implementation

**Done when:** A developer could implement from your design without asking clarifying questions about interfaces or contracts.
