---
name: devops
description: Use when setting up CI/CD, deployment pipelines, infrastructure, or preparing for production. Ship with confidence.
---

# DevOps Skill

## Overview

DevOps is about shipping with confidence. Every commit should be deployable. Every deployment should be reversible. Every failure should be detectable. If you're scared to deploy on Friday, your pipeline is broken.

## How DevOps Engineers Think

**"Can I deploy this and go to sleep?"**
If a deployment needs babysitting, it's not ready. Good pipelines have automated tests, health checks, automatic rollback, and alerting. You deploy, the system verifies, and you sleep soundly.

**"How do I undo this?"**
Every change must be reversible. Database migrations, config changes, code deployments—all of them. If you can't roll back in under 5 minutes, you're not ready to deploy.

**"How will I know when it's broken?"**
If your monitoring can't detect a failure faster than your users can, you're flying blind. Instrument everything. Alert on symptoms, not just errors. Know before users complain.

### What Separates Amateurs from Professionals

Amateurs deploy manually and hope.
Professionals automate everything and verify.

The amateur thinks: "I'll SSH in and run the deploy script."
The professional thinks: "The pipeline tests, builds, deploys, verifies health, and rolls back automatically if anything fails."

When catching yourself doing manual deploy steps—STOP. Automate it.

## When to Use

- Setting up CI/CD pipelines
- Configuring deployment environments
- Preparing for production launch
- After incidents (improving runbooks)
- **NOT** for application code (use appropriate code skill)

## The Pipeline Stages

```
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│  LINT   │ → │  TEST   │ → │  BUILD  │ → │ DEPLOY  │ → │ VERIFY  │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
     │             │             │             │             │
     └─────────────┴─────────────┴─────────────┴─────────────┘
                              ↓ Failure at any stage
                         STOP + NOTIFY
```

### Stage Requirements

| Stage | Purpose | Failure Action |
|-------|---------|----------------|
| Lint | Code quality gates | Block merge |
| Test | Catch regressions | Block merge |
| Build | Create artifact | Block deploy |
| Deploy | Ship to environment | Rollback |
| Verify | Health checks | Rollback + alert |

## CI/CD Configuration

### GitHub Actions (Recommended)

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/

  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: staging
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build
      - name: Deploy to staging
        run: |
          # Deploy commands here
          npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Health check
        run: |
          sleep 30
          curl --fail https://staging.example.com/api/health

  deploy-production:
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build
      - name: Deploy to production
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Health check
        run: |
          sleep 30
          curl --fail https://example.com/api/health
      - name: Notify success
        if: success()
        run: echo "Deployed successfully"
      - name: Rollback on failure
        if: failure()
        run: |
          # Rollback to previous deployment
          vercel rollback --token=${{ secrets.VERCEL_TOKEN }}
```

## Environment Strategy

| Environment | Purpose | Deploy Trigger | Data |
|-------------|---------|----------------|------|
| Development | Local dev | Manual | Fake/seed |
| Preview | PR review | Per PR | Fake/seed |
| Staging | Pre-prod testing | Push to main | Production copy |
| Production | Live users | After staging passes | Real |

### Environment Variables

```bash
# .env.example (committed - template)
DATABASE_URL=
API_KEY=
STRIPE_SECRET_KEY=

# .env.local (not committed - local dev)
DATABASE_URL=postgres://localhost/myapp_dev
API_KEY=dev_key_xxx

# Production (in platform secrets)
# Never in code, never in repo
```

**Secrets Management:**
- Development: `.env.local` (gitignored)
- CI/CD: GitHub Secrets / Platform secrets
- Production: Platform environment variables
- **Never:** Hardcoded, committed, or logged

## Health Checks

Every service needs a health endpoint:

```typescript
// /api/health
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    external_api: await checkExternalAPI(),
  };
  
  const healthy = Object.values(checks).every(c => c.status === 'ok');
  
  return Response.json({
    status: healthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks,
  }, { status: healthy ? 200 : 503 });
}

