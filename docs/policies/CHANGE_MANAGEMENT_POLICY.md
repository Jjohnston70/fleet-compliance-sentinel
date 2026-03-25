# Change Management Policy

Version: 1.0  
Effective Date: 2026-03-25  
Last Reviewed: 2026-03-25  
Owner: Jacob Johnston, True North Data Strategies LLC  
Next Review: 2027-03-25

## Purpose

This policy defines how code and configuration changes are proposed, reviewed, deployed, and rolled back.

## Required Change Workflow

- All production changes are made through GitHub pull requests.
- Every pull request requires review before merge.
- Direct pushes to `main` are not allowed.
- Changes must include clear scope, risk notes, and test evidence.

## Branch Protection

`main` branch protection must enforce:

- Pull-request-only merges
- At least one reviewer approval
- Required checks before merge
- No force pushes

## Deployment Process

1. Developer opens pull request.
2. Reviewer approves after code and risk review.
3. Pull request merges to `main`.
4. GitHub triggers Vercel deployment automatically.
5. Team verifies production health checks.

## Emergency Changes

Emergency production fixes are allowed only when service impact requires immediate action.

- Emergency changes still require a pull request.
- Post-change review must be completed within one business day.

## Rollback Procedure

- Use the latest known-good Vercel deployment rollback path.
- Verify critical endpoints after rollback.
- Document rollback reason and outcome in incident/change records.

Reference: `RUNBOOK.md`.

## Documentation Requirements

Each change record must include:

- What changed
- Why it changed
- Who approved it
- Verification results
- Rollback decision if applicable
