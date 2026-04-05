# Pipeline Punks -- Compliance Command System

**Owner:** True North Data Strategies LLC
**System:** Fleet-Compliance Sentinel + Pipeline Penny
**Objective:** SOC 2 Readiness with Future Government Path
**Mode:** Operational Compliance (Evidence-Driven)

---

## 1. Core Principle

> Documentation does not equal compliance.
> Evidence + System Behavior = Compliance.

This system converts:

- **Policies** into Controls
- **Controls** into Systems
- **Systems** into Evidence

---

## 2. System Architecture (Compliance View)

```
[User]
   |
[Clerk Auth Layer]
   |
[Vercel App + API]
   |
[Audit Logger --> Datadog]
   |
[Neon DB (Multi-tenant)]
   |
[Railway AI Backend (Penny)]
   |
[Resend / External Services]
```

---

## 3. Control Mapping

| Control Area     | Tool        | Responsibility         |
|------------------|-------------|------------------------|
| Identity         | Clerk       | Auth, sessions, RBAC   |
| App Layer        | Vercel      | API + frontend         |
| Database         | Neon        | Data storage           |
| Backend Services | Railway     | AI + processing        |
| Logging          | Datadog     | Audit logs             |
| Errors           | Sentry      | Exception tracking     |
| Monitoring       | UptimeRobot | Availability           |
| Email            | Resend      | System email           |
| Billing          | Stripe      | Subscription lifecycle |
| Code             | GitHub      | Change management      |

---

## 4. Data Classification

| Level                | Definition     | Allowed Systems             |
|----------------------|----------------|-----------------------------|
| Public               | Marketing, docs| Anywhere                    |
| Internal             | Ops data       | Vercel, DB                  |
| Sensitive            | User/org data  | Neon only                   |
| Restricted (Gov)     | Regulated      | Separate Gov stack ONLY     |

---

## 5. Hard Rules

1. No PII in logs (Sentry, Datadog)
2. No sensitive data transmitted via Resend
3. No raw database dumps in tickets or logs
4. No bypassing auth middleware
5. No direct database access without `org_id`

---

## 6. Evidence Command Center

| Control        | System      | Evidence       | Frequency  | Owner  |
|----------------|-------------|----------------|------------|--------|
| Access Control | Clerk       | User logs      | Weekly     | Admin  |
| Data Access    | Neon        | Query logs     | Weekly     | System |
| API Security   | Vercel      | Request logs   | Weekly     | System |
| Errors         | Sentry      | Error reports  | Daily      | System |
| Logging        | Datadog     | Audit logs     | Daily      | System |
| Uptime         | UptimeRobot | Status logs    | Daily      | System |
| Changes        | GitHub      | PR history     | Per change | Dev    |
| Billing        | Stripe      | Events         | Monthly    | Admin  |

---

## 7. Compliance Workflow (Auditor View)

### Daily (Automated + Quick Check)

**Pull:**

- Datadog logs
- Sentry errors
- UptimeRobot status

**Verify:**

- No error spikes
- No unauthorized access patterns
- Cron jobs executed

**Evidence Capture:**

- Datadog dashboard screenshot
- Sentry issues page screenshot
- Uptime status screenshot

---

### Weekly (Control Verification)

#### 7.1 Auth Review (Clerk)

- Export user list
- Verify org membership
- Remove unused users

**Evidence:** Screenshots of Clerk users, roles, and org mapping.

#### 7.2 Log Review (Datadog)

Check actions:

- `data.read`
- `data.write`
- `auth.*`
- `admin.action`

**Evidence:** Screenshots of log query results filtered by `org_id`.

#### 7.3 Error Review (Sentry)

Check for:

- New errors
- Repeated issues

**Evidence:** Screenshots of error dashboard and sanitized stack traces.

#### 7.4 Database Access Pattern (Neon)

Verify:

- All queries include `org_id`
- No anomalies detected

**Evidence:** Screenshots of query logs and table access records.

---

### Monthly (Audit Package Build)

**Evidence Collection:**

| System  | Evidence          |
|---------|-------------------|
| GitHub  | PR history        |
| Vercel  | Deployment logs   |
| Datadog | Audit logs        |
| Clerk   | Access logs       |
| Stripe  | Billing events    |

**Screenshot Checklist:**

- [ ] GitHub PR approvals
- [ ] Vercel deployment history
- [ ] Datadog audit logs
- [ ] Clerk user access
- [ ] Stripe events

---

## 8. API / System Evidence Mapping

| Endpoint                           | Evidence Type       |
|------------------------------------|---------------------|
| `/api/fleet-compliance/assets`     | `data.read` logs    |
| `/api/fleet-compliance/import/save`| `data.write` logs   |
| `/api/penny/query`                 | `penny.query` logs  |
| `/api/modules/run`                 | `admin.action` logs |

---

## 9. Logging Standard

The system implements structured audit logging:

```javascript
auditLog({
  action: 'data.read',
  userId,
  orgId,
  resourceType: 'assets',
})
```

**This is the SOC 2 backbone.**

Requirements:

- All API routes must log
- No sensitive metadata in log entries
- Include `org_id` on every log event

---

## 10. Security Control Checklist

Verify weekly:

- [ ] Auth required on all routes
- [ ] Admin routes restricted
- [ ] Rate limiting active
- [ ] Cron jobs protected by secret
- [ ] Stripe webhook signature verified
- [ ] No exposed environment variables

---

## 11. Change Management Workflow

```
Code Change
   |
GitHub Pull Request
   |
Review (CODEOWNERS)
   |
Merge to main
   |
Auto Deploy (Vercel)
   |
Log Evidence
```

**Evidence:** Screenshots of PR approval and deployment success.

---

## 12. Incident Response Workflow

**Triggers:**

- Error spike
- Downtime
- Security alert

**Steps:**

1. **Identify** -- Sentry / Datadog
2. **Contain** -- Disable route if needed
3. **Fix** -- Deploy patch
4. **Log** -- Record incident
5. **Document** -- Capture evidence

**Evidence:** Screenshots of error logs, fix commit, and resolution.

---

## 13. Email System Compliance (Resend)

**Allowed:**

- Notifications
- Alerts
- System emails

**Not Allowed:**

- Sensitive PII
- Full records
- Database exports

---

## 14. AI (Penny) Compliance Rules

Enforced controls:

- No PII in context
- 8KB context limit
- Anonymized data only
- OWASP LLM controls applied

**Auditor Evidence:**

- Prompt rules documentation
- Redaction logic
- Sample query logs

---

## 15. Future Government Path (FedRAMP Prep)

**Do Now:**

- Keep data isolated
- Do not mix regulated data with commercial data
- Abstract backend services for portability

**Future Architecture:**

```
Commercial Stack (Current)        Gov Stack (Future)
--------------------------        ------------------
Vercel / Clerk / Neon             GCP Gov / Separate Auth / Separate DB
```

---

## 16. Evidence Storage Structure

```
/compliance/
  /monthly/
  /weekly/
  /incidents/
  /access-control/
  /logging/
```

---

## 17. Auditor Readiness

Be prepared to answer:

1. Who has access?
2. How is access controlled?
3. Show logs of activity.
4. Show change history.
5. Show incident handling procedures.
6. Show data protection measures.

This document provides all answers.

---

## 18. Final Command Principle

> You are not "preparing for SOC 2."
> You are running your company as if it is already under audit.
