# Compliance Milestones

## SOC 2 Observation Window

- Audit Logging Deployed: 2026-03-21 (code merged + Vercel production deploy)
- Datadog Log Drain Confirmed: 2026-03-24 (logs flowing, pipeline parsing confirmed)
- 90-Day Window Start: 2026-03-24
- 90-Day Window Ends: 2026-06-22
- SOC 2 Type I Earliest Engagement: 2026-06-22
- SOC 2 Type II Earliest Engagement: 2027-03-24

## Key Dates

- Phase 3 Code Deployed: 2026-03-21
- Datadog Log Drain Live: 2026-03-24
- Sentry + Slack Alerts Live: 2026-03-21
- First Paying Client: [DATE - fill when known]
- Penetration Test Completed: [DATE - fill in Phase 6]
- SOC 2 Type I Engaged: [DATE - fill in Phase 9]
- SOC 2 Type I Issued: [DATE - fill in Phase 9]

## Log Retention Infrastructure

| System | Retention | Purpose |
|---|---|---|
| Vercel Logs (native) | 1-3 days | Real-time debugging only |
| Datadog `audit-logs-soc2` index | 15 days (trial) → 365 days (Pro) | SOC 2 / CCPA audit trail |
| Datadog `vercel-general-7d` index | 7 days | Build, request, general logs |
| Sentry | 90 days (default plan) | Error monitoring + alerting |

## Phase Completion Dates

- Phase 0: 2026-03-20
- Phase 1: 2026-03-20
- Phase 2: 2026-03-21
- Phase 3: 2026-03-24 (SOC 2 clock started)
- Phase 4: 2026-03-25 (org scoping, plan gating, onboarding)

## Pending Actions

- [ ] Upgrade Datadog to Pro plan and set `audit-logs-soc2` retention to 365 days
- [ ] Capture first real production audit log evidence screenshot from Datadog
- [ ] Verify Sentry event capture in production after next deploy
