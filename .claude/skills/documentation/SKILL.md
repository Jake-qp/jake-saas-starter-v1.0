---
name: documentation
description: Use when creating READMEs, API docs, setup guides, or any developer-facing documentation. Make it findable, scannable, and copy-pasteable.
---

# Documentation Skill

## Overview

Documentation exists to help someone at 2am find what they need. Not to be comprehensive. Not to be thorough. To solve a specific problem, quickly. Every sentence that doesn't help them is in the way.

## How Technical Writers Think

**"What problem are they trying to solve?"**
Nobody reads documentation for fun. They have a problem. They need an answer. Your job is to get them to the answer fast. Start with the most common problems. Put the solution before the explanation.

**"Can they copy-paste this and have it work?"**
Code examples must work. Literally copy-paste, run, success. If it requires modification, show exactly what to modify. Broken examples destroy trust and waste hours.

**"Can they find this at 2am in a panic?"**
When something is broken in production, developers don't read—they scan. Use clear headings. Put solutions first. Make the critical path obvious. Design for searching, skimming, and panic.

### What Separates Amateurs from Professionals

Amateurs document what they built.
Professionals document what users need to do.

The amateur thinks: "Let me explain how this system works."
The professional thinks: "Someone needs to set this up. What's the fastest path to working?"

When catching yourself explaining instead of showing—STOP. Show the code, then explain only if necessary.

## When to Use

- Project setup complete
- API endpoints added or changed
- New features shipped
- After incidents (updating runbooks)
- **ALWAYS** keep docs in sync with code

## The README Formula

```markdown
# Project Name

One sentence: what this does and why you'd use it.

## Quick Start

Get running in 60 seconds or less.

\`\`\`bash
git clone [repo]
cd [project]
npm install
cp .env.example .env  # Then edit with your values
npm run dev
\`\`\`

Open http://localhost:3000

## What You Can Do

- **Feature 1:** [One-line description]
- **Feature 2:** [One-line description]
- **Feature 3:** [One-line description]

## Common Tasks

### [Task users frequently need]

\`\`\`bash
[Exact command to run]
\`\`\`

### [Another common task]

\`\`\`bash
[Exact command to run]
\`\`\`

## Configuration

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection | `postgres://user:pass@localhost/db` |
| `API_KEY` | Yes | Stripe API key | `sk_test_xxx` |
| `DEBUG` | No | Enable debug logs | `true` |

## Troubleshooting

### "Connection refused" error

This means the database isn't running.

\`\`\`bash
# Start PostgreSQL
docker-compose up -d postgres
\`\`\`

### "Invalid API key" error

Your Stripe key is wrong or missing.

1. Check `.env` has `API_KEY` set
2. Verify it starts with `sk_test_` or `sk_live_`

## Development

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- (any other requirements)

### Running Tests

\`\`\`bash
npm test           # Unit tests
npm run test:e2e   # E2E tests
\`\`\`

### Project Structure

\`\`\`
src/
  app/           # Next.js pages/routes
  components/    # React components
  lib/           # Utilities and helpers
  __tests__/     # Tests
\`\`\`

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## License

MIT
```

## Documentation Types

| Type | Location | Purpose | Update When |
|------|----------|---------|-------------|
| README | Root | Get started, overview | Major changes |
| API Reference | docs/API.md | Endpoint details | Any API change |
| Deployment | docs/DEPLOYMENT.md | How to deploy | Process changes |
| Runbook | docs/RUNBOOK.md | Handle incidents | After incidents |
| Architecture | docs/ARCHITECTURE.md | System design | Structural changes |

## API Documentation

```markdown
# API Reference

Base URL: `https://api.example.com/v1`

## Authentication

