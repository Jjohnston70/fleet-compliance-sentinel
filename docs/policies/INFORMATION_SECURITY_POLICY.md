# Information Security Policy

Version: 1.0  
Effective Date: 2026-03-25  
Last Reviewed: 2026-03-25  
Owner: Jacob Johnston, True North Data Strategies LLC  
Next Review: 2027-03-25

## Purpose

This policy defines how True North Data Strategies LLC protects Fleet-Compliance and Pipeline Penny systems and data.

## Scope

This policy applies to:

- All production and development systems used for Fleet-Compliance
- All company-managed devices and accounts with access to customer data
- All staff and contractors with access to internal systems
- All regulated data processed by the platform, including DOT driver records, CDL and medical compliance data, fleet assets, permits, and invoices

Current stack in scope:

- Next.js on Vercel
- Neon Postgres
- Clerk authentication and organization management
- Railway FastAPI backend for Penny
- Anthropic and other configured LLM providers

## Security Objectives

1. Keep customer data confidential.
2. Keep data accurate and protected from unauthorized changes.
3. Keep critical services available for customer operations.
4. Detect and respond to security incidents quickly.
5. Meet legal and contractual obligations for regulated fleet-compliance data.

## Security Controls

We enforce these baseline controls:

- Authentication and role-based access control for protected routes
- Organization-level data isolation for API and database access
- Encryption in transit (HTTPS/TLS)
- Secret management through deployment platform environment variables
- Audit logging for sensitive operations
- Dependency vulnerability monitoring and remediation
- Incident response procedures and evidence retention

## Roles and Responsibilities

### Security Officer

Jacob Johnston serves as Security Officer and is responsible for:

- Approving security policies and annual updates
- Reviewing incidents and remediation plans
- Approving high-risk vendor decisions
- Verifying access control and offboarding execution

### Engineering Responsibilities

- Build and maintain controls that enforce this policy
- Keep dependencies and infrastructure configurations current
- Document operational changes and security-relevant decisions

## Exceptions

Any exception to this policy must be documented, approved by the Security Officer, and assigned an expiration date.

## Review Frequency

This policy is reviewed at least annually or sooner if major system, legal, or threat changes occur.
