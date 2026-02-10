---
name: database
description: Use when designing schemas, writing queries, creating migrations, or when performance matters. Before the database becomes a bottleneck.
---

# Database Skill

## Overview

The database is the foundation. Get the schema wrong and you're fighting it forever. Every query either uses an index or scans the table. Every migration either works or takes the site down. Think carefully before you CREATE TABLE.

## How Database Engineers Think

**"How will this be queried?"**
Schema design starts with queries, not entities. What questions will the application ask? Those questions become queries. Those queries determine indexes. Indexes determine schema. Design backwards from the access patterns.

**"Will this query scale?"**
A query that's fast with 1,000 rows might kill your server with 1,000,000. Every query is either O(log n) with an index or O(n) without. Know which one you're writing. EXPLAIN ANALYZE is your friend.

**"Can I roll this back?"**
Migrations run in production against live data. If it fails halfway, what state is the database in? Every migration needs a rollback plan. Test on production-like data before production.

### What Separates Amateurs from Professionals

Amateurs design schemas based on entities.
Professionals design schemas based on access patterns.

The amateur thinks: "I need to store users and posts."
The professional thinks: "I need to query posts by user, posts by date, and search posts by content. What indexes support those patterns?"

When catching yourself designing a schema without listing the queries first—STOP. You're going to build the wrong thing.

## When to Use

- Designing new tables or schemas
- Writing complex queries
- Performance optimization
- Creating or running migrations
- **NOT** for API logic (use backend skill)
- **NOT** for ORM usage patterns (those are in the query section)

## Schema Design Process

### Step 1: List the Queries First

Before designing tables, list how data will be accessed:

```markdown
## Access Patterns for Projects

1. Get all projects for a user (frequent)
2. Get single project by ID (frequent)
3. Search projects by name (occasional)
4. List projects over budget (dashboard)
5. Count projects by status (analytics)
```

### Step 2: Design for Those Queries

Each access pattern implies an index:

| Access Pattern | Required Index |
|---------------|----------------|
| Projects by user | `idx_projects_user_id` |
| Project by ID | Primary key (automatic) |
| Search by name | `idx_projects_name` (or full-text) |
| Over budget | `idx_projects_budget` + `status` |
| Count by status | `idx_projects_status` |

### Step 3: Define the Schema

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  budget INTEGER NOT NULL DEFAULT 0,  -- Store cents, not dollars
  spent INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,  -- Soft delete
  
  CONSTRAINT valid_status CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  CONSTRAINT positive_budget CHECK (budget >= 0),
  CONSTRAINT positive_spent CHECK (spent >= 0)
);

