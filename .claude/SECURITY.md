# SECURITY.md — Fleet-Compliance Sentinel

**Classification:** Internal — Non-Negotiable Rules
**Owner:** Jacob Johnston, True North Data Strategies
**Compliance Target:** SOC 2 Type I (eligible June 22, 2026) + DOT/FMCSA regulatory compliance
**Last Updated:** 2026-04-06

---

## Core Principle

> Documentation does not equal compliance.
> Evidence + System Behavior = Compliance.

This system converts: Policies -> Controls -> Systems -> Evidence.

FCS handles DOT/FMCSA compliance data for fleet operators. All data is treated as regulated by default. SOC 2 observation window is active (started March 24, 2026). Every code change, data access, and system event must produce auditable evidence.

---

## Data Classification

| Level | Definition | Allowed Systems |
|-------|-----------|-----------------|
| Public | Marketing, docs, help content | Anywhere |
| Internal | Ops data, metrics, logs, module configs | Vercel, Neon, Railway, Sentry, Datadog |
| Sensitive | User data, org data, employee PII, compliance records, training scores | Neon PostgreSQL (org_id scoped) ONLY |
| Restricted | CDL numbers, medical card data, SSNs, financial credentials | Separate stack ONLY — do not mix |

---

## Hard Rules — Never Violate

### Logging
1. **No PII in logs.** Names, emails, CDL numbers, medical card numbers, SSNs, phone numbers — none of it goes into Sentry, Datadog, console.log, or any log sink. Log IDs only.
2. **No sensitive data in Resend emails.** Notifications and alerts only. No full records, no exports.
3. **No raw database dumps in tickets, PRs, or chat logs.**

### Authentication & Authorization
4. **No auth bypass.** Auth middleware (`requireFleetComplianceOrg`) is required on every API route. No exceptions, no "temp" bypasses.
5. **No direct database access without `org_id`.** Every query must be scoped to a tenant.
6. **Admin routes are restricted.** Admin functionality is not exposed to standard member roles.

### Secrets & Credentials
7. **No credentials in code.** No API keys, tokens, or connection strings in source files, comments, or test fixtures.
8. **No `.env` files committed.** Use `.env.example` with placeholder values only.
9. **All secrets via environment variables.** Vercel project settings for production, `.env.local` for development. Never hardcode.

### AI-Specific Rules
10. **No identifiable data sent to external LLMs without anonymization or explicit approval.** Penny queries must strip PII before sending to Railway/Anthropic/OpenAI/Gemini.
11. **No raw employee data in Penny context.** Use aggregate counts, status summaries, and IDs only.
12. **Flag FedRAMP, NIST 800-53, FISMA considerations for any government work.**

---

## Tenant Isolation

This is a critical control. Every data access path must enforce tenant boundaries.

```typescript
// REQUIRED pattern — every query
const rows = await sql`
  SELECT * FROM employees
  WHERE org_id = ${orgId} AND id = ${employeeId}
`;

// VIOLATION — no tenant scope
const rows = await sql`
  SELECT * FROM employees WHERE id = ${employeeId}
`;
```

If you find a query missing `org_id`, flag it immediately.

---

## Audit Logging Standard

Every API route must emit a structured audit log.

```typescript
// Required on every API action
auditLog({
  action: 'data.read',
  userId,
  orgId,
  resourceType: 'fleet-compliance.employees',
  metadata: {
    employeeId,
    operation: 'list',
  },
});

await recordOrgAuditEvent({
  orgId,
  eventType: 'employee.profile.created',
  actorUserId: userId,
  actorType: 'user',
  metadata: { employeeProfileId },
});
```

**Action categories:**
- `data.read` — any query that returns org data
- `data.write` — any insert, update, or delete
- `auth.success` / `auth.failure` — authentication events
- `admin.action` — admin-only operations (module toggles, imports, settings)
- `compliance.check` — automated compliance verification runs
- `billing.event` — Stripe checkout, plan changes, webhook processing

---

## API Security Checklist

Verify on every PR that touches API routes:

- [ ] Auth middleware present and active (`requireFleetComplianceOrg`)
- [ ] Admin routes restricted by role (`resolveFleetComplianceRole` check)
- [ ] Rate limiting active on public endpoints (Upstash)
- [ ] Cron routes use `FLEET_COMPLIANCE_CRON_SECRET` bearer token, not Clerk
- [ ] Webhook routes validate signatures (Stripe `constructEvent`)
- [ ] No environment variables exposed to client bundle (only `NEXT_PUBLIC_*`)
- [ ] Input validation on all user-supplied parameters (Zod or manual)

---

## Change Management

All changes follow this path — no exceptions:

```
Code Change
    |
GitHub Pull Request (branch -> main)
    |
Review (CODEOWNERS enforcement)
    |
Merge to main
    |
Auto Deploy (Vercel)
    |
Audit Log Evidence captured
```

---

## Evidence Collection Schedule

### Daily (Automated)
- Pull Datadog audit logs
- Review Sentry error dashboard
- Check UptimeRobot status
- Screenshot each for evidence archive

### Weekly (Manual)
- Clerk: Export user list, verify membership, remove unused users
- Datadog: Review data access events filtered by `org_id`
- Sentry: Review new and repeated errors — confirm no PII in stack traces
- Database: Verify all queries include `org_id`
- API Security Checklist above — run it

### Monthly (Audit Package)
Collect and store in `/compliance/monthly/YYYY-MM/`:

| System | Evidence |
|--------|---------|
| GitHub | PR approval history |
| Vercel | Deployment logs |
| Datadog | Audit log export |
| Clerk | Access log screenshots |
| Stripe | Billing event log |

---

## Incident Response

**Triggers:** Error spike, downtime, security alert, unauthorized access pattern

**Steps:**
1. Identify — Sentry / Datadog
2. Contain — disable affected route or service
3. Fix — deploy patch via standard PR process
4. Log — record incident in `/compliance/incidents/YYYY-MM-DD-incident.md`
5. Document — capture evidence: error logs, fix commit, resolution confirmation

---

## Evidence Storage Structure

```
/compliance/
  /monthly/
    /YYYY-MM/
  /weekly/
    /YYYY-WXX/
  /incidents/
  /access-control/
  /logging/
```

---

## Auditor Readiness — Answer These Cold

1. Who has access to the system?
2. How is access controlled and revoked?
3. Show me logs of data access activity.
4. Show me your change history and approval process.
5. How do you handle incidents?
6. How do you protect user data?

This document plus the evidence archive answers all six.

---

## Final Command

> You are not "preparing for SOC 2 Type I."
> You are running the company as if it is already under audit.

Jacob Johnston | True North Data Strategies | jacob@truenorthstrategyops.com
