---
name: compliance
description: Use when handling personal data, processing payments, storing health information, or serving users in regulated jurisdictions. When "can you prove it?" matters.
---

# Compliance Skill

## Overview

Compliance is about proving you did the right thing. Regulators don't care about your intentions—they care about your evidence. Every piece of personal data needs a reason. Every access needs a log. Every user request needs a response. If you can't prove it, it didn't happen.

## How Compliance Officers Think

**"What data do you have, and why?"**
Every piece of personal data needs justification. Why do you collect it? What do you use it for? How long do you keep it? If you can't answer these questions for every field, you're collecting data you shouldn't have.

**"Can you prove you did this?"**
Audit trails aren't optional. When a regulator asks "did you delete this user's data?"—you need logs that prove it. When they ask "who accessed this record?"—you need access logs. Evidence isn't a nice-to-have.

**"What happens when a user asks?"**
Users have rights. They can ask for their data. They can ask you to delete it. They can ask who you've shared it with. You have 30 days (GDPR) to respond. If you don't have the systems to respond, you're already non-compliant.

### What Separates Amateurs from Professionals

Amateurs add a privacy policy and hope.
Professionals build systems that enforce compliance by design.

The amateur thinks: "We have a privacy policy, we're compliant."
The professional thinks: "Can I export all of User X's data in 24 hours? Can I prove we deleted everything? Can I show who accessed their records?"

When catching yourself collecting data without a documented purpose—STOP. You're creating liability.

## When to Use

- Collecting personal data (names, emails, addresses)
- Processing payments
- Handling health information (HIPAA)
- Serving EU users (GDPR)
- Serving California users (CCPA)
- Any regulated industry (finance, healthcare)

## Data Inventory (Required First Step)

Before anything else, know what you have:

```markdown
# Data Inventory

| Data Field | Purpose | Legal Basis | Retention | Deletion Method |
|------------|---------|-------------|-----------|-----------------|
| email | Account login, communication | Contract | Account lifetime | Hard delete on account deletion |
| name | Personalization, invoices | Contract | Account lifetime | Hard delete on account deletion |
| address | Shipping, tax compliance | Contract | 7 years (tax) | Anonymize after retention period |
| payment_token | Process payments | Contract | Until card expires | Delete with Stripe |
| IP address | Security, fraud prevention | Legitimate interest | 90 days | Auto-purge |
| usage_logs | Product improvement | Legitimate interest | 1 year | Auto-purge |
```

**If it's not in the inventory, you shouldn't be collecting it.**

## GDPR Requirements (EU Users)

### User Rights You Must Support

| Right | What It Means | Implementation |
|-------|---------------|----------------|
| Access | User can see all their data | Data export endpoint |
| Rectification | User can correct their data | Profile edit functionality |
| Erasure | User can delete their data | Account deletion endpoint |
| Portability | User can take their data elsewhere | Machine-readable export (JSON) |
| Restriction | User can limit processing | Processing flags |
| Object | User can opt out of certain uses | Preference settings |

### Implementation

```typescript
// GET /api/user/data-export
// Returns ALL user data in portable format
export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);
  
  const userData = await gatherAllUserData(user.id);
  
  // Log the access for audit trail
  await auditLog.create({
    action: 'DATA_EXPORT',
    userId: user.id,
    performedBy: user.id,
    timestamp: new Date(),
  });
  
  return Response.json({
    exportedAt: new Date().toISOString(),
    user: {
      email: userData.email,
      name: userData.name,
      createdAt: userData.createdAt,
    },
    projects: userData.projects,
    activity: userData.activityLog,
    // Include EVERYTHING
  });
}

// DELETE /api/user/account
// Complete account deletion
export async function DELETE(request: Request) {
  const user = await getAuthenticatedUser(request);
  
  // Cascading delete of all user data
  await db.$transaction([
    db.activityLog.deleteMany({ where: { userId: user.id } }),
    db.project.deleteMany({ where: { userId: user.id } }),
    db.userPreferences.deleteMany({ where: { userId: user.id } }),
    db.user.delete({ where: { id: user.id } }),
  ]);
  
  // Log deletion for audit (without PII)
  await auditLog.create({
    action: 'ACCOUNT_DELETED',
    userId: user.id,  // Keep ID for audit, but user record is gone
    performedBy: user.id,
    timestamp: new Date(),
  });
  
  // Cancel any external subscriptions
  await stripe.customers.del(user.stripeCustomerId);
  
  return new Response(null, { status: 204 });
}
```

### Consent Management

```typescript
// Record consent with timestamp and version
interface ConsentRecord {
  userId: string;
  consentType: 'marketing' | 'analytics' | 'terms';
  granted: boolean;
  timestamp: Date;
  policyVersion: string;
  ipAddress: string;
}

// Always check consent before processing
async function canSendMarketingEmail(userId: string): Promise<boolean> {
  const consent = await db.consent.findFirst({
    where: { 
      userId, 
      consentType: 'marketing',
      granted: true,
    },
  });
  return !!consent;
}
```

## PCI DSS (Payment Processing)

**Rule #1: Never touch card numbers.** Use Stripe, Braintree, or similar.

| Requirement | Implementation |
|-------------|----------------|
| Never store card numbers | Use payment provider tokens |
| Never log card numbers | Exclude from all logging |
| HTTPS everywhere | TLS 1.2+ required |
| Access controls | Restrict who can see payment data |
| Audit logging | Log all payment operations |

