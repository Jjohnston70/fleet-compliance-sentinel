# Access Control Policy

Version: 1.0  
Effective Date: 2026-03-25  
Last Reviewed: 2026-03-25  
Owner: Jacob Johnston, True North Data Strategies LLC  
Next Review: 2027-03-25

## Purpose

This policy defines who can access Fleet-Compliance systems and how that access is granted, reviewed, and removed.

## Least Privilege

- Users receive the minimum permissions required for their role.
- Admin privileges are limited to organization administrators and internal operators who need admin tasks.
- Privilege increases require explicit approval.

## Identity and Provisioning

We use Clerk for authentication and organization-scoped user management.

- Access is tied to Clerk user and organization membership.
- Organization context is required for protected Fleet-Compliance routes.
- Role checks are enforced in API route authentication helpers.

Reference implementation: `src/lib/fleet-compliance-auth.ts`.

## Organization Isolation

- Every protected data operation is scoped by `org_id`.
- Cross-organization data access is blocked by design.
- Canceled organizations are blocked at auth and plan-gate checks.

References:

- `src/lib/fleet-compliance-auth.ts`
- `src/lib/plan-gate.ts`

## MFA Requirements

- MFA is required for all admin users in Clerk.
- Admin users without MFA must not be granted production admin access.
- MFA configuration is verified during quarterly access reviews.

## Access Reviews

- Access reviews occur quarterly at minimum.
- Review includes admin memberships, inactive users, and orphaned access.
- Findings are logged with action owners and due dates.

## Offboarding

When a user or client is offboarded:

1. Remove organization access in Clerk.
2. Revoke active sessions where possible.
3. Confirm API access is blocked.
4. Execute data lifecycle controls per `CLIENT_OFFBOARDING.md`.

## Exceptions

Exceptions require documented approval by the Security Officer and a time-bound expiration.