async function checkDatabase() {
  try {
    await db.$queryRaw`SELECT 1`;
    return { status: 'ok' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}
```

## Rollback Strategy

### Instant Rollback (< 1 minute)

```bash
# Vercel
vercel rollback

# Netlify
netlify deploy --restore <deploy-id>

# Docker
docker service update --image previous:tag myservice

# Kubernetes
kubectl rollout undo deployment/myapp
```

### Database Rollback

```bash
# Before deploy: Take snapshot/backup
pg_dump mydb > backup_$(date +%Y%m%d_%H%M%S).sql

# Rollback if needed
psql mydb < backup_20240115_143022.sql
```

**Critical:** Test your rollback procedure regularly. An untested rollback is no rollback.

## Monitoring & Alerting

### What to Monitor

| Metric | Alert Threshold | Why |
|--------|-----------------|-----|
| Error rate | > 1% | Something is broken |
| Response time (p99) | > 2s | Performance degradation |
| CPU usage | > 80% | Resource exhaustion |
| Memory usage | > 80% | Memory leak |
| Health check | Failing | Service down |
| Error logs | Spike | New bug introduced |

### Basic Alerting Setup

```javascript
// Simple error tracking
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Send to error tracking service
  sendToSentry(error);
});

// Request timing
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`Slow request: ${req.path} took ${duration}ms`);
    }
  });
  next();
});
```

## Documentation Artifacts

### docs/DEPLOYMENT.md

```markdown
# Deployment Guide

## Environments
| Environment | URL | Branch | Deploy |
|-------------|-----|--------|--------|
| Production | app.example.com | main | Auto on merge |
| Staging | staging.example.com | main | Auto before prod |
| Preview | *.vercel.app | PR branches | Auto on PR |

## Deploy Process
1. Create PR → Preview deployed automatically
2. Tests pass → Merge enabled
3. Merge to main → Deploy to staging
4. Staging health check passes → Deploy to production
5. Production health check passes → Done

## Rollback
1. Go to Vercel dashboard (or run `vercel rollback`)
2. Select previous deployment
3. Promote to production
4. Verify health check

## Secrets
- All secrets in Vercel environment variables
- Never commit secrets to repo
- Rotate keys quarterly
```

### docs/RUNBOOK.md

```markdown
# Runbook

## High Error Rate Alert

### Symptoms
- Error rate > 1%
- Slack alert from monitoring

### Diagnosis
1. Check error logs: `vercel logs --filter=error`
2. Check recent deploys: `vercel ls`
3. Check external dependencies: Status pages

### Resolution
1. If recent deploy: Rollback immediately
2. If external dependency: Enable fallback/circuit breaker
3. If unclear: Scale up instances while investigating

### Escalation
- On-call: [contact]
- After 15 min unresolved: [manager contact]
```

## Quick Reference

| Task | Command/Action |
|------|---------------|
| Deploy to production | Merge PR to main |
| Rollback production | `vercel rollback` or platform UI |
| View logs | `vercel logs` or platform UI |
| Check deploy status | GitHub Actions tab |
| Add secret | Platform settings → Environment variables |

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| Manual deploys | Automated pipeline | Humans forget steps |
| Deploy without tests | Tests gate deployment | Catch bugs before users |
| No health checks | Health endpoint + verification | Know when it's broken |
| No rollback plan | Tested rollback procedure | Failures happen |
| Secrets in code | Platform environment variables | Secrets leak |
| Deploy Friday EOD | Deploy Friday morning (with monitoring) | Time to fix if needed |

## Exit Criteria

- [ ] CI runs lint + tests on every PR
- [ ] CD deploys automatically on merge to main
- [ ] Health check endpoint exists and is verified post-deploy
- [ ] Rollback procedure documented and tested
- [ ] Secrets in platform environment variables (not code)
- [ ] Monitoring alerts configured
- [ ] DEPLOYMENT.md documents the process
- [ ] RUNBOOK.md covers common issues

**Done when:** You can merge to main, close your laptop, and trust the pipeline to deploy safely—or rollback automatically if something goes wrong.