```typescript
// ✅ CORRECT: Use Stripe tokens
const paymentIntent = await stripe.paymentIntents.create({
  amount: calculateTotal(cart),
  currency: 'usd',
  customer: user.stripeCustomerId,
});

// Store only the Stripe references
await db.order.create({
  data: {
    userId: user.id,
    stripePaymentIntentId: paymentIntent.id,  // Token, not card
    amount: paymentIntent.amount,
  },
});

// ❌ NEVER DO THIS
// Never store: card number, CVV, full track data
// Never log: any payment card details
```

## Audit Logging

**Everything important needs an audit trail.**

```typescript
// Audit log schema
interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;           // 'USER_LOGIN', 'DATA_EXPORT', 'RECORD_ACCESSED'
  userId: string;           // Who was affected
  performedBy: string;      // Who did it (could be admin)
  resource: string;         // What was accessed
  resourceId: string;       // Specific record
  metadata: object;         // Additional context
  ipAddress: string;        // Where from
}

// Log access to sensitive data
async function getProject(projectId: string, requestingUser: User) {
  const project = await db.project.findUnique({ where: { id: projectId } });
  
  // Log the access
  await auditLog.create({
    action: 'PROJECT_ACCESSED',
    userId: project.ownerId,
    performedBy: requestingUser.id,
    resource: 'project',
    resourceId: projectId,
    timestamp: new Date(),
  });
  
  return project;
}
```

### What to Log

| Event | Why |
|-------|-----|
| Login/logout | Security audit |
| Data access | Who saw what |
| Data modification | Change history |
| Data deletion | Prove it happened |
| Permission changes | Access control audit |
| Export requests | GDPR compliance |
| Consent changes | Legal record |

## Data Retention

**Don't keep data forever.** Define and enforce retention policies.

```typescript
// Scheduled job: Enforce retention policies
async function enforceRetention() {
  const now = new Date();
  
  // Delete old activity logs (90 days)
  await db.activityLog.deleteMany({
    where: {
      createdAt: { lt: subDays(now, 90) },
    },
  });
  
  // Anonymize old support tickets (1 year)
  await db.supportTicket.updateMany({
    where: {
      createdAt: { lt: subYears(now, 1) },
      anonymized: false,
    },
    data: {
      email: 'anonymized@deleted.local',
      name: 'Deleted User',
      anonymized: true,
    },
  });
  
  // Log retention enforcement
  await auditLog.create({
    action: 'RETENTION_ENFORCED',
    performedBy: 'system',
    timestamp: now,
  });
}
```

## Privacy by Design Checklist

### Before Collecting Data
- [ ] Is this data necessary? (Data minimization)
- [ ] What's the legal basis? (Consent, contract, legitimate interest)
- [ ] How long will we keep it? (Retention period)
- [ ] How will we delete it? (Deletion mechanism)

### During Development
- [ ] Is sensitive data encrypted at rest?
- [ ] Is data encrypted in transit (HTTPS)?
- [ ] Are access controls enforced?
- [ ] Is access logged?
- [ ] Can users export their data?
- [ ] Can users delete their account?

### Before Launch
- [ ] Privacy policy updated?
- [ ] Cookie consent implemented (if needed)?
- [ ] Data processing agreement with vendors?
- [ ] Data inventory documented?

## Documentation Artifact

Create `docs/COMPLIANCE.md`:

```markdown
# Compliance Documentation

## Regulatory Scope
- GDPR: Yes (EU users)
- CCPA: Yes (California users)
- PCI DSS: Yes (payment processing via Stripe)
- HIPAA: No (no health data)

## Data Inventory
[Link to data inventory spreadsheet]

## User Rights Implementation

| Right | Endpoint | Response Time |
|-------|----------|---------------|
| Access (export) | GET /api/user/data-export | < 24 hours |
| Deletion | DELETE /api/user/account | Immediate |
| Rectification | PUT /api/user/profile | Immediate |

## Data Retention Schedule

| Data Type | Retention | Deletion Method |
|-----------|-----------|-----------------|
| Account data | Account lifetime | Hard delete |
| Activity logs | 90 days | Auto-purge |
| Payment records | 7 years | Anonymize |

## Third-Party Processors

| Vendor | Data Shared | DPA Signed |
|--------|-------------|------------|
| Stripe | Payment tokens | Yes |
| SendGrid | Email addresses | Yes |
| Vercel | Access logs | Yes |

## Audit Log Location
All audit logs in `audit_logs` table, retained for 3 years.
```

## Quick Reference

| Regulation | Key Requirement | Implementation |
|------------|-----------------|----------------|
| GDPR | User data rights | Export/delete endpoints |
| GDPR | Consent | Consent management system |
| PCI | No card storage | Stripe/Braintree tokens |
| All | Audit trail | Comprehensive logging |
| All | Data minimization | Collect only what's needed |

## Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| "We have a privacy policy" | Systems that enforce compliance | Policy without systems is useless |
| Collecting "just in case" | Collecting only what's needed | Data minimization is required |
| No deletion mechanism | Automated full deletion | Users can request deletion |
| Logging without retention | Retention policy + enforcement | Logs become liability |
| Trusting vendors blindly | Data processing agreements | You're responsible for vendors |
| No audit trail | Log everything sensitive | Can't prove compliance without logs |

## Exit Criteria

- [ ] Data inventory documented (every field justified)
- [ ] User data export endpoint works
- [ ] Account deletion cascades completely
- [ ] Consent recorded with timestamps
- [ ] Audit logging on sensitive operations
- [ ] Retention policies defined and automated
- [ ] No payment card data stored (tokens only)
- [ ] Privacy policy reflects actual practices
- [ ] docs/COMPLIANCE.md created

**Done when:** A regulator could audit you tomorrow and you could prove—with logs and systems—that you're handling data correctly.
