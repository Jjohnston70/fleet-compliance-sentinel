# Incident Response Plan

Owner: Security and Operations Team
Last Updated: 2026-03-25
Scope: Fleet-Compliance web app, Fleet-Compliance APIs, Penny AI backend, and supporting infrastructure.

## Escalation Chain

1. Incident Commander (primary on-call)
2. Engineering Lead (secondary)
3. Security and Compliance Lead (tertiary)
4. Executive Stakeholder (customer-impacting P1 only)

Contact methods are maintained in the internal on-call roster and are not stored in repository templates.

## Severity Levels

### P1 Critical
Definition: Platform down, confirmed or suspected data breach, or authentication failure affecting many users.

- Detection: Uptime monitor alert, Sentry spike, failed auth checks, or confirmed security signal.
- First response time: 15 minutes.
- Investigation steps:
  1. Confirm scope and business impact.
  2. Identify affected services, organizations, and start time.
  3. Assign Incident Commander and open an incident ticket.
- Resolution steps:
  1. Contain first (disable endpoint, isolate organization, revoke compromised keys/sessions).
  2. Roll back or patch.
  3. Validate service restoration and security state.
- Client communication: Initial notice within 60 minutes and hourly updates until resolved.
- Post-incident review: Required within 7 days with timeline, root cause, corrective action, and owners.

### P2 High
Definition: Fleet-Compliance pages failing, Penny down, or import pipeline broken.

- Detection: Synthetic checks, API error alerts, support reports.
- First response time: 30 minutes.
- Investigation steps:
  1. Reproduce safely.
  2. Review recent deploys, logs, dependency changes.
  3. Scope impacted orgs and features.
- Resolution steps:
  1. Roll back or patch failing routes.
  2. Validate sign-in, core reads/writes, imports, and Penny query path.
  3. Confirm alerts return to baseline.
- Client communication: Initial notice within 2 hours if customer-impacting. Update every 2 hours.
- Post-incident review: Required if impact exceeds 30 minutes.

### P3 Medium
Definition: Cron not running, single feature broken, or degraded behavior without full outage.

- Detection: Cron health failures, QA checks, support tickets.
- First response time: 4 hours.
- Investigation steps:
  1. Confirm failing job or route.
  2. Review logs and org impact.
  3. Confirm last known good run.
- Resolution steps:
  1. Restart job, retry task, or patch isolated bug.
  2. Validate workflow end-to-end.
  3. Add regression guard if missing.
- Client communication: Notify only directly impacted customers.
- Post-incident review: Capture in weekly ops review.

### P4 Low
Definition: UI defects, cosmetic regressions, or low-impact usability issues.

- Detection: Internal testing and user feedback.
- First response time: 1 business day.
- Investigation steps:
  1. Confirm expected vs actual behavior.
  2. Scope browser/device conditions.
  3. Assign owner and priority.
- Resolution steps:
  1. Fix in normal sprint cycle.
  2. Validate in staging.
  3. Deploy in scheduled release.
- Client communication: On request or when directly impacted.
- Post-incident review: Not required.

## Data Breach Procedure

1. Detect and contain.
   - Open a P1 incident.
   - Isolate affected organization immediately.
2. Assess scope.
   - Identify affected records, affected organizations, and time window.
3. Notify required parties.
   - Notify affected clients within 72 hours.
   - Assess GDPR Article 33 threshold and notify the relevant supervisory authority within 72 hours when required.
4. Document all actions and evidence in `SECURITY_REPORTS/incidents/`.
5. Complete post-breach review within 7 days.

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
- Incident Commander (on-call)
- security@pipelinepunks.com

We will continue to provide updates until the incident is fully resolved.

### Status Page Update Template

Title: [P1/P2] [Incident Name]
Status: Investigating | Identified | Monitoring | Resolved
Time (UTC): [YYYY-MM-DD HH:MM]

Message:
We are [investigating/mitigating] an incident affecting [service/feature].
Impact: [who is affected]
Current mitigation: [what has been done]
Next update: [time]