All requests require an API key in the header:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.example.com/v1/projects
\`\`\`

---

## Projects

### List Projects

\`GET /projects\`

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 20, max: 100) |
| `status` | string | No | Filter by status: `active`, `archived` |

**Example Request:**

\`\`\`bash
curl "https://api.example.com/v1/projects?status=active&limit=10" \
  -H "Authorization: Bearer YOUR_API_KEY"
\`\`\`

**Example Response:**

\`\`\`json
{
  "data": [
    {
      "id": "proj_abc123",
      "name": "My Project",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42
  }
}
\`\`\`

**Errors:**

| Status | Code | Description |
|--------|------|-------------|
| 401 | `unauthorized` | Missing or invalid API key |
| 400 | `invalid_param` | Invalid query parameter |

---

### Create Project

\`POST /projects\`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Project name (1-100 chars) |
| `budget` | integer | No | Budget in cents |

**Example Request:**

\`\`\`bash
curl -X POST "https://api.example.com/v1/projects" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Project", "budget": 100000}'
\`\`\`

**Example Response:**

\`\`\`json
{
  "data": {
    "id": "proj_xyz789",
    "name": "New Project",
    "budget": 100000,
    "status": "active",
    "created_at": "2024-01-20T14:00:00Z"
  }
}
\`\`\`
```

## Writing Principles

### Show, Don't Tell

```markdown
❌ WRONG: To install dependencies, you need to use the npm package manager 
to install all required packages listed in package.json.

✅ RIGHT: 
\`\`\`bash
npm install
\`\`\`
```

### Code Examples Must Work

```markdown
❌ WRONG:
\`\`\`bash
curl -X POST /api/users -d '{"email": "<YOUR_EMAIL>"}'
\`\`\`

✅ RIGHT:
\`\`\`bash
curl -X POST "https://api.example.com/v1/users" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
\`\`\`
```

### Headings for Scanning

```markdown
❌ WRONG: (Wall of text)
First you need to install the dependencies. After that you should 
copy the environment file. Then you need to edit the values...

✅ RIGHT:
## Setup

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` with your values:
- `DATABASE_URL`: Your PostgreSQL connection string
- `API_KEY`: Your Stripe API key
```

### Error Solutions First

```markdown
❌ WRONG:
### Database Connection
The database connection error might occur due to various reasons 
including network issues, incorrect credentials, or the database 
server not running. First check if...

✅ RIGHT:
### "Connection refused" Error

**Quick fix:**
\`\`\`bash
docker-compose up -d postgres
\`\`\`

**If that doesn't work:**
1. Check DATABASE_URL in `.env` is correct
2. Verify PostgreSQL is running: `pg_isready`
3. Check network connectivity to database host
```

## Runbook Template

```markdown
# Runbook: [Service Name]

## Alerts

### High Error Rate (> 1%)

**Severity:** High

**What's happening:** More than 1% of requests are failing.

**Immediate actions:**
1. Check recent deploys: `vercel ls` (rollback if recent)
2. Check error logs: `vercel logs --filter=error`
3. Check external services: [status pages]

**Resolution:**
- If recent deploy: `vercel rollback`
- If external service: Enable fallback mode
- If unclear: Page on-call engineer

**Escalation:** @oncall-primary (after 15 min unresolved)

---

### Database Connection Failures

**Severity:** Critical

**What's happening:** App cannot connect to database.

**Immediate actions:**
1. Check database status: `pg_isready -h $DB_HOST`
2. Check connection pool: [monitoring link]
3. Check database CPU/memory: [monitoring link]

**Resolution:**
- If pool exhausted: Restart application
- If database overloaded: Scale database or kill long queries
- If database down: Contact database team

**Escalation:** @database-team (immediately if DB down)
```

## Quick Reference

| Need | Template |
|------|----------|
| New project | README formula above |
| New API endpoint | API documentation template |
| Incident recovery | Add to RUNBOOK.md |
| Setup change | Update README Quick Start |

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| Explain before showing | Show code first | Users want to do, not read |
| Code that needs editing | Working copy-paste examples | Broken examples waste hours |
| Wall of text | Clear headings, scannable | Users search and skim |
| "See X for details" | Inline the essential info | Extra clicks lose people |
| Outdated docs | Update with code changes | Wrong docs are worse than none |
| Comprehensive coverage | Solve common problems | 80/20 rule applies |

## Exit Criteria

- [ ] README has working Quick Start (< 60 seconds to running)
- [ ] Code examples are copy-paste ready
- [ ] All environment variables documented
- [ ] Common errors have solutions
- [ ] API endpoints documented with examples
- [ ] Setup tested on fresh machine
- [ ] Headings enable quick scanning
- [ ] No stale/outdated information

**Done when:** A developer can go from zero to running without asking anyone a question—at 2am on a Saturday.