-- Indexes based on access patterns
CREATE INDEX idx_projects_user_id ON projects(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_status ON projects(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_name ON projects(name);
```

## Indexing Strategy

### What to Index

| Index This | Why |
|------------|-----|
| Foreign keys | JOINs need them |
| Columns in WHERE | Filter without scan |
| Columns in ORDER BY | Sort without scan |
| Columns in GROUP BY | Aggregate efficiently |

### What NOT to Index

| Skip This | Why |
|-----------|-----|
| Low-cardinality columns | `boolean`, `status` alone are useless |
| Rarely queried columns | Indexes have write cost |
| Small tables (< 1000 rows) | Full scan is fine |
| Columns mostly NULL | Usually waste of space |

### Composite Index Rules

```sql
-- Order matters! Most selective first
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);

-- This index supports:
-- ✅ WHERE user_id = ?
-- ✅ WHERE user_id = ? AND created_at > ?
-- ✅ WHERE user_id = ? ORDER BY created_at

-- But NOT:
-- ❌ WHERE created_at > ? (wrong order, won't use index)
```

### Partial Indexes

```sql
-- Only index what you query
CREATE INDEX idx_projects_active 
  ON projects(user_id, created_at) 
  WHERE status = 'active' AND deleted_at IS NULL;

-- Smaller index, faster queries for the common case
```

## Query Patterns

### Avoid N+1 Queries

```typescript
// ❌ N+1: Fetches users one at a time
const posts = await db.post.findMany();
for (const post of posts) {
  post.author = await db.user.findUnique({ where: { id: post.userId } });
}

// ✅ Single query with include
const posts = await db.post.findMany({
  include: { author: true },
});

// ✅ Or explicit JOIN
const posts = await db.$queryRaw`
  SELECT p.*, u.name as author_name
  FROM posts p
  JOIN users u ON p.user_id = u.id
  WHERE p.status = 'published'
`;
```

### Pagination Done Right

```typescript
// ❌ OFFSET pagination: Gets slower as pages increase
const posts = await db.post.findMany({
  skip: (page - 1) * limit,  // Scans skipped rows!
  take: limit,
});

// ✅ Cursor pagination: Constant time
const posts = await db.post.findMany({
  where: {
    id: { gt: cursor },  // Uses index
  },
  take: limit,
  orderBy: { id: 'asc' },
});
```

### Transactions

```typescript
// Wrap related operations in transaction
const result = await db.$transaction(async (tx) => {
  // Debit source account
  const from = await tx.account.update({
    where: { id: fromId },
    data: { balance: { decrement: amount } },
  });
  
  // Check constraint (do in app layer for better errors)
  if (from.balance < 0) {
    throw new Error('Insufficient funds');
  }
  
  // Credit destination
  await tx.account.update({
    where: { id: toId },
    data: { balance: { increment: amount } },
  });
  
  return { success: true };
});
// If anything throws, entire transaction rolls back
```

### Use EXPLAIN ANALYZE

```sql
EXPLAIN ANALYZE SELECT * FROM projects WHERE user_id = '123';

-- Look for:
-- ✅ "Index Scan" or "Index Only Scan"
-- ❌ "Seq Scan" on large tables (missing index)
-- ❌ High "actual time" or "rows" counts
```

## Migration Patterns

### Safe Migration Rules

1. **Always reversible** — Write down migration AND rollback
2. **Test on production data** — Copy prod to staging, run there first
3. **Small batches** — Don't update 10M rows in one transaction
4. **Additive first** — Add column, then populate, then enforce

### Adding a Column

```sql
-- Step 1: Add nullable column (instant, no lock)
ALTER TABLE projects ADD COLUMN priority INTEGER;

-- Step 2: Backfill in batches (application code)
UPDATE projects SET priority = 0 WHERE priority IS NULL LIMIT 10000;
-- Repeat until done

-- Step 3: Add default and constraint (after backfill)
ALTER TABLE projects 
  ALTER COLUMN priority SET DEFAULT 0,
  ALTER COLUMN priority SET NOT NULL;
```

### Renaming a Column (Zero Downtime)

```sql
-- Step 1: Add new column
ALTER TABLE projects ADD COLUMN project_name VARCHAR(100);

-- Step 2: Dual-write in application (write to both columns)

-- Step 3: Backfill old data
UPDATE projects SET project_name = name WHERE project_name IS NULL;

-- Step 4: Switch application to read from new column

-- Step 5: Drop old column (after deploy is stable)
ALTER TABLE projects DROP COLUMN name;
```

### Dropping a Column Safely

```sql
-- Step 1: Stop writing to column in application

-- Step 2: Wait for deploy to propagate

-- Step 3: Drop column
ALTER TABLE projects DROP COLUMN deprecated_field;
```

## Data Modeling Patterns

### Soft Deletes

```sql
-- Add deleted_at column
ALTER TABLE projects ADD COLUMN deleted_at TIMESTAMPTZ;

-- Queries filter by default
CREATE INDEX idx_projects_active ON projects(user_id) WHERE deleted_at IS NULL;

-- "Delete" sets timestamp
UPDATE projects SET deleted_at = NOW() WHERE id = ?;
```

### Audit Trail

```sql
CREATE TABLE project_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action VARCHAR(20) NOT NULL,  -- 'create', 'update', 'delete'
  old_values JSONB,
  new_values JSONB
);
```

### Money (Use Integers!)

```sql
-- ❌ NEVER use FLOAT for money
budget FLOAT  -- 0.1 + 0.2 = 0.30000000000000004

-- ✅ Store cents as INTEGER
budget_cents INTEGER NOT NULL DEFAULT 0,  -- $10.50 = 1050
```

## Quick Reference

| Situation | Pattern |
|-----------|---------|
| New table | List queries first, design indexes |
| Slow query | EXPLAIN ANALYZE, add index |
| N+1 queries | Use JOIN or include |
| Large table pagination | Cursor-based, not OFFSET |
| Related updates | Transaction |
| Schema change | Additive migration, backfill, enforce |

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| Design schema, then queries | Design queries, then schema | Schema should support access patterns |
| No indexes on foreign keys | Index all FKs | JOINs become full scans |
| OFFSET pagination | Cursor pagination | OFFSET scans skipped rows |
| FLOAT for money | INTEGER (cents) | Floating point is imprecise |
| Big bang migration | Additive + backfill + enforce | Zero downtime |
| No EXPLAIN ANALYZE | Always analyze slow queries | Know if index is used |

## Exit Criteria

- [ ] Access patterns documented
- [ ] Indexes support all query patterns
- [ ] EXPLAIN ANALYZE shows index usage on key queries
- [ ] No N+1 queries
- [ ] Migrations are reversible
- [ ] Migrations tested on production-like data
- [ ] Money stored as integers (cents)
- [ ] Schema documented in DATA-MODELS.md

**Done when:** Every common query uses an index, and you can deploy a migration without taking the site down.
