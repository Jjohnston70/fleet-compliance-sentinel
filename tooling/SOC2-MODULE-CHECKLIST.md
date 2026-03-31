# SOC 2 Compliance Checklist for New Modules

**Use this checklist for every module integrated into the Sentinel platform.**
Phase 1 (standalone Python modules in tooling/) does NOT require this — only applies when code ships to production (Vercel/Railway).

---

## Pre-Development

- [ ] Create feature branch (`git checkout -b feature/{name}`)
- [ ] Confirm no direct pushes to main (branch protection active)

## During Development

### API Routes
- [ ] Every new API route calls `recordOrgAuditEvent()` with appropriate event type
- [ ] Every new API route enforces org isolation via `requireFleetComplianceOrg()`
- [ ] All database queries use parameterized SQL (Neon template literals)
- [ ] PII fields scrubbed from audit metadata (8 deny-list: name, driverName, email, ssn, dob, medicalCard, licenseNumber, address)
- [ ] Input validated against schema (Zod or collection validators)

### Data Access
- [ ] All queries filter by `org_id` (multi-tenant isolation)
- [ ] No raw SQL string concatenation (injection prevention)
- [ ] New tables include `org_id` column where data is org-specific
- [ ] Sensitive data encrypted at rest if applicable (pgcrypto AES-256)

### External APIs (if applicable)
- [ ] New vendor added to `soc2-evidence/vendor-management/SUBPROCESSORS.md`
- [ ] SOC 2 status documented (Type I, Type II, None)
- [ ] If no SOC 2: compensating controls documented
- [ ] API keys stored in Vercel environment variables (never in code)
- [ ] API key added to `.env.example` with description
- [ ] API key added to secret rotation schedule in `docs/ROTATION_RUNBOOK.md`

### Security
- [ ] No secrets hardcoded in source code
- [ ] CSP updated in `vercel.json` if new external domains
- [ ] Rate limiting applied if user-facing endpoint
- [ ] Error handling does not leak internal state to client

## Pre-Merge

- [ ] `npm audit` shows 0 vulnerabilities
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] `npm run compliance:legal-check` passes (if touching privacy/terms)
- [ ] `npm run compliance:ops-check` reviewed
- [ ] PR description documents what changed and why
- [ ] CODEOWNERS auto-assigned reviewer

## Post-Merge

- [ ] Verify deployment succeeded on Vercel
- [ ] Spot-check audit events appearing in Datadog (`audit-logs-soc2` index)
- [ ] Update `PLATFORM_OVERVIEW.md` Section 2 with new capability
- [ ] Update `soc2-evidence/monitoring/audit-logger-code.md` with new instrumented routes
- [ ] If new cron job: add to `vercel.json` and document in monitoring

## New Vendor Quick-Add Template

When adding a new external service (EIA API, Yahoo Finance, OpenWeatherMap, etc.):

```markdown
### {Vendor Name}
- **Service:** {what it provides}
- **SOC 2 Status:** {Type I / Type II / None / Not verified}
- **Data Processed:** {what data flows to/from this vendor}
- **Risk Level:** {Low / Medium / High}
- **Compensating Controls:**
  1. HTTPS/TLS enforced
  2. API key stored in Vercel env vars
  3. Data minimization (only fetch required fields)
  4. No PII transmitted
  5. Request/response audit-logged
```

## New Audit Event Template

When adding audit events to new API routes:

```typescript
import { recordOrgAuditEvent } from '@/lib/org-audit';

// In your API route handler:
await recordOrgAuditEvent({
  orgId: org.id,
  eventType: 'petroleum.prices.synced',  // module.resource.action pattern
  actorUserId: userId || null,
  actorType: 'user',  // or 'system' for cron, 'stripe' for webhooks
  metadata: {
    productsUpdated: ['heating_oil', 'crude', 'diesel'],
    recordCount: 150,
    source: 'eia_api',
    // NEVER include: name, email, ssn, dob, etc.
  }
});
```

### Recommended Event Types for Petroleum Module

```
petroleum.data.synced          - EIA/yfinance data pull completed
petroleum.forecast.generated   - ML forecast pipeline ran
petroleum.alert.triggered      - Price/spread alert fired
petroleum.alert.resolved       - Alert condition cleared
petroleum.csv.uploaded         - User uploaded OPIS/inventory CSV
petroleum.report.generated     - Executive report created
petroleum.module.enabled       - Org enabled petroleum module
petroleum.module.disabled      - Org disabled petroleum module
```
