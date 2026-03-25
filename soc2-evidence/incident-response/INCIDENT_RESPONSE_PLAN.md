# Incident Response Plan

Owner: Jacob
Last Updated: 2026-03-25
Scope: Fleet-Compliance web app, Fleet-Compliance APIs, Penny AI backend, supporting infrastructure.

## Severity Levels

### P1 Critical
Definition: Platform down, data breach, or authentication failure affecting many users.

- Detection: Uptime monitor alert, Sentry spike, failed auth flow checks, or confirmed breach signal.
- First response time: 15 minutes.
- Investigation steps:
  1. Confirm incident scope and active impact.
  2. Identify impacted services, organizations, and start time.
  3. Assign incident lead and open incident record.
- Resolution steps:
  1. Contain first (disable affected endpoint, isolate org, revoke compromised key/session).
  2. Apply rollback, hotfix, or failover.
  3. Verify service and security state before full restore.
- Client communication: Initial notice within 60 minutes. Continue updates every 60 minutes until resolved.
- Post-incident review: Required within 7 days. Include timeline, root cause, controls, and owner actions.

### P2 High
Definition: Fleet-Compliance pages failing, Penny down, or import pipeline broken.

- Detection: Synthetic checks, API error alerts, customer reports, and support tickets.
- First response time: 30 minutes.
- Investigation steps:
  1. Reproduce issue in production-safe mode.
  2. Check recent deploys, logs, and dependency changes.
  3. Confirm impact scope by org and feature.
- Resolution steps:
  1. Roll back the bad deploy or patch the failing route.
  2. Validate key flows: sign-in, data access, imports, Penny query path.
  3. Confirm monitoring returns to baseline.
- Client communication: Initial notice within 2 hours for customer-impacting outages. Provide updates every 2 hours.
- Post-incident review: Required within 7 days if customer impact exceeded 30 minutes.

### P3 Medium
Definition: Cron not running, single feature broken, or degraded behavior without full outage.

- Detection: Cron health endpoint failures, internal QA checks, or non-urgent support reports.
- First response time: 4 hours.
- Investigation steps:
  1. Confirm exact failing job/feature.
  2. Review logs and affected org context.
  3. Identify last known good run or deploy.
- Resolution steps:
  1. Restart job, retry task, or patch isolated bug.
  2. Validate impacted workflow end-to-end.
  3. Add regression check if missing.
- Client communication: Notify only impacted clients when behavior affects contractual workflows.
- Post-incident review: Lightweight review in weekly ops review.

### P4 Low
Definition: UI issues, minor errors, cosmetic defects, or small usability regressions.

- Detection: Internal testing, backlog grooming, user feedback.
- First response time: 1 business day.
- Investigation steps:
  1. Confirm expected vs. actual behavior.
  2. Check whether issue is browser, locale, or device specific.
  3. Assign priority and owner.
- Resolution steps:
  1. Fix in normal sprint cycle.
  2. Validate in staging.
  3. Deploy in next scheduled release.
- Client communication: No broad communication required unless directly requested.
- Post-incident review: Not required; track in product backlog.

## Data Breach Procedure

1. Detect and contain
   - Trigger incident as P1.
   - Isolate affected org immediately (disable org access and revoke active sessions/keys).
2. Assess scope
   - Determine which records were exposed.
   - Determine which org(s) were affected.
   - Determine precise time window.
3. Notify affected clients within 72 hours (GDPR/CCPA requirement).
4. Contact Jacob immediately: 555-555-5555.
5. Document all actions and evidence in `SECURITY_REPORTS/incidents/`.
6. Complete post-breach review within 7 days.

## Communication Templates

### Client Notification Email (P1 Incident)

Subject: Fleet-Compliance Security Incident Notification - [DATE]

Hello [Client Name],

We are notifying you of a P1 incident affecting Fleet-Compliance.

What happened:
- [Short description]

What data may be affected:
- [Records/types]

When it occurred:
- [Start time] to [End time or ongoing]

What we have done:
- [Containment and remediation actions]

What you should do now:
- [Required client actions, if any]

Next update:
- [Time]

Primary contact:
- Jacob, 555-555-5555

We will continue to provide updates until the incident is fully resolved.

### Status Page Update Template

Title: [P1/P2] [Incident Name]
Status: Investigating | Identified | Monitoring | Resolved
Time (UTC): [YYYY-MM-DD HH:MM]

Message:
We are currently [investigating/working to resolve] an incident affecting [service/feature].
Impact: [who is affected]
Current mitigation: [what has been done]
Next update: [time]