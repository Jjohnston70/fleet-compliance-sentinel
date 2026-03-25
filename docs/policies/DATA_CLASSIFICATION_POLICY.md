# Data Classification Policy

Version: 1.0  
Effective Date: 2026-03-25  
Last Reviewed: 2026-03-25  
Owner: Jacob Johnston, True North Data Strategies LLC  
Next Review: 2027-03-25

## Purpose

This policy defines data classification levels and handling requirements for Fleet-Compliance data.

## Data Types in Scope

- Driver PII (names, contact data, identifiers)
- Medical compliance information
- License and permit records
- Vehicle and fleet asset records
- Operational invoices and maintenance records

## Classification Levels

### Public

Definition: Information approved for public release.

Handling:

- Can be shared publicly
- No special storage restrictions beyond integrity controls

### Internal

Definition: Non-public operational information with low impact if disclosed.

Handling:

- Restricted to authorized staff and client users
- Stored in approved business systems only

### Confidential

Definition: Client business data and standard personal data.

Handling:

- Access limited by role and org scope
- Encryption in transit required
- Logging and audit controls required for sensitive operations

### Restricted

Definition: Highly sensitive regulated data, including driver medical and license-compliance data.

Handling:

- Strict least-privilege access
- Org isolation required on every read/write path
- Enhanced incident response and breach notification requirements
- No sharing outside approved subprocessors

## Retention Periods

- Active customer data: retained while service is active.
- Canceled customer data: soft delete at 30 days, hard delete at 60 days, per `CLIENT_OFFBOARDING.md`.
- Incident and operational records: retained per legal and audit requirements.

## Disposal Requirements

- Soft delete marks records unavailable in product views.
- Hard delete permanently removes org-scoped data from operational tables.
- Deletion actions are logged with operator and timestamp evidence.
