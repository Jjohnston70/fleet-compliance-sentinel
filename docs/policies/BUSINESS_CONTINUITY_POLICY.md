# Business Continuity Policy

Version: 1.0  
Effective Date: 2026-03-25  
Last Reviewed: 2026-03-25  
Owner: Jacob Johnston, True North Data Strategies LLC  
Next Review: 2027-03-25

## Purpose

This policy defines continuity and recovery expectations for Fleet-Compliance services.

## Recovery Targets

- RTO (Recovery Time Objective): 4 hours for P1 incidents
- RPO (Recovery Point Objective): 24 hours, based on daily Neon backup posture

## Critical Systems

1. Vercel-hosted Next.js application and APIs
2. Neon Postgres data store
3. Clerk authentication and organization access
4. Railway FastAPI backend for Penny
5. Alerting and monitoring stack (Sentry, Datadog, uptime monitoring)

## Continuity Requirements

- Maintain incident runbooks and escalation coverage.
- Keep deployment rollback path ready.
- Maintain monitoring for critical endpoints.
- Validate restoration procedures during incidents and post-incident reviews.

## Backup and Recovery

- Primary database continuity depends on Neon backup and recovery capabilities.
- Application continuity depends on Vercel deployment rollback and service redeploy procedures.
- Authentication continuity depends on Clerk service availability and org access controls.

## Incident Operations

Operational response steps are maintained in `RUNBOOK.md` and `INCIDENT_RESPONSE_PLAN.md`.

## Testing and Review

- Continuity procedures are reviewed annually.
- Material incidents trigger immediate review and control updates.
- Gaps are tracked with owners and due dates until closed.
