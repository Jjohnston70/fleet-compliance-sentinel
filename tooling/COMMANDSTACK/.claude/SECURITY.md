# SECURITY.md — Fleet Compliance Sentinel

**Classification:** Internal — Non-Negotiable Rules
**Owner:** Jacob Johnston, True North Data Strategies LLC
**SOC 2 Observation Window:** March 2026 — June 2026 (Type I target)
**Last Updated:** 2026-04-04

---

## Core Principle

> Documentation does not equal compliance.
> Evidence + System Behavior = Compliance.

This system converts: Policies → Controls → Systems → Evidence.

Treat every day of the observation window as if an auditor is watching. Because eventually, one will be.

---

## Data Classification

| Level | Definition | Allowed Systems |
|-------|-----------|-----------------|
| Public | Marketing, docs, help content | Anywhere |
| Internal | Ops data, metrics, logs | Vercel, Railway, Datadog |
| Sensitive | User data, org data, driver records | Neon Postgres ONLY |
| Restricted | Regulated data (future gov path) | Separate gov stack ONLY — do not mix |

---

## Hard Rules — Never Violate

### Logging
1. **No PII in logs.** User names, driver IDs, DOT numbers, phone numbers, addresses — none of it goes into Sentry, Datadog, console.log, or any log sink. Log IDs only.
2. **No sensitive data in Resend emails.** Notifications and alerts only. No full records, no database exports.
3. **No raw database dumps in tickets, PRs, or chat logs.**

### Authentication & Authorization
4. **No auth bypass.** Auth middleware is required on every API route. No exceptions, no "temp" bypasses.
5. **No direct database access without `org_id`.** Every query must be scoped to a tenant. Single-tenant leaks are a SOC 2 finding.
6. **Admin routes are restricted.** Admin functionality is not exposed to standard user roles.

### Secrets & Credentials
7. **No credentials in code.** No API keys, service account JSON, OAuth tokens, or database URLs in source files, comments, or test fixtures.
8. **No `.env` files committed.** Use `.env.example` with placeholder values only.
9. **All secrets via environment variables.** Vercel environment config for frontend. Railway environment config for backend. Never hardcoded.

### AI / Penny Specific
10. **No PII in Penny's context window.** Anonymize all data before sending to the LLM. Driver names, org names, personal details — strip them.
11. **8KB context limit enforced.** Do not allow unbounded context injection.
12. **Citation validation required.** Penny's CFR citations must be validated against the vector store before display. Do not trust LLM output without ground-truth check.
13. **OWASP LLM Top 10 controls applied.** Prompt injection, insecure output handling, training data poisoning — these are active threats in a regulatory AI system.

---

## Multi-Tenant Isolation

This is a SOC 2 critical control. Every data access path must enforce tenant boundaries.

```javascript
// REQUIRED pattern — every query
const assets = await db
  .select()
  .from(fleetAssets)
  .where(eq(fleetAssets.orgId, orgId)); // org_id is NON-NEGOTIABLE

// VIOLATION — no tenant scope
const assets = await db.select().from(fleetAssets); // NEVER do this
```

If you find a query missing `org_id`, flag it immediately. Do not work around it.

---

## Audit Logging Standard

Every API route must emit a structured audit log. This is the SOC 2 backbone.

```javascript
// Required on every API action
auditLog({
  action: 'data.read',    // or data.write, auth.login, admin.action, penny.query
  userId,                  // internal user ID (not name)
  orgId,                   // tenant ID
  resourceType: 'assets',  // what was accessed
  // NO sensitive metadata here
});
```

**Action categories:**
- `data.read` — any read from Neon
- `data.write` — any create/update/delete in Neon
- `auth.*` — login, logout, session events
- `admin.action` — any admin-level operation
- `penny.query` — RAG queries to the AI backend

---

## API Security Checklist

Verify on every PR that touches API routes:

- [ ] Auth middleware present and active
- [ ] Admin routes restricted by role
- [ ] Rate limiting active on public endpoints
- [ ] Cron jobs protected by secret header (`x-cron-secret`)
- [ ] Stripe webhooks verify signature before processing
- [ ] No environment variables exposed to client bundle
- [ ] Input validation on all user-supplied parameters

---

## Change Management

All changes follow this path — no exceptions:

```
Code Change
    |
GitHub Pull Request (branch → main)
    |
Review (CODEOWNERS enforcement)
    |
Merge to main
    |
Auto Deploy (Vercel / Railway)
    |
Audit Log Evidence captured
```

**Evidence required:** PR approval screenshot + deployment success screenshot, stored in `/compliance/weekly/`.

---

## Evidence Collection Schedule

### Daily (Automated)
- Pull Datadog audit logs
- Review Sentry error dashboard
- Check UptimeRobot status
- Screenshot each for evidence archive

### Weekly (Manual)
- Clerk: Export user list, verify org membership, remove unused users
- Datadog: Review `data.read`, `data.write`, `auth.*`, `admin.action` events filtered by `org_id`
- Sentry: Review new and repeated errors — confirm no PII in stack traces
- Neon: Verify all queries include `org_id`, check for access anomalies
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
| Railway | Backend deployment history |

---

## Incident Response

**Triggers:** Error spike, downtime, security alert, unauthorized access pattern

**Steps:**
1. Identify — Sentry / Datadog
2. Contain — disable route if needed (can deploy a kill switch to Vercel instantly)
3. Fix — deploy patch via standard PR process
4. Log — record incident in `/compliance/incidents/YYYY-MM-DD-incident.md`
5. Document — capture evidence: error logs, fix commit, resolution confirmation

---

## Future Government Path

**Do now (keeps options open):**
- Keep data isolated — no mixing regulated data with commercial
- Abstract backend services for portability
- Maintain clean audit trails from day one

**Future architecture when needed:**
```
Commercial Stack (Current)        Gov Stack (Future)
--------------------------        ------------------
Vercel / Clerk / Neon             GCP Gov / Separate Auth / Separate DB
Railway FastAPI                   GCP Cloud Run (FedRAMP boundary)
```

Do not commingle these stacks. Once you mix, separation is expensive.

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

> You are not "preparing for SOC 2."
> You are running the company as if it is already under audit.

Jacob Johnston | True North Data Strategies LLC | jacob@truenorthstrategyops.com
