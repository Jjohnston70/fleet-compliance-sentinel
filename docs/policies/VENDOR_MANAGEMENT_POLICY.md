# Vendor Management Policy

Version: 1.0  
Effective Date: 2026-03-25  
Last Reviewed: 2026-03-25  
Owner: Jacob Johnston, True North Data Strategies LLC  
Next Review: 2027-03-25

## Purpose

This policy defines how True North Data Strategies LLC selects, approves, and reviews third-party vendors and subprocessors.

## Source Registry

Current subprocessors and data flows are listed in `SUBPROCESSORS.md`.

## Vendor Selection Criteria

Preferred criteria:

1. SOC 2 Type II certification
2. Clear security documentation and incident process
3. Strong access control and encryption controls
4. Contract terms that support privacy and deletion obligations

When a vendor does not meet preferred criteria, compensating controls must be documented before approval.

## Risk Review

Each vendor is reviewed for:

- Data touched
- Security certification status
- Incident history and known risks
- Operational dependency criticality

## Annual Vendor Review

- Full vendor and subprocessor review is required at least annually.
- Review confirms registry accuracy, cert status, and compensating controls.
- Findings are documented with action owners and target dates.

## High-Risk Vendor Controls

For vendors without SOC 2 evidence:

- Minimize transmitted data
- Restrict payload fields to required values only
- Monitor integration behavior and errors
- Rotate credentials on schedule

## Offboarding Vendors

When removing a vendor:

1. Revoke credentials and API keys.
2. Remove integrations from production config.
3. Confirm data retention and deletion obligations are closed.
4. Update `SUBPROCESSORS.md`.
